import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { startmatch, move } from '../../actions/tetris';

// Components
import { SpectatorBoard } from '../components/SpectatorBoard';
import PlayerBoard from '../components/Board';
import NextBlock from '../components/NextBlock';

import './Pages.css';

const LobbyPage = ({ lobby, user, startmatch, move, winner }) => {
    
    const gameOver = () => {
        if (!winner) return null;

        const isMe = winner === user.username;
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
    // --- INPUT (Invariato) ---
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

    if (!user || !lobby) return <div className="lobby-loading">Loading...</div>;

    const opponents = lobby.players ? lobby.players.filter(p => p.username !== user.username) : [];
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
                    {gameOver()}
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
                        <span className="score-val">0</span>
                    </div>
                </div>

                {/* 3. MAP (Template Visivo) */}
                {isHost && (<div className="retro-box map-box">
                    <div className="retro-box-title">MAP</div>
                    <div className="retro-box-content">
                        <div className="map-selector">
                            <div className="arrow-btn">◄</div>
                            <span className="map-name">basic</span>
                            <div className="arrow-btn">►</div>
                        </div>
                    </div>
                </div>)}

                {/* BUTTON START */}
                {isHost ? (<button className="start-btn" onClick={() => startmatch()}>
                    start
                </button>) : (<button className="start-btn" onClick={() => startmatch()}>
                    ready
                </button>)}
            </div>

            {/* DESTRA: AVVERSARI */}
            <div className="column right-column">
                <div className="opponents-layout">
                    {opponents.map(player => (
                        <div key={player.username} className="mini-board-wrapper">
                            <SpectatorBoard player={player} />
                        </div>
                    ))}
                </div>
            </div>

        </div>
    );
}

const mapDispatchToProps = { startmatch, move };
const mapStateToProps = (state) => ({
    user: state.user,
    lobby: state.lobby,
    winner: state.tetris.winner,
});

export default connect(mapStateToProps, mapDispatchToProps)(LobbyPage);