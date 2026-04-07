import create from './server.js'
import params from './params.js'

/* const stop = */ create(params, () => {console.log('Happy things here')});

// setTimeout(() => stop(), 1000);




//----------------------------
/*       Monitor Setup       */

import net from 'node:net'
import repl from 'node:repl'

// Things to monitor
import BoardService from './services/BoardService.js'
import SocketService from './services/SocketService.js'
import PlayerService from './services/PlayerService.js'
import LobbyService from './services/LobbyService.js'

if (process.env.NODE_ENV === 'dev') {

	net.createServer((socket) => {
		const r = repl.start({
			prompt: 'Backend Console> ',
			input: socket,
			output: socket,
			terminal: true
		});
		r.on('exit', () => socket.end());

		// Expose your backend variables here
		r.context.boards = BoardService;
		r.context.sockets = SocketService;
		r.context.players = PlayerService;
		r.context.lobbies = LobbyService;
	}).listen(5001);

	console.log('REPL server running on port 5001');
}