// Server imports
import { endmatch, winmatch } from '../actions/tetris';

// Client imports
import { GAME_OVER } from '../../client/actions/tetris';

// Tetris import

const matchFinish = store => next => action => {

	console.log('[END] got', action.type);

	const result = next(action); // reducer runs here
	const state = store.getState();

	// dispatch a lobby update when the user logs in
	switch (action.type)
	{
		// case USER_LOGOUT:
		case GAME_OVER:
		{
			const { lobbyId } = action.meta;
			const lobby = state.tetris[lobbyId];
			if (!lobby)
				break ;

			// who is alive?
			const alive = lobby.players.map(userId => ({
				userId: userId,
				gameover: lobby[userId].gameover,
			})).filter(u => u.gameover === false);
			
			// reduce 
			const result = next(action);

			if (alive.length === 1) {
				store.dispatch(winmatch(lobbyId, alive[0].userId));
			}
			store.dispatch(endmatch(lobbyId));
			return result;
		}
	}
	return result;
}

export default matchFinish;