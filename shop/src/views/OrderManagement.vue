<template>
  <section class="order-management">
    <main class="main">
      <div class="container">
        <section class="panel card">
          <template v-if="loading">
            <p>載入中...</p>
          </template>
          <template v-else-if="orders.length === 0">
            <div>尚無訂單資料</div>
          </template>
          <template v-else>
            <div v-for="order in orders" :key="order.訂單編號" class="item">
              <!-- 訂單基本資料 -->
              <div class="original">
                <div class="field"><span class="value">訂單編號：</span><span class="value">{{ order.訂單編號 }}</span></div>
                <div class="field"><span class="value">建立時間：</span><span class="value">{{ order.建立時間 }}</span></div>
                <div class="field"><span class="value">總金額：</span><span class="value">NT${{ order.總金額 }}</span></div>
                <div class="field"><span class="value">配送地址：</span><span class="value">{{ order.配送地址 }}</span></div>
              </div>

              <!-- 商品明細列表（標題列 + 資料列） -->
              <div class="details">
                <!-- 標題列 -->
                <div class="field header">
                  <span class="value">商品名稱</span>
                  <span class="value">顏色</span>
                  <span class="value">尺寸</span>
                  <span class="value">數量</span>
                  <span class="value">單價</span>
                  <span class="value">小計</span>
                </div>

                <!-- 資料列 -->
                <div class="field" v-for="item in order.items" :key="item.明細編號">
                  <span class="value">{{ item.商品名稱 }}</span>
                  <span class="value">{{ item.顏色 }}</span>
                  <span class="value">{{ item.尺寸 }}</span>
                  <span class="value">{{ item.數量 }}</span>
                  <span class="value">{{ item.單價 }}</span>
                  <span class="value">{{ item.數量 * item.單價 }}</span>
                </div>
              </div>

              <!-- 狀態選單 -->
              <div class="field">
                <span class="value">訂單狀態：</span>
                <select v-model="order.狀態" @change="updateStatus(order.訂單編號, order.狀態)">
                  <option value="進行中">進行中</option>
                  <option value="取消">取消</option>
                  <option value="完成">完成</option>
                </select>
              </div>
            </div>
          </template>
        </section>
      </div>
    </main>
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const USE_MOCK = true
const loading = ref(true)
const rawRows = ref([])

onMounted(() => {
  const url = USE_MOCK ? '/testordermanagement.json' : '/api/orders-with-details'
  fetch(url)
    .then(res => res.json())
    .then(data => {
      rawRows.value = data
      loading.value = false
    })
    .catch(err => {
      console.error('載入失敗', err)
      loading.value = false
    })
})

const orders = computed(() => {
  if (!Array.isArray(rawRows.value)) return []
  const map = new Map()
  rawRows.value.forEach(row => {
    const id = row.訂單編號
    if (!map.has(id)) {
      map.set(id, {
        訂單編號: row.訂單編號,
        使用者編號: row.使用者編號,
        總金額: row.總金額,
        狀態: row.狀態 || '進行中',
        建立時間: row.建立時間,
        配送地址: row.配送地址,
        items: []
      })
    }
    map.get(id).items.push({
      明細編號: row.明細編號,
      商品編號: row.商品編號,
      商品名稱: row.商品名稱,
      顏色: row.顏色,
      尺寸: row.尺寸,
      數量: row.數量,
      單價: row.單價
    })
  })
  return Array.from(map.values())
})

function updateStatus(orderId, newStatus) {
  console.log('更新訂單狀態', orderId, newStatus)
  // 可串接 API 更新狀態
}
</script>