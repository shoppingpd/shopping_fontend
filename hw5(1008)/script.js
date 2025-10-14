// -------------------- DOMContentLoaded --------------------
document.addEventListener("DOMContentLoaded", () => {

  // -------------------- 輪播功能 --------------------
  const track = document.querySelector(".carousel-track");
  const slides = Array.from(track.children);
  const nextButton = document.querySelector(".arrow-right");
  const prevButton = document.querySelector(".arrow-left");

  let currentIndex = 1; // 因為前面加了克隆
  let autoSlide;

  // 克隆第一張和最後一張
  const firstClone = slides[0].cloneNode(true);
  const lastClone = slides[slides.length - 1].cloneNode(true);
  track.appendChild(firstClone);
  track.insertBefore(lastClone, slides[0]);

  const allSlides = Array.from(track.children);
  const slideCount = slides.length;

  // 初始位置
  const slideWidth = slides[0].clientWidth;
  track.style.transform = `translateX(-${slideWidth * currentIndex}px)`;

  // -------------------- 生成圓點 --------------------
  const dotsContainer = document.querySelector(".dots");
  slides.forEach((_, idx) => {
    const dot = document.createElement("div");
    dot.classList.add("dot");
    if (idx === 0) dot.classList.add("active"); // 第一個預設 active
    dotsContainer.appendChild(dot);
  });
  const dots = document.querySelectorAll(".dot"); // 重新選取

  // 更新圓點
  const updateDots = () => {
    dots.forEach(dot => dot.classList.remove("active"));
    dots[(currentIndex - 1 + slideCount) % slideCount].classList.add("active");
  };

  const moveToSlide = (index) => {
    track.style.transition = "transform 0.5s ease-in-out";
    track.style.transform = `translateX(-${slides[0].clientWidth * index}px)`;
  };

  // transitionend 無縫切換
  track.addEventListener("transitionend", () => {
    if (allSlides[currentIndex].isSameNode(firstClone)) {
      track.style.transition = "none";
      currentIndex = 1;
      track.style.transform = `translateX(-${slides[0].clientWidth * currentIndex}px)`;
    }
    if (allSlides[currentIndex].isSameNode(lastClone)) {
      track.style.transition = "none";
      currentIndex = slideCount;
      track.style.transform = `translateX(-${slides[0].clientWidth * currentIndex}px)`;
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

  nextButton.addEventListener("click", nextSlide);
  prevButton.addEventListener("click", prevSlide);

  // 點擊圓點切換
  dots.forEach((dot, idx) => {
    dot.addEventListener("click", () => {
      currentIndex = idx + 1;
      moveToSlide(currentIndex);
      updateDots();
      resetAutoSlide();
    });
  });

  // 自動輪播
  const startAutoSlide = () => {
    clearInterval(autoSlide);
    autoSlide = setInterval(() => {
      currentIndex++;
      moveToSlide(currentIndex);
      updateDots();
    }, 3000);
  };

  const resetAutoSlide = () => {
    startAutoSlide();
  };

  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) startAutoSlide();
    else clearInterval(autoSlide);
  });

  window.addEventListener("resize", () => {
    moveToSlide(currentIndex);
  });

  updateDots();
  startAutoSlide();

  // -------------------- 精選商品滑動 --------------------
  function setupRow(rowId) {
    const row = document.getElementById(rowId);
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

    leftBtn.addEventListener("click", () => {
      if (prodIndex > 0) prodIndex--;
      updateProducts();
    });

    rightBtn.addEventListener("click", () => {
      if (prodIndex < prodItems.length - visibleCount) prodIndex++;
      updateProducts();
    });

    window.addEventListener("resize", updateProducts);
    updateProducts();
  }

  setupRow("row1");
  setupRow("row2");

  // -------------------- Header 按鈕 --------------------
  document.querySelectorAll(".top-header button").forEach(btn => {
    btn.addEventListener("click", () => {
      alert(`你點擊了「${btn.textContent}」按鈕！`);
    });
  });

  document.querySelectorAll(".nav-bar button").forEach(btn => {
    btn.addEventListener("click", () => {
      alert(`你選擇了「${btn.textContent}」分類！`);
    });
  });

  // -------------------- Footer 按鈕 --------------------
  document.querySelectorAll("footer button").forEach(btn => {
    btn.addEventListener("click", () => {
      alert(`你點擊了「${btn.textContent}」按鈕！`);
    });
  });

  // -------------------- 商品點擊加入購物車 --------------------
  document.querySelectorAll(".product-item").forEach(item => {
    item.addEventListener("click", (e) => {
      const name = item.querySelector(".product-name").textContent;
      alert(`${name} 已加入購物車！`);
    });
  });

});

// -------------------- 加入購物車按鈕 --------------------
const cartButtons = document.querySelectorAll('.product-item button');
cartButtons.forEach(btn => {
  btn.addEventListener('click', (e) => {
    const productItem = e.target.closest('.product-item');
    const productImg = productItem.querySelector('img');
    const productName = productImg.alt || "商品";
    alert(`${productName} 已加入購物車！`);
  });
});

// -------------------- Header 按鈕功能 --------------------
document.querySelectorAll('.top-header button').forEach(btn => {
  btn.addEventListener('click', (e) => {
    const text = e.target.textContent;
    alert(`你點擊了「${text}」按鈕！`);
  });
});

// -------------------- 導覽列分類按鈕功能 --------------------
document.querySelectorAll('.nav-bar button').forEach(btn => {
  btn.addEventListener('click', (e) => {
    const text = e.target.textContent;
    alert(`你選擇了「${text}」分類！`);
  });
});

// -------------------- Footer 按鈕功能 --------------------
document.querySelectorAll('footer button').forEach(btn => {
  btn.addEventListener('click', (e) => {
    const text = e.target.textContent;
    alert(`你點擊了「${text}」按鈕！`);
  });
});

