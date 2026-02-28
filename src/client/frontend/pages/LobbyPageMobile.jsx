import React, { useState, useEffect, useRef } from 'react';
import { useHistory, useParams } from 'react-router-dom';

// Components
import PlayerBoard from '../components/Board.jsx';

import './MobileLobby.css';
import NextBlockMobile from '../components/NextBlockMobile.jsx';

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

export const LobbyPageMobile = ({ message, lobby, user, login, startmatch, readystate, move, winner }) => {
    
    const { room, player } = useParams();
    const history = useHistory();
    
    /* ============== MOBILE =============== */
    useEffect(() => {
        const preventScroll = (e) => {
            // Only prevent vertical swipe if the target is inside the game container
            if (e.target.closest('.lobby-container')) {
                e.preventDefault();
            }
        };

        document.addEventListener('touchmove', preventScroll, { passive: false });

        return () => {
            document.removeEventListener('touchmove', preventScroll);
        };
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
        const currentY = e.targetTouches[0].clientY;
        const deltaX = currentX - touchStart.current.lastX;
        const deltaY = currentY - touchStart.current.y;

        // If horizontal swipe, prevent browser back/forward
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            e.preventDefault();
        }

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

    /* ================================ */

    /* Loading page */
    if (!user.username || !lobby.players) return <div className="lobby-loading">Loading...</div>;

    return (
        <div className="mobile-lobby-container">
            {/* WIDGETS */}
            <div className="widget-box">

                <div className="retro-box">
                    <div className="retro-box-content">
                        <NextBlockMobile />
                    </div>
                </div>
                <div className="retro-box">
                    <div className="retro-box-title">SCORE</div>
                    <div className="retro-box-content">
                        <span className="score-val">{score}</span>
                    </div>
                </div>

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

            </div>

            {/* NAME TAG */}
            <div className="player-header">
                <span className="star-icon">{isHost && '★'}</span> 
                <span className="player-name">{user.username}</span>
            </div>

            {/* GAME BOARD */}
            <div className='gameplay-area'>
                <div className="mobile-board-wrapper"
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}>
                    {gameOver(winner)}
                    <PlayerBoard />
                </div>
                
                {/* MOBILE INPUTS */}
                {<div className="mobile-interactive-area">
                    {lobby.ingame && (
                        /* MOSTRA I TASTI DI GIOCO */
                        <div className="controls-container">
                            <div className="controls-row">
                                <button className="btn-left" onTouchStart={(e) => { /* e.preventDefault(); */ move('Left'); }}>◀</button>
                                <button className="btn-right" onTouchStart={(e) => { /* e.preventDefault(); */ move('Right'); }}>▶</button>
                            </div>
                            <div className="controls-row">
                                <button className="btn-rotate" onTouchStart={(e) => { /* e.preventDefault(); */ move('Rotate'); }}>⟳</button>
                                <button className="btn-down" onTouchStart={(e) => { /* e.preventDefault(); */ move('Down'); }}>▼</button>
                                <button className="btn-mega" onTouchStart={(e) => { /* e.preventDefault(); */ move('Mega'); }}>DROP</button>
                            </div>
                        </div>
                    )}
                </div>}
            </div>
            {/* LOBBY CONTROLS */}
            {lobby.ingame || (<div className="mobile-lobby-controls">
                {isHost && (
                    <div className="retro-box mobile-map-box">
                        <div className="retro-box-title">MAP</div>
                        <div className="retro-box-content">
                            <div className="map-selector">
                                <div className="arrow-btn" onClick={() => changeMap(-1)}>◄</div>
                                <span className="map-name">{maps[mapIndex].toUpperCase()}</span>
                                <div className="arrow-btn" onClick={() => changeMap(1)}>►</div>
                            </div>
                        </div>
                        <button className="start-btn" onClick={() => isHost ? startmatch(maps[mapIndex]) : readystate()}>
                            START
                        </button>
                    </div>
                )}
                {!isHost &&
                (<button className="start-btn" onClick={() => isHost ? startmatch(maps[mapIndex]) : readystate()}>
                    {(user.ready ? 'UNREADY' : 'READY')}
                </button>)}
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

export default connect(mapStateToProps, mapDispatchToProps)(LobbyPageMobile); */
export default LobbyPageMobile;