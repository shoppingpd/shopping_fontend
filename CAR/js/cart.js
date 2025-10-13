// ===== 設定 =====
const FREE_SHIP = 1500; // 滿額免運
const BASE_SHIP = 0;    // 運費（可改）
const TAX_RATE  = 0.00; // 稅率（可改）
const STORAGE_KEY = 'multi-shop-cart-v1';

// ===== 假資料：三店鋪 =====
const itemsSeed = [
  // 男裝館
  {id:'m-001', shop:'男裝館', name:'素色短T', sku:'黑 / M', price:390, qty:1, selected:true,
   img:'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=600&auto=format&fit=crop&q=60'},
  {id:'m-002', shop:'男裝館', name:'修身牛仔褲', sku:'深藍 / 32', price:990, qty:1, selected:false,
   img:'https://images.unsplash.com/photo-1511193311914-0346f16efe90?w=600&auto=format&fit=crop&q=60'},
  // 女裝館
  {id:'w-001', shop:'女裝館', name:'棉質上衣', sku:'奶茶 / S', price:520, qty:1, selected:true,
   img:'https://images.unsplash.com/photo-1520975922323-0e4c92758e1f?w=600&auto=format&fit=crop&q=60'},
  {id:'w-002', shop:'女裝館', name:'百褶長裙', sku:'霧灰 / M', price:860, qty:1, selected:false,
   img:'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&auto=format&fit=crop&q=60'},
  // 兒童館
  {id:'k-001', shop:'兒童館', name:'印花T (童)', sku:'亮黃 / 110', price:280, qty:2, selected:false,
   img:'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=600&auto=format&fit=crop&q=60'}
];

// ===== 狀態 =====
const state = {
  items: [],
  promo: null,
  load(){
    try { const raw = localStorage.getItem(STORAGE_KEY); this.items = raw ? JSON.parse(raw) : itemsSeed; }
    catch { this.items = itemsSeed; }
    this.save();
  },
  save(){ localStorage.setItem(STORAGE_KEY, JSON.stringify(this.items)); }
};

// ===== 小工具 =====
const $  = (s,el=document)=>el.querySelector(s);
const $$ = (s,el=document)=>Array.from(el.querySelectorAll(s));
const fmt = n => '$' + Number(n||0).toFixed(2);

// ===== 渲染入口 =====
state.load();
render();

// ===== 渲染主體 =====
function render(){
  const byShop = groupByShop(state.items);
  const wrap = $('#shops');
  wrap.innerHTML = '';

  Object.keys(byShop).forEach(shopName => {
    const group = byShop[shopName];
    const shop = document.createElement('section');
    shop.className = 'shop';
    shop.innerHTML = `
      <div class="shop__head">
        <label><input type="checkbox" class="chk-shop"> ${shopName}</label>
      </div>
      <div class="shop__body"></div>
    `;
    const body = $('.shop__body', shop);

    group.forEach(it => body.appendChild(renderRow(it)));

    // 店鋪勾選
    const chkShop = $('.chk-shop', shop);
    chkShop.checked = group.every(i=>i.selected) && group.length>0;
    chkShop.addEventListener('change', e=>{
      group.forEach(i=> i.selected = e.target.checked);
      state.save();
      render();
    });

    wrap.appendChild(shop);
  });

  // 全選狀態
  $('#checkAll').checked = state.items.length>0 && state.items.every(i=>i.selected);
  renderSummary();
}

function renderRow(it){
  const row = document.createElement('div');
  row.className = 'item';
  row.dataset.id = it.id;
  row.innerHTML = `
    <div><input type="checkbox" class="chk-item" ${it.selected?'checked':''}></div>
    <div class="thumb"><img src="${it.img}" alt="${it.name}" onerror="this.src='images/placeholder.png'"></div>
    <div class="info">
      <div class="name">${it.name}</div>
      <div class="sku">${it.sku}</div>
    </div>
    <div class="price">${fmt(it.price)}</div>
    <div class="qty">
      <div class="stepper">
        <button class="btn-dec">−</button>
        <input class="inp" type="number" min="1" value="${it.qty}">
        <button class="btn-inc">＋</button>
      </div>
    </div>
    <div class="subtotal">${fmt(it.qty*it.price)}</div>
    <div class="ops">
      <button class="link btn-del">刪除</button>
    </div>
  `;

  // 單列事件
  $('.chk-item', row).addEventListener('change', e=>{ it.selected = e.target.checked; state.save(); syncShopChecks(); renderSummary(); });
  $('.btn-dec', row).addEventListener('click', ()=>{ it.qty = Math.max(1, it.qty-1); updateRow(row,it); });
  $('.btn-inc', row).addEventListener('click', ()=>{ it.qty = it.qty+1; updateRow(row,it); });
  $('.inp', row).addEventListener('change', e=>{ it.qty = Math.max(1, parseInt(e.target.value||'1',10)); updateRow(row,it); });
  $('.btn-del', row).addEventListener('click', ()=>{ state.items = state.items.filter(x=>x.id!==it.id); state.save(); render(); });

  return row;
}

