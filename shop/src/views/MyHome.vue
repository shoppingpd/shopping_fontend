<template>
  <div id="app">
    <!-- Header -->
    <header>
      <nav class="nav-bar">
        <button v-for="cat in categories" :key="cat" @click="onCategoryClick(cat)">
          {{ cat }}
        </button>
        <input type="text" placeholder="搜尋..." v-model="searchQuery" />
      </nav>
    </header>

    <!-- Main -->
    <main>
      <!-- 輪播區 -->
      <section class="banner">
        <div
          class="carousel-track"
          :style="{
            transform: `translateX(-${currentIndex * slideWidth}px)`,
            transition: transitioning ? 'transform 0.5s ease-in-out' : 'none',
          }"
        >
          <img
            class="bannerimg"
            v-for="(slide, i) in slidesWithClones"
            :key="i"
            :src="slide"
            :alt="'輪播' + (i + 1)"
          />
        </div>
        <button class="arrow arrow-left" @click="prevSlide">&#10094;</button>
        <button class="arrow arrow-right" @click="nextSlide">&#10095;</button>
        <div class="dots">
          <div
            v-for="(dot, i) in slides.length"
            :key="i"
            class="dot"
            :class="{ active: currentIndexAdjusted === i }"
            @click="goToSlide(i)"
          ></div>
        </div>
      </section>

      <!-- 精選商品 -->
      <div class="section-title">精選商品</div>
      <section class="products-wrapper">
        <div class="product-row">
          <div
            v-for="(item, idx) in products"
            :key="idx"
            class="product-item"
            @click="addToCart(item)"
          >
            <img :src="'/assets/img/' + item.商品圖片" :alt="item.商品名稱" />
            <div class="product-info">
              <span class="product-name">{{ item.商品名稱 }}</span>
              <span class="product-price">{{ item.價格 }}元</span>
            </div>
          </div>
        </div>
      </section>
    </main>

    <!-- 分頁 -->
    <div class="pagination">
      <!-- 左箭頭 -->
      <button class="page-arrow" @click="prev">‹</button>

      <!-- 中間頁碼 -->
      <button
        v-for="num in middlePages"
        :key="num"
        class="page"
        :class="{ active: currentPage === num }"
        @click="goToPage(num)"
      >
        {{ num }}
      </button>

      <!-- 分隔符號 -->
      <span class="page-dots">.......</span>

      <!-- 最後三頁 -->
      <button
        v-for="num in lastThree"
        :key="num"
        class="page"
        :class="{ active: currentPage === num }"
        @click="goToPage(num)"
      >
        {{ num }}
      </button>

      <!-- 右箭頭 -->
      <button class="page-arrow" @click="next">›</button>

      <!-- 跳頁輸入框 - 在這裡！ -->
      <input
        type="number"
        v-model.number="currentPage"
        @keyup.enter="jumpToPage"
        @change="jumpToPage"
        class="page-jump-input"
        min="1"
        :max="totalPages"
      />
      <button class="page-jump-btn" @click="jumpToPage">跳轉</button>
    </div>
  </div>
</template>

