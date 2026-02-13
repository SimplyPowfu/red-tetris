import { SingleEntryPlugin } from 'webpack';

// Server imports
import { deletematch, seedNewBlock, START_MATCH } from '../actions/tetris';

// Client imports
import { MOVE_PIECE, gameover } from '../../client/actions/tetris';

// Tetris imports
import { shiftdown, shiftleft, shiftright, rotate, megafall } from '../../tetris/actions/moves';
import { sd, rr, sl, sr, mf, isValidPosition, isValidSpawn, checkLines } from '../../tetris/gridManip';
import { collapse, COLLAPSE_LINE, NEW_BLOCK, penality, PENALITY_LINE } from '../../tetris/actions/grid';
import { produceBlock } from '../../tetris/blocks';

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
				seedNewBlock(senderId, { reply:true, senderId } ),
				{ ...collapse(), meta: { reply:true, senderId } }
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
					seedNewBlock(senderId, { reply:true, senderId } ),
					{ ...collapse(), meta: { reply:true, senderId } }
				]
			};
		}
		return { ok: false };
	}

	return { ok: true, action };
}

const moveMiddleware = store => next => action => {
	const state = store.getState();

	// If gameover, block actions
	if (action.type === NEW_BLOCK
		|| action.type === MOVE_PIECE)
	{
		const { senderId, lobbyId } = action.meta;
		const match = state.tetris[lobbyId][senderId];
		if (match.gameover)
			return ;
	}
	
	// before letting NEW_BLOCK trough, we check if the game ended
	if (action.type === COLLAPSE_LINE)
	{
		// get all data
		const { senderId, lobbyId } = action.meta;
		const match = state.tetris[lobbyId][senderId];

		if (checkLines(match.static) > 1)
			store.dispatch({
				...penality(),
				meta: { lobbyCast:true, lobbyId, senderId, avoid:senderId }
			});
	}
	/* GAMEOVER check */
	else if (action.type === PENALITY_LINE && !action.meta.avoid)
	{
		// get all data
		const { senderId, lobbyId } = action.meta;
		const match = state.tetris[lobbyId][senderId];

		if (!isValidPosition({ ...match.activeBlock, row: match.activeBlock.row + 1 }, match.static)) {
			store.dispatch({
				...gameover(),
				meta: { reply:true, senderId }
			});
			return ;
		}
	}
	/* GAMEOVER check */
	else if (action.type === NEW_BLOCK)
	{
		// get all data
		const { senderId, lobbyId } = action.meta;
		const { blockType } = action.payload;
		const match = state.tetris[lobbyId][senderId];

		const newBlock = produceBlock(blockType);
		if (!isValidSpawn(match.activeBlock, newBlock)
			|| !isValidPosition(newBlock, match.static)) {
			store.dispatch({
				...gameover(),
				meta: { reply:true, senderId }
			});
			return ;
		}
	}
	else if (action.type === MOVE_PIECE)
	{
		// get all data
		const { senderId, lobbyId } = action.meta;
		const match = state.tetris[lobbyId][senderId];
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

export default moveMiddleware;