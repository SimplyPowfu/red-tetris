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
						score: lobby[userId].score,
						ready: lobby.ready.includes(userId) ? true : false,
					});
				}
				else
				{
					return ({
						username: state.users[userId].username,
						ready: lobby.ready.includes(userId) ? true : false,
					});
				}
			}
			return null
		}).filter(p => p !== null);

		dispatch({
			type: LOBBY_STATE,
			payload: { lobbyId, players, ingame: lobby.ingame },
			meta: { fromServer:true, ...meta }
		})
	}
}