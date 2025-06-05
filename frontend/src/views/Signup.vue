<template>
  <div class="signup-container">
    <h2>Регистрация</h2>
    <input v-model="email" type="email" placeholder="Email" />
    <input v-model="password" type="password" placeholder="Пароль" />
    <button @click="doSignup">Зарегистрироваться</button>
    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
    <p v-if="successMessage" class="success">{{ successMessage }}</p>
    <p>Уже есть аккаунт? <router-link to="/login">Войти</router-link></p>
  </div>
</template>

<script>
export default {
  name: 'Signup',
  data() {
    return {
      email: '',
      password: '',
      errorMessage: '',
      successMessage: ''
    }
  },
  methods: {
    async doSignup() {
      this.errorMessage = ''
      this.successMessage = ''
      if (!this.email || !this.password) {
        this.errorMessage = 'Введите email и пароль'
        return
      }

      try {
        const response = await fetch('http://localhost:3000/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: this.email,
            password: this.password
          })
        })
        const result = await response.json()

        if (!response.ok) {
          this.errorMessage = result.error || 'Ошибка регистрации'
          return
        }
        this.successMessage = 'Пользователь создан. Проверьте почту для подтверждения.'
        // По желанию редиректим на /login:
        // this.$router.push('/login')
      } catch (e) {
        console.error('Ошибка при вызове Auth /signup:', e)
        this.errorMessage = 'Не удалось связаться с сервером регистрации'
      }
    }
  }
}
</script>

<style scoped>
.signup-container {
  max-width: 400px;
  margin: 2rem auto;
  text-align: center;
}
input {
  display: block;
  width: 100%;
  margin-bottom: 1rem;
  padding: 0.6rem;
  font-size: 1rem;
}
button {
  padding: 0.6rem 1.2rem;
  font-size: 1rem;
  cursor: pointer;
}
.error {
  color: red;
  margin-top: 0.8rem;
}
.success {
  color: green;
  margin-top: 0.8rem;
}
</style>
