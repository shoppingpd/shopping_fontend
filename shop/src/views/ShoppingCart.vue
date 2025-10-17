<template>
  <div class="container">
    <h1 class="title" style="margin: 1px 0; font-weight: 1000">購物車</h1>

    <div class="layout">
      <section class="panel card">
        <div class="toolbar">
          <label>
            <input type="checkbox" v-model="checkAll" />
            全選
          </label>
          <div class="spacer"></div>
          <button class="link deletebtn" @click="deleteSelected">刪除所選</button>
          <button class="link updatebtn" @click="updateSelected">更新所選</button>
        </div>

        <div class="supershop">
          <section v-for="item in items" :key="item.商品編號" class="shop">
            <div class="shop__body item">
              <div>
                <input type="checkbox" v-model="item.selected" />
              </div>

              <div class="thumb">
                <img
                  :src="'/assets/img/' + item.商品照片"
                  :alt="item.商品名稱"
                  @error="(e) => (e.target.src = placeholderImg)"
                />
              </div>

              <div class="info">
                <div class="name">{{ item.商品名稱 }}</div>
              </div>

              <div class="price">{{ fmt(item.價格) }}</div>

              <div class="qty">
                <div class="stepper">
                  <button class="btn-dec" @click="decQty(item)">−</button>
                  <input
                    class="inp"
                    type="number"
                    min="1"
                    :value="item.數量"
                    @change="(e) => setQty(item, e.target.value)"
                  />
                  <button class="btn-inc" @click="incQty(item)">＋</button>
                </div>
              </div>

              <div class="subtotal">{{ fmt(item.數量 * item.價格) }}</div>

              <div class="ops">
                <button class="link deletebtn" @click="removeItem(item.購物車編號)">刪除</button>
              </div>
            </div>
          </section>
        </div>
      </section>

      <aside class="summary card">
        <h3 style="font-weight: bold; font-size: 1.5rem">訂單摘要</h3>
        <div class="kv">
          <div class="k">已選件數</div>
          <div class="numb">{{ selectedCount }}</div>
        </div>
        <div class="kv">
          <div class="k">小計</div>
          <div class="numb">{{ fmt(subtotal) }}</div>
        </div>
        <div class="kv">
          <div class="k">運費</div>
          <div style="width: 20%; white-space: nowrap; margin-right: 60%; font-weight: bolder">
            {{ freeshipmessage }}
          </div>
          <div class="numb">{{ fmt(shipping) }}</div>
        </div>
        <div class="kv">
          <div class="k">稅額</div>
          <div class="numb">{{ fmt(tax) }}</div>
        </div>
        <div class="kv">
          <div class="k total" style="font-weight: bold; font-size: 1.25rem">折扣</div>
          <div class="total numb">-{{ fmt(discount) }}</div>
        </div>
        <div class="kv">
          <div class="k total" style="font-weight: bold; font-size: 1.25rem">合計</div>
          <div class="total numb">{{ fmt(total) }}</div>
        </div>

        <button class="btn apply" :disabled="selectedCount === 0" @click="checkout">去結帳</button>

        <div class="promo">
          <div class="muted" style="margin-bottom: 6px">優惠碼</div>
          <input
            v-model.trim="promoInput"
            placeholder="輸入優惠碼（SAVE100 或 SAVE10）"
            @keydown.enter.prevent="applyPromo"
          />
          <button class="btn apply" @click="applyPromo">套用</button>
          <div
            class="muted"
            style="
              margin-top: 6px;
              color: rgba(230, 62, 62, 0.936);
              font-size: 1.5rem;
              font-weight: 900;
            "
          >
            {{ promoMsg }}
          </div>
        </div>
      </aside>
    </div>
  </div>
</template>

