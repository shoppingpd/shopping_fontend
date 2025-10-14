document.addEventListener("DOMContentLoaded", () => {
  fetch("/api/user-info")
    .then(res => res.json())
    .then(data => {
      document.getElementById("user-account").textContent = data.帳號;
      document.getElementById("user-name").textContent = data.姓名;
      document.getElementById("user-gender").textContent = data.性別;
      document.getElementById("user-age").textContent = data.年齡;
      document.getElementById("user-address").textContent = data.地址;
      document.getElementById("user-email").textContent = data.電子郵件;
    });

  document.getElementById("update-password-btn").addEventListener("click", () => {
    const newPassword = document.getElementById("new-password").value;
    if (!newPassword) {
      document.getElementById("update-status").textContent = "請輸入新密碼";
      return;
    }

    fetch("/api/update-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 密碼: newPassword })
    })
    .then(res => res.json())
    .then(result => {
      document.getElementById("update-status").textContent = result.message;
    });
  });
});

document.getElementById("toggle-password").addEventListener("click", () => {
  const input = document.getElementById("new-password");
  const toggle = document.getElementById("toggle-password");
  const isHidden = input.type === "password";

  input.type = isHidden ? "text" : "password";
  toggle.textContent = isHidden ? "隱藏" : "顯示";
});

