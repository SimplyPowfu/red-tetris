import * as socketIO from 'socket.io-client'
// import { dispatch } from '../index'
import { connected, ping } from '../actions/server';

let socket;

export const createSocket = ({ dispatch }) => {
	socket = socketIO.default();

	socket.on('connect', () => {
		dispatch(connected());
	});

	const pingInterval = setInterval(() => dispatch(ping()), 20000);

	// dispatch server actions to Redux
	socket.on('action', (action) => {
		const { meta, ...rest } = action;
		dispatch(rest);
	});

	console.log('Socket connected')

	return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
	if (socket) socket.disconnect();

	console.log('Socket DISconnected')
};