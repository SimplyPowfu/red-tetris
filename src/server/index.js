import fs  from 'fs'
import debug from 'debug'
import { store, sockets } from './store'
import { act } from 'react'
import { logout, USER_LOGOUT } from './actions/auth'
import { MOVE_PIECE } from '../client/actions/tetris'
import { START_MATCH } from './actions/tetris'
import { LOGIN_REQUEST } from '../client/actions/auth'

const logerror = debug('tetris:error')
  , loginfo = debug('tetris:info')

const initApp = (app, params, cb) => {
	const {host, port} = params
	const handler = (req, res) => {
		const file = req.url === '/bundle.js' ? '/../../build/bundle.js' : '/../../index.html'
		fs.readFile(__dirname + file, (err, data) => {
			if (err) {
				logerror(err)
				res.writeHead(500)
				return res.end('Error loading index.html')
			}
			res.writeHead(200)
			res.end(data)
		})
	}

	app.on('request', handler)

	app.listen({host, port}, () =>{
		loginfo(`tetris listen on ${params.url}`)
		cb()
	})
}

const initEngine = io => {
	io.on('connection', function(socket) {
		loginfo("Socket connected: " + socket.id);
		sockets.add(socket);

		socket.on('action', (action) => {
			loginfo(`action from ${socket.id}`, action);

			// ping-pong doesn't go trough store
			if(action.type === 'server/ping') {
				socket.emit('action', { type: 'pong' });
				return ;
			}
			// only MOVE_PIECE and START_MATCH sent to store
			if (action.type !== MOVE_PIECE
				&& action.type !== START_MATCH
				&& action.type !== LOGIN_REQUEST
				&& action.type !== USER_LOGOUT)	// #todo change to LOGOUT_REQUEST and let the loginMiddleware forward USER_LOGOUT if user found
			{
				socket.emit('action', { type: 'server/not-allowed' });
				return ;
			}


			// new addon
			store.dispatch({
				...action,
				meta: { senderId: socket.id }
			});
		})

		socket.on('disconnect', () => {
			loginfo("Socket disconnected:", socket.id);
			store.dispatch(logout(socket.id));
			sockets.delete(socket);
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
