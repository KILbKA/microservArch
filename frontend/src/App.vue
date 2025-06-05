<template>
  <div id="app">
    <header>
      <nav>
        <router-link to="/">Главное меню</router-link>
        <router-link v-if="!user" to="/login">Вход</router-link>
        <router-link v-if="!user" to="/signup">Регистрация</router-link>
        <router-link v-if="user" to="/upload">Загрузка изображения</router-link>
        <router-link v-if="user" to="/download">Скачать изображения</router-link>
        <button v-if="user" @click="logout">Выйти</button>
      </nav>
    </header>
    <main>
      <router-view />
    </main>
  </div>
</template>

<script>
export default {
  name: 'App',
  computed: {
    // Считаем, что пользователь авторизован, если есть access_token в localStorage
    user() {
      return !!localStorage.getItem('access_token')
    }
  },
  methods: {
    logout() {
      // Удаляем токены и перенаправляем на страницу входа
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      this.$router.push('/login')
    }
  }
}
</script>

<style scoped>
header {
  background-color: #1a1a1a;
  padding: 1rem;
}
nav {
  display: flex;
  gap: 1rem;
  align-items: center;
}
nav a {
  color: #ffffff;
  text-decoration: none;
}
nav button {
  background-color: #e74c3c;
  color: #fff;
  border: none;
  padding: 0.5rem 1rem;
  cursor: pointer;
  border-radius: 4px;
}
nav button:hover {
  background-color: #c0392b;
}
main {
  padding: 2rem;
}
</style>
