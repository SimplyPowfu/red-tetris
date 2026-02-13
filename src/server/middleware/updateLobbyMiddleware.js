// Server imports
import { USER_LOGIN, USER_LOGOUT } from '../actions/auth';
import { lobbystate } from '../actions/lobby';

// Tetris import
import { NEW_GRID } from '../../tetris/actions/grid';

const updateLobbyMiddleware = store => next => action => {
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
			// tells the new user to load a grid
			store.dispatch({
				type: NEW_GRID,
				meta: { ...action.meta, reply:true }
			});
			break ;
		}
		case USER_LOGOUT:
		{
			const { lobbyId } = action.payload;
			store.dispatch(lobbystate(lobbyId, { lobbyCast:true, lobbyId }));
			break ;
		}
	}
	return result;
}

export default updateLobbyMiddleware;