
// Services
import LobbyService from './LobbyService.js'
import PlayerService, { type Profile } from './PlayerService.js'
import BoardService from './BoardService.js'
import SocketService, { type Auth } from './SocketService.js'
import ScoreService from './ScoreService.js'

import bus from './bus.js'
import type { EventSocket } from './types.js'
import type { MapType } from '@red/shared/types/MapType'

import type { LobbyInfo } from '@red/shared/types/Events'
import type Lobby from '@red/shared/classes/Lobby'
import type { ServerToClientEvents } from '@red/shared/types/Events'
import type { BoardEvent } from '@red/shared/classes/Board'
import type { GameModeKey } from '@red/shared/types/GameMode'

// Defined to dispatch socket events
type SocketEventPayload = {
	[K in keyof ServerToClientEvents]: {
	  event: K;
	  subPayload: Parameters<ServerToClientEvents[K]>[0]; // Extracts the first argument of the function
	}
} [keyof ServerToClientEvents];

// Define the Map of Queries to their specific Return Types
interface QueryPayloads {
	'lobby:full_info': /* { targets: string[] } | */ string;
	'lobby:host': string;
	'score:leaderboard': null;
	'score:hall-of-fame': null;
	'error': null;
}

interface QueryResponses {
	'lobby:full_info': LobbyInfo | null;
	'lobby:host': string | null;
	'score:leaderboard': [string, number][];
	'score:hall-of-fame': [string, [number, number]][];
	'error': null;
}

// 1. Define your Action Map
interface ActionPayloads {
	'player:register': { username: string; lobbyId:string; socket: EventSocket };
	'player:reserve': { username:string, lobbyId:string };
	'player:ready': { socketId:string, lobbyId:string };
	'player:try_start': { socketId:string, lobbyId:string };
	'lobby:gamemode': { socketId: string; mode: GameModeKey };
	'board:update': { matrix: number[][] };
	'socket:broadcast': { sockets:string[] } & SocketEventPayload;
	'socket:lobbycast': { lobbyId:string } & SocketEventPayload;
}

interface ActionResults {
	'player:register': { success: boolean; socketId: string };
	'player:reserve': boolean;
	'player:ready': boolean;
	'player:try_start': { success:false, error:string, players?:string[] };
	'lobby:gamemode': void;
	'board:update': boolean;
	'socket:broadcast': boolean;
	'socket:lobbycast': boolean;
}

// 2. The Generic Dispatcher
class ServiceHub {

	constructor () {
		bus.on('board:spawned', ({ boards }) => {
			this.boardSpawned(boards);
		})
		bus.on('board:event', ({ emitter, event, payload }) => {
			this.boardEvent(emitter, event, payload);
		});
		bus.on('player:update', ({ socketId, score, board }) => {
			this.playerUpdate(socketId, score, board);
		});
		bus.on('player:gameover', ({ socketId, score }) => {
			this.playerGameover(socketId, score);
		});
		bus.on('player:win', ({ socketId, score }) => {
			this.playerWin(socketId, score);
		});
	}

	/* event listeners */
	private boardEvent(emitter:string, event:BoardEvent, payload?:any) {
		this.socketLobbyEmit(emitter, 'boardEvent', { event, payload });
	}

	private playerUpdate(socketId:string, score:number, board:MapType) {
		this.socketLobbyEmit(socketId, 'playerUpdate', { id:socketId, score, board });
	}

	private playerGameover(socketId:string, score:number) {
		this.socketLobbyEmit(socketId, 'playerGameover', { id:socketId, score });
	}

	private playerWin(socketId:string, score:number) {
		this.socketLobbyCast(socketId, 'playerWin', { id:socketId, score });
	}

	private boardSpawned(boards:string[]) {
		for (const b of boards) {
			const mysocket = SocketService.get(b);
			if (mysocket) BoardService.dispatch('link:socket', { socketId:b, username:mysocket.auth.username, socket:mysocket.socket });
		}
	}

	//-----------------

	private getFullLobbyInfo(lobbyId: string): LobbyInfo | null {
		// 1. Get the base lobby data (player IDs)
		const lobby = LobbyService.get(lobbyId); 
		if (!lobby) return null;

		// 2. Map over the IDs to collect data from other services
		return {
			id: lobby.ID,
			host: lobby.host/* PlayerService.query('get:username', lobby.host) as string */,
			ingame: lobby.ingame,
			players: lobby.players.map(socketId => {
				return {
					id:socketId,
					// Ask PlayerService for the name
					username: PlayerService.query('get:username', socketId) as string,
					// Ask PlayerService if player is ready
					ready: lobby.ready.find(p => p === socketId) !== undefined,
					// Ask BoardService for the current tetris grid
					gameover: BoardService.query('check:gameover', socketId) as boolean,
					// Ask BoardService if the player is alive
					board: BoardService.query('get:grid', socketId) as MapType
				};
			})
		};
	}

	private reserveIdentity(username: string, lobbyId: string) {
		// 1. Check if name is taken OR currently being reserved
		const isTaken = PlayerService.query('check:username', username);
		if (isTaken) throw new Error("Username already exists");

		// 2. "Lock" the name for a few seconds
		// This prevents the race condition!
		PlayerService.dispatch('player:reserve', { username });

		// 3. Check Lobby
		const isIngame = LobbyService.query('check:ingame', lobbyId);
		if (isIngame) {
			PlayerService.dispatch('player:release', { username }); // Clean up the lock
			throw new Error("Lobby already ingame");
		}

		return true;
	}

	// Assuming the user has valid credentials
	private playerRegister(username:string, lobbyId:string, socket:EventSocket) {
		// The Hub tells the rest of the app: "This is official, log them in."
		bus.emit('player:login', { 
			username: username, 
			lobbyId: lobbyId, 
			socket: socket 
		});
		return true;
	}

