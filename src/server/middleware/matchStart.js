// Server imports
import { DELETE_LOBBY, START_MATCH, WIN_MATCH, seedNewBlock, startmatch } from '../actions/tetris';

// Client imports
import { GAME_OVER, MOVE_PIECE, START_REQUEST } from '../../client/actions/tetris';
import { USER_LOGOUT } from '../actions/auth';
import { newgrid } from '../../tetris/actions/grid';

// Tetris import

// Utils import
import * as intervals from '../collector';

// const intervals = {}; // store active intervals per player

const matchStart = store => next => action => {
	const state = store.getState();

	// dispatch a lobby update when the user logs in
	switch (action.type)
	{
		case START_REQUEST:
		{
			const { lobbyId } = action.meta;
			const match = state.tetris[lobbyId];
			
			console.log('[START] with players', match.players);
			console.log('[START] with ready', match.ready);

			if (match && !match.ingame && match.ready.length === match.players.length - 1)
				store.dispatch(startmatch(lobbyId));
			
			return ;
		}
		/* case START_MATCH:
		{
			const { lobbyId } = action.payload;
			const match = state.tetris[lobbyId];
			
			if (match === undefined)
				return ;

			// execute reducers so seedNewBlock() can access each user randomizer
			const result = next(action);


			match.players.forEach(playerId => {

				// produve new grid
				store.dispatch({
					...newgrid(),
					meta: { fromServer:true, reply:true, senderId:playerId }
				});

				// spawn first block
				store.dispatch(seedNewBlock(playerId, { reply:true, senderId:playerId }));
				store.dispatch(seedNewBlock(playerId, { reply:true, senderId:playerId }));

				// setInterval is lazy but I can handle it
				const interval = setInterval(() => {
					store.dispatch({
						type: MOVE_PIECE,
						payload: { move: 'Down' },
						meta: { fromServer:true, senderId: playerId, lobbyId, auto: true }
					});
				}, 1000);

				intervals.set(playerId, interval);
				intervals.subscribe(playerId, lobbyId);
			});

			return result;
		} */
	}
	return next(action);
}

export default matchStart;