import React, { useState, useEffect, useRef } from 'react';
import { useHistory, useParams } from 'react-router-dom';

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

export const LobbyPagePC = ({ message, lobby, user, login, startmatch, readystate, move, winner }) => {
    
    const { room, player } = useParams();
    const opponents = lobby.players ? lobby.players.filter(p => p.username !== user.username) : [];
    const history = useHistory();
    
    /* ============== MOBILE =============== */
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
            setIsMobile(hasTouch && window.innerWidth <= 1024);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const touchStart = useRef({ x: 0, y: 0, lastX: 0, time: 0 });
    const cellSize = 30;

    const handleTouchStart = (e) => {
        const x = e.targetTouches[0].clientX;
        const y = e.targetTouches[0].clientY;
        touchStart.current = {
            x: x,
            y: y,
            lastX: x,
            time: Date.now()
        };
    };

    const handleTouchMove = (e) => {
        if (!touchStart.current.time) return;

        const currentX = e.targetTouches[0].clientX;
        const deltaX = currentX - touchStart.current.lastX;

        // Se il movimento laterale supera la dimensione di una cella
        if (Math.abs(deltaX) >= cellSize) {
            move(deltaX > 0 ? 'Right' : 'Left');
            // Aggiorniamo lastX per calcolare il prossimo scatto da qui
            touchStart.current.lastX = currentX;
        }
    };

    const handleTouchEnd = (e) => {
        if (!touchStart.current.time) return;

        const deltaX = e.changedTouches[0].clientX - touchStart.current.x;
        const deltaY = e.changedTouches[0].clientY - touchStart.current.y;
        const deltaTime = Date.now() - touchStart.current.time;
        const absX = Math.abs(deltaX);
        const absY = Math.abs(deltaY);

        if (deltaTime < 200 && absX < 15 && absY < 15)
            move('Rotate');
        else if (deltaY > 100 && absY > absX && deltaTime < 250)
            move('Mega');

        touchStart.current = { x: 0, y: 0, lastX: 0, time: 0 };
    };
    /* =============================== */
    
    /* ============== Lobby updates ============= */

    // Back to home on alert
    useEffect(() => {
        if (message) {
            alert(message);
            history.push('/');
        }
    }, [message]);

    // Autologin
    useEffect(() => {
        if (!user.username) {
            login({ username: player, lobbyId: room });
        }
    }, [user.username, user.lobbyId]);

    /* Lobby Private States */
    const maps = ["basic", "ghost", "invaders", "wiggly"];
    const [mapIndex, setMapIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [isHost, setIsHost] = useState(false);

    /* MAP */
    const changeMap = (direction) => {
        setMapIndex((prevIndex) => {
            const nextIndex = prevIndex + direction;
            if (nextIndex < 0) return maps.length - 1;
            if (nextIndex >= maps.length) return 0;
            return nextIndex;
        });
    };

    /* Get Host status */
    useEffect(() => {
        if (lobby.players) {
            if ((lobby.players.length > 1 && lobby.players[0].username === user.username)
                || lobby.players.length <= 1)
                setIsHost(true);
            else
                // Alone
                setIsHost(false);
        }
        // No players
        else
            setIsHost(true);
    }, [lobby]);

    /* Persist SCORE/OPPONENTS */
    useEffect(() => {
        if (lobby.ingame) {
            setScore(user.score);
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

    return (
        <div className="pc-lobby-container">
            {/* SINISTRA: TU */}
            <div className="column left-column">
                <div className="player-header">
                    <span className="star-icon">{isHost && '★'}</span> 
                    <span className="player-name">{user.username}</span>
                </div>
                <div className="pc-board-wrapper"
                    onTouchStart={isMobile ? handleTouchStart : undefined}
                    onTouchMove={isMobile ? handleTouchMove : undefined}
                    onTouchEnd={isMobile ? handleTouchEnd : undefined}
                    style={{ touchAction: 'none', userSelect: 'none' }}>
                    {gameOver(winner)}
                    <PlayerBoard />
                </div>
                {isMobile && (
                    <div className="pc-interactive-area">
                        {lobby.ingame ? (
                            /* MOSTRA I TASTI DI GIOCO */
                            <div className="controls-container">
                                <div className="controls-row">
                                    <button className="btn-rotate" onTouchStart={(e) => { e.preventDefault(); move('Rotate'); }}>⟳</button>
                                </div>
                                <div className="controls-row">
                                    <button className="btn-left" onTouchStart={(e) => { e.preventDefault(); move('Left'); }}>◀</button>
                                    <button className="btn-down" onTouchStart={(e) => { e.preventDefault(); move('Down'); }}>▼</button>
                                    <button className="btn-right" onTouchStart={(e) => { e.preventDefault(); move('Right'); }}>▶</button>
                                </div>
                                <div className="controls-row">
                                    <button className="btn-mega" onTouchStart={(e) => { e.preventDefault(); move('Mega'); }}>DROP</button>
                                </div>
                            </div>
                        ) : (
                            /* MOSTRA MAPPA E START/READY */
                            <div className="pc-lobby-controls">
                                {isHost && (
                                    <div className="retro-box map-box">
                                        <div className="retro-box-title">MAP</div>
                                        <div className="retro-box-content">
                                            <div className="map-selector">
                                                <div className="arrow-btn" onClick={() => changeMap(-1)}>◄</div>
                                                <span className="map-name">{maps[mapIndex].toUpperCase()}</span>
                                                <div className="arrow-btn" onClick={() => changeMap(1)}>►</div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <button className="start-btn" onClick={() => isHost ? startmatch(maps[mapIndex]) : readystate()}>
                                    {isHost ? 'START' : (user.ready ? 'UNREADY' : 'READY')}
                                </button>
                            </div>
                        )}
                    </div>
                )}
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
                {!isMobile && isHost && !lobby.ingame && (
                    <div className="retro-box map-box">
                        <div className="retro-box-title">MAP</div>
                        <div className="retro-box-content">
                            <div className="map-selector">
                                <div className="arrow-btn" onClick={() => changeMap(-1)}>◄</div>
                                <span className="map-name">{maps[mapIndex].toUpperCase()}</span>
                                <div className="arrow-btn" onClick={() => changeMap(1)}>►</div>
                            </div>
                        </div>
                    </div>
                )}
                {!lobby.ingame && lobby.players.length > 1 && (
                    <div className="retro-box">
                        {lobby.players.map(player => (
                            <div key={player.username} className="status-item">
                            <span className="player-name" title={player.username}>
                                {player.username}
                            </span>
                            <span>
                                {player.username === lobby.players[0].username 
                                    ? "🌟" 
                                    : (player.ready ? "✅" : "❌")
                                }
                            </span>
                        </div>
                        ))}
                    </div>
                )}
                {!isMobile && !lobby.ingame && (
                    <button className="start-btn" onClick={() => isHost ? startmatch(maps[mapIndex]) : readystate()}>
                        {isHost ? 'start' : (user.ready ? 'unready' : 'ready')}
                    </button>
                )}
            </div>
            
            {/* DESTRA: AVVERSARI */}
            {!isMobile && (<div className="column right-column">
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
            </div>)}
        </div>
    );
}

/* const mapDispatchToProps = { login, startmatch, readystate, move };
const mapStateToProps = (state) => ({
    message: state.alert.message,
    user: state.user,
    lobby: state.lobby,
    winner: state.tetris.winner,
});

export default connect(mapStateToProps, mapDispatchToProps)(LobbyPagePC); */
export default LobbyPagePC;