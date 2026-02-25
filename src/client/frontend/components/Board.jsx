import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';

import './Board.css';
import { BlockColor } from '../../../tetris/Piece.js';

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
export const Board = ({ statik, activeBlock, gameover, mode }) => {
	const [isVisible, setIsVisible] = useState(true);
	useEffect(() => {
        let interval = null;
        if (mode === 'ghost') {
            interval = setInterval(() => {
                setIsVisible((prev) => !prev);
            }, 2000);
        } else {
            setIsVisible(true);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [mode]);

	const displayGrid = statik || Array.from({ length: 20 }, () => Array(10).fill(0));
	const effectiveActiveBlock = isVisible ? activeBlock : null;
	const ghostRow = mode !== 'ghost' ? ((statik && activeBlock) ? getGhostRow(statik, activeBlock) : null) : null;
	
	return (
		<div className="game-container">
			<div className="griglia">
				{displayGrid.map((riga, i) =>
				riga.map((cella, j) => 
					drawCell(i, j, cella, ghostRow, effectiveActiveBlock, gameover)
				)
				)}
			</div>
		</div>
	);
};

const mapStateToProps = (state) => {
	return {
		statik: state.tetris.static,
		activeBlock: state.tetris.activeBlock,
		gameover: state.tetris.gameover,
		score: state.tetris.score,
		mode: state.tetris.mode
	}
}

export default connect(mapStateToProps, null)(Board)