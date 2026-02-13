import React from 'react';
import { BoardDiv } from './Board';
import './Board.css';

export const SpectatorBoard = ({ player }) => {
  return (
    <div className="player-board">
      <p>{player.username}</p>
      <BoardDiv
        statik={player.grid}
        gameover={player.gameover}
        activeBlock={null} // optional, you probably don’t need their active block
      />
    </div>
  );
};