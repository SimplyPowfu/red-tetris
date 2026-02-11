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

  // useEffect(() => {
  //   const intervalId = setInterval(() => { fallBlock(); }, 500);
  //   return () => clearInterval(intervalId);
  // }, [activeBlock, grid]); 

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

  function clearGrid(){
    const newGrid = Array.from({length: 20}, () => Array(10).fill(null))
    setGrid(newGrid);
    setActiveBlock(null);
  }

  function addBlock(){
    const tipi = Object.keys(Tetriminos); // ["I","O","T","L","J","S","Z"]
    const chiaveCasuale = tipi[Math.floor(Math.random() * tipi.length)];
    const block = Tetriminos[chiaveCasuale];
    const row = 0;
    const column = 3;

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

  function getGhostRow() {
    if (!activeBlock) return null;
    const { shape, row, column } = activeBlock;
    let gridCopy = grid.map(riga => [...riga]);
    for (let i = 0; i < shape.length; i++) {
      for (let j = 0; j < shape[i].length; j++) {
        if (shape[i][j] !== null) {
          gridCopy[row + i][column + j] = null;
        }
      }
    }

    let ghostRow = row;
    while (true) {
      let canMoveDown = true;
      const nextRow = ghostRow + 1;
      for (let i = 0; i < shape.length; i++) {
        for (let j = 0; j < shape[i].length; j++) {
          if (shape[i][j] !== null) {
            const targetRow = nextRow + i;
            if (targetRow >= 20 || gridCopy[targetRow][column + j] !== null) {
              canMoveDown = false;
              break;
            }
          }
        }
        if (!canMoveDown) break;
      }
      if (canMoveDown) ghostRow = nextRow;
      else break;
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
    const { shape, row, column } = activeBlock;
    let gridCopy = grid.map(riga => [...riga]);

    // Cancella temporaneamente il blocco dalla griglia
    for (let i = 0; i < shape.length; i++) {
      for (let j = 0; j < shape[i].length; j++) {
        if (shape[i][j] !== null) {
          gridCopy[row + i][column + j] = null;
        }
      }
    }

    // Ruota il blocco
    const newShape = rotateClockwise(shape);
    const newRows = newShape.length;
    const newCols = newShape[0].length;

    let canRotate = true;
    for (let i = 0; i < newRows; i++) {
      for (let j = 0; j < newCols; j++) {
        if (newShape[i][j] !== null) {
          const newRow = row + i;
          const newCol = column + j;

          if (
            newCol < 0 || newCol >= 10 || // bordi laterali
            newRow < 0 || newRow >= 20 || // bordo inferiore/superiore (assumendo altezza 20)
            (gridCopy[newRow][newCol] !== null) // collisione con blocchi statici
          ) {
            canRotate = false;
            break;
          }
        }
      }
      if (!canRotate) break;
    }

    if (canRotate) {
      for (let i = 0; i < newRows; i++) {
        for (let j = 0; j < newCols; j++) {
          if (newShape[i][j] !== null) {
            gridCopy[row + i][column + j] = newShape[i][j];
          }
        }
      }
      setGrid(gridCopy);
      setActiveBlock({
        ...activeBlock,
        shape: newShape
      });
    } else {
      // Ripristina il blocco originale se non può ruotare
      for (let i = 0; i < shape.length; i++) {
        for (let j = 0; j < shape[i].length; j++) {
          if (shape[i][j] !== null) {
            gridCopy[row + i][column + j] = shape[i][j];
          }
        }
      }
      setGrid(gridCopy);
    }
  }

  function checkLines(currentGrid) {
    const penaltyLines = currentGrid.filter(row => row.includes('X'));
    const playableLines = currentGrid.filter(row => !row.includes('X'));

    // quante righe sono rimase
    const remainingPlayable = playableLines.filter(row => row.some(cell => cell === null));
    //quante righe devono essere rimosse
    const removedCount = playableLines.length - remainingPlayable.length;

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

    // 4. Importante: se c'è un blocco attivo, deve salire anche lui 
    // per non finire "dentro" la griglia spostata
    if (activeBlock) {
      setActiveBlock(prev => ({
        ...prev,
        row: prev.row - 1
      }));
    }
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
      const gridWithClearedLines = checkLines(gridCopy);
      setGrid(gridWithClearedLines);
      setActiveBlock(null);
      // addBlock();
    }
  }

  function megaFallBlock() {
    if (!activeBlock) return;
    const { shape, column } = activeBlock;
    let currentRow = activeBlock.row;
    let gridCopy = grid.map(riga => [...riga]);
    //Rimuovi temporaneamente il blocco attivo per i calcoli
    for (let i = 0; i < shape.length; i++) {
      for (let j = 0; j < shape[i].length; j++) {
        if (shape[i][j] !== null) {
          gridCopy[currentRow + i][column + j] = null;
        }
      }
    }
    // Trova l'ultima riga possibile (simulando la caduta)
    let finalRow = currentRow;
    while (true) {
      let canMoveDown = true;
      const nextRow = finalRow + 1;
      for (let i = 0; i < shape.length; i++) {
        for (let j = 0; j < shape[i].length; j++) {
          if (shape[i][j] !== null) {
            const targetRow = nextRow + i;
            // Controllo collisione bordi o altri blocchi
            if (targetRow >= 20 || gridCopy[targetRow][column + j] !== null) {
              canMoveDown = false;
              break;
            }
          }
        }
        if (!canMoveDown) break;
      }
      if (canMoveDown) {
        finalRow = nextRow;
      } else {
        break;
      }
    }

    for (let i = 0; i < shape.length; i++) {
      for (let j = 0; j < shape[i].length; j++) {
        if (shape[i][j] !== null) {
          gridCopy[finalRow + i][column + j] = shape[i][j];
        }
      }
    }
    const gridWithClearedLines = checkLines(gridCopy);
    setGrid(gridWithClearedLines);
    setActiveBlock(null);
    // addBlock();
  }

  function moveBlock(direction) {
    if (!activeBlock) return;
    const { shape, row, column } = activeBlock;

    let gridCopy = grid.map(riga => [...riga]);
    // Cancella temporaneamente il blocco
    for (let i = 0; i < shape.length; i++) {
      for (let j = 0; j < shape[i].length; j++) {
        if (shape[i][j] !== null) {
          gridCopy[row + i][column + j] = null;
        }
      }
    }

    const delta = direction === 'left' ? -1 : 1;
    let canMove = true;
    for (let i = 0; i < shape.length; i++) {
      for (let j = 0; j < shape[i].length; j++) {
        if (shape[i][j] !== null) {
          const nextCol = column + j + delta;
          // Collisione con i bordi
          if (nextCol < 0 || nextCol >= 10) {
            canMove = false;
            break;
          }
          // Collisione con blocchi statici
          if (gridCopy[row + i][nextCol] !== null) {
            canMove = false;
            break;
          }
        }
      }
      if (!canMove) break;
    }
    if (canMove) {
      const newColumn = column + delta;
      for (let i = 0; i < shape.length; i++) {
        for (let j = 0; j < shape[i].length; j++) {
          if (shape[i][j] !== null) {
            gridCopy[row + i][newColumn + j] = shape[i][j];
          }
        }
      }
      setGrid(gridCopy);
      setActiveBlock({
        ...activeBlock,
        column: newColumn
      });
    } else {
      // Ripristina il blocco alla posizione originale xche non si puo' muovere
      for (let i = 0; i < shape.length; i++) {
        for (let j = 0; j < shape[i].length; j++) {
          if (shape[i][j] !== null) {
            gridCopy[row + i][column + j] = shape[i][j];
          }
        }
      }
      setGrid(gridCopy);
    }
  }
  const ghostRow = getGhostRow();

  return (
    <>
      <div className='card'>
        <button onClick={() => clearGrid()}>
          Pulisci Griglia
        </button>
        <button onClick={() => addBlock()}>
          Aggiungi Blocco
        </button>
      </div>
      <div className="griglia">
        {grid.map((riga, i) =>
          riga.map((cella, j) => {
            let isGhost = false;
            if (activeBlock && cella === null && ghostRow !== null) {
              const { shape, column } = activeBlock;
              const rigaRelativa = i - ghostRow;
              const colonnaRelativa = j - column;
              if (
                rigaRelativa >= 0 && rigaRelativa < shape.length &&
                colonnaRelativa >= 0 && colonnaRelativa < shape[0].length &&
                shape[rigaRelativa][colonnaRelativa] !== null
              ) {
                isGhost = true;
              }
            }
            // Definiamo il colore di base
            let finalBgColor = "white";
            if (cella !== null) {
              finalBgColor = BlockColor[cella];
            } else if (isGhost) {
              // Colore del blocco attivo ma molto sbiadito (33 è l'alpha in esadecimale)
              finalBgColor = `${BlockColor[activeBlock.type]}90`;
            }
            return (
              <div
                key={`${i}-${j}`}
                className="cella"
                style={{
                  backgroundColor: finalBgColor,
                  // Usiamo boxShadow invece di border per non rompere la griglia
                  boxShadow: isGhost 
                    ? `inset 0 0 0 5px ${BlockColor[activeBlock.type]}` 
                    : 'inset 0 0 0 0px #ffffff',
                }}
              />
            );
          })
        )}
      </div>
      <div className='card'>
        <button onClick={() => addPenalty()}>
          ✖️
        </button>
      </div>
    </>
  );
}

export default App
