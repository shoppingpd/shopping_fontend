/* ===========================================================
   Order History 前端控制
   - 目前使用「假資料 MOCK_ORDERS」模擬（可離線測試）
   - 之後接資料庫：把 fetchOrders() 改為呼叫你的後端 API
     例如：
       const res = await fetch(`/api/orders?${new URLSearchParams(query)}`);
       const data = await res.json();
       return data.items; // 資料格式依你的後端回傳為準
   =========================================================== */

const state = {
  all: [],          // 全部訂單（查詢結果）
  page: 1,          // 目前頁碼
  pageSize: 10,     // 每頁筆數
};

// === 假資料區：未來請改由資料庫回傳 =================================
const MOCK_ORDERS = [
  // 每筆訂單的最小結構示例（請對照你的資料庫 schema）
  // orderNo: 訂單編號 (varchar)
  // date: 下單日期 (ISO yyyy-mm-dd 或 datetime)
  // status: PENDING/SHIPPED/COMPLETED/CANCELLED
  // amount: 訂單金額(含小數) number
  // payment: 付款方式 e.g. CREDIT, CASH, LINEPAY...
  // items: 明細陣列：{ name, color, size, qty, price }
  // shipping: 收件資訊
  // note: 備註/留言
  {
    orderNo: "ORD20251013001",
    date: "2025-10-13",
    status: "COMPLETED",
    amount: 1720,
    payment: "CREDIT",
    items: [
      { name: "寬鬆落肩素T", color: "白", size: "L", qty: 2, price: 390 },
      { name: "休閒錐形長褲", color: "黑", size: "M", qty: 1, price: 940 },
    ],
    shipping: {
      name: "王小明",
      address: "台北市信義區松高路 88 號",
      phone: "0900-123-456",
      email: "mike@example.com",
    },
    note: "請於週末送達",
  },
  {
    orderNo: "ORD20251012032",
    date: "2025-10-12",
    status: "SHIPPED",
    amount: 780,
    payment: "LINEPAY",
    items: [
      { name: "針織開襟外套", color: "咖", size: "F", qty: 1, price: 780 },
    ],
    shipping: {
      name: "陳怡君",
      address: "新北市板橋區文化路 1 段 100 號",
      phone: "0912-222-333",
      email: "ivy@example.com",
    },
    note: "",
  },
  {
    orderNo: "ORD20251011005",
    date: "2025-10-11",
    status: "PENDING",
    amount: 2560,
    payment: "CASH",
    items: [
      { name: "高磅數帽T", color: "灰", size: "XL", qty: 2, price: 680 },
      { name: "機能運動長褲", color: "深藍", size: "L", qty: 1, price: 1200 },
    ],
    shipping: {
      name: "林志偉",
      address: "桃園市中壢區中正路 66 號",
      phone: "0988-555-666",
      email: "leo@example.com",
    },
    note: "門市自取",
  },
  {
    orderNo: "ORD20251009021",
    date: "2025-10-09",
    status: "CANCELLED",
    amount: 1290,
    payment: "CREDIT",
    items: [
      { name: "直筒牛仔褲", color: "淺藍", size: "M", qty: 1, price: 1290 },
    ],
    shipping: {
      name: "張小美",
      address: "高雄市鼓山區明誠三路 10 號",
      phone: "0966-111-222",
      email: "mei@example.com",
    },
    note: "買錯尺寸，已取消",
  },
];
// === 假資料區結束 ======================================================

/** 將數字轉為貨幣字串 */
function money(n){ return n.toLocaleString('en-US', { style:'currency', currency:'USD', maximumFractionDigits:0 }).replace('US$', '$'); }

/** 把狀態轉成 badge 樣式 class */
function statusClass(s){ return `badge ${s}`; }

/** 取得篩選條件物件 */
function getQueryFromForm(){
  const orderNo = document.querySelector('#qOrderNo').value.trim();
  const dateStart = document.querySelector('#qDateStart').value;
  const dateEnd = document.querySelector('#qDateEnd').value;
  const status = document.querySelector('#qStatus').value;
  return { orderNo, dateStart, dateEnd, status };
}

/* ===========================================================
   🚀 對接資料庫位置（之後請改這裡）
   - 目前回傳 MOCK_ORDERS（模擬後端）
   - 將來改成 fetch('/api/orders?...') 取得真實資料
   - 後端建議支援參數：
     orderNo, dateStart, dateEnd, status, page, pageSize
   =========================================================== */
async function fetchOrders(query){
  // --- 模擬延遲（可移除）
  await new Promise(r => setTimeout(r, 100));

  // --- 使用假資料篩選（模擬後端過濾）
  let rows = [...MOCK_ORDERS];

  if(query.orderNo){
    const key = query.orderNo.toLowerCase();
    rows = rows.filter(r => r.orderNo.toLowerCase().includes(key));
  }
  if(query.status){
    rows = rows.filter(r => r.status === query.status);
  }
  if(query.dateStart){
    rows = rows.filter(r => r.date >= query.dateStart);
  }
  if(query.dateEnd){
    rows = rows.filter(r => r.date <= query.dateEnd);
  }

  // 建議後端排序：date desc
  rows.sort((a,b) => (a.date < b.date ? 1 : -1));

  return rows;
}

