// 'store', 'next' and 'action' all supplied by Redux on call
const socketMiddleware = (socket) => store => next => action => {
	if (action.meta && action.meta.sendToServer === true)
	{
		const state = store.getState();
		if (state.server && state.server.connected === true) {
			socket.emit('action', action);
		}
	}
	return next(action);
}

export default socketMiddleware;