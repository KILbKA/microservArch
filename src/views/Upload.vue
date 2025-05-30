<template>
  <div>
    <h1>Загрузить файл</h1>
    <input type="file" @change="handleFileSelect" />
    <button @click="uploadFile">Загрузить</button>
  </div>
</template>

<script>
import { supabase } from '../supabase/supabase.js'

export default {
  data() {
    return {
      selectedFile: null,
      files: [],
      userId: null
    }
  },
  async mounted() {
    const { data, error } = await supabase.auth.getUser()
    if (error || !data.user) {
      alert('Ошибка получения пользователя или пользователь не найден')
      return this.$router.push('/login')
    }

    this.userId = data.user.id
    await this.fetchFiles()
  },
  methods: {
    handleFileSelect(e) {
      this.selectedFile = e.target.files[0]
      console.log('selectedFile:', this.selectedFile)
    },
    async uploadFile() {
      if (!this.selectedFile) {
        return alert('Сначала выберите файл!')
      }

      const fileName = `${Date.now()}_${this.selectedFile.name}`
      const filePath = `${this.userId}/${fileName}`

      const { data, error } = await supabase
        .storage
        .from('test')
        .upload(filePath, this.selectedFile)

      console.log('upload result:', { data, error })
      if (error) {
        return alert('Ошибка загрузки: ' + error.message)
      }

      alert('Файл успешно загружен!')
      this.selectedFile = null
    },
  }
}
</script>
