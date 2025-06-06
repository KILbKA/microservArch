// auth-service/index.js

import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { supabase } from './supabaseClient.js'
import { authMiddleware } from './authMiddleware.js'
import amqp from 'amqplib'


dotenv.config()

// Обычный лог, чтобы убедиться, что переменные подгрузились
console.log('→ Loaded SUPABASE_URL =', process.env.SUPABASE_URL)
console.log('→ Loaded SUPABASE_SERVICE_ROLE_KEY =', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'OK' : 'undefined')

const app = express()

// ─── CORS ────────────────────────────────────────────────────────────────────────
// Разрешаем фронтенду обращаться к этому сервису
app.use(cors({
  origin: 'http://localhost:5173',       // если ваш фронтенд работает там
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))
// ────────────────────────────────────────────────────────────────────────────────

app.use(express.json())

async function publishUserCreatedEvent(user) {
  try {
    const conn = await amqp.connect(process.env.RABBITMQ_URL)
    const ch = await conn.createChannel()
    const queue = 'user.created'
    await ch.assertQueue(queue, { durable: true })
    ch.sendToQueue(queue, Buffer.from(JSON.stringify(user)), { persistent: true })
    setTimeout(() => conn.close(), 500) // Даем отправить сообщение
  } catch (err) {
    console.error('[auth-service] RabbitMQ publish error:', err)
  }
}

/**
 * POST /signin
 * Принимает JSON { email, password }
 * Возвращает { access_token, refresh_token, user: { id, email } }
 */
app.post('/signin', async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' })
    }
    // Вызываем Supabase SDK для входа пользователя
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      return res.status(401).json({ error: error.message })
    }
    await publishUserCreatedEvent({
      id: data.user.id,
      email: data.user.email
    })
    // Возвращаем только необходимые поля
    return res.json({
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      user: { id: data.user.id, email: data.user.email }
    })
  } catch (e) {
    console.error('POST /signin error:', e)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

/**
 * POST /signup
 * Принимает JSON { email, password }
 * Регистрирует нового пользователя.
 */
app.post('/signup', async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' })
    }
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) {
      return res.status(400).json({ error: error.message })
    }
    return res.status(201).json({
      message: 'User created. Check email for confirmation.',
      user: { id: data.user.id, email: data.user.email }
    })
  } catch (e) {
    console.error('POST /signup error:', e)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

/**
 * GET /me
 * Заголовок: Authorization: Bearer <access_token>
 * Если токен валиден, возвращаем информацию о пользователе из Supabase Auth.
 */
app.get('/me', authMiddleware, async (req, res) => {
  try {
    // После authMiddleware у нас в req.userId лежит ID пользователя
    const { data, error } = await supabase.auth.admin.getUserById(req.userId)
    if (error) {
      return res.status(404).json({ error: error.message })
    }
    return res.json({ user: data.user })
  } catch (e) {
    console.error('GET /me error:', e)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

/**
 * Запуск сервера на указанном порту
 */
const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Auth-service running on port ${PORT}`)
})
