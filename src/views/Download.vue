<template>
  <div>
    <h1>Ваши изображения</h1>
    <ul>
      <li v-for="file in files" :key="file.name">
        <img :src="getPublicUrl(file.name)" :alt="file.name" width="120" />
        <button @click="downloadFile(file.name)" class="icon-btn" title="Скачать"><Download size="20" color="green"/></button>
        <button @click="deleteFile(file.name)" class="icon-btn" title="Удалить"><Trash size="20" color="red"/></button>
      </li>
    </ul>
  </div>
</template>

<script>
import { supabase } from '../supabase/supabase.js'
import { Download, Trash } from 'lucide-vue-next'

export default {
  data() {
    return {
      files: [],
      userId: null
    }
  },
  async mounted() {
    const { data, error } = await supabase.auth.getUser()
    if (error || !data?.user) {
      alert('Не авторизован. Переход на /login')
      return this.$router.push('/login')
    }

    this.userId = data.user.id
    await this.fetchFiles()
  },
  components: { Download, Trash },
  methods: {
    async fetchFiles() {
      if (!this.userId) return

      const { data, error } = await supabase
        .storage
        .from('test')
        .list(this.userId, { limit: 100 })

      if (!error) {
        this.files = data
      } else {
        console.error('Ошибка получения файлов:', error.message)
      }
    },
    getPublicUrl(name) {
      return supabase
        .storage
        .from('test')
        .getPublicUrl(`${this.userId}/${name}`).data.publicUrl
    },
    async downloadFile(name) {
      const { data, error } = await supabase
        .storage
        .from('test')
        .download(`${this.userId}/${name}`)

      if (error) {
        alert('Ошибка скачивания: ' + error.message)
        return
      }
      const url = URL.createObjectURL(data)
      const a = document.createElement('a')
      a.href = url
      a.download = name
      a.click()
      URL.revokeObjectURL(url)
    },
    async deleteFile(name) {
      const { error } = await supabase
        .storage
        .from('test')
        .remove([`${this.userId}/${name}`])

      if (error) {
        alert('Ошибка удаления: ' + error.message)
      } else {
        alert('Файл удалён!')
        await this.fetchFiles()
      }
    }
  }
}
</script>

<style scoped>
h1 {
  margin-bottom: 1rem;
  color: #212529;
}
ul {
  list-style: none;
  padding-left: 0;
}
li {
  margin-bottom: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
a {
  color: #0d6efd;
  text-decoration: none;
  flex-grow: 1;
}
span {
  flex-grow: 1;
  padding: 0 0.5rem;
  overflow-wrap: anywhere;
}
a:hover {
  text-decoration: underline;
}
.icon-btn {
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0.2rem;
  transition: transform 0.2s;
}
.icon-btn:hover {
  transform: scale(1.2);
}
</style>
