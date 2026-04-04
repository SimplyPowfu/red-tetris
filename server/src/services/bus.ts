import { EventEmitter } from 'events'
import type { EventSocket } from './types.js'
import type { BoardEvent } from '@red/shared/classes/Board';
import type { MapType } from '@red/shared/types/MapType';
import type { GameModeKey } from '@red/shared/types/GameMode';
  

// 1. Define the "Source of Truth" for your events
interface ServerEvents {
	'player:login': (data: { username: string, lobbyId: string, socket: EventSocket }) => void;
	'player:logout': (data: { socketId: string, socket: EventSocket }) => void;
	'player:update': (data: { socketId: string, score: number, board: MapType }) => void;
	'player:gameover': (data: { socketId: string, username: string, score: number }) => void;
	'player:win': (data: { socketId: string, score: number }) => void;
	'match:start': (data: { lobbyId: string; mode: GameModeKey, players: string[] }) => void;
	'match:over': (data: { lobbyId: string }) => void;
	// 'link:socket': (data: { socketId: string, socket:EventSocket }) => void;
	'board:spawned': (data: { boards: string[] }) => void;
	'board:event': (data: { emitter: string, event: BoardEvent, payload?: any }) => void;
	'board:clear': (data: { socketId: string }) => void;
	/* 'socket:broadcast': (data:SocketBroadcastPayload) => void; */
}

// 2. Create a Typed Emitter
class AppEventEmitter extends EventEmitter {
	// Overload the 'on' and 'emit' methods for type safety
	override on<K extends keyof ServerEvents>(event: K, listener: ServerEvents[K]): this {
		return super.on(event, listener);
	}

	override emit<K extends keyof ServerEvents>(event: K, ...args: Parameters<ServerEvents[K]>): boolean {
		console.log('[bus] emitting', event);
		return super.emit(event, ...args);
	}
}

const bus = new AppEventEmitter();

export default bus;