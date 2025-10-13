<template>
  <div class="app">
    <h2>商品列表</h2>
    <button @click="loadProducts">重新載入</button>

    <ul v-if="products.length">
      <li v-for="p in products" :key="p.使用者編號">
        {{ p.使用者編號 }}. {{ p.姓名 }} - ${{ p.price }}
      </li>
    </ul>

    <p v-else>載入中...</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const products = ref([])

async function loadProducts() {
  try {
    const res = await fetch('http://localhost:8080/user')
    if (!res.ok) throw new Error('伺服器回應錯誤')
    products.value = await res.json()
  } catch (err) {
    console.error('讀取失敗：', err)
  }
}

onMounted(loadProducts)
</script>

<style>
.app {
  font-family: system-ui, sans-serif;
  padding: 20px;
}
button {
  margin-bottom: 1rem;
}
</style>
