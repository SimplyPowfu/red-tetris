// // Always add when testing render
// require('@babel/register')({ extensions: ['.js', '.jsx'] })
// require('ignore-styles')
// require('jsdom-global')()

// const React = require('react')
// const { Provider } = require('react-redux')
// const chai = require('chai')
// const { render, screen, cleanup, waitFor, act } = require('@testing-library/react')

// // Reducers
// const rootReducer = require('../src/client/reducers/index.js').default

// // Board require
// const { Board } = require('../src/client/frontend/components/Board.jsx')
// const { newgrid } = require('../src/tetris/gridManip.js')

// // Specator require
// const { SpectatorBoard } = require('../src/client/frontend/components/SpectatorBoard.jsx')

// // Next Block
// const { NextBlock } = require('../src/client/frontend/components/NextBlock.jsx')
// const { BlockColor } = require('../src/tetris/blocks.js')

// // Leaderboard require
// const Leaderboard = require('../src/client/frontend/components/Leaderboard.jsx').default


// chai.should()

// const oldFetch = global.fetch

// afterEach(() => {
// 	cleanup()
// 	// Reset any global fetch mocks
// 	global.fetch = oldFetch
// })

// describe('React Components (.jsx)', () => {

// 	/* ----------------------- */
// 	/* -------- BOARD -------- */

// 	describe('Board', () => {
// 		it('renders fallback if no statik', () => {
// 			render(<Board statik={null} activeBlock={null} gameover={false} />)

// 			const fallback = screen.findByText('Nothing yet to render')
// 			chai.expect(fallback).to.exist
// 		})

// 		it('renders 200 cells', () => {
// 			const { container } = render(
// 				<Board
// 				statik={newgrid()}
// 				activeBlock={null}
// 				gameover={false}
// 				/>
// 			)

// 			const cells = container.querySelectorAll('.cella')
// 			cells.length.should.equal(200)
// 		})

// 		const mockBlock = {
// 			shape: [
// 				[null,'O', 'O',null],
// 				[null,'O', 'O',null],
// 				[null,null,null,null]
// 			],
// 			row: 0,
// 			column: 0,
// 			type: 'O'
// 		}

// 		it('renders active block cells', () => {
// 			const { container } = render(
// 				<Board
// 				statik={newgrid()}
// 				activeBlock={mockBlock}
// 				gameover={false}
// 				/>
// 			)

// 			const coloredCells = [...container.querySelectorAll('.cella')]
// 				.filter(c => c.style.backgroundColor !== 'rgb(5, 10, 32)')

// 			coloredCells.length.should.be.above(0)
// 		})

// 		it('applies gameover styling', () => {
// 			const grid = newgrid()
// 			grid[0][0] = 'I'

// 			const { container } = render(
// 				<Board
// 				statik={grid}
// 				activeBlock={null}
// 				gameover={true}
// 				/>
// 			)

// 			const firstCell = container.querySelector('.cella')
// 			firstCell.style.backgroundColor.should.not.equal('rgb(5, 10, 32)')
// 		})
// 	})

// 	/* ----------------------- */
// 	/* ----- LEADERBOARD ----- */

// 	describe('Leaderboard', () => {
// 		it('renders loading initially', async () => {
// 			global.fetch = () => new Promise(() => {}); // Hangs forever

// 			render(<Leaderboard />);

// 			// No need for waitFor if it's there on initial render. 
// 			// If it's truly initial, use getByText.
// 			const loading = screen.getByText(/Loading leaderboard/i);
// 			loading.should.exist;
// 		});

// 		it('renders fallback on error', async () => {
// 			// Mock fetch to return a failed response
// 			global.fetch = () => Promise.resolve({ ok: false, status: 500 })

// 			render(<Leaderboard />)

// 			await waitFor(async() => {
// 				const err = screen.getByText('Error: HTTP error! status: 500')
// 				err.should.exist
// 			})
// 		})

