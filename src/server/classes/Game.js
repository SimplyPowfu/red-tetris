// Class imports
import { Player } from "./Player";
import { Randomizer } from "../../tetris/Randomizer";

// Actions imports
import { gameover } from "../../client/actions/tetris";
import { penality } from "../../tetris/actions/grid";

// Services
import DispatchQueue from '../services/Queue';
import SHub from '../services/SocketHub';


// internal defines
export const GAMEOVER = 'priv/gamover';
export const PENALITY = 'priv/penality';
export const WINMATCH = 'priv/winmatch';
export const ENDMATCH = 'priv/endmatch';
// export const DISPATCH = 'priv/dispatch';
export const SOKREPLY = 'priv/socketreply';

/* type GameMode = {
	loopcall: () => void;
	startgrid: any;
} */



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

					// DispatchQueue.push({
					// 	...gameover(),
					// 	meta: { fromServer:true, reply:true, senderId }
					// }, `game:${this._originId}`);

					// check if only 1 player alive
					const alive = [...this._register.entries()]
						.filter(([id, p]) => !p.gameover)
						.map(([id]) => id);

					console.log('alivee', alive, alive.length);
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
					SHub.emitTo(
						(auth) => auth.lobbyId === this._originId && auth.id !== senderId,
						'action',
						penality(lines)
					);
					// DispatchQueue.push({
					// 	...penality(lines),
					// 	meta: { fromServer:true, lobbyCast:true, lobbyId:this._originId, senderId, avoid:senderId }
					// }, `game:${this._originId}`);
					
					break ;
				}
				// case DISPATCH:
				// {
				// 	DispatchQueue.push({
				// 		...issue.payload,
				// 		meta: { ...issue.payload.meta, fromServer:true, senderId }
				// 	}, `game:${this._originId}`);

				// 	break ;
				// }
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
	// startmatch() {
	// 	this._seed = Math.floor(Math.random() * 2147483648);
	// 	for (const player of this._players) {
	// 		// save player
	// 		register[player] = new Player(Randomizer(this._seed),
	// 			this._startGrid,
	// 			this._loopSchedule,
	// 			this.mommy(player),
	// 		);
	// 	}
	// }
	startmatch() {
		this._seed = Math.floor(Math.random() * 2147483648);

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

		for (const player of this._register.values()) {
			player.delete();
		}
	}

}