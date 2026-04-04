import type { PieceType } from "../types/PieceType.js";

function mulberry32(seed:number) {
    return function() {
        seed |= 0;
        seed = seed + 0x6D2B79F5 | 0;
        let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
        t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
}


export class Randomizer
{
	private _seed:number;
	private _rng: () => number;
	private readonly _pieces:PieceType[] = ['I','J','L','O','S','T','Z'];
	private _bag:PieceType[] = [];

	constructor(__seed:number) {
		this._seed = __seed;
		this._rng = mulberry32(__seed);
	}

	public get seed() {
		return this._seed;
	}

    private shuffle() {
        for (let i = this._bag.length - 1; i > 0; i--) {
            const j = Math.floor(this._rng() * (i + 1));
            [this._bag[i], this._bag[j]] = [this._bag[j]!, this._bag[i]!];
        }
    }

    public next():PieceType {
        if (this._bag.length === 0) {
            this._bag = [...this._pieces];
            this.shuffle();
        }
        return this._bag.pop() as PieceType;
    }
}
