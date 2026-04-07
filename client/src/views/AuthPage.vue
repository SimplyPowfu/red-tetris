<script setup lang="ts">
import { ref, onMounted, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import AuthTetrisPiece from '@/components/AuthTetrisPiece.vue' // Import here
import gsap from 'gsap'

// Components
import Leaderboard from '@/components/Leaderboard.vue'

const authStore = useAuthStore()
const router = useRouter()

const username = ref('')
const lobbyId = ref('')

onMounted(async () => {
  // nextTick ensures the child components are fully rendered 
  // before GSAP tries to find the '.moving-piece' class
  await nextTick()

  const tl = gsap.timeline()

  tl.from(".moving-piece", {
    y: -300, 
    opacity: 0,
    duration: 1,
    stagger: 0.2,
  })
  
  tl.to(".pixelated", {
    opacity: 1,
    duration: 0.5 
  }, 1.5)

  tl.from(".content-wrapper", {
    y: -60,
    opacity: 0,
    duration: 0.6,
    ease: "power2.out"
  }, 1)
})

/* watch(() => authStore.username, (newVal) => {
  if (newVal) {
    router.push(`/${authStore.lobbyId}/${authStore.username}`)
  }
}) */

const handleSubmit = () => {
  if (!username.value || !lobbyId.value) return
  /* authStore.login({ 
    username: username.value, 
    lobbyId: lobbyId.value 
  }) */
 router.push(`/${lobbyId.value}/${username.value}`)
}
</script>

<template>
  <div class="auth-page">
    <div class="tetris-grid">
      <AuthTetrisPiece type="T" :row="0" :col="1" :rotate="180"/>
      <AuthTetrisPiece type="O" :row="0" :col="12" :rotate="0"/>
      <AuthTetrisPiece type="I" :row="3" :col="16" :rotate="90"/>
      <AuthTetrisPiece type="S" :row="8" :col="13" :rotate="0"/>
      <AuthTetrisPiece type="L" :row="7" :col="1" :rotate="0"/>
      <h1 class="pixelated" style="opacity: 0">Red Tetris</h1>
    </div>

    <div class="content-wrapper">
      <form @submit.prevent="handleSubmit" class="auth-form">
        <div class="input-group">
          <label>Username</label>
          <input
        v-model="username"
        type="text"
        placeholder="How they'll remember you"
        required
      />
        </div>
        <div class="input-group">
          <label>Lobby</label>
          <input
        v-model="lobbyId"
        type="text"
        required
        placeholder="Enter something pretty"
      />
        </div>
        <button type="submit" class="join-btn">Join Lobby</button>
        <div v-if="authStore.error" class="message">{{ authStore.error }}</div>
      </form>
  
      <Leaderboard />
  
      <button @click="router.push('/hall-of-fame')" class="hof-btn">
        <span class="laurel-left">🌿</span>
        <span class="btn-text">Hall of Fame</span>
        <span class="laurel-right">🌿</span>
      </button>
    </div>

  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Silkscreen&display=swap');

/* Ensure this page takes full height if not handled by App.vue */
.auth-page {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 20px;
  box-sizing: border-box;
}

.content-wrapper {
  /* layering */
  z-index: 10;
  background-color: transparent;

  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

/* Local style adjustments if needed */
.auth-form {
  z-index: 20; /* Ensure form is above falling pieces if they overlap */
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 300px;
}

.input-group {
  font-family: Arial, sans-serif;
  font-size: 20px;
  display: flex;
  flex-direction: column;
  text-align: left;
}

input {
  padding: 10px;
  border: 1px solid #444;
  background-color: #111;
  color: white;
  border-radius: 4px;
  margin-top: 5px;
}

input:focus {
  outline: none;
  border-color: darkred;
}

.join-btn {
  padding: 12px;
  background-color: darkred;
  color: white;
  border: none;
  font-weight: bold;
  cursor: pointer;
  border-radius: 4px;
  transition: background-color 0.2s ease;
}

.join-btn:hover {
  background-color: rgb(102, 0, 0);
}

.tetris-grid {
  /* styling */
	width: 90%;
  max-width: 400px;
	aspect-ratio: 2 / 1;
  height: auto;
	background-color: #000;
	background-size: 20px 20px;
	box-sizing: content-box;
  
  /* positioning */
	position: relative;
	margin-bottom: 20px;
  margin-left: auto;
  margin-right: auto;

  overflow: visible !important;
  z-index: 1;

	display: flex;
	justify-content: center;
	align-items: center;
	overflow: hidden; 
}

/* Effetto CRT sovrapposto alla griglia */
.tetris-grid::after {
	content: "";
	position: absolute;
	top: 0; left: 0; width: 100%; height: 100%;
	background: linear-gradient(
		rgba(18, 16, 16, 0) 50%, 
		rgba(0, 0, 0, 0.1) 50%
	), 
	linear-gradient(90deg, rgba(255, 0, 0, 0.02), rgba(0, 255, 0, 0.01), rgba(0, 0, 255, 0.02));
	background-size: 100% 4px, 3px 100%;
	pointer-events: none;
}

.pixelated {
  /* styling */
  font-family: 'Silkscreen', sans-serif !important;
  font-size: clamp(1.5rem, 8vw, 2rem); 
  color: #ff0000;
  text-shadow: 3px 3px 0px #550000;
  margin: 0;
  letter-spacing: 2px;
  opacity: 0; 

  /* positioning */
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%); /* This perfectly offsets the element's own width/height */
  
  z-index: 10;
  white-space: nowrap; /* Prevents the title from wrapping on small screens */
  text-align: center;
  margin: 0;
  
  opacity: 0; 
  will-change: filter, opacity; 
}

.pixelated::after {
  content: "";
  position: absolute;
  top: 0; left: 0; width: 100%; height: 100%;
  background: linear-gradient(
    rgba(18, 16, 16, 0) 50%, 
    rgba(0, 0, 0, 0.1) 50%
  ), 
  linear-gradient(90deg, rgba(255, 0, 0, 0.02), rgba(0, 255, 0, 0.01), rgba(0, 0, 255, 0.02));
  background-size: 100% 4px, 3px 100%;
  pointer-events: none;
}

/* --- Hall of Fame Button Styling --- */
.hof-btn {
  margin-top: 20px;
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 10px 20px;
  font-family: 'Silkscreen', sans-serif;
  position: relative;
  transition: transform 0.2s ease, filter 0.2s ease;
  z-index: 30;
}

.btn-text {
  color: #ffd700; /* Gold */
  font-size: 1.2rem;
  text-transform: uppercase;
  letter-spacing: 2px;
  text-shadow: 2px 2px 0px #8b4513, 0 0 10px rgba(255, 215, 0, 0.5);
  border-bottom: 2px solid #ffd700;
  padding-bottom: 4px;
}

/* The "Corona di Allori" (Laurels) */
.laurel-left, .laurel-right {
  font-size: 1.8rem;
  filter: sepia(1) saturate(5) hue-rotate(10deg); /* Makes the emoji look more golden/bronze */
  transition: all 0.3s ease;
}

.laurel-left {
  transform: rotate(-15deg);
}

.laurel-right {
  transform: rotate(15deg) scaleX(-1); /* Flip the right one */
}

/* Hover Effects */
.hof-btn:hover {
  transform: scale(1.1);
  filter: drop-shadow(0 0 15px rgba(255, 215, 0, 0.8));
}

.hof-btn:hover .laurel-left {
  transform: rotate(-30deg) translateX(-5px);
}

.hof-btn:hover .laurel-right {
  transform: rotate(30deg) scaleX(-1) translateX(-5px);
}

/* Retro "Click" animation */
.hof-btn:active {
  transform: scale(0.95);
}

/* Mobile adjustments */
@media (max-width: 959px) {
  .tetris-grid {
    overflow: visible; /* Let pieces be visible even if they fly "behind" the form */
    margin-bottom: 40px; /* Space to prevent total overlap */
  }
  
  .auth-page {
    padding-top: 20px;
  }
}
</style>