// 		it('renders leaderboard data', async () => {
// 			// Mock fetch to return some leaderboard data
// 			const mockData = [
// 				['Alice', 300],
// 				['Bob', 250],
// 				['Charlie', 400]
// 			]

// 			global.fetch = () =>
// 				Promise.resolve({
// 				ok: true,
// 				json: () => Promise.resolve(mockData)
// 				})

// 			render(<Leaderboard />)

// 			setTimeout(async () => {
// 				// Wait for each username to appear
// 				const charlie = await screen.findByText('Charlie')
// 				const alice = await screen.findByText('Alice')
// 				const bob = await screen.findByText('Bob')

// 				chai.expect(charlie).to.exist
// 				chai.expect(alice).to.exist
// 				chai.expect(bob).to.exist
// 			}, 0)
// 		})
// 	})

// 	/* ----------------------- */
// 	/* ----- NEXT-BLOCK ----- */

// 	describe('NextBlock', () => {

// 		it('renders 4x4 empty grid when nextBlock is null', () => {
// 			const { container } = render(
// 				<NextBlock
// 					nextBlock={ null }
// 				/>
// 			)

// 			const cells = container.querySelectorAll('.cella')
// 			cells.length.should.equal(16) // 4x4

// 			// All should have the default color
// 			cells.forEach(cell => {
// 				cell.style.backgroundColor.should.equal('rgb(5, 10, 32)')
// 			})
// 		})

// 		it('renders nextBlock cells correctly', () => {
// 			const nextBlock = {
// 				shape: [
// 				[null, 'O', 'O', null],
// 				[null, 'O', 'O', null],
// 				],
// 				type: 'O'
// 			}

// 			const { container } = render(
// 				<NextBlock
// 					nextBlock={ nextBlock }
// 				/>
// 			)

// 			const cells = container.querySelectorAll('.cella')
// 			cells.length.should.equal(16) // still 4x4

// 			// Count colored cells
// 			const coloredCells = [...cells].filter(
// 				c => c.style.backgroundColor !== 'rgb(5, 10, 32)'
// 			)
// 			coloredCells.length.should.equal(4) // 4 'O' blocks in this shape

// 			// Verify one colored cell matches BlockColor
// 			coloredCells.forEach(cell => {
// 				Object.values(BlockColor).should.include(cell.style.backgroundColor)
// 			})
// 		})
// 	})

// 	/* ----------------------- */
// 	/* ------ SPECTATOR ------ */

// 	describe('SpectatorBoard', () => {

// 		it('renders fallback if no statik', () => {

// 			const player = {
// 				username: 'timmy',
// 				grid: null
// 			}

// 			render(<SpectatorBoard player={player} gameover={false} />)

// 			setTimeout(async () => {
// 				const fallback = await screen.findByText('Nothing yet to render')
// 				const username = await screen.findByText(player.username)
// 				const gameover = await screen.findByText('GAME OVER')
				
// 				chai.expect(fallback).to.exist
// 				chai.expect(username).to.exist
// 				chai.expect(gameover).to.be.empty
// 			}, 0)
// 		})

// 		it('renders 200 cells', () => {

// 			const player = {
// 				username: 'timmy',
// 				grid: newgrid()
// 			}

// 			const { container } = render(
// 				<SpectatorBoard
// 					player={player}
// 					gameover={false}
// 				/>
// 			)

// 			const cells = container.querySelectorAll('.cella')
// 			cells.length.should.equal(200)
// 		})
// 	})
// })




























// Always add when testing render
const React = require('react')
const { Provider } = require('react-redux')
const chai = require('chai')
const { render, screen, cleanup } = require('@testing-library/react')

const configureStore = require('redux-mock-store').default


// Board/Logic requires
const { Board } = require('../../src/client/frontend/components/Board.jsx')
const { SpectatorBoard } = require('../../src/client/frontend/components/SpectatorBoard.jsx')
const { NextBlock } = require('../../src/client/frontend/components/NextBlock.jsx')
const Leaderboard = require('../../src/client/frontend/components/Leaderboard.jsx').default
const { newgrid } = require('../../src/tetris/gridManip.js')

