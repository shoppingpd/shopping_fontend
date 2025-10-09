<template>
  <div id="app" class="container">
     <!-- ===== Header ===== -->
  <header>
    <div class="wrapper">
      <nav>
        <RouterLink to="/home">Home</RouterLink>
        <RouterLink to="/shop">Shop</RouterLink>
      </nav>
    </div>
  </header>

  <!-- ===== Main Content ===== -->
  <main id="app" class="content">
    <RouterView />
  </main>
  </div>
</template>

<style scoped>
/* ===== 全頁預設 ===== */
html, body {
  margin: 0;
  padding: 0;
  height: 100%;
  width: 100%;
  font-family: Inter, system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  background-color: #fafafa;
}

/* ===== Header ===== */
header {
  position: sticky; /* 頂部固定 */
  top: 0;
  color: rgb(0, 0, 0);
  z-index: 1000;
  box-shadow: 0 2px 6px rgba(0,0,0,0.2);
}

header .wrapper {
  margin: 0 auto;
  display: flex;
  justify-content: center; /* nav 水平置中 */
  padding: 1rem 1rem;
  height: 20;
}

/* ===== Nav ===== */
nav {
  display: flex;
  gap: 1.5rem;
}

nav a {
  color: #000000;
  text-decoration: none;
  padding: 0.25rem 0.5rem;
  transition: background-color 0.3s;
  border-radius: 4px;
}

nav a:hover {
  background-color: rgba(255,255,255,0.1);
}

nav a.router-link-exact-active {
  font-weight: 700;
  border-bottom: 2px solid #fff;
}

/* ===== Main Content ===== */
.content {
  padding: 2rem 1rem;
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
</style>