<script setup>
  import { ref, computed, onMounted } from 'vue';
  import { useRouter } from 'vue-router';
  import { useUserStore } from '@/stores/user';
  const userStore = useUserStore();

  // ----- 設定 -----
  const myuser = ref(userStore.id); // 預設使用者1

  // ----- 響應式狀態 -----
  const items = ref([]); // **核心修正：使用 ref 來儲存購物車商品，這是唯一的數據源**
  const promo = ref(null); // { code, type: 'amount'|'percent', value: number }
  const promoInput = ref('');
  const promoMsg = ref('');

  // 佔位圖
  const placeholderImg =
    'data:image/svg+xml;utf8,' +
    encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300">
      <rect width="100%" height="100%" fill="#f2f2f2"/>
      <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#c33" font-size="16">
        圖片載入失敗
      </text>
    </svg>`,
    );

  // **核心修正：合併數據加載邏輯**
  async function loadCartData() {
    try {
      const res = await fetch(`http://localhost:8080/cart/user/${myuser.value}`);
      if (!res.ok) throw new Error('伺服器回應錯誤');
      const dataFromApi = await res.json();

      // **重要：為從 API 來的數據添加前端需要的狀態（例如 `selected`）**
      // 預設將所有商品設置為選中狀態
      items.value = dataFromApi
        .filter((item) => item.狀態 == 0)
        .map((item) => ({
          ...item,
          selected: false, // 預設未選中
        }));
      console.log('購物車數據加載成功:', items.value);
    } catch (err) {
      console.error('讀取購物車失敗：', err);
      items.value = []; // 如果加載失敗，清空陣列
    }
  }

  // 元件掛載時執行加載
  onMounted(loadCartData);

  // ----- 工具：金額格式化 -----
  const fmt = (n) => '$' + Number(n || 0).toFixed(2);

  // ----- 全選 -----
  const checkAll = computed({
    get() {
      // **修正：基於 `items.value` 進行判斷**
      return items.value.length > 0 && items.value.every((i) => i.selected);
    },
    set(val) {
      // **修正：操作 `items.value`**
      items.value.forEach((i) => (i.selected = val));
    },
  });

  // ----- 單品操作 -----
  const incQty = (it) => {
    it.數量 += 1;
  };
  const decQty = (it) => {
    it.數量 = Math.max(1, it.數量 - 1);
  };
  const setQty = (it, val) => {
    const n = parseInt(val || '1', 10);
    it.數量 = Math.max(1, isNaN(n) ? 1 : n);
  };

  const removeItem = async (productId) => {
    // **修正：基於 `商品編號` 進行過濾**
    items.value = items.value.filter((x) => x.購物車編號 !== productId);
    try {
      const res = await fetch(`http://localhost:8080/cart/${productId}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        throw new Error('刪除失敗');
      }

      const data = await res.json();
      console.log('刪除成功：', data);
    } catch (err) {
      console.error('錯誤：', err);
    }
  };

  // ----- 刪除所選 -----
  const deleteSelected = async () => {
    const selectedItems = items.value.filter((i) => i.selected);
    for (const item of selectedItems) {
      try {
        const res = await fetch(`http://localhost:8080/cart/${item.購物車編號}`, {
          method: 'DELETE',
        });

        if (!res.ok) {
          throw new Error('刪除失敗');
        }

        const data = await res.json();
        console.log('刪除成功：', data);
      } catch (err) {
        console.error('錯誤：', err);
      }
    }
    items.value = items.value.filter((i) => !i.selected);
  };
  const updateSelected = async () => {
    for (const item of items.value) {
      // ✅ 這裡要加 .value
      console.log(item);
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
    }
    alert('更新成功!');
  };

  // ----- 已選商品 & 計價 (Computed Properties) -----
  // **修正：所有計算屬性都從 `items.value` 派生**
  const selectedItems = computed(() => items.value.filter((i) => i.selected));
  const selectedCount = computed(() => selectedItems.value.length);

  const subtotal = computed(() =>
    // **修正：使用正確的屬性名稱 `價格` 和 `數量`**
    selectedItems.value.reduce((s, i) => s + i.價格 * i.數量, 0),
  );

  const FREE_SHIP = 3000;
  const BASE_SHIP = 100;

  const shipping = computed(() => (subtotal.value >= FREE_SHIP ? 0 : BASE_SHIP));
  const freeshipmessage = computed(() =>
    subtotal.value >= FREE_SHIP ? '（已享免運）' : `（還差$${FREE_SHIP - subtotal.value}免運）`,
  );
  const TAX_RATE = 0.05;
  const tax = computed(() => +(subtotal.value * TAX_RATE).toFixed(2));

  const discount = computed(() => {
    if (!promo.value) return 0;
    if (promo.value.type === 'amount') {
      return Math.min(promo.value.value, subtotal.value);
    }
    if (promo.value.type === 'percent') {
      return +(subtotal.value * promo.value.value).toFixed(2);
    }
    return 0;
  });

  const total = computed(() =>
    Math.max(0, subtotal.value + shipping.value + tax.value - discount.value),
  );

  // ----- 優惠碼 -----
  const applyPromo = () => {
    const code = (promoInput.value || '').trim().toUpperCase();
    promoMsg.value = '';
    if (!code) {
      promo.value = null;
      promoMsg.value = '請輸入優惠碼！';
      return;
    }
    if (code === 'SAVE100') {
      promo.value = { code, type: 'amount', value: 100 };
      promoMsg.value = '已套用：折扣 100';
    } else if (code === 'SAVE10') {
      promo.value = { code, type: 'percent', value: 0.1 };
      promoMsg.value = '已套用：九折';
    } else {
      promo.value = null;
      promoMsg.value = '無效的優惠碼';
    }
  };
  const router = useRouter();
  // ----- 結帳 -----
  // ----- 結帳 -----
  const checkout = async () => {
    const selectedItems = items.value.filter((i) => i.selected);
    if (selectedItems.length === 0) {
      alert('請先選擇商品！');
      return;
    }

    // ★★★ 核心修正點 ★★★
    // 將 selectedItems 陣列包裝在一個物件中，key 為 "items"
    // 這樣結構才會是 { items: [...] }，以符合結帳頁面的期望
    const data = encodeURIComponent(JSON.stringify({ items: selectedItems }));

    router.push({
      name: 'shoplist', // 確保這個路由名稱與你的 router 設定相符
      query: { items: data },
    });
  };
