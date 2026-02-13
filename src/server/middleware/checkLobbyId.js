// If no senderId found in action.meta, block.
import { LOGIN_REPLY } from "../../client/actions/auth";
import { USER_LOGIN } from "../actions/auth";

// If senderId found but user not atuhenticated, block
const checkLobbyId = store => next => action => {

	// this action still need to be authenticated
	if (action.meta && action.meta.fromServer)
		return next(action);
	
	if (!action.meta || !action.meta.senderId)
		return ;
	const { senderId } = action.meta;

	const state = store.getState();
	const user = state.users[senderId];
	if (user !== undefined)
	{
		return next({
			...action,
			meta: { ...action.meta, lobbyId: user.lobbyId }
		});
	}
}

export default checkLobbyId;