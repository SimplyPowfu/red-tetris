import fs  from 'fs';
import debug from 'debug';
import { LOGOUT_REQUEST } from '../client/actions/auth.js';

// Services
import store from './services/Store.js';
import SHub from './services/SocketHub.js';
import Leaderboard from './services/Leaderboard.js';

const logerror = debug('tetris:error')
  , loginfo = debug('tetris:info')

const initApp = (app, params, cb) => {
	const { host, port } = params

	const handler = (req, res) => {
		if (req.url === '/bundle.js' || req.url === '/index.html' ||req.url === '/')
		{
			const file = req.url === '/bundle.js' ? '/../../build/bundle.js' : '/../../index.html'
			fs.readFile(__dirname + file, (err, data) => {
				if (err) {
					logerror(err);
					res.writeHead(500);
					return res.end('Error loading index.html');
				}
				res.writeHead(200);
				res.end(data);
			});
		}
		else if (req.url === '/leaderboard')
		{
			const data = JSON.stringify(Leaderboard.sorted());
			
			// Add CORS headers
			res.setHeader('Access-Control-Allow-Origin', '*'); // allow all origins
			res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
			res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
			
			res.writeHead(200);
			res.end(data);
		}
	}

	app.on('request', handler);

	app.listen({host, port}, () =>{
		loginfo(`tetris listen on ${params.url}`);
		cb();
	})
}

const initEngine = io => {
	io.on('connection', function(socket) {
		loginfo("Socket connected: " + socket.id);
		
		// store socket in socket hub
		SHub.set(socket.id, socket);

		socket.on('action', (action) => {
			loginfo(`action from ${socket.id}`, action);

			// ping-pong doesn't go trough store
			if(action.type === 'server/ping') {
				socket.emit('action', { type: 'pong' });
				return ;
			}

			// new addon
			store.dispatch({
				...action,
				meta: { fromClient:true, senderId: socket.id }
			});
		})

		socket.on('disconnect', () => {
			loginfo("Socket disconnected:", socket.id);
			store.dispatch({
				type: LOGOUT_REQUEST,
				meta: { fromClient:true, senderId:socket.id }
			});
			SHub.delete(socket.id);
		})
	})
}

export function create(params)
{
	const promise = new Promise( (resolve, reject) => {
		const app = require('http').createServer()
		initApp(app, params, () =>{
			const io = require('socket.io')(app)
			const stop = (cb) => {
				io.close()
				app.close( () => {
					app.unref()
				})
				loginfo(`Engine stopped.`)
				cb()
			}

			initEngine(io)
			resolve({stop})
		})
  	})
  return promise
}
