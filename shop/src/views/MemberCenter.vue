<template>
  <main class="main-layout">
    <aside class="sidebar">
      <router-link to="/member/profile" class="sidebar-link">會員資料與更新</router-link>
      <router-link to="/member/orders" class="sidebar-link">訂單查詢</router-link>
    </aside>
    <section class="content">
      <router-view /> <!-- 子頁面會顯示在這裡 -->
    </section>
  </main>
</template>

<script setup>
  import '@/assets/newmembercenter.css'
</script>
