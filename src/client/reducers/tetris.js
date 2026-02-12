import {
	SHIFT_DOWN,
	SHIFT_LEFT,
	SHIFT_RIGHT,
	ROTATE,
} from '../../tetris/actions/moves'

import {
	NEW_GRID,
	NEW_BLOCK,
	TOSTATIC_BLOCK,
	COLLAPSE_LINE,
	PENALITY_LINE,
} from '../../tetris/actions/grid'

import { newgrid, ts, nb, cl, pn, sd, sl, sr, rr } from '../../tetris/gridManip'

const reducer = (state = {} , action) => {
  switch(action.type)
  {
	/* GRID actions */
	case NEW_GRID:
		return {
			activeBlock: null,
			static: newgrid(),
		}
	case TOSTATIC_BLOCK:
		return {
			...state,
			activeBlock: null,
			static: ts(state.activeBlock, state.static),
		}
	case NEW_BLOCK:
		const { blockType } = action.payload;
		if (!blockType) return state;
		return {
			...state,
			activeBlock: nb(blockType)
		}
	case COLLAPSE_LINE:
		const { line } = action.payload;
		if (!line) return state;
		return {
			...state,
			static: cl(state.static, line),
		}
	case PENALITY_LINE:
		return {
			...state,
			static: pn(state.static),
		}
	/* MOVE actions */
	case SHIFT_DOWN:
		return {
			...state,
			activeBlock: sd(state.activeBlock),
		}
	case SHIFT_LEFT:
		return {
			...state,
			activeBlock: sl(state.activeBlock),
		}
	case SHIFT_RIGHT:
		return {
			...state,
			activeBlock: sr(state.activeBlock),
		}
	case ROTATE:
		return {
			...state,
			activeBlock: rr(state.activeBlock),
		}
	default: 
	  return state
  }
}

export default reducer