import { combineReducers } from 'redux';
import users from './users';
import lobby from './lobby';
import tetris from './tetris';

export default combineReducers({
	tetris,
	lobby,
	users,
});



