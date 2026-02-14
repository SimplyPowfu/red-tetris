// Server imports
import { DELETE_MATCH, deletematch, START_MATCH, winmatch } from '../actions/tetris';

// Client imports
import { GAME_OVER, MOVE_PIECE } from '../../client/actions/tetris';
import { USER_LOGOUT } from '../actions/auth';

// Tetris import

const endMatch = store => next => action => {

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
			return result;
		}
		case USER_LOGOUT:
		{
			const { lobbyId } = action.meta;
			const lobby = state.tetris[lobbyId];
			if (!lobby)
				break ;

			// reduce here
			const result = next(action);

			if (lobby.players.length === 1)
				store.dispatch(deletematch(lobbyId));
			return result;
		}
	}
	return result;
}

export default endMatch;