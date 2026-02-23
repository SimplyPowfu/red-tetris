import * as server from '../../src/server/index'
import { createStore, applyMiddleware } from 'redux'
import createLogger from 'redux-logger'
import thunk from 'redux-thunk'

export const startServer = (params, cb) => {
  server.create(params)
    .then( server => cb(null, server) )
    .catch( err => cb(err) )
}

import alertMiddleware from '../../src/client/middleware/alertMiddleware'
import socketMiddleware from '../../src/client/middleware/socketMiddleware'
// import storeStateMiddleware from '../../src/client/middleware/storeStateMiddleware'

export const configureStore = (reducer, socket, initialState, types) => createStore( 
  reducer, 
  initialState, 
  applyMiddleware(
    thunk,
    // createLogger(),
    testMiddleware(types),

    /* Insert Your Middlewares */
    socketMiddleware(socket),
    alertMiddleware,
    // storeStateMiddleware,
  )
)

const isFunction = arg => { return typeof arg === 'function' }

const testMiddleware = (types={}) => {
  const fired = {}
  return store => next => action => {
    const result = next(action)
    const tester = types[action.type]
    if(tester && (fired[action.type] || 0) < tester.tries) {
      if(!isFunction(tester.test)) throw new Error("action's type value must be a function")
      // console.log('[HELP] firing', action.type, fired[action.type], tester.tries)
      fired[action.type] = (fired[action.type] || 0) + 1
      tester.test({getState: store.getState, dispatch: store.dispatch, action})
    }
    return result
  }
}

/* const socketIoMiddleWare = socket => ({dispatch, getState}) => {
  if(socket) socket.on('action', dispatch)
  return next => action => {
    if(socket && action.type && action.type.indexOf('server/') === 0) {
      socket.emit('action', action)
    }
    return next(action)
  }
} */