<script>
  import { ref, computed, onMounted, watch } from 'vue';
  import { useRouter } from 'vue-router';

  export default {
    setup() {
      onMounted(() => {
        loadProducts();
        loadtotalpages();
      });
      const products = ref([]);
      const totalPages = ref(0);
      const currentPage = ref(1);
      async function loadProducts() {
        try {
          const res = await fetch(`http://localhost:8080/products/page/${currentPage.value - 1}`);
          if (!res.ok) throw new Error('伺服器回應錯誤');
          products.value = await res.json();
          console.log(products.value);
        } catch (err) {
          console.error('讀取失敗：', err);
        }
      }
      async function loadtotalpages() {
        try {
          const res = await fetch('http://localhost:8080/products/maxPage');
          if (!res.ok) throw new Error('伺服器回應錯誤');
          totalPages.value = await res.json();
          console.log(totalPages.value);
        } catch (err) {
          console.error('讀取失敗：', err);
        }
      }

      // ---------- 輪播資料 ----------
      const slides = ref(['assets/img/img11.jpg', 'assets/img/img12.jpg', 'assets/img/img17.jpg']);

      const firstClone = slides.value[0];
      const lastClone = slides.value[slides.value.length - 1];

      const slidesWithClones = computed(() => [lastClone, ...slides.value, firstClone]);

      const currentIndex = ref(1);
      const slideWidth = ref(0);
      const transitioning = ref(true);
      let autoSlide = null;

      const currentIndexAdjusted = computed(
        () => (currentIndex.value - 1 + slides.value.length) % slides.value.length,
      );

      // ---------- 輪播操作 ----------
      const nextSlide = () => {
        if (currentIndex.value > slides.value.length - 1) currentIndex.value = 0;
        currentIndex.value++;
        transitioning.value = true;
        resetAutoSlide();
      };

      const prevSlide = () => {
        currentIndex.value--;
        if (currentIndex.value < 0) currentIndex.value = slides.value.length - 1;
        transitioning.value = true;
        resetAutoSlide();
      };

      const goToSlide = (index) => {
        currentIndex.value = index + 1;
        transitioning.value = true;
        resetAutoSlide();
      };

      const startAutoSlide = () => {
        clearInterval(autoSlide);
        autoSlide = setInterval(() => {
          nextSlide();
        }, 4500);
      };

      const resetAutoSlide = () => startAutoSlide();

      const handleTransitionEnd = () => {
        if (slidesWithClones.value[currentIndex.value] === firstClone) {
          transitioning.value = false;
          currentIndex.value = 1;
        }
        if (slidesWithClones.value[currentIndex.value] === lastClone) {
          transitioning.value = false;
          currentIndex.value = slides.value.length;
        }
      };

      // ---------- 按鈕功能 ----------
      const onTopHeaderClick = (text) => alert(`你點擊了「${text}」按鈕！`);
      const onCategoryClick = (text) => alert(`你選擇了「${text}」分類！`);
      const onFooterClick = (text) => alert(`你點擊了「${text}」按鈕！`);
      // const addToCart = (item) => alert(`${item.商品編號} 已加入購物車！`)
      const router = useRouter();

      const addToCart = (item) => {
        // 跳到 productpage 並帶商品編號
        router.push({
          name: 'productpage',
          query: { id: item.商品編號 }, // 用 query 傳比較方便，不用改 router 設定
        });
      };
      const categories = ['全部', '女裝', '男裝', '童裝', '限時特價'];
      const searchQuery = ref('');

      // ---------- 設定 slideWidth ----------
      onMounted(() => {
        const trackEl = document.querySelector('.carousel-track');
        slideWidth.value = trackEl.children[0].clientWidth;

        trackEl.addEventListener('transitionend', handleTransitionEnd);
        startAutoSlide();

        window.addEventListener('resize', () => {
          slideWidth.value = trackEl.children[0].clientWidth;
        });
      });

      // ---------- 分頁 ----------

      const start = ref(1);

      const middlePages = computed(() => [
        start.value,
        start.value + 1,
        start.value + 2,
        start.value + 3,
      ]);

      const lastThree = computed(() => [
        totalPages.value - 2,
        totalPages.value - 1,
        totalPages.value,
      ]);

      const goToPage = (num) => {
        currentPage.value = num;
        if (num <= totalPages.value - 3) {
          start.value = Math.max(1, Math.min(num, totalPages.value - 6));
        }
      };

      const next = () => {
        if (currentPage.value < totalPages.value) {
          currentPage.value++;
          if (start.value + 3 < totalPages.value - 3) start.value++;
        }
      };

      const prev = () => {
        if (currentPage.value > 1) {
          currentPage.value--;
          if (start.value > 1) start.value--;
        }
      };

      const jumpToPage = () => {
        if (currentPage.value >= 1 && currentPage.value <= totalPages.value) {
          goToPage(currentPage.value);
        } else {
          currentPage.value = Math.max(1, Math.min(currentPage.value, totalPages));
        }
      };
      watch(currentPage, (newVal, oldVal) => {
        console.log(`頁數從 ${oldVal} 變成 ${newVal}`);
        loadProducts();
        // 這裡可以加你想要的其他動作
      });

      return {
        slides,
        slidesWithClones,
        currentIndex,
        slideWidth,
        transitioning,
        currentIndexAdjusted,
        nextSlide,
        prevSlide,
        goToSlide,
        products,
        addToCart,
        onTopHeaderClick,
        onCategoryClick,
        onFooterClick,
        categories,
        searchQuery,
        middlePages,
        lastThree,
        next,
        prev,
        currentPage,
        goToPage,
        jumpToPage,
        totalPages,
      };
    },
  };
