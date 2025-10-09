<template>
  <!-- 整頁容器 -->
  <div class="container">
    <h1 style="margin: 8px 0 12px">購物車</h1>

    <div class="layout">
      <!-- ========== 左：清單面板 ========== -->
      <section class="panel card">
        <div class="toolbar">
          <!-- 全選：使用具名 v-model 綁定到 computed checkAll -->
          <label>
            <input type="checkbox" v-model="checkAll" />
            全選
          </label>
          <div class="spacer"></div>
          <button class="link" @click="deleteSelected">刪除所選</button>
        </div>

        <!-- 多店鋪清單：依店名分組後渲染 -->
        <div>
          <section v-for="(group, shopName) in groupedByShop" :key="shopName" class="shop">
            <div class="shop__head">
              <!-- 店鋪選取框：控制該店所有商品的 selected -->
              <label>
                <input
                  type="checkbox"
                  :checked="group.length > 0 && group.every((i) => i.selected)"
                  @change="toggleShop(shopName, $event.target.checked)"
                />
                {{ shopName }}
              </label>
            </div>

            <div class="shop__body">
              <!-- 單列商品 -->
              <div v-for="it in group" :key="it.id" class="item">
                <div>
                  <input type="checkbox" v-model="it.selected" @change="persist()" />
                </div>

                <div class="thumb">
                  <img
                    :src="it.img"
                    :alt="it.name"
                    @error="(e) => (e.target.src = placeholderImg)"
                  />
                </div>

                <div class="info">
                  <div class="name">{{ it.name }}</div>
                  <div class="sku">{{ it.sku }}</div>
                </div>

                <div class="price">{{ fmt(it.price) }}</div>

                <div class="qty">
                  <div class="stepper">
                    <button class="btn-dec" @click="decQty(it)">−</button>
                    <input
                      class="inp"
                      type="number"
                      min="1"
                      :value="it.qty"
                      @change="(e) => setQty(it, e.target.value)"
                    />
                    <button class="btn-inc" @click="incQty(it)">＋</button>
                  </div>
                </div>

                <div class="subtotal">{{ fmt(it.qty * it.price) }}</div>

                <div class="ops">
                  <button class="link btn-del" @click="removeItem(it.id)">刪除</button>
                </div>
              </div>
            </div>
          </section>
        </div>
      </section>

      <!-- ========== 右：訂單摘要 ========== -->
      <aside class="summary card">
        <h3>訂單摘要</h3>
        <div class="kv">
          <div class="k">已選件數</div>
          <div>{{ selectedCount }}</div>
        </div>
        <div class="kv">
          <div class="k">小計</div>
          <div>{{ fmt(subtotal) }}</div>
        </div>
        <div class="kv">
          <div class="k">運費</div>
          <div>{{ fmt(shipping) }}</div>
        </div>
        <div class="kv">
          <div class="k">稅額</div>
          <div>{{ fmt(tax) }}</div>
        </div>
        <div class="kv">
          <div class="k total">折扣</div>
          <div class="total">-{{ fmt(discount) }}</div>
        </div>
        <div class="kv">
          <div class="k total">合計</div>
          <div class="total">{{ fmt(total) }}</div>
        </div>

        <button class="btn" :disabled="selectedCount === 0" @click="checkout">去結帳</button>

        <div class="promo">
          <div class="muted" style="margin-bottom: 6px">優惠碼</div>
          <input
            v-model.trim="promoInput"
            placeholder="輸入優惠碼（SAVE100 或 SAVE10）"
            @keydown.enter.prevent="applyPromo"
          />
          <button class="btn apply" @click="applyPromo">套用</button>
          <div class="muted" style="margin-top: 6px">{{ promoMsg }}</div>
        </div>
      </aside>
    </div>
  </div>
</template>

<script setup>
// ======================
// Vue 3 (Composition API) - JavaScript 版
// ======================
import { reactive, computed, watch, onMounted, ref } from 'vue'

// ----- 金額/運費/稅設定 -----
const FREE_SHIP = 1500 // 滿額免運門檻
const BASE_SHIP = 0 // 基本運費（可改）
const TAX_RATE = 0.0 // 稅率（可改）
const STORAGE_KEY = 'multi-shop-cart-v1'

