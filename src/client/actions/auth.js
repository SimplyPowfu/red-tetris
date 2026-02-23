export const LOGIN_REQUEST = 'server/login/request';
export const LOGIN_REPLY = 'login/reply';
export const LOGOUT_REQUEST = 'server/logout/request';

let interval = null;

export const login = (payload) => {
	return (dispatch, getState) => {
		
		// console.log('dispatching login', state.server.connected, interval);
		
		if (getState().server.connected) {
			// console.log('DISPATCHING');
			dispatch({
				type: LOGIN_REQUEST,
				payload,
			});
			return ;
		}

		if (interval === null) {
			interval = setInterval(() => {

				const state = getState();
				// console.log('checking', state.server.connected);

				if (!state.server.connected)
					return ;

				// console.log('DISPATCHING');
				dispatch({
					type: LOGIN_REQUEST,
					payload,
				});

				clearInterval(interval);
				interval = null;
			}, 100);
		}
	}
}