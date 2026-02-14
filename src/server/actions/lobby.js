export const LOBBY_STATE = 'lobby/state';

export const lobbystate = (lobbyId, meta) => {
	return (dispatch, getState) => {

		const state = getState();
		const lobby = state.tetris[lobbyId];

		if (!lobby)
			return ;

		const players = lobby.players.map(userId => {
			
			if (state.users[userId])
			{
				if (lobby[userId])
				{
					return ({
						username: state.users[userId].username,
						grid: lobby[userId].static,
						gameover: lobby[userId].gameover,
					});
				}
				else
				{
					return ({
						username: state.users[userId].username,
					});
				}
			}
			return null
		}).filter(p => p !== null);

		dispatch({
			type: LOBBY_STATE,
			payload: { lobbyId, players },
			meta: { fromServer:true, ...meta }
		})
	}
}