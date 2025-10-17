<template>
  <section class="user-info">
  <div class="form-row"><h1>會員資料</h1></div>
    <div class="form-row"><label>帳號：</label><span>{{ user.帳號 }}</span></div>
    <div class="form-row"><label>姓名：</label><span>{{ user.姓名 }}</span></div>
    <div class="form-row"><label>性別：</label><span>{{ user.性別 }}</span></div>
    <div class="form-row"><label>年齡：</label><span>{{ user.年齡 }}</span></div>
    <div class="form-row"><label>電子郵件：</label><span>{{ user.電子郵件 }}</span>
    <div class="form-row">
      <label>地址：</label>
      <span class="form-value">{{ user.地址 }}</span>
      <label>變更地址：</label>
      <div class="address-wrapper">
        <input v-model="newAddress" type="text" placeholder="請輸入新地址" />
        <button @click="updateAddress">確認變更</button>
      </div>
    </div>

    </div>
<div class="form-row"><h1>變更密碼</h1></div>
    <div class="form-row">
      <label>新密碼：</label>
      <div class="password-wrapper">
      <input :type="showPassword ? 'text' : 'password'" v-model="newPassword" id="new-password" />
      <button @click="togglePassword">{{ showPassword ? '隱藏' : '顯示' }}</button>
      <button @click="updatePassword">確認變更</button>
      </div>
    </div>
    <div id="update-status">{{ updateStatus }}</div>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import '@/assets/newmembercenter.css'

const USE_MOCK = true
const user = ref({})
const newPassword = ref("")
const showPassword = ref(false)
const updateStatus = ref("")

onMounted(() => {
  const url = USE_MOCK ? "/testprofile.json" : "/api/user-info"
  fetch(url)
    .then(res => res.json())
    .then(data => {
      user.value = data
    })
})

const newEmail = ref("")
const newAddress = ref("")

function updateEmail() {
  if (!newEmail.value) {
    updateStatus.value = "請輸入新 Email"
    return
  }
  fetch("/api/update-email", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: newEmail.value })
  })
    .then(res => res.json())
    .then(result => {
      updateStatus.value = result.message
      user.value.電子郵件 = newEmail.value
    })
    .catch(() => {
      updateStatus.value = "Email 更新失敗"
    })
}

function updateAddress() {
  if (!newAddress.value) {
    updateStatus.value = "請輸入新地址"
    return
  }
  fetch("/api/update-address", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ address: newAddress.value })
  })
    .then(res => res.json())
    .then(result => {
      updateStatus.value = result.message
      user.value.地址 = newAddress.value
    })
    .catch(() => {
      updateStatus.value = "地址更新失敗"
    })
}

function togglePassword() {
  showPassword.value = !showPassword.value
}

function updatePassword() {
  if (!newPassword.value) {
    updateStatus.value = "請輸入新密碼"
    return
  }

  fetch("/api/update-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ 密碼: newPassword.value })
  })
    .then(res => res.json())
    .then(result => {
      updateStatus.value = result.message
    })
    .catch(() => {
      updateStatus.value = "更新失敗"
    })
}
</script>
