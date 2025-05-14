<!-- src/App.vue -->
<template>
  <header>
    <nav>
      <router-link to="/">Home</router-link>
      <router-link to="/login">Login</router-link>
      <router-link to="/upload">Upload</router-link>
    </nav>
  </header>

  <main>
    <router-view />
  </main>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style>
/* Примеры простых стилей */
header {
  background: #eee;
  padding: 1rem;
}
nav a {
  margin-right: 1rem;
}
</style>
