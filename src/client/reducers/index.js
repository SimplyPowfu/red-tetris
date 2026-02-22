import { combineReducers } from 'redux';
import alert from './alert.js';
import server from './server.js';
import user from './user.js';
import lobby from './lobby.js';
import tetris from './tetris.js';

export default combineReducers({
	alert,
	server,
	user,
	lobby,
	tetris,
});