// 佔位圖（圖片載入失敗用）
const placeholderImg =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300">
      <rect width="100%" height="100%" fill="#f2f2f2"/>
      <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#c33" font-size="16">
        圖片載入失敗
      </text>
    </svg>`,
  )

// ----- 假資料（與原版一致） -----
const itemsSeed = [
  // 男裝
  {
    id: 'm-001',
    shop: '男裝館',
    name: '素色短T',
    sku: '黑 / M',
    price: 390,
    qty: 1,
    selected: true,
    img: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=600&auto=format&fit=crop&q=60',
  },
  {
    id: 'm-002',
    shop: '男裝館',
    name: '修身牛仔褲',
    sku: '深藍 / 32',
    price: 990,
    qty: 1,
    selected: false,
    img: 'https://images.unsplash.com/photo-1511193311914-0346f16efe90?w=600&auto=format&fit=crop&q=60',
  },
  // 女裝
  {
    id: 'w-001',
    shop: '女裝館',
    name: '棉質上衣',
    sku: '奶茶 / S',
    price: 520,
    qty: 1,
    selected: true,
    img: 'https://images.unsplash.com/photo-1520975922323-0e4c92758e1f?w=600&auto=format&fit=crop&q=60',
  },
  {
    id: 'w-002',
    shop: '女裝館',
    name: '百褶長裙',
    sku: '霧灰 / M',
    price: 860,
    qty: 1,
    selected: false,
    img: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&auto=format&fit=crop&q=60',
  },
  // 兒童
  {
    id: 'k-001',
    shop: '兒童館',
    name: '印花T (童)',
    sku: '亮黃 / 110',
    price: 280,
    qty: 2,
    selected: false,
    img: 'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=600&auto=format&fit=crop&q=60',
  },
]

// ----- 狀態：items（購物車）、promo（優惠券）等 -----
const state = reactive({
  items: [],
  promo: null, // { code, type: 'amount'|'percent', value: number }
})

// 優惠碼輸入與訊息
const promoInput = ref('')
const promoMsg = ref('')

// ----- 初始化：從 localStorage 載入 -----
const load = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    state.items = raw ? JSON.parse(raw) : itemsSeed.slice()
  } catch {
    state.items = itemsSeed.slice()
  }
  persist()
}

const persist = () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items))
}

// 啟動時載入
onMounted(load)

// 當 items 改變就持久化（也可只在關鍵動作時呼叫 persist()）
watch(
  () => state.items,
  () => persist(),
  { deep: true },
)

// ----- 工具：金額格式化 -----
const fmt = (n) => '$' + Number(n || 0).toFixed(2)

// ----- 依店鋪分組（物件：{ [shopName]: Item[] }） -----
const groupedByShop = computed(() => {
  return state.items.reduce((m, it) => {
    ;(m[it.shop] ||= []).push(it)
    return m
  }, {})
})

// ----- 全選（computed with getter/setter） -----
const checkAll = computed({
  get() {
    return state.items.length > 0 && state.items.every((i) => i.selected)
  },
  set(val) {
    state.items.forEach((i) => (i.selected = val))
    persist()
  },
})

// ----- 單店鋪全選/全不選 -----
const toggleShop = (shopName, checked) => {
  const group = groupedByShop.value[shopName] || []
  group.forEach((i) => (i.selected = checked))
  persist()
}

// ----- 單品操作：增減/設定數量、刪除 -----
const incQty = (it) => {
  it.qty += 1
}
const decQty = (it) => {
  it.qty = Math.max(1, it.qty - 1)
}
const setQty = (it, val) => {
  const n = parseInt(val || '1', 10)
  it.qty = Math.max(1, isNaN(n) ? 1 : n)
}
const removeItem = (id) => {
  state.items = state.items.filter((x) => x.id !== id)
}

// ----- 已選商品 & 計價 -----
const selectedItems = computed(() => state.items.filter((i) => i.selected))
const selectedCount = computed(() => selectedItems.value.length)

const subtotal = computed(() => selectedItems.value.reduce((s, i) => s + i.price * i.qty, 0))

const shipping = computed(() => (subtotal.value >= FREE_SHIP ? 0 : BASE_SHIP))

const tax = computed(() => +(subtotal.value * TAX_RATE).toFixed(2))

const discount = computed(() => {
  if (!state.promo) return 0
  if (state.promo.type === 'amount') {
    return Math.min(state.promo.value, subtotal.value)
  }
  if (state.promo.type === 'percent') {
    return +(subtotal.value * state.promo.value).toFixed(2)
  }
  return 0
})

const total = computed(() =>
  Math.max(0, subtotal.value + shipping.value + tax.value - discount.value),
)

// ----- 刪除所選 -----
const deleteSelected = () => {
  state.items = state.items.filter((i) => !i.selected)
}

// ----- 優惠碼 -----
const applyPromo = () => {
  const code = (promoInput.value || '').trim().toUpperCase()
  promoMsg.value = ''
  if (!code) {
    state.promo = null
    promoMsg.value = '請輸入優惠碼'
    return
  }
  if (code === 'SAVE100') {
    state.promo = { code, type: 'amount', value: 100 }
    promoMsg.value = '已套用：折扣 100'
  } else if (code === 'SAVE10') {
    state.promo = { code, type: 'percent', value: 0.1 }
    promoMsg.value = '已套用：九折'
  } else {
    state.promo = null
    promoMsg.value = '無效的優惠碼'
  }
}

// ----- 結帳（示範：彈窗；你也可以導向下一頁並存 sessionStorage） -----
const checkout = () => {
  if (selectedItems.value.length === 0) {
    alert('請先選擇商品')
    return
  }
  // 這裡示範簡單 alert；若要導頁，可把資料寫進 sessionStorage 再 location.href
  const lines = selectedItems.value
    .map((i) => `${i.shop}｜${i.name} x ${i.qty} = ${fmt(i.qty * i.price)}`)
    .join('\n')
  alert(`結帳明細\n\n${lines}\n\n合計：${fmt(total.value)}`)
}
</script>

<style scoped>
:root {
  --brand: #ff6b9d; /* 主色 */
  --brand-weak: #ffe1ec; /* 淡主色（hover/背景） */
  --text: #222;
  --muted: #8a8a8a;
  --border: #eaeaea;
  --bg: #fafafa;
  --card: #fff;
  --radius: 12px;
  --shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}
* {
  box-sizing: border-box;
}
html,
body {
  height: 100%;
}
body {
  margin: 0;
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
  color: var(--text);
  background: linear-gradient(#fff, #f6f6f6);
}

.container {
  max-width: 1180px;
  margin: 0 auto;
  padding: 20px;
}
.layout {
  display: grid;
  grid-template-columns: 1.6fr 0.8fr;
  gap: 20px;
}
@media (max-width: 1000px) {
  .layout {
    grid-template-columns: 1fr;
  }
}

.card {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
}
.card + .card {
  margin-top: 14px;
}

/* ===== 左側：清單 ===== */
.panel {
  padding: 12px;
}
.toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-bottom: 1px solid var(--border);
}
.toolbar .title {
  font-weight: 800;
}

.shop {
  border: 1px solid var(--border);
  border-radius: 12px;
  overflow: hidden;
  background: #fff;
}
.shop + .shop {
  margin-top: 14px;
}
.shop__head {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  background: #fff;
  border-bottom: 1px solid var(--border);
  font-weight: 700;
}
.shop__body {
  padding: 10px;
}

/* 表格型列 */
.item {
  display: grid;
  grid-template-columns: 36px 96px 1fr 110px 160px 120px 90px;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-bottom: 1px dashed var(--border);
}
.item:last-child {
  border-bottom: none;
}
.thumb {
  width: 96px;
  height: 96px;
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid var(--border);
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
  color: var(--muted);
}
.price {
  font-weight: 700;
}
.stepper {
  display: inline-flex;
  align-items: center;
  border: 1px solid var(--border);
  border-radius: 10px;
  overflow: hidden;
}
.stepper button {
  width: 32px;
  height: 34px;
  border: 0;
  background: #fff;
  cursor: pointer;
}
.stepper input {
  width: 56px;
  height: 34px;
  border: 0;
  border-left: 1px solid var(--border);
  border-right: 1px solid var(--border);
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
  color: var(--muted);
  cursor: pointer;
  text-align: left;
}
.link:hover {
  color: #d11;
}

/* 小螢幕：堆疊 */
@media (max-width: 900px) {
  .item {
    grid-template-columns: 36px 96px 1fr;
    grid-auto-rows: auto;
  }
  .price,
  .qty,
  .subtotal,
  .ops {
    justify-self: start;
  }
}

/* ===== 右側：摘要 ===== */
.summary {
  position: sticky;
  top: 16px;
  padding: 16px;
}
.summary h3 {
  margin: 6px 2px 14px;
}
.kv {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px dashed var(--border);
}
.kv:last-child {
  border-bottom: none;
}
.kv .k {
  color: var(--muted);
}
.total {
  font-size: 18px;
  font-weight: 800;
}
.btn {
  width: 100%;
  padding: 12px 14px;
  border-radius: 10px;
  border: 1px solid var(--brand);
  background: var(--brand);
  color: #fff;
  font-weight: 800;
  cursor: pointer;
  margin-top: 14px;
}
.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.promo {
  margin-top: 12px;
  border-top: 1px solid var(--border);
  padding-top: 12px;
}
.promo input {
  width: 100%;
  height: 40px;
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 0 12px;
}
.promo .apply {
  margin-top: 10px;
  background: #fff;
  color: var(--brand);
  border-color: var(--brand);
}
.promo .apply:hover {
  background: var(--brand-weak);
}

.muted {
  color: var(--muted);
}
.spacer {
  flex: 1;
}
</style>