function updateRow(row,it){
  $('.inp',row).value = it.qty;
  $('.subtotal',row).textContent = fmt(it.qty*it.price);
  state.save();
  syncShopChecks();
  renderSummary();
}

function groupByShop(items){
  return items.reduce((m,it)=>{ (m[it.shop] ||= []).push(it); return m; }, {});
}

function syncShopChecks(){
  // 更新店鋪勾選 & 全選
  $$('#shops .shop').forEach(sec=>{
    const ids = $$('.item',sec).map(div=>div.dataset.id);
    const group = state.items.filter(i=> ids.includes(i.id));
    $('.chk-shop',sec).checked = group.length>0 && group.every(i=>i.selected);
  });
  $('#checkAll').checked = state.items.length>0 && state.items.every(i=>i.selected);
}

// ===== 摘要 =====
function renderSummary(){
  const selected = state.items.filter(i=>i.selected);
  const subtotal = selected.reduce((s,i)=> s + i.price*i.qty, 0);
  const shipping = subtotal >= FREE_SHIP ? 0 : BASE_SHIP;
  const tax = +(subtotal * TAX_RATE).toFixed(2);

  const discount = state.promo
    ? (state.promo.type==='amount'
        ? Math.min(state.promo.value, subtotal)
        : +(subtotal*state.promo.value).toFixed(2))
    : 0;

  const total = Math.max(0, subtotal + shipping + tax - discount);

  $('#selCount').textContent = selected.length;
  $('#sumSub').textContent = fmt(subtotal);
  $('#sumShip').textContent = fmt(shipping);
  $('#sumTax').textContent = fmt(tax);
  $('#sumTotal').textContent = fmt(total);
  $('#btnCheckout').disabled = selected.length===0;
}

// ===== 事件：全選/刪除/優惠碼/結帳 =====
$('#checkAll').addEventListener('change', e=>{
  state.items.forEach(i=> i.selected = e.target.checked);
  state.save(); render();
});

$('#delSelected').addEventListener('click', ()=>{
  state.items = state.items.filter(i=> !i.selected);
  state.save(); render();
});

function applyPromo(){
  const code = ($('#promoInput').value||'').trim().toUpperCase();
  const msg = $('#promoMsg');
  msg.textContent = '';
  if(!code){ msg.textContent='請輸入優惠碼'; return; }
  if(code==='SAVE100'){ state.promo={code,type:'amount',value:100}; msg.textContent='已套用：折扣 100'; }
  else if(code==='SAVE10'){ state.promo={code,type:'percent',value:0.10}; msg.textContent='已套用：九折'; }
  else { state.promo=null; msg.textContent='無效的優惠碼'; }
  renderSummary();
}
$('#applyPromo').addEventListener('click', applyPromo);
$('#promoInput').addEventListener('keydown', e=>{ if(e.key==='Enter'){ e.preventDefault(); applyPromo(); }});

// 結帳（兩種：A 直接 alert；B 帶到下一頁）
$('#btnCheckout').addEventListener('click', ()=>{
  const selected = state.items.filter(i=>i.selected);
  if(!selected.length){ alert('請先選擇商品'); return; }

  // ====== B：帶到 OrderConfirmation.html（若你有該頁） ======
  const subtotal = selected.reduce((s, i) => s + i.price * i.qty, 0);
  const shipping = subtotal >= FREE_SHIP ? 0 : BASE_SHIP;
  const tax = +(subtotal * TAX_RATE).toFixed(2);
  const discount = state.promo
    ? (state.promo.type === 'amount'
        ? Math.min(state.promo.value, subtotal)
        : +(subtotal * state.promo.value).toFixed(2))
    : 0;
  const total = Math.max(0, subtotal + shipping + tax - discount);

  sessionStorage.setItem('checkoutItems', JSON.stringify(selected));
  sessionStorage.setItem('checkoutSummary', JSON.stringify({ subtotal, shipping, tax, discount, total, promo: state.promo }));

  // 如果你還沒有 OrderConfirmation.html，只想先看明細，把下一行註解掉並保留 alert 區塊即可。
  location.href = 'OrderConfirmation.html';

  // ====== A：僅彈窗（示範用） ======
  // const lines = selected.map(i => `${i.shop}｜${i.name} x ${i.qty} = ${fmt(i.qty*i.price)}`).join('\n');
   alert(`結帳明細\n\n${lines}\n\n合計：${fmt(total)}`);
});
