<script setup lang="ts">
import { computed } from 'vue'

import { useGameStore } from '@/stores/game'
import { useLobbyStore } from '@/stores/lobby'

import { BlockColor } from '@red/shared/types/PieceType'
import type { MapType } from '@red/shared/types/MapType'

const store = useGameStore()
const lobbyStore = useLobbyStore()

/**
 * Normalizes any piece shape into a consistent 4x4 grid for the preview window.
 * Replaces the React normalizeTo4x4 function.
 */
const gridToRender = computed(() => {
	const next = store.nextPiece // Assuming you added this to your Pinia store
	const size = 4
	const grid = Array.from({ length: size }, () => Array(size).fill(null))

	if (!lobbyStore.ingame || !next) return grid as MapType

	// Logic: Shift 'I' piece to the top, others down by 1 for centering
	const startRow = next.type === 'I' ? 0 : 1

	next.shape.forEach((row: (string | null)[], i: number) => {
		row.forEach((cell, j) => {
			if (i + startRow < size && j < size) {
				grid[i + startRow]![j] = cell
			}
		})
	})

	return grid as MapType
})
</script>

<template>
	<div class="next-block-wrapper">
		<h3>Next</h3>
		<div class="next-block-grid">
			<template v-for="(row, i) in gridToRender" :key="`row-${i}`">
				<div
					v-for="(cell, j) in row"
					:key="`${i}-${j}`"
					class="cella"
					:style="{
						backgroundColor: cell ? BlockColor[cell] : '#050a20'
					}"
				></div>
			</template>
		</div>
	</div>
</template>

<style scoped>
.next-block-wrapper {
	display: flex;
	flex-direction: column;
	align-items: center;
	background: #2c3e50;
	padding: 10px;
	border-radius: 8px;
	border: 2px solid #444;
}

h3 {
	color: white;
	margin: 0 0 10px 0;
	font-size: 0.9rem;
	text-transform: uppercase;
	letter-spacing: 1px;
}

.next-block-grid {
	display: grid;
	/* Using the same CSS variable as the main board for consistency */
	grid-template-columns: repeat(4, var(--tile-size));
	grid-auto-rows: var(--tile-size);
	gap: 1px;
	background: #333;
	padding: 2px;
}

.cella {
	width: var(--tile-size);
	height: var(--tile-size);
	box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.05);
}

/* Mobile adjust: use the smaller tile size defined in the layout if needed */
@media (max-width: 959px) {
	h3 {
		display: none;
	}

	.next-block-grid {
		--tile-size: var(--next-tile-size, 15px);
	}

	.next-block-wrapper {
		padding: 5px;
		border-radius: 4px;
		border: 1px solid #444;
	}
}
</style>