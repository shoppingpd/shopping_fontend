<template>
  <div>
    <HeaderComponent />
    <main class="main-layout">
      <SidebarComponent />
      <section class="content">
        <router-view /> <!-- 根據路由顯示對應內容 -->
      </section>
    </main>
    <FooterComponent />
  </div>
</template>

<script setup>
import HeaderComponent from './components/HeaderComponent.vue'
import FooterComponent from './components/FooterComponent.vue'
import SidebarComponent from './components/SidebarComponent.vue'
</script>