import type { Cell, MapType } from "../types/MapType.js"
import { newgrid, COLUMNS_NUMBER, ROWS_NUMBER } from "../types/MapType.js";
// import type { PieceType, Shape } from "../types/PieceType.js";
import Piece from "./Piece.js"
import { Randomizer } from "./Randomizer.js";

import type { GameMode, LoopSchedule, GameModeKey } from "../types/GameMode.js";
import modes from "../types/GameMode.js";

export const SHIFT_DOWN_SCORE = 1;
export const MEGA_FALL_SCORE = 10;

const lineScores = [0, 40, 100, 300, 1200] as const;

export type BoardEvent = "tick" | "gameover" | "newblock" | "penality" | "update";

type BoardEventListener = (event:BoardEvent, payload?:any) => void;

class Board
{
	// mechanics
	private _grid:MapType;
	private _activePiece:Piece | null = null;
	private _nextPiece:Piece | null = null;
	
	// state
	private _gameover:boolean = false;
	private _score:number = 0;
	private _collapsed:number = 0;

	// Randomize pieces
	private _randomizer:Randomizer;

	// Event listener for events to comunicate to client
	private _el:BoardEventListener;

	// personal clock
	private _schedule:LoopSchedule;
	private _interval:NodeJS.Timeout | null = null;
	private _timeouts:NodeJS.Timeout[] = Array.from({ length:10 });

	// lifecycle
	private _destroyed:boolean = false;

	constructor(__mode:GameModeKey, __seed:number, __el:BoardEventListener) {
		this._el = __el;
		
		// seed the randomizer
		this._randomizer = new Randomizer(__seed);

		// setup gamemode
		this._grid = newgrid(__mode);
		this._schedule = modes[__mode].loopSchedule;
	}

	public get gameover() {
		return this._gameover;
	}

	public get grid() {
		return this._grid;
	}

	public get activePiece() {
		return this._activePiece;
	}

	public get score() {
		return this._score;
	}

	// delete everyithing needs to be deleted
	public destroy() {
		this.clearSchedule();
		this._destroyed = true;
	}

	// Check if the activePiece position is valid
	static validCheck(__grid:MapType, __activePiece:Piece) {
		const piece = __activePiece;

		if (piece === null)
			return true;

		const { shape, row, column } = piece;

		if (!shape || !shape.entries()) {
			console.warn('[Board Class] invalid Piece');
			return false;
		}

		for (const [i, shapeRow] of shape.entries()) {
			for (const [j, cell] of shapeRow.entries()) {
				if (!cell) continue;
		
				const r = row + i;
				const c = column + j;
		
				const outside =
					c < 0 || c >= COLUMNS_NUMBER || r >= ROWS_NUMBER;
		
				const blocked =
					r >= 0 && __grid[r] && __grid[r][c] !== null;
		
				if (outside || blocked) return false;
			}
		}
		
		return true;
	}

	// Check if the activePiece position is valid
	private isBoardValid(__testPiece?:Piece) {
		const piece = __testPiece ? __testPiece : this._activePiece;
		if (piece === null) return true;
		return Board.validCheck(this._grid, piece);
	}

	private calcScore(removed:number): number {
		if (removed < 0) return 0;
		if (removed > 4) removed = 4;
		return lineScores[removed]! * (Math.floor(this._collapsed / 10) + 1);
	}

	/* =================================== */
	/* =========== SERVER SIDE =========== */
	/* =================================== */

	//-------------------------------------
	/* 				MAIN-LOOP			 */
	/* Scheduled forwards */
	private execShedule() {
		if (this.gameover === true) return ;

		const { tickMs } = this._schedule;

		for (const k in this._schedule) {
			const kNum = Number(k);
			if (!isNaN(kNum)) {

				/* execute the single schedule action */
				this._timeouts[kNum] = setTimeout(() => {
					/* check if active block present */
					if (this._activePiece === null) {
						return ;
					}

					{
						// tell the client this is a tick move
						this._el("tick", { move:this._schedule[k] });
						// exec the move locally
						const { after} = this.move(this._schedule[k], true);
						// call the aftermath
						after?.();
					}

				}, kNum * tickMs);
			}
		}
	}

	private loopSchedule()
	{
		if (this._gameover === true || this._activePiece === null)
			return ;

		if (this._interval) {
			this.clearSchedule();
		}

		const { tickMs } = this._schedule;

		// First exec
		this.execShedule();

		// Loop exec
		this._interval = setInterval(() => {
			if (this._gameover === true) {
				this.clearSchedule();
				return ;
			}
			this.execShedule();
		}, 10 * tickMs);
	}

	private clearSchedule() {
		for (const t of this._timeouts) {
			clearTimeout(t);
		}
		this._timeouts = Array.from({ length:10 });
		if (this._interval) clearInterval(this._interval);
	}

