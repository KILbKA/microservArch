<template>
  <div class="files-container">
    <h2>Мои файлы</h2>
    
    <div v-if="loading" class="loading">Загрузка списка файлов...</div>
    
    <div v-else>
      <div v-if="files.length === 0" class="empty">
        У вас пока нет загруженных файлов
      </div>
      
      <ul v-else class="file-list">
        <li v-for="file in files" :key="file.name" class="file-item">
          <span>{{ file.name }}</span>
          <button @click="downloadFile(file)">Скачать</button>
        </li>
      </ul>
    </div>
    
    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
  </div>
</template>

<script>
export default {
  name: 'FileList',
  data() {
    return {
      files: [],
      loading: false,
      errorMessage: ''
    }
  },
  async created() {
    await this.loadFiles();
  },
  methods: {
    async loadFiles() {
      this.loading = true;
      this.errorMessage = '';
      
      const token = localStorage.getItem('access_token');
      if (!token) {
        this.$router.push('/login');
        return;
      }

      try {
        const response = await fetch('http://localhost:4000/files', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Ошибка загрузки списка файлов');
        }

        this.files = await response.json();
      } catch (e) {
        console.error('Ошибка:', e);
        this.errorMessage = 'Не удалось загрузить список файлов';
      } finally {
        this.loading = false;
      }
    },
    async downloadFile(file) {
      try {
        // Просто открываем URL в новой вкладке
        window.open(file.url, '_blank');
      } catch (e) {
        console.error('Ошибка скачивания:', e);
        this.errorMessage = 'Не удалось скачать файл';
      }
    }
  }
}
</script>

<style scoped>
.files-container {
  max-width: 600px;
  margin: 2rem auto;
}

.loading, .empty {
  padding: 1rem;
  text-align: center;
  color: #666;
}

.file-list {
  list-style: none;
  padding: 0;
}

.file-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.8rem;
  border-bottom: 1px solid #eee;
}

.file-item button {
  padding: 0.3rem 0.8rem;
  background: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.error {
  color: #ff4444;
  text-align: center;
}
</style>