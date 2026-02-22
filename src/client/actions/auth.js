export const LOGIN_REQUEST = 'login/request';
export const LOGIN_REPLY = 'login/reply';
export const LOGOUT_REQUEST = 'logout/request';

let interval = null;

export const login = (payload) => {
	return (dispatch, getState) => {
		
		// console.log('dispatching login', state.server.connected, interval);
		
		if (interval === null) {
			interval = setInterval(() => {

				const state = getState();
				console.log('checking', state.server.connected);

				if (!state.server.connected)
					return ;

				console.log('DISPATCHING');
				dispatch({
					type: LOGIN_REQUEST,
					payload,
					meta: { sendToServer:true }
				});

				clearInterval(interval);
				interval = null;
			}, 100);
		}
	}
}