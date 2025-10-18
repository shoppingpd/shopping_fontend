<template>
  <section class="user-info">
  <div class="form-row"><h1>會員資料</h1></div>
    <div class="form-row"><label>帳號：</label><span>{{ user.帳號 }}</span></div>
    <div class="form-row"><label>姓名：</label><span>{{ user.姓名 }}</span></div>
    <div class="form-row"><label>性別：</label><span>{{ user.性別 }}</span></div>
    <div class="form-row"><label>年齡：</label><span>{{ user.年齡 }}</span></div>
    <div class="form-row"><label>電子郵件：</label><span>{{ user.電子郵件 }}</span></div>
    <div class="form-row"><label>地址：</label><span class="form-value">{{ user.地址 }}</span></div>
    <div class="form-row"><label class="invisible-label">變更地址：</label>
      <div class="address-wrapper"><input v-model="newAddress" type="text" placeholder="請輸入新地址" />
        <button @click="updateAddress">確認變更</button>
      </div>
    </div>

<div class="form-row"><h1>變更密碼</h1></div>
    <div class="form-row">
      <label>新密碼：</label>
      <div class="password-wrapper">
      <input :type="showPassword ? 'text' : 'password'" v-model="newPassword" id="new-password" placeholder="請輸入新密碼"/>
      <button @click="togglePassword">{{ showPassword ? '隱藏' : '顯示' }}</button>
      <button @click="updatePassword">確認變更</button>
      </div>
    </div>
    <div id="update-status">{{ updateStatus }}</div>
  </section>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useUserStore } from '@/stores/user'
import '@/assets/newmembercenter.css'

const userStore = useUserStore()
const user = ref({})
const newAddress = ref('')
const newPassword = ref('')
const showPassword = ref(false)
const updateStatus = ref('')

// 直接從 Pinia 拿 userId
const userId = computed(() => userStore.id)

// 載入使用者資料
async function fetchUserProfile() {
  if (!userId.value || isNaN(userId.value)) {
    updateStatus.value = '無法取得使用者 ID'
    console.error('userStore.id 無效或不存在')
    return
  }

  try {
    const res = await fetch(`http://localhost:8080/user/${userId.value}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    })
    if (!res.ok) throw new Error('載入失敗')
    user.value = await res.json()
  } catch (err) {
    console.error('使用者資料載入失敗：', err.message)
    updateStatus.value = '載入失敗'
  }
}

// 通用更新函式
async function updateUserField(field, value) {
  if (!userId.value || isNaN(userId.value)) {
    updateStatus.value = '無法取得使用者 ID'
    return
  }

  const updated = { ...user.value, [field]: value }
  const res = await fetch(`http://localhost:8080/user/${userId.value}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updated)
  })
  if (!res.ok) {
    updateStatus.value = `${field} 更新失敗`
    return
  }
  updateStatus.value = `${field} 更新成功`
  //清空對應欄位值
  if (field === '地址') newAddress.value = ''
  if (field === '密碼') newPassword.value = ''
  await fetchUserProfile()
}

// 個別更新函式
function updateAddress() {
  if (!newAddress.value) {
    updateStatus.value = '請輸入新地址'
    return
  }
  updateUserField('地址', newAddress.value)
}

function updatePassword() {
  if (!newPassword.value) {
    updateStatus.value = '請輸入新密碼'
    return
  }
  updateUserField('密碼', newPassword.value)
}

function togglePassword() {
  showPassword.value = !showPassword.value
}

// 初始化載入
onMounted(() => {
  fetchUserProfile()
})
</script>