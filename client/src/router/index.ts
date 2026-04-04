import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

// Views
import AuthPage from '@/views/AuthPage.vue'
import LobbyPage from '@/views/LobbyPage.vue'
import HallOfFame from '@/views/HallofFame.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Auth',
    component: AuthPage
  },
  {
    path: '/hall-of-fame',
    name: 'Hall of Fame',
    component: HallOfFame
  },
  {
    // Dynamic segments starting with colons
    path: '/:lobby/:username',
    name: 'Lobby',
    component: LobbyPage,
    props: true // This allows params to be passed as props to the component
  }
]

const router = createRouter({
	history: createWebHistory(),
	routes
})

export default router