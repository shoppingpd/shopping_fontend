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
          <div class="center-right-top container">
            <h1>{{ product.name }}</h1>
            <!-- 庫存 價格 -->
            <div class="field size-field stock-price-field">
              <div class="stock-price-box">
                <label>名稱：</label>
                <label>{{ product.商品名稱 }}</label>
              </div>
              <div class="stock-price-box">
                <label>價格：</label>
                <label>{{ product.價格 }} 元</label>
              </div>
              <div class="stock-price-box">
                <label>庫存：</label>
                <label>{{ product.庫存數量 }} 件</label>
              </div>
            </div>
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
                  <input type="radio" name="size" :value="size.name" v-model="selectedSize" />
                  {{ size.name }}
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
            <div class="center-right-bottom">
              <h2>商品詳細說明</h2>
              <p>{{ product.商品描述 }}</p>
            </div>

            <!-- 選擇結果 -->
            <div class="selection-row field-row">
              <div id="selection-summary">
                已選：{{ selectedColor || '未選擇顏色' }} / {{ selectedSize || '未選擇尺寸' }} /
                數量：{{ quantity }} / 總價：{{ product.價格 * quantity }}
              </div>
              <div class="action-buttons">
                <button class="oval-btn cart-btn" @click="addToCart()">
                  <span class="btn-icon">🛒</span>
                  加入購物車
                </button>
                <button class="oval-btn checkout-btn" @click="addToCartandbuy()">
                  <span class="btn-icon">💳</span>
                  直接結帳
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <aside class="right"></aside>
  </main>
</template>

<script setup>
  import { ref, onMounted } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { useUserStore } from '@/stores/user';
  const userStore = useUserStore();
  // -------------------- 資料與狀態 --------------------
  const product = ref({}); // 商品資料
  const colors = ref([]); // 商品顏色選項
  const sizes = ref([]); // 商品尺寸選項
  const selectedColor = ref(''); // 使用者選擇的顏色
  const selectedSize = ref(''); // 使用者選擇的尺寸
  const quantity = ref(0); // 商品數量
  const user = ref(userStore.id); // 假設的使用者編號
  const newcart = ref([]); // 新增購物車暫存
  const pushcart = ref([]); // 從後端取得的購物車資料

  // -------------------- 路由 --------------------
  const route = useRoute();
  const router = useRouter();
  const productId = route.query.id; // 從 URL query 拿商品編號
  console.log('拿到商品編號:', productId);

  // -------------------- 商品資料載入 --------------------
  onMounted(() => {
    loadProducts();
  });

  // 取得商品資料
  async function loadProducts() {
    try {
      const res = await fetch(`http://localhost:8080/products/${productId}`);
      if (!res.ok) throw new Error('伺服器回應錯誤');
      product.value = await res.json();
      console.log('商品資料:', product.value);

      // 處理顏色資料
      if (product.value.顏色總類) {
        colors.value = product.value.顏色總類.split(',').map((item) => {
          const [name, hex] = item.split('#');
          return { name: name + '色', hex: '#' + hex };
        });
      }

      // 處理尺寸資料
      if (product.value.尺寸總類) {
        sizes.value = product.value.尺寸總類.split(',').map((item) => ({ name: item }));
      }
    } catch (err) {
      console.error('讀取失敗：', err);
    }
  }

  // -------------------- 商品數量操作 --------------------
  function changeQty(val) {
    // 保證數量 >= 0
    quantity.value = Math.max(0, quantity.value + val);
  }

  // -------------------- 購物車操作 --------------------
  // 加入購物車（暫存）
  function addToCart() {
    if (selectedColor.value && selectedSize.value && quantity.value > 0) {
      if (product.value.庫存數量 < quantity.value) {
        alert('商品庫存不足');
        return;
      }
      newcart.value.push({
        商品編號: product.value.商品編號,
        使用者編號: user.value,
        數量: quantity.value,
        商品顏色: selectedColor.value,
        商品大小: selectedSize.value,
      });
      console.log('加入購物車暫存:', newcart.value);
      postCart();
    } else {
      alert('請選擇顏色和尺寸，並輸入數量！');
    }
  }

  // 加入購物車並直接結帳
  async function addToCartandbuy() {
    if (selectedColor.value && selectedSize.value && quantity.value > 0) {
      if (product.value.庫存數量 < quantity.value) {
        alert('商品庫存不足');
        return;
      }
      newcart.value.push({
        商品編號: product.value.商品編號,
        使用者編號: user.value,
        數量: quantity.value,
        商品顏色: selectedColor.value,
        商品大小: selectedSize.value,
      });
      console.log('加入購物車暫存:', newcart.value);

      try {
        await postCart(); // 等待後端回應
        goToBuy();
      } catch (err) {
        console.error('購買流程失敗', err);
      }
    } else {
      alert('請選擇顏色和尺寸，並輸入數量！');
    }
  }

  // -------------------- 後端互動 --------------------
  // 將商品加入後端購物車
  async function postCart() {
    try {
      const response = await fetch('http://localhost:8080/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newcart.value[0]), // 只送第一筆暫存
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();
      await getCart(data); // 更新購物車資料
      alert('加入購物車成功!');
      console.log('POST 成功:', data);
    } catch (error) {
      alert('加入購物車失敗!');
      console.error('POST 失敗:', error);
    }
  }

  // 取得使用者購物車資料
  async function getCart(id) {
    try {
      const res = await fetch(`http://localhost:8080/cart/${id}`);
      if (!res.ok) throw new Error('伺服器回應錯誤');
      const data = await res.json();
      pushcart.value = data; // <- 包在 items 裡
      console.log('購物車資料:', pushcart.value);
    } catch (err) {
      console.error('讀取購物車失敗：', err);
    }
  }

  // 前往結帳頁面
  // 前往結帳頁面
  function goToBuy() {
    // 1. 先確認 pushcart.value 是否有值
    if (!pushcart.value) {
      console.error('購物車是空的，無法前往結帳');
      alert('購物車資料錯誤，無法結帳！');
      return;
    }

    // 2. 直接判斷 pushcart.value 本身是否為陣列
    // 如果是陣列，就直接使用；如果不是（表示只有單一物件），就把它放進一個新陣列中
    const itemsToSend = Array.isArray(pushcart.value) ? pushcart.value : [pushcart.value];

    // 3. 將整理好的陣列包裝後送到下一頁
    const data = encodeURIComponent(
      JSON.stringify({
        items: itemsToSend,
      }),
    );

    router.push({
      name: 'shoplist',
      query: { items: data },
    });
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
  .container .stock-price-field {
    display: flex;
    flex-direction: column; /* 垂直排列 */
    align-items: flex-start; /* 水平方向靠左 */
    width: 100%;
    gap: 0.5rem; /* 每個欄位間距，可調整 */
  }

  .container .stock-price-box {
    display: flex;
    align-items: center; /* 垂直置中 */
    justify-content: flex-start; /* 水平方向靠左 */
    white-space: nowrap; /* 避免折行 */
    gap: 0.5rem; /* label 間距 */
  }

  .stock-price-field .stock-price-box label {
    font-size: 1.5rem;
    font-weight: bold;
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
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .field label {
    white-space: nowrap;
  }
  .field-row {
    flex: 1.5;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
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
    margin-top: 1rem;
    padding: 0.5rem;
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
    padding: 1rem 3rem;
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
    white-space: nowrap;
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
  .center-right .container {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
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
    padding: 1%;
  }
  .center-right .container {
    display: flex;
    width: 100%;
    height: 100%;
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
