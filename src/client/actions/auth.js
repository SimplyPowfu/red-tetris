export const AUTH_LOGIN = 'auth/login';

export const login = (payload) => {
  return {
	type: AUTH_LOGIN,
	payload,
	meta: { sendToServer:true }
  }
}