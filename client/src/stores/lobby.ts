import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { socket } from '@/services/socket';
import type { MapType } from '@red/shared/types/MapType';
import type { LobbyInfo, LobbyPlayer } from '@red/shared/types/Events';
import type { BoardEvent } from '@red/shared/classes/Board';
// import type { EventSocket } from '@/services/socket';

interface State {
	ingame:boolean,
	hostName:string,
	isReady:boolean,

	// username : player
	players:Map<string, LobbyPlayer>,
	id_to_username:Map<string, string>,

	// 
	winner:string,

	error:string,
}

const initState = (): State => ({
	// State from your Board class logic
	ingame: false,
	hostName: '',
	isReady: false,
	players: new Map(),
	id_to_username: new Map(),
	winner: '',
	error: '',
});

export const useLobbyStore = defineStore('lobby', {
	
	state: initState,
	actions: {
		// This function binds your "SocketDB" logic to the store
		initSocketListeners() {
			if (!socket) return;
	
			// clear on disconnect
			socket.on('disconnect', () => {
				this.$state = initState();
			});

			// Sync with server/Board events
			socket.on('lobbyUpdate', (data: LobbyInfo) => {

				// clear players
				this.players = new Map();
				this.id_to_username = new Map();

				data.players.forEach(p => {
					this.players.set(p.username, p);
					this.id_to_username.set(p.id, p.username);
				});

				this.ingame = data.ingame;

				const host = data.players.find(p => p.id === data.host) as LobbyPlayer;
				this.hostName = host.username;
			});

			// game is started
			socket.on('matchStarted', () => {
				this.ingame = true;
				this.isReady = false;
				this.winner = '';
				this.players.forEach((player, _) => {
					player.ready = false;
					player.gameover = false;
				});
			});

			// Set player state
			socket.on('playerJoined', (data: { player:LobbyPlayer }) => {
				if (!this.players.has(data.player.username)) {
					this.players.set(data.player.username, data.player);
					this.id_to_username.set(data.player.id, data.player.username);
				}
			});

			socket.on('playerLeft', (data: { id:string, newhost:string }) => {
				const target = this.id_to_username.get(data.id);
				if (target !== undefined)
				{
					this.players.delete(target);
					this.id_to_username.delete(data.id);

					// set new host
					const host = this.id_to_username.get(data.newhost) as string;
					this.hostName = host;
				}
			});

			socket.on('playerReady', (data: { id:string, ready:boolean }) => {
				const username = this.id_to_username.get(data.id);
				if (username === undefined) return ;
				const player = this.players.get(username) as LobbyPlayer;
				player.ready = data.ready;
			});

			socket.on('playerUpdate', (data: { id:string, score:number, board:MapType }) => {
				const username = this.id_to_username.get(data.id);
				if (username === undefined) return ;
				const player = this.players.get(username) as LobbyPlayer;
				player.board = data.board;
				player.score = data.score;
			});

			// someone lost (not me)
			socket.on('playerGameover', (data: { id:string }) => {
				const username = this.id_to_username.get(data.id);
				if (username === undefined) return ;
				const player = this.players.get(username) as LobbyPlayer;
				player.gameover = true;
			});

			// I lost...
			socket.on('boardEvent', (data: { event:BoardEvent, payload?:any }) => {
				if (data.event === 'gameover' && this.players.size === 1) this.ingame = false;
			})

			socket.on('playerWin', (data: { id:string, score:number }) => {
				const username = this.id_to_username.get(data.id);
				if (username === undefined) this.winner = 'the-evil-kiwi';
				else this.winner = username;

				this.ingame = false;
				this.isReady = false;
			})
		},
		toggleReady() {
			// clear error log
			this.error = '';

			if (!socket) return ;
	
			console.log('[Lobby] Emitting \'ready\'');
			socket.emit('ready');
		},
		tryStart() {
			// clear error log
			this.error = '';

			if (!socket) return ;
	
			console.log('[Lobby] Emitting \'tryStart\'');
			socket.emit('tryStart', (ok:boolean, error:string) => {
				if (ok === true) {
					// #todo log starting...
				}
				else {
					this.error = error;
				}
			});
		}
	}
});