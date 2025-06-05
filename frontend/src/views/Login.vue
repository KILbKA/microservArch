<template>
  <div class="login-container">
    <h2>Вход</h2>
    <input v-model="email" type="email" placeholder="Email" />
    <input v-model="password" type="password" placeholder="Пароль" />
    <button @click="doLogin">Войти</button>
    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
    <p v-if="successMessage" class="success">{{ successMessage }}</p>
    <p>Нет аккаунта? <router-link to="/signup">Зарегистрироваться</router-link></p>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

export default {
  name: 'Login',
  setup() {
    const email = ref('')
    const password = ref('')
    const errorMessage = ref('')
    const successMessage = ref('')
    const router = useRouter()

    const doLogin = async () => {
      errorMessage.value = ''
      successMessage.value = ''

      if (!email.value || !password.value) {
        errorMessage.value = 'Введите email и пароль'
        return
      }

      try {
        const response = await fetch('http://localhost:3000/signin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: email.value,
            password: password.value
          })
        })

        const result = await response.json()

        if (!response.ok) {
          errorMessage.value = result.error || 'Ошибка входа'
          return
        }

        // Сохраняем токены в localStorage
        localStorage.setItem('access_token', result.access_token)
        localStorage.setItem('refresh_token', result.refresh_token)

        // Показываем сообщение об успешном входе
        successMessage.value = 'Вход выполнен успешно! Перенаправление...'

        // Через секунду делаем редирект, чтобы успеть увидеть сообщение
        setTimeout(() => {
          router.push('/upload')
        }, 1000)
      } catch (e) {
        console.error('Ошибка при запросе /signin:', e)
        errorMessage.value = 'Сетевая ошибка. Попробуйте позже.'
      }
    }

    return {
      email,
      password,
      errorMessage,
      successMessage,
      doLogin
    }
  }
}
</script>

<style scoped>
.login-container {
  max-width: 400px;
  margin: 2rem auto;
  padding: 2rem;
  border: 1px solid #ccc;
  border-radius: 8px;
  text-align: center;
}
.login-container input {
  width: 100%;
  margin-bottom: 1rem;
  padding: 0.6rem;
  font-size: 1rem;
}
.login-container button {
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
