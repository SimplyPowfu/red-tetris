<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import ImageCycler from './ImageCycler.vue'

// Stores
import { useSettingsStore } from '@/stores/settings'

const settingsStore = useSettingsStore()
const isPlaying = ref(false)

// Text that will be visualized
const slidingText = "Good Kid - Cicada "

let audio

onMounted(() => {
  // Now it's safe to create the audio and access the store
  const audioPath = `${import.meta.env.BASE_URL}Good Kid - Cicada.mp3`.replace('//', '/')
  audio = new Audio(audioPath)
  
  // This line makes it loop forever
  audio.loop = true 

  // Safety check: ensure volume is a number between 0 and 1
  const initialVol = Number(settingsStore.volume)
  audio.volume = isNaN(initialVol) ? 0.5 : Math.min(Math.max(initialVol, 0), 1)
})

onUnmounted(() => {
	if (audio) {
		audio.pause()       // Stop the sound
		audio.src = ''      // Clear the source file from memory
		audio.load()        // Force the browser to dump the audio data
		audio = null        // Cleanup the variable
	}
})

// 2. Function to play/pause
const toggleMusic = () => {
  if (!audio) return
  
  if (isPlaying.value) {
    audio.pause()
  } else {
    audio.play().catch(e => console.log("User interaction required"))
  }
  isPlaying.value = !isPlaying.value
}

// OPTIONAL: Update volume instantly if settingsStore.volume changes elsewhere
watch(() => settingsStore.volume, (newVol) => {
  if (audio) {
    audio.volume = Math.min(Math.max(Number(newVol), 0), 1)
  }
})
</script>

<template>
<!-- Wrap both in a container to sync their widths -->
<div class="component-wrapper">
	<div @click="toggleMusic">
		<ImageCycler />
	</div>
	
	<div class="marquee-container">
		<div class="marquee-content">
			{{ slidingText }}
		</div>
	</div>
</div>
</template>

<style scoped>
.component-wrapper {
	/* Set this to whatever width your ImageCycler usually takes (e.g., 500px or 100%) */
	width: 100px; 
	max-width: 600px; 
	margin: 0 auto; /* Centers the whole block */
}

.marquee-container {
	overflow: hidden;
	white-space: nowrap;
	width: 100%; /* Fills the wrapper */
}

.marquee-content {
	display: inline-block;
	padding-left: 100%;
	animation: marquee 8s linear infinite;
}

@keyframes marquee {
	0%   { transform: translateX(0); }
	100% { transform: translateX(-100%); }
}
</style>
  