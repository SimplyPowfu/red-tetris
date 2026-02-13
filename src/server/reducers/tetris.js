import {
	START_MATCH,
	DELETE_MATCH
} from '../actions/tetris';

import { USER_LOGIN, USER_LOGOUT } from '../actions/auth';

// Tetris imports
import { newgrid, nb, cl, ts, pn, sd, sl, sr, rr, mf } from '../../tetris/gridManip';
import { COLLAPSE_LINE,PENALITY_LINE, NEW_BLOCK, TOSTATIC_BLOCK } from '../../tetris/actions/grid';
import { SHIFT_DOWN, SHIFT_LEFT, SHIFT_RIGHT, ROTATE, MEGA_FALL } from '../../tetris/actions/moves';
import { GAME_OVER, gameover } from '../../client/actions/tetris';
import { Randomizer } from '../../tetris/Randomizer';

const reducer = (state = {}, action) => {
	switch(action.type)
	{
		/* REVIEW */
		/* ===== MATCH management operations ===== */
		case USER_LOGIN:
		{
			const { userId, lobbyId } = action.payload
			
			// add the seed if the first user joined
			if (!state[lobbyId]) {

				const seed = Math.floor(Math.random() * 2147483648);
				return ({
					...state,
					[lobbyId]: {
						seed,
						players: [userId],
						[userId]: {
							gameover: false,
							randomizer: new Randomizer(seed),
							activeBlock: null,
							nextBlock: null,
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
						gameover: false,
						randomizer: new Randomizer(state[lobbyId].seed),
						activeBlock: null,
						nextBlock: null,
						static: newgrid(),
					}
				}
			});
		}
		case USER_LOGOUT:
		{
			const { senderId, lobbyId } = action.meta;

			const { [senderId]: removedUser, ...remainingUsers } = state[lobbyId];
			const players = state[lobbyId].players.filter(player => player !== senderId);

			return {
				...state,
				[lobbyId]: {
					players: players,
					...remainingUsers,
				}
			};
		}
		case DELETE_MATCH:
		{
			const { lobbyId } = action.payload;

			const { [lobbyId]: removed, ...rest } = state;

			return rest;
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
		/* -------------------------- */

		/* GRID actions */
		case TOSTATIC_BLOCK:
		{
			const { senderId, lobbyId } = action.meta;
			const userState = state[lobbyId][senderId];

			return ({
				...state,
				[lobbyId]: {
					...state[lobbyId],
					[senderId]: {
						...userState,
						activeBlock: null,
						static: ts(userState.activeBlock, userState.static)
					}
				}
			});
		}
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
						nextBlock: nb(blockType),
						activeBlock: userState.nextBlock,
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
		// case PENALITY_LINE:
		// {
		// 	const { senderId, lobbyId } = action.meta;
		// 	const { line } = action.payload;
		// 	const lobby = state[lobbyId];

		// 	// build state
		// 	const newState = lobby.players.map(playerId => {
		// 		if (playerId !== senderId)
		// 		{
		// 			const userState = lobby[playerId];
		// 			return {
		// 				[playerId]: {
		// 					...lobby[playerId],
		// 					static: pn(userState.static, line),
		// 				}
		// 			}
		// 		}
		// 		return { [playerId]: lobby[playerId] };
		// 	});

		// 	return ({
		// 		...state,
		// 		[lobbyId]: {
		// 			...state[lobbyId],
		// 			...newState,
		// 		}
		// 	});
		// }
		case PENALITY_LINE:
		{
			const { senderId, lobbyId } = action.meta;
			const { lines } = action.payload;
			const lobby = state[lobbyId];

			// build updated players object
			const updatedPlayers = lobby.players.reduce((acc, playerId) => {
				if (playerId !== senderId) {
					acc[playerId] = {
						...lobby[playerId],
						static: pn(lobby[playerId].static, lines),
					};
				} else {
					acc[playerId] = lobby[playerId];
				}
				return acc;
			}, {});

			return {
				...state,
				[lobbyId]: {
					...state[lobbyId],
					...updatedPlayers,
				},
			};
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