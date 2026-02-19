// Server imports
import { USER_LOGIN, USER_LOGOUT } from '../actions/auth';
import { lobbystate } from '../actions/lobby';

// Tetris import
import { COLLAPSE_LINE, PENALITY_LINE, TOSTATIC_BLOCK } from '../../tetris/actions/grid';
import { END_MATCH, START_MATCH, WIN_MATCH } from '../actions/tetris';
import { GAME_OVER, READY_STATE } from '../../client/actions/tetris';

const synchLobby = store => next => action => {
	const result = next(action); // reducer runs here
	const state = store.getState();

	console.log('[SYNCH] got', action.type);

	// dispatch a lobby update when the user logs in
	switch (action.type)
	{
		case USER_LOGIN:
		case START_MATCH:
		{
			const { lobbyId } = action.payload;
			// updates the lobby for all user
			store.dispatch(lobbystate(lobbyId, { lobbyCast:true, lobbyId }));
			break ;
		}
		case READY_STATE:
		case USER_LOGOUT:
		case TOSTATIC_BLOCK:
		case COLLAPSE_LINE:
		case PENALITY_LINE:
		case GAME_OVER:
		case WIN_MATCH:
		case END_MATCH:
		{
			if (!action.meta || !action.meta.lobbyId)
			{
				console.error('Missing lobbyId on synch');
				return ;
			}

			const { lobbyId } = action.meta;
			store.dispatch(lobbystate(lobbyId, { lobbyCast:true, lobbyId }));
			break ;
		}
	}
	return result;
}

export default synchLobby;