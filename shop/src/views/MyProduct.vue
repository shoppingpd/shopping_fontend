<template>
  <section class="my-product">
    <main class="main">
      <section class="panel card">
        <p v-if="loading">載入中...</p>
        <div v-if="products.length === 0">尚無商品資料</div>
        <div v-else>
          <div
            v-for="product in products"
            :key="product.商品編號"
            class="item"
          >
            <!-- 左欄：圖片與操作 -->
            <div class="thumb">
              <img
                class="preview"
                :src="product.商品圖片 || 'images/placeholder.png'"
                alt="商品圖片"
              />
              <div class="ops">
                <input type="file" @change="e => handleUpload(product.商品編號, e)" />
                <button @click="handleDeleteImage(product.商品編號)">刪除圖片</button>
              </div>
            </div>

            <!-- 中欄：原始資料 -->
            <div class="original">
              <div class="field"><span class="value">名稱：</span><span class="value">{{ product.商品名稱 }}</span></div>
              <div class="field"><span class="value">描述：</span><span class="value">{{ product.商品描述 }}</span></div>
              <div class="field"><span class="value">顏色：</span><span class="value">{{ product.顏色總類 }}</span></div>
              <div class="field"><span class="value">尺寸：</span><span class="value">{{ product.尺寸總類 }}</span></div>
              <div class="field"><span class="value">價格：</span><span class="value">{{ product.價格 }} 元</span></div>
              <div class="field"><span class="value">庫存：</span><span class="value">{{ product.庫存數量 }}</span></div>
            </div>

            <!-- 右欄：編輯欄位 -->
            <div class="editor">
              <div
                class="field"
                v-for="field in ['商品名稱', '商品描述', '顏色總類', '尺寸總類', '價格', '庫存數量']"
                :key="field"
              >
                <textarea
                  v-model="draftMap[product.商品編號][field]"
                  :placeholder="`修改 ${field}`"
                  class="editor-input"
                />
                <button class="link" @click="updateField(product.商品編號, field)">修改</button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import '@/assets/myshop.css'

const userStore = useUserStore()
const userId = computed(() => userStore.id)

const loading = ref(true)
const products = ref([])
const draftMap = ref({})

onMounted(async () => {
  if (!userId.value || isNaN(userId.value)) {
    console.error('無法取得使用者 ID')
    loading.value = false
    return
  }

  try {
    const res = await fetch(`http://localhost:8080/products/user/${userId.value}`)
    if (!res.ok) throw new Error('載入失敗')
    const data = await res.json()
    products.value = data
    initDrafts(data)
  } catch (err) {
    console.error('商品載入錯誤：', err.message)
  } finally {
    loading.value = false
  }
})

function initDrafts(data) {
  draftMap.value = {}
  data.forEach(p => {
    draftMap.value[p.商品編號] = { ...p }
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
      p.商品編號 === id ? { ...p, [field]: value } : p
    )
    alert(`${field} 已更新`)
  }
}

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
    products.value = products.value.map(p =>
      p.商品編號 === id ? { ...p, 商品圖片: data.imageUrl } : p
    )
    alert('圖片已更新')
  }
}

async function handleDeleteImage(id) {
  const res = await fetch(`/api/products/${id}/image`, { method: 'DELETE' })
  if (res.ok) {
    products.value = products.value.map(p =>
      p.商品編號 === id ? { ...p, 商品圖片: '' } : p
    )
    alert('圖片已刪除')
  }
}
</script>