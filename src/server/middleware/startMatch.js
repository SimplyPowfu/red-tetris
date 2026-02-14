// Server imports
import { DELETE_MATCH, START_MATCH, WIN_MATCH, seedNewBlock, startmatch } from '../actions/tetris';

// Client imports
import { GAME_OVER, MOVE_PIECE, START_REQUEST } from '../../client/actions/tetris';
import { USER_LOGOUT } from '../actions/auth';
import { newgrid } from '../../tetris/actions/grid';

// Tetris import

const intervals = {}; // store active intervals per player

const startMatch = store => next => action => {
	const state = store.getState();

	// dispatch a lobby update when the user logs in
	switch (action.type)
	{
		case START_REQUEST:
		{
			const { lobbyId } = action.meta;
			const match = state.tetris[lobbyId];
			
			if (match && !match.ingame)
				store.dispatch(startmatch(lobbyId));
			
			return ;
		}
		case START_MATCH:
		{
			const { lobbyId } = action.payload;
			const match = state.tetris[lobbyId];
			
			if (match === undefined)
				return ;

			// execute reducers so seedNewBlock() can access each user randomizer
			const result = next(action);

			// initialize lobby
			intervals[lobbyId] = {};

			match.players.forEach(playerId => {

				// produve new grid
				store.dispatch({
					...newgrid(),
					meta: { fromServer:true, reply:true, senderId:playerId }
				});

				// spawn first block
				store.dispatch(seedNewBlock(playerId, { reply:true, senderId:playerId }));
				store.dispatch(seedNewBlock(playerId, { reply:true, senderId:playerId }));

				// avoid creating duplicate intervals
				if (!intervals[lobbyId][playerId]) {
					intervals[lobbyId][playerId] = setInterval(() => {
						store.dispatch({
							type: MOVE_PIECE,
							payload: { move: 'Down' },
							meta: { fromServer:true, senderId: playerId, lobbyId, auto: true }
						});
					}, 1000);
				}
			});

			return result;
		}
		case GAME_OVER:
		case USER_LOGOUT:
		{
			const { senderId } = action.meta;
			clearInterval(intervals[senderId]);
			delete intervals[senderId];
			break ;
		}
		case WIN_MATCH:
		case DELETE_MATCH:
		{
			const { lobbyId } = action.payload;
		
			Object.values(intervals[lobbyId]).forEach(clearInterval);
			Object.keys(intervals[lobbyId]).forEach(key => delete intervals[lobbyId][key]);
			break;
		}
	}
	return next(action);
}

export default startMatch;