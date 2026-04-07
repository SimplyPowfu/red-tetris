import { Socket } from 'socket.io'
import type { EventSocket } from './types.js'

import bus from './bus.js'
import type { ServerToClientEvents } from '@red/shared/types/Events'

// 1. Define the Map of Queries to their specific Return Types
interface SocketQueries {
    /* 'check:exist': { targets: string[] | string }; */
	'error': null;
}

interface SocketResponses {
    /* 'check:exist': number; */
	'error': null;
}

export type Auth = {
	id:string,
	username:string,
	lobbyId:string,
}

export type AuthSocket = {
	socket:EventSocket,
	auth: Auth,
}

export class SocketService /* implements Service */
{
	private _sockets:Map<string, AuthSocket> = new Map();

	constructor() {
		// This service "reacts" to the system without being called directly
		bus.on('player:login', ({ username, lobbyId, socket }) => {
			this.playerLogin(username, lobbyId, socket);
		});
		bus.on('player:logout', ({ socketId }) => {
			this.playerLogout(socketId);
		});
	}

	/* logging */
	public list() {
		console.log(this.status());
	}

	// returns the status string
	public status(): string {
		let status:string = '>Sockets\n';
		let i = 0;
		for (const [id, socket] of this._sockets) {
			status += `${i}. ${id} - ${socket.auth.username}:${socket.auth.lobbyId}\n`;
			++i;
		}
		status += 'Total number of SOCKETS: ' + i + '\n';
		return status;
	}

	private playerLogin(username:string, lobbyId:string, socket:EventSocket)
	{
		if (this._sockets.has(socket.id))
			return ;
				
		this._sockets.set(socket.id, {
			socket,
			auth: { id: socket.id, username, lobbyId },
		});
	}

	private playerLogout(socketId:string)
	{
		if (!this._sockets.has(socketId))
			return ;

		this._sockets.delete(socketId);
	}

	/* public sender */
	// todo more precise sender that cycles trough socket list
	public emitToFiltered(__fn:(auth:Auth) => boolean, __event:keyof ServerToClientEvents, __data:any)
	{
		const target = [...this._sockets.values()].filter(socket => socket.auth && __fn(socket.auth));
		// console.log('[SocketHub] emitTo', target);
		target.forEach(t => t.socket.emit(__event, __data))
	}

	public emitTo(sockets:string[], __event:keyof ServerToClientEvents, __data:any)
	{
		for (const s of sockets) {
			const mysock = this._sockets.get(s);
			if (mysock !== undefined) mysock.socket.emit(__event, __data);
		}
	}

	/* simple getter */
	public get(socketId:string) {
		return this._sockets.get(socketId);
	}

	/* query-types:
		- check:exist
		- check:ingame
		RETURN: 0+: Number of items that successfully performed the query. -1 Invalid query
	*/
	// Use a Generic <K> to link the Key to the Return Type
    public query<K extends keyof SocketQueries>(
        type: K, 
        payload: SocketQueries[K]
    ): SocketResponses[K] {

		// Normalize targets to array
        // const targets = typeof payload === 'string' ? [payload] : (payload as any).targets;
		const target = payload;

		switch(type) {
			default:
				return null as SocketResponses[K];
		}
	}
}

const s = new SocketService();

export default s;