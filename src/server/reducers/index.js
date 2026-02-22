import { combineReducers } from 'redux';
import users from './users';
import tetris from './tetris';

export default combineReducers({
	tetris,
	users,
});



