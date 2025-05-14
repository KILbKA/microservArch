// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Login from '../views/Login.vue'
import Upload from '../views/Upload.vue'

const routes = [
  { path: '/', component: Home },
  { path: '/login', component: Login },
  { path: '/upload', component: Upload }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
