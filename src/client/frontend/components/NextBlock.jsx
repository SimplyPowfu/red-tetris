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

	if (nextBlock === null) {
		return (
			<div className='next-block'>
				Next there will be a block here.
	  		</div>
		);
	}
	const { shape, type } = nextBlock;
	const normalizedShape = normalizeTo4x4(shape, type);

	return (
		<div
		className="next-block"
		style={{
			display: "grid",
			gridTemplateColumns: `repeat(4, 30px)`,
			gap: "2px"
		}}
		>
		{normalizedShape.map((row, i) =>
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