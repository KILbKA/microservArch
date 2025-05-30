
import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Login from '../views/Login.vue'
import Upload from '../views/Upload.vue'
import Download from '../views/Download.vue'

const routes = [
  { path: '/', component: Home },
  { path: '/login', component: Login },
  { path: '/upload', component: Upload },
  { path: '/download', component: Download }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
