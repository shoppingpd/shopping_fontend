<template>
  <div class="checkout">

    <!-- 主內容區：左側是表單，右側是訂單摘要 -->
    <main class="layout">
      <!-- 左側：使用者輸入表單 -->
      <section class="form">
        <div style="font-size: 3rem; font-weight: bold; margin-bottom: 2rem">確認訂單</div>
        <div class="container">
        <!-- 訂購人姓名 -->
        <div class="field">
          <label>訂購人姓名</label>
          <!-- v-model：與 buyer.name 雙向綁定 -->
          <input v-model="buyer.name" placeholder="王小明" />
        </div>

        <!-- 手機號碼 -->
        <div class="field">
          <label>手機號碼</label>
          <input v-model="buyer.mobile" placeholder="0911-111-111" />
        </div>

        <!-- 地址 -->
        <div class="field">
          <label>地址</label>
          <input v-model="buyer.address" placeholder="松仁路 100 號 8 樓" />
        </div>

        <!-- 提交訂單按鈕 -->
         <div class="field">
          <button class="btn primary" @click="submitOrder">提交訂單</button>
         </div>

        </div>




      </section>

      <!-- 右側：訂單摘要 -->
      <aside class="summary">
        <h2>訂單摘要</h2>

        <!-- 用 v-for 迭代每個商品項目 -->
        <div
          v-for="item in state.items"
          :key="item.id"
          class="summary-item"
        >
          <!-- 顯示商品名稱與數量 -->
          <span>{{ item.title }} × {{ item.qty }}</span>
          <!-- 顯示小計金額 -->
          <span>{{ formatPrice(item.price * item.qty) }}</span>
        </div>

        <!-- 小計 -->
        <div class="line">
          <span>小計</span>
          <strong>{{ formatPrice(subtotal) }}</strong>
        </div>

        <!-- 應付總金額 -->
        <div class="line total">
          <span>應付金額</span>
          <strong>{{ formatPrice(total) }}</strong>
        </div>
      </aside>
    </main>
  </div>
</template>

<script setup>
// 匯入 Vue 核心 API
import { reactive, computed, ref } from 'vue'

// ======== 模擬後端商品資料 ========
// 使用 reactive 讓物件具備響應式能力
const state = reactive({
  items: [
    { id: 1, title: '男裝｜素色短T', price: 390, qty: 2 },
    { id: 2, title: '女裝｜高腰牛仔褲', price: 780, qty: 1 },
    { id: 3, title: '童裝｜印花上衣', price: 320, qty: 3 },
  ]
})

// ======== 收件人 / 訂購人資料 ========
const buyer = reactive({
  name: '',    // 訂購人姓名
  mobile: '',  // 手機號碼
  city: '',    // 縣市
  address: ''  // 地址
})

// ======== 配送方式（預設宅配） ========
const delivery = ref('home')

// ======== 計算小計金額 ========
// computed：會自動根據 items 改變而更新
const subtotal = computed(() =>
  state.items.reduce((sum, i) => sum + i.price * i.qty, 0)
)

// ======== 計算運費規則 ========
// 依照配送方式與金額門檻決定運費
const shipping = computed(() =>
  delivery.value === 'home'
    ? subtotal.value >= 1500 ? 0 : 90     // 宅配滿1500免運
    : subtotal.value >= 999 ? 0 : 60      // 超商取貨滿999免運
)

// ======== 總金額（含運） ========
const total = computed(() => subtotal.value + shipping.value)

// ======== 金額格式化函式 ========
const formatPrice = (n) => `NT$ ${Number(n || 0).toLocaleString()}`

// ======== 提交訂單按鈕事件 ========
// 這裡簡單以 alert 模擬提交動作
function submitOrder() {
  // 基本驗證
  if (!buyer.name || !buyer.mobile || !buyer.address) {
    alert('請完整填寫訂購資料！')
    return
  }
  alert(`訂單已送出，總金額 ${formatPrice(total.value)}`)
}
</script>

<style scoped>
/*
  :root 中定義全域顏色與字體比例
  方便統一管理與響應式調整
*/
:root {
  font-size: 62.5%; /* 1rem = 10px，方便計算 */
  --c-background: #fff8e7;
  --c-primary: #94390f;
  --c-hover: #ed842f;
  --c-text: #333;
}

/* 外層容器：整體背景與基本排版 */
.checkout {
  display: flex;
  flex-direction: column;
  background: var(--c-background);
  color: var(--c-text);
  font-size: 1.6rem;
  height: 90vh;
}

/* 頂部導覽列 */
.topbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.2rem 2rem;
  background: var(--c-primary);
  color: #fff;
  border-radius: 1rem;
}

/* 主要版面配置：左側表單 + 右側摘要 */
.layout {
  margin-top: 2rem;
  display: flex; /* flex 才能排水平或垂直 */
  flex-direction: row; /* 上下排列 */
  width: 100%;
}
.layout .container {
   display: flex; /* flex 才能排水平或垂直 */
  flex-direction: column; /* 上下排列 */
  width: 100%;
  height: 100%;
}

/* 表單區域佔版面約 65% */
.form {
  flex: 1;
  height: 100%;
}

/* 訂單摘要區佔約 30% */
.summary {
  flex: 1;
  background: var(--c-hover);
  padding: 1.6rem;
  border-radius: 1rem;
  color: #fff;
}

/* 各輸入欄位設定 */
.field {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center; /* 垂直置中 */
  justify-content: flex-start; /* 水平方向靠左 */

}

/* 輸入框樣式 */
.input,
select {
  padding: 0.8rem;
  border: 0.1rem solid #ccc;
  border-radius: 0.5rem;
}

/* 按鈕通用樣式 */
.btn {
  padding: 1rem 2rem;
  border: none;
  border-radius: 0.6rem;
  cursor: pointer;
}

/* 主色調按鈕 */
.btn.primary {
  background: var(--c-primary);
  color: #fff;
}

/* 滑過效果 */
.btn.primary:hover {
  background: var(--c-hover);
}

/* 摘要金額排列 */
.line {
  display: flex;
  justify-content: space-between;
  margin-top: 1rem;
}

/* 總金額樣式：加上上邊框與粗體 */
.line.total {
  font-weight: bold;
  border-top: 0.1rem solid #fff;
  padding-top: 1rem;
}
</style>
