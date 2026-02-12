import {
	START_MATCH,
	DELETE_MATCH
} from '../actions/tetris';

import { newgrid, ts, nb, cl, pn, sd, sl, sr, rr } from '../../tetris/gridManip';
import { USER_LOGIN, USER_LOGOUT } from '../actions/auth';
import { NEW_BLOCK } from '../../tetris/actions/grid';

const reducer = (state = {}, action) => {
	switch(action.type)
	{
		/* MATCH management operations */
		case USER_LOGIN:
		{
			const { userId, lobbyId } = action.payload
			
			// add the seed if the first user joined
			if (!state[lobbyId]) {

				const seed = 1;
				return ({
					...state,
					[lobbyId]: {
						seed,
						[userId]: {
							blockNum: 0,
							activeBlock: null,
							static: newgrid(),
						}
					}
				});
			}

			// add the new user
			return ({
				...state,
				[lobbyId]: {
					...state[lobbyId],
					[userId]: {
						blockNum: 0,
						activeBlock: null,
						static: newgrid(),
					}
				}
			});
		}
		case USER_LOGOUT:
		{
			const { userId, lobbyId } = action.payload;

			const { [userId]: removedUser, ...remainingUsers } = state[lobbyId];

			return {
				...state,
				[lobbyId]: remainingUsers
			};
		}
		case DELETE_MATCH:
		{
			const { lobbyId } = action.payload;

			const { [lobbyId]: removed, ...rest } = state;

			return {
				rest,
			};
		}
		/* perform MOVES */
		case NEW_BLOCK:
		{
			const { blockType } = action.payload;
			const { senderId, lobbyId } = action.meta;

			return ({
				...state,
				[lobbyId]: {
					...state[lobbyId],
					[senderId]: {
						...state[lobbyId][senderId],
						blockNum: state[lobbyId][senderId] + 1,
						activeBlock: nb(blockType)
					}
				}
			});
		}
		// case TOSTATIC_BLOCK:
		// 	return {
		// 		...state,
		// 		active: newgrid(),
		// 		static: ts(state.active, state.static),
		// 	}
		// case COLLAPSE_LINE:
		// 	const { line } = action.payload;
		// 	if (!line) return state;
		// 	return {
		// 		...state,
		// 		static: cl(state.static, line),
		// 	}
		// case PENALITY_LINE:
		// 	return {
		// 		...state,
		// 		static: pn(state.static),
		// 	}
		default:
			return state;
	}
};

export default reducer;