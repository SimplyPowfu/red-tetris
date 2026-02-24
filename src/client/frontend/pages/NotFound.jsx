import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import '../main.css';

export const NotFound = ({ history: historyProp }) => {
	const history = historyProp || useHistory();

	const handleSubmit = (e) => {
		e.preventDefault();
		history.push('/');
	}

	return (
		<div className="auth-page">
			<h1>Page Not Found</h1>
			<form onSubmit={handleSubmit} className="auth-form">
				<button className="join-btn">
					Go Home
				</button>
			</form>
		</div>
	);
}

export default (NotFound)
