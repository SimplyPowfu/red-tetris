import { LOGIN_REPLY, LOGIN_REQUEST, LOGOUT_REQUEST } from "../../client/actions/auth";
import { GAME_OVER, MOVE_PIECE, START_REQUEST } from "../../client/actions/tetris";
import { COLLAPSE_LINE, NEW_BLOCK, NEW_GRID, PENALITY_LINE } from "../../tetris/actions/grid";
import { ROTATE, SHIFT_DOWN, SHIFT_LEFT, SHIFT_RIGHT } from "../../tetris/actions/moves";
import { USER_LOGIN, USER_LOGOUT } from "../actions/auth";

// Checks if the action was dispatched by the socket.io (meta.fromClient)
// If so checks if the ID is authenticated. IF so appends the lobbyId
const blockNotAuth = store => next => action => {

	// check for auth data
	if (action.meta
		&& action.meta.fromClient	// <---
	) {
		// client allowed actions
		if (action.type !== LOGIN_REQUEST
			&& action.type !== LOGOUT_REQUEST
			&& action.type !== START_REQUEST
			&& action.type !== MOVE_PIECE)
			return ;

		// check for Id
		if (!action.meta.senderId)
			return ;

		// get the state
		const state = store.getState();

		// check if user authenticated
		const { senderId } = action.meta;
		const user = state.users[senderId];
		if (!user)
			return ;

		// Append lobbyId
		const { lobbyId } = user;
		action = {
			...action,
			meta: { ...action.meta, lobbyId }
		}
	}
	/* add lobbyId if action fromServer */
	else if (action.meta
		&& action.meta.fromServer	// <---
		&& action.meta.senderId
	) {
		// get the state
		const state = store.getState();

		// check if user authenticated
		const { senderId } = action.meta;
		const user = state.users[senderId];
		if (user) 
		{
			// Append lobbyId
			const { lobbyId } = user;
			action = {
				...action,
				meta: { ...action.meta, lobbyId }
			}
		}

	}

	console.log('[BLOCK] ok', action.type);

	return next(action);
}

export default blockNotAuth;