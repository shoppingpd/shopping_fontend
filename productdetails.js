/* 商品頁 JS */
// 儲存從後端 API 取得的圖片 URL 陣列
let images = [];
let currentIndex = 0; // 目前顯示的圖片索引，用於輪播切換

// 根據商品 ID 向後端 API 載入商品資料（包含圖片、名稱、顏色、尺寸、售價）
async function loadProductData() {
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get("id");

  // 若未提供商品 ID，載入預設測試資料
  if (!productId) {
    console.warn("未提供商品 ID，載入預設測試資料");

    document.getElementById("product-name").textContent = "測試商品";
    document.getElementById("product-price").textContent = "299 元";
    images = ["images/fallback.jpg"];
    updateImage();
    loadOptions(["黑", "白"], ["TEST A", "TEST B"]);
    updateSelectionSummary();
    return;
  }

  // 向後端請求商品資料
  try {
    const response = await fetch(`/api/product/${productId}`);
    const data = await response.json();

    // 載入圖片陣列
    images = data.images || [];
    if (images.length > 0) {
      updateImage();
    }

    // 載入商品名稱
    if (data.name) {
      document.getElementById("product-name").textContent = data.name;
    }

    // 載入售價並加上單位
    if (data.price !== undefined) {
      document.getElementById("product-price").textContent = `${data.price} 元`;
    }

    // 載入顏色與尺寸選項
    loadOptions(data.colors, data.sizes);
    updateSelectionSummary();

  } catch (error) {
    console.error("商品資料載入失敗：", error);

    // 載入預設測試資料
    document.getElementById("product-name").textContent = "測試商品";
    document.getElementById("product-price").textContent = "299 元";
    images = ["images/fallback.jpg"];
    updateImage();
    loadOptions(["黑", "白"], ["TEST A", "TEST B"]);
    updateSelectionSummary();
  }
}

// 顯示目前索引的圖片
function updateImage() {
  document.getElementById("product-image").src = images[currentIndex];
}

// 輪播：切換到上一張圖片
function prevImage() {
  currentIndex = (currentIndex - 1 + images.length) % images.length;
  updateImage();
}

// 輪播：切換到下一張圖片
function nextImage() {
  currentIndex = (currentIndex + 1) % images.length;
  updateImage();
}

// 更新已選摘要與總金額
function updateSelectionSummary() {
  const color = document.querySelector('input[name="color"]:checked')?.value || '未選顏色';
  const size = document.querySelector('input[name="size"]:checked')?.value || '未選尺寸';
  const quantity = parseInt(document.getElementById("quantity")?.value || '0', 10);

  // 取得售價文字並轉為數字（移除非數字字元），若無資料則使用預設金額 299
  const priceText = document.getElementById("product-price")?.textContent || "";
  const parsed = parseInt(priceText.replace(/[^\d]/g, ""), 10);
  const price = isNaN(parsed) ? 299 : parsed;

  // 更新選項摘要
  const summary = `已選：${color} / ${size} / 數量：${quantity}`;
  document.getElementById("selection-summary").textContent = summary;

  // 計算總金額並更新顯示（整數格式）
  const total = price * quantity;
  document.getElementById("total-amount").textContent = `${total} 元`;
}

// 動態生成顏色與尺寸選項
function loadOptions(colors, sizes) {
  const colorContainer = document.querySelector('.color-options');
  const sizeContainer = document.querySelector('.size-options');

  // 清空原有選項
  colorContainer.innerHTML = '';
  sizeContainer.innerHTML = '';

  // 生成顏色選項（色塊）
  colors.forEach((color, index) => {
    const input = document.createElement('input');
    input.type = 'radio';
    input.name = 'color';
    input.value = color;
    input.id = `color-${index}`;

    const label = document.createElement('label');
    label.className = 'option-box';
    label.setAttribute('for', input.id);
    label.style.backgroundColor = color === '白色' ? 'white' : color;
    if (color === '白色') label.style.border = '1px solid #000';

    label.appendChild(input);
    colorContainer.appendChild(label);
  });

  // 生成尺寸選項（文字按鈕）
  sizes.forEach((size, index) => {
    const input = document.createElement('input');
    input.type = 'radio';
    input.name = 'size';
    input.value = size;
    input.id = `size-${index}`;

    const label = document.createElement('label');
    label.className = 'option-box text-option';
    label.setAttribute('for', input.id);
    label.textContent = size;

    label.appendChild(input);
    sizeContainer.appendChild(label);
  });

  // 加入顏色選項監聽事件
  document.querySelectorAll('input[name="color"]').forEach(input => {
    input.addEventListener('change', updateSelectionSummary);
  });

  // 加入尺寸選項監聽事件
  document.querySelectorAll('input[name="size"]').forEach(input => {
    input.addEventListener('change', updateSelectionSummary);
  });
}

// 數量增加按鈕邏輯
function increaseQty() {
  const qtyInput = document.getElementById("quantity");
  const colorSelected = document.querySelector('input[name="color"]:checked');
  const sizeSelected = document.querySelector('input[name="size"]:checked');

  // 未選擇顏色或尺寸時提醒
  if (!colorSelected || !sizeSelected) {
    alert("請先選擇顏色與尺寸");
    return;
  }

  let current = parseInt(qtyInput.value, 10);
  if (current >= 10) {
    alert("大量訂購請洽店鋪專線由專人為您服務");
    return;
  }

  qtyInput.value = current + 1;
  updateSelectionSummary();
}

// 數量減少按鈕邏輯
function decreaseQty() {
  const qtyInput = document.getElementById("quantity");
  qtyInput.value = Math.max(0, parseInt(qtyInput.value, 10) - 1);
  updateSelectionSummary();
}

// 初始化：頁面載入時執行
document.addEventListener("DOMContentLoaded", () => {
  loadProductData();
});