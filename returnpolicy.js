// 等待整個 HTML 文件載入完成後才執行程式碼
document.addEventListener("DOMContentLoaded", () => {

  // 使用 fetch API 讀取 deliveryterms.txt 純文字檔案
  fetch("returnpolicy.txt") // .txt 檔案名稱
    .then(res => res.text()) // 將回應轉成純文字格式
    .then(text => {

      // 取得 HTML 中 id 為 shipping-content 的容器元素
      const container = document.getElementById("returnpolicy");

      // 將整段文字依照換行符號分割成陣列，每一行為一個元素
      const lines = text.split("\n");

      // 檢視每一行文字
      lines.forEach(line => {
        if (line.startsWith("►")) {
            const h2 = document.createElement("h2"); // 建立 <h2> 標題元素
            h2.textContent = line.trim(); // 保留 ► 符號
            container.appendChild(h2); // 將標題加入容器中
        } else {
            const p = document.createElement("p"); // 建立 <p> 段落元素
            p.textContent = line.trim(); // 即使是空白行也建立空段落
            container.appendChild(p); // 將段落加入容器中
        } 
      });
    }); // ← 這是 fetch.then 的結尾
}); // ← 這是 DOMContentLoaded 的結尾