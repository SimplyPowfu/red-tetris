const appendLobbyId = store => next => action => {
	// if has senderId, append his lobby
	if (!action.meta || !action.meta.senderId) return next(action);
	const { senderId } = action.meta;

	const state = store.getState();
	const user = state.users[senderId];
	if (user !== undefined)
	{
		return next({
			...action,
			meta: { ...action.meta, lobbyId: user.lobbyId }
		});
	}
	return next(action);
}

export default appendLobbyId;