	/* --- BOARD ACTIONS --- */
	/*	The prototype of each action is () => boolean.
		Successfull actions return true, so that the client
		can be notified.

		"Response" actions are action performed by the client.
		"Consequence" actions are actions that should be performed after certain actions.
		(most 'conseq' actions return false)
	*/

	// since it's used multiple times i wrote a function for it
	private collapseCallback(score:number) {
		return (lines:number) => {

			// send penality
			if (lines > 1) this._el("penality", { lines:lines - 1 });
	
			// update score
			this._score += score;
			this._score += this.calcScore(lines);

			// add to collapsed counter
			this._collapsed += lines;
		}
	}

	/* >Responses */

	private shiftdown(auto:boolean): boolean {
		const ret = Board.sd(this._grid, this._activePiece, this.collapseCallback(auto ? 0 : SHIFT_DOWN_SCORE));

		if (ret === true) {
			this._score += auto ? 0 : SHIFT_DOWN_SCORE;
		}

		return ret;
	}

	private shiftleft(): boolean {
		return Board.sl(this.grid, this._activePiece);
	}

	private shiftright(): boolean {
		return Board.sr(this.grid, this._activePiece);
	}

	private rotate(): boolean {
		return Board.rr(this._grid, this._activePiece);
	}

	private megafall(): boolean {
		const ret = Board.mf(this._grid, this._activePiece, this.collapseCallback(MEGA_FALL_SCORE));

		return ret;
	}

	/* >Consequences */

	// Automate piece production
	private newblock(): boolean {
		this._activePiece = this._nextPiece;
		this._nextPiece = new Piece(this._randomizer.next());
		this._el("newblock", { type:this._nextPiece.type });

		// Game Over check
		if (this.isBoardValid() === false) {
			this.setGameover();
		}

		return false;
	}

	private collapse(): boolean {
		const ret = Board.cl(this._grid, this.collapseCallback(0));
		return false;
	}

	private tostatic(): boolean {
		return Board.ts(this._grid, this._activePiece);
	}

	private penality(__lines:number): boolean {
		const ret = Board.pn(this._grid, __lines);

		// send the board
		this._el("update", { score:this.score, board:this.grid });

		// Game Over check
		if (this.isBoardValid() === false) {
			this.setGameover();
		}

		return ret;
	}

	//-------------------------------------

	/* launches the board tick-cycle and the
	startup actions required */
	public start(__el?:BoardEventListener) {
		if (this._destroyed) return ;
	
		if (__el) this._el = __el;
		this.newblock();
		this.newblock();

		// send the board
		this._el("update", { score:this.score, board:this.grid });

		// start playing game ticks
		this.loopSchedule();
	}

	/* Player inputs */
	public move(__move:string, __auto:boolean): { ok:boolean, score:number, after?:() => void } {

		if (this._destroyed) return { ok:false, score:this.score };

		// gameover check
		if (this._gameover === true) {
			// in case we lost it
			this.setGameover();
			return { ok:false, score:this.score };
		}

		let ok = false;
		switch (__move) {
			case 'Down':
				ok = this.shiftdown(__auto);
				break ;
			case 'Left':
				ok = this.shiftleft();
				break ;
			case 'Right':
				ok = this.shiftright();
				break ;
			case 'Rotate':
				ok = this.rotate();
				break ;
			case 'Mega':
				ok = this.megafall();
				break ;
			/* case 'Shot':
				ok = this.st();
				break ; */
			default:
				console.warn('[PLAYER] invalid move', __move);
		}

		let after = undefined;
		if (__move === 'Down' || __move === 'Mega') {
			const afterNB = () => {this.newblock();};
			if (__move === 'Mega' && ok === true) {
				after = afterNB;
			}
			if (__move === 'Down' && (ok === false && this._activePiece !== null)) {
				after = afterNB;
				ok = true;
			}
		}

		// sync lobby
		this._el("update", { score:this.score, board:this.grid });

		return { ok, score:this.score, after };
	}

	private setGameover() {
		this._el("gameover", this.score);
		this.clearSchedule();
		this._gameover = true;
	}

	/* =================================== */
	/* ============== SHARED ============= */
	/* =================================== */

	/* Here are a bunch of static methods to produce the effect of
	the tetris moves. They should chain if necessary but they don't handle
	client-server communication. They return true if the move was successful */

	static sd(__grid:MapType, __activePiece:Piece | null, cb?: (lines:number) => void): boolean {
		if (__activePiece === null)
			return false;

		// Create a real Piece instance copy
		const nextPosition = __activePiece.clone();
		nextPosition.row += 1;

		if (!Board.validCheck(__grid, nextPosition)) {
			
			// The cycle continues
			Board.ts(__grid, __activePiece);
			Board.cl(__grid, cb);
			
			return false;
		}

		__activePiece.row += 1;
		return true;
	}

