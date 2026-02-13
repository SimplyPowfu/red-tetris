import React, { useEffect } from 'react';
import { connect } from 'react-redux'

import { startmatch } from '../../actions/tetris';
import { move } from '../../actions/tetris';

// Components
import { SpectatorBoard } from '../components/SpectatorBoard';
import PlayerBoard, { BoardDiv } from '../components/Board';
import NextBlock from '../components/NextBlock';

// Style
import './Pages.css';

const LobbyPage = ({ lobby, user, startmatch, move }) => {
	if (!user || !lobby) return <p>Nothing to see here... piss off!</p>;

  /* -------- UNPUT -------- */
	//tasti della tastiera (forse da mettere da un'altra parte)
	useEffect(() => {
		const handleKeyDown = (event) => {
		  switch (event.key) {
			case 'ArrowLeft':
				event.preventDefault();
			  	move('Left');
			  	break;
			case 'ArrowRight':
				event.preventDefault();
			  	move('Right');
			  	break;
			case 'ArrowDown':
				event.preventDefault();
				move('Down');
			  	break;
			case 'ArrowUp':
				event.preventDefault();
				move('Rotate');
			    break;
			case ' ': // Barra spaziatrice
				event.preventDefault();
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
	}, []);
	/* ---------------------- */

	return (
	  <div className="lobby-page">
      <p>Username: {user.username}</p>
      <h1>Lobby: {lobby.lobbyId}</h1>

      <h3>Players:</h3>
      <ul>
        {lobby.players && lobby.players.map(player => (
          <li key={player.username}>{player.username}</li>
        ))}
      </ul>
      <button onClick={() => {startmatch()}}>
        Start
      </button>
      <NextBlock/>
      <PlayerBoard/>
      <div className="players-boards">
      {lobby.players.map(player => (
        <SpectatorBoard
          key={player.username}
          player={player}
        />
      ))}
    </div>
    </div>
	);
}

const mapDispatchToProps = { startmatch, move };

const mapStateToProps = (state) => {
  return {
    message: state.alert.message,
    user: state.user,
	  lobby: state.lobby,
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(LobbyPage)
