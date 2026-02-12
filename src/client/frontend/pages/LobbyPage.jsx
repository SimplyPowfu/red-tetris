import React from 'react';
import { connect } from 'react-redux'
import Board from '../components/Board';
import { startmatch } from '../../actions/tetris';

const LobbyPage = ({ lobby, user, startmatch }) => {
	if (!user || !lobby) return null;

	return (
	  <div className="lobby-page">
      <p>Username: {user.username}</p>
      <h1>Lobby: {lobby.lobbyId}</h1>

      <h3>Players:</h3>
      <ul>
        {lobby.players.map(player => (
          <li key={player}>{player}</li>
        ))}
      </ul>
      <button onClick={() => startmatch()}>
        Start
      </button>
      <Board/>
    </div>
	);
}

const mapDispatchToProps = { startmatch };

const mapStateToProps = (state) => {
  return {
    message: state.alert.message,
    user: state.user,
	  lobby: state.lobby,
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(LobbyPage)
