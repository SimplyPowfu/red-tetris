import { USER_LOGIN, USER_LOGOUT } from '../actions/auth';

const reducer = (state = {}, action) => {
	switch(action.type)
	{
		case USER_LOGIN:
		{
			const { userId, ...userData } = action.payload;

			return {
				...state,
				[userId]: { ...userData }
			};
		}
		case USER_LOGOUT:
		{
			const { senderId } = action.meta;

			const { [senderId]: removed, ...rest } = state;

			return rest;
		}
		default:
			return state;
	}
};

export default reducer;

