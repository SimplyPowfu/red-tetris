import { defineStore } from 'pinia';
import { ref } from 'vue';

interface State {
	isConnected: boolean,
	username: string,
	lobbyId: string,
	error: Error | null,
}

export const useAuthStore = defineStore('auth', {
	state: (): State => ({
		isConnected:false,
		username: '',
		lobbyId: '',
		error: null,
	}),
	actions: {
		setConnected(status: boolean) {
			this.isConnected = status;
		},
		setCredentials(username:string, lobby:string) {
			this.username = username;
			this.lobbyId = lobby;
		},
		setError(err:Error) {
			this.error = err;
		},
		authOk(username:string, lobby:string) {
			this.isConnected = true;
			this.username = username;
			this.lobbyId = lobby;
		}
	}
});