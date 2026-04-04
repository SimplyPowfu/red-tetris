import { promises as fs } from 'fs'


export default class hof
{
	private _scores:Map<string, [number, number]> = new Map();
	private _high_score = 0;
	public filePath = 'public/hof.json';

	public new(__score:number, __id:string)
	{
		/* if (!this._scores.has(__score)) {
			this._scores.set(__score, []);
		}

		this._scores.get(__score).push(__id); */

		if (__score > this._high_score) {
			this._scores.set(__id, [__score, Date.now()]);
			this._high_score = __score;
		}
	}

	public get sorted()
	{
		return [...this._scores.entries()]
			.sort((a, b) => b[1][0] - a[1][0]);
	}

	public get highscore() {
		return this._high_score;
	}

	public async load(__path?:string)
	{
		this.filePath = __path || this.filePath || "public/hof.json";
		return fs.readFile(this.filePath, "utf-8")
			.then((data) => {
				this._scores = new Map(JSON.parse(data));
				// console.log("HallofFame loaded successfully!");
			
				const values = [...this._scores.values()].map(v => v[0]);

				this._high_score = Math.max(...values, 0);
			})
			.catch((err) => {
				if (err.code === "ENOENT") {
					// File does not exist yet
					this._scores = new Map();
					this._high_score = 0;
				}
			});
	}

	public async persist(__path?:string)
	{
		return fs.writeFile(
			__path || this.filePath || "public/hof.json",
			JSON.stringify(this.sorted)
		)
		.then(() => {
			// console.log("Leaderboard saved successfully!");
		})
		.catch((err) => {
			console.error('[Hall-of-Fame] Error while writing Hall of Fame:', err);
		});
	}

	public cycle()
	{
		setInterval(() => {
			this.persist();
		}, 30000);
	}
}