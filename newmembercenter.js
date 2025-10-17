//控制是否使用測試資料（true = 使用 mock JSON，false = 呼叫 API）
const USE_MOCK = true

//當網頁載入完成時，預設顯示「個人資料」區塊
document.addEventListener("DOMContentLoaded", () => {
  showSection("profile") // 預設載入 profile 區塊
})

//根據選單點擊的 sectionId，載入對應的 HTML 區塊並初始化功能
function showSection(sectionId) {
  const contentArea = document.getElementById("content-area") // 取得右側內容容器
  let url = "" // 初始化 HTML 路徑變數

  //根據 sectionId 決定要載入哪個 HTML 檔案
  if (sectionId === "profile") {
    url = "memberdataupdate.html" // 個人資料頁
  } else if (sectionId === "orders") {
    url = "memberorderlist.html" // 訂單紀錄頁
  }

  //載入 HTML 內容並插入到右側容器
  fetch(url)
    .then(res => res.text()) // 將回傳的 HTML 轉成文字
    .then(html => {
      contentArea.innerHTML = html // 將 HTML 插入到 content 區塊

      //如果是個人資料頁，載入會員資料並綁定密碼功能
      if (sectionId === "profile") {
        loadUserInfo()         // 載入會員資料（API 或 mock）
        bindPasswordToggle()   // 綁定密碼顯示/隱藏按鈕
        bindPasswordUpdate()   // 綁定密碼更新按鈕
      }

      //如果是訂單紀錄頁，載入訂單資料
      if (sectionId === "orders") {
        loadOrders() // 載入訂單資料（API 或 mock）
      }
    })
    .catch(err => {
      //如果 HTML 載入失敗，顯示錯誤訊息
      contentArea.innerHTML = "<p>載入失敗。</p>"
      console.error("載入錯誤:", err)
    })

  //清除所有選單的高亮樣式
  document.querySelectorAll(".sidebar-link").forEach(link =>
    link.classList.remove("active")
  )

  //將目前選中的選單項目加上高亮樣式
  document
    .querySelector(`.sidebar-link[onclick*="${sectionId}"]`)
    ?.classList.add("active")
}

//載入個人資料
function loadUserInfo() {
  const url = USE_MOCK ? "testprofile.json" : "/api/user-info"

  fetch(url)
    .then(res => res.json())
    .then(data => {
      document.getElementById("user-account").textContent = data.帳號
      document.getElementById("user-name").textContent = data.姓名
      document.getElementById("user-gender").textContent = data.性別
      document.getElementById("user-age").textContent = data.年齡
      document.getElementById("user-address").textContent = data.地址
      document.getElementById("user-email").textContent = data.電子郵件
    })
    .catch(err => console.error("個人資料載入失敗:", err))
}

//密碼切換
function bindPasswordToggle() {
  const toggleBtn = document.getElementById("toggle-password")
  const input = document.getElementById("new-password")
  if (toggleBtn && input) {
    toggleBtn.addEventListener("click", () => {
      const isHidden = input.type === "password"
      input.type = isHidden ? "text" : "password"
      toggleBtn.textContent = isHidden ? "隱藏" : "顯示"
    })
  }
}

//密碼更新
function bindPasswordUpdate() {
  const updateBtn = document.getElementById("update-password-btn")
  if (updateBtn) {
    updateBtn.addEventListener("click", () => {
      const newPassword = document.getElementById("new-password").value
      if (!newPassword) {
        document.getElementById("update-status").textContent = "請輸入新密碼"
        return
      }

      fetch("/api/update-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 密碼: newPassword })
      })
        .then(res => res.json())
        .then(result => {
          document.getElementById("update-status").textContent = result.message
        })
        .catch(err => {
          document.getElementById("update-status").textContent = "更新失敗"
          console.error("密碼更新錯誤:", err)
        })
    })
  }
}

//載入訂單資料
function loadOrders() {
  const url = USE_MOCK ? "testorderlist.json" : "/api/orders"
  fetch(url)
    .then(res => res.json())
    .then(data => {
      const grouped = groupByOrderId(data)
      renderOrders(grouped)
    })
    .catch(err => {
      console.error("訂單載入失敗:", err)
    })
}

//依訂單編號分組
function groupByOrderId(data) {
  const map = new Map()
  data.forEach(item => {
    const id = item.訂單編號
    if (!map.has(id)) map.set(id, [])
    map.get(id).push(item)
  })
  return map
}

//渲染訂單紀錄
function renderOrders(groupedOrders) {
  const container = document.getElementById("order-body")
  container.innerHTML = ""

  let grandTotal = 0

  groupedOrders.forEach((items, orderId) => {
    const orderBox = document.createElement("div")
    orderBox.className = "order-box"

    let orderTotal = 0
    const rows = items.map(item => {
      const subtotal = item.小計 ?? item.數量 * item.單價
      orderTotal += subtotal
      return `
        <div class="order-row">
          <div>${item.訂購日期}</div>
          <div>${item.訂單編號}</div>
          <div>${item.商品名稱}</div>
          <div>${item.數量}</div>
          <div>NT$${item.單價}</div>
          <div>NT$${subtotal}</div>
        </div>
      `
    }).join("")

    grandTotal += orderTotal

    //由訂單編號列印出消費紀錄
    orderBox.innerHTML = `
      <div class="order-header">
        <div>訂購日期</div>
        <div>訂單編號</div>
        <div>商品名稱</div>
        <div>數量</div>
        <div>單價</div>
        <div>小計</div>
      </div>
      ${rows}
      <div class="order-total">
        <div class="label">訂單總金額：</div>
        <div class="amount">NT$${orderTotal}</div>
      </div>
    `
    container.appendChild(orderBox)
  })

  document.getElementById("order-total-amount").textContent = `NT$${grandTotal}`
}