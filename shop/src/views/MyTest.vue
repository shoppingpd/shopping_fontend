<template>
  <div class="checkout">
    <!-- 主要內容區 -->
    <main class="layout">
      <!-- 左側：表單區域 -->
      <section class="form-section">
        <div class="form-header">
          <h1 class="title">確認訂單</h1>
          <p class="subtitle">請填寫收件資訊以完成購買</p>
        </div>

        <div class="form-container">
          <!-- 訂購人姓名欄位 -->
          <div class="field-group">
            <label class="field-label">訂購人姓名</label>
            <input
              v-model="buyer.name"
              type="text"
              class="field-input"
              placeholder="王小明"
            />
          </div>

          <!-- 手機號碼欄位 -->
          <div class="field-group">
            <label class="field-label">手機號碼</label>
            <input
              v-model="buyer.mobile"
              type="tel"
              class="field-input"
              placeholder="0911-111-111"
            />
          </div>

          <!-- 地址欄位 -->
          <div class="field-group">
            <label class="field-label">地址</label>
            <input
              v-model="buyer.address"
              type="text"
              class="field-input"
              placeholder="松仁路 100 號 8 樓"
            />
          </div>

          <!-- 提交按鈕 -->
          <button class="submit-btn" @click="submitOrder">
            <span>提交訂單</span>
            <svg class="btn-icon" width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M4 10h12m0 0l-4-4m4 4l-4 4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
        </div>
      </section>

      <!-- 右側：訂單摘要 -->
      <aside class="summary-section">
        <div class="summary-card">
          <h2 class="summary-title">訂單摘要</h2>

          <!-- 商品列表 -->
          <div class="items-list">
            <div
              v-for="item in state.items"
              :key="item.id"
              class="summary-item"
            >
              <div class="item-info">
                <span class="item-name">{{ item.title }}</span>
                <span class="item-qty">× {{ item.qty }}</span>
              </div>
              <span class="item-price">{{ formatPrice(item.price * item.qty) }}</span>
            </div>
          </div>

          <!-- 分隔線 -->
          <div class="divider"></div>

          <!-- 小計 -->
          <div class="summary-row">
            <span class="row-label">小計</span>
            <span class="row-value">{{ formatPrice(subtotal) }}</span>
          </div>

          <!-- 運費 -->
          <div class="summary-row">
            <span class="row-label">運費</span>
            <span class="row-value" :class="{ 'free-shipping': shipping === 0 }">
              {{ shipping === 0 ? '免運' : formatPrice(shipping) }}
            </span>
          </div>

          <!-- 分隔線 -->
          <div class="divider"></div>

          <!-- 總金額 -->
          <div class="summary-total">
            <span class="total-label">應付金額</span>
            <span class="total-value">{{ formatPrice(total) }}</span>
          </div>
        </div>
      </aside>
    </main>
  </div>
</template>

<script setup>
// 匯入 Vue 3 核心 API
import { reactive, computed } from 'vue'

// ======== 模擬商品資料 ========
const state = reactive({
  items: [
    { id: 1, title: '男裝｜素色短T', price: 390, qty: 2 },
    { id: 2, title: '女裝｜高腰牛仔褲', price: 780, qty: 1 },
    { id: 3, title: '童裝｜印花上衣', price: 320, qty: 3 },
  ]
})

// ======== 訂購人資料 ========
const buyer = reactive({
  name: '',
  mobile: '',
  address: ''
})

// ======== 計算小計金額 ========
const subtotal = computed(() =>
  state.items.reduce((sum, i) => sum + i.price * i.qty, 0)
)

// ======== 計算運費（宅配滿1500免運，否則90元） ========
const shipping = computed(() =>
  subtotal.value >= 1500 ? 0 : 90
)

// ======== 總金額 ========
const total = computed(() => subtotal.value + shipping.value)

// ======== 金額格式化 ========
const formatPrice = (n) => `NT$ ${Number(n || 0).toLocaleString()}`

// ======== 提交訂單 ========
const submitOrder = () => {
  if (!buyer.name || !buyer.mobile || !buyer.address) {
    alert('請完整填寫訂購資料！')
    return
  }
  alert(`訂單已送出，總金額 ${formatPrice(total.value)}`)
}
</script>

<style scoped>
/* ======== 全域變數設定 ======== */
:root {
  --c-background: #fff8e7;     /* 背景色：溫暖米黃 */
  --c-primary: #94390f;        /* 主色：深棕色 */
  --c-hover: #ed842f;          /* 懸停色：橘色 */
  --c-text: #333;              /* 文字色：深灰 */
  --c-text-light: #666;        /* 淺文字色 */
  --c-border: #e0d5c7;         /* 邊框色 */
  --c-card: #ffffff;           /* 卡片背景 */
  --shadow-sm: 0 2px 8px rgba(148, 57, 15, 0.08);      /* 小陰影 */
  --shadow-md: 0 4px 16px rgba(148, 57, 15, 0.12);     /* 中陰影 */
  --shadow-lg: 0 8px 24px rgba(148, 57, 15, 0.16);     /* 大陰影 */
  --radius-sm: 0.8rem;         /* 小圓角 */
  --radius-md: 1.2rem;         /* 中圓角 */
  --radius-lg: 1.6rem;         /* 大圓角 */
}