</script>

<style scoped>
  :root {
    --c-background: #fff8e7;
    --c-background-soft: #fff2d9;
    --c-background-mute: #ffebc2;
    --c-border: rgba(0, 0, 0, 0.1);
    --c-border-hover: rgba(0, 0, 0, 0.25);
    --c-text: #333333;
    --c-heading: #3a6ea5;
    --c-primary: #3a6ea5;
    --c-accent: #ffebc2;
    --c-hover: #2f80ed;
  }

  *,
  *::before,
  *::after {
    box-sizing: border-box;
    margin: 0;
    font-weight: normal;
  }

  body {
    min-height: 100vh;
    color: var(--c-text);
    background: var(--c-background);
    font-family:
      Inter,
      -apple-system,
      BlinkMacSystemFont,
      'Segoe UI',
      Roboto,
      Oxygen,
      Ubuntu,
      Cantarell,
      'Fira Sans',
      'Droid Sans',
      'Helvetica Neue',
      sans-serif;
    line-height: 1.6;
    font-size: 15px;
  }

  a {
    color: var(--c-primary);
    text-decoration: none;
    padding: 3px;
    transition:
      color 0.3s,
      background-color 0.3s;
  }

  @media (hover: hover) {
    a:hover {
      color: var(--c-hover);
      background-color: rgba(47, 128, 237, 0.08);
      border-radius: 4px;
    }
  }

  header {
    display: flex;
    flex-direction: column;
    background: var(--c-background-soft);
  }

  .top-header {
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    height: 15vh;
    background: var(--c-primary);
    color: #fff;
  }

  .logo {
    font-weight: bold;
    font-size: 2rem;
  }

  .actions {
    position: absolute;
    right: 20px;
    top: 50%;
    transform: translateY(-50%);
    display: flex;
    gap: 15px;
  }

  .actions button {
    background: none;
    border: none;
    border-bottom: 2px solid transparent;
    color: #fff;
    font-size: 0.95rem;
    cursor: pointer;
    padding: 5px 0;
    transition:
      border-color 0.3s,
      color 0.3s;
  }

  .actions button:hover {
    border-bottom: 2px solid var(--c-hover);
    color: var(--c-hover);
  }

  .nav-bar {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 20px;
    height: 6vh;
    background: var(--c-accent);
  }

  .nav-bar button {
    background: none;
    border: none;
    border-bottom: 2px solid transparent;
    font-weight: bold;
    cursor: pointer;
    transition:
      border-color 0.3s,
      color 0.3s;
    font-size: 1.5rem;
  }

  .nav-bar button:hover {
    border-bottom: 2px solid var(--c-hover);
    color: var(--c-hover);
  }

  .nav-bar input {
    padding: 5px;
    border: 1px solid var(--c-border);
    border-radius: 5px;
  }

  .banner {
    height: 90vh;
    position: relative;
    overflow: hidden;
    background: var(--c-background-mute);
  }

  .carousel-track {
    display: flex;
    transition: transform 0.5s ease-in-out;
    height: 100%;
  }

  .carousel-track img {
    width: 100%;
    height: 100%;
    object-fit: fill;
    flex-shrink: 0;
  }

  .arrow {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    font-size: 2rem;
    color: rgba(58, 110, 165, 0.3);
    background-color: rgba(58, 110, 165, 0.1);
    border: none;
    padding: 10px;
    cursor: pointer;
    z-index: 10;
    border-radius: 50%;
    transition: all 0.3s ease;
  }

  .arrow-left {
    left: 10px;
  }

  .arrow-right {
    right: 10px;
  }

  .arrow:hover {
    color: rgba(58, 110, 165, 1);
    background-color: rgba(58, 110, 165, 0.4);
    transform: translateY(-50%) scale(1.05);
  }

  .dots {
    position: absolute;
    bottom: 15px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: 10px;
    z-index: 10;
  }

  .dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: rgba(58, 110, 165, 0.3);
    cursor: pointer;
    transition: background 0.3s;
  }

  .dot.active {
    background: var(--c-primary);
  }

  .section-title {
    text-align: center;
    font-size: 1.5rem;
    font-weight: bold;
    padding: 10px 0;
    color: var(--c-heading);
    background: var(--c-background-soft);
  }

  .products-wrapper {
    position: relative;
    background: var(--c-background-mute);
    padding: 10px 2vw;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .product-row {
    padding: 1% 0;
    position: relative;
    overflow: hidden;
    align-items: stretch;
    display: flex;
    flex-wrap: wrap;
    gap: 1.5%;
  }

  .products {
    display: flex;
    transition: transform 0.5s ease;
    gap: 10px;
  }

  .product-item {
    flex: 0 0 calc((100% - 2 * 1.5%) / 3);
    display: flex;
    flex-direction: column;
    border-radius: 5px;
    overflow: hidden;
    cursor: pointer;
    transition: transform 0.3s ease;
    background-color: var(--c-background-soft);
  }

  .product-item img {
    width: 100%;
    height: auto;
    object-fit: cover;
  }

  .product-item:hover {
    transform: scale(1.03);
  }

  .product-info {
    display: flex;
    justify-content: space-between;
    padding: 25px 8px;
    font-size: 1.5rem;
    color: var(--c-text);
  }

  .product-name {
    font-weight: 500;
    font-size: 1.2rem;
  }

  .product-price {
    font-weight: 700;
    color: var(--c-primary);
    font-size: 1.2rem;
    padding-right:3% ;
  }

  .prod-arrow {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    font-size: 1.2rem;
    color: rgba(58, 110, 165, 0.7);
    background-color: rgba(0, 0, 0, 0.1);
    border: none;
    padding: 5px;
    cursor: pointer;
    z-index: 10;
    border-radius: 50%;
  }

  .prod-left {
    left: 5px;
  }

  .prod-right {
    right: 5px;
  }

  footer {
    background: var(--c-accent);
    display: flex;
    justify-content: space-around;
    align-items: center;
    padding: 15px 20%;
    font-size: 1rem;
  }

  footer button {
    background: none;
    border: none;
    border-bottom: 2px solid transparent;
    font-weight: bold;
    cursor: pointer;
    transition:
      border-color 0.3s,
      color 0.3s;
  }

  footer button:hover {
    border-bottom: 2px solid var(--c-hover);
    color: var(--c-hover);
  }

  /* 🔥 分頁系統樣式 */
  .pagination {
    display: flex;
    gap: 8px;
    justify-content: center;
    align-items: center;
    margin: 1rem 0;
    padding: 10px;
  }

  .pagination button {
    padding: 6px 12px;
    border: 1px solid #ccc;
    background-color: #fff;
    cursor: pointer;
    border-radius: 4px;
    font-weight: 500;
    transition: all 0.3s ease;
  }

  .pagination button:hover {
    background-color: #ff7b00;
    color: #fff;
    border-color: #ff7b00;
  }

  /* 當前頁碼高亮 */
  .pagination button.page.active {
    background-color: var(--c-primary);
    color: #fff;
    border-color: var(--c-primary);
  }

  .pagination .page-dots {
    padding: 0 4px;
    font-weight: bold;
    color: #333;
    position: static;
    transform: none;
  }

  .pagination button.page-arrow {
    font-weight: bold;
    font-size: 1.2rem;
  }

  /* 🔥 跳頁輸入框 - 重點在這裡！ */
  .pagination .page-jump-input {
    width: 70px;
    padding: 6px 8px;
    border: 1px solid #ccc;
    border-radius: 4px;
    text-align: center;
    font-size: 14px;
    margin-left: 15px;
  }

  .pagination .page-jump-input:focus {
    outline: none;
    border-color: var(--c-primary);
  }

  .pagination .page-jump-btn {
    background-color: var(--c-primary);
    color: #fff;
    border-color: var(--c-primary);
  }

  .pagination .page-jump-btn:hover {
    background-color: var(--c-hover);
    border-color: var(--c-hover);
  }
</style>