	static sl(__grid:MapType, __activePiece:Piece | null): boolean {
		if (__activePiece === null)
			return false;

		if (__activePiece.column + __activePiece.left === 0)
			return false;

		const leftPiece = __activePiece.clone();
		leftPiece.column -= 1;

		if (!Board.validCheck(__grid, leftPiece))
			return false;

		__activePiece.column -= 1;
		return true;
	}

	static sr(__grid:MapType, __activePiece:Piece | null): boolean {
		if (__activePiece === null)
			return false;

		if (__activePiece.column + __activePiece.right === COLUMNS_NUMBER - 1)
			return false;

		const rigtPiece = __activePiece.clone();
		rigtPiece.column += 1;

		if (!Board.validCheck(__grid, rigtPiece))
			return false

		__activePiece.column += 1;
		return true;
	}

	static rr(__grid:MapType, __activePiece:Piece | null): boolean {

		if (__activePiece === null)
			return false;

		const rotated = __activePiece.clone();
		rotated.rotate();

		const kicks = [
			{ r: 0, c: 0 },  // Test standard (nessun movimento)
			{ r: 0, c: 1 },  // Prova a spostare a destra di 1
			{ r: 0, c: -1 }, // Prova a spostare a sinistra di 1
			{ r: -1, c: 0 }, // Prova a spostare in su di 1 (utile se ruoti sul fondo)
			{ r: 0, c: 2 },  // Prova a destra di 2 (spesso necessario per il pezzo 'I')
			{ r: 0, c: -2 }  // Prova a sinistra di 2
		];

		
		/* check for space to rotate */
		for (const kick of kicks) {
			const newCol = __activePiece.column + kick.c;
			const newRow = __activePiece.row + kick.r;

			rotated.column = newCol;
			rotated.row = newRow;

			if (Board.validCheck(__grid, rotated)) {
				/* perform the rotation */
				__activePiece.rotate();
				__activePiece.row = newRow;
				__activePiece.column = newCol;
				return true;
			}
		}
		return false;
	}

	static mf(__grid:MapType, __activePiece:Piece | null, cb?: (lines:number) => void): boolean {
		if (__activePiece === null)
			return false;

		const projection = __activePiece.clone();
		while (Board.validCheck(__grid, projection)) {
			projection.row += 1;
		}
		
		// Set the real piece to the last valid position found
		__activePiece.row = projection.row - 1;

		// The cycle continues
		Board.ts(__grid, __activePiece);
		Board.cl(__grid, cb);

		return true;
	}

	/* >Consequences */

	static cl(__grid:MapType, cb?: (lines:number) => void): boolean {
		const penaltyLines = __grid.filter(row => row.includes('X'));
		const playableLines = __grid.filter(row => !row.includes('X'));

		// quante righe sono rimase
		const remainingPlayable = playableLines.filter(row => row.some(cell => cell === null));
		//quante righe devono essere rimosse
		const removedCount = playableLines.length - remainingPlayable.length;
		
		if (removedCount > 0) {
			const newEmptyLines = Array.from({ length: removedCount }, () => 
				Array(10).fill(null)
			);
			
			// __grid = [...newEmptyLines, ...remainingPlayable, ...penaltyLines];
			const nextGrid = [...newEmptyLines, ...remainingPlayable, ...penaltyLines];
        
			// Update the original array in-place so Pinia sees it
			__grid.splice(0, __grid.length, ...nextGrid);
		}
		
		//if (removedCount > 1) chiamare addPenalty() (removedCount - 1) volte agli altri player
		cb?.(removedCount);
	
		return true;
	}

	static ts(__grid:MapType, __activePiece:Piece | null): boolean {
		if (__activePiece === null)
			return false;

		const { shape, row, column } = __activePiece;

		for (const [i, shapeRow] of shape.entries()) {
			for (const [j, cell] of shapeRow.entries()) {
				if (cell === null) continue;

				const r = row + i;
				const c = column + j;

				if (__grid[r]?.[c] !== undefined) {
					__grid[r][c] = cell;
				}
			}
		}

		return true;
	}

	static pn(__grid:MapType, __lines:number): boolean {
		if (__lines <= 0)
			return false;

		const validRows = __grid.slice(__lines);
		const penaltyRow = Array(__lines).fill(Array(10).fill('X')) as Cell[][];
		const newGrid = [...validRows, ...penaltyRow];
		__grid.splice(0, __grid.length, ...newGrid);
		return true;
	}

	/* =================================== */
	/* =========== CLIENT SIDE =========== */
	/* =================================== */

	public event(__event:BoardEvent, payload?:any) {
		if (this._destroyed) return ;

		switch (__event) {
			case 'penality':
			{
				const lines = payload?.lines;
				this.penality(lines);
				break ;
			}
			/* case 'shot':
			{
				this.st();
				break ;
			} */
		}
	}

}

export default Board;