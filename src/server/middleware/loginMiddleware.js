import { AUTH_LOGIN } from '../../client/actions/auth';
import { login } from '../actions/auth';

export const USER_CONFLICT = 'user/conflict';

const loginMiddleware = store => next => action => {
	if (action.type === AUTH_LOGIN)
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
				meta: { reply: true, senderId }
			});
		}
		else
		{
			// return with updated meta
			store.dispatch(login(senderId, action.payload));
			return next({
				...action,
				type: action.type + '/reply',
				meta: { ...action.meta, reply: true }
			});
		}
	}

	return next(action); // forward the original action if no conflict
}

export default loginMiddleware;