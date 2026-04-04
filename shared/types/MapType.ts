// defined here but later import from game folder
export const COLUMNS_NUMBER = 10;
export const ROWS_NUMBER = 20;

import { BlockColor } from "./PieceType.js";

export type Cell = keyof typeof BlockColor | null;
export type MapType = Cell[][];

// type of custom blocks for Map mode
const maps:Record<string, MapType> = {
	ghost:[
		[null, null, null, null, null, null, null, null, null, null],
		[null, null, null, null, null, null, null, null, null, null],
		[null, null, null, null, null, null, null, null, null, null],
		[null, null, null, null, null, null, null, null, null, null],
		[null, null, null, null, null, null, null, null, null, null],
		[null, null, null, null, null, null, null, null, null, null],
		[null, null, null, null, null, null, null, null, null, null],
		[null, null, null, null, null, null, null, null, null, null],
		[null, null, null, null, null, null, null, null, null, null],
		[null, null, null, null, null, null, null, null, null, null],
		[null, null, null, null, null, null, null, null, null, null],
		[null, null, null, null, null, null, null, null, null, null],
		[null, null, null, 'Z', 'Z', 'Z', 'Z', null, null, null],
		[null, null, 'Z', 'Z', 'Z', 'Z', 'Z', 'Z', null, null],
		[null, null, 'Z', 'Z', 'Z', 'Z', 'Z', 'Z', 'Z', null],
		[null, 'Z', 'Z', 'W', 'W', 'Z', 'W', 'W', 'Z', null],
		[null, 'Z', 'Z', 'W', 'L', 'Z', 'W', 'L', 'Z', null],
		[null, 'Z', 'Z', 'Z', 'Z', null, 'Z', 'Z', 'Z', null],
		[null, 'Z', 'Z', 'Z', 'Z', 'Z', 'Z', 'Z', 'Z', null],
		[null, 'Z', 'Z', null, 'Z', 'Z', null, 'Z', 'Z', null]
	  ],
	invaders:[
		[null, null, null, null, null, null, null, null, null, null],
		[null, null, null, null, null, null, null, null, null, null],
		[null, null, null, null, null, null, null, null, null, null],
		[null, null, null, null, null, null, null, null, null, null],
		[null, null, null, null, null, null, null, null, null, null],
		[null, null, null, null, null, null, null, null, null, null],
		[null, null, null, null, null, null, null, null, null, null],
		[null, null, null, null, null, null, null, null, null, null],
		[null, null, null, null, null, null, null, null, null, null],
		[null, null, null, null, null, null, null, null, null, null],
		[null, null, null, null, null, null, null, null, null, null],
		[null, null, null, null, null, null, null, null, null, null],
		[null, null, null, null, 'W', 'W', null, null, null, null],
		[null, null, null, null, 'L', 'L', null, null, null, null],
		[null, null, null, null, 'W', 'W', null, null, null, null],
		[null, null, 'Z', null, 'W', 'W', null, 'Z', null, null],
		[null, 'W', 'L', 'W', 'W', 'W', 'W', 'L', 'W', null],
		[null, 'W', 'W', 'W', 'W', 'W', 'W', 'W', 'W', null],
		[null, 'W', 'W', null, 'J', 'J', null, 'W', 'W', null],
		[null, 'W', null, null, 'Z', 'Z', null, null, 'W', null]
	  ],
	  wiggly:[
		[null, null, null, null, null, null, null, null, null, null],
		[null, null, null, null, null, null, null, null, null, null],
		[null, null, null, null, null, null, null, null, null, null],
		[null, null, null, null, null, null, null, null, null, null],
		[null, null, null, null, null, null, null, null, null, null],
		[null, null, null, null, null, null, null, null, null, null],
		[null, null, null, null, null, null, null, null, null, null],
		[null, null, null, null, null, null, null, null, null, null],
		[null, null, null, null, null, null, null, null, null, null],
		[null, null, null, null, null, null, null, null, null, null],
		[null, null, null, null, null, null, null, null, null, null],
		[null, null, null, null, null, null, null, null, null, null],
		[null, null, null, null, null, null, null, null, null, null],
		[null, null, null, null, null, null, null, null, null, null],
		[null, null, null, null, null, null, null, null, null, null],
		[null, null, null, null, null, null, null, null, null, 'Z'],
		['L', 'J', 'O', null, 'J', 'O', 'L', null, null, null],
		['O', null, 'L', null, 'L', null, 'J', null, null, 'L'],
		['J', null, 'J', null, 'O', null, 'O', null, null, 'O'],
		['L', null, 'O', 'L', 'J', null, 'L', 'J', 'O', 'J'],
	  ]
}

// returns a new grid
export function newgrid(map:string)
{
	const grid = maps[map];
	if (grid) return grid.map(row => [...row]);;
	return Array.from({ length: ROWS_NUMBER }, () => Array(COLUMNS_NUMBER).fill(null)) as MapType;
}

export function isMap(grid:any): grid is MapType
{
    return (grid && Array.isArray(grid) && grid.length === ROWS_NUMBER && grid.every(row => Array.isArray(row) && row.length === COLUMNS_NUMBER));
}

export default maps;