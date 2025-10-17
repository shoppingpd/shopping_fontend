<template>
  <div id="app" class="container">
    <!-- ===== Header ===== -->
    <header>
      <div v-if="!isLoginPage" class="wrapper">
        <nav class="containerfornav">
          <div class="box" v-for="i in 8" :key="i">
            <div v-if="i == 1" class="icon"></div>
            <RouterLink v-if="i == 3" to="/home">首頁</RouterLink>
            <RouterLink v-if="i == 4" to="/x">我的賣場</RouterLink>

            <RouterLink v-if="i == 5" to="/shop">購物車</RouterLink>
            <RouterLink v-if="i == 6" to="/login">會員中心</RouterLink>

            <RouterLink v-if="i == 8" to="/" class="logout">登出</RouterLink>
          </div>
        </nav>
      </div>
    </header>

    <!-- ===== Main Content ===== -->
    <main id="app" class="content">
      <RouterView />
    </main>
  </div>

  <!-- ===== Footer ===== -->
  <footer v-if="!isLoginPage">
    <div class="footer-container">
      <button>配送方式</button>
      <button>退換貨說明</button>
      <button>客服中心</button>
    </div>
  </footer>
</template>
<script setup>
  import { onMounted, computed } from 'vue';
  import { useRoute } from 'vue-router';
  // 為了在 <template> 中使用，RouterLink 和 RouterView 必須被導入。
  import { RouterLink, RouterView } from 'vue-router';

  // 1. 取得路由實例
  const route = useRoute();

  // 2. 建立計算屬性，判斷目前路徑是否為 '/login'
  const isLoginPage = computed(() => route.path === '/');

  // 3. 組件掛載後執行
  onMounted(() => {
    document.title = 'SHOPPING BUY';
  });
</script>
<style scoped>
  /* ===== 全頁預設 ===== */
  html,
  body {
    margin: 0;
    padding: 0;
    height: 100%;
    width: 100%;
    font-family:
      Inter,
      system-ui,
      -apple-system,
      'Segoe UI',
      Roboto,
      Helvetica,
      Arial,
      sans-serif;
  }

  /* ===== Header ===== */
  header {
    position: sticky; /* 頂部固定 */
    top: 0;
    color: rgb(0, 0, 0);
    z-index: 1000;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
  }

  header .wrapper {
    margin: 0 auto;
    display: flex;
    justify-content: center; /* nav 水平置中 */
    padding: 1.5rem 1rem;
    background-color: #ff7b00;
  }

  /* ===== Nav ===== */
  nav {
    display: flex;
    gap: 1.5rem;
  }

  nav a {
    color: #ffffff;
    text-decoration: none;
    padding: 0.25rem 0.5rem;
    transition: background-color 0.3s;
    border-radius: 4px;
    font-weight: 700; /* ← 字體變粗的關鍵 */
    font-size: 25px;
  }

  nav a:hover {
    background-color: rgba(0, 0, 0, 0.1);
  }

  nav a.router-link-exact-active {
    font-weight: 100%;
    border-bottom: 2px solid #fff;
  }

  /* ===== Main Content ===== */
  .content {
    margin: 0 auto;
    display: flex;
    flex-direction: column; /* 上下排列 */
    gap: 2rem;
  }
  .container {
    display: flex; /* flex 才能排水平或垂直 */
    flex-direction: column; /* 上下排列 */
    width: 100%;
  }
  .containerfornav {
    display: flex;
    justify-content: space-between; /* 讓 10 份均分 */
    width: 100%;
  }
  .box {
    flex: 0.125;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .icon {
    width: 150%; /* 或任何容器寬度 */
    height: 150%; /* 容器高度 */
    background-image: url('/assets/img/logo.png'); /* 替換為你的圖片路徑 */
    background-size: 100% 100%; /* 完全拉伸填滿 */
    background-repeat: no-repeat;
    background-position: center;
  }

  /* ===== Footer ===== */
  footer {
    background-color: #7e3f04;
    padding: 3rem 0;
    color: #fff;
    text-align: center;
  }
  .footer-container {
    display: flex;
    justify-content: center;
    gap: 2rem;
  }
  footer button {
    background: none;
    border: none;
    color: #fff;
    font-size: 1rem;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.3s;
  }
  footer button:hover {
    text-decoration: underline;
  }
  .logout {
    background: none;
    border: none;
    width: 60%;
    color: #fff;
    font-size: 1.5rem;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.3s;
    text-align: center;
  }
  .logout:hover {
    text-decoration: underline;
  }
</style>
