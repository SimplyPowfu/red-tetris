<script setup lang="ts">
import { useLobbyStore } from '@/stores/lobby'
import { useAuthStore } from '@/stores/auth'

const lobby = useLobbyStore()
const auth = useAuthStore()

const toggleReady = () => { lobby.toggleReady() }

console.log('lobbySore', lobby);

</script>

<template>
  <div class="retro-box">
    <div class="retro-box-title pixelated">Players</div>
    <div class="players-list">
      <div v-for="[id, p] in lobby.players" :key="p.username" class="player-row">
        <span v-if="p.username === lobby.hostName" class="host-star">★</span>
        <span :class="{ 'is-me': p.username === auth.username }">{{ p.username }}</span>
        <span class="status">{{ p.ready ? 'READY' : '...' }}</span>
      </div>
    </div>
    
    <button class="join-btn ready-toggle" @click="toggleReady">
      {{ lobby.isReady ? 'UNREADY' : 'READY UP' }}
    </button>
  </div>
</template>

<style scoped>
.retro-box-title {
  background: #222;
  padding: 4px 10px;
  font-size: 1.0rem;
  border-bottom: 1px solid #444;
  color: var(--red-chill);
}

.players-list { padding: 10px; }
.player-row {
  display: flex;
  justify-content: space-between;
  font-family: Arial, sans-serif;
  font-size: 0.9rem;
  color: white;
  margin-bottom: 5px;
}
.is-me { color: var(--blue-shallow); font-weight: bold; }
.host-star { color: var(--red-primary) }
.ready-toggle {
  width: 100%;
  border-radius: 0;
  font-family: 'Silkscreen', sans-serif;
}

/* On small screens, shrink the text so it doesn't wrap weirdly */
@media (max-width: 959px) {
  .retro-box-title {
    font-size: 0.8rem;
    padding: 2px 5px;
  }
  .player-row {
    font-size: 0.8rem;
  }
}
</style>