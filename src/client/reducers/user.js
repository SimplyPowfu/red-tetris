import { LOBBY_STATE } from "../../server/actions/lobby"
import { LOGIN_REPLY } from "../actions/auth"

const reducer = (state = {} , action) => {
	// console.log('[reducer/user] reducing action', action);
	switch(action.type)
	{
	case LOGIN_REPLY:
		return {
			...state,
			...action.payload
		}
	case LOBBY_STATE:
	{
		const me = action.payload.players.find(p => p.username === state.username);
		if (me !== undefined)
		{
			return {
				...state,
				ready: me.ready,
				score: me.score,
			}
		}
		else
		{
			return state;
		}
	}
	default: 
		return state 
	}
}

export default reducer