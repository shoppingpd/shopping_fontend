<template>
  <main class="main">
    <section class="center">
      <div class="container">
        <div class="center-left">
          <div class="image-slider">
            <!-- <button class="arrow left" @click="prevImage">&lt;</button> -->
            <img :src="'/assets/img/' + product.商品圖片" :alt="product.商品名稱" />
            <!-- <button class="arrow right" @click="nextImage">&gt;</button> -->
          </div>
        </div>
        <div class="center-right">
          <div class="center-right-top">
            <h1>{{ product.name }}</h1>

            <!-- 顏色 -->
            <div class="field color-field">
              <label>顏色:</label>
              <div class="color-options">
                <label
                  v-for="(color, idx) in colors"
                  :key="idx"
                  class="option-box"
                  :style="{
                    backgroundColor: color.hex,
                    border: color.hex === '#ffffff' ? '1px solid #000' : '',
                  }"
                >
                  <input type="radio" name="color" :value="color.name" v-model="selectedColor" />
                </label>
              </div>
            </div>

            <!-- 尺寸 -->
            <div class="field size-field">
              <label>尺寸:</label>
              <div class="size-options">
                <label v-for="size in sizes" :key="size" class="option-box text-option">
                  <input type="radio" name="size" :value="size" v-model="selectedSize" />
                  {{ size }}
                </label>
              </div>
            </div>

            <!-- 數量 -->
            <div class="field quantity-field">
              <label>數量:</label>
              <div class="size-options">
                <button class="qty-btn" @click="changeQty(-1)">−</button>
                <input type="number" :value="quantity" readonly class="qty-input" />
                <button class="qty-btn" @click="changeQty(1)">+</button>
              </div>
            </div>

            <!-- 選擇結果 -->
            <div class="selection-row">
              <div id="selection-summary">
                已選：{{ selectedColor || '未選擇顏色' }} / {{ selectedSize || '未選擇尺寸' }} /
                數量：{{ quantity }}
              </div>
              <div class="action-buttons">
                <button class="oval-btn cart-btn">
                  <span class="btn-icon">🛒</span>
                  加入購物車
                </button>
                <button class="oval-btn checkout-btn">
                  <span class="btn-icon">💳</span>
                  直接結帳
                </button>
              </div>
            </div>
          </div>

          <div class="center-right-bottom">
            <h2>商品詳細說明</h2>
            <p>{{ product.商品描述 }}</p>
          </div>
        </div>
      </div>
    </section>

    <aside class="right"></aside>
  </main>
</template>

<script setup>
import { useRoute } from 'vue-router'
import { ref, computed, onMounted } from 'vue'
const product = ref([])
// const product = ref({
//   name: '極簡素色襯衫',
//   description: '柔軟棉質材質，透氣舒適，日常百搭。',
// })

const colors = [
  { name: '紅色', hex: 'red' },
  { name: '綠色', hex: 'green' },
  { name: '藍色', hex: 'blue' },
  { name: '黑色', hex: 'black' },
  { name: '白色', hex: '#ffffff' },
  { name: '深綠色', hex: 'darkgreen' },
]

const sizes = ['XS', 'S', 'M', 'L', 'XL']

const selectedColor = ref('')
const selectedSize = ref('')
const quantity = ref(0)

// const images = Array.from({ length: 5 }, (_, i) => `/images/img${i + 1}.jpg`)
// const currentIndex = ref(0)
// const currentImage = computed(() => images[currentIndex.value])
// const currentImage = computed(() => '/assets/img/img1.jpg')

// function prevImage() {
//   currentIndex.value = (currentIndex.value - 1 + images.length) % images.length
// }

// function nextImage() {
//   currentIndex.value = (currentIndex.value + 1) % images.length
// }

function changeQty(val) {
  quantity.value = Math.max(0, quantity.value + val)
}
const route = useRoute()
const productId = route.query.id
console.log('拿到商品編號:', productId)
onMounted(() => {
  loadProducts()
})
async function loadProducts() {
  try {
    const res = await fetch(`http://localhost:8080/products/${productId}`)
    if (!res.ok) throw new Error('伺服器回應錯誤')
    product.value = await res.json()
    console.log(product.value)
  } catch (err) {
    console.error('讀取失敗：', err)
  }
}
</script>

