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
const { NotFound } = require('../../src/client/frontend/pages/NotFound.jsx')

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

		it('changes map when arrow buttons are clicked', () => {
			const user = { username: 'host', score: 0 }
			const lobby = { 
				players: [{ username: 'host', ready: false }],
				ingame: false 
			}
			const store = mockStore({ user, lobby, alert: {}, tetris: {} })

			let selectedMap = null
			const startmatch = (map) => { selectedMap = map }

			render(
				<Provider store={store}>
					<MemoryRouter initialEntries={['/room1/host']}>
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

			const mapName = screen.getByText(/basic|ghost|invaders|wiggly/i)
			mapName.should.exist

			const [leftArrow, rightArrow] = screen.getAllByText(/◄|►/i)

			// Initial map is 'BASIC'
			mapName.textContent.should.equal('BASIC')

			// Click right arrow -> map should advance
			fireEvent.click(rightArrow)
			mapName.textContent.should.equal('GHOST')

			// Click right arrow again -> next map
			fireEvent.click(rightArrow)
			mapName.textContent.should.equal('INVADERS')

			// Click left arrow -> map goes back
			fireEvent.click(leftArrow)
			mapName.textContent.should.equal('GHOST')
		})

		it('renders the list of players and ready/unready symbols', () => {
			const user = { username: 'host', score: 0 }
			const lobby = { 
				players: [
					{ username: 'host', ready: false },
					{ username: 'player2', ready: true },
					{ username: 'player3', ready: false },
				],
				ingame: false 
			}
			const store = mockStore({ user, lobby, alert: {}, tetris: {} })

			render(
				<Provider store={store}>
					<MemoryRouter initialEntries={['/room1/host']}>
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

			// Check that all players are rendered
			screen.getAllByText('host').length.should.be.at.least(1)
			screen.getByText('player2').should.exist
			screen.getByText('player3').should.exist

			// Check ready/unready symbols
			screen.getByText('❌').should.exist // host not ready
			screen.getByText('✅').should.exist // player2 ready
			screen.getAllByText('❌').length.should.be.at.least(1) // host & player3 not ready
		})
  	})

	describe('NotFound', () => {

		it('renders', () => {
			// simple noop functions instead of Sinon spies

			render(<NotFound/>)

			screen.getByText('Page Not Found').should.exist
		})

		it('button click navigates home', () => {
			// Create a mock history object
			const pushCalls = []
			const mockHistory = {
				push: (path) => pushCalls.push(path)
			}

			// Render NotFound with mock history
			render(<NotFound history={mockHistory} />)

			// Click the button
			const button = screen.getByText('Go Home')
			fireEvent.click(button)

			// Assert push('/') was called
			pushCalls.length.should.equal(1)
			pushCalls[0].should.equal('/')
		})
	})
})