/** 渲染統計 */
function renderStats(rows){
  const total = rows.reduce((s,r) => s + r.amount, 0);
  const completed = rows.filter(r => r.status === 'COMPLETED').length;
  document.querySelector('#statCount').textContent = rows.length.toString();
  document.querySelector('#statAmount').textContent = money(total);
  document.querySelector('#statCompleted').textContent = completed.toString();
}

/** 分頁切片 */
function pageSlice(rows, page, pageSize){
  const start = (page - 1) * pageSize;
  return rows.slice(start, start + pageSize);
}

/** 渲染列表 */
function renderList(){
  const wrap = document.querySelector('#orderList');
  wrap.innerHTML = '';

  const rows = pageSlice(state.all, state.page, state.pageSize);

  const tpl = document.querySelector('#orderRowTpl');

  rows.forEach((r) => {
    const frag = document.importNode(tpl.content, true);

    // 主列
    frag.querySelector('.order-no').textContent = r.orderNo;
    frag.querySelector('.order-date').textContent = r.date;
    const badge = frag.querySelector('.badge');
    badge.textContent = r.status;
    badge.className = statusClass(r.status);
    frag.querySelector('.order-items').textContent = r.items.length.toString();
    frag.querySelector('.order-amount').textContent = money(r.amount);
    frag.querySelector('.order-payment').textContent = r.payment;

    // 明細
    const tbody = frag.querySelector('.detail-body');
    r.items.forEach(it => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${it.name}</td>
        <td>${it.color || '-'} / ${it.size || '-'}</td>
        <td>${it.qty}</td>
        <td class="mono">${money(it.price)}</td>
        <td class="mono">${money(it.price * it.qty)}</td>
      `;
      tbody.appendChild(tr);
    });

    frag.querySelector('.ship-name').textContent = r.shipping?.name || '';
    frag.querySelector('.ship-address').textContent = r.shipping?.address || '';
    frag.querySelector('.ship-phone').textContent = r.shipping?.phone || '';
    frag.querySelector('.ship-email').textContent = r.shipping?.email || '';
    frag.querySelector('.note').textContent = r.note || '';

    // 展開/收合
    const rowEl = frag.querySelector('.row.item');
    const detailEl = frag.querySelector('.detail');
    const btnExpand = frag.querySelector('.link-expand');
    btnExpand.addEventListener('click', () => {
      const open = detailEl.classList.toggle('open');
      btnExpand.textContent = open ? '▾' : '▸';
    });

    // View（之後可改為導向「訂單詳情頁」或開 modal）
    frag.querySelector('.btn-view').addEventListener('click', () => {
      // 可帶 orderNo 前往詳情頁，例如：
      // location.href = `/order/${encodeURIComponent(r.orderNo)}`
      alert(`View order: ${r.orderNo}`);
    });

    wrap.appendChild(frag);
  });

  // 分頁資訊
  const totalPages = Math.max(1, Math.ceil(state.all.length / state.pageSize));
  document.querySelector('#pageInfo').textContent = `${state.page} / ${totalPages}`;
  document.querySelector('#prevPage').disabled = state.page <= 1;
  document.querySelector('#nextPage').disabled = state.page >= totalPages;
}

/** 執行查詢（呼叫 fetchOrders -> 更新狀態 -> 渲染） */
async function runSearch(){
  const query = getQueryFromForm();
  const rows = await fetchOrders(query);
  state.all = rows;
  state.page = 1;
  renderStats(rows);
  renderList();
}

/** 事件初始化 */
function initEvents(){
  // 查詢
  document.querySelector('#searchForm').addEventListener('submit', (e) => {
    e.preventDefault();
    runSearch();
  });

  // Reset
  document.querySelector('#btnReset').addEventListener('click', () => {
    document.querySelector('#qOrderNo').value = '';
    document.querySelector('#qDateStart').value = '';
    document.querySelector('#qDateEnd').value = '';
    document.querySelector('#qStatus').value = '';
    runSearch();
  });

  // 分頁
  document.querySelector('#prevPage').addEventListener('click', () => {
    if(state.page > 1){
      state.page--;
      renderList();
    }
  });
  document.querySelector('#nextPage').addEventListener('click', () => {
    const totalPages = Math.max(1, Math.ceil(state.all.length / state.pageSize));
    if(state.page < totalPages){
      state.page++;
      renderList();
    }
  });
  document.querySelector('#pageSize').addEventListener('change', (e) => {
    state.pageSize = parseInt(e.target.value, 10) || 10;
    state.page = 1;
    renderList();
  });
}

/** 初始載入：先跑一次空查詢 */
window.addEventListener('DOMContentLoaded', async () => {
  initEvents();
  await runSearch();
});
