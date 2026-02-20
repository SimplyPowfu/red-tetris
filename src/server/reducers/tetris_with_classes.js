import {
	START_MATCH,
	DELETE_LOBBY,
	WIN_MATCH,
	END_MATCH
} from '../actions/tetris';

import { USER_LOGIN, USER_LOGOUT } from '../actions/auth';

const TOSTATIC_SCORE = 100;

// Tetris imports
import { newgrid, nb, cl, ts, pn, sd, sl, sr, rr, mf } from '../../tetris/gridManip';
import { COLLAPSE_LINE,PENALITY_LINE, NEW_BLOCK, TOSTATIC_BLOCK } from '../../tetris/actions/grid';
import { SHIFT_DOWN, SHIFT_LEFT, SHIFT_RIGHT, ROTATE, MEGA_FALL } from '../../tetris/actions/moves';
import { GAME_OVER, MOVE_PIECE, READY_STATE, START_REQUEST, gameover } from '../../client/actions/tetris';
import { Randomizer } from '../../tetris/Randomizer';
import { checkLines, calculateScore } from '../../tetris/gridManip';

// Class imports
import Game from '../classes/Game';
import Lobby from '../classes/Lobby';

const reducer = (state = {}, action) => {
	switch(action.type)
	{
		/* REVIEW */
		/* ===== MATCH management operations ===== */
		case USER_LOGIN:
		{
			const { userId, lobbyId } = action.payload
			
			// add the seed if the first user joined
			if (!state[lobbyId])
				{

				const lobby = new Lobby(lobbyId);
				lobby.join(userId);

				return ({
					...state,
					[lobbyId]: lobby
				});
			}

			// add the new user
			const lobby = state[lobbyId];
			lobby.join(userId);

			return state;
			// return ({
			// 	...state,
			// 	[lobbyId]: lobby,
			// });
		}
		case USER_LOGOUT:
		{
			const { senderId, lobbyId } = action.meta;

			if (!state[lobbyId])
				return state;

			const lobby = state[lobbyId];
			lobby.leave(senderId);

			return state;
			// return ({
			// 	...state,
			// 	[lobbyId]: lobby,
			// });
		}
		case READY_STATE:
		{
			const { senderId, lobbyId } = action.meta;
			if (!state[lobbyId])
				return state;

			console.log('[TETRIS]', action.payload.ready);

			const lobby = state[lobbyId];
			lobby.setready(senderId);

			return state;
			// return ({
			// 	...state,
			// 	[lobbyId]: lobby,
			// });
		}
		case START_REQUEST:
		{
			const { lobbyId } = action.payload;
			const lobby = state[lobbyId];
			lobby.startmatch();
			
			return state;
			// return ({
			// 	...state,
			// 	[lobbyId]: lobby,
			// });
			
		}
		case DELETE_LOBBY:
		{
			const { lobbyId } = action.payload;

			const { [lobbyId]: removed, ...rest } = state;

			return rest;
		}
		/* ingame inputs */
		case MOVE_PIECE:
		{
			const { senderId, lobbyId } = action.meta;
			const { move } = action.payload;
			if (!state[lobbyId])
				return state;
			const match = state[lobbyId].game[senderId];
			if (!match)
				return state;
			match.move(move, true);

			return state;
		}
		/* case GAME_OVER:
		{
			const { senderId, lobbyId } = action.meta;
			const lobby = state[lobbyId];
			lobby.gameover(senderId);
			
			return ({
				...state,
				[lobbyId]: lobby,
			});
		} */
		/* case END_MATCH:
		{
			const { lobbyId } = action.payload;
			const lobby = state[lobbyId];
			lobby.endmatch();
			
			return ({
				...state,
				[lobbyId]: lobby,
			});
		} */
		/* -------------------------- */

		/* GRID actions */
		/* case TOSTATIC_BLOCK:
		{
			const { senderId, lobbyId } = action.meta;
			const lobby = state[lobbyId];
			const player = lobby[senderId];
			player.tostatic();

			return ({
				...state,
				[lobbyId]: lobby,
			});
		}
		case NEW_BLOCK:
		{
			const { blockType } = action.payload;
			const { senderId, lobbyId } = action.meta;
			const lobby = state[lobbyId];
			const player = lobby[senderId];
			player.newblock(blockType);

			return ({
				...state,
				[lobbyId]: lobby,
			});
		}
		case COLLAPSE_LINE:
		{
			const { senderId, lobbyId } = action.meta;
			const lobby = state[lobbyId];
			const player = lobby[senderId];
			player.collapse();

			return ({
				...state,
				[lobbyId]: lobby,
			});
		} */
		/* case PENALITY_LINE:
		{
			const { senderId, lobbyId } = action.meta;
			const { lines } = action.payload;
			const lobby = state[lobbyId];

			// build updated players object
			const updatedPlayers = lobby.players.reduce((acc, playerId) => {
				if (playerId !== senderId && !lobby[playerId].gameover) {
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
		// MOVE actions
		case SHIFT_DOWN:
		{
			const { senderId, lobbyId } = action.meta;
			const userState = state[lobbyId][senderId];
			const newScore = action.meta.manual ? userState.score + 1 : userState.score;
			console.log('actionSSSzzz', action.meta.manual, newScore);

			return ({
				...state,
				[lobbyId]: {
					...state[lobbyId],
					[senderId]: {
						...userState,
						activeBlock: sd(userState.activeBlock),
						score: newScore,
					}
				}
			});
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
			console.log('[TETRIS]', action);
			const { senderId, lobbyId } = action.meta;
			const userState = state[lobbyId][senderId];

			return ({
				...state,
				[lobbyId]: {
					...state[lobbyId],
					[senderId]: {
						...userState,
						activeBlock: mf(userState.activeBlock, userState.static),
						score: userState.score + 10,
					}
				}
			});
		} */
		default:
			return state;
	}
};

export default reducer;