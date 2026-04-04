<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'

// Components
import MusicPlayer from '@/components/MusicPlayer.vue'
import ScoreBox from '@/components/ScoreBox.vue'
import PlayersBox from '@/components/PlayersBox.vue'
import SettingsBox from '@/components/SettingsBox.vue'
import NextBlock from '@/components/NextBlock.vue'
import HostButtons from '@/components/HostButtons.vue'
import MobileArrows from '@/components/MobileArrows.vue'
import PlayersBoard from '@/components/PlayersBoard.vue'
import TetrisBoard from '@/components/TetrisBoard.vue'

// Services
import { connectSocket, disconnectSocket } from '@/services/socket'

// Stores
import { useGameStore } from '@/stores/game'
import { useLobbyStore } from '@/stores/lobby'
import { useAuthStore } from '@/stores/auth'
import { useSettingsStore } from '@/stores/settings'

const route = useRoute()

const gameStore = useGameStore()
const lobbyStore = useLobbyStore()
const authStore = useAuthStore()
const settingsStore = useSettingsStore()

// Filter out the local player so the template only sees "opponents"
const opponents = computed(() => {
  return [...lobbyStore.players.values()].filter(p => p.username !== authStore.username)
})

// Access the URI params: /my-lobby/player1
const currentLobby = route.params.lobby as string		  // "my-lobby"
const currentPlayer = route.params.username as string	// "player1"

const handleJoin = () => {
	// 1. Connect
	const newSocket = connectSocket(currentPlayer, currentLobby)

	// 2. Immediately bind the Pinia store to this specific instance
	newSocket.on('connect', () => {
		gameStore.initSocketListeners()
    lobbyStore.initSocketListeners()
    authStore.authOk(currentPlayer, currentLobby)
	})
}


// 2. Keyboard Input (Replaces your useEffect)
const handleKeyDown = (e: KeyboardEvent) => {
	if (gameStore.gameover) return
		const moves: Record<string, string> = {
		ArrowLeft: 'Left', ArrowRight: 'Right', ArrowDown: 'Down', ArrowUp: 'Rotate', ' ': 'Mega'
	}
	if (moves[e.key]) {
		e.preventDefault()
    const move = moves[e.key];
    if (move !== undefined) gameStore.sendMove(move)
	}
}

/* ========================================= */
/*             MOBILE GESTURES               */

// State for touch tracking (equivalent to your useRef)
const touchState = { x: 0, y: 0, lastX: 0, time: 0 };
const CELL_SIZE = 30;

const handleTouchStart = (e: TouchEvent) => {
  // check if we using gestures
  if (lobbyStore.ingame === false || settingsStore.gesturesEnabled === false) return ;

  // Check if targetTouches[0] exists
  const touch = e.targetTouches[0];
  if (!touch) return;

  const x = touch.clientX;
  const y = touch.clientY;
  
  touchState.x = x;
  touchState.y = y;
  touchState.lastX = x;
  touchState.time = Date.now();
};

const handleTouchMove = (e: TouchEvent) => {
  // check if we using gestures
  if (lobbyStore.ingame === false || settingsStore.gesturesEnabled === false) return ;

  const touch = e.targetTouches[0];
  // Guard: if no touch or game is over, exit
  if (!touchState.time || gameStore.gameover || !touch) return;

  // Stop the page from bouncing/scrolling
  if (e.cancelable) e.preventDefault();

  const currentX = touch.clientX;
  const deltaX = currentX - touchState.lastX;

  if (Math.abs(deltaX) >= CELL_SIZE) {
    gameStore.sendMove(deltaX > 0 ? 'Right' : 'Left');
    touchState.lastX = currentX;
  }
};

const handleTouchEnd = (e: TouchEvent) => {
  // check if we using gestures
  if (lobbyStore.ingame === false || settingsStore.gesturesEnabled === false) return ;

  // changedTouches is used for the 'end' event
  const touch = e.changedTouches[0];
  if (!touchState.time || !touch) return;

  const deltaX = touch.clientX - touchState.x;
  const deltaY = touch.clientY - touchState.y;
  const deltaTime = Date.now() - touchState.time;
  
  const absX = Math.abs(deltaX);
  const absY = Math.abs(deltaY);

  if (deltaTime < 200 && absX < 15 && absY < 15) {
    gameStore.sendMove('Rotate');
  } else if (deltaY > 100 && absY > absX && deltaTime < 250) {
    gameStore.sendMove('Mega');
  }

  touchState.time = 0;
};

onMounted(() => {
  handleJoin()

  window.addEventListener('keydown', handleKeyDown)

  window.addEventListener('touchstart', handleTouchStart, { passive: true });
  window.addEventListener('touchmove', handleTouchMove, { passive: false });
  window.addEventListener('touchend', handleTouchEnd, { passive: true });
})

