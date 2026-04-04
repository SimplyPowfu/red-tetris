<script setup lang="ts">
import { useLobbyStore } from '@/stores/lobby'
import { useAuthStore } from '@/stores/auth'
import { useGameStore } from '@/stores/game'
import { socket } from '@/services/socket'
import GameModes, { type GameModeKey } from '@red/shared/types/GameMode'

const lobbyStore = useLobbyStore()
const authStore = useAuthStore()
const gameStore = useGameStore()

// 1. Array of keys to cycle through
const allGameModes = Object.keys(GameModes) as GameModeKey[];

// 2. Logic to change mode based on direction (-1 or 1)
const cycleMode = (direction: number) => {
  if (!socket) return;
  
  const currentIndex = allGameModes.indexOf(gameStore.mode as GameModeKey);
  // This modulo math handles looping around (negative results too)
  const nextIndex = (currentIndex + direction + allGameModes.length) % allGameModes.length;
  const newMode = allGameModes[nextIndex];
  
  socket.emit('setLobbyMode', { mode: newMode as GameModeKey });
}
</script>

<template>
<div class="retro-box">
	<div class="retro-box-title pixelated">
		{{ lobbyStore.hostName === authStore.username ? 'Host-UI' : 'Status' }}
	</div>

	<div v-if="lobbyStore.hostName === authStore.username" class="host-controls">
	<p class="label">SELECT MODE</p>
	
	<div class="mode-picker">
		<button @click="cycleMode(-1)" class="arrow-btn">◀</button>
		
		<div class="mode-display">
		<span class="mode-name">{{ gameStore.mode }}</span>
		</div>
		
		<button @click="cycleMode(1)" class="arrow-btn">▶</button>
	</div>

	<button @click="lobbyStore.tryStart()" class="join-btn start-btn">
		START MATCH
	</button>
	</div>
	
	<div v-else-if="lobbyStore.ingame === true" class="waiting-msg">
	Show them what you are made of!!!
	</div>

	<div v-else class="waiting-msg">
	Waiting for {{ lobbyStore.hostName }} to start...
	</div>
</div>
</template>

<style scoped>
.retro-box {
	background: #111;
	border: 2px solid #444;
	width: 100%;
	/* Ensures everything stays inside the 2px border */
	box-sizing: border-box; 
	overflow: hidden; 
}

.retro-box-title {
	background: #222;
	padding: 6px 10px;
	font-size: 1.2rem;
	border-bottom: 2px solid #444;
	color: var(--red-chill);
	text-transform: uppercase;
	width: 100%;
	box-sizing: border-box;

	display: flex;
	justify-content: center; /* Centers horizontally in flex */
	text-align: center;      /* Standard text centering fallback */
}

.host-controls {
	padding: 12px; /* Slightly reduced padding */
	display: flex;
	flex-direction: column;
	gap: 10px;
	align-items: center;
	width: 100%;
	box-sizing: border-box;
}

.mode-picker {
	display: flex;
	align-items: stretch; /* Makes buttons and display same height */
	gap: 8px;
	width: 100%;
	box-sizing: border-box;
}

.mode-display {
	flex: 1; /* Better than flex-grow for centering */
	background: #000;
	border: 1px inset #333;
	display: flex;
	align-items: center;
	justify-content: center;
	min-width: 0; /* Prevents overflow on very small screens */
	padding: 5px;
}

.mode-name {
	color: #4ade80;
	font-family: 'monospace';
	font-weight: bold;
	text-transform: uppercase;
	font-size: 0.85rem;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}

.arrow-btn {
	background: #333;
	border: 1px solid #555;
	color: white;
	padding: 8px 10px;
	cursor: pointer;
	flex-shrink: 0; /* Prevents arrows from squishing */
	display: flex;
	align-items: center;
	justify-content: center;
}

.start-btn {
	width: 100%;
	padding: 12px;
	background: var(--red-chill);
	border: none;
	color: white;
	/* font-weight: bold; */
	font-size: 1.1rem;
	cursor: pointer;
	font-family: 'Silkscreen', sans-serif;
}

.label {
	font-size: 1.0rem;
	color: #888;
	margin: 0; /* Ensure this is 0 */
	line-height: 1; /* Prevents the font from taking extra vertical space */
	text-transform: uppercase;
	letter-spacing: 0.5px;
	
	/* OPTIONAL: Pull the picker closer to the label 
		by reducing the gap effect */
	margin-bottom: -4px; 
}

.waiting-msg {
	padding: 20px;
	color: #888;
	font-size: 0.8rem;
	text-align: center;
}
</style>