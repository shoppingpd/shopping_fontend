<template>
  <main class="main-layout">
    <aside class="sidebar">
      <router-link to="/myshop/myproduct" class="sidebar-link">我的銷售商品</router-link>
      <div class="sidebar-sub">
        <router-link to="/myshop/addproduct" class="sidebar-link align-right">新增商品</router-link>
      </div>
      <router-link to="/myshop/ordermanagement" class="sidebar-link">銷售訂單管理</router-link>
    </aside>
    <section class="content">
      <router-view /> <!-- 子頁面會顯示在這裡 -->
    </section>
  </main>
</template>

<script setup>
  import '@/assets/myshop.css'
</script>