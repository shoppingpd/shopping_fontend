<template>
  <section class="my-product">
    <main class="main">
      <div class="container">
        <h1>我的商品清單</h1>
        <section class="panel card">
          <p v-if="loading">載入中...</p>
          <div v-if="products.length === 0">尚無商品資料</div>
          <div v-else>
            <div
              v-for="product in products"
              :key="product.id"
              class="item"
            >
              <!-- 左欄：圖片與操作 -->
              <div class="thumb">
                <img
                  class="preview"
                  :src="product.imageUrl || 'images/placeholder.png'"
                  alt="商品圖片"
                />
                <div class="ops">
                  <input type="file" @change="e => handleUpload(product.id, e)" />
                  <button @click="handleDeleteImage(product.id)">刪除圖片</button>
                </div>
              </div>

              <!-- 中欄：原始資料 -->
              <div class="original">
                <div class="field"><span class="value">名稱：</span><span class="value">{{ product.name }}</span></div>
                <div class="field"><span class="value">描述：</span><span class="value">{{ product.description }}</span></div>
                <div class="field"><span class="value">顏色：</span><span class="value">{{ product.color }}</span></div>
                <div class="field"><span class="value">尺寸：</span><span class="value">{{ product.size }}</span></div>
                <div class="field"><span class="value">價格：</span><span class="value">{{ product.price }} 元</span></div>
                <div class="field"><span class="value">庫存：</span><span class="value">{{ product.stock }}</span></div>
              </div>

              <!-- 右欄：編輯欄位 -->
              <div class="editor">
                <div
                  class="field"
                  v-for="field in ['name', 'description', 'color', 'size', 'price', 'stock']"
                  :key="field"
                >
                  <input
                    v-model="draftMap[product.id][field]"
                    :placeholder="`修改 ${field}`"
                  />
                  <button class="link" @click="updateField(product.id, field)">修改</button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  </section>
</template>

<script setup>
  import { ref, onMounted } from 'vue'
  import '@/assets/myshop.css'

  const loading = ref(true) //加入 loading 狀態
  const products = ref([])

  onMounted(async () => {
  try {
    const useMock = true //是否使用測試資料
    const res = await fetch(useMock ? '/testupdate.json' : '/api/products') //根據條件載入資料
    if (!res.ok) throw new Error('載入失敗')
        const data = await res.json()
        products.value = data
        initDrafts(data) //初始化編輯暫存

    } 
    catch (err) {
        console.error('商品載入錯誤：', err.message)
    }
    finally {
        loading.value = false //結束 loading
  }})

  // 商品資料與編輯暫存
  const draftMap = ref({}) // 每筆商品的暫存編輯資料

  function initDrafts(data) {
    draftMap.value = {}
    data.forEach(p => {
        draftMap.value[p.id] = { ...p } // 每筆商品一份可編輯副本
    })
  }

  async function updateField(id, field) {
    const value = draftMap.value[id][field]
    if (!value) return alert('請輸入新值')
    const res = await fetch(`/api/products/${id}/${field}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: value })
    })
    if (res.ok) {
        products.value = products.value.map(p =>
        p.id === id ? { ...p, [field]: value } : p
        )
        alert(`${field} 已更新`)
    }
  }

  //圖片上傳與刪除
  async function handleUpload(id, event) {
    const file = event.target.files[0]
    if (!file) return alert('請選擇圖片')
    const formData = new FormData()
    formData.append('image', file)
    const res = await fetch(`/api/products/${id}/image`, {
        method: 'PUT',
        body: formData
    })
    if (res.ok) {
        const data = await res.json()
        const updated = products.value.map(p =>
        p.id === id ? { ...p, imageUrl: data.imageUrl } : p
        )
        products.value = updated
        alert('圖片已更新')
    }
  }

  async function handleDeleteImage(id) {
    const res = await fetch(`/api/products/${id}/image`, { method: 'DELETE' })
    if (res.ok) {
        products.value = products.value.map(p =>
        p.id === id ? { ...p, imageUrl: '' } : p
        )
        alert('圖片已刪除')
    }
  }

</script>
