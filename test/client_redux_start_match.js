import chai from "chai"

// Default reducers
import rootReducer from '../src/client/reducers/index.js'

// Actions
import { login } from "../src/client/actions/auth.js"
import { readystate, startmatch } from "../src/client/actions/tetris.js"
import { connected, ping } from "../src/client/actions/server.js"

// Tetris
import { mapBlock } from "../src/tetris/gridManip.js"

// Server imports
import {startServer, configureStore} from './helpers/server.js'
import io from 'socket.io-client'
import params from '../params.js'

chai.should()

describe('Start-Match', function() {
	
	// start server
	let tetrisServer
	before(cb => startServer( params.server, function(err, server){
		tetrisServer = server
		cb()
	}))

	after(function(done){tetrisServer.stop(done)})

	/* SINGLE PLAYER */
	describe('Successful', function() {
		it('Singleplayer', function(done) {

			const types = {
				'connected': {
					tries: 1, test:({ dispatch, getState }) => {
						const state = getState()

						state.server.should.exist
						state.server.connected.should.equal(true)

						// Step 2
						dispatch(login({ username: 'jimmy', lobbyId: 'singleplayer' }))
					}
				},
				'login/reply': {
					tries: 1, test: ({ getState }) => {
						const state = getState()

						// User check
						state.user.username.should.equal('jimmy')
						state.user.lobbyId.should.equal('singleplayer')
					}
				},
				'lobby/state': {
					tries: 1, test: ({ dispatch, getState }) => {
						const state = getState()

						// Lobby check
						state.lobby.lobbyId.should.equal('singleplayer')
						state.lobby.ingame.should.equal(false)

						// Step 3
						dispatch(startmatch('basic'))
					}
				},
				'tetris/newgrid': {
					tries: 1, test: ({ getState }) => {
						const state = getState()

						state.tetris.should.have.property("static")
						state.tetris.should.have.property("nextBlock")
						state.tetris.should.have.property("activeBlock")

						// Final step
						done()
					}
				}
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

		it('Custom Map', function(done) {

			const types = {
				'connected': {
					tries: 1, test:({ dispatch, getState }) => {
						const state = getState()

						state.server.should.exist
						state.server.connected.should.equal(true)

						// Step 2
						dispatch(login({ username: 'ronald', lobbyId: 'custom' }))
					}
				},
				'login/reply': {
					tries: 1, test: ({ getState }) => {
						const state = getState()

						// User check
						state.user.username.should.equal('ronald')
						state.user.lobbyId.should.equal('custom')
					}
				},
				'lobby/state': {
					tries: 1, test: ({ dispatch, getState }) => {
						const state = getState()

						// Lobby check
						state.lobby.lobbyId.should.equal('custom')
						state.lobby.ingame.should.equal(false)

						// Step 3
						dispatch(startmatch('ghost'))
					}
				},
				'tetris/newgrid': {
					tries: 1, test: ({ getState }) => {
						const state = getState()

						state.tetris.should.have.property("static")
						state.tetris.should.have.property("nextBlock")
						state.tetris.should.have.property("activeBlock")
						state.tetris.static.should.equal(mapBlock["ghost"])	

						// Final step
						done()
					}
				}
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

		/* MULTIPLAYER */
		it('Multiplayer', function(done) {

			let player1Ready = false
			let player2Ready = false

			function checkDone() {
				if (player1Ready && player2Ready) {
				done()
				}
			}

			// ----- CLIENT 1 -----
			const socket1 = io(params.server.url)

			const types1 = {
				'connected': {
					tries: 1, test: ({ dispatch }) => {
						dispatch(login({ username: 'rick', lobbyId: 'multiplayer' }))
					}
				},
				'lobby/state': {
					tries: 5, test: ({ dispatch, getState }) => {
						const state = getState()

						if (state.lobby.players.length === 2) {
							dispatch(startmatch('basic'))
						}
					}
				},
				'tetris/newgrid': {
					tries: 1, test: ({ getState }) => {
						const state = getState()
						state.tetris.static.should.exist
						player1Ready = true
						checkDone()
					}
				}
			}

			const store1 = configureStore(rootReducer, socket1, undefined, types1)

			socket1.on('connect', () => {
				store1.dispatch(connected())
			})

			socket1.on('action', (action) => {
				const { meta, ...rest } = action
				store1.dispatch(rest)
			})


			// ----- CLIENT 2 -----
			const socket2 = io(params.server.url)

			const types2 = {
				'connected': {
					tries: 1, test: ({ dispatch }) => {
						dispatch(login({ username: 'morty', lobbyId: 'multiplayer' }))
					}
				},
				'lobby/state': {
					tries: 1, test: ({ dispatch }) => {
						dispatch(readystate())
					}
				},
				'tetris/newgrid': {
					tries: 1, test: ({ getState }) => {
						const state = getState()
						state.tetris.static.should.exist
						player2Ready = true
						checkDone()
					}
				}
			}

			const store2 = configureStore(rootReducer, socket2, undefined, types2)

			socket2.on('connect', () => {
				store2.dispatch(connected())
			})

			socket2.on('action', (action) => {
				const { meta, ...rest } = action
				store2.dispatch(rest)
			})
		})

	})
	describe('Fail', function() {
		it('No Login', function(done) {

			const types = {
				'connected': {
					tries: 1, test:({ dispatch, getState }) => {
						const state = getState()

						state.server.should.exist
						state.server.connected.should.equal(true)

						// Step 2
						dispatch(startmatch('basic'))
					}
				},
				'login/reply': {
					tries: 1, test: ({ getState }) => {
						const state = getState()

						// User check
						state.user.username.should.equal('jimmy')
						state.user.lobbyId.should.equal('singleplayer')
					}
				},
				'lobby/state': {
					tries: 1, test: ({ dispatch, getState }) => {
						const state = getState()

						// Lobby check
						state.lobby.lobbyId.should.equal('singleplayer')
						state.lobby.ingame.should.equal(false)

						// Step 3
						console.log('starting...');
						dispatch(startmatch('basic'))
					}
				},
				'tetris/conflict': {
					tries: 1, test: ({ getState }) => {
						const state = getState()

						state.tetris.should.not.have.property("static")
						state.tetris.should.not.have.property("activeBlock")
						state.tetris.should.not.have.property("nextBlock")

						// Final step
						done()
					}
				}
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
	})
})