export const SERVER_PING = 'server/ping';
export const SERVER_PONG = 'pong';
export const SERVER_CONNECTED = 'connected';
export const SERVER_LOG = 'log/server'

export const ping = () => {
	return (dispatch, getState) => {
		const socketConnected = getState().server.connected;

		if (!socketConnected) return ;

		dispatch({
			type: SERVER_PING,
		});
	}
}

export const logaction = (action) => {
	return ({
		type: SERVER_LOG,
		payload: { action }
	})
}

export const connected = () => ({
	type: SERVER_CONNECTED
});