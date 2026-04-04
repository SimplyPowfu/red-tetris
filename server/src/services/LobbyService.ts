// Types
import Lobby from '@red/shared/classes/Lobby'

import bus from './bus.js'
import type { GameModeKey } from '@red/shared/types/GameMode';

interface LobbyInfo {
	host:string;
	ingame:boolean;
	players: string[]
}	

// 1. Define the Map of Queries to their specific Return Types
interface LobbyQueries {
	'check:exist': /* { targets: string[] } | */ string;
	'check:start': /* { targets: string[] } | */ string;
	'check:ingame': /* { targets: string[] } | */ string;
	'check:player_ready' : string;
	'get:players_list': /* { targets: string[] } | */ string;
	'get:lobbyof': string;
	'lobby:info': /* { targets: string[] } | */ string;
	'error': null;
}

interface LobbyResponses {
	'check:exist': boolean;
	'check:start': boolean | null;
	'check:ingame': boolean | null;
	'check:player_ready' : boolean | null;
	'get:players_list': string[] | null;
	'get:lobbyof': string | null;
	'lobby:info': LobbyInfo | null;
	'error': null;
}

// Define the Map of Actions to their specific Payloads
interface LobbyActions {
	'lobby:gamemode': { socketId: string, mode:GameModeKey };
}

// Results are usually boolean (success) or void
interface ActionResults {
	'lobby:gamemode': boolean;
}

class LobbyService/*  implements Service */ {

	private _lobbies:Map<string, Lobby> = new Map();
	private _player_to_lobby:Map<string, Lobby> = new Map();

	constructor() {
		// This service "reacts" to the system without being called directly
		bus.on('player:login', ({ /* username, */ lobbyId, socket }) => {
			this.playerLogin(lobbyId, socket.id);
		});
		bus.on('player:logout', ({ socketId }) => {
			this.playerLogout(socketId);
		});
		bus.on('match:start', ({ lobbyId }) => {
			this.matchStart(lobbyId);
		});
		bus.on('match:over', ({ lobbyId/* , score  */}) => {
			this.matchOver(lobbyId);
		});
	}

	/* logging */
	public list() {
		console.log('>Lobbies');
		let i = 0;
		for (const [id, lobby] of this._lobbies) {
			console.log(`${i}. ${id} - ${lobby.players}`);
			++i;
		}
	}

	// #todo better lobby find
	private playerLogin(lobbyId:string, socketId:string)
	{	
		// check if player already joined
		const joined = this._player_to_lobby.has(socketId);
		if (joined) return ;

		// add new lobby if not existing
		let lobby = this._lobbies.get(lobbyId);
		if (lobby === undefined) {
			lobby = new Lobby(lobbyId);
			this._lobbies.set(lobbyId, lobby);
		}

		// LobbyService's private register
		this._player_to_lobby.set(socketId, lobby);

		lobby.join(socketId);
	}

	private playerLogout(socketId:string)
	{
		const lobby = this._player_to_lobby.get(socketId);
		if (!lobby) return ;

		lobby.leave(socketId);

		// remove from private register
		this._player_to_lobby.delete(socketId);

		// delete lobby if empty
		if (lobby.size === 0) this._lobbies.delete(lobby.ID);
	}

	private matchStart(lobbyId:string)
	{
		const lobby = this._lobbies.get(lobbyId);
		if (!lobby) return ;

		lobby.setIngame(true);
	}

	private matchOver(lobbyId:string)
	{
		const lobby = this._lobbies.get(lobbyId);
		if (!lobby) return ;

		lobby.setIngame(false);
	}

	/* simple getter */
	public get(lobbyId:string) {
		return this._lobbies.get(lobbyId);
	}

	/* query-types:
		- check:exist
		- check:ingame
		RETURN: 0+: Number of items that successfully performed the query. -1 Invalid query
	*/
	// Use a Generic <K> to link the Key to the Return Type
    public query<K extends keyof LobbyQueries>(
        type: K, 
        payload: LobbyQueries[K]
    ): LobbyResponses[K] {

		switch (type) {
			case 'check:exist':
			{
				const target = payload as LobbyQueries['check:exist'];
				return this._lobbies.has(target) as LobbyResponses[K];
			}
			case 'check:ingame':
			{
				const target = payload as LobbyQueries['check:ingame'];
				const lobby = this._lobbies.get(target);
				if (lobby === undefined) return null as LobbyResponses[K];
				else return lobby.ingame as LobbyResponses[K];
			}
			case 'check:start':
			{
				const target = payload as LobbyQueries['check:start'];
				const lobby = this._lobbies.get(target);
				if (lobby === undefined) return null as LobbyResponses[K];
				return (lobby.players.length === lobby.ready.length) as LobbyResponses[K];
			}
			case 'check:player_ready':
			{
				const target = payload as LobbyQueries['check:player_ready'];
				const lobby = this._player_to_lobby.get(target);
				if (lobby === undefined) return null as LobbyResponses[K];

				const ready = lobby.ready.find(p => p === target);
				return (ready !== undefined) as LobbyResponses[K];
			}
			case 'get:players_list':
			{
				const target = payload as LobbyQueries['get:players_list'];
				const lobby = this._lobbies.get(target);
				if (lobby === undefined) return null as LobbyResponses[K];
				return lobby.players as LobbyResponses[K];
            }
			case 'get:lobbyof':
			{
				const target = payload as LobbyQueries['get:lobbyof'];
				const lobby = this._player_to_lobby.get(target);
				if (lobby === undefined) return null as LobbyResponses[K];
				return lobby.ID as LobbyResponses[K];
			}
			case 'lobby:info':
			{
				const target = payload as LobbyQueries['lobby:info'];
				const lobby = this._lobbies.get(target);
				if (lobby === undefined) return null as LobbyResponses[K];

				const info = {
					host: lobby.players[0] as string,
					ingame: lobby.ingame,
					players: lobby.players,
				}

				return info as LobbyResponses[K];
			}
			default:
				return null as LobbyResponses[K];
		}
	}

	/* Actions that alter the state */
	public dispatch<K extends keyof LobbyActions>(
		type: K,
		payload: LobbyActions[K]
	): ActionResults[K] {

		switch (type) {
			
			case 'lobby:gamemode':
			{
				const { socketId, mode } = payload as LobbyActions['lobby:gamemode'];

				// get lobby
				const lobby = this._player_to_lobby.get(socketId);
				if (!lobby || lobby.ingame || lobby.host !== socketId) return false as ActionResults[K];
				
				lobby.setGameMode(mode);
				return true as ActionResults[K];
			}

			default:
				throw new Error(`Unknown action type: ${type}`);
		}
	}
}

const s = new LobbyService();

export default s;