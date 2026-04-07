import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';

import type { ServerToClientEvents, ClientToServerEvents } from '@red/shared/types/Events'

export type EventSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

// The singleton instance
export let socket: EventSocket | null = null;

// // Replace with your actual server URL
const URL = process.env.NODE_ENV === "production" ? undefined : "http://localhost:3000";

const router = useRouter();

export const connectSocket = (username: string, lobbyId: string) => {
	const authStore = useAuthStore();

	// If a socket exists, disconnect it first (Standard Redux routine)
	if (socket) {
		socket.disconnect();
	}

	// Initialize with the auth payload
	socket = io({
		auth: { username, lobbyId },
		// In Vite, you might need to specify the server URL if it's not proxied
		// url: "http://localhost:3000" 
	});

	// #debug
	// ---------------------
	// Log all outgoing events
	socket.onAnyOutgoing((eventName, ...args) => {
		console.log(`Outgoing: ${eventName}`, args);
	});

	socket.onAny((eventName, ...args) => {
		console.log(`Incoming: ${eventName}`, args);
	});
	//----------------------

	//----------------------

	// Handle standard lifecycle events
	socket.on('connect', () => {
		console.log('Connected to server');
		authStore.setConnected(true);
	});

	socket.on('connect_error', (err) => {
		console.error('Connection error:', err.message);
		authStore.setConnected(false);
		authStore.setError(err);
	});

	socket.on('disconnect', (reason) => {

		// Clean up old listeners to prevent "double-firing"
		if (socket) {
			socket.off('lobbyUpdate');
			socket.off('lobbyMode');
			socket.off('matchStarted');
			socket.off('playerJoined');
			socket.off('playerLeft');
			socket.off('playerReady');
			socket.off('playerUpdate');
			socket.off('playerGameover');
			socket.off('playerWin');
			socket.off('boardUpdate');
			socket.off('boardEvent');
		}

		console.log('Disconnected:', reason);
		authStore.setConnected(false);
	});

	return socket;
};

export const disconnectSocket = () => {
  const authStore = useAuthStore();

  if (socket) {
    socket.disconnect();
    socket = null;
	authStore.isConnected = false;
  }
};