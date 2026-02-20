import { combineReducers } from 'redux';
import users from './users';
import tetris from './tetris_with_classes';

export default combineReducers({
	tetris,
	users,
});



