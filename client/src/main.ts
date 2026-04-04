import { myPiniaLogger } from './plugins/logger.js'
import router from './router' // Import the router

// main.ts
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'

// global styles
import '@/assets/main.css'

const app = createApp(App)
const pinia = createPinia()

// In main.ts
pinia.use(myPiniaLogger)

app.use(pinia)
app.use(router) // Use the router
app.mount('#app')