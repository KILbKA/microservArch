// src/main.js

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './style.css' // подключаем стили (если не подключены в App.vue)

createApp(App)
  .use(router)
  .mount('#app')
