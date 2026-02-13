
import { act } from "react";
import { START_COLUMN, Tetriminos, produceBlock } from "./blocks";

// defined here but later import from game folder
const COLUMNS_NUMBER = 10
const ROWS_NUMBER = 20

// returns a new grid
export function newgrid() {
	return Array.from({ length: ROWS_NUMBER }, () => Array(COLUMNS_NUMBER).fill(null));
}

// @grid is the static grid, adds the activeBlock to the grid
// @active block, the current activeBlock
// blockType the type of block to add next
// 'I', 'O', 'T', 'L', 'J', 'S', 'Z'
// RETURNS the whole state
export function nb(blockType, activeBlock, grid)
{
	const newGrid = grid.map(row => [...row]);

	if (activeBlock) {
		const { shape, row, column } = activeBlock;
		for (let i = 0; i < shape.length; i++) {
			for (let j = 0; j < shape[i].length; j++) {
				if (shape[i][j] !== null) {
					newGrid[row + i][column + j] = shape[i][j];
				}
			}
		}
	}

	if (Object.keys(Tetriminos).find(k => k === blockType) === undefined)
		return null;

	return {
		activeBlock: produceBlock(blockType),
		static: newGrid
	};
}

// @grid is the active grid, slides DOWN the block
export function sd(activeBlock)
{
	if (!activeBlock) return;
    const { /* shape, */ row/* , column */ } = activeBlock;
    const newRow = row + 1;

    // if (isValidPosition(shape, newRow, column, grid)) {
	return { ...activeBlock, row: newRow };
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
    return { ...activeBlock, shape: rotated };
}

// pushes the active block as low as possible
export function mf(activeBlock, grid)
{
	let newBlock = activeBlock;

	if (activeBlock) {
		while (isValidPosition(newBlock, grid))
		{
			newBlock = { ...newBlock, row: newBlock.row + 1 };
		}

		newBlock = { ...newBlock, row: newBlock.row - 1 };
	}

	return newBlock;
}

// @grid is the static grid, collapse the passed line
export function cl(grid)
{
	const penaltyLines = grid.filter(row => row.includes('X'));
    const playableLines = grid.filter(row => !row.includes('X'));

    // quante righe sono rimase
    const remainingPlayable = playableLines.filter(row => row.some(cell => cell === null));
    //quante righe devono essere rimosse
    const removedCount = playableLines.length - remainingPlayable.length;
    
    //if (removedCount > 1) chiamare addPenalty() (removedCount - 1) volte agli altri player
    if (removedCount > 0) {
      const newEmptyLines = Array.from({ length: removedCount }, () => 
        Array(10).fill(null)
      );
		  return [...newEmptyLines, ...remainingPlayable, ...penaltyLines];
    }
	return grid;
}

// @grid is the static grid, adds a penality layer
export function pn(grid)
{
  const newGrid = grid.slice(1);
  const penaltyRow = Array(10).fill('X');
  return [...newGrid, penaltyRow];
}


/* VALIDATE MOVE */
export function isValidPosition(block, grid) {
	const { shape, row, column } = block;
    for (let i = 0; i < shape.length; i++) {
      for (let j = 0; j < shape[i].length; j++) {
        if (shape[i][j] !== null) {
          const newRow = row + i;
          const newCol = column + j;
          if (
            newCol < 0 ||
            newCol >= COLUMNS_NUMBER ||
            newRow >= ROWS_NUMBER ||
            (newRow >= 0 && grid[newRow][newCol] !== null)
          ) {
            return false;
          }
        }
      }
    }
    return true;
}

export function isValidSpawn(oldBlock, newBlock)
{
  if (oldBlock === null)
    return true;

  const oldShape = oldBlock.shape;
  const newShape = newBlock.shape;

  if (oldShape.row > newShape.length
    || oldBlock.column > newBlock.column + newShape[0].length
    || oldBlock.column === 0)
    return true;

  for (let i = 0; i < newShape.length; i++) {
    for (let j = 0; j < newShape[i].length; j++) {
      if (newShape[i][j] !== null) {
        const absRow = newBlock.row + i;
        const absCol = newBlock.column + j;
        const oldRow = absRow - oldBlock.row;
        const oldCol = absCol - oldBlock.column;
        if (
          oldRow >= 0 && oldRow < oldShape.length
          && oldCol >= 0 && oldCol < oldShape[0].length
          && oldShape[oldRow][oldCol] !== null
        ) {
          return false;
        }
      }
    }
  }

  return true;
}

// check how many lines to remove
export function checkLines(grid)
{
    const playableLines = grid.filter(row => !row.includes('X'));

    // quante righe sono rimase
    const remainingPlayable = playableLines.filter(row => row.some(cell => cell === null));
    //quante righe devono essere rimosse
    const removedCount = playableLines.length - remainingPlayable.length;

	return removedCount;
}