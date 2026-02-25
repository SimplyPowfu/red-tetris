import { logaction } from "../actions/server";
import { getSocket } from "../services/socket";

// 'store', 'next' and 'action' all supplied by Redux on call
const socketMiddleware = store => next => action => {
	if(action.type && action.type.indexOf('server/') === 0)
	{
		const state = store.getState();
		const socket = getSocket();
		if (state.server && state.server.connected === true) {
			socket.emit('action', action);
		}
		store.dispatch(logaction(action));
	}
	return next(action);
}

export default socketMiddleware;