// Server imports
import { USER_LOGIN, USER_LOGOUT } from '../actions/auth';
import { lobbystate } from '../actions/lobby';

// Tetris import
import { COLLAPSE_LINE, NEW_GRID, PENALITY_LINE, TOSTATIC_BLOCK } from '../../tetris/actions/grid';
import { deletematch } from '../actions/tetris';

const synchLobby = store => next => action => {
	const result = next(action); // reducer runs here
	const state = store.getState();

	// dispatch a lobby update when the user logs in
	switch (action.type)
	{
		case USER_LOGIN:
		{
			const { lobbyId } = action.payload;
			// updates the lobby for all user
			store.dispatch(lobbystate(lobbyId, { lobbyCast:true, lobbyId }));
			break ;
		}
		case USER_LOGOUT:
		{
			const { lobbyId } = action.meta;
			console.dir(state.tetris[lobbyId], { depth: null });
			if (state.tetris[lobbyId].players.length === 1) {
				store.dispatch(deletematch(lobbyId));
			} else {
				store.dispatch(lobbystate(lobbyId, { lobbyCast:true, lobbyId }));
			}
			break ;
		}
		case TOSTATIC_BLOCK:
		case COLLAPSE_LINE:
		case PENALITY_LINE:
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