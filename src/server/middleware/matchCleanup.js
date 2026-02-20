// Server imports
import { DELETE_LOBBY, END_MATCH, deletelobby } from '../actions/tetris';

// Client imports
import { GAME_OVER, } from '../../client/actions/tetris';
import { USER_LOGOUT } from '../actions/auth';


// Utils import
import * as intervals from '../collector';

const matchCleanup = store => next => action => {
	const state = store.getState();
	const result = next(action);

	// dispatch a lobby update when the user logs in
	switch (action.type)
	{
		case USER_LOGOUT:
		{
			const { lobbyId } = action.meta;
			const lobby = state.tetris[lobbyId];
			if (!lobby)
				break ;

			if (lobby.players.length === 1)
				store.dispatch(deletelobby(lobbyId));
		}
		case GAME_OVER:
		{
			const { senderId } = action.meta;
			intervals.delKey(senderId, clearInterval);

			console.log('[CLEANUP] cleared interval of player', senderId);
			console.log('[CLEANUP] after map', intervals.map());
			break ;
		}
		case END_MATCH:
		case DELETE_LOBBY:
		{
			const { lobbyId } = action.payload;
			intervals.delSub(lobbyId, clearInterval);
			
			console.log('[CLEANUP] cleared interval of lobby', lobbyId);
			console.log('[CLEANUP] after map', intervals.map());
			break;
		}
	}
	return result;
}

export default matchCleanup;