</script>

<style scoped>
  /* ======================================================
    🎨 系統預設配色主題
    說明：
    - 全部顏色使用系統預設（不自訂顏色值）
    - 文字、邊框、背景皆用 system colors
    - 可以配合 OS 的淺色/深色模式自動切換
    - 提升可讀性與無障礙設計
====================================================== */

  /* ===== 使用系統顏色變數 ===== */
  :root {
    --c-background: Canvas; /* 主背景：依系統顏色 */
    --c-card: Canvas; /* 卡片背景 */
    --c-text: CanvasText; /* 文字 */
    --c-muted: GrayText; /* 次文字 / muted */
    --c-border: CanvasText; /* 邊框 */
    --c-hover: Highlight; /* hover / 選取背景 */
    --c-hover-text: HighlightText; /* hover 文字顏色 */
    --radius: 12px; /* 圓角統一 */
    --shadow: none; /* 系統配色通常不加陰影 */
  }

  /* ===== 全域重置 ===== */
  *,
  *::before,
  *::after {
    box-sizing: border-box;
    margin: 0;
    font-weight: normal;
  }

  html,
  body {
    height: 100%;
  }

  body {
    font-family:
      Inter,
      system-ui,
      -apple-system,
      'Segoe UI',
      Roboto,
      Helvetica,
      Arial,
      'Noto Sans TC',
      '微軟正黑體',
      sans-serif;
    color: var(--c-text);
    background: var(--c-background);
    line-height: 1.6;
    font-size: 15px;
    text-rendering: optimizeLegibility;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  /* ===== 容器設定 ===== */
  .layout .deletebtn {
    background-color: rgba(230, 62, 62, 0.936);
    border: none;
    border-radius: 50px;
    height: 2rem;
    padding: 0 1.5rem;
    margin: 0 auto;
    display: flex;
    align-items: center; /* 垂直置中 */
    justify-content: center; /* 水平置中（可選） */
    color: white; /* 建議加上字體顏色 */
  }
  .layout .deletebtn:hover {
    background-color: rgba(243, 103, 103, 0.908);
    color: rgb(236, 236, 236);
    font-weight: bold;
    cursor: pointer;
  }
  .layout .updatebtn {
    background-color: rgba(20, 117, 182, 0.936);
    border: none;
    border-radius: 50px;
    height: 2rem;
    padding: 0 1.5rem;
    margin: 0 auto;
    display: flex;
    align-items: center; /* 垂直置中 */
    justify-content: center; /* 水平置中（可選） */
    color: white; /* 建議加上字體顏色 */
  }
  .layout .updatebtn:hover {
    background-color: rgba(78, 154, 204, 0.908);
    color: rgb(235, 234, 234);
    font-weight: bold;
    cursor: pointer;
  }

  .container {
    margin: 0 auto;
    padding: 0 2rem;
  }
  .layout {
    display: grid;
    grid-template-columns: 1.6fr 0.8fr;
    gap: 20px;
  }
  /* @media (max-width: 1000px) {
  .layout {
    grid-template-columns: 1fr;
  }
} */

  /* ===== 卡片樣式 ===== */
  .card {
    background: var(--c-card);
    border: 1px solid var(--c-border);
    border-radius: var(--radius);
    box-shadow: var(--shadow);
    max-height: 80vh; /* 撐滿整個視窗高度 */
  }
  .supershop {
    overflow-y: auto;
    overflow-x: hidden; /* ← 加這行關掉水平滾動 */
    height: 85%;
    margin: 2rem 0;
  }
  /* ===== 左側清單 ===== */
  .panel {
    padding: 12px;
  }
  .toolbar {
    display: flex;
    align-items: center;
    gap: 12px;
    /* padding: 10px 12px; */
    border-bottom: 1px solid var(--c-border);
    padding-bottom: 1.3%;
  }
  .toolbar .title {
    width: 50%;
  }

  /* ===== 店鋪區塊 ===== */
  .shop {
    border: 1px solid var(--c-border);
    border-radius: var(--radius);
    background: var(--c-card);
  }
  .shop + .shop {
    margin-top: 14px;
  }
  .shop__head {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 14px;
    font-weight: 700;
    background: var(--c-card);
    border-bottom: 1px solid var(--c-border);
  }
  input[type='checkbox'] {
    transform: scale(1.5); /* 放大 1.5 倍 */
    cursor: pointer; /* 滑鼠變成可點擊手勢 */
    margin-right: 0.5rem; /* 與文字保持距離 */
  }
  .shop__body {
    border-bottom: 1px solid var(--c-border);
  }
  .shop:last-child .shop__body {
    border-bottom: none;
  }

  /* ===== 商品列 ===== */
  .item {
    display: grid;
    grid-template-columns: 36px 96px 1fr 110px 160px 120px 90px;
    align-items: center;
    gap: 12px;
    padding: 12px;
  }

  .thumb {
    width: 96px;
    height: 96px;
    border-radius: var(--radius);
    overflow: hidden;
    border: 1px solid var(--c-border);
  }
  .thumb img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .info .name {
    font-weight: 700;
    margin-bottom: 6px;
  }
  .info .sku {
    font-size: 12px;
    color: var(--c-muted);
  }
  .price {
    font-weight: 700;
  }
  .stepper {
    display: inline-flex;
    align-items: center;
    border: 1px solid var(--c-border);
    border-radius: 10px;
    overflow: hidden;
  }
  .stepper button {
    width: 32px;
    height: 34px;
    border: 0;
    background: var(--c-card);
    cursor: pointer;
  }
  .stepper input {
    width: 56px;
    height: 34px;
    border: 0;
    border-left: 1px solid var(--c-border);
    border-right: 1px solid var(--c-border);
    text-align: center;
  }
  .subtotal {
    font-weight: 800;
  }
  .ops {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .link {
    background: none;
    border: 0;
    color: var(--c-muted);
    cursor: pointer;
    text-align: left;
  }
  .link:hover {
    color: var(--c-hover-text);
    background: var(--c-hover);
  }

  /* ===== 小螢幕響應 ===== */
  @media (max-width: 900px) {
    .item {
      grid-template-columns: 36px 96px 1fr;
      grid-auto-rows: auto;
      gap: 8px;
      padding: 16px;
    }
    .info {
      grid-column: 2 / 4; /* 讓 info 區域跨越圖片和剩餘空間 */
    }
    .price,
    .qty,
    .subtotal,
    .ops {
      grid-column: 1 / 4; /* 讓這些控制項佔據整行 */
      justify-self: start;
      margin-top: 8px;
    }
  }

  /* ===== 右側摘要 ===== */
  .summary {
    position: sticky;
    top: 16px;
    padding: 16px;
  }
  .kv {
    display: flex;
    justify-content: space-between;
    padding: 9px 0;
    border-bottom: 1px dashed var(--c-border);
    white-space: nowrap;
  }
  .kv:last-child {
    border-bottom: none;
  }
  .kv .k {
    color: var(--c-muted);
    font-size: 1rem;
  }
  .total {
    font-size: 1rem;
    font-weight: 400;
  }
  .btn {
    width: 100%;
    padding: 12px 14px;
    border-radius: 10px;
    border: 1px solid var(--c-text);
    background: var(--c-card);
    font-weight: 800;
    cursor: pointer;
    margin-top: 14px;
  }
  .btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  /* ===== 優惠碼區塊 ===== */
  .promo {
    margin-top: 12px;
    border-top: 1px solid var(--c-border);
    padding-top: 12px;
  }
  .promo input {
    width: 100%;
    height: 40px;
    border: 1px solid var(--c-border);
    border-radius: 10px;
    padding: 0 12px;
  }
  .promo .apply {
    margin-top: 10px;
    border: 1px solid var(--c-text);
    background: var(--c-card);
  }
  .promo .apply:hover {
    background: var(--c-hover);
    color: var(--c-hover-text);
  }
  .apply {
    margin-top: 10px;
    border: 1px solid var(--c-text);
    background: var(--c-card);
  }
  .apply:hover {
    background: var(--c-hover);
    color: var(--c-hover-text);
  }

  .muted {
    color: var(--c-muted);
  }
  .spacer {
    flex: 1;
  }
  .numb {
    font-weight: 500;
    font-size: 1.2rem;
  }
</style>
