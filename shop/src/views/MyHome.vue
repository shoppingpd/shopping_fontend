<template>
  <!-- 👋 畫面結構 -->
  <div class="hello">
    <h1>{{ message }}</h1>
    <p>這是一個 Vue 3 的範例組件！</p>

    <!-- 按鈕互動：點擊次數會加一 -->
    <button @click="count++">你點了 {{ count }} 次</button>
  </div>
</template>

<script setup>
// ===============================
// 這裡是 Vue 3 Composition API 的邏輯區
// ===============================
import { ref } from 'vue' // ref 用於定義響應式變數

// 建立一個可響應的變數 message
const message = ref('Hello Vue 3!')

// 建立一個計數器
const count = ref(0)
</script>

<style scoped>
/* ===============================
   局部樣式（只影響這個組件）
   =============================== */
.hello {
  text-align: center;
  padding: 40px;
  font-family: '微軟正黑體', 'Noto Sans TC', sans-serif;
}

h1 {
  color: #42b983; /* Vue 綠 */
}

button {
  background-color: #42b983;
  border: none;
  color: #fff;
  font-weight: bold;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
}

button:hover {
  background-color: #2c8e66;
}
</style>
