export const LOBBY_STATE = 'lobby/state';
export const DELETE_LOBBY = 'lobby/deletelobby';

export const lobbystate = (lobbyId, meta) => {
	return (dispatch, getState) => {

		const state = getState();
		const lobby = state.lobby[lobbyId];

		if (!lobby) return;
		const players = lobby.players.map(p => state.users[p].username);

		dispatch({
			type: LOBBY_STATE,
			payload: { lobbyId, players },
			meta
		})
	}
}

export const deletelobby = (lobbyId) => {
	return (dispatch, getState) => {
		 const lobbyFound = getState().lobby[lobbyId];

    	if (!lobbyFound) return ;

		dispatch({
			type: DELETE_LOBBY,
			payload: { lobbyId }
		});
	}
}