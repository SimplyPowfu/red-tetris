import { SingleEntryPlugin } from 'webpack';
import { MOVE_PIECE } from '../../client/actions/tetris';
import { shiftdown, shiftleft, shiftright, rotate } from '../../tetris/actions/moves';

import { sd, rr, sl, sr, isValidPosition } from '../../tetris/gridManip';

// @move is the move ('Right', 'Left', 'Rotate', 'Down'),
// @active is the active grid
// @statik is the static grid
// checks if the move is valid
function isValidMove(move, activeBlock, statik)
{
	let newBlock;
	let ret;
	switch (move) {
		case 'Down':
			newBlock = sd(activeBlock);
			ret = shiftdown;
			break ;
		case 'Rotate':
			newBlock = rr(activeBlock);
			ret = rotate;
			break ;
		case 'Left':
			newBlock = sl(activeBlock);
			ret = shiftleft;
			break ;
		case 'Right':
			newBlock = sr(activeBlock);
			ret = shiftright;
			break ;
		default:
			newBlock = activeBlock
	}

	console.log(`Block '${move}'`, newBlock);

	if (!isValidPosition(newBlock, statik))
		return false;
	return ret;
}

const moveMiddleware = store => next => action => {
	if (action.type === MOVE_PIECE)
	{
		console.log('aaa');
		// check if inside a lobby
		const { senderId, lobbyId } = action.meta;
		if (!lobbyId)
			return ;

		console.log('bbb');

		const state = store.getState();
		const match = state.tetris[lobbyId][senderId];
		const { move } = action.payload;

		let ret = isValidMove(move, match.activeBlock, match.static);
		if (ret === false)
			return;
		
		console.log('move', ret);

		// maps the move the the correspoindig '../../tetris/ations/moves' and dispatch it
		store.dispatch({ ...ret(), meta: { reply:true, senderId } })
	}

	return next(action);
}

export default moveMiddleware;