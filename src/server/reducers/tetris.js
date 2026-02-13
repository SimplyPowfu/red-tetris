import {
	START_MATCH,
	DELETE_MATCH
} from '../actions/tetris';

import { USER_LOGIN, USER_LOGOUT } from '../actions/auth';

// Tetris imports
import { newgrid, nb, cl, pn, sd, sl, sr, rr, mf } from '../../tetris/gridManip';
import { COLLAPSE_LINE,PENALITY_LINE, NEW_BLOCK } from '../../tetris/actions/grid';
import { SHIFT_DOWN, SHIFT_LEFT, SHIFT_RIGHT, ROTATE, MEGA_FALL } from '../../tetris/actions/moves';
import { GAME_OVER } from '../../client/actions/tetris';

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
						players: [userId],
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
					players: [
						...state[lobbyId].players,
						userId,
					],
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
			const players = state[lobbyId].players.filter(player => player !== userId);

			return {
				...state,
				[lobbyId]: {
					players,
					...remainingUsers,
				}
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
		case GAME_OVER:
		{
			const { senderId, lobbyId } = action.meta;
			const userState = state[lobbyId][senderId];
			
			return ({
				...state,
				[lobbyId]: {
					...state[lobbyId],
					[senderId]: {
						...userState,
						gameover: true,
					}
				}
			});
		}

		/* GRID actions */
		case NEW_BLOCK:
		{
			const { blockType } = action.payload;
			const { senderId, lobbyId } = action.meta;
			const userState = state[lobbyId][senderId];

			return ({
				...state,
				[lobbyId]: {
					...state[lobbyId],
					[senderId]: {
						...userState,
						blockNum: userState.blockNum + 1,
						...nb(blockType, userState.activeBlock, userState.static)
					}
				}
			});
		}
		case COLLAPSE_LINE:
		{
			const { senderId, lobbyId } = action.meta;
			const userState = state[lobbyId][senderId];

			return ({
				...state,
				[lobbyId]: {
					...state[lobbyId],
					[senderId]: {
						...userState,
						static: cl(userState.static)
					}
				}
			});
		}
		case PENALITY_LINE:
		{
			const { senderId, lobbyId } = action.meta;
			const userState = state[lobbyId][senderId];

			return ({
				...state,
				[lobbyId]: {
					...state[lobbyId],
					[senderId]: {
						...userState,
						static: pn(userState.static)
					}
				}
			});
		}
		/* MOVE actions */
		case SHIFT_DOWN:
		{
			const { senderId, lobbyId } = action.meta;
			const userState = state[lobbyId][senderId];

			return {
				...state,
				[lobbyId]: {
					...state[lobbyId],
					[senderId]: {
						...userState,
						activeBlock: sd(userState.activeBlock),
					}
				}
			}
		}
		case SHIFT_LEFT:
		{
			const { senderId, lobbyId } = action.meta;
			const userState = state[lobbyId][senderId];

			return {
				...state,
				[lobbyId]: {
					...state[lobbyId],
					[senderId]: {
						...userState,
						activeBlock: sl(userState.activeBlock),
					}
				}
			}
		}
		case SHIFT_RIGHT:
		{
			const { senderId, lobbyId } = action.meta;
			const userState = state[lobbyId][senderId];

			return {
				...state,
				[lobbyId]: {
					...state[lobbyId],
					[senderId]: {
						...userState,
						activeBlock: sr(userState.activeBlock),
					}
				}
			}
		}
		case ROTATE:
		{
			const { senderId, lobbyId } = action.meta;
			const userState = state[lobbyId][senderId];

			return {
				...state,
				[lobbyId]: {
					...state[lobbyId],
					[senderId]: {
						...userState,
						activeBlock: rr(userState.activeBlock),
					}
				}
			}
		}
		case MEGA_FALL:
		{
			const { senderId, lobbyId } = action.meta;
			const userState = state[lobbyId][senderId];

			return ({
				...state,
				[lobbyId]: {
					...state[lobbyId],
					[senderId]: {
						...userState,
						activeBlock: mf(userState.activeBlock, userState.static)
					}
				}
			});
		}
		default:
			return state;
	}
};

export default reducer;