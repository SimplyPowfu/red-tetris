import React, { useState } from 'react';
import { connect } from 'react-redux';
import { login } from '../../actions/auth';
import '../main.css';

const AuthPage = ({ login, message }) => {
	const [username, setUsername] = useState('');
	const [lobbyId, setLobbyId] = useState('');

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

				{message && <div className="message">{message}</div>}
			</form>
			</div>
	);
}

const mapDispatchToProps = { login };

const mapStateToProps = (state) => {
  return {
    message: state.alert.message,
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(AuthPage)
