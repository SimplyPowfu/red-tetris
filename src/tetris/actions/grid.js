export const NEW_GRID = 'tetris/newgrid';
export const NEW_BLOCK = 'tetris/newblock';
export const COLLAPSE_LINE = 'tetris/collapse';
export const TOSTATIC_BLOCK = 'tetris/tostatic';
export const PENALITY_LINE = 'tetris/penality';

/* actions to modify the game-state */
export const newgrid = () => {
	return {
		type: NEW_GRID,
	}
}

// to be called in the server (maybe review)
export const newblock = (blockType) => {
	return ({
		type: NEW_BLOCK,
		payload: { blockType },
	});
}

export const collapse = () => {
	return {
		type: COLLAPSE_LINE,
	}
}

export const tostatic = () => {
	return {
		type: TOSTATIC_BLOCK,
	}
}

export const penality = (lines) => {
	return {
		type: PENALITY_LINE,
		payload: { lines }
	}
}