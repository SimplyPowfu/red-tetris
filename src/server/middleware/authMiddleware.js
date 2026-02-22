import { LOGIN_REQUEST, LOGIN_REPLY, LOGOUT_REQUEST } from '../../client/actions/auth';
import { login, logout } from '../actions/auth';

export const USER_CONFLICT = 'user/conflict';

import SHub from '../services/SocketHub';

// Checks login requests
const authMiddleware = store => next => action => {
	console.log('[LOGIN] got', action.type);
	if (action.type === LOGIN_REQUEST)
	{
		const state = store.getState();
		const { username, lobbyId } = action.payload;
		const { senderId } = action.meta;

		// Check if user ID or username already exists
		if (Object.values(state.users).some(u => u.username === username)) {
			// Dispatch conflict action to sender
			SHub.emit(senderId, 'action', {
				type: USER_CONFLICT,
				message: 'Match already started',
			});
			return ;
			// return next({
			// 	type: USER_CONFLICT,
			// 	message: 'Username already exists',
			// 	meta: { reply: true, senderId, fromServer:true }
			// });
		}
		const match = state.tetris[lobbyId];
		if (match && match.ingame === true) {
			SHub.emit(senderId, 'action', {
				type: USER_CONFLICT,
				message: 'Match already started',
			});
			// return next({
			// 	type: USER_CONFLICT,
			// 	message: 'Match already started',
			// 	meta: { reply: true, senderId, fromServer:true }
			// });
			return ;
		}

		// return with updated meta
		SHub.auth(senderId, action.payload);
		SHub.emit(senderId, 'action', {
			type: LOGIN_REPLY,
			payload: action.payload,
		});
		const err = SHub.error();
		if (err)
			console.error('Error on auth', err);

		// const result = next({
		// 	type: LOGIN_REPLY,
		// 	payload: action.payload,
		// 	meta: { reply: true, senderId, fromServer:true }
		// });

		store.dispatch(login(senderId, action.payload));
		return ;
	}
	else if (action.type === LOGOUT_REQUEST)
	{
		const state = store.getState();
		const { senderId } = action.meta;
		const user = state.users[senderId];
		if (user !== undefined)
			store.dispatch(logout(senderId));
		return ;

	}

	return next(action);
}

export default authMiddleware;