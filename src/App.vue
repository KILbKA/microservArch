<template>
  <header>
    <nav>
      <router-link to="/">Главное меню</router-link>
      <router-link to="/login" v-if="!user">Вход</router-link>
      <router-link to="/upload" v-if="user">Загрузка изображения</router-link>
      <router-link to="/download" v-if="user">Скачать изображения</router-link>
      <button v-if="user" @click="logout">Выйти</button>
    </nav>
  </header>
  <main>
    <router-view />
  </main>
</template>

<script>
import { supabase } from './supabase/supabase'

export default {
  name: 'App',
  data() {
    return {
      user: null
    }
  },
  async mounted() {
    const { data } = await supabase.auth.getSession()
    this.user = data.session?.user || null

    supabase.auth.onAuthStateChange((event, session) => {
      this.user = session?.user || null
    })
  },
  methods: {
    async logout() {
      await supabase.auth.signOut()
      this.user = null
      this.$router.push('/login')
    }
  }
}
</script>

<style>
body {
  margin: 0;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background-color: #f8f9fa;
  color: #333;
}

header {
  background: #343a40;
  padding: 1rem;
}

nav {
  display: flex;
  align-items: center;
  gap: 1rem;
}

nav a {
  color: #fff;
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  transition: background 0.3s;
}

nav a.router-link-active {
  background: #495057;
}

nav a:hover {
  background: #495057;
}

button {
  background-color: #198754;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  margin-right: 1rem;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.3s;
}

button:hover {
  background-color: #157347;
}

main {
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
}

input[type="text"],
input[type="email"],
input[type="password"],
input[type="file"] {
  display: block;
  width: 40%;
  padding: 0.5rem;
  margin: 0.5rem 0 1rem;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 1rem;
}

h1, h2 {
  color: #212529;
}

ul {
  padding-left: 1rem;
}

li {
  margin-bottom: 0.5rem;
}
</style>
