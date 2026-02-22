import React from 'react';
import { connect } from 'react-redux';

import './Board.css';
import { BlockColor } from '../../../tetris/blocks.js';

export const Tetris = () => {
	return (
		<Board/>
	)
}

function isValidPosition(shape, row, column, currentGrid) {
    for (let i = 0; i < shape.length; i++) {
		for (let j = 0; j < shape[i].length; j++) {
			if (shape[i][j] !== null) {
				const newRow = row + i;
				const newCol = column + j;
				if (
					newCol < 0 ||
					newCol >= 10 ||
					newRow >= 20 ||
					(newRow >= 0 && currentGrid[newRow][newCol] !== null)
				) {
					return false;
				}
			}
		}
    }
    return true;
  }

function getGhostRow(statik, activeBlock) {
    if (!activeBlock) return null;

	const { shape, row, column } = activeBlock;
	let ghostRow = row;
    while (isValidPosition(shape, ghostRow + 1, column, statik)) {
		ghostRow++;
    }
    return ghostRow;
  }

function drawCell(i, j, cella, ghostRow, activeBlock, gameover)
{
	let cellValue = cella;
	let isGhost = false;

	// BLOCCO ATTIVO
	if (activeBlock) {
		const { shape, row, column, type } = activeBlock;
		const relativeRow = i - row;
		const relativeCol = j - column;

		if (
			relativeRow >= 0 &&
			relativeRow < shape.length &&
			relativeCol >= 0 &&
			relativeCol < shape[0].length &&
			shape[relativeRow][relativeCol] !== null
		) {
			cellValue = type;
		}
	}

	// GHOST (solo se la cella è vuota)
	if (
		activeBlock &&
		ghostRow !== null &&
		cellValue === null
	) {
		const { shape, column } = activeBlock;
		const relativeRow = i - ghostRow;
		const relativeCol = j - column;

		if (
			relativeRow >= 0 &&
			relativeRow < shape.length &&
			relativeCol >= 0 &&
			relativeCol < shape[0].length &&
			shape[relativeRow][relativeCol] !== null
		) {
			isGhost = true;
		}
	}

	// X-Factor baby
	if (cellValue && gameover) cellValue = 'X';

	const finalBgColor = cellValue
		? BlockColor[cellValue]
		: "#050a20";

	return (
		<div
		key={`${i}-${j}`}
		className="cella"
		style={{
			backgroundColor: finalBgColor,
			boxShadow: isGhost
			? `inset 0 0 0 2px ${BlockColor[activeBlock.type]}`
			: 'inset 0 0 0 1px rgba(255,255,255,0.05)'
		}}
		/>
	);
}

// renders the game board
export const BoardDiv = ({ statik, activeBlock, gameover }) => {

	// console.log('[Board]', activeBlock, statik);
	if (!statik)
		return (
			<p>Nothing yet to render</p>
		);

	const ghostRow = activeBlock ? getGhostRow(statik, activeBlock) : null;

	return (
    <div className="game-container">
      <div className="griglia">
	  	{/* gameover && (
          <div className="game-over-overlay">
            <h2>YOU SUCK</h2>
            <button onClick={alert('Saik')}>Riprova</button>
          </div>
        ) */}
        {statik.map((riga, i) =>
          riga.map((cella, j) => drawCell(i, j, cella, ghostRow, activeBlock, gameover))
        )}
      </div>
    </div>
  );
}

const mapStateToProps = (state) => {
	return {
		statik: state.tetris.static,
		activeBlock: state.tetris.activeBlock,
		gameover: state.tetris.gameover,
		score: state.tetris.score
	}
}

export default connect(mapStateToProps, null)(BoardDiv)