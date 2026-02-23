import chai from "chai"

// Default reducers
import rootReducer from '../src/client/reducers/index.js'

// Actions
import { login } from "../src/client/actions/auth.js"
import { readystate, startmatch } from "../src/client/actions/tetris.js"
import { connected, ping } from "../src/client/actions/server.js"

// Server imports
import {startServer, configureStore} from './helpers/server.js'
import io from 'socket.io-client'
import params from '../params.js'

chai.should()

describe('Authentication', function(){
	
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
					dispatch(login({ username: 'jimmy', lobbyId: 'success' }))
				}
			},
			'login/reply': {
				tries: 1, test: ({ getState }) => {
					const state = getState()

					// User check
					state.user.should.exist
					state.user.username.should.equal('jimmy')
					state.user.lobbyId.should.equal('success')
					done()
				}
			},
		}
		/* --- Connect to Server --- */
		const socket = io(params.server.url)
		
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

	it('Loop Successful', function(done) {

		const types = {
			'connected': {
				tries: 1, test:({ getState }) => {
					const state = getState()

					state.server.should.exist
					state.server.connected.should.equal(true)
				}
			},
			'login/reply': {
				tries: 1, test: ({ getState }) => {
					const state = getState()

					// User check
					state.user.should.exist
					state.user.username.should.equal('larry')
					state.user.lobbyId.should.equal('loop')
					done()
				}
			},
		}
		/* --- Connect to Server --- */
		const socket = io(params.server.url)
		
		const store = configureStore(rootReducer, socket, undefined, types)
		
		store.dispatch(login({ username: 'larry', lobbyId: 'loop' }))
		store.dispatch(login({ username: 'larry', lobbyId: 'loop' }))

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

	it('Fail: Invalid Payload', function(done) {

		const types = {
			'connected': {
				tries: 1, test:({ dispatch, getState }) => {
					const state = getState()

					state.server.should.exist
					state.server.connected.should.equal(true)

					// Step 2
					/* payload should be: { username:<string>, lobbyId:<string> } */
					dispatch(login({ username: 'jimmy', lobbyCode: 'invalid' }))
				}
			},
			'user/conflict': {
				tries: 1, test: ({ getState }) => {
					const state = getState()

					// User check
					state.user.should.exist
					state.user.should.not.have.property('username')
					state.user.should.not.have.property('lobbyId')
					done()
				}
			},
			'login/reply': {
				tries: 1, test: () => {
					done(new Error("login/reply should NOT be dispatched during username conflict"))
				}
			},
		}
		/* --- Connect to Server --- */
		const socket = io(params.server.url)
		
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

	it('Fail: Username Conflict', function(done) {

		const types = {
			'connected': {
				tries: 1, test:({ dispatch, getState }) => {
					const state = getState()

					state.server.should.exist
					state.server.connected.should.equal(true)

					// Step 2
					dispatch(login({ username: 'jimmy', lobbyId: 'valid' }))
				}
			},
			'user/conflict': {
				tries: 1, test: ({ getState }) => {
					const state = getState()

					// User check
					state.user.should.exist
					state.user.should.not.have.property('username')
					state.user.should.not.have.property('lobbyId')
					done()
				}
			},
			'login/reply': {
				tries: 1, test: () => {
					done(new Error("login/reply should NOT be dispatched during username conflict"))
				}
			},
		}
		/* --- Connect to Server --- */
		const socket = io(params.server.url)
		
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

	it('Fail: Lobby Ingame', function(done) {

		/* ======= ACTUAL TEST ======= */
		const types2 = {
			'connected': {
				tries: 1, test:({ dispatch, getState }) => {
					const state = getState()

					state.server.should.exist
					state.server.connected.should.equal(true)
				}
			},
			'user/conflict': {
				tries: 1, test: ({ getState }) => {
					const state = getState()

					// User check
					state.user.should.exist
					state.user.should.not.have.property('username')
					state.user.should.not.have.property('lobbyId')
					done()
				}
			},
			'login/reply': {
				tries: 1, test: () => {
					done(new Error("login/reply should NOT be dispatched during username conflict"))
				}
			},
		}
		/* --- Connect to Server --- */
		const socket2 = io(params.server.url)
		
		const store2 = configureStore(rootReducer, socket2, undefined, types2)
		
		socket2.on('connect', () => {
			store2.dispatch(connected());
		});
		
		// Dispatch server actions
		socket2.on('action', (action) => {
			const { meta, ...rest } = action;
			store2.dispatch(rest);
		});
		/* ============================ */



		/* ======= Dummy Client ======= */
		const types1 = {
			'connected': {
				tries: 1, test:({ dispatch }) => {
					dispatch(login({ username: 'dummy', lobbyId: 'ingame' }))
				}
			},
			'lobby/state': {
				tries: 1, test: ({ dispatch }) => {
						dispatch(startmatch('basic'))
				}
			},
			'tetris/newgrid': {
				tries: 1, test: () => {
					// Login the test account
					store2.dispatch(login({ username: 'hyped', lobbyId: 'ingame' }))
				}
			}
		}
		const socket1 = io(params.server.url)
		const store1 = configureStore(rootReducer, socket1, undefined, types1)
		socket1.on('connect', () => {
			store1.dispatch(connected());
		});
		socket1.on('action', (action) => {
			const { meta, ...rest } = action;
			store1.dispatch(rest);
		});
		/* ============================ */
	})
})