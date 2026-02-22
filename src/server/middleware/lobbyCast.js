// Utils import
import SHub from "../services/SocketHub.js";

const lobbyCast = store => next => action => {
	const result = next(action);

	if (action.meta && action.meta.lobbyCast)
	{
		if (!action.meta.lobbyId)
		{
			console.warn('[LobbyCast] lobbyId not found');
			return ;
		}

		SHub.emitTo(
			(auth) => auth && auth.lobbyId === action.meta.lobbyId,
			'action',
			action
		);
	}
	

	return result;
}

export default lobbyCast;