<style scoped>
:root {
  --c-background: #fff8e7;
  --c-background-soft: #fff2d9;
  --c-background-mute: #ffebc2;
  --c-border: rgba(0, 0, 0, 0.1);
  --c-border-hover: rgba(0, 0, 0, 0.25);
  --c-text: #333333;
  --c-heading: #3a6ea5;
  --c-primary: #3a6ea5;
  --c-accent: #ffebc2;
  --c-hover: #2f80ed;
}
.option-box input {
  display: none;
}

/* 替代 :has() 的寫法 */
.option-box input:checked + span,
.option-box input:checked {
  outline: 2px solid var(--c-primary);
}
.field {
  margin: 1rem 0;
}
.field label {
  font-size: 1rem;
  font-weight: bold;
}
.color-options {
  padding: 0 20% 0 3%;
  display: flex;
  width: 100%;
  gap: 1rem;
}
.size-options {
  padding: 0 20% 0 3%;
  display: flex;
  width: 100%;
  gap: 1rem;
}
.option-box {
  flex: 1; /* 3 份，也就是比例 1:3 */
  display: flex;
  flex-direction: column;
  justify-content: flex-start;

  position: relative;
  width: 2em;
  height: 2em;
  border-radius: 8px;
  border: 2px solid var(--c-border);
  align-items: center;
  cursor: pointer;
}

.option-box.text-option {
  background-color: var(--c-background);
  font-weight: bold;
}

/* ===== 數量按鈕美化 ===== */
.qty-btn {
  width: 2.5em;
  height: 2.5em;
  border: 2px solid var(--c-primary);
  background: white;
  border-radius: 50%;
  cursor: pointer;
  font-size: 1.2rem;
  font-weight: bold;
  color: var(--c-primary);
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.qty-btn:hover {
  background: var(--c-primary);
  color: white;
  transform: scale(1.1);
}

.qty-btn:active {
  transform: scale(0.95);
}

.qty-input {
  width: 4em;
  height: 2.5em;
  text-align: center;
  border: 2px solid var(--c-border);
  border-radius: 8px;
  font-size: 1.2rem;
  font-weight: bold;
  background: white;
}

/* ===== 選擇結果區塊美化 ===== */
.selection-row {
  margin-top: 2rem;
  padding: 1.5rem;
  background: linear-gradient(135deg, var(--c-background-soft) 0%, var(--c-accent) 100%);
  border-radius: 12px;
  border: 1px solid var(--c-border);
}

#selection-summary {
  font-size: 1.1rem;
  font-weight: 500;
  color: var(--c-text);
  margin-bottom: 1rem;
  padding: 0.5rem;
}

.action-buttons {
  display: flex;
  gap: 1rem;
}

.oval-btn {
  flex: 1;
  padding: 1rem 2rem;
  border: none;
  border-radius: 50px;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.btn-icon {
  font-size: 1.3rem;
}

.cart-btn {
  background: linear-gradient(135deg, #ffffff 0%, #f0f0f0 100%);
  color: var(--c-text);
  border: 2px solid var(--c-primary);
}

.cart-btn:hover {
  background: linear-gradient(135deg, #f0f0f0 0%, #e0e0e0 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
}

.checkout-btn {
  background: linear-gradient(135deg, var(--c-primary) 0%, #2f80ed 100%);
  color: white;
}

.checkout-btn:hover {
  background: linear-gradient(135deg, #2f80ed 0%, #1e5fb8 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(58, 110, 165, 0.4);
}

.oval-btn:active {
  transform: translateY(0);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.15);
}

.container {
  display: flex;
  width: 100%;
  height: 88vh; /* 讓 flex 子元素能撐滿父容器 */
}

.center-left {
  flex: 1; /* 1 份 */
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(226, 211, 163, 0.359);
}

.center-right {
  flex: 1; /* 3 份，也就是比例 1:3 */
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  padding: 2%;
}

.image-slider {
  width: 100%;
  height: 100%;
  overflow: hidden;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}
.image-slider img {
  width: 80%;
  height: 80%;
  background-size: 100% 100%; /* 完全拉伸填滿 */
  background-repeat: no-repeat;
  background-position: center;
}
/* 其他 CSS 原樣保留 */
</style>
