<template>
  <section class="user-info">
    <div class="form-row"><label>帳號：</label><span>{{ user.帳號 }}</span></div>
    <div class="form-row"><label>姓名：</label><span>{{ user.姓名 }}</span></div>
    <div class="form-row"><label>性別：</label><span>{{ user.性別 }}</span></div>
    <div class="form-row"><label>年齡：</label><span>{{ user.年齡 }}</span></div>
    <div class="form-row"><label>地址：</label><span>{{ user.地址 }}</span></div>
    <div class="form-row"><label>電子郵件：</label><span>{{ user.電子郵件 }}</span></div>

    <div class="form-row">
      <label>新密碼：</label>
      <input :type="showPassword ? 'text' : 'password'" v-model="newPassword" id="new-password" />
      <button @click="togglePassword">{{ showPassword ? '隱藏' : '顯示' }}</button>
    </div>
    <button @click="updatePassword">更新密碼</button>
    <div id="update-status">{{ updateStatus }}</div>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const USE_MOCK = true
const user = ref({})
const newPassword = ref("")
const showPassword = ref(false)
const updateStatus = ref("")

onMounted(() => {
  const url = USE_MOCK ? "testprofile.json" : "/api/user-info"
  fetch(url)
    .then(res => res.json())
    .then(data => {
      user.value = data
    })
})

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