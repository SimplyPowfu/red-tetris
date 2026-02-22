import { createStore, applyMiddleware } from 'redux';
import createLogger from 'redux-logger';
import thunk from 'redux-thunk';
import reducer from '../reducers';

// Middlewares
import authMiddleware from '../middleware/authMiddleware';
import synchLobby from '../middleware/synchLobby';
import blockNotAuth from '../middleware/blockNotAuth';
import lobbyCast from '../middleware/lobbyCast';

const initialState = {}

const store = createStore(
  reducer,
  initialState,
  applyMiddleware(
	thunk,
	createLogger(),
	/* check validity */
	authMiddleware,
	/* Block action */
	blockNotAuth,
	/* Post State update */
	synchLobby,
	/* Send to Clients */
	lobbyCast,
  )
)

export { store/* , sockets */ };