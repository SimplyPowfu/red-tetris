<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

// Services
import { disconnectSocket } from '@/services/socket'

// Stores
import { useAuthStore } from '@/stores/auth'
import { useSettingsStore } from './stores/settings'

const authStore = useAuthStore()
const settingsStore = useSettingsStore()

const router = useRouter()
const route = useRoute()

const updateMobileStatus = () => {
  settingsStore.isMobile = ('ontouchstart' in window) && window.innerWidth <= 959
}

// This tracks the error property specifically
watch(() => authStore.error, (newError) => {
  if (newError !== null) {
    console.error("Auth System Error:", newError)
    // You could trigger a toast notification here
    alert(newError) 
    router.push('/')
  }
})

// Example: A global logout function that cleans up both Store and Socket
const handleLogout = () => {
	router.push('/')
}

onMounted(() => {
  updateMobileStatus()
  window.addEventListener('resize', updateMobileStatus)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateMobileStatus)
})

</script>

<template>
  <div id="app-layout">
    <nav v-if="settingsStore.isMobile === false && route.path !== '/' && route.path !== '/hall-of-fame'" class="navbar border-bottom">
      <div class="logo pixelated">RED TETRIS</div>
      <div class="user-info">
        <span :class="['status-dot', authStore.isConnected ? 'online' : 'offline']"></span>
        <span class="username">{{ authStore.username }}</span>
        <span class="lobby-id">[{{ route.params.lobby }}]</span>
        <button @click="handleLogout" class="logout-btn">LEAVE</button>
      </div>
    </nav>

    <main class="content-area">
      <RouterView />
    </main>

  </div>
</template>

<style scoped>
/* Use the global variables from your main.css */
#app-layout {
  display: flex;
  flex-direction: column;
  background-color: #000; /* Match main.css */
  color: #fff;
}

.content-area {
  flex: 1;
  display: flex;
  flex-direction: column;

  min-width: 100vw;
  min-height: 100vh;
}

.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.8rem 2rem;
  background: #111;
  z-index: 100;
}

.border-bottom { border-bottom: 2px solid #444; }
.border-top { border-top: 2px solid #444; }

.logo {
  font-size: 1.5rem;
  color: #ff0000;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.8rem;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}
.online { background-color: #00ff00; box-shadow: 0 0 5px #00ff00; }
.offline { background-color: #ff0000; box-shadow: 0 0 5px #ff0000; }

.logout-btn {
  background: transparent; /* Remove solid background */
  border: none;
  color: #ff0000; /* Neon Red */
  font-family: 'Silkscreen', sans-serif;
  font-size: 0.8rem;
  cursor: pointer;
  padding: 5px 15px;
  position: relative;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  letter-spacing: 1px;
}

/* The [ Left Bracket */
.logout-btn::before {
  content: '[';
  margin-right: 6px;
  color: #666; /* Muted color for brackets */
  transition: color 0.2s;
}

/* The ] Right Bracket */
.logout-btn::after {
  content: ']';
  margin-left: 6px;
  color: #666;
  transition: color 0.2s;
}

/* Hover Effects */
.logout-btn:hover {
  color: #fff;
}

.logout-btn:hover::before,
.logout-btn:hover::after {
  color: #ff0000;
  text-shadow: 0 0 5px #ff0000;
}

footer {
  padding: 10px;
  text-align: center;
  background: #050505;
}

.pixelated-small {
  font-size: 0.6rem;
  color: #444;
  letter-spacing: 1px;
}
</style>