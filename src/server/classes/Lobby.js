import Game, { ENDMATCH, HIGHSCORE, WINMATCH } from './Game';

// Services
import DispatchQueue from '../services/Queue.js';
import SHub from '../services/SocketHub.js';
// import store from '../services/Store.js'

import { endmatch, winmatch, deletelobby, startmatch, highscore } from '../actions/tetris';
import { requpdate } from '../actions/lobby.js';


/* @loopSchedule programs 10 game ticks to be played on repeat, from 0 to 9
   @startGrdi is the grid that will be loaded at the beginning of the match */
const GameModes = {
	basic: {
		loopSchedule: {
			tickMs: 100,
			9: 'Down'
		},
		startGrid:"basic",
	},
	ghost: {
		loopSchedule: {
			tickMs: 100,
			8: 'Rotate',
			9: 'Down'
		},
		startGrid:"ghost",
	},
	invaders: {
		loopSchedule: {
			tickMs: 100,
			4: 'Shot',
			9: 'Down'
		},
		startGrid:"invaders",
	},
	wiggly: {
		loopSchedule: {
			tickMs: 50,
			2: 'Left',
			4: 'Down',
			7: 'Right',
			9: 'Down'
		},
		startGrid:"wiggly",
	},
}

export default class Lobby
{
	_ID = null;
	_ingame = false;
	_players = new Set();
	_ready = new Set();
	_gameMode = GameModes["basic"];
	_game = null;
	
	constructor(__ID, __gameMode) {
		this._ID = __ID;
		if (__gameMode) this._gameMode = __gameMode;
	}

	get players() {
		return Array.from(this._players.values());
	}

	get ready() {
		return Array.from(this._ready.values());
	}

	get ingame() {
		return this._ingame;
	}

	get game() {
		return this._game;
	}

	/* Player management action */
	join(senderId) {
		this._players.add(senderId);
	}

	leave(senderId) {
		this._players.delete(senderId);
		this._ready.delete(senderId);

		// console.log('[LOBBY]', this.ingame, this._game[senderId] !== undefined)
		if (this._ingame && this._game[senderId] !== undefined) {
			this._game.leave(senderId);
		}

		if (this._players.size === 0) {
			DispatchQueue.push(deletelobby(this._ID), `lobby:${this._ID}`);
			// store.dispatch(deletelobby(this._ID));
		}
	}

	setready(senderId) {
		if (this._ready.has(senderId))
			this._ready.delete(senderId);
		else
			this._ready.add(senderId);
	}

	/* private :eyes: */
	daddy() {
		return (issue) => {
			switch (issue.type) {
				case WINMATCH:
					this.winmatch(issue.payload.winner);
					break ;
				case ENDMATCH:
					this.endmatch();
					break ;
				case HIGHSCORE:
					DispatchQueue.push(highscore(issue.payload.senderId, issue.payload.score), `lobby:${this._ID}`);
					// store.dispatch(highscore(issue.payload.senderId, issue.payload.score));
					break ;
				default:
					console.warn('[LOBBY] invalid complaint of type', issue.type);
			}
		}
	}

	/* Match management actions */
	startmatch(mode)
	{
		if (this._ready.size >= this._players.size - 1)
		{
			console.log('[LOBBY] starting match...', mode);
			
			// Set the mode
			if (mode) {
				if (GameModes[mode]) this._gameMode = GameModes[mode];
			}

			this._ingame = true;
			this._game = new Game(this._players, this._gameMode, this._ID, this.daddy());

			// Send to client
			DispatchQueue.push(requpdate(this._ID), `lobby:${this._ID}`);
			// store.dispatch(requpdate(this._ID))

			this.game.startmatch();
		}
	}

	winmatch(winner) {
		if (this._ingame === false)
			return ;
		// Dispatch winmatch
		DispatchQueue.push(winmatch(this._ID, winner), `lobby:${this._ID}`);
		// store.dispatch(winmatch(this._ID, winner));

		// endmatch
		this.endmatch();
	}

	endmatch() {
		if (this._ingame === false)
			return ;
		this._game = null;
		this._ingame = false;
		this._seed = 0;
		this._ready = new Set();

		// Dispatch endmatch
		DispatchQueue.push(endmatch(this._ID), `lobby:${this._ID}`);
		// store.dispatch(endmatch(this._ID))
	}

}
