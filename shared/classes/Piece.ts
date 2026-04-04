export const START_COLUMN = 3;

import type { PieceType, Shape } from "../types/PieceType.js";
import { Tetriminos } from "../types/PieceType.js";

class Piece
{
	private _shape:Shape;
	private _type:PieceType = "Error";
	// private _parent = null;

	public row = 0;
	public column = START_COLUMN;

	// leftmost and rightmost part of the shape (based on origin: O + r)
	private _left;
	private _right;

	constructor(__type:PieceType/* , __parent */) {
		this._shape = Tetriminos[__type];
		this._type = __type;
		// this._parent = __parent;

		const { left, right } = this.calcRightLeft();
		this._left = left;
		this._right = right;
	}

	get shape() {
		return this._shape;
	}

	get type() {
		return this._type;
	}

	get left() {
		return this._left;
	}

	get right() {
		return this._right;
	}

	public clone() {
		const copy = new Piece(this._type);
        copy.row = this.row;
        copy.column = this.column;
        copy._shape = JSON.parse(JSON.stringify(this._shape)); // Deep copy the 2D array
		copy._left = this._left;
		copy._right = this._right;
        return copy;
	}

	public rotate() {

		if (this._type === 'O') return ;

		const n = this._shape.length;
		// Create a new square matrix of the same size
		const rotated: Shape = Array.from({ length: n }, () => Array(n).fill(null));
	
		for (let r = 0; r < n; r++) {
			for (let c = 0; c < n; c++) {
				// Clockwise: newCol = oldRow, newRow = (n-1) - oldCol
				rotated[c][n - 1 - r] = this._shape[r][c];
			}
		}
		this._shape = rotated;

		// re-calculate left-right
		const { left, right } = this.calcRightLeft();
		this._left = left;
		this._right = right;
	}

	//-------------------------
	private calcRightLeft(): { left:number, right:number} {
		const n = this._shape.length;
		let min = n + 1;
		let max = -1;
	
		for (let r = 0; r < n; r++) {
			for (let c = 0; c < n; c++) {
				if (this._shape[r][c] !== null) {
					if (c < min) min = c;
					if (c > max) max = c;
				}
			}
		}

		return { left:min, right:max };
	}

}

export function produceBlock(__type:PieceType)
{
	const shape = Tetriminos[__type];
	if (!shape) {
		return ({
			shape: [],
			row: 0,
			column: START_COLUMN,
			type: 'Error',
		});
	}
	else
	{
		return ({
			shape,
			row: 0,
			column: START_COLUMN,
			type: __type,
		})
	}
}

export function isblock(block:any): block is Piece
{
	return (block
		&& block.shape != undefined
		&& block.type !== undefined
		&& block.type !== 'Error'
		&& block.row !== undefined
		&& block.column !== undefined
	);
}

export default Piece;