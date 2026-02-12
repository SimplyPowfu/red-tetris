
import { BlockColor, Tetriminos } from "./blocks";

// defined here but later import from game folder
const COLUMNS_NUMBER = 10
const ROWS_NUMBER = 20
const START_COLUMN = 3

// returns a new grid
export function newgrid() {
	return Array.from({ length: ROWS_NUMBER }, () => Array(COLUMNS_NUMBER).fill(null));
}

// @grid is the active grid, adds the block type to the grid
// 'I', 'O', 'T', 'L', 'J', 'S', 'Z'
export function nb(blockType)
{
	if (Object.keys(Tetriminos).find(k => k === blockType) === undefined)
		return null;

	return {
		shape: Tetriminos[blockType],
		row: 0,
		column: START_COLUMN,
		type: blockType
	};
}

// @grid is the active grid, slides DOWN the block
export function sd(activeBlock)
{
	if (!activeBlock) return;
    const { /* shape, */ row/* , column */ } = activeBlock;
    const newRow = row + 1;

    // if (isValidPosition(shape, newRow, column, grid)) {
	return({ ...activeBlock, row: newRow });
    /* } else {
      const newGrid = grid.map(r => [...r]);

      for (let i = 0; i < shape.length; i++) {
        for (let j = 0; j < shape[i].length; j++) {
          if (shape[i][j] !== null) {
            newGrid[row + i][column + j] = shape[i][j];
          }
        }
      }
      const cleared = checkLines(newGrid);
      setGrid(cleared);
      setActiveBlock(null);
      addBlock();
    } */
}

// @grid is the active grid, slides LEFT the block
export function sl(activeBlock)
{
    if (!activeBlock) return;
    const { column } = activeBlock;
    const newColumn = column - 1;

	return { ...activeBlock, column: newColumn };
}

// @grid is the active grid, slides RIGHT the block
export function sr(activeBlock)
{
	if (!activeBlock) return;
    const { column } = activeBlock;
    const newColumn = column + 1;

	return { ...activeBlock, column: newColumn };
}

// @grid is the active grid, ROTATES the block
export function rr(activeBlock)
{
	const { shape } = activeBlock;
    const rows = shape.length;
    const cols = shape[0].length;
    const rotated = Array.from({ length: cols }, () => Array(rows).fill(null));

    for (let x = 0; x < rows; x++) {
      for (let y = 0; y < cols; y++) {
        rotated[y][rows - 1 - x] = shape[x][y];
      }
    }
    return rotated;
}

// @active is the active grid,
// @statik is the static grid,
// moves the block in the active grid to the static grid
export function ts(activeBlock, statik)
{
	return statik;
}

// @grid is the static grid, collapse the passed line
export function cl(grid, line)
{
	return grid;
}

// @grid is the static grid, adds a penality layer
export function pn(grid)
{
	return grid;
}


/* VALIDATE MOVE */
export function isValidPosition(activeBlock, currentGrid) {
	const { shape, row, column } = activeBlock;
    for (let i = 0; i < shape.length; i++) {
      for (let j = 0; j < shape[i].length; j++) {
        if (shape[i][j] !== null) {
          const newRow = row + i;
          const newCol = column + j;
          if (
            newCol < 0 ||
            newCol >= COLUMNS_NUMBER ||
            newRow >= ROWS_NUMBER ||
            (newRow >= 0 && currentGrid[newRow][newCol] !== null)
          ) {
            return false;
          }
        }
      }
    }
    return true;
  }