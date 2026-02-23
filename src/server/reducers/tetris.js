import {
	DELETE_LOBBY,
} from '../actions/tetris';

import { USER_LOGIN, USER_LOGOUT } from '../actions/auth';

// Tetris imports
import { newgrid, nb, cl, ts, pn, sd, sl, sr, rr, mf } from '../../tetris/gridManip';
import { COLLAPSE_LINE,PENALITY_LINE, NEW_BLOCK, TOSTATIC_BLOCK } from '../../tetris/actions/grid';
import { SHIFT_DOWN, SHIFT_LEFT, SHIFT_RIGHT, ROTATE, MEGA_FALL } from '../../tetris/actions/moves';
import { GAME_OVER, MOVE_PIECE, READY_STATE, START_REQUEST, gameover } from '../../client/actions/tetris';
import { Randomizer } from '../../tetris/Randomizer';
import { checkLines, calculateScore } from '../../tetris/gridManip';

// Class imports
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
		}
		case USER_LOGOUT:
		{
			const { senderId, lobbyId } = action.meta;

			if (!state[lobbyId])
				return state;

			const lobby = state[lobbyId];
			lobby.leave(senderId);

			return state;
		}
		case READY_STATE:
		{
			const { senderId, lobbyId } = action.meta;
			if (!state[lobbyId])
				return state;

			// console.log('[TETRIS]', action.payload.ready);

			const lobby = state[lobbyId];
			lobby.setready(senderId);

			return state;
		}
		case START_REQUEST:
		{
			const { lobbyId, map } = action.payload;

			if (!state[lobbyId])
				return state;

			console.log('[START_REQ] map', map);
			
			const lobby = state[lobbyId];
			lobby.startmatch(map);
			
			return state;			
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

			// check lobby
			if (!state[lobbyId] || !state[lobbyId].ingame)
				return state;

			// check match
			if (!state[lobbyId].game[senderId])
				return state;
			
			const match = state[lobbyId].game[senderId];
			match.move(move);

			return state;
		}
		default:
			return state;
	}
};

export default reducer;