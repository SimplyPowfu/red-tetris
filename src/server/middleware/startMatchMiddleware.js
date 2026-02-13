// Server imports
import { DELETE_MATCH, START_MATCH, seedNewBlock } from '../actions/tetris';

// Client imports
import { MOVE_PIECE } from '../../client/actions/tetris';
import { USER_LOGOUT } from '../actions/auth';

// Tetris import

const intervals = {}; // store active intervals per player

const startMatch = store => next => action => {
	const result = next(action); // reducer runs here
	const state = store.getState();

	// dispatch a lobby update when the user logs in
	switch (action.type)
	{
		case START_MATCH:
		{
			const { lobbyId } = action.meta;
			const match = state.tetris[lobbyId];
			
			if (match === undefined)
				return ;

			match.players.forEach(playerId => {

				// spawn first block
				store.dispatch(seedNewBlock(playerId, { reply:true, senderId:playerId }));

				// avoid creating duplicate intervals
				// if (!intervals[playerId]) {
				// 	intervals[playerId] = setInterval(() => {
				// 		store.dispatch({
				// 			type: MOVE_PIECE,
				// 			payload: { move: 'Down' },
				// 			meta: { senderId: playerId, auto: true }
				// 		});
				// 	}, 1000);
				// }
			});

			break ;
		}
		case USER_LOGOUT:
		{
			const { senderId } = action.payload;
			clearInterval(intervals[senderId]);
			delete intervals[senderId];
		}
		case DELETE_MATCH:
		{
			Object.values(intervals).forEach(clearInterval);
			Object.keys(intervals).forEach(key => delete intervals[key]);
			break;
		}
	}
	return result;
}

export default startMatch;