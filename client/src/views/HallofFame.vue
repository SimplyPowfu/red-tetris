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
    const response = await fetch('/hall-of-fame')
    
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
.hof-container {
  margin-top: 5px;
  padding: 20px;
  width: 100%;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
}

h1 {
  text-align: center;
  /* 1. Remove bottom margin to prevent double-spacing */
  margin-top: 0;
  margin-bottom: 0; 
  padding-bottom: 15px;
}

.scroll-area {
  max-height: 50vh;
  overflow-y: auto;
  border-top: 1px solid #eee;
  
  /* 2. Ensure no top padding here so the first row touches the border */
  padding-top: 0; 
  
  scrollbar-gutter: stable;
  scrollbar-width: thin;
  scrollbar-color: transparent transparent;
}

/* Scrollbar Logic (Chrome/Safari/Edge) */
.scroll-area::-webkit-scrollbar {
  width: 8px;
}
.scroll-area::-webkit-scrollbar-track {
  background: transparent;
}
.scroll-area::-webkit-scrollbar-thumb {
  background-color: transparent;
  border-radius: 10px;
}
.scroll-area:hover::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.2);
}

/* Layout for the items */
ol {
  list-style: none;
  /* 3. Reset default browser list margins */
  padding: 0;
  margin: 0; 
}

li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  /* 4. Use consistent padding for all rows */
  padding: 12px 15px; 
  border-bottom: 1px solid #f5f5f5;
}

/* 1st Place: Violet */
li:nth-child(1) .score {
  color: #ff0000; 
  font-size: 1.1em;
}

/* 2nd Place: Light Blue */
li:nth-child(2) .score {
  color: #aa00ff;
}

/* 3rd Place: Yellow/Gold */
li:nth-child(3) .score {
  color: #00e5ff;
}

.player-info {
  display: flex;
  gap: 15px;
  align-items: center;
}

.rank {
  color: #aeadad;
  font-size: 1.3em;
  min-width: 30px;
}

.score-details {
  display: flex;
  flex-direction: column;
  text-align: right;
}

.score {
  font-weight: bold;
  color: #d8d8d8;
}

.date {
  font-size: 0.75em;
  color: #999;
}

/* --- Back Button Styling --- */
.back-btn {
  /* 1. Full width like the READY button */
  width: 100%;
  margin-top: 20px;
  
  /* 2. Retro Font & Colors */
  font-family: 'Silkscreen', sans-serif;
  background-color: darkred;
  color: white;
  
  /* 3. Blocky/Sharp Edges */
  border: none;
  border-radius: 0; 
  padding: 15px;
  font-size: 1.1rem;
  letter-spacing: 2px;
  
  cursor: pointer;
  transition: all 0.2s ease;
  
  /* 4. Shadow for depth */
  box-shadow: 0 4px 0px #550000;
}

.back-btn:hover {
  background-color: rgb(160, 0, 0);
  transform: translateY(-2px);
  box-shadow: 0 6px 0px #550000;
}

.back-btn:active {
  transform: translateY(2px);
  box-shadow: 0 0px 0px #550000;
}

/* Ensure the container doesn't feel too tight with the new big button */
.hof-container {
  display: flex;
  flex-direction: column;
  min-height: 60vh; /* Gives the container some vertical weight */
}

.error-msg, .status-text {
  text-align: center;
  padding: 20px;
}
</style>