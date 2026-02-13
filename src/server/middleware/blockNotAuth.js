import { LOGIN_REPLY } from "../../client/actions/auth";
import { GAME_OVER, MOVE_PIECE } from "../../client/actions/tetris";
import { COLLAPSE_LINE, NEW_BLOCK, NEW_GRID, PENALITY_LINE } from "../../tetris/actions/grid";
import { ROTATE, SHIFT_DOWN, SHIFT_LEFT, SHIFT_RIGHT } from "../../tetris/actions/moves";
import { USER_LOGIN, USER_LOGOUT } from "../actions/auth";

// block acctions from not auth users
const blockNotAuth = store => next => action => {
	const state = store.getState();

	// check for auth data
	if (!(action.meta && action.meta.fromServer))
	{
		if (!action.meta || !action.meta.senderId || !action.meta.lobbyId)
			return ;
		const { senderId, lobbyId } = action.meta;
		const match = state.tetris[lobbyId];
		if (!match)
			return ;
		const grid = match[senderId];
		if (!grid)
			return ;
	}

	return next(action);

	// switch (action.type)
	// {
	// 	case NEW_GRID:
	// 	case NEW_BLOCK:
	// 	case MOVE_PIECE:
	// 	case SHIFT_DOWN:
	// 	case SHIFT_LEFT:
	// 	case SHIFT_RIGHT:
	// 	case ROTATE:
	// 	case COLLAPSE_LINE:
	// 	case PENALITY_LINE:
	// 	case GAME_OVER:
	// 	case USER_LOGOUT:
	// 	{
	// 		if (!action.meta || !action.meta.senderId || !action.meta.lobbyId)
	// 			return ;
	// 		const { senderId, lobbyId } = action.meta;
	// 		const match = state.tetris[lobbyId];
	// 		if (!match)
	// 			return ;
	// 		const grid = match[senderId];
	// 		if (!grid)
	// 			return ;
	// 	}
	// }
	// return next(action);
}

export default blockNotAuth;