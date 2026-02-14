export const LOGIN_REQUEST = 'login/request';
export const LOGIN_REPLY = 'login/reply';
export const LOGOUT_REQUEST = 'logout/request';

export const login = (payload) => {
  return {
	type: LOGIN_REQUEST,
	payload,
	meta: { sendToServer:true }
  }
}