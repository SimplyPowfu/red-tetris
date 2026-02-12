import { START_MATCH } from '../../server/actions/tetris';

export const MOVE_PIECE = 'tetris/move';

// Execute game moves
export const move = (move) => {
	return {
		type: MOVE_PIECE,
		payload: { move },
		meta: { sendToServer:true }
	}
}

export const startmatch = () => {
	return (dispatch, getState) => {
		const state = getState();

		if (!state.lobby || !state.lobby.lobbyId)
			return ;

		dispatch({
			type: START_MATCH,
			payload: state.lobby,
			meta: { sendToServer: true }
		})
	}
}