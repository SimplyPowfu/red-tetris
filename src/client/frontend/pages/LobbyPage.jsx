import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { useHistory, useParams } from 'react-router-dom';
import { login } from '../../actions/auth.js';
import { startmatch, readystate, move } from '../../actions/tetris.js';

// Components
import { SpectatorBoard } from '../components/SpectatorBoard.jsx';
import PlayerBoard from '../components/Board.jsx';
import NextBlock from '../components/NextBlock.jsx';

import './Pages.css';

function gameOver(winner)
{
    if (!winner) return null;

    // const isMe = winner === user.username;
    return (
        <div className={`game-over-overlay win`}>
            <h2>{'GAME OVER'}</h2>
            <div className="winner-box">
                <span className="label">WINNER</span>
                <span className="winner-name">{winner}🏆</span>
            </div>
        </div>
    );
};

const LobbyPage = ({ message, lobby, user, login, startmatch, readystate, move, winner }) => {
    
    const { room, player } = useParams()
    const history = useHistory()
    
    /* Lobby updates */
    useEffect(() => {
            if (message) {
                alert(message);
                history.push('/');
            }
        }, [message]);

    useEffect(() => {
        if (!user.username) {
            login({ username: player, lobbyId: room });
        }
    }, [user.username, user.lobbyId]);

    /* === Lobby Private States ==== */
    const maps = ["basic", "ghost", "invaders"];
    const [mapIndex, setMapIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [opponents, setOpponents] = useState([]);

    /* MAP */
    const changeMap = (direction) => {
        setMapIndex((prevIndex) => {
            const nextIndex = prevIndex + direction;
            if (nextIndex < 0) return maps.length - 1;
            if (nextIndex >= maps.length) return 0;
            return nextIndex;
        });
    };

    /* Persist SCORE/OPPONENTS */
    useEffect(() => {
        if (lobby.ingame) {
            setScore(user.score);
            setOpponents(lobby.players.filter(p => p.username !== user.username));
        }
    }, [user.score, lobby.players]);

    /* Player inputs */
    useEffect(() => {
        const handleKeyDown = (event) => {
            if (winner)
                return; 
            switch (event.key) {
                case 'ArrowLeft': event.preventDefault(); move('Left'); break;
                case 'ArrowRight': event.preventDefault(); move('Right'); break;
                case 'ArrowDown': event.preventDefault(); move('Down'); break;
                case 'ArrowUp': event.preventDefault(); move('Rotate'); break;
                case ' ': event.preventDefault(); move('Mega'); break;
                default: break;
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => { window.removeEventListener('keydown', handleKeyDown); };
    }, [move, winner]);

    /* ================================ */

    /* Loading page */
    if (!user.username || !lobby.players) return <div className="lobby-loading">Loading...</div>;

    // const opponents = lobby.players ? lobby.players.filter(p => p.username !== user.username) : [];
    const isHost = lobby.players && lobby.players.length && lobby.players[0].username === user.username;

    return (
        <div className="lobby-container">
            
            {/* SINISTRA: TU */}
            <div className="column left-column">
                <div className="player-header">
                    <span className="star-icon">{isHost && '★'}</span> 
                    <span className="player-name">{user.username}</span>
                </div>
                <div className="board-wrapper">
                    {gameOver(winner)}
                    <PlayerBoard />
                </div>
            </div>

            {/* CENTRO: CONTROLLI */}
            <div className="column center-column">
                
                {/* 1. NEXT BLOCK */}
                <div className="retro-box">
                    <div className="retro-box-title">NEXT</div>
                    <div className="retro-box-content">
                        <NextBlock />
                    </div>
                </div>

                {/* 2. SCORE (Template Visivo) */}
                <div className="retro-box score-box">
                    <div className="retro-box-title">SCORE</div>
                    <div className="retro-box-content">
                        <span className="score-val">{score}</span>
                    </div>
                </div>

                {/* 3. MAP (Template Visivo) */}
                {isHost && ( lobby.ingame ? '' : <div className="retro-box map-box">
                    <div className="retro-box-title">MAP</div>
                    <div className="retro-box-content">
                        <div className="map-selector">
                            <div className="arrow-btn" onClick={() => changeMap(-1)}>◄</div>
                            <span className="map-name">{maps[mapIndex].toUpperCase()}</span>
                            <div className="arrow-btn"onClick={() => changeMap(1)}>►</div>
                        </div>
                    </div>
                </div>)}

                {/* BUTTON START */}
                {lobby.ingame ? '' : isHost ? (<button className="start-btn" onClick={() => startmatch(maps[mapIndex])}>
                    start
                </button>) : (<button className="start-btn" onClick={() => readystate()}>
                    {user.ready ? 'unready' : 'ready'}
                </button>)}
            </div>

            {/* DESTRA: AVVERSARI */}
            <div className="column right-column">
                <div className="opponents-layout">
                    {opponents.map(player => (
                        <div key={player.username} className="mini-board-wrapper">
                            <SpectatorBoard
                                player={player}
                                gameover={player.gameover ? true : winner ? true : false}
                            />
                        </div>
                    ))}
                </div>
            </div>

        </div>
    );
}

const mapDispatchToProps = { login, startmatch, readystate, move };
const mapStateToProps = (state) => ({
    message: state.alert.message,
    user: state.user,
    lobby: state.lobby,
    winner: state.tetris.winner,
});

export default connect(mapStateToProps, mapDispatchToProps)(LobbyPage);