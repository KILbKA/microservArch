<template>
  <div class="upload-container">
    <h2>Загрузка изображения</h2>
    <input type="file" @change="onFileChange" />
    <button @click="uploadFile" :disabled="!selectedFile">Загрузить</button>
    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
    <p v-if="successMessage" class="success">{{ successMessage }}</p>
  </div>
</template>

<script>
export default {
  name: 'Upload',
  data() {
    return {
      selectedFile: null,
      errorMessage: '',
      successMessage: ''
    }
  },
  methods: {
    onFileChange(event) {
      this.selectedFile = event.target.files[0]
      this.errorMessage = ''
      this.successMessage = ''
    },
    async uploadFile() {
      this.errorMessage = ''
      this.successMessage = ''
      if (!this.selectedFile) {
        this.errorMessage = 'Выберите файл для загрузки'
        return
      }

      const token = localStorage.getItem('access_token')
      if (!token) {
        // Если вдруг токена нет, перенаправляем на /login
        this.$router.push('/login')
        return
      }

      const formData = new FormData()
      formData.append('file', this.selectedFile)

      try {
        // Предположим, ваш File‐сервис слушает http://localhost:4000
        const response = await fetch('http://localhost:4000/upload', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        })
        const result = await response.json()

        if (!response.ok) {
          this.errorMessage = result.error || 'Ошибка загрузки файла'
          return
        }
        // File‐сервис вернёт { fileKey, publicUrl }
        this.successMessage = `Файл "${this.selectedFile.name}" успешно загружен. 
          <br> URL: <a :href="result.publicUrl" target="_blank">${result.publicUrl}</a>`
      } catch (e) {
        console.error('Ошибка при вызове File‐сервиса:', e)
        this.errorMessage = 'Не удалось связаться с сервером загрузки'
      }
    }
  }
}
</script>

<style scoped>
.upload-container {
  max-width: 500px;
  margin: 2rem auto;
  text-align: center;
}
input[type="file"] {
  margin-bottom: 1rem;
}
button {
  padding: 0.6rem 1.2rem;
  cursor: pointer;
  font-size: 1rem;
}
.error {
  color: red;
  margin-top: 1rem;
}
.success {
  color: green;
  margin-top: 1rem;
}
</style>
