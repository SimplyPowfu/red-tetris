// Types
import HOF from '../classes/Hall-of-Fame.js'
import Leaderboard from '../classes/Leaderboard.js'

import bus from './bus.js'


// 1. Define the Map of Queries to their specific Return Types
interface ScoreQueries {
	'leaderboard:get': null;
	'hall-of-fame:get': null;
	'error': null;
}

interface ScoreResponses {
	'leaderboard:get': [string, number][];
	'hall-of-fame:get': [string, [number, number]][];
	'error': null;
}

// Define the Map of Actions to their specific Payloads
interface ScoreActions {
}

// Results are usually boolean (success) or void
interface ActionResults {
}

class ScoreService /* implements Service */ {

	private _leaderboard:Leaderboard = new Leaderboard();
	private _hof:HOF = new HOF();

	constructor() {
		// This service "reacts" to the system without being called directly
		bus.on('player:gameover', ({/*  socketId,  */username, score }) => {
			this._leaderboard.new(score, username);
			this._hof.new(score, username);
		});

		/* persist the boards */
		this._leaderboard.load().then(() => {
			this._leaderboard.cycle();
		});
		
		this._hof.load().then(() => {
			this._hof.cycle();
		});
	}

	/* logging */
	public list() {
		console.log('>Scores');
		let i = 0;
		for (const [id, score] of this._hof.sorted) {
			console.log(`${i}. ${id} - ${score}`);
			++i;
		}
	}

	/* simple getter */
	// public get(id:string) {
	// 	return this._hof.get(id);
	// }

	/* query-types:
		- check:username
		- check:ready
		RETURN: 0+: Number of items that successfully performed the query. -1 Invalid query
	*/
	// Use a Generic <K> to link the Key to the Return Type
	public query<K extends keyof ScoreQueries>(
		type: K, 
		payload: ScoreQueries[K]
	): ScoreResponses[K] {

		// Normalize targets to array
		// const targets = typeof payload === 'string' ? [payload] : (payload as any).targets;
		const target = payload;

		switch (type) {
			case 'leaderboard:get':
				return this._leaderboard.sorted as ScoreResponses[K];
			case 'hall-of-fame:get':
				return this._hof.sorted as ScoreResponses[K];
			default:
				return null as ScoreResponses[K];
		}
	}

	/* Actions that alter the state */
	public dispatch<K extends keyof ScoreActions>(
		type: K,
		payload: ScoreActions[K]
	): ActionResults[K] {

		switch (type) {

			default:
				throw new Error(`Unknown action type: ${type}`);
		}
	}

}

const s = new ScoreService();

export default s;