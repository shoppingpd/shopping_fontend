<template>
  <div class="container">
    <div v-if="mode === 'login'">
      <h1 class="tit">會員登入</h1>
      <form @submit.prevent="login">
        <div class="inputbox">
          <label>帳號</label>
          <input v-model="loginId" placeholder="請輸入帳號" required />
        </div>
        <div class="inputbox">
          <label>密碼</label>
          <input v-model="loginPassword" type="password" placeholder="請輸入密碼" required />
        </div>

        <div class="login-actions">
          <label class="remember-label"
            ><input type="checkbox" v-model="remember" /> 記住帳號</label
          >
          <button type="submit">登入</button>
        </div>
        <div class="links">
          <a href="#" @click.prevent="switchMode('reset')">忘記密碼？</a>
          <a href="#" @click.prevent="switchMode('register')">還沒有帳號？註冊</a>
        </div>
      </form>
    </div>

    <div v-else-if="mode === 'register'">
      <h1 class="tit2">註冊帳號</h1>
      <form @submit.prevent="register">
        <div class="reg-input">
          <div class="reg-input-l">
            <label>姓名</label>
            <input v-model="registerData.姓名" placeholder="姓名" required />
            <label>地址</label>
            <input v-model="registerData.地址" placeholder="地址" required />
            <label>性別</label>
            <select
              v-model="registerData.性別"
              required
              style="height: 100%; font-size: 1.2rem; font-weight: bold; padding-left: 0.5rem"
            >
              <option value="男生">男生</option>
              <option value="女生">女生</option>
              <option value="其他" selected>其他</option>
            </select>

            <label>年齡</label>
            <input
              v-model.number="registerData.年齡"
              type="number"
              min="0"
              placeholder="年齡"
              required
            />
          </div>
          <div class="reg-input-l">
            <label>電子郵件</label>
            <input v-model="registerData.電子郵件" type="email" placeholder="電子郵件" required />
            <label>帳號</label>
            <input v-model="registerData.帳號" placeholder="帳號" required />
            <label>密碼</label>
            <input v-model="registerData.密碼" type="password" placeholder="密碼" required />
            <label>確認密碼</label>
            <input v-model="registerData.confirm" type="password" placeholder="確認密碼" required />
          </div>
        </div>

        <button class="reg-btn" type="submit">註冊</button>
        <div class="links">
          <a href="#" @click.prevent="switchMode('login')">已經有帳號？登入</a>
        </div>
      </form>
    </div>

    <div v-else>
      <h1 class="tit2">重設密碼</h1>
      <form @submit.prevent="reset">
        <div class="res-input">
          <label>帳號</label>
          <input v-model="resetId" placeholder="請輸入帳號" required />
          <label>新密碼</label>
          <input v-model="newPassword" type="password" placeholder="新密碼" required />
          <input v-model="confirmPassword" type="password" placeholder="確認新密碼" required />
        </div>
        <button type="submit" class="reg-btn">重設密碼</button>
        <div class="links">
          <a href="#" @click.prevent="switchMode('login')">返回登入</a>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
  import { ref, reactive, onMounted } from 'vue';
  import { useRouter } from 'vue-router';
  import { useUserStore } from '@/stores/user';
  const userStore = useUserStore();
  const router = useRouter();
  const mode = ref('login');
  const loginId = ref('');
  const loginPassword = ref('');
  const remember = ref(false);

  const registerData = reactive({
    name: '',
    phone: '',
    email: '',
    password: '',
    confirm: '',
  });

  const resetId = ref('');
  const newPassword = ref('');
  const confirmPassword = ref('');

  onMounted(() => {
    const saved = localStorage.getItem('rememberedAccount');
    if (saved) {
      loginId.value = saved;
      remember.value = true;
    }
  });
  const data = ref();
  async function login() {
    if (remember.value) localStorage.setItem('rememberedAccount', loginId.value);
    else localStorage.removeItem('rememberedAccount');
    const item = {
      帳號: loginId.value,
      密碼: loginPassword.value,
    };
    try {
      const res = await fetch('http://localhost:8080/user/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }, // ⚠️ 記得加 header
        body: JSON.stringify(item),
      });
      console.log(item);

      data.value = await res.json();
    } catch (err) {
      console.error('錯誤：', err);
    }

    if (data.value >= 0) {
      userStore.setUser({ id: data.value });
      router.push({ name: 'home' });
    } else {
      alert('帳號或密碼錯誤，請在試一次或按下忘記密碼');
    }
    // alert(data.value);
  }

  async function register() {
    if (registerData.密碼 !== registerData.confirm) return alert('密碼不一致');
    try {
      const res = await fetch('http://localhost:8080/user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }, // ⚠️ 記得加 header
        body: JSON.stringify(registerData),
      });
      console.log(registerData);

      data.value = await res.json();
    } catch (err) {
      console.error('錯誤：', err);
    }
    if (!data.value) return alert('帳號已存在`，請重更換帳號');
    alert(`註冊成功，歡迎 ${registerData.姓名}`);
    mode.value = 'login';
  }

  async function reset() {
    if (newPassword.value !== confirmPassword.value) return alert('密碼不一致');
    const item = {
      帳號: resetId.value,
      密碼: newPassword.value,
    };
    try {
      const res = await fetch('http://localhost:8080/user/changepsd', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }, // ⚠️ 記得加 header
        body: JSON.stringify(item),
      });
      console.log(item);

      data.value = await res.json();
    } catch (err) {
      console.error('錯誤：', err);
    }
    if (!data.value) return alert('帳號或密碼錯誤，請在試一次或按下忘記密碼');
    alert('密碼已重設，請重新登入');
    mode.value = 'login';
  }

  const clearLoginFields = () => {
    loginPassword.value = '';
    if (!remember.value) loginId.value = '';
  };

  const clearRegisterFields = () => {
    registerData.姓名 = '';
    registerData.性別 = '';
    registerData.年齡 = '';
    registerData.地址 = '';
    registerData.帳號 = '';
    registerData.密碼 = '';
    registerData.電子郵件 = '';
  };

  const clearResetFields = () => {
    resetId.value = '';
    newPassword.value = '';
    confirmPassword.value = '';
  };

  const switchMode = (newMode) => {
    mode.value = newMode;

    if (newMode === 'login') clearLoginFields();
    else if (newMode === 'register') clearRegisterFields();
    else if (newMode === 'reset') clearResetFields();
  };
