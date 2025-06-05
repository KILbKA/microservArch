<template>
  <div class="home-container">
    <h1>Добро пожаловать</h1>
    <div v-if="!user">
      <p>Пожалуйста, <router-link to="/login">войдите</router-link> или 
         <router-link to="/signup">зарегистрируйтесь</router-link>, чтобы продолжить.</p>
    </div>
    <div v-else>
      <p>Вы вошли как <strong>{{ userEmail }}</strong>.</p>
      <p>
        <router-link to="/upload">Загрузить изображение</router-link> или 
        <router-link to="/download">Скачать изображение</router-link>.
      </p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Home',
  computed: {
    user() {
      return !!localStorage.getItem('access_token')
    },
    userEmail() {
      return localStorage.getItem('user_email') || 'неизвестный'
    }
  }
}
</script>

<style scoped>
.home-container {
  max-width: 600px;
  margin: 2rem auto;
  text-align: center;
}
h1 {
  margin-bottom: 1.5rem;
}
p {
  font-size: 1.1rem;
}
</style>
