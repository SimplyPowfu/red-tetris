import { MapType } from "./MapType.js";
import Piece from "../classes/Piece.js";
import { BoardEvent } from "../classes/Board.js";
import { GameModeKey } from "./GameMode.js";

/* Payload types */
export interface LobbyPlayer {
	id:string;
	username:string;
	ready?:boolean;
	gameover?:boolean;
	score?:number;
	board?:MapType;
}

export interface LobbyInfo {
	id:string;
	ingame:boolean;
	host:string;
	players: LobbyPlayer[];
}


/* Socket events */
export interface ServerToClientEvents {
	noArg: () => void;
	basicEmit: (a: number, b: string, c: Buffer) => void;
	withAck: (d: string, callback: (e: number) => void) => void;

	/* specific socket events */
	matchStarted: () => void;
	
	// general updates (safe to keep them but don't abuse)
	boardUpdate: (data: { grid: MapType, activePiece: Piece, gameover: boolean }) => void;
	lobbyUpdate: (data: LobbyInfo) => void;
	
	// specific lobby updates
	lobbyMode: (data: { mode:GameModeKey }) => void;
	playerJoined: (data: { player: LobbyPlayer }) => void;
	playerLeft: (data: { id:string, newhost:string }) => void;
	playerReady: (data: { id:string, ready:boolean }) => void;
	playerUpdate: (data: { id:string, score:number, board:MapType }) => void;
	playerGameover: (data: { id:string }) => void;
	playerWin: (data: { id:string, score:number }) => void;

	// specific board updates
	boardEvent: (data: { event:BoardEvent, payload?:any }) => void;
}

export interface ClientToServerEvents {
	setLobbyMode: (data: { mode:GameModeKey }) => void;
	ready: () => void;
	tryStart: (callback: (ok:boolean, error:string) => void) => void;
	move: (type:string, callback: (ok:boolean, score:number) => void) => void;
}
