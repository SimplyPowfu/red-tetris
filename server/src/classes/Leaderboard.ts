import { promises as fs } from 'fs'


export default class Leaderboard
{
	private _scores:Map<string, number> = new Map();
	public filePath = 'public/Leaderboard.json';

	public new(__score:number, __id:string)
	{
		/* if (!this._scores.has(__score)) {
			this._scores.set(__score, []);
		}

		this._scores.get(__score).push(__id); */

		const pb = this._scores.get(__id);
		if (!pb || pb < __score)
			this._scores.set(__id, __score);
	}

	public get sorted()
	{
		return [...this._scores.entries()]
			.sort((a, b) => b[1] - a[1]);
	}

	public async load(__path?:string)
	{
		this.filePath = __path || this.filePath || "public/Leaderboard.json";
		return fs.readFile(this.filePath, "utf-8")
			.then((data) => {
				this._scores = new Map(JSON.parse(data));
				// console.log("Leaderboard loaded successfully!");
			
			})
			.catch((err) => {
				if (err.code === "ENOENT") {
					// File does not exist yet
					this._scores = new Map();
				}
			});
	}

	public async persist(__path?:string)
	{
		return fs.writeFile(
			__path || this.filePath || "public/Leaderboard.json",
			JSON.stringify(this.sorted)
		)
		.then(() => {
			// console.log("Leaderboard saved successfully!");
		})
		.catch((err) => {
			console.error('[Leaderboard] Error while writing Leaderboard:', err);
		});
	}

	public cycle()
	{
		setInterval(() => {
			this.persist();
		}, 30000);
	}
}