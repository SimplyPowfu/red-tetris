import React from 'react';
import { connect } from 'react-redux';
import { BlockColor } from '../../../tetris/blocks';

import './Board.css';

function drawCell(i, j, cella)
{
	let cellValue = cella;

	const finalBgColor = cellValue
		? BlockColor[cellValue]
		: "#050a20";

	return (
		<div
		key={`${i}-${j}`}
		className="cella"
		style={{
			backgroundColor: finalBgColor,
		}}
		/>
	);
}

function normalizeTo4x4(shape, type)
{
	let start = 1;
	if (type === 'I')
		start = 0;

	const size = 4;

	const newGrid = Array.from({ length: size }, () =>
		Array(size).fill(null)
	);

	for (let i = 0; i < shape.length; i++) {
		for (let j = 0; j < shape[i].length; j++) {
			newGrid[i + start][j] = shape[i][j];
		}
	}

	return newGrid;
}

// renders the game board
export const NextBlock = ({ nextBlock }) => {

	const gridToRender = nextBlock 
        ? normalizeTo4x4(nextBlock.shape, nextBlock.type)
        : Array.from({ length: 4 }, () => Array(4).fill(null));

	return (
		<div
		className="next-block"
		style={{
			display: "grid",
			gridTemplateColumns: `repeat(4, 30px)`,
			gap: "2px"
		}}
		>
		{gridToRender.map((row, i) =>
			row.map((cell, j) => drawCell(i, j, cell))
		)}
		</div>
	);
}


const mapStateToProps = (state) => {
	return {
		nextBlock: state.tetris.nextBlock,
	}
}

export default connect(mapStateToProps, null)(NextBlock)