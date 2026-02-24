import chai from "chai"

// Default reducers
import rootReducer from '../../src/client/reducers/index.js'

// Actions
import { connected, ping } from "../../src/client/actions/server.js"

// Server imports
import {startServer, configureStore} from '../helpers/server.js'
import io from 'socket.io-client'
import params from '../../params.js'

chai.should()

describe('Ping', function(){
	
	// start server
	let tetrisServer
	before(cb => startServer( params.server, function(err, server){
		tetrisServer = server
		cb()
	}))

	after(function(done){tetrisServer.stop(done)})

	it('Successful', function(done) {

		const types = {
			'connected': {
				tries: 1, test:({ dispatch, getState }) => {
					const state = getState()

					state.server.should.exist
					state.server.connected.should.equal(true)

					// Step 2
					dispatch(ping({ username: 'jimmy', lobbyId: 'success' }))
				}
			},
			'pong': {
				tries: 1, test: ({ getState }) => {
					const state = getState()

					// User check
					state.server.should.exist
					state.server.lastPongAt.should.exist
					state.server.lastPingAt.should.exist
					state.server.diff.should.exist
					done()
				}
			},
		}
		/* --- Connect to Server --- */
		const socket = io(params.server.url, { transports: ['polling'] })
		
		const store = configureStore(rootReducer, socket, undefined, types)
		
		socket.on('connect', () => {
			// Step 1
			store.dispatch(connected());
		});
		
		// Dispatch server actions
		socket.on('action', (action) => {
			const { meta, ...rest } = action;
			store.dispatch(rest);
		});
		/* ------------------------ */
	})

	it('Failed: State not updated', function(done) {

		/* --- Connect to Server --- */
		const socket = io(params.server.url, { transports: ['polling'] })
		
		const store = configureStore(rootReducer, socket, undefined, {})
		
		store.dispatch(ping())

		setTimeout(() => {
			const state = store.getState();

			state.server.should.exist
			state.server.should.not.have.property("lastPingAt")
			state.server.should.not.have.property("lastPongAt")
			state.server.should.not.have.property("diff")
			done()
		}, 10)

		/* ------------------------ */
	})

	it('Failed: Not Connected', function(done) {

		const store = configureStore(rootReducer, undefined, undefined, {})
		
		// false connection
		store.dispatch(connected())

		store.dispatch(ping());

		setTimeout(() => {
			const state = store.getState();

			state.server.should.exist
			state.server.lastPingAt.should.exist
			state.server.should.not.have.property("lastPongAt")
			state.server.should.not.have.property("diff")
			done()
		}, 10)

	})
})