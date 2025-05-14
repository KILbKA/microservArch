
<template>
    <div>
      <h1>Home Page</h1>
      <p v-if="user">Привет, {{ user.email }}!</p>
      <p v-else>Вы не авторизованы. Пожалуйста, <router-link to="/login">войдите</router-link>.</p>
    </div>
  </template>
  
  <script>
  import { supabase } from '../lib/supabase.js'
  
  export default {
    data() {
      return {
        user: null
      }
    },
    async mounted() {
      // Получаем текущую сессию при загрузке страницы
      const { data } = await supabase.auth.getSession()
      this.user = data.session?.user || null
    }
  }
  </script>
  