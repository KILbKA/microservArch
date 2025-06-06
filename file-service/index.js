// file-service/index.js
import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import multer from 'multer'
import path from 'path'
import { supabase } from './supabaseClient.js'
import { authMiddleware } from './authMiddleware.js'
import amqp from 'amqplib'

dotenv.config()

const PORT = process.env.PORT_FILE_SERVICE || 4000
const BUCKET = process.env.BUCKET_NAME   // например, 'uploads'

const app = express()

// ─── CORS ────────────────────────────────────────────────────────────────────────
app.use(cors({
  origin: 'http://localhost:5173',   // ваш фронтенд-адрес
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))
// ────────────────────────────────────────────────────────────────────────────────

// Multer настроен, чтобы хранить файл в памяти, а не на диске
const storage = multer.memoryStorage()
const upload = multer({ storage: storage })

// ─── POST /upload ───────────────────────────────────────────────────────────────
/**
 * Ожидаем multipart/form-data с полем "file".
 * Применяем authMiddleware, чтобы на сервер попадали только авторизованные пользователи.
 * Загружаем файл в Supabase Storage под ключом `${userId}/${timestamp}_${originalName}`.
 * Возвращаем fileKey и публичный URL.
 */
app.post(
  '/upload',
  authMiddleware,
  upload.single('file'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'File not provided' })
      }

      const userId = req.userId
      const originalName = path.basename(req.file.originalname)
      const timestamp = Date.now()
      // Собираем уникальный ключ: положим файлы каждого пользователя в отдельную «директорию»
      const fileKey = `${userId}/${timestamp}_${originalName}`

      // Загружаем файл в Supabase Storage (bucket)
      const { data, error: uploadError } = await supabase
        .storage
        .from(BUCKET)
        .upload(fileKey, req.file.buffer, {
          contentType: req.file.mimetype,
          upsert: false
        })

      if (uploadError) {
        console.error('Supabase upload error:', uploadError)
        return res.status(500).json({ error: uploadError.message })
      }

      // Делаем публичный URL или подписанный URL
      // Если bucket публичный, можно получить URL так:
      const { publicURL, error: urlError } = supabase
        .storage
        .from(BUCKET)
        .getPublicUrl(fileKey)

      if (urlError) {
        console.error('Supabase getPublicUrl error:', urlError)
        // Если публичный URL недоступен (bucket приватный), можно создать Signed URL:
        // const { data: signedData, error: signErr } = await supabase
        //   .storage
        //   .from(BUCKET)
        //   .createSignedUrl(fileKey, 60) // 60 секунд
        // return res.json({ fileKey, signedUrl: signedData.signedUrl });
        return res.status(500).json({ error: urlError.message })
      }
      return res.status(201).json({
        fileKey,
        publicUrl: publicURL
      })
    } catch (e) {
      console.error('POST /upload error:', e)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }
)

// ─── GET /download/:fileKey ──────────────────────────────────────────────────────
/**
 * При запросе /download/:fileKey проверяем JWT, затем либо делаем redirect на publicUrl/signedUrl,
 * либо проксируем файл как blob.
 */
app.get(
  '/download/:fileKey',
  authMiddleware,
  async (req, res) => {
    try {
      const { fileKey } = req.params
      if (!fileKey) {
        return res.status(400).json({ error: 'fileKey is required' })
      }

      // Проверим, что пользователь действительно владеет этим файлом?
      // (по желанию): можно проверить, что fileKey начинается с `${req.userId}/`.

      // Создадим подписанный URL, действительный, например, 60 секунд:
      const { data: signedData, error: signErr } = await supabase
        .storage
        .from(BUCKET)
        .createSignedUrl(fileKey, 60)

      if (signErr || !signedData.signedUrl) {
        console.error('Supabase createSignedUrl error:', signErr)
        return res.status(404).json({ error: 'File not found or inaccessible' })
      }

      // 1) Если хотим просто перенаправить на внешний URL, можно:
      return res.redirect(signedData.signedUrl)

      // 2) Если нужно проксировать файл как blob (например, для скрытия реального URL):
      // const response = await fetch(signedData.signedUrl)
      // const buffer = await response.arrayBuffer()
      // res.set('Content-Type', 'image/jpeg') // или другой mime
      // return res.send(Buffer.from(buffer))
    } catch (e) {
      console.error('GET /download/:fileKey error:', e)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }
)

async function listenToUserCreated() {
  let conn, ch

  async function connect() {
    try {
      conn = await amqp.connect(process.env.RABBITMQ_URL)
      ch = await conn.createChannel()
      await ch.assertQueue('user.created', { durable: true })

      ch.consume('user.created', (msg) => {
        if (msg) {
          console.log('New user:', JSON.parse(msg.content.toString()))
          ch.ack(msg)
        }
      })

      conn.on('close', () => {
        console.log('RabbitMQ connection closed, reconnecting...')
        setTimeout(connect, 5000) // Переподключение через 5 сек
      })
    } catch (err) {
      console.error('RabbitMQ error:', err.message)
      setTimeout(connect, 5000) // Повторная попытка
    }
  }

  await connect()
}

listenToUserCreated()


app.listen(PORT, () => {
  console.log(`File-service running on port ${PORT}`)
})
