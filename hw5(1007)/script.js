// -------------------- 輪播功能 --------------------
document.addEventListener("DOMContentLoaded", () => {
  const track = document.querySelector(".carousel-track");
  const slides = Array.from(track.children);
  const nextButton = document.querySelector(".arrow-right");
  const prevButton = document.querySelector(".arrow-left");
  const dots = document.querySelectorAll(".dot");

  let currentIndex = 1; // 因為要加上克隆的第一張
  let autoSlide;

  // --- 為了無縫輪播：在頭尾各加一張克隆 ---
  const firstClone = slides[0].cloneNode(true);
  const lastClone = slides[slides.length - 1].cloneNode(true);
  track.appendChild(firstClone);
  track.insertBefore(lastClone, slides[0]);

  const allSlides = Array.from(track.children);
  const slideCount = allSlides.length;
  const size = slides[0].clientWidth;

  // 初始位置移到真正的第一張
  track.style.transform = `translateX(-${size * currentIndex}px)`;

  // 更新圓點
  const updateDots = () => {
    dots.forEach(dot => dot.classList.remove("active"));
    dots[(currentIndex - 1 + slides.length) % slides.length].classList.add("active");
  };

  // 移動輪播
  const moveToSlide = (index) => {
    track.style.transition = "transform 0.5s ease-in-out";
    track.style.transform = `translateX(-${size * index}px)`;
  };

  // 監聽 transition 結束事件，處理無縫切換
  track.addEventListener("transitionend", () => {
    if (allSlides[currentIndex].isSameNode(firstClone)) {
      track.style.transition = "none";
      currentIndex = 1;
      track.style.transform = `translateX(-${size * currentIndex}px)`;
    }
    if (allSlides[currentIndex].isSameNode(lastClone)) {
      track.style.transition = "none";
      currentIndex = slides.length;
      track.style.transform = `translateX(-${size * currentIndex}px)`;
    }
  });

  // 下一張
  nextButton.addEventListener("click", () => {
    if (currentIndex >= slideCount - 1) return;
    currentIndex++;
    moveToSlide(currentIndex);
    updateDots();
    resetAutoSlide();
  });

  // 上一張
  prevButton.addEventListener("click", () => {
    if (currentIndex <= 0) return;
    currentIndex--;
    moveToSlide(currentIndex);
    updateDots();
    resetAutoSlide();
  });

  // 點擊圓點
  dots.forEach((dot, idx) => {
    dot.addEventListener("click", () => {
      currentIndex = idx + 1; // 因為有前一張克隆
      moveToSlide(currentIndex);
      updateDots();
      resetAutoSlide();
    });
  });

  // 自動播放
  const startAutoSlide = () => {
    autoSlide = setInterval(() => {
      currentIndex++;
      moveToSlide(currentIndex);
      updateDots();
    }, 4000);
  };

  const resetAutoSlide = () => {
    clearInterval(autoSlide);
    startAutoSlide();
  };

  startAutoSlide();

  // 視窗調整大小時重新計算寬度
  window.addEventListener("resize", () => {
    const newSize = slides[0].clientWidth;
    track.style.transition = "none";
    track.style.transform = `translateX(-${newSize * currentIndex}px)`;
  });
});


// 手動切換
nextBtn.addEventListener('click', () => {
  clearTimeout(timer);
  nextSlide();
});
prevBtn.addEventListener('click', () => {
  clearTimeout(timer);
  prevSlide();
});
dots.forEach((dot, i) => {
  dot.addEventListener('click', () => {
    clearTimeout(timer);
    index = i;
    updateCarousel();
    startAutoPlay();
  });
});

// 下一張
function nextSlide() {
  if (index < totalSlides - 1) {
    index++;
    updateCarousel();
  } else {
    // 最後一張 → 停 3 秒再回第一張
    setTimeout(() => {
      index = 0;
      updateCarousel();
    }, intervalTime);
  }
  startAutoPlay();
}

// 上一張
function prevSlide() {
  index = (index - 1 + totalSlides) % totalSlides;
  updateCarousel();
  startAutoPlay();
}

// 自動輪播
function startAutoPlay() {
  timer = setTimeout(() => {
    if (index < totalSlides - 1) {
      index++;
      updateCarousel();
      startAutoPlay();
    } else {
      // 最後一張時多停 3 秒
      setTimeout(() => {
        index = 0;
        updateCarousel();
        startAutoPlay();
      }, intervalTime);
    }
  }, intervalTime);
}

updateCarousel();
startAutoPlay();



// -------------------- 商品滑動功能 --------------------
function setupRow(rowId) {
  const row = document.getElementById(rowId);
  const prodContainer = row.querySelector('.products');
  const prodItems = prodContainer.children;
  const leftBtn = row.querySelector('.prod-left');
  const rightBtn = row.querySelector('.prod-right');
  let prodIndex = 0;
  const visibleCount = 3;

  function updateProducts() {
    const itemWidth = prodItems[0].offsetWidth + 10; // gap 10px
    prodContainer.style.transform = `translateX(-${prodIndex * itemWidth}px)`;
  }

  leftBtn.addEventListener('click', () => {
    if (prodIndex > 0) prodIndex--;
    updateProducts();
  });

  rightBtn.addEventListener('click', () => {
    if (prodIndex < prodItems.length - visibleCount) prodIndex++;
    updateProducts();
  });
}

setupRow('row1');
setupRow('row2');

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
