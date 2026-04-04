<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

import { useGameStore } from '@/stores/game'
import { useLobbyStore } from '@/stores/lobby'
import { useAuthStore } from '@/stores/auth'

import { BlockColor, type PieceType } from '@red/shared/types/PieceType' // Ensure this path is correct
import Board from '@red/shared/classes/Board'
import Piece from '@red/shared/classes/Piece'

const store = useGameStore()
const lobbyStore = useLobbyStore()
const authStore = useAuthStore()

// Ghost logic (Replaces getGhostRow from your React code)
const ghostRow = computed(() => {
  if (!store.activePiece || !store.grid/*  || store.mode === 'ghost' */) return null
  
  let gRow = store.activePiece.row
  
  // Use the underlying underscores or the getters explicitly
  while (Board.validCheck(store.grid, { 
    shape: store.activePiece.shape, // Use the getter here
    row: gRow + 1, 
    column: store.activePiece.column 
  } as Piece)) {
    gRow++
  }
  return gRow
})


// Cell Renderer Logic
const getCellData = (i: number, j: number, cellValue: string | null) => {
	let type = cellValue
	let isGhost = false

	const piece = store.activePiece

	if (lobbyStore.ingame) {
		if (piece) {
			const { shape, row, column, type: pType } = piece
			const rRow = i - row
			const rCol = j - column
	
			if (shape[rRow]?.[rCol] !== null && shape[rRow]?.[rCol] !== undefined) {
				type = pType
			}
		}
	
		// Ghost check
		if (piece && ghostRow.value !== null && type === null) {
			const { shape, column, type: pType } = piece
			const rRow = i - ghostRow.value
			const rCol = j - column
			if (shape[rRow]?.[rCol] !== null && shape[rRow]?.[rCol] !== undefined) {
				type = pType
				isGhost = true
			}
		}
	}

	if (type && store.gameover) type = 'X'

	return {
		color: type ? BlockColor[type as PieceType] : "#050a20",
		isGhost,
		activeType: piece?.type
	}
}

const getCellStyle = (i: number, j: number, cellValue: string | null) => {
	const data = getCellData(i, j, cellValue);

	// If it's a ghost, we want the background to be the "empty" color
	// but if it's a real block, we want the piece color.
	const finalBackgroundColor = data.isGhost ? "#050a20" : data.color;

	const style: any = {
		backgroundColor: finalBackgroundColor,
	};

	if (data.isGhost && data.activeType) {
		// This creates the "hollow" border effect using an inset box-shadow
		style.boxShadow = `inset 0 0 0 2px ${BlockColor[data.activeType]}`;
	} else {
		// Standard grid cell border
		style.boxShadow = 'inset 0 0 0 1px rgba(255,255,255,0.05)';
	}

  return style;
};

</script>

<template>
	<div class="game-container">
		<div class="board-wrapper">
			<div class="griglia">
				<template v-for="(row, i) in store.grid" :key="`row-${i}`">
					<div 
						v-for="(cell, j) in row" 
						:key="`${i}-${j}`"
						class="cella"
						:style="getCellStyle(i, j, cell)"
					></div>
				</template>
			</div>

			<Transition name="fade">
                <div v-if="lobbyStore.winner !== ''" class="winner-overlay">
                    <div class="winner-card">
                        <h2 class="winner-name">{{ lobbyStore.winner }}</h2>
                        <p v-if="lobbyStore.winner !== authStore.username" class="winner-text">just wooped your butt!</p>
						<p v-else class="winner-text">congrats, you won!</p>
                    </div>
                </div>
            </Transition>

		</div>
	</div>
</template>

<style scoped>
.game-container {
	display: flex;
	flex-direction: column;
	align-items: center;
}

@media (max-width: 959px) {
    .lobby-container {
        /* 1. Calculate the absolute maximum tile size that fits the screen */
        /* 90vw / 10 columns = 9vw per tile max */
        /* 70vh / 20 rows = 3.5vh per tile max (leaving room for top/bottom UI) */
        --max-mobile-w: 9vw;
        --max-mobile-h: 3.5vh; 
        
        /* 2. The 'Safe' limit based on screen real estate */
        --safe-tile-size: min(var(--max-mobile-w), var(--max-mobile-h));

        /* 3. The Final Tile Size: 
           Use the user's slider value, but CLAMP it so it never 
           goes below 10px or above the screen's safe limit */
        --tile-size: clamp(10px, var(--user-tile-size), var(--safe-tile-size));
    }
}

/* Desktop default remains the slider value directly */
@media (min-width: 960px) {
    .lobby-container {
        --tile-size: var(--user-tile-size);
    }
}

.board-wrapper {
    position: relative; /* Context for the overlay */
}

.griglia {
	display: grid;
	/* Grid uses the variable inherited from .game-container */
	grid-template-columns: repeat(10, var(--tile-size));
	gap: 1px;
	background: #333;
	padding: 3px;
	border: 2px solid #444;
}

.cella {
	width: var(--tile-size);
	height: var(--tile-size);
	transition: background-color 0.1s ease;
}

/* ----------------------------- */
/*     Winner Overlay Styles     */

.winner-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(5, 10, 32, 0.85); /* Semi-transparent dark blue */
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 10;
    backdrop-filter: blur(4px);
    border: 3px solid gold; /* Give the winner some shine */
}

.winner-card {
    text-align: center;
    padding: 20px;
    animation: popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.winner-name {
    color: gold;
    font-size: 2rem;
    text-transform: uppercase;
    margin: 0;
    text-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
}

.winner-text {
    color: white;
    font-weight: bold;
    font-family: 'monospace';
}

/* Animations */
@keyframes popIn {
    from { transform: scale(0.5); opacity: 0; }
    to { transform: scale(1); opacity: 1; }
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.5s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>