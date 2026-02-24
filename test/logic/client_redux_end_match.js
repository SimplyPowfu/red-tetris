import chai from "chai"

// Default reducers
import rootReducer from '../../src/client/reducers/index.js'

// Actions
import { login } from "../../src/client/actions/auth.js"
import { move, readystate, startmatch } from "../../src/client/actions/tetris.js"
import { connected, ping } from "../../src/client/actions/server.js"

// Tetris import
import { MEGA_FALL_SCORE, SHIFT_DOWN_SCORE } from "../../src/tetris/gridManip.js"

// Server imports
import {startServer, configureStore} from '../helpers/server.js'
import io from 'socket.io-client'
import params from '../../params.js'

chai.should()

describe('End-Match', function(){
	
	// start server
	let tetrisServer
	before(cb => startServer( params.server, function(err, server){
		tetrisServer = server
		cb()
	}))

	after(function(done){tetrisServer.stop(done)})

	/* 1 Player */
	it('Move around', function(done) {

		const types = {
			'connected': {
				tries: 1, test:({ dispatch }) => {
					dispatch(login({ username: 'jimmy', lobbyId: 'singleplayer' }))
				}
			},
			'lobby/state': {
				tries: 1, test: ({ dispatch }) => {
					dispatch(startmatch('basic'))
				}
			},
			'tetris/newgrid': {
				tries: 1, test: ({ dispatch }) => {

					console.log('[END] newgrid')

					dispatch(move('Left'))
				}
			},
			'tetris/shiftleft': {
				tries: 1, test: ({ dispatch, getState }) => {
					const state = getState()

					if (state.user.score) state.user.score.should.equal(0)
					state.tetris.should.have.property("activeBlock")
					
					console.log('[END] left')

					dispatch(move('Right'))
				}
			},
			'tetris/shiftright': {
				tries: 1, test: ({ dispatch, getState }) => {
					const state = getState()

					if (state.user.score) state.user.score.should.equal(0)
					state.tetris.should.have.property("activeBlock")
				
					console.log('[END] right')

					dispatch(move('Rotate'))
				}
			},
			'tetris/rotate': {
				tries: 1, test: ({ dispatch, getState }) => {
					const state = getState()

					if (state.user.score) state.user.score.should.equal(0)
					state.tetris.should.have.property("activeBlock")
				
					console.log('[END] rotate')

					dispatch(move('Down'))
				}
			},
			'tetris/shiftdown': {
				tries: 1, test: ({ dispatch, getState }) => {
					const state = getState()

					state.user.score.should.equal(SHIFT_DOWN_SCORE)
					state.tetris.should.have.property("activeBlock")
				
					console.log('[END] down')

					dispatch(move('Mega'))
				}
			},
			'tetris/mega': {
				tries: 1, test: ({ getState }) => {
					const state = getState()

					state.user.score.should.equal(MEGA_FALL_SCORE + SHIFT_DOWN_SCORE)
					state.tetris.should.have.property("activeBlock")

					console.log('[END] mega')

					done()
				}
			}
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

	/* 1 Player */
	it('Gameover', function(done) {

		const types = {
			'connected': {
				tries: 1, test:({ dispatch, getState }) => {
					const state = getState()

					state.tetris.should.not.have.property("gameover")

					dispatch(login({ username: 'silly', lobbyId: 'loser' }))
				}
			},
			'lobby/state': {
				tries: 1, test: ({ dispatch, getState }) => {
					const state = getState()

					state.tetris.should.not.have.property("gameover")

					dispatch(startmatch('basic'))
				}
			},
			'tetris/newgrid': {
				tries: 1, test: ({ dispatch, getState }) => {
					const state = getState()

					state.tetris.should.have.property("gameover")
					state.tetris.gameover.should.equal(false)

					dispatch(move('Mega'))
				}
			},
			'tetris/mega': {
				tries: 20, test: ({ dispatch, getState }) => {
					const state = getState()

					state.tetris.should.have.property("gameover")
					state.tetris.gameover.should.equal(false)

					dispatch(move('Mega'))
				}
			},
			'tetris/gameover': {
				tries: 1, test: ({ getState }) => {
					const state = getState()

					state.tetris.should.have.property("gameover")
					state.tetris.gameover.should.equal(true)

					done()
				}
			}
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

	/* 2 Players */
	it('Winmatch', function(done) {

		let player1Done = false
		let player2Done = false

		function checkDone() {
			if (player1Done && player2Done) {
				done()
			}
		}

		// ----- CLIENT 1 -----
		const socket1 = io(params.server.url, { transports: ['polling'] })

		const types1 = {
			'connected': {
				tries: 1, test: ({ dispatch }) => {
					dispatch(login({ username: 'gigi', lobbyId: 'winmatch' }))
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
				tries: 1, test: ({ dispatch, getState }) => {
					const state = getState()

					state.tetris.should.have.property("gameover")
					state.tetris.gameover.should.equal(false)

					// console.log('[WINMATCH] newgrid-1')

					dispatch(move('Mega'))
				}
			},
			'tetris/mega': {
				tries: 20, test: ({ dispatch, getState }) => {
					const state = getState()

					state.tetris.should.have.property("gameover")
					state.tetris.gameover.should.equal(false)

					// console.log('[WINMATCH] mega-1')

					dispatch(move('Mega'))
				}
			},
			'tetris/gameover': {
				tries: 1, test: ({ getState }) => {
					const state = getState()

					state.tetris.should.have.property("gameover")
					state.tetris.gameover.should.equal(true)

					// console.log('[WINMATCH] gamover-1')

					player1Done = true
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
		const socket2 = io(params.server.url, { transports: ['polling'] })

		const types2 = {
			'connected': {
				tries: 1, test: ({ dispatch }) => {
					dispatch(login({ username: 'totti', lobbyId: 'winmatch' }))
				}
			},
			'lobby/state': {
				tries: 1, test: ({ dispatch }) => {
					dispatch(readystate())
				}
			},
			'tetris/winmatch': {
				tries: 1, test: ({ getState }) => {
					const state = getState()
					
					state.tetris.should.have.property("gameover")
					state.tetris.gameover.should.equal(false)

					player2Done = true
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