// Class imports
import { Player } from "./Player";
import { Randomizer } from "../../tetris/Randomizer";

// Actions imports
import { gameover } from "../../client/actions/tetris";
import { penality } from "../../tetris/actions/grid";

// Services
import DispatchQueue from '../services/Queue';
import SHub from '../services/SocketHub';
import Leaderboard from '../services/Leaderboard';


// internal defines
export const GAMEOVER = 'priv/gamover';
export const PENALITY = 'priv/penality';
export const WINMATCH = 'priv/winmatch';
export const ENDMATCH = 'priv/endmatch';
export const DISPATCH = 'priv/dispatch';
export const SOKREPLY = 'priv/socketreply';
export const HIGHSCORE = 'priv/highscore';

/* type GameMode = {
	loopcall: () => void;
	startgrid: any;
} */

const INT_MAX_2 = 1073741824

export default class Game
{
	_seed = 0;
	_startGrid = null;
	_loopSchedule = null;
	_players = [];

	// save players
	_register = new Map();

	// id
	_originId = null;

	/* comunicate to partent */
	_complain = null;

	// constructor(__players, __gameMode, __originId, __complain) {
	// 	this._players = __players;
	// 	this._startGrid = __gameMode.startGrid;
	// 	this._loopSchedule = __gameMode._loopSchedule;
	// 	this._originId = __originId;
	// 	this._complain = __complain;
	// }
	constructor(__players, __gameMode, __originId, __complain) {
		this._players = __players;
		this._startGrid = __gameMode.startGrid;
		this._loopSchedule = __gameMode.loopSchedule;
		this._originId = __originId;
		this._complain = __complain;

		this._register = new Map();

		return new Proxy(this, {
			get(target, prop, receiver)
			{
				if (Reflect.has(target, prop)) {
					return Reflect.get(target, prop, receiver);
				}

				if (target._register.has(prop)) {
					return target._register.get(prop);
				}

				return undefined;
			},

			set(target, prop, value, receiver)
			{
				if (Reflect.has(target, prop)) {
					return Reflect.set(target, prop, value, receiver);
				}

				target._register.set(prop, value);
				return true;
			}
		});
	}

	get players() {
		return Array.from(this._players.values());
	}

	get seed() {
		return this._seed;
	}

	/* handle player complaints */
	mommy(senderId) {
		return ((issue) => {
			switch (issue.type) {
				case GAMEOVER:
				{
					// Send gamover
					SHub.emit(senderId, 'action', gameover());

					// Save to leaderboard
					console.log('[GAME] Highscore check', Leaderboard.highscore, issue.payload.score)
					if (Leaderboard.highscore <= issue.payload.score) {
						this._complain({
							type: HIGHSCORE,
							payload: {
								senderId,
								score: issue.payload.score,
							}
						});
					}

					// Check for Endmatch conditions
					const alive = [...this._register.entries()]
						.filter(([id, p]) => !p.gameover)
						.map(([id]) => id);

					if (alive.length === 1)
						this.winmatch(alive[0]);
					else if (alive.length === 0)
						this.endmatch();
					
					break ;
				}
				case PENALITY:
				{
					const { lines } = issue.payload;
					// Update server side grids
					for (const [id, player] of this._register) {
						// console.log('[GAME] penality', id, player);
						if (id !== senderId)
							player.penality(lines);
					}

					// Dispatch penality to clients
					const alive = [];
					for (const [key, p] of this._register) {
						if (p.gameover === false)
							alive.push(key);
					}
			
					SHub.emitTo(
						(auth) => auth.lobbyId === this._originId && auth.id !== senderId && alive.includes(auth.id),
						'action',
						penality(lines)
					);
					
					break ;
				}
				case DISPATCH:
				{
					DispatchQueue.push({
						...issue.payload,
						meta: { ...issue.payload.meta, fromServer:true, senderId }
					}, `game:${this._originId}`);

					break ;
				}
				case SOKREPLY:
				{
					SHub.emit(senderId, 'action', issue.payload);
					break ;
				}
				default:
					console.warn('[GAME] invalid complaint of type', issue.type);
			}
		});
	}

	/* Match management actions */
	startmatch() {
		this._seed = Math.floor(INT_MAX_2 + Math.random() * INT_MAX_2);

		for (const playerId of this._players) {
			console.log('[GAME] starting', playerId);
			this._register.set(
				playerId,
				new Player(
					Randomizer(this._seed),
					this._startGrid,
					this._loopSchedule,
					this.mommy(playerId),
				)
			);
		}
	}

	// how should end
	winmatch(winner) {
		// dispatch winmatch
		this._complain({
			type: WINMATCH,
			payload: { winner }
		});

		this.endmatch();
	}

	// forced end
	endmatch() {

		// dispatch winmatch
		this._complain({
			type: ENDMATCH,
		});

		for (const [id, player] of this._register) {
			player.delete();
			delete this._register[id];
		}
	}

}