import { LOBBY_STATE } from '../../server/actions/lobby';

const reducer = (state = {} , action) => {
	// console.log('[reducer/user] reducing action', action);
	switch(action.type)
	{
	case LOBBY_STATE:
	{
		const { lobbyId, players } = action.payload;
		return {
			lobbyId,
			players,
		}
	}
	default: 
		return state 
	}
}

export default reducer