</script>

<style scoped>
  .container {
    width: 50%;
    margin: 3rem auto 0;
    padding: 1.5rem 2rem 0rem 1.5rem;
    background: var(--c-background-mute);
    border: 1px solid var(--c-border);
    border-radius: 12px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
    transition: box-shadow 0.3s;
  }
  .container:hover {
    box-shadow: 0 6px 14px rgba(0, 0, 0, 0.1);
  }

  .container .tit {
    color: var(--c-heading);
    text-align: center;
    margin-bottom: 0.5rem;
    font-size: 2.8rem;
    font-weight: bold;
  }
  .container .tit2 {
    color: var(--c-heading);
    text-align: center;
    padding: 0 auto;
    font-size: 2.8rem;
    font-weight: bold;
  }

  form {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  label {
    font-weight: 500;
    color: var(--c-text);
    font-size: 1.5rem;
    font-weight: 800;
  }

  input {
    padding: 10px 12px;
    border: 1px solid var(--c-border);
    border-radius: 6px;
    background: var(--c-background);
    color: var(--c-text);
    outline: none;
    font-size: 1.2rem;
    transition:
      border-color 0.3s,
      box-shadow 0.3s;
  }

  input:focus {
    border-color: var(--c-primary);
    box-shadow: 0 0 5px rgba(148, 57, 15, 0.3);
  }
  input[type='checkbox'] {
    transform: scale(1.5); /* 放大 1.5 倍 */
    cursor: pointer; /* 滑鼠變成可點擊手勢 */
    margin-right: 0.5rem; /* 與文字保持距離 */
  }
  button {
    background: var(--c-primary);
    color: #fff;
    border: none;
    padding: 2%;
    border-radius: 6px;
    cursor: pointer;
    font-weight: bold;
    transition:
      background-color 0.3s,
      transform 0.2s;
  }

  button:hover {
    background: var(--c-hover);
    transform: translateY(-2px);
  }

  .login-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.9rem;
    margin: 1.5rem 0;
  }
  .login-actions button {
    font-size: 1.8rem;
    font-weight: 1200;
    width: 25%;
  }
  .links {
    width: 100%;
  }
  a {
    font-size: 1.25rem;
    font-weight: 800;
    color: var(--c-primary);
    text-align: center;
    display: block;
    margin-top: 10px;
    transition: color 0.3s;
    width: 25%;
    margin: 3% auto; /* 上 10px，左右自動置中 */
  }

  a:hover {
    color: var(--c-hover);
  }
  .inputbox {
    display: flex;
    flex-direction: column;
    margin-top: 2.5%;
  }
  .inputbox input {
    width: 100%;
    margin-top: 1%;
  }
  .remember-label {
    display: flex;
    align-items: center; /* 垂直置中對齊 */
    gap: 6px; /* 調整 checkbox 和文字間距 */
    cursor: pointer;
    font-size: 1.3rem;
  }
  .reg-input {
    display: flex;
    flex-direction: row;
    padding: 0 2.5%;
    width: 100%;
    gap: 5%;
  }
  .reg-input label {
    margin: 2% 0;
  }
  .reg-input input {
    font-weight: bold;
    font-size: 1.2rem;
  }
  .reg-input-l {
    display: flex;
    flex-direction: column;
    margin: 2.5% 0 2.5% 0;
    flex: 1;
  }
  .reg-btn {
    width: 50%;
    margin: 0 auto;
    font-size: 2rem;
  }
  .res-input {
    display: flex;
    flex-direction: column;
    padding: 0 2.5%;
    margin-bottom: 5%;
    width: 100%;
  }
  .res-input label {
    margin: 3% 0 0 0;
    font-size: 2rem;
  }
  .res-input input {
    margin-top: 2%;
    font-size: 1.75rem;
  }
</style>
