import chai from "chai"

// Default reducers
import rootReducer from '../src/client/reducers/index.js'

// Actions
import { connected, ping } from "../src/client/actions/server.js"
import { USER_CONFLICT } from "../src/server/middleware/authMiddleware.js"

// Server imports
import {startServer, configureStore} from './helpers/server.js'
import io from 'socket.io-client'
import params from '../params.js'


chai.should()

describe('Client Middlewares', function(){
	it('dispatches alert on USER_CONFLICT', function(done) {

		const types = {
			'alert/pop': {
				tries: 1, test: ({ getState }) => {
					const state = getState()

					state.alert.message.should.exist
					done()
				}
			}
		}

		const store = configureStore(rootReducer, undefined, undefined, types)

		store.dispatch({ type: USER_CONFLICT, message: 'Conflict!' });
	})

	it('Send to server on \'server/\' actions', function(done) {

		const types = {
			'empty/log': {
				tries: 1, test: ({ getState }) => {
					const state = getState()

					state.server.should.not.have.property("log")
				}
			},
			'log/server': {
				tries: 1, test: ({ getState }) => {
					const state = getState()

					state.server.should.have.property("log")
					state.server.log.length.should.equal(1)
					done()
				}
			}
		}

		const store = configureStore(rootReducer, undefined, undefined, types)

		store.dispatch({ type: 'empty/log', message: 'This should not appear' });
		store.dispatch({ type: 'server/test', message: 'This should appear' });
	})
})