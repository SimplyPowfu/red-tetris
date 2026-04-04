// Types
import Board, { type BoardEvent } from '@red/shared/classes/Board'
import type { MapType } from '@red/shared/types/MapType'

import bus from './bus.js'
import type { EventSocket } from './types.js'
import type { GameModeKey } from '@red/shared/types/GameMode';

const INT_MAX_2 = 1073741824;

// 1. Define the Map of Queries to their specific Return Types
interface BoardQueries {
    'check:exist': /* { targets: string[] } | */ string;
    'check:gameover': /* { targets: string[] } | */ string;
	'get:grid': /* { targets: string[] } | */ string;
	'error': null;
}

interface BoardResponses {
    'check:exist': boolean;
    'check:gameover': boolean | null;
	'get:grid' : MapType | null;
	'error': null;
}

// Define the Map of Actions to their specific Payloads
interface BoardActions {
	'link:socket': { socketId: string, username:string, socket:EventSocket };
}

// Results are usually boolean (success) or void
interface ActionResults {
	'link:socket': boolean;
}

class BoardService/*  implements Service  */{

	/* playerId - Board */
	private _boards:Map<string, Board> = new Map();
	private _board_to_lobby:Map<string, [string, Set<string>]> = new Map();

	constructor() {
		// This service "reacts" to the system without being called directly
		bus.on('match:start', ({ lobbyId, mode, players }) => {
			this.matchStart(lobbyId, mode, players);
		});
		bus.on('player:logout', ({ socketId, socket }) => {
			this.boardClear(socketId, socket);
		});
		bus.on('player:gameover', ({ socketId, score }) => {
			this.playerGameover(socketId, score);
		});
		bus.on('board:event', ({ emitter, event, payload }) => {
			this.boardEvent(emitter, event, payload);
		});
		bus.on('board:clear', ({ socketId }) => {
			this.boardClear(socketId);
		});
		// bus.on('link:socket', ({ socketId, socket }) => {
		// 	this.linkSocket(socketId, socket);
		// });
	}

	/* logging */
	public list() {
		console.log('>Boards');
		let i = 0;
		for (const [id, board] of this._boards) {
			console.log(`${i}. ${id} - ${board.score}`);
			++i;
		}
	}

	/* --- event listeners --- */
	private matchStart(lobbyId:string, mode:GameModeKey, players:string[])
	{
		const seed = Math.floor(INT_MAX_2 + Math.random() * INT_MAX_2);

		// spawn one board for each player
		for (const p of players) {

			// spawn board
			console.log('SPAWNING BOARD with MODE', mode);
			const board = new Board(mode, seed, (e) => console.log('[Board] ingame-event', e));
			console.log("AFTER CONSTRUCTOR:", board.gameover); // should be false

			// add to maps
			this._boards.set(p, board);
			this._board_to_lobby.set(p, [lobbyId, new Set(players)]);
		}

		bus.emit('board:spawned', { boards:players });
	}

	private boardEvent(emitter:string, event:BoardEvent, payload?:any)
	{
		const socketId = emitter;
		const [lobbyId, alive] = this._board_to_lobby.get(socketId) as [string, Set<string>];

		for (const player of alive) {
			if (player === emitter) continue ;
			const board = this._boards.get(player);
			if (board !== undefined)
				board.event(event, payload);
		}
	}

	private boardClear(socketId:string, socket?:EventSocket)
	{
		const board = this._boards.get(socketId);
		if (!board) return false;

		// destroy internal board elements
		board.destroy();

		// also remove the socket listener
		if (socket && (socket as any)._mvHandler) {
			socket.off('move', (socket as any)._mvHandler);
		}

		// remove from maps
		this._boards.delete(socketId);
		this._board_to_lobby.delete(socketId);
	}

