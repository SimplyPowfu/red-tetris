// Types
import Player from '@red/shared/classes/Player'

import bus from './bus.js'

export interface Profile {
	username:string;
	lobbyId:string;
}

// 1. Define the Map of Queries to their specific Return Types
interface PlayerQueries {
	'check:exist': /* { targets: string[] } |  */string;
	'check:username': /* { targets: string[] } |  */string;
	'get:profile': /* { targets: string[] } |  */string;
	'get:username': /* { targets: string[] } |  */string;
	'error': null;
}

interface PlayerResponses {
	'check:exist': boolean;
	'check:username': boolean;
	'check:ready' : boolean | null;
	'get:profile': Profile | null;
	'get:username': string | null;
	'error': null;
}

// Define the Map of Actions to their specific Payloads
interface PlayerActions {
	'player:reserve': { username: string };
	'player:release': { username: string };
	'player:force-logout': { socketId: string };
}

// Results are usually boolean (success) or void
interface ActionResults {
	'player:reserve': boolean;
	'player:release': void;
	'player:force-logout': boolean;
}

class PlayerService /* implements Service */ {

	private _players:Map<string, Player> = new Map();
	private _reservedNames: Set<string> = new Set();

	constructor() {
		// This service "reacts" to the system without being called directly
		bus.on('player:login', ({ username, lobbyId, socket }) => {
			this.playerLogin(username, lobbyId, socket.id);
		});
		bus.on('player:logout', ({ socketId }) => {
			this.playerLogout(socketId);
		});
	}

	private playerLogin(username:string, lobbyId:string, socketId:string)
	{
		if (this._players.has(socketId) ||
			[...this._players.values()].find(p => p.username === username))
			return ;

		// spawn player
		const player = new Player(socketId, username, lobbyId)

		// save linked player
		this._players.set(socketId, player);

		//removed reserved
		this._reservedNames.delete(username);
	}

	private playerLogout(socketId:string)
	{
		if (!this._players.has(socketId))
			return ;

		this._players.delete(socketId);
	}

	/* logging */
	public list() {
		console.log(this.status());
	}

	// returns the status string
	public status(): string {
		let status:string = '>Players\n';
		let i = 0;
		for (const [id, player] of this._players) {
			status += `${i}. ${id} - ${player.username}:${player.lobby}\n`;
			++i;
		}
		status += 'Total number of PLAYERS: ' + i + '\n';
		return status;
	}

	

	/* simple getter */
	public get(socketId:string) {
		return this._players.get(socketId);
	}

	/* query-types:
		- check:username
		- check:ready
		RETURN: 0+: Number of items that successfully performed the query. -1 Invalid query
	*/
	// Use a Generic <K> to link the Key to the Return Type
	public query<K extends keyof PlayerQueries>(
		type: K, 
		payload: PlayerQueries[K]
	): PlayerResponses[K] {

		switch (type) {
			case 'check:exist':
			{
				const target = payload as PlayerQueries['check:exist'];
				return this._players.has(target) as PlayerResponses[K];
			}
			case 'check:username':
			{
				const target = payload as PlayerQueries['check:username'];
				const isActive = [...this._players.values()].some(p => p.username === target);
				const isReserved = this._reservedNames.has(target);
				
				return (isActive || isReserved) as PlayerResponses[K];
			}
			case 'get:profile':
			{
				const target = payload as PlayerQueries['get:profile'];
				const player = this._players.get(target);
				if (player === undefined) return null as PlayerResponses[K];

				const profile = {
					username: player.username,
					lobbyId: player.lobby,
				};
				return profile as PlayerResponses[K];
			}
			case 'get:username':
			{
				const target = payload as PlayerQueries['get:username'];
				const player = this._players.get(target);
				if (player === undefined) return null as PlayerResponses[K];
				return player.username as PlayerResponses[K];
			}
			default:
				return null as PlayerResponses[K];
		}
	}

	/* Actions that alter the state */
	public dispatch<K extends keyof PlayerActions>(
		type: K,
		payload: PlayerActions[K]
	): ActionResults[K] {

		switch (type) {
			case 'player:reserve':
			{
				const { username } = payload as PlayerActions['player:reserve'];
				if (this._reservedNames.has(username)) return false as ActionResults[K];
				
				this._reservedNames.add(username);
				
				// Auto-release after 5 seconds if login isn't finalized
				setTimeout(() => this._reservedNames.delete(username), 5000);
				return true as ActionResults[K];
			}

			case 'player:release':
			{
				const { username } = payload as PlayerActions['player:release'];
				this._reservedNames.delete(username);
				return undefined as ActionResults[K];
			}

			case 'player:force-logout':
			{
				const { socketId } = payload as PlayerActions['player:force-logout'];
				return this.playerLogout(socketId) as ActionResults[K];
			}

			default:
				throw new Error(`Unknown action type: ${type}`);
		}
	}

}

const s = new PlayerService();

export default s;