// auth-service/supabaseClient.js
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config()

/**
 * Создаём Supabase-клиент с service_role ключом,
 * чтобы реализовать любые admin-операции в Supabase Auth.
 */
export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)
