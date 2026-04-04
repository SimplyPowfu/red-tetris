<script setup lang="ts">
import { computed } from 'vue'
import { BlockColor, type PieceType } from '@red/shared/types/PieceType'
import type { MapType } from '@red/shared/types/MapType'

// 1. Define Props to accept the player data
const props = defineProps<{
    username: string;
    score: number;
    grid: MapType;
    gameover?: boolean;
    mini?: boolean; // Optional: for showing smaller preview boards
}>()

// Cell Renderer Logic
// Note: Since this is likely a remote player, we only render what's in the grid.
// If you want to show THEIR ghost/active piece, those must be sent in the MapType 
// or as additional props.
const getCellStyle = (cellValue: string | null) => {
    let type = cellValue;
    
    // If player is dead, we turn all blocks into 'X' style
    if (props.gameover && type !== null) type = 'X';

    const color = type ? BlockColor[type as PieceType] : "#050a20";

    return {
        backgroundColor: color,
        boxShadow: type 
            ? 'inset 0 0 0 1px rgba(255,255,255,0.1)' 
            : 'inset 0 0 0 1px rgba(255,255,255,0.02)'
    };
};
</script>

<template>
    <div class="player-container" :class="{ 'is-mini': mini, 'is-dead': gameover }">
        <div class="player-info">
            <span class="username">{{ username }}</span>
            <span class="score">{{ score.toLocaleString() }}</span>
        </div>

        <div class="griglia">
            <template v-for="(row, i) in grid" :key="`row-${i}`">
                <div 
                    v-for="(cell, j) in row" 
                    :key="`${i}-${j}`"
                    class="cella"
                    :style="getCellStyle(cell)"
                ></div>
            </template>
        </div>
        
        <div v-if="gameover" class="overlay">GAME OVER</div>
    </div>
</template>

<style scoped>
.player-container {
    --tile-size: 20px; 
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
    padding: 10px;
    background: rgba(0,0,0,0.2);
    border-radius: 8px;
}

.is-mini {
    --tile-size: 12px;
}

.player-info {
    width: 100%;
    display: flex;
    justify-content: space-between;
    margin-bottom: 5px;
    font-family: 'monospace';
    font-size: 0.9rem;
}

.username {
    font-weight: bold;
    color: #eee;
}

.score {
    color: #4ade80; /* Tailwind green-400 */
}

.griglia {
    display: grid;
    grid-template-columns: repeat(10, var(--tile-size));
    gap: 1px;
    background: #1a1a1a;
    padding: 2px;
    border: 2px solid #333;
}

.is-dead .griglia {
    filter: grayscale(1) brightness(0.5);
}

.cella {
    width: var(--tile-size);
    height: var(--tile-size);
}

.overlay {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) rotate(-15deg);
    color: #ff4444;
    font-weight: bold;
    font-size: 1.2rem;
    border: 3px solid #ff4444;
    padding: 4px 8px;
    background: rgba(0,0,0,0.8);
    pointer-events: none;
}
</style>