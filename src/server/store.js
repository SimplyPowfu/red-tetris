import { createStore, applyMiddleware } from 'redux';
import createLogger from 'redux-logger';
import thunk from 'redux-thunk';
import reducer from './reducers';
import loginMiddleware from './middleware/loginMiddleware';
import checkLobbyId from './middleware/checkLobbyId';
import synchLobby from './middleware/synchLobby';
import moveValidation from './middleware/moveValidation';
import moveConseq from './middleware/moveConseq';
import startMatch from './middleware/startMatch';
import blockNotAuth from './middleware/blockNotAuth';

const initialState = {}
const sockets = new Set();

// Middleware to send the reply to the sender
const replyMiddleware = store => next => action => {
	const result = next(action);

	// console.log('[middleware/reply] got action', action);

	if (action.meta && action.meta.reply === true && action.meta.senderId)
	{
		const socket = Array.from(sockets).find(s => s.id === action.meta.senderId);
		if (socket) {
			socket.emit('action', action);
		}
	}

	return result;
}

// Middleware to broadcast actions to all sockets in one lobby
const lobbyBroadcastMiddleware = store => next => action => {
	const result = next(action);
	const state = store.getState();

	if (action.meta && action.meta.lobbyCast === true && action.meta.lobbyId)
	{
		sockets.forEach(socket => {
			console.log('socket', socket.id);
			if (state.users[socket.id]
				&& state.users[socket.id].lobbyId === action.meta.lobbyId
				&& socket.id !== action.meta.avoid)
			{
				socket.emit('action', action);
			}
		});
	}

	return result
}

// Middleware to broadcast actions to all sockets
const broadcastMiddleware = store => next => action => {
	const result = next(action);

	if (action.meta && action.meta.broadcast === true)
	{
		sockets.forEach(socket => {
			socket.emit('action', action);
		});
	}

	return result
}

const store = createStore(
  reducer,
  initialState,
  applyMiddleware(
	thunk,
	createLogger(),
	/* check validity */
	loginMiddleware,
	/* Append action */
	checkLobbyId,
	/* Block action */
	blockNotAuth,
	/* Validate action */
	moveValidation,
	moveConseq,
	/* Send to Clients */
	replyMiddleware,
	lobbyBroadcastMiddleware,
	broadcastMiddleware,
	/* Post State update */
	synchLobby,
	startMatch,
  )
)

export { store, sockets };