<script setup>
  import { RouterView } from 'vue-router';
  import Sidebar from './Sidebar.vue';
  import RoleSwitcher from '@/components/shared/RoleSwitcher.vue';
</script>

<template>
  <div class="app-shell">
    <Sidebar />
    <main class="app-main">
      <RouterView />
    </main>
    <RoleSwitcher />
  </div>
</template>
