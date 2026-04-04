class Player
{
	public readonly ID:string;
	public readonly username:string
	public readonly lobby:string;

	/* private _ready:boolean = false; */

	constructor(__ID:string, __username:string, __lobby:string) {
		this.ID = __ID;
		this.username = __username;
		this.lobby = __lobby;
	}

	/* public get ready() {
		return this._ready;
	}

	public toggleReady() {
		this._ready = !this._ready;
	} */
}

export default Player;