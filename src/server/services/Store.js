import { createStore, applyMiddleware } from 'redux';
import createLogger from 'redux-logger';
import thunk from 'redux-thunk';
import reducer from '../reducers/index.js';

// Middlewares
import authMiddleware from '../middleware/authMiddleware.js';
import synchLobby from '../middleware/synchLobby.js';
import blockNotAuth from '../middleware/blockNotAuth.js';
import lobbyCast from '../middleware/lobbyCast.js';
import highScore from '../middleware/highScore.js';

const initialState = {}

const store = createStore(
  reducer,
  initialState,
  applyMiddleware(
	thunk,
	// createLogger(),
	/* check validity */
	authMiddleware,
	/* Block action */
	blockNotAuth,
	/* Post State update */
	highScore,
	synchLobby,
	/* Send to Clients */
	lobbyCast,
  )
)

export default store;