// -------------------- 輪播功能 --------------------
const track = document.querySelector('.carousel-track');
const slides = Array.from(track.children);
const dots = document.querySelectorAll('.dot');
const prevBtn = document.querySelector('.arrow-left');
const nextBtn = document.querySelector('.arrow-right');
let index = 0;
const totalSlides = slides.length;

function updateCarousel() {
  track.style.transform = `translateX(-${index * 100}%)`;
  dots.forEach((dot, i) => dot.classList.toggle('active', i === index));
}

// 輪播箭頭
nextBtn.addEventListener('click', () => {
  index = (index + 1) % totalSlides;
  updateCarousel();
});
prevBtn.addEventListener('click', () => {
  index = (index - 1 + totalSlides) % totalSlides;
  updateCarousel();
});

// 輪播圓點
dots.forEach((dot, i) => {
  dot.addEventListener('click', () => {
    index = i;
    updateCarousel();
  });
});

// 自動輪播
setInterval(() => {
  index = (index + 1) % totalSlides;
  updateCarousel();
}, 3000);

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