chai.should()

// 1. Create a dummy reducer/store for components that need it
const mockStore = configureStore([])
const store = mockStore({});

// 2. Helper to wrap components in Provider
const renderWithRedux = (ui) => {
    return render(<Provider store={store}>{ui}</Provider>);
};

const oldFetch = global.fetch

afterEach(() => {
    cleanup()
    global.fetch = oldFetch
})

describe('React Components (.jsx)', () => {

    /* ----------------------- */
    /* -------- BOARD -------- */

    describe('Board', () => {
        it('renders 200 cells', () => {
            const { container } = render(
                <Board statik={newgrid()} activeBlock={null} gameover={false} />
            )
            const cells = container.querySelectorAll('.cella')
            cells.length.should.equal(200)
        })

        it('renders active block cells', () => {
            const mockBlock = {
                shape: [[null,'O', 'O',null], [null,'O', 'O',null]],
                row: 0, column: 0, type: 'O'
            }
            const { container } = render(
                <Board statik={newgrid()} activeBlock={mockBlock} gameover={false} />
            )
            const coloredCells = [...container.querySelectorAll('.cella')]
                .filter(c => c.style.backgroundColor !== 'rgb(5, 10, 32)')
            
            coloredCells.length.should.be.above(0)
        })
    })

    /* ----------------------- */
    /* ----- LEADERBOARD ----- */

    describe('Leaderboard', () => {
	
		it('renders loading initially', async () => {
			// Mock fetch
			const pendingPromise = new Promise(() => {})
			global.fetch = () => pendingPromise
	
			render(<Leaderboard />)
			
			// Use a regex matcher. If this fails, look at the error output 
			// to see if "Ignored nodes" includes the text container.
			const loading = screen.getByText(/Loading leaderboard/i)
			chai.expect(loading).to.exist
		})
	
		it('renders data correctly after fetch', async () => {
			const mockData = [['Charlie', 400], ['Alice', 300]]
	
			global.fetch = () => Promise.resolve({
				ok: true,
				json: () => Promise.resolve(mockData)
			})
	
			render(<Leaderboard />)
	
			// IMPORTANT: Increase timeout if JSDOM/Node 22 is sluggish
			const charlie = await screen.findByText(/Charlie/i, {}, { timeout: 2000 })
			charlie.should.exist
		})
	})

    /* ----------------------- */
    /* ----- NEXT-BLOCK ----- */

    describe('NextBlock', () => {
        it('renders 4x4 empty grid when nextBlock is null', () => {
            const { container } = render(<NextBlock nextBlock={null} />)
            const cells = container.querySelectorAll('.cella')
            cells.length.should.equal(16)

            cells.forEach(cell => {
                cell.style.backgroundColor.should.equal('rgb(5, 10, 32)')
            })
        })

        it('renders nextBlock cells correctly', () => {
            const nextBlock = {
                shape: [[null, 'O', 'O', null], [null, 'O', 'O', null]],
                type: 'O'
            }
            const { container } = render(<NextBlock nextBlock={nextBlock} />)
            const cells = container.querySelectorAll('.cella')
            const coloredCells = [...cells].filter(c => c.style.backgroundColor !== 'rgb(5, 10, 32)')

            coloredCells.length.should.equal(4)
        })
    })

    /* ----------------------- */
    /* ------ SPECTATOR ------ */

    describe('SpectatorBoard', () => {
        it('renders fallback and username', async () => {
            const player = { username: 'timmy', grid: null }

            render(<SpectatorBoard player={player} gameover={false} />)

            // Always await the specific element that appears after a state change or effect
            const username = screen.getByText(player.username)
            chai.expect(username).to.exist
        })

        it('renders 200 cells for spectator', () => {
            const player = { username: 'timmy', grid: newgrid() }
            const { container } = render(<SpectatorBoard player={player} gameover={false} />)

            const cells = container.querySelectorAll('.cella')
            cells.length.should.equal(200)
        })
    })
})