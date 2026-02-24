import 'regenerator-runtime/runtime'
import chai from "chai"
import Leaderboard from "../../src/server/services/Leaderboard.js"
import fs from 'fs'
import path from 'path'
import os from 'os'

chai.should()

// Create a temporary file for testing
const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'leaderboard-test-'))
const tempFilePath = path.join(tempDir, 'Leaderboard.json')

describe('Leaderboard Service (Temporary File)', function(){

	beforeEach(async function() {
		// Point Leaderboard service to the temp file
		Leaderboard.filePath = tempFilePath

		// Ensure temp file starts clean
		if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath)
	})

	after(function() {
		// Cleanup temp directory after all tests
		if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath)
		fs.rmdirSync(tempDir)
	})

	it('loads when not found', async function() {
		// Load leaderboard (should create default)
		await Leaderboard.load()

		// Assert default high score exists (assuming 0)
		Leaderboard._high_score.should.equal(0)
	})

	it('loads when found', async function() {
		// Save a high score to the temp file
		const savedHighScore = 42;
		const scoresMap = new Map();
		scoresMap.set('tester', savedHighScore);
		fs.writeFileSync(tempFilePath, JSON.stringify([...scoresMap]));
		
		// Load leaderboard
		await Leaderboard.load(tempFilePath)

		// Assert the loaded score matches what was in file
		Leaderboard._high_score.should.equal(savedHighScore)
	})

	it('persists correctly', async function() {
		// Set a new high score
		const highScore = 100000
		Leaderboard.new(highScore, 'faker')

		// Persist leaderboard to temp file
		await Leaderboard.persist()

		// Clear in-memory state to ensure reload works
		Leaderboard._high_score = 0

		// Load from temp file
		await Leaderboard.load()

		// Assert persisted score matches
		Leaderboard._high_score.should.equal(highScore)
	})
})