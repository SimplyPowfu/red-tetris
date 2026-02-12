import { USER_LOGIN, USER_LOGOUT } from '../actions/auth';
import { DELETE_LOBBY } from '../actions/lobby';

const reducer = (state = {}, action) => {
	switch(action.type)
	{
		/* LOBBY management operations */
		case USER_LOGIN:
		{
			const { userId, lobbyId } = action.payload;

			// create lobby if first player to login
			if (!state[lobbyId])
			{
				return {
					...state,
					[lobbyId]: {
						players: [userId]
					}
				}
			}
		
			// add player to existing lobby otherwise
			return {
				...state,
				[lobbyId]: {
					...state[lobbyId],
					players: [
						...state[lobbyId].players,
						userId,
					]
				}
			};
		}
		case USER_LOGOUT:
		{
			const { userId, lobbyId } = action.payload;

			return {
				...state,
				[lobbyId]: {
					...state[lobbyId],
					players: state[lobbyId].players.filter(
						player => player !== userId
					)
				}
			};
		}
		case DELETE_LOBBY:
		{
			const { lobbyId } = action.payload;

			const { [lobbyId]: removed, ...rest } = state;

			return {
				...state,
				rest
			};
		}
		default:
			return state;
	}
};

export default reducer;