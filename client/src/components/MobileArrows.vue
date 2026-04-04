<script setup lang="ts">
import { useGameStore } from '@/stores/game'

const gameStore = useGameStore()

const move = (direction: string) => {
  if (gameStore.gameover) return
  gameStore.sendMove(direction)
}
</script>

<template>
<div class="mobile-controls-overlay">
	<div class="control-group">
	<button class="ctrl-btn" @touchstart.prevent="move('Left')">◀</button>
	<button class="ctrl-btn rotate-btn" @touchstart.prevent="move('Rotate')">↻</button>
	<button class="ctrl-btn" @touchstart.prevent="move('Right')">▶</button>
	</div>
	<div class="control-group">
		<button class="ctrl-btn drop-btn" @touchstart.prevent="move('Mega')">MEGA DROP</button>
	</div>
</div>
</template>

<style scoped>
.mobile-controls-overlay {
display: flex;
flex-direction: column;
gap: 12px;
width: 100%;
padding: 10px;
box-sizing: border-box;
pointer-events: none;
}

.control-group {
display: flex;
justify-content: center;
gap: 12px;
pointer-events: auto;
}

.ctrl-btn {
/* Simple semi-transparent dark background */
background: rgba(10, 10, 10, 0.3);

/* Thin, low-impact border */
border: 1px solid rgba(255, 255, 255, 0.1);

/* Ghosted white text */
color: rgba(255, 255, 255, 0.4);

font-family: 'Silkscreen', sans-serif;
padding: 12px;
min-width: 65px;
border-radius: 10px;
touch-action: manipulation;
user-select: none;
transition: background 0.1s, color 0.1s;
}

.rotate-btn {
/* Very subtle blue tint */
border-color: rgba(0, 212, 255, 0.15);
color: rgba(0, 212, 255, 0.4);
}

.drop-btn {
width: 70%;
font-size: 0.7rem;
/* Very subtle red tint */
background: rgba(255, 77, 77, 0.05);
border-color: rgba(255, 77, 77, 0.15);
color: rgba(255, 77, 77, 0.4);
letter-spacing: 2px;
}

/* FEEDBACK: Light up clearly on press so the player knows the input registered */
.ctrl-btn:active {
background: rgba(255, 255, 255, 0.25);
color: #ffffff;
border-color: rgba(255, 255, 255, 0.4);
transform: scale(0.94);
}

.rotate-btn:active {
background: rgba(0, 212, 255, 0.3);
color: #00d4ff;
border-color: #00d4ff;
}

.drop-btn:active {
background: rgba(255, 77, 77, 0.3);
color: #ff4d4d;
border-color: #ff4d4d;
}
</style>