	private tryStart(socketId:string, lobbyId:string)
	{
		const lobby = LobbyService.get(lobbyId);
		if (lobby === undefined || lobby.host !== socketId) {
			return ({
				success: false,
				error: "Not your lobby"
			});
		}

		const startable = lobby.canStart();
		if (startable === false) {
			return ({
				success: false,
				error: "Lobby can't start",
			});
		}
		else {
			return ({
				success: true,
				error: "None",
				players: lobby.players,
				mode: lobby.gameMode,
			});
		}
	}

	/* socket senders */
	private socketBroadcast(sockets:string[], event:keyof ServerToClientEvents, data:any)
	{
		SocketService.emitTo(sockets, event, data);
	}

	// emit to all players in lobby
	private socketLobbyCast(socketId:string, event:keyof ServerToClientEvents, payload?:any)
	{
		const lobbyId = LobbyService.query('get:lobbyof', socketId);
		if (lobbyId === null) return ;

		// get all the players but the emitter
		const lobby = LobbyService.get(lobbyId) as Lobby;
		const sockets = lobby.players

		// broadcast
		this.socketBroadcast(sockets, event, payload);
	}

	// Emit to all players in lobby BUT the emitter
	private socketLobbyEmit(emitter:string, event:keyof ServerToClientEvents, payload?:any)
	{
		const lobbyId = LobbyService.query('get:lobbyof', emitter);
		if (lobbyId === null) return ;

		// get all the players but the emitter
		const lobby = LobbyService.get(lobbyId) as Lobby;
		const sockets = lobby.players.filter(p => p !== emitter);

		// broadcast
		this.socketBroadcast(sockets, event, payload);
	}

	/* ============== DISPATCHER ============== */

	// We use T to capture the specific string literal of the action
	public dispatch<T extends keyof ActionPayloads>(
		action: T, 
		payload: ActionPayloads[T]
	): ActionResults[T] {

		// Logic here...
		console.log(`Executing ${action}`);

		switch(action) {
			case 'player:register':
			{
				const { username, lobbyId, socket } = payload as ActionPayloads['player:register'];
				const success = this.playerRegister(username, lobbyId, socket);
				return {
					success,
					socketId:socket.id
				} as ActionResults[T];
			}
			case 'player:reserve':
			{
				const { username, lobbyId } = payload as ActionPayloads['player:reserve'];
				const success = this.reserveIdentity(username, lobbyId);
				return success as ActionResults[T];
			}
			case 'player:ready':
			{
				const { socketId, lobbyId } = payload as ActionPayloads['player:ready'];

				const lobby = LobbyService.get(lobbyId);
				if (lobby === undefined) return false as ActionResults[T];

				const ready = lobby.toggleReady(socketId);

				// tell everyone that player changed state
				this.socketBroadcast(lobby.players, 'playerReady', { id:socketId, ready:ready });

				return ready as ActionResults[T];

			}
			case 'player:try_start':
			{
				const { socketId, lobbyId } = payload as ActionPayloads['player:try_start'];
				const ret = this.tryStart(socketId, lobbyId);
				if (ret.success === true) {
					console.log('lobby', lobbyId, 'starting with', ret.players);
					bus.emit('match:start', { lobbyId, mode: ret.mode as GameModeKey, players: ret.players as string[] })
				}
				return ret as ActionResults[T];
			}
			case 'lobby:gamemode':
			{
				const { socketId, mode } = payload as ActionPayloads['lobby:gamemode'];
				const ret = LobbyService.dispatch('lobby:gamemode', { socketId, mode });
				if (ret === true) this.socketLobbyCast(socketId, 'lobbyMode', { mode });
				return ret as ActionResults[T];
			}
			case 'socket:broadcast':
			{
				const { sockets, event, /* payload */subPayload } = payload as ActionPayloads['socket:broadcast'];
				this.socketBroadcast(sockets, event, subPayload);
				return true as ActionResults[T];
			}
			case 'socket:lobbycast':
			{
				const { lobbyId, event, /* payload */subPayload } = payload as ActionPayloads['socket:lobbycast'];

				// get the lobby
				const lobby = LobbyService.get(lobbyId);
				if (lobby === undefined) return false as ActionResults[T]

				// broadcast to sockets
				const sockets = lobby.players;
				this.socketBroadcast(sockets, event, subPayload);

				return true as ActionResults[T];
			}
			default:
				throw new Error(`Unknown action type: ${action}`);
		}
	}

	/* ================ QUERY-er =============== */
	// Use a Generic <K> to link the Key to the Return Type
		public query<K extends keyof QueryPayloads>(
			type: K, 
			payload: QueryPayloads[K]
		): QueryResponses[K] {
		
			switch (type) {
				case 'lobby:full_info':
				{
					const target = payload as QueryPayloads['lobby:full_info'];
					return this.getFullLobbyInfo(target) as QueryResponses[K];
				}
				case 'lobby:host':
				{
					const target = payload as QueryPayloads['lobby:host'];
					const lobby = LobbyService.get(target);
					if (lobby === undefined) return null as QueryResponses[K];
					return lobby.host as QueryResponses[K];
				}
				case 'score:leaderboard':
				{
					return ScoreService.query('leaderboard:get', null) as QueryResponses[K];
				}
				case 'score:hall-of-fame':
				{
					return ScoreService.query('hall-of-fame:get', null) as QueryResponses[K];
				}
				default:
					return null as QueryResponses[K];
			}
		}
}

// Usage:
const hub = new ServiceHub();

export default hub;

// This is fully type-checked! 
// If you type "player:login", TS will demand username/socketId.
/* const result = hub.dispatch('player:login', { 
	username: 'TetrisGod', 
	socketId: '123' 
}); */