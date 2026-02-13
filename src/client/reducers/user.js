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
	default: 
		return state 
	}
}

export default reducer