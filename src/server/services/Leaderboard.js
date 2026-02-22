import { promises as fs } from 'fs';


class Leaderboard
{
	_scores = new Map();
	_high_score = 0;

	new(__score, __username)
	{
		if (!this._scores.has(__score)) {
			this._scores.set(__score, []);
		}

		this._scores.get(__score).push(__username);

		if (__score > this._high_score)
			this._high_score = __score;
	}

	sorted()
	{
		return [...this._scores.entries()]
			.sort((a, b) => b[0] - a[0]);
	}

	get highscore() {
		return this._high_score;
	}

	load()
	{
		try {
			return fs.readFile("Leaderboard.json", "utf-8")
				.then((data) => {
					this._scores = new Map(JSON.parse(data));
					console.log("Leaderboard loaded successfully!");
				});
		}
		catch (err) {
			if (err.code === "ENOENT") {
				// File does not exist yet
				this._scores = new Map();
				return;
			}

			console.error('[LEADERBOARD] Error while loading Leaderboard:', err);
		}
	}

	persist()
	{
		try {
			return fs.writeFile(
				"Leaderboard.json",
				JSON.stringify(this.sorted())
			)
			.then(() => {
				console.log("Leaderboard saved successfully!");
			});

		}
		catch (err) {
			console.error('[LEADERBOARD] Error while writing Leaderboard:', err);
		}
	}

	cycle()
	{
		setInterval(() => {
			this.persist();
		}, 30000);
	}
}

const LB = new Leaderboard();

LB.load().then(() => {
	LB.cycle();
});


export default LB;