export const START_MATCH = 'tetris/startmatch';
export const DELETE_MATCH = 'tetris/deletematch';

import { newblock } from "../../tetris/actions/grid";

import { seedBlockType } from "../../tetris/blocks";

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

export const serverNewBlock = (userId) => {
	return (dispatch, getState) => {
			
		const state = getState();
		if (!state.users[userId])
			return ;

		const { lobbyId } = state.users[userId];
		const match = state.tetris[lobbyId];

		dispatch({
			...newblock(seedBlockType(match.seed, match[userId].blockNum)),
			meta: { reply:true, senderId:userId, lobbyId }
		});
	}
}

export const deletematch = (lobbyId) => {
	return (dispatch, getState) => {
		 const matchFound = getState().tetris[lobbyId];

    	if (!matchFound) return ;

		dispatch({
			type: DELETE_MATCH,
			payload: { lobbyId }
		});
	}
}