import { SERVER_CONNECTED, SERVER_PING, SERVER_PONG } from '../actions/server.js'

const reducer = (state = {} , action) => {
  switch(action.type)
  {
	case SERVER_CONNECTED:
		return {
			...state,
			connected: true
		}
	case SERVER_PING:
	  return {
		...state,
        lastPingAt: Date.now()
	  }
	case SERVER_PONG:
	  return {
		...state,
        lastPongAt: Date.now(),
		diff: Date.now() - state.lastPingAt + "ms"
	  }
	default: 
	  return state
  }
}

export default reducer