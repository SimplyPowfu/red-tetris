export const LOGIN_REQUEST = 'server/login/request';
export const LOGIN_REPLY = 'login/reply';
export const LOGOUT_REQUEST = 'server/logout/request';
export const LOGOUT_REPLY = 'logout/reply';

let interval = null;

export const login = (payload) => {
	return (dispatch, getState) => {
		
		// console.log('dispatching login', state.server.connected, interval);
		
		const state = getState();
		if (state.server && state.server.connected) {
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

export const logout = () => {
	return ({
		type: LOGOUT_REPLY,
	});
}