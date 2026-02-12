import { combineReducers } from 'redux';
import alert from './alert';
import server from './server';
import user from './user';
import lobby from './lobby';
import tetris from './tetris';

export default combineReducers({
	alert,
	server,
	user,
	lobby,
	tetris,
});



