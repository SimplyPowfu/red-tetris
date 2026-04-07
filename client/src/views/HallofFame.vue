<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// Updated Shape: [username, [score, timestamp]]
type HallOfFameEntry = [string, [number, number]]

const data = ref<HallOfFameEntry[] | null>(null)
const loading = ref<boolean>(true)
const error = ref<string | null>(null)

// Helper function for human-readable dates
const formatDate = (timestamp: number) => {
  return new Date(timestamp).toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(async () => {
  try {
    // Assuming your endpoint provides the new structure
    // const response = await fetch('http://localhost:3000/hall-of-fame') // dev
    const response = await fetch('/hall-of-fame') // production
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const result: HallOfFameEntry[] = await response.json()
    
    // Sort by score (index 0 of the inner array)
    data.value = result.sort((a, b) => b[1][0] - a[1][0])
  } catch (err: any) {
    error.value = err.message
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="hof-container">
    <h1>Hall of Fame</h1>

    <div class="scroll-area">
      <p v-if="loading" class="status-text">Loading legends…</p>
      <p v-else-if="error" class="error-msg">Error: {{ error }}</p>

      <ol v-else-if="data">
        <li v-for="([username, [score, eta]], index) in data" :key="index">
          <div class="player-info">
            <span class="rank">{{ index + 1 }}.</span>
            <strong class="username">{{ username }}</strong>
          </div>
          <div class="score-details">
            <span class="score">{{ score }} pts</span>
            <span class="date">{{ formatDate(eta) }}</span>
          </div>
        </li>
      </ol>
    </div>

    <button class="back-btn" @click="router.push('/')">
      RETURN TO HOME
    </button>

  </div>
</template>

<style scoped>
@import url('https://googleapis.com');

.hof-container {
  padding: 15px; /* Reduced for mobile edges */
  width: 100%;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
  display: flex;
  flex-direction: column;
  height: 100dvh; /* Use dynamic viewport height */
  box-sizing: border-box;
  overflow: hidden;
}

h1 {
  text-align: center;
  margin: 0;
  padding: 15px 0;
  font-family: 'Silkscreen', sans-serif;
  color: darkred;
  flex-shrink: 0;
}

.scroll-area {
  flex: 1; /* Occupies all available middle space */
  overflow-y: auto;
  border-top: 1px solid #333;
  padding-right: 5px; /* Space for scrollbar */
  scrollbar-gutter: stable;
  scrollbar-width: thin;
}

/* Scrollbar Logic (Chrome/Safari) */
.scroll-area::-webkit-scrollbar {
  width: 6px;
}
.scroll-area::-webkit-scrollbar-thumb {
  background-color: #444;
  border-radius: 10px;
}

ol {
  list-style: none;
  padding: 0;
  margin: 0;
}

li {
  display: flex;
  justify-content: space-between; /* Keeps score right, name left */
  align-items: center;
  padding: 12px 5px; 
  border-bottom: 1px solid #222;
  gap: 10px;
}

.player-info {
  display: flex;
  gap: 12px;
  align-items: center;
  flex: 1; /* Takes remaining space */
  min-width: 0; /* Critical for text-overflow to work */
}

.rank {
  color: #666;
  font-size: 1.1rem;
  min-width: 25px;
  font-family: 'Silkscreen', sans-serif;
}

.username {
  color: #eee;
  font-size: 1rem;
  /* Truncate long names to prevent pushing scores off-screen */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.score-details {
  display: flex;
  flex-direction: column;
  text-align: right;
  flex-shrink: 0; /* Never let the score squash or vanish */
}

.score {
  font-weight: bold;
  color: #d8d8d8;
  font-family: 'Silkscreen', sans-serif;
  font-size: 0.9rem;
}

/* Medals / Top 3 Colors */
li:nth-child(1) .score { color: #ff0000; } /* 1st */
li:nth-child(2) .score { color: #aa00ff; } /* 2nd */
li:nth-child(3) .score { color: #00e5ff; } /* 3rd */

.date {
  font-size: 0.65rem;
  color: #666;
  margin-top: 2px;
}

.back-btn {
  flex-shrink: 0;
  width: 100%;
  margin-top: 15px;
  margin-bottom: 10px;
  font-family: 'Silkscreen', sans-serif;
  background-color: darkred;
  color: white;
  border: none;
  padding: 16px;
  font-size: 1rem;
  letter-spacing: 1px;
  cursor: pointer;
  box-shadow: 0 4px 0px #550000;
  transition: transform 0.1s;
}

.back-btn:active {
  transform: translateY(2px);
  box-shadow: 0 1px 0px #550000;
}

.status-text, .error-msg {
  text-align: center;
  padding: 40px;
  color: #999;
}
</style>
