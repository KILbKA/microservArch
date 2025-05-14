<template>
  <div>
    <h1>Загрузить файл</h1>
    <input type="file" @change="handleFileSelect" />
    <button @click="uploadFile">Загрузить</button>

    <hr/>

    <h2>Список файлов</h2>
    <ul>
      <li v-for="file in files" :key="file.name">
        <a :href="getPublicUrl(file.name)" target="_blank">
          {{ file.name }}
        </a>
      </li>
    </ul>
  </div>
</template>

<script>
import { supabase } from '../lib/supabase.js'

export default {
  data() {
    return {
      selectedFile: null,
      files: []
    }
  },
  async mounted() {
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
      console.log('uploading:', fileName)

      const { data, error } = await supabase
        .storage
        .from('test')                // ваше имя бакета
        .upload(fileName, this.selectedFile)

      console.log('upload result:', { data, error })
      if (error) {
        return alert('Ошибка загрузки: ' + error.message)
      }

      alert('Файл загружен: ' + fileName)
      this.selectedFile = null
      await this.fetchFiles()
    },
    async fetchFiles() {
      const { data, error } = await supabase
        .storage
        .from('test')                // ваше имя бакета
        .list('', { limit: 100 })

      console.log('list result:', { data, error })
      if (error) {
        return console.error('Ошибка получения списка файлов:', error)
      }
      this.files = data
    },
    getPublicUrl(name) {
      return supabase
        .storage
        .from('test')
        .getPublicUrl(name).data.publicUrl
    }
  }
}
</script>
