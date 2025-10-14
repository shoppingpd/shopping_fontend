//定義一個簡化版的 DOM 選取函式 $，用來在指定的元素範圍內（預設是整個 document）選取第一個符合 CSS 選擇器的元素。
const $ = (selector, el = document) => el.querySelector(selector);

//定義一個簡化版的 DOM 多元素選取函式 $$，用來在指定的元素範圍內（預設是整個 document）選取所有符合 CSS 選擇器的元素，並轉換成可操作的陣列。
const $$ = (selector, el = document) => Array.from(el.querySelectorAll(selector));

// ===== 狀態管理物件：儲存商品資料並提供載入方法 =====
const state = {
  items: [], // 儲存從 API 拿到的商品陣列

  // 從後端 API 載入商品資料
  async load() {
    const res = await fetch("testupdate.json"); // 測試資料->改成API發送 GET 請求即可取得使用者商品資料
    this.items = await res.json(); // 將回傳的 JSON 資料存入 items
    render(); // 呼叫渲染函式，顯示商品清單
  }
};


// ===== 渲染商品清單主體 =====
function render() {
  const wrap = document.getElementById("productList"); // 取得商品清單容器
  wrap.innerHTML = ""; // 清空原本內容
  state.items.forEach(product => {
    wrap.appendChild(renderRow(product)); // 對每筆商品呼叫 renderRow 並加入容器
  });
}


// ===== 渲染單筆商品列（含圖片與欄位） =====
function renderRow(product) {
  const row = document.createElement("div"); // 建立一個 div 作為商品列
  row.className = "item"; // 套用樣式類別
  row.dataset.id = product.id; // 將商品 ID 存入 data 屬性，供後續操作使用

  // 設定商品列的 HTML 結構：圖片區塊 + 原始資料欄 + 編輯欄位欄
  row.innerHTML = `
    <div class="thumb"> <!-- 商品圖片區塊 -->
      <img src="${product.image}" class="preview" onerror="this.src='images/placeholder.png'"> <!-- 顯示商品圖片，若載入失敗則顯示預設圖 -->
      <div class="ops"> <!-- 圖片操作按鈕區塊 -->
        <input type="file" class="upload-image" accept="image/*"> <!-- 圖片上傳欄位 -->
        <button class="link btn-upload">上傳</button> <!-- 上傳圖片按鈕 -->
        <button class="link btn-delete-image">刪除</button> <!-- 刪除圖片按鈕 -->
      </div>
    </div>

    <div class="original"> <!-- 商品原始資料欄 -->
      ${renderOriginal("name", product.name)}         <!-- 商品名稱 -->
      ${renderOriginal("description", product.description)} <!-- 商品描述 -->
      ${renderOriginal("color", product.color)}       <!-- 商品顏色 -->
      ${renderOriginal("size", product.size)}         <!-- 商品尺寸 -->
      ${renderOriginal("price", product.price)}       <!-- 商品價格 -->
      ${renderOriginal("stock", product.stock)}       <!-- 商品庫存 -->
    </div>

    <div class="editor"> <!-- 商品編輯欄位欄 -->
      ${renderEditor("name")}         <!-- 編輯商品名稱 -->
      ${renderEditor("description")}  <!-- 編輯商品描述 -->
      ${renderEditor("color")}        <!-- 編輯商品顏色 -->
      ${renderEditor("size")}         <!-- 編輯商品尺寸 -->
      ${renderEditor("price")}        <!-- 編輯商品價格 -->
      ${renderEditor("stock")}        <!-- 編輯商品庫存 -->
    </div>
  `;

  bindRowEvents(row); // 綁定該商品列的所有互動事件（上傳、刪除、欄位更新）
  return row;         // 回傳渲染完成的 DOM 元素給 render() 使用
}

// ===== 渲染原始資料欄位（名稱、描述、顏色等） =====
function renderOriginal(field, value) {
  return `
    <div class="field"> <!-- 單一欄位容器 -->
      <span class="value ${field}">${value}</span> <!-- 顯示原始值，套用欄位名稱作為類別 -->
    </div>
  `;
}

//===== 渲染修改欄位（名稱、描述、顏色等） =====
function renderEditor(field) {
  return `
    <div class="field"> <!-- 單一欄位容器 -->
      <input type="${field === 'price' || field === 'stock' ? 'number' : 'text'}"
             class="edit-${field}" placeholder="修改${field}" /> <!-- 編輯輸入框，根據欄位類型選擇輸入型態 -->
      <button class="link btn-update-${field}">修改</button> <!-- 修改按鈕，綁定事件用 -->
    </div>
  `;
}

// ===== 綁定商品列的所有互動事件（圖片與欄位） =====
function bindRowEvents(row) {
  const id = row.dataset.id; // 取得該列的商品 ID

  // === 圖片上傳事件 ===
  $(".btn-upload", row).addEventListener("click", async () => {
    const file = $(".upload-image", row).files[0]; // 取得使用者選擇的圖片檔案
    if (!file) return alert("請選擇圖片"); // 若未選擇則提示

    const formData = new FormData(); // 建立 FormData 物件
    formData.append("image", file); // 將圖片加入表單資料

    // 發送 PUT 請求更新圖片
    const res = await fetch(`/api/products/${id}/image`, { method: "PUT", body: formData });
    if (res.ok) {
      const data = await res.json(); // 取得回傳的新圖片 URL
      $(".preview", row).src = data.imageUrl; // 更新預覽圖片
      alert("圖片已更新"); // 顯示成功提示
    }
  });

  // === 圖片刪除事件 ===
  $(".btn-delete-image", row).addEventListener("click", async () => {
    const res = await fetch(`/api/products/${id}/image`, { method: "DELETE" }); // 發送 DELETE 請求
    if (res.ok) {
      $(".preview", row).src = "images/placeholder.png"; // 將圖片改為預設佔位圖
      alert("圖片已刪除"); // 顯示成功提示
    }
  });

  // === 欄位更新事件（名稱、描述、顏色、尺寸、價格、庫存） ===
  ["name", "description", "color", "size", "price", "stock"].forEach(field => {
    $(`.btn-update-${field}`, row).addEventListener("click", async () => {
      const newValue = $(`.edit-${field}`, row).value.trim(); // 取得使用者輸入的新值
      if (!newValue) return alert("請輸入新值"); // 若未輸入則提示

      // 發送 PUT 請求更新該欄位資料
      const res = await fetch(`/api/products/${id}/${field}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: newValue }) // 將新值包裝成 JSON 傳送
      });

      if (res.ok) {
        $(`.${field}`, row).textContent = newValue; // 更新畫面上的原始值
        alert(`${field} 已更新`); // 顯示成功提示
      }
    });
  });
}

// ===== 頁面載入完成後執行：載入商品資料並渲染清單 =====
document.addEventListener("DOMContentLoaded", () => {
  state.load(); // 呼叫 state.load() 從 API 載入商品資料
});