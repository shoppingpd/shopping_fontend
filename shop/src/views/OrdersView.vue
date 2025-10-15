<template>
  <section class="order-record">
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

const USE_MOCK = true
const orders = ref([])

onMounted(() => {
  const url = USE_MOCK ? "/testorderlist.json" : "/api/orders"
  fetch(url)
    .then(res => res.json())
    .then(data => {
      orders.value = data
    })
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

const grandTotal = computed(() => {
  let total = 0
  groupedOrders.value.forEach(items => {
    total += getOrderTotal(items)
  })
  return total
})
</script>