// Server imports
import { seedNewBlock } from '../actions/tetris';

// Client imports
import { MOVE_PIECE } from '../../client/actions/tetris';

// Tetris imports
import { shiftdown, shiftleft, shiftright, rotate, megafall } from '../../tetris/actions/moves';
import { sd, rr, sl, sr, mf, isValidPosition } from '../../tetris/gridManip';
import { collapse, tostatic } from '../../tetris/actions/grid';

// @move is the move ('Right', 'Left', 'Rotate', 'Down'),
// @active is the active grid
// @statik is the static grid
// checks if the move is valid
function isValidMove(move, activeBlock, statik, senderId)
{
	let newBlock;
	let action;

	switch (move) {
		case 'Down':
			newBlock = sd(activeBlock);
			action = shiftdown();
			break ;
		case 'Rotate':
			newBlock = rr(activeBlock);
			action = rotate();
			break ;
		case 'Left':
			newBlock = sl(activeBlock);
			action = shiftleft();
			break ;
		case 'Right':
			newBlock = sr(activeBlock);
			action = shiftright();
			break ;
		case 'Mega':
			newBlock = mf(activeBlock, statik);
			action = [
				{ ...megafall(), meta: { reply:true, senderId } },
				{ ...tostatic(), meta: { reply:true, senderId } },
				{ ...collapse(), meta: { reply:true, senderId } },
				seedNewBlock(senderId, { reply:true, senderId } ),
			];
			break ;
		default:
			return { ok: false };
	}
	console.log('[Move] valid', move, newBlock.row);
	const valid = isValidPosition(newBlock, statik);

	// If the action was down and it's not valid, send tostatic
	if (valid === false) {
		if (move === 'Down') {
			return {
				ok: true,
				action: [
					{ ...tostatic(), meta: { reply:true, senderId } },
					{ ...collapse(), meta: { reply:true, senderId } },
					seedNewBlock(senderId, { reply:true, senderId } ),
				]
			};
		}
		return { ok: false };
	}

	return { ok: true, action };
}

const moveValidation = store => next => action => {
	const state = store.getState();
	
	if (action.type === MOVE_PIECE)
	{

		// get all data
		const { senderId, lobbyId } = action.meta;
		const lobby = state.tetris[lobbyId];
		if (!lobby)
			return ;
		const match = lobby[senderId];
		if (!match)
			return ;

		// check if Gameover
		if (match.gameover || !match.activeBlock)
			return ;

		// Get the move
		const { move } = action.payload;

		const result = isValidMove(move, match.activeBlock, match.static, senderId);
		
		if (result.ok === false) {
			console.log('[Move] INVALID', move);
			return ;
		}
		
		// maps the move the the correspoindig '../../tetris/ations/moves' and dispatch it
		if (result.ok === true) {

			console.log('[Move] VALID', result.action);
		
			if (Array.isArray(result.action)) {
				// dispatch all action
				result.action.forEach(action => {
					store.dispatch(action);
				});
			} else {
				store.dispatch({
					...result.action,
					meta: { reply: true, senderId }
				});
			}
			return ;
		}
	}

	return next(action);
}

export default moveValidation;