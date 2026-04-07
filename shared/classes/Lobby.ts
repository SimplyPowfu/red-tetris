import { GameModeKey } from '../types/GameMode.js';
import Player from './Player.js'
// import type { GameMode } from '../Types/GameMode.js'
// import gameModes from '../Types/GameMode.js'

class Lobby
{
	private readonly _ID:string;
	private _gameMode:GameModeKey = 'basic';
	private _ingame:boolean = false;
	private _players:Set<string> = new Set();
	private _ready:Set<string> = new Set();

	constructor(__ID:string) {
		this._ID = __ID;
	}

	public get ID(): string {
		return this._ID;
	}

	public get gameMode(): GameModeKey {
		return this._gameMode;
	}

	public get ingame(): boolean {
		return this._ingame;
	}

	public get size(): number {
		return this._players.size;
	}

	public get host(): string {
		if (this.players.length === 0) return 'nobody';
		return [...this._players][0];
	}

	public get players(): string[] {
		return [...this._players];
	}

	public get ready(): string[] {
		return [...this._ready];
	}
	
	public join(__playerId:string) {
		if (this._ingame || this._players.has(__playerId)) return ;
		this._players.add(__playerId);
	}

	public leave(__playerId:string) {
		if (!this._players.has(__playerId)) return ;
		this._players.delete(__playerId);
		this._ready.delete(__playerId);
	}

	public setIngame(__value:boolean) {
		this._ingame = __value;
		if (__value === true) this._ready.clear();
	}

	public setGameMode(__mode:GameModeKey) {
		if (this._ingame === true) return ;
		this._gameMode = __mode;
	}

	public toggleReady(__playerId:string) {
		if (this._ingame === true) return false;

		if (this._ready.has(__playerId)) {
			this._ready.delete(__playerId);
			return false;
		}
		else {
			this._ready.add(__playerId);
			return true;
		}
	}

	public canStart(): boolean {
		
		return (
			// solo player
			(this.size === 1)
			// all ready
			|| (this.ingame === false && this._ready.size === this._players.size)
		);
	}
}

export default Lobby;