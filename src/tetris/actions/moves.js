export const SHIFT_DOWN = 'tetris/shiftdown';
export const SHIFT_LEFT = 'tetris/shiftleft';
export const SHIFT_RIGHT = 'tetris/shiftright';
export const ROTATE = 'tetris/rotate';

/* actions to modify the game-state */

export const shiftdown = () => {
	return {
		type: SHIFT_DOWN,
	}
}

export const shiftleft = () => {
	return {
		type: SHIFT_LEFT,
	}
}

export const shiftright = () => {
	return {
		type: SHIFT_RIGHT,
	}
}

export const rotate = () => {
	return {
		type: ROTATE,
	}
}