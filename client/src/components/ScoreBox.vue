<template>
  <div class="retro-box crt-overlay">
    <div class="retro-box-title pixelated">Score</div>
    <div class="retro-box-content">
      <span class="score-val">{{ formattedScore }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useGameStore } from '@/stores/game'
const store = useGameStore()
const formattedScore = computed(() => store.score.toString().padStart(12, '0'))
</script>

<style scoped>
.retro-box {
  border: 2px solid #444;
  background: #111;
  position: relative;
  margin-bottom: 15px;
  width: 100%;
  box-sizing: border-box; /* Ensures padding/border don't grow the box */
}
.retro-box-title {
  background: #222;
  padding: 4px 10px;
  font-size: 1.0rem;
  border-bottom: 1px solid #444;
  color: var(--red-chill);
}
.retro-box-content {
  justify-content: center;
}
.score-val {
  font-family: 'Silkscreen', sans-serif;
  font-size: 1.8rem;
  color: #fff;
}

/* On small screens, shrink the text so it doesn't wrap weirdly */
@media (max-width: 959px) {
  .retro-box {
    border: 2px solid #444;
    margin-bottom: 10px;
  }

  .retro-box-title {
    display: none;
    font-size: 0.8rem;
    padding: 2px 5px;
  }

  .retro-box-content {
    padding-left: 2px;
  }

  .score-val {
    font-size: 1.0rem;
  }
}
</style>