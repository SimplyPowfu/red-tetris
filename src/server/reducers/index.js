import { combineReducers } from 'redux';
import users from './users.js';
import tetris from './tetris.js';

export default combineReducers({
	tetris,
	users,
});



