export const START_REQUEST = 'server/startrequest';
export const READY_STATE = 'server/readystate';
export const MOVE_PIECE = 'server/move';
export const GAME_OVER = 'tetris/gameover';
export const WIN_MATCH = 'tetris/winmatch';
// export const TETRIS_SCORE = 'tetris/score';
export const TETRIS_CONFLICT = 'tetris/conflict';

// Execute game moves
export const move = (move) => {
	return {
		type: MOVE_PIECE,
		payload: { move },
	}
}

/* export const score = (score) => {
	return {
		type: TETRIS_SCORE,
		payload: { score },
	}
} */

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

export const startmatch = (map) => {
	return (dispatch, getState) => {
		const state = getState();

		if (!state.lobby || !state.lobby.lobbyId) {
			dispatch({
				type: TETRIS_CONFLICT,
			});
			return ;
		}

		dispatch({
			type: START_REQUEST,
			payload: { lobbyId: state.lobby.lobbyId, map: map },
		})
	}
}

export const readystate = () => {
    return (dispatch, getState) => {
        const state = getState();

        if (!state.lobby || !state.lobby.lobbyId)
            return;

        const currentReadyState = state.user.ready;

        dispatch({
            type: READY_STATE,
            payload: { 
                lobbyId: state.lobby.lobbyId,
				username: state.user.username,
                ready: !currentReadyState
            },
        });
    };
};