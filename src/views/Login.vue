
<template>
    <div>
      <h1>Авторизация / Регистрация</h1>
      <div>
        <input v-model="email" placeholder="Email" />
        <input v-model="password" type="password" placeholder="Пароль" />
      </div>
      <button @click="signUp">Зарегистрироваться</button>
      <button @click="signIn">Войти</button>
    </div>
  </template>
  
  <script>
  import { supabase } from '../lib/supabase.js'
  
  export default {
    data() {
      return {
        email: '',
        password: ''
      }
    },
    methods: {
      async signUp() {
        try {
          const { data, error } = await supabase.auth.signUp({
            email: this.email,
            password: this.password
          })
          if (error) throw error
          alert('Регистрация успешна! Проверь почту для подтверждения (если включено подтверждение).')
        } catch (error) {
          alert(`Ошибка регистрации: ${error.message}`)
        }
      },
      async signIn() {
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email: this.email,
            password: this.password
          })
          if (error) throw error
          alert('Вход выполнен!')
        } catch (error) {
          alert(`Ошибка входа: ${error.message}`)
        }
      }
    }
  }
  </script>
  