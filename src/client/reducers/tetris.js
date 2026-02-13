import {
	SHIFT_DOWN,
	SHIFT_LEFT,
	SHIFT_RIGHT,
	ROTATE,
	MEGA_FALL,
} from '../../tetris/actions/moves'

import {
	NEW_GRID,
	NEW_BLOCK,
	COLLAPSE_LINE,
	PENALITY_LINE,
	TOSTATIC_BLOCK,
} from '../../tetris/actions/grid'

import { newgrid, ts, nb, cl, pn, sd, sl, sr, rr, mf } from '../../tetris/gridManip'
import { GAME_OVER } from '../actions/tetris'
import { LOGIN_REPLY } from '../actions/auth'

const reducer = (state = {} , action) => {
  switch(action.type)
  {
	/* STATE actions */
	case GAME_OVER:
	{
		return {
			...state,
			gameover:true,
		}
	}
	/* GRID actions */
	case NEW_GRID:
	case LOGIN_REPLY:
		return {
			nextBlock: null,
			activeBlock: null,
			static: newgrid(),
		}
	case NEW_BLOCK:
	{
		if (!action.payload.blockType)
			return state;

		const { blockType } = action.payload;
		return {
			...state,
			nextBlock: nb(blockType),
			activeBlock: state.nextBlock,
		}
	}
	case COLLAPSE_LINE:
		return {
			...state,
			static: cl(state.static),
		}
	case TOSTATIC_BLOCK:
		return {
			...state,
			activeBlock: null,
			static: ts(state.activeBlock, state.static),
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
	case MEGA_FALL:
		return {
			...state,
			activeBlock: mf(state.activeBlock, state.static),
	}
	default: 
	  return state
  }
}

export default reducer