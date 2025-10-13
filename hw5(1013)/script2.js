// -------------------- DOMContentLoaded --------------------
document.addEventListener("DOMContentLoaded", () => {

  // -------------------- 輪播功能 --------------------
  const track = document.querySelector(".carousel-track");
  if (track) {
    const slides = Array.from(track.children);
    const nextButton = document.querySelector(".arrow-right");
    const prevButton = document.querySelector(".arrow-left");

    let currentIndex = 1;
    let autoSlide;

    // 克隆首尾
    const firstClone = slides[0].cloneNode(true);
    const lastClone = slides[slides.length - 1].cloneNode(true);
    track.appendChild(firstClone);
    track.insertBefore(lastClone, slides[0]);

    const allSlides = Array.from(track.children);
    const slideCount = slides.length;
    const slideWidth = slides[0].clientWidth;

    track.style.transform = `translateX(-${slideWidth * currentIndex}px)`;

    // 生成圓點
    const dotsContainer = document.querySelector(".dots");
    slides.forEach((_, idx) => {
      const dot = document.createElement("div");
      dot.classList.add("dot");
      if (idx === 0) dot.classList.add("active");
      dotsContainer.appendChild(dot);
    });
    const dots = document.querySelectorAll(".dot");

    const updateDots = () => {
      dots.forEach(dot => dot.classList.remove("active"));
      dots[(currentIndex - 1 + slideCount) % slideCount].classList.add("active");
    };

    const moveToSlide = (index) => {
      track.style.transition = "transform 0.5s ease-in-out";
      track.style.transform = `translateX(-${slides[0].clientWidth * index}px)`;
    };

    track.addEventListener("transitionend", () => {
      if (allSlides[currentIndex].isSameNode(firstClone)) {
        track.style.transition = "none";
        currentIndex = 1;
        track.style.transform = `translateX(-${slideWidth * currentIndex}px)`;
      }
      if (allSlides[currentIndex].isSameNode(lastClone)) {
        track.style.transition = "none";
        currentIndex = slideCount;
        track.style.transform = `translateX(-${slideWidth * currentIndex}px)`;
      }
      updateDots();
    });

    const nextSlide = () => {
      currentIndex++;
      moveToSlide(currentIndex);
      updateDots();
      resetAutoSlide();
    };
    const prevSlide = () => {
      currentIndex--;
      moveToSlide(currentIndex);
      updateDots();
      resetAutoSlide();
    };

    nextButton?.addEventListener("click", nextSlide);
    prevButton?.addEventListener("click", prevSlide);

    dots.forEach((dot, idx) => {
      dot.addEventListener("click", () => {
        currentIndex = idx + 1;
        moveToSlide(currentIndex);
        updateDots();
        resetAutoSlide();
      });
    });

    const startAutoSlide = () => {
      clearInterval(autoSlide);
      autoSlide = setInterval(() => {
        currentIndex++;
        moveToSlide(currentIndex);
        updateDots();
      }, 3000);
    };
    const resetAutoSlide = () => startAutoSlide();

    document.addEventListener("visibilitychange", () => {
      if (!document.hidden) startAutoSlide();
      else clearInterval(autoSlide);
    });
    window.addEventListener("resize", () => moveToSlide(currentIndex));

    updateDots();
    startAutoSlide();
  }

  // -------------------- 精選商品滑動 --------------------
  function setupRow(rowId) {
    const row = document.getElementById(rowId);
    if (!row) return;
    const prodContainer = row.querySelector(".products");
    const prodItems = Array.from(prodContainer.children);
    const leftBtn = row.querySelector(".prod-left");
    const rightBtn = row.querySelector(".prod-right");
    let prodIndex = 0;
    const visibleCount = 3;

    const updateProducts = () => {
      const itemWidth = prodItems[0].getBoundingClientRect().width + 10;
      prodContainer.style.transform = `translateX(-${prodIndex * itemWidth}px)`;
    };

    leftBtn?.addEventListener("click", () => {
      if (prodIndex > 0) prodIndex--;
      updateProducts();
    });
    rightBtn?.addEventListener("click", () => {
      if (prodIndex < prodItems.length - visibleCount) prodIndex++;
      updateProducts();
    });

    window.addEventListener("resize", updateProducts);
    updateProducts();
  }

  setupRow("row1");
  setupRow("row2");

// -------------------- Header / Nav / Footer 按鈕 --------------------
document.querySelectorAll(".top-header button, .top-header a, .nav-bar button, .nav-bar a, footer button, footer a").forEach(btn => {
  // 跳過登入/註冊按鈕（id 或 class）
  if (btn.id === "login-btn" || btn.classList.contains("login-btn") || btn.textContent.includes("登入")) return;

  btn.addEventListener("click", () => {
    alert(`你點擊了「${btn.textContent.trim()}」`);
  });
});

// -------------------- 登入/註冊 跳轉 --------------------
const loginNavBtn = document.querySelector(".top-header .actions button:nth-child(2)");
if (loginNavBtn) {
  loginNavBtn.classList.add("login-btn"); // 標記為登入按鈕（防止被 alert 綁定）
  loginNavBtn.addEventListener("click", () => {
    window.location.href = "login1.html";
  });
}


  // -------------------- 商品加入購物車 --------------------
  document.querySelectorAll(".product-item button").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const productItem = e.target.closest(".product-item");
      const productName = productItem.querySelector(".product-name")?.textContent || "商品";
      alert(`${productName} 已加入購物車！`);
    });
  });

  // -------------------- 登入 / 註冊 / 重設密碼 --------------------
  const loginContainer = document.getElementById("login-container");
  const registerContainer = document.getElementById("register-container");
  const resetContainer = document.getElementById("reset-container");

  const switchToRegister = document.getElementById("switch-to-register");
  const switchToLogin = document.getElementById("switch-to-login");
  const backToLogin = document.getElementById("back-to-login");
  const forgotPassword = document.querySelector(".forgot-password");

  switchToRegister?.addEventListener("click", (e) => {
    e.preventDefault();
    loginContainer.style.display = "none";
    registerContainer.style.display = "block";
    resetContainer.style.display = "none";
  });
  switchToLogin?.addEventListener("click", (e) => {
    e.preventDefault();
    loginContainer.style.display = "block";
    registerContainer.style.display = "none";
    resetContainer.style.display = "none";
  });
  forgotPassword?.addEventListener("click", (e) => {
    e.preventDefault();
    loginContainer.style.display = "none";
    registerContainer.style.display = "none";
    resetContainer.style.display = "block";
  });
  backToLogin?.addEventListener("click", (e) => {
    e.preventDefault();
    loginContainer.style.display = "block";
    registerContainer.style.display = "none";
    resetContainer.style.display = "none";
  });

  // -------------------- 密碼強度檢測 --------------------
  function checkStrength(password) {
    let s = 0;
    if (password.length >= 6) s++;
    if (/[A-Z]/.test(password)) s++;
    if (/[a-z]/.test(password)) s++;
    if (/\d/.test(password)) s++;
    if (/[^A-Za-z0-9]/.test(password)) s++;
    if (s <= 2) return { text: "弱", cls: "weak" };
    if (s === 3) return { text: "中", cls: "medium" };
    return { text: "強", cls: "strong" };
  }

  function bindStrength(inputId, displayId) {
    const input = document.getElementById(inputId);
    const display = document.getElementById(displayId);
    if (!input || !display) return;
    input.addEventListener("input", () => {
      const val = input.value.trim();
      if (!val) {
        display.textContent = "";
        display.className = "password-strength";
        return;
      }
      const r = checkStrength(val);
      display.textContent = `密碼強度：${r.text}`;
      display.className = `password-strength ${r.cls}`;
    });
  }

  bindStrength("new-password", "password-strength");
  bindStrength("reset-password", "reset-password-strength");

  // -------------------- 記住帳號功能 --------------------
  const remember = document.getElementById("remember");
  const loginId = document.getElementById("login-id");
  const saved = localStorage.getItem("rememberedAccount");
  if (saved && loginId && remember) {
    loginId.value = saved;
    remember.checked = true;
  }

  const loginForm = document.getElementById("login-form");
if (loginForm) {
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    if (remember?.checked) {
      localStorage.setItem("rememberedAccount", loginId.value);
    } else {
      localStorage.removeItem("rememberedAccount");
    }

    // 直接跳轉首頁（無 alert）
    window.location.href = "index.html";
  });
}


  // -------------------- 出生日期選擇器 --------------------
  if (window.flatpickr) {
    flatpickr("#birthdate", {
      dateFormat: "Y-m-d",
      maxDate: "today"
    });
  }
});
