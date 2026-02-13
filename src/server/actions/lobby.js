export const LOBBY_STATE = 'lobby/state';

export const lobbystate = (lobbyId, meta) => {
	return (dispatch, getState) => {

		const state = getState();
		const lobby = state.tetris[lobbyId];

		if (!lobby)
			return ;
		const players = lobby.players.map(userId => state.users[userId].username);

		dispatch({
			type: LOBBY_STATE,
			payload: { lobbyId, players },
			meta
		})
	}
}