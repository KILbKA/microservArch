// src/router/index.js

import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Login from '../views/Login.vue'
import Upload from '../views/Upload.vue'
import Download from '../views/Download.vue'
import Signup from '../views/Signup.vue' // Если у вас есть экран регистрации

const routes = [
  { 
    path: '/', 
    component: Home 
  },
  { 
    path: '/login', 
    component: Login 
  },
  { 
    path: '/signup', 
    component: Signup 
  },
  {
    path: '/upload',
    component: Upload,
    meta: { requiresAuth: true }
  },
  {
    path: '/download',
    component: Download,
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Глобальный guard для маршрутов, требующих авторизации
router.beforeEach(async (to, from, next) => {
  const token = localStorage.getItem('access_token')

  // Если маршрут не требует авторизации, просто пропускаем
  if (!to.meta.requiresAuth) {
    return next()
  }

  // Для защищённых маршрутов нужно иметь access_token
  if (!token) {
    return next('/login')
  }

  try {
    // Делаем запрос к Auth‐сервису, чтобы проверить валидность токена
    const response = await fetch('http://localhost:3000/me', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    if (!response.ok) {
      // Токен невалидный или просрочен: удаляем из localStorage и отправляем на login
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      return next('/login')
    }

    // Токен валиден — пропускаем на целевой маршрут
    return next()
  } catch (e) {
    console.error('Ошибка при проверке токена /me:', e)
    // Если Auth‐сервис недоступен, всё равно редиректим на login
    return next('/login')
  }
})

export default router
