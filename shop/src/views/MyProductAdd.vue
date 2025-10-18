<template>
  <section class="addproduct">
    <main class="main">
      <div class="container">
        <form
          id="product-form"
          enctype="multipart/form-data"
          @submit.prevent="handleSubmit"
          @reset="clearPreview"
        >
          <!-- 商品照片上傳 -->
          <div class="form-group">
            <label for="product-image">商品照片：</label>
            <input
              type="file"
              id="product-image"
              name="商品圖片"
              accept="image/*"
              required
              @change="previewImage"
            />
            <img
              id="preview-image"
              :src="previewUrl"
              alt="圖片預覽"
              style="max-width: 100%; margin-top: 10px;"
              v-show="previewUrl"
            />
          </div>

          <!-- 商品名稱 -->
          <div class="form-group">
            <label for="product-name">商品名稱：</label>
            <input type="text" id="product-name" name="商品名稱" maxlength="100" required />
          </div>

          <!-- 商品描述 -->
          <div class="form-group">
            <label for="product-description">商品描述：</label>
            <textarea id="product-description" name="商品描述" rows="4" required></textarea>
          </div>

          <!-- 顏色總類 -->
          <div class="form-group">
            <label for="product-color">商品顏色：（中文+#色碼，逗號分隔）</label>
            <input
              type="text"
              id="product-color"
              name="顏色總類"
              maxlength="100"
              required
              @blur="validateColor"
            />
          </div>

          <!-- 尺寸總類 -->
          <div class="form-group">
            <label for="product-size">商品尺寸：（XS,S,M,L,XL，逗號分隔）</label>
            <input
              type="text"
              id="product-size"
              name="尺寸總類"
              maxlength="45"
              required
              @blur="validateSize"
            />
          </div>

          <!-- 價格 -->
          <div class="form-group">
            <label for="product-price">商品售價：</label>
            <input type="number" id="product-price" name="價格" min="0" required />
          </div>

          <!-- 庫存數量 -->
          <div class="form-group">
            <label for="product-stock">商品庫存：</label>
            <input type="number" id="product-stock" name="庫存數量" min="0" required />
          </div>

          <!-- 操作按鈕 -->
          <div class="form-actions">
            <button type="reset">資料清除</button>
            <button type="submit">新增產品</button>
          </div>
        </form>
      </div>
    </main>
  </section>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useUserStore } from '@/stores/user'
import '@/assets/myshop.css'

const userStore = useUserStore()
const userId = computed(() => userStore.id)

const previewUrl = ref('')
const imageFile = ref(null)

function previewImage(event) {
  const file = event.target.files[0]
  if (!file) {
    previewUrl.value = ''
    imageFile.value = null
    return
  }
  previewUrl.value = URL.createObjectURL(file)
  imageFile.value = file
}

function clearPreview() {
  previewUrl.value = ''
  imageFile.value = null
}

function validateSize(event) {
  const input = event.target.value.trim()
  if (input === '') return
  const allowedSizes = ['XS', 'S', 'M', 'L', 'XL']
  const enteredSizes = input.split(',').map(s => s.trim().toUpperCase())
  const allValid = enteredSizes.every(size => allowedSizes.includes(size))
  const hasDuplicates = new Set(enteredSizes).size !== enteredSizes.length
  if (!allValid || hasDuplicates) {
    alert('尺寸只能輸入 XS, S, M, L, XL，且不可重複，需用逗號分隔')
    event.target.value = ''
  }
}

function validateColor(event) {
  const input = event.target.value.trim()
  if (input === '') return
  if (input.endsWith(',')) {
    alert('最後一組顏色後面不能有逗號')
    event.target.value = ''
    return
  }
  const colorItems = input.split(',').map(s => s.trim())
  const colorPattern = /^(?:[\u4e00-\u9fa5]+)?#[0-9A-Fa-f]{6}$/
  const allValid = colorItems.every(item => colorPattern.test(item))
  const hasDuplicates = new Set(colorItems).size !== colorItems.length
  if (!allValid || hasDuplicates) {
    alert('顏色格式錯誤：請輸入「中文+#六位色碼」，並以逗號分隔，且不可重複')
    event.target.value = ''
  }
}

async function handleSubmit(event) {
  const form = event.target
  const requiredFields = [
    'product-name',
    'product-description',
    'product-color',
    'product-size',
    'product-price',
    'product-stock'
  ]
  const hasEmpty = requiredFields.some(id => {
    const el = form.querySelector(`#${id}`)
    return !el || !el.value.trim()
  })
  if (!imageFile.value || hasEmpty) {
    alert('請完整填寫所有欄位，包含圖片')
    return
  }

  const payload = {
    商品名稱: form.querySelector('#product-name').value.trim(),
    商品描述: form.querySelector('#product-description').value.trim(),
    顏色總類: form.querySelector('#product-color').value.trim(),
    尺寸總類: form.querySelector('#product-size').value.trim(),
    價格: Number(form.querySelector('#product-price').value),
    庫存數量: Number(form.querySelector('#product-stock').value),
    上架者編號: String(userId.value),
    上架時間: new Date().toISOString(),
    商品圖片: imageFile.value.name // ✅ 只傳檔名，避開 varchar(500) 限制
  }

  try {
    const res = await fetch('http://localhost:8080/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    if (!res.ok) throw new Error('送出失敗')
    alert('新增成功')
    form.reset()
    clearPreview()
  } catch (err) {
    alert('送出失敗：' + err.message)
  }
}
</script>