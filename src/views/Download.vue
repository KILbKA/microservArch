<template>
  <div class="download-container">
    <h2>Скачать изображение</h2>
    <input v-model="fileKey" placeholder="Введите fileKey" />
    <button @click="downloadFile">Скачать</button>
    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
  </div>
</template>

<script>
export default {
  name: 'Download',
  data() {
    return {
      fileKey: '',
      errorMessage: ''
    }
  },
  methods: {
    async downloadFile() {
      this.errorMessage = ''
      if (!this.fileKey) {
        this.errorMessage = 'Введите fileKey'
        return
      }

      const token = localStorage.getItem('access_token')
      if (!token) {
        this.$router.push('/login')
        return
      }

      try {
        // File‐сервис отдаёт redirect на signedUrl или проксирует blob
        const response = await fetch(`http://localhost:4000/download/${this.fileKey}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (!response.ok) {
          const result = await response.json()
          this.errorMessage = result.error || 'Ошибка при скачивании'
          return
        }

        // Предположим, File‐сервис проксирует файл как blob
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = this.fileKey
        a.click()
        window.URL.revokeObjectURL(url)
      } catch (e) {
        console.error('Ошибка при вызове File‐сервиса:', e)
        this.errorMessage = 'Не удалось связаться с сервером скачивания'
      }
    }
  }
}
</script>

<style scoped>
.download-container {
  max-width: 500px;
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
  margin-top: 1rem;
}
</style>
