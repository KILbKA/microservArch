// auth-service/authMiddleware.js
import dotenv from 'dotenv'
import { supabase } from './supabaseClient.js'

dotenv.config()

/**
 * Middleware проверяет заголовок Authorization: Bearer <token>.
 * Если токен валиден (проверяется через Supabase SDK), кладёт req.userId = id пользователя.
 * В противном случае возвращает 401.
 */
export async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization || ''
    const token = authHeader.replace('Bearer ', '').trim()
    if (!token) {
      return res.status(401).json({ error: 'Token not provided' })
    }

    // Вместо ручной проверки через JWKS мы используем Supabase SDK:
    // supabase.auth.getUser(token) вернёт { data: { user }, error }
    const { data, error } = await supabase.auth.getUser(token)

    if (error || !data.user) {
      // Если Supabase вернул ошибку или user === null, значит токен невалиден
      return res.status(401).json({ error: 'Invalid or expired token' })
    }

    // Токен валиден, сохраняем идентификатор пользователя
    req.userId = data.user.id
    next()
  } catch (e) {
    console.error('authMiddleware error:', e)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
