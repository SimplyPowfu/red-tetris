import { useState, useEffect, act } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

const BlockColor = {
  I: '#00E5FF', // azzurro
  L: '#2962FF', // blu
  J: '#FF9100', // arancione
  O: '#FFD600', // giallo
  S: '#00C853', // verde
  Z: '#D50000', // rosso
  T: '#AA00FF', // viola
  X: '#535353'  // grigio 
};

const Tetriminos = {
  I:[
    [null,null,null,null],
    ['I', 'I', 'I', 'I'],
    [null,null,null,null],
    [null,null,null,null]],

  O:[
    [null,'O', 'O',null],
    [null,'O', 'O',null],
    [null,null,null,null]],

  T:[
    [null, 'T', null],
    ['T', 'T', 'T'],
    [null,null,null]],

  L:[
    ['L', null, null],
    ['L', 'L', 'L'],
    [null,null,null]],

  J:[
    [null, null, 'J'],
    ['J', 'J', 'J'],
    [null,null,null]],

  S:[
    [null, 'S', 'S'],
    ['S', 'S', null],
    [null,null,null]],

  Z:[
    ['Z', 'Z', null],
    [null, 'Z', 'Z'],
    [null,null,null]]
}

function App() {
  const [grid, setGrid] = useState(() => Array.from({length: 20}, () => Array(10).fill(null)));
  const [activeBlock, setActiveBlock] = useState(null);
  const [isGameOver, setIsGameOver] = useState(false);

  useEffect(() => {
    const intervalId = setInterval(() => { fallBlock(); }, 1000);
    return () => clearInterval(intervalId);
  }, [activeBlock, grid]); 

  //tasti della tastiera
  useEffect(() => {
    const handleKeyDown = (event) => {
      switch (event.key) {
        case 'ArrowLeft':
          moveBlock('left');
          break;
        case 'ArrowRight':
          moveBlock('right');
          break;
        case 'ArrowDown':
          fallBlock();
          break;
        case 'ArrowUp':
          rotateBlock();
          break;
        case ' ': // Barra spaziatrice
          megaFallBlock();
          break;
        default:
          break;
      }
    };
    // Aggiungiamo l'ascoltatore all'avvio del componente
    window.addEventListener('keydown', handleKeyDown);
    // IMPORTANTE: Pulizia dell'evento quando il componente viene smontato
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [moveBlock, fallBlock, rotateBlock, megaFallBlock]); // Dipendenze delle funzioni


  function isValidPosition(shape, row, column, currentGrid) {
    for (let i = 0; i < shape.length; i++) {
      for (let j = 0; j < shape[i].length; j++) {
        if (shape[i][j] !== null) {
          const newRow = row + i;
          const newCol = column + j;
          if (
            newCol < 0 ||
            newCol >= 10 ||
            newRow >= 20 ||
            (newRow >= 0 && currentGrid[newRow][newCol] !== null)
          ) {
            return false;
          }
        }
      }
    }
    return true;
  }

  function clearGrid(){
    const newGrid = Array.from({length: 20}, () => Array(10).fill(null))
    setGrid(newGrid);
    setActiveBlock(null);
    setIsGameOver(false);
  }

  function addBlock() {
    if (isGameOver) return;

    const types = Object.keys(Tetriminos);
    const randomKey = types[Math.floor(Math.random() * types.length)];
    const shape = Tetriminos[randomKey];

    const newBlock = {
      shape,
      row: 0,
      column: 3,
      type: randomKey
    };

    if (!isValidPosition(shape, 0, 3, grid)) {
      setIsGameOver(true);
      return;
    }

    setActiveBlock(newBlock);
  }

  function getGhostRow() {
    if (!activeBlock) return null;
    const { shape, row, column } = activeBlock;
    let ghostRow = row;
    while (isValidPosition(shape, ghostRow + 1, column, grid)) {
      ghostRow++;
    }
    return ghostRow;
  }


  function rotateClockwise(shape) {
    const rows = shape.length;
    const cols = shape[0].length;
    const rotated = Array.from({ length: cols }, () => Array(rows).fill(null));

    for (let x = 0; x < rows; x++) {
      for (let y = 0; y < cols; y++) {
        rotated[y][rows - 1 - x] = shape[x][y];
      }
    }
    return rotated;
  }

  function rotateBlock() {
    if (!activeBlock) return;
    const rotated = rotateClockwise(activeBlock.shape);

    if (isValidPosition(rotated, activeBlock.row, activeBlock.column, grid)) {
      setActiveBlock({
        ...activeBlock,
        shape: rotated
      });
    }
}

  function checkLines(currentGrid) {
    const penaltyLines = currentGrid.filter(row => row.includes('X'));
    const playableLines = currentGrid.filter(row => !row.includes('X'));

    // quante righe sono rimase
    const remainingPlayable = playableLines.filter(row => row.some(cell => cell === null));
    //quante righe devono essere rimosse
    const removedCount = playableLines.length - remainingPlayable.length;
    
    //if (removedCount > 1) chiamare addPenalty() (removedCount - 1) volte
    if (removedCount > 0) {
      const newEmptyLines = Array.from({ length: removedCount }, () => 
        Array(10).fill(null)
      );
      return [...newEmptyLines, ...remainingPlayable, ...penaltyLines];
    }
    return currentGrid;
  }

  function addPenalty() {
    setGrid(prevGrid => {
      const newGrid = prevGrid.slice(1);
      const penaltyRow = Array(10).fill('X');
      return [...newGrid, penaltyRow];
    });

    if (activeBlock) {
      const pushedRow = activeBlock.row;
      if (!isValidPosition(
        activeBlock.shape,
        pushedRow,
        activeBlock.column,
        grid
      )) {
        setIsGameOver(true);
      } else {
        setActiveBlock(prev => ({
          ...prev,
          row: pushedRow
        }));
      }
    }
  }


  function fallBlock() {
    if (!activeBlock) return;
    const { shape, row, column } = activeBlock;
    const newRow = row + 1;

    if (isValidPosition(shape, newRow, column, grid)) {
      setActiveBlock({ ...activeBlock, row: newRow });
    } else {
      const newGrid = grid.map(r => [...r]);

      for (let i = 0; i < shape.length; i++) {
        for (let j = 0; j < shape[i].length; j++) {
          if (shape[i][j] !== null) {
            newGrid[row + i][column + j] = shape[i][j];
          }
        }
      }
      const cleared = checkLines(newGrid);
      setGrid(cleared);
      setActiveBlock(null);
      addBlock();
    }
  }

  function megaFallBlock() {
    if (!activeBlock) return;
    const { shape, row, column } = activeBlock;
    let finalRow = row;

    while (isValidPosition(shape, finalRow + 1, column, grid)) {
      finalRow++;
    }
    const newGrid = grid.map(r => [...r]);

    for (let i = 0; i < shape.length; i++) {
      for (let j = 0; j < shape[i].length; j++) {
        if (shape[i][j] !== null) {
          newGrid[finalRow + i][column + j] = shape[i][j];
        }
      }
    }
    const cleared = checkLines(newGrid);
    setGrid(cleared);
    setActiveBlock(null);
    addBlock();
  }

  function moveBlock(direction) {
    if (!activeBlock) return;
    const delta = direction === 'left' ? -1 : 1;
    const { shape, row, column } = activeBlock;
    const newColumn = column + delta;

    if (isValidPosition(shape, row, newColumn, grid)) {
      setActiveBlock({ ...activeBlock, column: newColumn });
    }
  }

  const ghostRow = getGhostRow();

  return (
    <div className="game-container">
      <div className='card'>
        <button onClick={() => clearGrid()}>Pulisci Griglia</button>
        <button onClick={() => addBlock()}>Aggiungi Blocco</button>
      </div>
      <div className="griglia">
        {isGameOver && (
          <div className="game-over-overlay">
            <h2>GAME OVER</h2>
            <button onClick={clearGrid}>Riprova</button>
          </div>
        )}
        {grid.map((riga, i) =>
          riga.map((cella, j) => {

            let cellValue = cella;
            let isGhost = false;

            // BLOCCO ATTIVO
            if (activeBlock) {
              const { shape, row, column, type } = activeBlock;
              const relativeRow = i - row;
              const relativeCol = j - column;

              if (
                relativeRow >= 0 &&
                relativeRow < shape.length &&
                relativeCol >= 0 &&
                relativeCol < shape[0].length &&
                shape[relativeRow][relativeCol] !== null
              ) {
                cellValue = type;
              }
            }

            // GHOST (solo se la cella è vuota)
            if (
              activeBlock &&
              ghostRow !== null &&
              cellValue === null
            ) {
              const { shape, column } = activeBlock;
              const relativeRow = i - ghostRow;
              const relativeCol = j - column;

              if (
                relativeRow >= 0 &&
                relativeRow < shape.length &&
                relativeCol >= 0 &&
                relativeCol < shape[0].length &&
                shape[relativeRow][relativeCol] !== null
              ) {
                isGhost = true;
              }
            }

            const finalBgColor = cellValue
              ? BlockColor[cellValue]
              : "#050a20";

            return (
              <div
                key={`${i}-${j}`}
                className="cella"
                style={{
                  backgroundColor: finalBgColor,
                  boxShadow: isGhost
                    ? `inset 0 0 0 2px ${BlockColor[activeBlock.type]}`
                    : 'inset 0 0 0 1px rgba(255,255,255,0.05)'
                }}
              />
            );
          })
        )}
      </div>
      <div className='card'>
        <button onClick={() => addPenalty()}>✖️</button>
      </div>
    </div>
  );
}

export default App
