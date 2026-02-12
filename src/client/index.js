// Not our stuff
import React from 'react'
import ReactDom from 'react-dom'
import createLogger from 'redux-logger'
import thunk from 'redux-thunk'
import { createStore, applyMiddleware } from 'redux'
import { Provider } from 'react-redux'
import * as socketIO from 'socket.io-client'

// Actions
import { alert } from './actions/alert'
import { ping, connected } from './actions/server.js'

// Middlewares
import storeStateMiddleware from './middleware/storeStateMiddleware';
import socketMiddleware from './middleware/socketMiddleware.js';
import alertMiddleware from './middleware/alertMiddleware.js';

// Reducer
import reducer from './reducers'

// Frontend
import App from './frontend/containers/App.jsx';


const initialState = {}
const socket = socketIO.default('http://localhost:3004');

/* This build the Redux store object.
@reducer: The reducers that will be called after the middleware pipeline.
A reducer should just update the state of the store, nothing more.
@initialState: What the state looks like at launch.
@applyMiddleware(): creates the middleware pipeline. Each middleware
is called one after another, so the order is important. */
const store = createStore(
  reducer,
  initialState,
  applyMiddleware(
    thunk,
    createLogger(),
    socketMiddleware(socket),
    alertMiddleware,
    storeStateMiddleware,
  )
);

ReactDom.render((
  <Provider store={store}>
    <App/>
  </Provider>
), document.getElementById('tetris'));


/* ----------------------------------------------------- */
/* All client-server operation pass trough Redux's store */

// store.dispatch(alert('Soon, will be here a fantastic Tetris ...'));

// store.dispatch({
//   type: 'MOVE_PIECE',
//   payload: { x: 1, y: 0 },
//   meta: { sendToServer: true }
// });


// dispath ping action to the Server
socket.on('connect', () => {
  store.dispatch(connected());
});

setTimeout(() => store.dispatch(ping()), 20);

// dispatch server actions to Redux
socket.on('action', (action) => {
  store.dispatch({ ...action, meta:undefined });
});