import { USER_CONFLICT } from '../../server/middleware/authMiddleware.js';
import { alert } from '../actions/alert.js';

// 'store', 'next' and 'action' all supplied by Redux on call
const alertMiddleware = store => next => action => {
	const result = next(action);
	if (action.type === USER_CONFLICT) {
		store.dispatch(alert(action.message));
	}
	return result;
}

export default alertMiddleware;