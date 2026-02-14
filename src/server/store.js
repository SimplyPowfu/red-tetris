import { createStore, applyMiddleware } from 'redux';
import createLogger from 'redux-logger';
import thunk from 'redux-thunk';
import reducer from './reducers';
import authMiddleware from './middleware/authMiddleware';
import synchLobby from './middleware/synchLobby';
import moveValidation from './middleware/moveValidation';
import moveConseq from './middleware/moveConseq';
import startMatch from './middleware/startMatch';
import endMatch from './middleware/endMatch';
import blockNotAuth from './middleware/blockNotAuth';
import blockReduce from './middleware/blockReduce';

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
			if (state.users[socket.id]
				&& state.users[socket.id].lobbyId === action.meta.lobbyId
				&& socket.id !== action.meta.avoid)
				{
				console.log('[REPLY]', `${action.type},`, 'socket', socket.id);
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
	authMiddleware,
	/* Block action */
	blockNotAuth,
	/* Validate action */
	moveValidation,
	moveConseq,
	/* Check match status */
	startMatch,
	endMatch,
	/* Post State update */
	synchLobby,
	/* Send to Clients */
	replyMiddleware,
	lobbyBroadcastMiddleware,
	broadcastMiddleware,
	/* Don't Reduce */
	blockReduce,
  )
)

export { store, sockets };