// React imports
const React = require('react')
const { Provider } = require('react-redux')
const { MemoryRouter, Route } = require('react-router-dom')

// Test imports
const chai = require('chai')
const { render, screen, cleanup, fireEvent } = require('@testing-library/react')
const configureStore = require('redux-mock-store').default

const { AuthPage } = require('../../src/client/frontend/pages/AuthPage.jsx')/* .default */

const { LobbyPage } = require('../../src/client/frontend/pages/LobbyPage.jsx')/* .default */

chai.should()

const thunk = require('redux-thunk').default
const mockStore = configureStore([thunk])
const oldAlert = global.alert

afterEach(() => {
  cleanup()
  global.alert = oldAlert
})

describe('React Pages (.jsx)', () => {
	describe('AuthPage', () => {

		it('renders the form', () => {
			// simple noop functions instead of Sinon spies
			const login = () => {}
			const alertclear = () => {}
			const user = {}
			const message = null

			render(
				<AuthPage
					login={login}
					alertclear={alertclear}
					user={user}
					message={message}
				/>
			)

			// console.log(screen.getByText('Welcome to Red-Tetris'))

			screen.getByText('Welcome to Red-Tetris').should.exist
			screen.getByPlaceholderText("How they'll remember you").should.exist
			screen.getByPlaceholderText("Enter something pretty").should.exist
			screen.getByText('Join Lobby').should.exist
		})

		it('shows error message when message prop is passed', () => {
			const login = () => {}
			const alertclear = () => {}
			const user = {}
			const message = 'Username required'

			render(
				<AuthPage
					login={login}
					alertclear={alertclear}
					user={user}
					message={message}
				/>
			)


			const pop = screen.getByText(message)
			pop.should.exist
		})

		it('calls login on submit', async () => {
			let loginCalled = false
			const login = () => { loginCalled = true }
			const alertclear = () => {}
			const user = {}
			const message = null

			render(
				<AuthPage
					login={login}
					alertclear={alertclear}
					user={user}
					message={message}
				/>
			)

			const usernameInput = screen.getByPlaceholderText("How they'll remember you")
			const lobbyInput = screen.getByPlaceholderText("Enter something pretty")

			// Fill inputs
			fireEvent.change(usernameInput, {
				target: { value: 'testuser' },
			})
			fireEvent.change(lobbyInput, {
				target: { value: 'pretty-lobby' },
			})

			// Dispatch form submit
			const userEvent = require('@testing-library/user-event').default
			const userData = userEvent.setup()

			await userData.type(usernameInput, 'testuser')
			await userData.type(lobbyInput, 'pretty-lobby')
			await userData.click(screen.getByText('Join Lobby'))

			loginCalled.should.equal(true)
		})
	})


	describe('LobbyPage', () => {

		it('renders loading when user or lobby is missing', () => {
			const user = {}
			const lobby = {}
			const store = mockStore({ user, lobby, alert: {}, tetris: {} })

		render(
			<Provider store={store}>
				<MemoryRouter initialEntries={['/room1/player1']}>
					<Route path="/:room/:player">
					<LobbyPage
						user={user}
						lobby={lobby}
						login={() => {}}
						startmatch={() => {}}
						readystate={() => {}}
						move={() => {}}
					/>
					</Route>
				</MemoryRouter>
			</Provider>
		)

			const loading = screen.getByText('Loading...')
			loading.should.exist
		})


		it('renders player info and start button for host', () => {
			const user = { username: 'player1', score: 0 }
			const lobby = { players: [{ username: 'player1', ready: false }], ingame: false }
			const store = mockStore({ user, lobby, alert: {}, tetris: {} })

			let startCalled = false
			const startmatch = () => { startCalled = true }

			render(
				<Provider store={store}>
					<MemoryRouter initialEntries={['/room1/player1']}>
						<Route path="/:room/:player">
						<LobbyPage
							user={user}
							lobby={lobby}
							login={() => {}}
							startmatch={startmatch}
							readystate={() => {}}
							move={() => {}}
						/>
						</Route>
					</MemoryRouter>
				</Provider>
			)

			screen.getByText('player1').should.exist
			const startBtn = screen.getAllByText(/start/i)[0]
			startBtn.should.exist

			// simulate click
			fireEvent.click(startBtn)
			startCalled.should.equal(true)
		})


		it('renders opponents correctly', () => {
			const user = { username: 'player1', score: 0 }
			const lobby = { 
				players: [
				{ username: 'player1', ready: true }, 
				{ username: 'player2', ready: false }
				], 
				ingame: false 
			}
			const store = mockStore({ user, lobby, alert: {}, tetris: {} })

			render(
				<Provider store={store}>
					<MemoryRouter initialEntries={['/room1/player1']}>
						<Route path="/:room/:player">
							<LobbyPage
								user={user}
								lobby={lobby}
								login={() => {}}
								startmatch={() => {}}
								readystate={() => {}}
								move={() => {}}
							/>
						</Route>
					</MemoryRouter>
				</Provider>
			)

			// Check that opponent is rendered
			screen.getByText('player2').should.exist
			// Check opponent's ready status (❌)
			screen.getByText('❌').should.exist
		})


		it('calls move function on simulated key press', () => {
			const user = { username: 'player1', score: 0 }
			const lobby = { players: [{ username: 'player1', ready: false }], ingame: true }
			const store = mockStore({ user, lobby, alert: {}, tetris: {} })

			let moved = null
			const move = (dir) => { moved = dir }

			render(
				<Provider store={store}>
					<MemoryRouter initialEntries={['/room1/player1']}>
						<Route path="/:room/:player">
						<LobbyPage
							user={user}
							lobby={lobby}
							login={() => {}}
							startmatch={() => {}}
							readystate={() => {}}
							move={move}
						/>
						</Route>
					</MemoryRouter>
				</Provider>
			)

			// Simulate ArrowLeft key press
			fireEvent.keyDown(window, { key: 'ArrowLeft' })
			moved.should.equal('Left')

			fireEvent.keyDown(window, { key: 'ArrowRight' })
			moved.should.equal('Right')

			fireEvent.keyDown(window, { key: ' ' })
			moved.should.equal('Mega')
		})

  })
})