// Clean up when the user leaves the page
onUnmounted(() => {
	disconnectSocket()

	window.removeEventListener('keydown', handleKeyDown)

  window.removeEventListener('touchstart', handleTouchStart);
  window.removeEventListener('touchmove', handleTouchMove);
  window.removeEventListener('touchend', handleTouchEnd);
})
</script>

<template>
  <div class="lobby-container" :style="{ '--tile-size': settingsStore.tileSize + 'px' }">
    <div class="game-layout">
      <div v-if="settingsStore.isMobile === false" class="column">
        <MusicPlayer />
      </div>
      
      <div v-if="settingsStore.isMobile" class="column mobile-top-sidebar">
        <div class="column mobile-top-boxes">
          <ScoreBox />
          <NextBlock />
        </div>
        <div class="column">
          <PlayersBox />
          <span v-if="lobbyStore.error !== ''" class='error-message'>{{ lobbyStore.error }}</span>
        </div>
      </div>

      <div class="column board-col">
        <TetrisBoard />

        <div v-if="settingsStore.isMobile" class="mobile-settings-anchor">
          <SettingsBox />
        </div>

        <div v-if="settingsStore.isMobile && lobbyStore.ingame === false" class="overlay-host-ui">
          <HostButtons />
        </div>

        <div v-if="settingsStore.isMobile && settingsStore.gesturesEnabled === false && lobbyStore.ingame" class="overlay-mobile-controls">
          <MobileArrows />
        </div>

      </div>

      <div class="column sidebar">

        <template v-if="!settingsStore.isMobile">
          <NextBlock />
          <ScoreBox />
          <PlayersBox />
          <HostButtons />
          <SettingsBox />
          <span v-if="lobbyStore.error !== ''" class='error-message'>{{ lobbyStore.error }}</span>
        </template>

      </div>

      <div v-if="!settingsStore.isMobile" class="lobby-grid">
        <PlayersBoard 
          v-for="player in opponents" 
          :key="player.id"
          :username="player.username"
          :score="player.score || 0"
          :grid="player.board || []" 
          :gameover="player.gameover"
          mini
        />
      </div>

    </div>
  </div>
</template>

<style scoped>
.lobby-container {
  padding: 20px;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
}

.game-layout {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  gap: 30px;
  margin-top: 20px;
}

.sidebar {
  display: flex;
  flex-direction: column;
  gap: 1vh;
  width: 18vw;
  flex-shrink: 0;
}

/* Hide the mobile top section by default on desktop */
.mobile-top-sidebar {
  display: none;
}

.board-col {
  position: relative; /* CRITICAL: Reference for the absolute child */
  display: flex;
  justify-content: center;
}

.overlay-host-ui {
  position: absolute;
  top: 20%;      /* Adjust this to move it up or down the board */
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;   /* Sits on top of the TetrisBoard */
  width: 90%;    /* Slightly narrower than the board */
  max-width: 280px;
  
  /* Added some 'pop' to make it look like a floating menu */
  filter: drop-shadow(0 0 15px rgba(0, 0, 0, 0.8));
  pointer-events: auto; /* Ensures you can still click the buttons */
}

.overlay-mobile-controls {
  position: absolute;
  bottom: 5%;    /* Anchor to the bottom of the board */
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
  width: 100%;
  max-width: 320px;
}

.error-message {
  color: var(--red-chill);
  font-size: 0.8rem;
}

/* MOBILE ADJUSTMENTS */
@media (max-width: 959px) {
  .lobby-container {
    padding: 0px;
  }

  .game-layout {
    gap: 1px;
    margin-top: 2vh;
    flex-direction: column;
    align-items: center;
  }

  .mobile-top-sidebar {
    display: flex;
    flex-direction: row; /* Stack horizontally */
    justify-content: space-between;
    align-items: stretch;
    gap: 10px;
    width: 100%;
    max-width: 320px; /* Match your TetrisBoard width */
    margin: 0 auto 10px auto;
  }

  /* Force the boxes inside to shrink and share space */
  .mobile-top-sidebar > * {
    flex: 1; 
    min-width: 0; /* Prevents long text from pushing the box wider than 50% */
  }

  .mobile-settings-anchor {
    position: absolute;
    /* Position it at the top right of the board area */
    top: 0;
    right: -50px; /* Pushes it outside the centered board */
    z-index: 20;
  }

  .overlay-host-ui {
    top: 15%; /* Position it slightly higher on mobile if needed */
    width: 85%;
  }

  .sidebar {
    width: 100%;
    max-width: 320px;
  }

  .board-col {
    order: 2; /* Ensures board stays between top and bottom sidebars if needed */
  }
}

@media (max-width: 420px) {
  .mobile-settings-anchor {
    right: 10px; 
    top: 10px;
  }

  .mobile-settings-anchor :deep(.gear-btn) {
    opacity: 0.5;
  }
}
</style>