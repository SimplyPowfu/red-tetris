import React from 'react';
import { Board } from './Board';
import './Board.css';

export const SpectatorBoard = ({ player, gameover }) => {
  return (
    <div className="player-board">
      <p>{player.username}</p>
      <Board
        statik={player.grid}
        gameover={/* player. */gameover}
        activeBlock={null} // optional, you probably don’t need their active block
      />
    </div>
  );
};