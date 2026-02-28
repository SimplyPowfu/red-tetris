import React, { useState, useEffect, useRef } from 'react';
import { useHistory } from 'react-router-dom';
import { connect } from 'react-redux';
import { login } from '../../actions/auth.js';
import { alertclear } from '../../actions/alert.js';
import '../main.css';
import Leaderboard from '../components/Leaderboard.jsx';
import {Tetriminos, BlockColor} from '../../../tetris/Piece.js'
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

const CELL_SIZE = 20;

const TetrisPiece = ({ type, row, col, rotate = 0 }) => {
    const shape = Tetriminos[type];
    
    const dynamicStyle = {
        gridTemplateColumns: `repeat(${shape[0].length}, ${CELL_SIZE}px)`,
        top: row * CELL_SIZE,
        left: col * CELL_SIZE,
        width: shape[0].length * CELL_SIZE,
        height: shape.length * CELL_SIZE,
        transform: `rotate(${rotate}deg)`,
    };

    return (
        <div style={dynamicStyle} className="moving-piece">
            {shape.flat().map((cell, i) => (
                <div 
                    key={i} 
                    className="piece-block"
                    style={{ backgroundColor: cell ? BlockColor[cell] : 'transparent' }}
                    data-filled={!!cell}
                />
            ))}
        </div>
    );
};

export const AuthPage = ({ login, alertclear, user, message }) => {
	const [username, setUsername] = useState('');
	const [error, setError] = useState('');
	const [lobbyId, setLobbyId] = useState('');
	const history = useHistory();
	const firstMount = useRef(true);
	const container = useRef();

	useGSAP(() => {
		const tl = gsap.timeline();

        tl.from(".moving-piece", {
            y: -300, 
            opacity: 0,
            duration: 1,
            stagger: 0.2
        });
		tl.to(".pixelated", { opacity: 1, duration: 0.5 }, 1.5);
    }, { scope: container });

	useEffect(() => {
		if (firstMount.current === true) {
			firstMount.current = false;
			return ;
		}
        if (user.username) {
            history.push(`/${user.lobbyId}/${user.username}`);
        }
    }, [user.username, user.lobbyId]);

	useEffect(() => {
        if (message) {
            setError(message);
            alertclear(); 
        }
    }, [message]);

	const handleSubmit = (e) => {
		e.preventDefault();
		if (!username || !lobbyId) return alert('Please enter username and lobby ID');

		// Dispatch the login action
		login({ username, lobbyId });
	}

	return (
		<div className="auth-page" ref={container}>

			<div className="tetris-grid">
				<TetrisPiece type="T" row={0} col={1} rotate={180}/>
				<TetrisPiece type="O" row={0} col={12} rotate={0}/>
				<TetrisPiece type="I" row={3} col={16} rotate={90}/>
				<TetrisPiece type="S" row={8} col={13} rotate={0}/>
				<TetrisPiece type="L" row={7} col={1} rotate={0}/>
				<h1 className='pixelated'>Red Tetris</h1>
            </div>

			<form onSubmit={handleSubmit} className="auth-form">
				<div className="input-group">
				<label>Username</label>
				<input
					type="text"
					value={username}
					onChange={(e) => setUsername(e.target.value)}
					placeholder="How they'll remember you"
					required
				/>
				</div>

				<div className="input-group">
				<label>Lobby</label>
				<input
					type="text"
					value={lobbyId}
					onChange={(e) => setLobbyId(e.target.value)}
					placeholder="Enter something pretty"
					required
				/>
				</div>

				<button type="submit" className="join-btn">
				Join Lobby
				</button>

				{error && <div className="message">{error}</div>}
			</form>

			{!user.username &&<Leaderboard/>}
		</div>
	);
}

const mapDispatchToProps = { login, alertclear };

const mapStateToProps = (state) => {
  return {
    message: state.alert.message,
	user: state.user,
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(AuthPage)
