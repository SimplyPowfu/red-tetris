
// Client imports
import { gameover } from '../../client/actions/tetris';

// Tetris imports
import { isValidPosition, checkLines } from '../../tetris/gridManip';
import { COLLAPSE_LINE, NEW_BLOCK, penality, PENALITY_LINE } from '../../tetris/actions/grid';

const moveConseq = store => next => action => {
	const state = store.getState();

	// If gameover, block actions
	if (action.type === NEW_BLOCK
		|| action.type === COLLAPSE_LINE)
	{
		const { senderId, lobbyId } = action.meta;
		const lobby = state.tetris[lobbyId];
		if (!lobby)
			return ;
		const match = lobby[senderId];
		if (!match || match.gameover)
			return ;
	}
	
	// Go forward in line
	const result = next(action);

	// before letting NEW_BLOCK trough, we check if the game ended
	if (action.type === COLLAPSE_LINE)
	{
		// get all data
		const { senderId, lobbyId } = action.meta;
		const match = state.tetris[lobbyId][senderId];

		const ret = checkLines(match.static) - 1;
		if (ret > 0) {
			store.dispatch({
				...penality(ret),
				meta: { lobbyCast:true, lobbyId, senderId, avoid:senderId }
			});
		}
	}
	/* GAMEOVER check */
	else if (action.type === PENALITY_LINE)
	{
		// get all data
		const { senderId, lobbyId } = action.meta;
		const { lines } = action.payload;
		const lobby = state.tetris[lobbyId];

		for (const playerId of lobby.players) {
			if (playerId === senderId) continue ;
			const match = lobby[playerId];
			if (match.gameover) continue ;
			if (!isValidPosition({ ...match.activeBlock, row: match.activeBlock.row + lines }, match.static)) {
				store.dispatch({
					...gameover(),
					meta: { reply:true, senderId:playerId }
				});
			}
		}
	}
	/* GAMEOVER check */
	else if (action.type === NEW_BLOCK)
	{
		// get all data
		const { senderId, lobbyId } = action.meta;
		const match = state.tetris[lobbyId][senderId];

		const newBlock = match.nextBlock;
		if (newBlock && !isValidPosition(newBlock, match.static)) {
			store.dispatch({
				...gameover(),
				meta: { reply:true, senderId }
			});
		}
	}

	return result;
}

export default moveConseq;