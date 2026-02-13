export const SHIFT_DOWN = 'tetris/shiftdown';
export const SHIFT_LEFT = 'tetris/shiftleft';
export const SHIFT_RIGHT = 'tetris/shiftright';
export const ROTATE = 'tetris/rotate';
export const MEGA_FALL = 'tetris/mega';

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

export const megafall = () => {
	return {
		type: MEGA_FALL,
	}
}