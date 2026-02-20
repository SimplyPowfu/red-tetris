
// Actions imports
import { shiftdown, shiftleft, shiftright, rotate, megafall } from '../../tetris/actions/moves';
import { collapse, tostatic, shot, newblock, NEW_GRID } from '../../tetris/actions/grid';

// Tetris imports
import { newgrid, nb, cl, ts, pn, sd, sl, sr, rr, mf, st } from '../../tetris/gridManip';
import { calculateScore, checkLines, isValidPosition } from '../../tetris/gridManip';

// Class import
import { DISPATCH, GAMEOVER, PENALITY } from './Game';

const SHIFT_DOWN_SCORE = 1;
const MEGA_FALL_SCORE = 10;

export class Player
{
	_gameover = false;
	_score = 0;
	_level = 0;
	_randomizer = null;

	/* game elements */
	_activeBlock = null;
	_nextBlock = null;
	_static = null;

	/* personal clock */
	_schedule = null;
	_interval = null;
	_timeouts = Array.from({ length:10 });

	/* comunicate to partent */
	_complain = null;

	constructor(__randomizer, __grid, __schedule, __complain) {
		this._randomizer = __randomizer;
		this._static = __grid ? newgrid(__grid) : __grid;
		this._schedule = __schedule;
		this._complain = __complain;

		/* spawn the first 2 blocks */
		this._complain({
			type: DISPATCH,
			payload: {
				type: NEW_GRID,
				payload: { gridtype: __grid },
				meta: { reply:true }
			}
		});
		this.newblock();
		this.newblock();

		// console.log('[PLAYER] static', this._static);
	}

	get static() {
		return this._static;
	}
	get gameover() {
		return this._gameover;
	}
	get score() {
		return this._score;
	}	

	/* Scheduled forwards */
	execShedule() {
		if (this._gameover === true || this._activeBlock === null)
			return ;

		if (this._interval) {
			this.clearSchedule();
		}

		console.log('[PLAYER] executing schedule', this._schedule);

		const { tickMs } = this._schedule;

		this._interval = setInterval(() => {
			for (const k in this._schedule) {
				console.log('k', k);
				const kNum = Number(k);
				if (!isNaN(kNum)) {
					console.log('[PLAYER] about to timeout', k);

					/* execute the single schedule action */
					this._timeouts[kNum] = setTimeout(() => {
						/* check if active block present */
						if (this._activeBlock === null) {
							clearInterval(this._interval);
							return ;
						}
						this.move(this._schedule[k], true);
					}, k * tickMs);
				}
			}
		}, 10 * tickMs);
	}

	clearSchedule() {
		for (const t of this._timeouts) {
			clearTimeout(t);
		}
		this._timeouts = Array.from({ length:10 });
		clearInterval(this._interval);
	}

	/* Player inputs */
	move(move, auto) {

		console.log('[PLAYER] moving', move);

		let newBlock = this._activeBlock,
			newStatic = this._static,
			action;
		switch (move) {
			case 'Down':
				newBlock = sd(this._activeBlock);
				action = () => this.shiftdown(auto ? true : false);
				break ;
			case 'Left':
				newBlock = sl(this._activeBlock);
				action = () => this.shiftleft();
				break ;
			case 'Right':
				newBlock = sr(this._activeBlock);
				action = () => this.shiftright();
				break ;
			case 'Rotate':
				newBlock = rr(this._activeBlock);
				action = () => this.rotate();
				break ;
			case 'Mega':
				newBlock = mf(this._activeBlock, this._static);
				action = () => {
					this.megafall();
					this.tostatic();
					this.collapse();
					this.newblock();
				}
				break ;
			case 'Shot':
				newStatic = st(this._static);
				action = () => this.shot();
				break ;
			default:
				console.ward('[PLAYER] invalid move', move);
		}

		/* validate move */
		if (!isValidPosition(newBlock, newStatic))
		{
			console.log('invalid move??', move);
			if (move === 'Down') {
				this.tostatic();
				this.collapse();
				this.newblock();
				return ;
			}
		}
		else
		{
			action();
		}

	}

	/* GAME METHODS */
	newblock() {
		const blockType = this._randomizer.next();

		this._activeBlock = this._nextBlock;
		this._nextBlock = nb(blockType);
		
		// send to client
		this._complain({
			type: DISPATCH,
			payload: {
				...newblock(blockType),
				meta: { reply:true }
			}
		});
		/* ! ! ! VALIDITY CHECK ! ! ! */
		if (this._activeBlock && !isValidPosition(this._activeBlock, this._static)) {
			this.endgame();
			return ;
		}
		/* loop stuff */
		this.execShedule();
	}

	penality(lines) {

		/* ! ! ! VALIDITY CHECK ! ! ! */
		const newStatic = pn(this._static, lines);
		if (!isValidPosition(this._activeBlock, newStatic)) {
			this.endgame();
			return ;
		}

		this._static = pn(this._static, lines);
	}

	collapse() {
		const collapsed = checkLines(this._static);

		// Dispatch the penality
		if (collapsed > 1) {
			this._complain({
				type: PENALITY,
				payload: { lines:collapsed - 1 }
			});
		}

		this._score += calculateScore(collapsed, Math.floor(this._level / 10));
		this._level += collapsed;
		this._static = cl(this._static);

		// send to client
		this._complain({
			type: DISPATCH,
			payload: {
				...collapse(),
				meta: { reply:true }
			}
		});
	}

	tostatic() {
		this._static = ts(this._activeBlock, this._static);
		this._activeBlock = null;
		
		// send to client
		this._complain({
			type: DISPATCH,
			payload: {
				...tostatic(),
				meta: { reply:true }
			}
		});
	}

	shot() {
		this._static = st(this._static);
		this._complain({
			type: DISPATCH,
			payload: {
				...shot(),
				meta: { reply:true }
			}
		});
	}

	shiftdown(auto) {
		if (!this._activeBlock) return ;
	
		this._activeBlock = sd(this._activeBlock);
		if (!auto) this._score += SHIFT_DOWN_SCORE;

		// send to client
		this._complain({
			type: DISPATCH,
			payload: {
				...shiftdown(),
				meta: { reply:true }
			}
		});
	}

	shiftleft() {
		if (!this._activeBlock) return ;
	
		this._activeBlock = sl(this._activeBlock);

		// send to client
		this._complain({
			type: DISPATCH,
			payload: {
				...shiftleft(),
				meta: { reply:true }
			}
		});
	}

	shiftright() {
		if (!this._activeBlock) return ;
	
		this._activeBlock = sr(this._activeBlock);

		// send to client
		this._complain({
			type: DISPATCH,
			payload: {
				...shiftright(),
				meta: { reply:true }
			}
		});
	}

	rotate() {
		if (!this._activeBlock) return ;
	
		this._activeBlock = rr(this._activeBlock);

		// send to client
		this._complain({
			type: DISPATCH,
			payload: {
				...rotate(),
				meta: { reply:true }
			}
		});
	}

	megafall() {
		if (!this._activeBlock) return ;
	
		this._activeBlock = mf(this._activeBlock, this._static);
		this._score += MEGA_FALL_SCORE;

		// send to client
		this._complain({
			type: DISPATCH,
			payload: {
				...megafall(),
				meta: { reply:true }
			}
		});
	}

	/* STATUS METHODS */

	endgame() {
		// set player to gameover
		this._gameover = true;
		this.clearSchedule();

		// complain gamover action
		if (this._complain) {
			this._complain({
				type: GAMEOVER,
			});
		}
	}

	delete() {
		/* loop stuff */
		this.clearSchedule();
	}
}