import React, { useState, useEffect, useRef } from 'react';
import { useHistory } from 'react-router-dom';
import { connect } from 'react-redux';
import { login } from '../../actions/auth.js';
import { alertclear } from '../../actions/alert.js';
import '../main.css';
import Leaderboard from '../components/Leaderboard.jsx';

export const AuthPage = ({ login, alertclear, user, message }) => {
	const [username, setUsername] = useState('');
	const [error, setError] = useState('');
	const [lobbyId, setLobbyId] = useState('');
	const history = useHistory();
	const firstMount = useRef(true);

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
		<div className="auth-page">
			<h1>Welcome to Red-Tetris</h1>

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
