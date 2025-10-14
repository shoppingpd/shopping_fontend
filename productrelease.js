// 等待整個 HTML 文件載入完成後才執行程式碼
document.addEventListener("DOMContentLoaded", () => {

  // 取得商品圖片上傳欄位的 input 元素
  const imageInput = document.getElementById("product-image");

  // 取得圖片預覽用的 img 元素
  const preview = document.getElementById("preview-image");

  // 取得整個商品表單的 form 元素
  const form = document.getElementById("product-form");

  // 當使用者選擇圖片時，執行預覽邏輯
  imageInput.addEventListener("change", () => {
    // 取得使用者選擇的第一個檔案
    const file = imageInput.files[0];

    // 如果有選擇檔案，且檔案類型是圖片
    if (file && file.type.startsWith("image/")) {
      // 建立 FileReader 物件，用來讀取檔案內容
      const reader = new FileReader();

      // 當檔案讀取完成後，將圖片顯示在預覽區塊
      reader.onload = e => {
        preview.src = e.target.result;        // 設定 img 的來源為讀取結果
        preview.style.display = "block";      // 顯示預覽圖片
      };

      // 將圖片檔案轉成 base64 資料格式
      reader.readAsDataURL(file);
    } else {
      // 如果未選擇圖片或檔案格式錯誤，清除預覽區塊
      preview.src = "";
      preview.style.display = "none";
    }
  });

  // 當使用者點擊「資料清除」按鈕時，清除預覽圖片
  form.addEventListener("reset", () => {
    preview.src = "";                         // 清空 img 的來源
    preview.style.display = "none";           // 隱藏預覽圖片
  });

});