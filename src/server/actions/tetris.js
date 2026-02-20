export const START_MATCH = 'tetris/startmatch';
export const DELETE_LOBBY = 'tetris/deletelobby';
export const WIN_MATCH = 'tetris/winmatch';
export const END_MATCH = 'tetris/endmatch';

import { newblock } from "../../tetris/actions/grid";

export const startmatch = (lobbyId, map) => {
	return (dispatch, getState) => {
		const lobbyFound = getState().tetris[lobbyId];

    	if (!lobbyFound) return ;

		dispatch({
			type: START_MATCH,
			payload: { lobbyId, players: lobbyFound.players, map: map },
			meta: { fromServer:true }
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
			meta: { ...meta, lobbyId, fromServer:true }
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
			meta: { fromServer:true, lobbyCast:true, lobbyId }
		});
	}
}

export const endmatch = (lobbyId) => {
	return (dispatch, getState) => {
		const state = getState();

		const lobbyFound = state.tetris[lobbyId];
    	if (!lobbyFound) return ;

		dispatch({
			type: END_MATCH,
			payload: { lobbyId },
			meta: { fromServer:true, lobbyId }
		});
	}
}

export const deletelobby = (lobbyId) => {
	return (dispatch, getState) => {
		 const lobbyFound = getState().tetris[lobbyId];

    	if (!lobbyFound) return ;

		dispatch({
			type: DELETE_LOBBY,
			payload: { lobbyId },
			meta: { fromServer:true }
		});
	}
}