<template>
  <section class="order-record">
    <div id="update-status" class="status-info">{{ updateStatus }}</div>
    <div v-for="[orderId, items] in groupedOrders" :key="orderId" class="order-box">
      <div class="order-header">
        <div>訂購日期</div>
        <div>訂單編號</div>
        <div>商品名稱</div>
        <div>數量</div>
        <div>單價</div>
        <div>小計</div>
      </div>
      <div v-for="item in items" :key="item.商品名稱" class="order-row">
        <div>{{ item.訂購日期 }}</div>
        <div>{{ item.訂單編號 }}</div>
        <div>{{ item.商品名稱 }}</div>
        <div>{{ item.數量 }}</div>
        <div>NT${{ item.單價 }}</div>
        <div>NT${{ item.小計 ?? item.數量 * item.單價 }}</div>
      </div>
      <div class="order-total">
        <div class="label">訂單總金額：</div>
        <div class="amount">NT${{ getOrderTotal(items) }}</div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import '@/assets/myshop.css'

const userStore = useUserStore()
const userId = computed(() => userStore.id)
const orders = ref([])
const updateStatus = ref('')

onMounted(async () => {
  if (!userId.value || isNaN(userId.value)) {
    console.error('無法取得使用者 ID')
    return
  }

  try {
    const res = await fetch(`http://localhost:8080/list/user/${userId.value}`)
    
    //處理 404 與其他錯誤
    if (!res.ok) {
      if (res.status === 404) {
        updateStatus.value = '目前尚無訂單紀錄'
        orders.value = []
        return
      }
      throw new Error('訂單載入失敗')
    }

    const data = await res.json()
    orders.value = data
  } catch (err) {
    console.error('訂單載入失敗：', err.message)
    updateStatus.value = '訂單載入失敗'
  }
})


const groupedOrders = computed(() => {
  const map = new Map()
  orders.value.forEach(item => {
    const id = item.訂單編號
    if (!map.has(id)) map.set(id, [])
    map.get(id).push(item)
  })
  return map
})

function getOrderTotal(items) {
  return items.reduce((sum, item) => {
    const subtotal = item.小計 ?? item.數量 * item.單價
    return sum + subtotal
  }, 0)
}
</script>