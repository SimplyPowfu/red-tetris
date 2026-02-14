export const START_MATCH = 'tetris/startmatch';
export const DELETE_MATCH = 'tetris/deletematch';
export const WIN_MATCH = 'tetris/winmatch';

import { newblock } from "../../tetris/actions/grid";

export const startmatch = (lobbyId) => {
	return (dispatch, getState) => {
		 const matchFound = getState().tetris[lobbyId];

    	if (!matchFound) return ;

		dispatch({
			type: START_MATCH,
			payload: { lobbyId, players: lobbyFound.players }
		});
	}
}

export const seedNewBlock = (userId, meta) => {
	return (dispatch, getState) => {
			
		const state = getState();
		if (!state.users[userId])
			return ;

		const { lobbyId } = state.users[userId];
		const lobby = state.tetris[lobbyId];

		dispatch({
			...newblock(lobby[userId].randomizer.next()),
			meta,
		});
	}
}

export const winmatch = (lobbyId, userId) => {
	return (dispatch, getState) => {
		const state = getState();

		const lobbyFound = state.tetris[lobbyId];
    	if (!lobbyFound) return ;

		const user = state.users[userId];
		if (!user)
			return ;

		dispatch({
			type: WIN_MATCH,
			payload: { lobbyId, username:user.username },
			meta: { lobbyCast:true, lobbyId, fromServer:true }
		});
	}
}

export const deletematch = (lobbyId) => {
	return (dispatch, getState) => {
		 const lobbyFound = getState().tetris[lobbyId];

    	if (!lobbyFound) return ;

		dispatch({
			type: DELETE_MATCH,
			payload: { lobbyId },
			meta: { fromServer:true }
		});
	}
}