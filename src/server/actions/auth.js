export const USER_LOGIN = 'user/login'
export const USER_LOGOUT = 'user/logout'


export const login = (senderId, payload) => {
	return {
		type: USER_LOGIN,
		payload: { ...payload, userId: senderId },
		meta: { senderId }
	}
}

export const logout = (senderId) => {
	return (dispatch, getState) => {

		const state = getState();
		const user = state.users[senderId];
		if (!user) return;

		dispatch({
			type: USER_LOGOUT,
			payload: { userId: senderId, lobbyId: user.lobbyId },
		})
	}
}
