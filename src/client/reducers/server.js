import { SERVER_CONNECTED, SERVER_LOG, SERVER_PING, SERVER_PONG } from '../actions/server.js'

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
	case SERVER_LOG:
	{
		if (!state.log) {
			return {
				...state,
				log: [action.payload]
			}
		}
		return {
			...state,
			log: [
				...state.log,
				action.payload,
			]
		}
	}
	default: 
	  return state
  }
}

export default reducer