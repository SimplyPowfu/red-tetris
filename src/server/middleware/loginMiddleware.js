import { LOGIN_REQUEST, LOGIN_REPLY } from '../../client/actions/auth';
import { login } from '../actions/auth';

export const USER_CONFLICT = 'user/conflict';

const loginMiddleware = store => next => action => {
	console.log('[LOGIN] got', action.type);
	if (action.type === LOGIN_REQUEST)
	{
		// console.log('[middleware/login] got action');
	
		const { username } = action.payload;
		const { senderId } = action.meta;
		const state = store.getState();

		// Check if user ID or username already exists
		if (Object.values(state.users).some(u => u.username === username)) {
			// Dispatch conflict action to sender
			return next({
				type: USER_CONFLICT,
				message: 'Username already exists',
				meta: { reply: true, senderId, fromServer:true }
			});
		}
		else
		{
			// return with updated meta
			store.dispatch(login(senderId, action.payload));
			return next({
				...action,
				type: LOGIN_REPLY,
				meta: { ...action.meta, reply: true, fromServer:true }
			});
		}
	}

	return next(action); // forward the original action if no conflict
}

export default loginMiddleware;