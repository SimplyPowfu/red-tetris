export const START_REQUEST = 'tetris/startrequest';
export const READY_STATE = 'tetris/readystate';
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

export const startmatch = (map) => {
	return (dispatch, getState) => {
		const state = getState();

		if (!state.lobby || !state.lobby.lobbyId)
			return ;

		dispatch({
			type: START_REQUEST,
			payload: { lobbyId: state.lobby.lobbyId, map: map },
			meta: { sendToServer: true }
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
            meta: { sendToServer: true }
        });
    };
};