<script setup lang="ts">
import { ref, onMounted } from 'vue'

// Define the shape of your data: [username, score]
type LeaderboardEntry = [string, number]

// Reactive State (Replacing useState)
const data = ref<LeaderboardEntry[] | null>(null)
const loading = ref<boolean>(true)
const error = ref<string | null>(null)

// Side Effect (Replacing useEffect)
onMounted(async () => {
  try {
    // const response = await fetch('http://localhost:3000/leaderboard') // dev
    const response = await fetch('/leaderboard') // production
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const result: LeaderboardEntry[] = await response.json()
    
    // Sort descending by score (index 1 of the tuple)
    data.value = result.sort((a, b) => b[1] - a[1])
  } catch (err: any) {
    error.value = err.message
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="leaderboard-container">
    <h1>Leaderboard</h1>

    <div class="scroll-area">
      <p v-if="loading">Loading leaderboard…</p>
      <p v-else-if="error" class="error-msg">Error: {{ error }}</p>

      <ol v-else-if="data">
        <li v-for="([username, score], index) in data" :key="index">
          <strong>{{ username }}</strong> — {{ score }} pts
        </li>
      </ol>
    </div>
  </div>
</template>

<style scoped>
.leaderboard-container {
  margin-top: 5px;
  padding: 20px; /* Increased padding for more "breathability" */
  
  /* 1. Control the horizontal size */
  width: 100%; 
  max-width: 50vw; /* Adjust this number to your liking */
  margin-left: auto; /* Centers the container if it's smaller than the screen */
  margin-right: auto;
}

h1 {
  margin-top: 0;
  margin-bottom: 15px;
  text-align: center; /* Optional: Looks better in a wider layout */
}

.scroll-area {
  max-height: 20vh; 
  overflow-y: auto;
  border-top: 1px solid #eee;

  /* 1. Reserve space to prevent layout jump */
  scrollbar-gutter: stable;
  
  /* Firefox */
  scrollbar-width: thin;
  scrollbar-color: transparent transparent;
}

/* Firefox Hover */
.scroll-area:hover {
  scrollbar-color: rgba(0, 0, 0, 0.3) transparent;
}

/* 2. Chrome/Safari: Define the width so it exists */
.scroll-area::-webkit-scrollbar {
  width: 8px;
}

/* 3. Keep the track transparent */
.scroll-area::-webkit-scrollbar-track {
  background: transparent; 
}

/* 4. The Thumb: No transition here (it's buggy in Webkit) */
.scroll-area::-webkit-scrollbar-thumb {
  background-color: transparent;
  border-radius: 10px;
}

/* 5. Direct hover state for Chrome/Edge/Safari */
.scroll-area:hover::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.3);
}

/* Ensure the thumb darkens when you actually grab it */
.scroll-area::-webkit-scrollbar-thumb:active {
  background-color: rgba(0, 0, 0, 0.5);
}

li {
  margin-bottom: 5px;
}

.error-msg {
  color: #ff5252;
}

@media (max-width: 959px) {
  .leaderboard-container {
    max-width: 80vw;
  }
}
</style>