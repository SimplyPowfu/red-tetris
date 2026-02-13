import React, { act, useEffect } from 'react';
import { connect } from 'react-redux';

import './Board.css';
import { BlockColor } from '../../../tetris/blocks';
import { move } from '../../actions/tetris';

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
export const Board = ({ statik, activeBlock, gameover, move }) => {


	console.log('[Board]', activeBlock, statik);
	if (!statik)
		return (
			<p>Nothing yet to render</p>
		);

	/* -------- UNPUT -------- */
	//tasti della tastiera (forse da mettere da un'altra parte)
	useEffect(() => {
		const handleKeyDown = (event) => {
		  event.preventDefault();
		  switch (event.key) {
			case 'ArrowLeft':
			  	move('Left');
			  	break;
			case 'ArrowRight':
			  	move('Right');
			  	break;
			case 'ArrowDown':
				move('Down');
			  	break;
			case 'ArrowUp':
				move('Rotate');
			    break;
			case ' ': // Barra spaziatrice
				move('Mega');
			  	break;
			default:
			  break;
		  }
		};

		// Aggiungiamo l'ascoltatore all'avvio del componente
		window.addEventListener('keydown', handleKeyDown);

		// IMPORTANTE: Pulizia dell'evento quando il componente viene smontato
		return () => {
			window.removeEventListener('keydown', handleKeyDown);
    	};
	}, [/* moveBlock, fallBlock, rotateBlock, megaFallBlock */]);
	/* ---------------------- */

	const ghostRow = getGhostRow(statik, activeBlock);

	return (
    <div className="game-container">
      <div className='card'>
        <button onClick={() => alert('saik')}>Pulisci Griglia</button>
        <button onClick={() => alert('saik')}>Aggiungi Blocco</button>
      </div>
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
      <div className='card'>
        <button onClick={() => alert('saik')}>✖️</button>
      </div>
    </div>
  );
}

const mapDispatchToProps = { move };

const mapStateToProps = (state) => {
	return {
		statik: state.tetris.static,
		activeBlock: state.tetris.activeBlock,
		gameover: state.tetris.gameover,
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(Board)