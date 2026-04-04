<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

// 1. Import your images so Vite can resolve the paths
import kiwi1 from '@/assets/kiwi_1.png'
import kiwi2 from '@/assets/kiwi_2.png'
import kiwi3 from '@/assets/kiwi_3.png'
import kiwi4 from '@/assets/kiwi_4.png'

// 2. Put them in a typed array
const images: string[] = [kiwi1, kiwi2, kiwi3, kiwi4]

// 3. Track the current index
const currentIndex = ref<number>(0)

// 4. Computed property for the active image
const currentImage = computed(() => images[currentIndex.value])

// 5. Function to cycle to the next image
const nextImage = () => {
  currentIndex.value = (currentIndex.value + 1) % images.length
}

let timer: number;

const start = () => {
	if (timer) return
	timer = window.setInterval(nextImage, 338) // bpm of Cicada
}

const stop = () => {
	clearInterval(timer)
	timer = 0;
}

const toggle = () => {
	if (timer) {
		stop()
	} else {
		start()
	}

}

onUnmounted(() => {
  stop(); // Clean up to prevent memory leaks
});

</script>

<template>
  <div class="cycler">
    <img :src="currentImage" alt="Cycling kiwi" @click="toggle" />
  </div>
</template>

<style scoped>
img {
  width: 100%;
  height: auto;
  cursor: pointer;
  display: block;
}
</style>