	private playerGameover(socketId:string, score:number)
	{
		const lobby = this._board_to_lobby.get(socketId);
		if (lobby === undefined) {
			console.warn('[BoardService] stray socketId just lost');
			return ;
		}

		// one less alive player
		const [lobbyId, alive] = lobby;

		alive.delete(socketId);
		this.boardClear(socketId);

		if (alive.size <= 1) {
			if (alive.size === 1) {
				const winner = [...alive][0] as string;
				bus.emit('player:win', { socketId:winner, score });
				this.boardClear(winner);
			}
			bus.emit('match:over', { lobbyId });
		}
	} 

	// socket listeners directly at the board level
	private linkSocket(socketId:string, username:string, socket:EventSocket)
	{
		console.log('[Board] linking socket', socketId);
		const board = this._boards.get(socketId);
		if (!board) return false;

		// get the lobby
		// const [lobbyId, _] = this._board_to_lobby.get(socketId) as [string, Set<string>];
				
		// handle move events
		const mv = (__type:string, cb:(ok:boolean, score:number) => void) => {
			console.log('[Board] got move', __type);
			const { ok, score, after } = board.move(__type, false);

			console.log('returning', ok);
			cb(ok, score);
			// calling after
			after?.();
		}

		// emit board events
		const el = (event:BoardEvent, payload?:any) => {
			console.log('emitting ingame-event', event);

			switch (event) {
				case 'penality':
					bus.emit('board:event', { emitter:socketId, event, payload });
					break ;
				case 'update':
					bus.emit('player:update', { socketId, ...payload });
					break ;
				case 'gameover':
					// emit server event
					bus.emit('player:gameover', { socketId, username, score:payload });
					// also directly tell the client
					socket.emit('boardEvent', { event,  payload });
					// also remove the socket listener
					if ((socket as any)._mvHandler) {
						socket.off('move', (socket as any)._mvHandler);
					}
					break ;
				default:
					socket.emit('boardEvent', { event,  payload });
			}
		}
		
		/* mv handler setup */
		{
			// remove old if exists
			if ((socket as any)._mvHandler) {
				socket.off('move', (socket as any)._mvHandler);
			}
			// store reference
			(socket as any)._mvHandler = mv;

			// add handler
			socket.on('move', mv);
		}

		console.log('[Board] OK');
		
		board.start(el);
		socket.emit('matchStarted');

		return true;
	}

	/* simple getter */
	public get(socketId:string) {
		return this._boards.get(socketId);
	}

	/* query-types:
		- check:exist
		- check:ingame
		RETURN: 0+: Number of items that successfully performed the query. -1 Invalid query
	*/
	// Use a Generic <K> to link the Key to the Return Type
    public query<K extends keyof BoardQueries>(
        type: K, 
        payload: BoardQueries[K]
    ): BoardResponses[K] {

		switch (type) {
			case 'check:exist':
			{
				const target = payload as BoardQueries['check:exist'];
				return this._boards.has(target) as BoardResponses[K];
			}
			case 'check:gameover':
			{
				const target = payload as BoardQueries['check:gameover'];
				const board = this._boards.get(target);
				if (board === undefined) return null as BoardResponses[K];
				return board.gameover as BoardResponses[K];
			}
			case 'get:grid':
			{
				const target = payload as BoardQueries['get:grid'];
				const board = this._boards.get(target);
				if (board === undefined) return null as BoardResponses[K];
				return board.grid as BoardResponses[K];
			}
			default:
				return null as BoardResponses[K];
		}
	}

	//------------------------------------------

	/* Actions that alter the state */
	public dispatch<K extends keyof BoardActions>(
		type: K,
		payload: BoardActions[K]
	): ActionResults[K] {

		switch (type) {
			
			case 'link:socket':
			{
				const { socketId, username, socket } = payload as BoardActions['link:socket'];
				return this.linkSocket(socketId, username, socket) as ActionResults[K];
			}

			default:
				throw new Error(`Unknown action type: ${type}`);
		}
	}
}

const s = new BoardService();

export default s;