export const SERVER_PING = 'server/ping';
export const SERVER_PONG = 'pong';
export const SERVER_CONNECTED = 'server/connected';

export const ping = () => {
	return (dispatch, getState) => {
		const socketConnected = getState().server.connected;

		if (!socketConnected) return ;

		dispatch({
			type: SERVER_PING,
			meta: { sendToServer: true }
		});
	}
}

export const connected = () => ({
	type: SERVER_CONNECTED
});