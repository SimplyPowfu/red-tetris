import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

const BlockColor = {
  I: '#00E5FF', // azzurro
  J: '#2962FF', // blu
  L: '#FF9100', // arancione
  O: '#FFD600', // giallo
  S: '#00C853', // verde
  Z: '#D50000', // rosso
  T: '#AA00FF',  // viola
  X: '#2e2e2e'
};

const Tetriminos = {
  I:[['I', 'I', 'I', 'I']],

  O:[
    ['O', 'O'],
    ['O', 'O']],

  T:[
    [null, 'T', null],
    ['T', 'T', 'T']],

  L:[
    ['L', null],
    ['L', null],
    ['L', 'L']],

  J:[
    [null, 'J'],
    [null, 'J'],
    ['J', 'J']],

  S:[
    [null, 'S', 'S'],
    ['S', 'S', null]],

  Z:[
    ['Z', 'Z', null],
    [null, 'Z', 'Z']]

  // X: [['X', 'X', 'X', 'X','X', 'X', 'X', 'X','X', 'X']]
}

function App() {
  const [grid, setGrid] = useState(() => {
    return Array.from({length: 20}, () => Array(10).fill(null))
  });
  const [activeBlock, setActiveBlock] = useState(null);


  function clearGrid(){
    const newGrid = Array.from({length: 20}, () => Array(10).fill(null))
    setGrid(newGrid);
  }

  function addBlock(){
    const tipi = Object.keys(Tetriminos); // ["I","O","T","L","J","S","Z"]
    const chiaveCasuale = tipi[Math.floor(Math.random() * tipi.length)];
    const block = Tetriminos[chiaveCasuale];
    const row = 0;
    let column;
    if (chiaveCasuale === "O" || chiaveCasuale === "L") column = 4
    else if (chiaveCasuale === "X") column = 0;
    else column = 3;

    const newActiveBlock = {
      shape: block,
      row: row,
      column: column,
      type: chiaveCasuale
    };
    setActiveBlock(newActiveBlock);

    const gridCopy = grid.map(riga => [...riga]);
    for(let i = 0; i < block.length; i++) {
      for (let j = 0; j < block[i].length; j++) {
        if (block[i][j] !== null) {
          gridCopy[i][column + j] = block[i][j];
        }
      }
    }
    setGrid(gridCopy);
  }

  function fallBlock() {
    if (!activeBlock) return;
    const { shape, row, column } = activeBlock;

    let gridCopy = grid.map(riga => [...riga]);
    // Cancella temporaneamente il blocco per non farlo collidere da solo
    for (let i = 0; i < shape.length; i++) {
      for (let j = 0; j < shape[i].length; j++) {
        if (shape[i][j] !== null) {
          gridCopy[row + i][column + j] = null;
        }
      }
    }

    // Check collisione
    let canMoveDown = true;
    for (let i = 0; i < shape.length; i++) {
      for (let j = 0; j < shape[i].length; j++) {
        if (shape[i][j] !== null) {
          const nextRow = row + i + 1;
          // collisione con il fondo
          if (nextRow >= 20) {
            canMoveDown = false;
            break;
          }
          // collisione con un blocco statico
          if (gridCopy[nextRow][column + j] !== null) {
            canMoveDown = false;
            break;
          }
        }
      }
      if (!canMoveDown) break;
    }
    if (canMoveDown) {
      const newRow = row + 1;
      for (let i = 0; i < shape.length; i++) {
        for (let j = 0; j < shape[i].length; j++) {
          if (shape[i][j] !== null) {
            gridCopy[newRow + i][column + j] = shape[i][j];
          }
        }
      }
      setGrid(gridCopy);
      setActiveBlock({
        ...activeBlock,
        row: newRow
      });
    } else {
      for (let i = 0; i < shape.length; i++) {
        for (let j = 0; j < shape[i].length; j++) {
          if (shape[i][j] !== null) {
            gridCopy[row + i][column + j] = shape[i][j];
          }
        }
      }
      setGrid(gridCopy);
      setActiveBlock(null);
    }
  }

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Local Tetris</h1>
      <div className='card'>
        <button onClick={() => clearGrid()}>
          Pulisci Griglia
        </button>
        <button onClick={() => addBlock()}>
          Aggiungi Blocco
        </button>
        <button onClick={() => fallBlock()}>
          ⬇️
        </button>
      </div>
      <div className="griglia">
        {grid.map((riga, i) =>
          riga.map((cella, j) => (
            <div
              key={`${i}-${j}`}
              className="cella"
              style={{
                backgroundColor: cella === null ? "white" : BlockColor[cella]
              }}
            />
          ))
        )}
      </div>
    </>
  )
}

export default App
