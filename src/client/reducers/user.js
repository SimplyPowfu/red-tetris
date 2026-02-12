import { AUTH_LOGIN } from "../actions/auth"

const reducer = (state = {} , action) => {
	// console.log('[reducer/user] reducing action', action);
	switch(action.type)
	{
	case AUTH_LOGIN + '/reply':
		return {
			...state,
			...action.payload
		}
	default: 
		return state 
	}
}

export default reducer