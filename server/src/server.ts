// Externals
import http from 'http'
import { Server, Socket } from "socket.io"
import type { ServerParams } from './params.js'

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url';

// Services
import hub from './services/ServiceHub.js'
import bus from './services/bus.js'

// Just for debug, later remove
import PlayerService from './services/PlayerService.js'
import LobbyService from './services/LobbyService.js'
import SocketService from './services/SocketService.js'

// Event types
import type { ServerToClientEvents, ClientToServerEvents } from '@red/shared/types/Events'

// Re-create __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROD_CLIENT_PATH = path.join(__dirname, '../../client/dist');

/* Handles http requests */
const httpHandler = (request: http.IncomingMessage, response: http.ServerResponse) => {
    // 1. Decode the URL to handle spaces (%20 -> " ")
    const url = decodeURIComponent(request.url || '/');

	// Socket.io handles these internally via initEngine(io)
    if (url.startsWith('/socket.io/')) {
        return; 
    }

	console.log('[Static] requested url', url);

    // 1. API Endpoints (Leaderboard)
    if (url === '/leaderboard' || url === '/hall-of-fame') {
		let data;
		if (url === '/leaderboard') data = hub.query('score:leaderboard', null);
		if (url === '/hall-of-fame') data = hub.query('score:hall-of-fame', null);

		// If data is already a string, don't stringify it!
		const payload = typeof data === 'string' ? data : JSON.stringify(data);

        response.writeHead(200, { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*' 
        });
        return response.end(payload);
    }


    // 2. Static File Serving (Production)
    // Map URL to file path in the 'dist' folder
    let filePath = path.join(PROD_CLIENT_PATH, url === '/' ? 'index.html' : url);

    // Basic security: prevent escaping the dist folder
    if (!filePath.startsWith(PROD_CLIENT_PATH)) {
        response.writeHead(403);
        return response.end('Forbidden');
    }

	// If it's not a real file, assume it's a Vue Router path and serve index.html
	if (!fs.existsSync(filePath)) {
        filePath = path.join(PROD_CLIENT_PATH, 'index.html');
    }

    fs.readFile(filePath, (err, data) => {
        // If the connection was closed while reading, don't try to write
        if (response.writableEnded) return;

        if (err) {
            response.writeHead(404);
            return response.end('Not Found');
        }

        const ext = path.extname(filePath);
        const contentType = {
            '.js': 'application/javascript',
            '.css': 'text/css',
            '.html': 'text/html',
			'.mp3': 'audio/mpeg',
			'.wav': 'audio/wav',
			'.ogg': 'audio/ogg',
			'.png': 'image/png',
			'.jpg': 'image/jpeg',
			'.svg': 'image/svg+xml',
			'.ico': 'image/x-icon',
        }[ext] || 'text/plain';

        response.writeHead(200, { 'Content-Type': contentType });
        response.end(data);
    });
};

// Client
/* 
import { io } from "socket.io-client";

const socket = io("http://localhost:3000", {
  auth: {
    token: "abc123",
    userId: "42"
  }
});
*/

/* Handles socket handshake and connections */
const initEngine = (io:Server) => {

	// Auth check
	io.use((socket, next) => {

		console.log('Authenticating socket', socket.id);

		const username = String(socket.handshake.auth.username);
		const lobbyId = String(socket.handshake.auth.lobbyId);

		try {
			// One single call. The Hub handles the complexity.
			hub.dispatch('player:reserve', { username, lobbyId });
			
			// #debug
			PlayerService.list();
			LobbyService.list();
			SocketService.list();

			// success!!
			next();
		} catch (err) {
			// Catch the specific errors thrown by the Hub
			next(err as Error);
		}

	});

	// Handles connection
	io.on('connection', function(socket:Socket<ClientToServerEvents, ServerToClientEvents>) {
		
		console.log("Socket connected", socket.id);

		const { username, lobbyId } = socket.handshake.auth;
		const socketId = socket.id;

		// Finalize the login
    	const { success } = hub.dispatch('player:register', { username, lobbyId, socket });

		// check if finalization was successful
		if (success === false) {
			socket.disconnect();
			return ;
		}

		// #debug
		PlayerService.list();
		LobbyService.list();
		SocketService.list();

		//--------------------------------------------------
		/* Here are defined the operations to perform once a
		socket succefully connects. Not the best place but shhhh */

		// Basic info when the socket connects
		const info = hub.query('lobby:full_info', lobbyId);
		if (info) socket.emit('lobbyUpdate', info);

		// playerJoined broadcast
		hub.dispatch('socket:lobbycast', { lobbyId, event:'playerJoined', subPayload: { player: { id:socket.id, username, ready:false }}});

		//---------------------------------------------------
		/* Here we convert socket events into backend events.
		This is a really important part of the backend code and I
		feel it shouldn't be in the middle of something else, but
		here I am. */

		socket.on('ready', () => {
			hub.dispatch('player:ready', { socketId, lobbyId });
		});

		socket.on('setLobbyMode', ({ mode }) => {
			hub.dispatch('lobby:gamemode', { socketId, mode });
		});

		socket.on('tryStart', (cb: (ok:boolean, error:string) => void) => {
			const ret = hub.dispatch('player:try_start', { socketId, lobbyId });
			cb(ret.success, ret.error);
		});

		//---------------------------------------------------

		socket.on('disconnect', () => {
			console.log("Socket disconnected:", socket.id);
			
			// remove from DBs
			bus.emit('player:logout', { socketId: socket.id, socket });

			// #debug
			PlayerService.list();
			LobbyService.list();
			SocketService.list();

			// notify the lobby
			const host = hub.query('lobby:host', lobbyId);
			if (host === null) return ;
			hub.dispatch('socket:lobbycast', { lobbyId, event:'playerLeft', subPayload: { id:socket.id, newhost:host }});
		});
	})
}







// Creates the server and return the stop function
function create(params:ServerParams, cb: () => void): () => void {
	const { host, port } = params;

	const app = http.createServer();
	const io =  new Server(app);

	// Initilize handlers
	app.on('request', httpHandler);
	initEngine(io);

	// Start listening
	app.listen({ host, port }, () =>{
		console.log(`tetris listen on port http://${host}:${port}`);
		cb();
	});

	const stop = () => {
		console.log('tetris shutting down ...');
		io.close();
		app.close(() => {
			app.unref();
		});
	}

	return stop;
}


export default create