import { LOBBY_STATE } from '../../server/actions/lobby';
import { LOGOUT_REPLY } from '../actions/auth';

const reducer = (state = {} , action) => {
	// console.log('[reducer/user] reducing action', action);
	switch(action.type)
	{
	case LOBBY_STATE:
	{
		return {
			...state,
			...action.payload
		}
	}
	case LOGOUT_REPLY:
		return {};
	default: 
		return state 
	}
}

export default reducer; // ciao tommi 