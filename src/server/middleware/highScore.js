// Utils import
import { HIGH_SCORE } from "../actions/tetris.js";
import Leaderboard from "../services/Leaderboard.js";

const highScore = store => next => action => {
	const result = next(action);

	if (action.type === HIGH_SCORE)
	{
		if (!action.payload || !action.payload.username || !action.payload.score)
		{
			console.warn('[HighScore] payload parameter not found');
			return ;
		}

		if (Leaderboard.highscore <= action.payload.score)
			Leaderboard.new(action.payload.score, action.payload.username);
	}
	

	return result;
}

export default highScore;