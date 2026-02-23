import { logaction } from "../actions/server";

// 'store', 'next' and 'action' all supplied by Redux on call
const socketMiddleware = (socket) => store => next => action => {
	if(action.type && action.type.indexOf('server/') === 0)
	{
		const state = store.getState();
		if (socket && state.server && state.server.connected === true) {
			socket.emit('action', action);
		}
		store.dispatch(logaction(action));
	}
	return next(action);
}

export default socketMiddleware;