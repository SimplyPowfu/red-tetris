// Server imports
import { USER_LOGIN, USER_LOGOUT } from '../actions/auth.js';
import { lobbystate, REQUEST_UPDATE } from '../actions/lobby.js';

// Tetris import
import { COLLAPSE_LINE, PENALITY_LINE, TOSTATIC_BLOCK } from '../../tetris/actions/grid.js';
import { END_MATCH, START_MATCH, WIN_MATCH } from '../actions/tetris.js';
import { GAME_OVER, READY_STATE } from '../../client/actions/tetris.js';
import { MEGA_FALL, SHIFT_DOWN } from '../../tetris/actions/moves.js';

// Services
import SHub from '../services/SocketHub';

const synchLobby = store => next => action => {
	const result = next(action); // reducer runs here
	const state = store.getState();

	console.log('[SYNCH] got', action.type);

	// dispatch a lobby update when the user logs in
	switch (action.type)
	{
		case USER_LOGIN:
		case START_MATCH:
		case REQUEST_UPDATE:
		{
			const lobbyId = action.payload.lobbyId ? action.payload.lobbyId : action.meta.lobbyId;
			// updates the lobby for all user
			// store.dispatch(lobbystate(lobbyId, { lobbyCast:true, lobbyId }));
			SHub.emitTo(
				(auth) => {
					// console.log('[SYNCH] SHub check', auth, lobbyId);
					return auth.lobbyId === lobbyId
				},
				'action',
				lobbystate(state, lobbyId)
			);
			break ;
		}
		case READY_STATE:
		case USER_LOGOUT:
		case SHIFT_DOWN:
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
			// store.dispatch(lobbystate(lobbyId, { lobbyCast:true, lobbyId }));
			SHub.emitTo(
				(auth) => auth.lobbyId === lobbyId,
				'action',
				lobbystate(state, lobbyId)
			);
			break ;
		}
	}
	return result;
}

export default synchLobby;