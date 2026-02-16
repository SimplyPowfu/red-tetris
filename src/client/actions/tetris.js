export const START_REQUEST = 'tetris/startrequest';
export const MOVE_PIECE = 'tetris/move';
export const GAME_OVER = 'tetris/gameover';
export const WIN_MATCH = 'tetris/winmatch';

// Execute game moves
export const move = (move) => {
	return {
		type: MOVE_PIECE,
		payload: { move },
		meta: { sendToServer:true }
	}
}

export const gameover = () => {
	return {
		type: GAME_OVER,
	}
}

export const winmatch = () => {
	return {
		type: WIN_MATCH,
	}
}

export const startmatch = () => {
	return (dispatch, getState) => {
		const state = getState();

		if (!state.lobby || !state.lobby.lobbyId)
			return ;

		dispatch({
			type: START_REQUEST,
			payload: { lobbyId: state.lobby.lobbyId },
			meta: { sendToServer: true }
		})
	}
}