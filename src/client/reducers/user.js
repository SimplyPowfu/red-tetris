import { LOBBY_STATE } from "../../server/actions/lobby"
import { LOGIN_REPLY } from "../actions/auth"
import { TETRIS_SCORE } from "../actions/tetris";

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
	case TETRIS_SCORE:
	{
		return {
			...state,
			score: action.payload.score,
		}
	}
	default: 
		return state 
	}
}

export default reducer