/* ======== 基礎重置 ======== */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

/* ======== 主容器 ======== */
.checkout {
  min-height: 100vh;
  padding: 2rem;
  font-family: 'Segoe UI', 'Microsoft JhengHei', sans-serif;
  font-size: 16px;
  line-height: 1.6;
  color: var(--c-text);
  background: var(--c-background);
  -webkit-font-smoothing: antialiased;
}

/* ======== 版面配置：響應式雙欄布局 ======== */
.layout {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 400px;  /* 左側自適應，右側固定400px */
  gap: 3rem;
  align-items: start;
}

/* 平板以下改為單欄 */
@media (max-width: 968px) {
  .layout {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
}

/* ======== 左側表單區域 ======== */
.form-section {
  background: var(--c-card);
  border-radius: var(--radius-lg);
  padding: 3rem;
  box-shadow: var(--shadow-md);
  transition: box-shadow 0.3s ease;
}

.form-section:hover {
  box-shadow: var(--shadow-lg);
}

/* 表單標題區 */
.form-header {
  margin-bottom: 2.5rem;
}

.title {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--c-primary);
  margin-bottom: 0.5rem;
  letter-spacing: -0.02em;
}

.subtitle {
  color: var(--c-text-light);
  font-size: 1rem;
}

/* 表單容器 */
.form-container {
  display: flex;
  flex-direction: column;
  gap: 1.8rem;
}

/* 欄位組 */
.field-group {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.field-label {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--c-text);
  letter-spacing: 0.01em;
}

.field-input {
  width: 100%;
  padding: 1rem 1.2rem;
  border: 2px solid var(--c-border);
  border-radius: var(--radius-sm);
  font-size: 1rem;
  color: var(--c-text);
  background: var(--c-background);
  transition: all 0.3s ease;
  outline: none;
}

/* 輸入框焦點效果 */
.field-input:focus {
  border-color: var(--c-primary);
  background: var(--c-card);
  box-shadow: 0 0 0 4px rgba(148, 57, 15, 0.1);
}

.field-input::placeholder {
  color: #999;
}

/* ======== 提交按鈕 ======== */
.submit-btn {
  margin-top: 1rem;
  width: 100%;
  padding: 1.2rem 2rem;
  background: var(--c-primary);
  color: white;
  border: none;
  border-radius: var(--radius-sm);
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.8rem;
  transition: all 0.3s ease;
  box-shadow: var(--shadow-sm);
}

.submit-btn:hover {
  background: var(--c-hover);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.submit-btn:active {
  transform: translateY(0);
}

.btn-icon {
  transition: transform 0.3s ease;
}

.submit-btn:hover .btn-icon {
  transform: translateX(4px);
}

/* ======== 右側訂單摘要 ======== */
.summary-section {
  position: sticky;
  top: 2rem;
}

.summary-card {
  background: linear-gradient(135deg, var(--c-primary) 0%, var(--c-hover) 100%);
  border-radius: var(--radius-lg);
  padding: 2rem;
  color: white;
  box-shadow: var(--shadow-lg);
}

.summary-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  letter-spacing: -0.01em;
}

/* 商品列表 */
.items-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-sm);
  backdrop-filter: blur(10px);
  transition: all 0.2s ease;
}

.summary-item:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateX(4px);
}

.item-info {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.item-name {
  font-weight: 500;
  font-size: 0.95rem;
}

.item-qty {
  font-size: 0.85rem;
  opacity: 0.8;
}

.item-price {
  font-weight: 600;
  font-size: 1rem;
}

/* 分隔線 */
.divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.3);
  margin: 1.2rem 0;
}

/* 摘要行 */
.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.6rem 0;
  font-size: 0.95rem;
}

.row-label {
  opacity: 0.9;
}

.row-value {
  font-weight: 600;
}

.free-shipping {
  color: #ffeb3b;
  font-weight: 700;
}

/* 總金額 */
.summary-total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.2rem;
  background: rgba(255, 255, 255, 0.2);
  border-radius: var(--radius-sm);
  margin-top: 1rem;
  backdrop-filter: blur(10px);
}

.total-label {
  font-size: 1.1rem;
  font-weight: 600;
}

.total-value {
  font-size: 1.8rem;
  font-weight: 700;
  letter-spacing: -0.02em;
}

/* ======== 手機版響應式調整 ======== */
@media (max-width: 768px) {
  .checkout {
    padding: 1rem;
  }

  .form-section {
    padding: 2rem 1.5rem;
  }

  .title {
    font-size: 2rem;
  }

  .summary-section {
    position: static;
  }
}
</style>
