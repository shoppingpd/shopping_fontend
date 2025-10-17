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
            <input v-model="buyer.姓名" type="text" class="field-input" placeholder="請輸入姓名" />
          </div>

          <!-- 手機號碼欄位 -->
          <div class="field-group">
            <label class="field-label">電子郵件</label>
            <input
              v-model="buyer.電子郵件"
              type="tel"
              class="field-input"
              placeholder="請輸入電子郵件"
            />
          </div>

          <!-- 地址欄位 -->
          <div class="field-group">
            <label class="field-label">地址</label>
            <input v-model="buyer.地址" type="text" class="field-input" placeholder="請輸入地址" />
          </div>

          <!-- 提交按鈕 -->
          <button class="submit-btn" @click="submitOrder">
            <span>提交訂單</span>
            <svg class="btn-icon" width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path
                d="M4 10h12m0 0l-4-4m4 4l-4 4"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
              />
            </svg>
          </button>
        </div>
      </section>

      <!-- 右側：訂單摘要 -->
      <aside class="summary-section">
        <div class="summary-card">
          <h2 class="summary-title" style="font-size: 1.5rem">訂單摘要</h2>

          <!-- 商品列表 -->
          <div class="items-list">
            <div v-for="item in state.items" :key="item.id" class="summary-item">
              <div class="item-info">
                <span class="item-name">{{ item.商品名稱 }}</span>
                <span class="item-qty"
                  >{{ item.商品顏色 }} / {{ item.商品大小 }} / {{ item.數量 }} 件</span
                >
                <span class="item-qty"></span>
              </div>
              <span class="item-price">{{ formatPrice(item.價格 * item.數量) }}</span>
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
              {{
                shipping === 0
                  ? '已享免運'
                  : formatPrice(shipping) + '（還差' + (freeShipping - subtotal) + '元免運）'
              }}
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
  import { reactive, computed, ref, onMounted } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { useUserStore } from '@/stores/user';
  const userStore = useUserStore();
  onMounted(() => {
    loaduser();
  });
  const freeShipping = 3000;
  const route = useRoute();
  const state = reactive({
    items: [],
  });

  try {
    const data = route.query.items;
    if (data) {
      const parsedData = JSON.parse(decodeURIComponent(data));
      // 從解析出來的物件中，取出 'items' 屬性（也就是那個陣列）
      state.items = parsedData.items;
    }
  } catch (err) {
    console.error('解析失敗', err);
  }
  console.log('購物車資料:', state);

  const user = ref(userStore.id);
  const buyer = ref([]);
  async function loaduser() {
    try {
      const res = await fetch(`http://localhost:8080/user/${user.value}`);
      if (!res.ok) throw new Error('伺服器回應錯誤');
      buyer.value = await res.json();
      console.log(buyer.value);
    } catch (err) {
      console.error('讀取失敗：', err);
    }
  }

  //假使用者

  // ======== 訂購人資料 ========

  // ======== 計算小計金額 ========
  const subtotal = computed(() => {
    const items = Array.isArray(state.items) ? state.items : [state.items];
    let sum = 0;
    for (const i of items) {
      // 保險起見，檢查 i.價格 和 i.數量 是否存在
      const price = Number(i.價格) || 0;
      const qty = Number(i.數量) || 0;
      sum += price * qty;
    }
    return sum;
  });

  // ======== 計算運費（宅配滿1500免運，否則90元） ========
  const shipping = computed(() => (subtotal.value >= 3000 ? 0 : 100));

  // ======== 總金額 ========
  const total = computed(() => subtotal.value + shipping.value);

  // ======== 金額格式化 ========
  const formatPrice = (n) => `NT$ ${Number(n || 0).toLocaleString()}`;
  const router = useRouter();
  // ======== 提交訂單 ========
  const submitOrder = async () => {
    if (!buyer.value.姓名 || !buyer.value.電子郵件 || !buyer.value.地址) {
      alert('請完整填寫訂購資料！');
      return;
    }
    for (const item of state.items) {
      const postlistItem = {
        使用者編號: buyer.value.使用者編號,
        購物車編號: item.購物車編號,
        配送地址: buyer.value.地址,
        總金額: total.value,
        狀態: '未出貨',
      };
      item.狀態 = '1';
      await fetch('http://localhost:8080/list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postlistItem),
      });
      try {
        const res = await fetch(`http://localhost:8080/cart/${item.購物車編號}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' }, // ⚠️ 記得加 header
          body: JSON.stringify(item),
        });

        if (!res.ok) {
          throw new Error('更新失敗');
        }

        const data = await res.json();

        console.log('更新成功：', data);
      } catch (err) {
        console.error('錯誤：', err);
      }
      const postorderItem = {};
      try {
        const res = await fetch(`http://localhost:8080/products/${item.商品編號}`);
        if (!res.ok) throw new Error('伺服器回應錯誤');
        postorderItem.value = await res.json();
        console.log('商品資料：' + postorderItem.value);
      } catch (err) {
        console.error('讀取失敗：', err);
      }
      // 更新商品
      postorderItem.value.庫存數量 = postorderItem.value.庫存數量 - item.數量;
      try {
        const res = await fetch(`http://localhost:8080/products/${item.商品編號}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' }, // ⚠️ 記得加 header
          body: JSON.stringify(postorderItem.value),
        });

        if (!res.ok) {
          throw new Error('更新失敗');
        }

        const data = await res.json();

        console.log('更新成功：', data);
      } catch (err) {
        console.error('錯誤：', err);
      }
    }
    alert(`訂單已成功送出！`);
    router.push('/home');
  };
</script>

<style scoped>
  /* ======== 全域變數設定 ======== */
  :root {
    --c-background: #fff8e7; /* 背景色：溫暖米黃 */
    --c-primary: #94390f; /* 主色：深棕色 */
    --c-hover: #ed842f; /* 懸停色：橘色 */
    --c-text: #333; /* 文字色：深灰 */
    --c-text-light: #666; /* 淺文字色 */
    --c-border: #e0d5c7; /* 邊框色 */
    --c-card: #ffffff; /* 卡片背景 */
    --shadow-sm: 0 2px 8px rgba(148, 57, 15, 0.08); /* 小陰影 */
    --shadow-md: 0 4px 16px rgba(148, 57, 15, 0.12); /* 中陰影 */
    --shadow-lg: 0 8px 24px rgba(148, 57, 15, 0.16); /* 大陰影 */
    --radius-sm: 0.8rem; /* 小圓角 */
    --radius-md: 1.2rem; /* 中圓角 */
    --radius-lg: 1.6rem; /* 大圓角 */
  }

  /* ======== 基礎重置 ======== */
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  /* ======== 主容器 ======== */
  .checkout {
    font-family: 'Segoe UI', 'Microsoft JhengHei', sans-serif;
    font-size: 16px;
    color: var(--c-text);
    background: var(--c-background);
    -webkit-font-smoothing: antialiased;
    width: 100%;
  }

  /* ======== 版面配置：響應式雙欄布局 ======== */
  .layout {
    gap: 3rem;
    display: flex; /* flex 才能排水平或垂直 */
    flex-direction: row; /* 上下排列 */
    align-items: stretch; /* 確保兩欄等高 */
    width: 100%;
    height: 88svh;
    margin-top: 2rem;
  }

  /* ======== 左側表單區域 ======== */
  .form-section {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start; /* ← 改成靠左 */
    background: var(--c-card);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-md);
    transition: box-shadow 0.3s ease;
    flex: 1;
    margin-left: 10%;
    width: 100%;
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
    width: 100%;
  }

  /* 欄位組 */
  .field-group {
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
    width: 100%;
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
    flex: 1;
    display: flex;
    /* 移除 align-items 和 justify-content 來取消置中 */
    /* align-items: center; */
    /* justify-content: center; */
    margin-bottom: 2rem;
    height: 88%;
  }

  .summary-card {
    background: linear-gradient(135deg, var(--c-primary) 0%, var(--c-hover) 100%);
    border-radius: var(--radius-lg);
    padding: 2rem;
    color: white;
    box-shadow: var(--shadow-lg);
    width: 80%;
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
    height: 40%;
    overflow-y: auto;
    overflow-x: hidden; /* ← 加這行關掉水平滾動 */
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
    font-size: 1.2rem;
  }

  .item-qty {
    font-size: 1rem;
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
    font-size: 1.05rem;
    font-weight: 800;
  }

  .row-value {
    font-size: 1.05rem;
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
</style>
