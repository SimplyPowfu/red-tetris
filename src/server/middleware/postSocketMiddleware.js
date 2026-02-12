// Server imports
import { USER_LOGIN, USER_LOGOUT } from '../actions/auth';
import { START_MATCH, serverNewBlock } from '../actions/tetris';
import { lobbystate } from '../actions/lobby';

// Client imports
import { NEW_GRID, newblock } from '../../tetris/actions/grid';
import { SHIFT_DOWN, shiftdown } from '../../tetris/actions/moves';
import { MOVE_PIECE } from '../../client/actions/tetris';

// Tetris import

const postSocketMiddleware = store => next => action => {
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
		case START_MATCH:
		{
			const { lobbyId } = action.meta;
			const lobby = state.lobby[lobbyId];
			lobby.players.forEach(p => {
				store.dispatch(serverNewBlock(p));
				setTimeout(() => {
					store.dispatch({
						type: MOVE_PIECE,
						payload: { move: 'Down' },
						meta: { senderId:p, auto:true }
					}, 1000);
				});
			});
			break ;
		}
		// case SHIFT_DOWN:
		// {
		// 	const { senderId, auto } = action.meta;
		// 	if (!auto)
		// 		break ;
		// 	setTimeout(() => {
		// 		store.dispatch({
		// 			...shiftdown(),
		// 			meta: { reply:true, senderId, auto:true }
		// 		}, 1000);
		// 	});
		// 	break ;
		// }
	}
	return result;
}

export default postSocketMiddleware;