// ==== 假資料（摘要） ====
const state = {
  items: [
    { id: 1, title: '男裝｜素色短T', price: 390, qty: 2 },
    { id: 2, title: '女裝｜高腰牛仔褲', price: 780, qty: 1 },
    { id: 3, title: '童裝｜印花上衣', price: 320, qty: 3 },
  ],
  promo: null,                         // {code, type:'amount'|'percent', value}

  // 配送 & 付款相關
  delivery: 'home',                    // 'home' | 'store'
  payment: 'card',                     // 'card' | 'linepay' | 'cod'
  SHIPPING_HOME: 90,
  SHIPPING_STORE: 60,
  FREE_THRESHOLD_HOME: 1500,
  FREE_THRESHOLD_STORE: 999,
  COD_FEE: 0,                          // 若要貨到付款手續費就改成數字（例如 30）
};

const $  = (sel) => document.querySelector(sel);
const fmt= (n) => `NT$ ${Number(n||0).toLocaleString()}`;

// ===== 優惠碼規則（一定要先宣告，之後才會用到） =====
const PROMO_CODE = 'SAVE100';
const PROMO_MIN_SUBTOTAL = 1000;

// 小工具
function getSubtotal(){
  return state.items.reduce((s,i)=> s + i.price*i.qty, 0);
}

// ===== 訂單摘要（依配送/付款動態計算；內含門檻驗證） =====
function renderSummary(){
  const box = $('#summaryItems');
  box.innerHTML = state.items.map(i =>
    `<div class="summary-item"><span>${i.title} × ${i.qty}</span><span>${fmt(i.price*i.qty)}</span></div>`
  ).join('');

  const subtotal = getSubtotal();

  // 未達門檻，自動取消已套用折扣
  if (state.promo && subtotal < PROMO_MIN_SUBTOTAL) {
    state.promo = null;
    const msg = $('#promoMsg');
    if (msg) msg.textContent = `未達 ${fmt(PROMO_MIN_SUBTOTAL)}，折扣已取消`;
  }

  // 折扣
  let discount = 0;
  if(state.promo){
    if(state.promo.type==='amount')  discount = Math.min(state.promo.value, subtotal);
    if(state.promo.type==='percent') discount = Math.round(subtotal * (state.promo.value/100));
  }

  const after = Math.max(0, subtotal - discount);

  // 運費：依配送方式與免運門檻
  let shipping = 0;
  if (subtotal > 0) {
    if (state.delivery === 'home') {
      shipping = after >= state.FREE_THRESHOLD_HOME ? 0 : state.SHIPPING_HOME;
    } else {
      shipping = after >= state.FREE_THRESHOLD_STORE ? 0 : state.SHIPPING_STORE;
    }
  }

  // COD 手續費（如有）
  const codFee = state.payment === 'cod' ? (state.COD_FEE || 0) : 0;

  const total = after + shipping + codFee;

  $('#sumSubtotal').textContent = fmt(subtotal);
  $('#sumDiscount').textContent = `- ${fmt(discount).replace('NT$ ','NT$ ')}`;
  $('#sumShipping').textContent = fmt(shipping);
  $('#sumTotal').textContent   = fmt(total);
}
renderSummary();

// ===== 優惠碼（滿 1000 才能用 SAVE100） =====
$('#btnApplyPromo').addEventListener('click', () => {
  const code = ($('#promoInput').value || '').trim().toUpperCase();
  const msg = $('#promoMsg');
  msg.textContent = '';

  const subtotal = getSubtotal();

  if (!code) {
    state.promo = null;
    msg.textContent = '請輸入折扣碼';
    renderSummary();
    return;
  }

  if (subtotal < PROMO_MIN_SUBTOTAL) {
    const diff = PROMO_MIN_SUBTOTAL - subtotal;
    state.promo = null;
    msg.textContent = `滿 ${fmt(PROMO_MIN_SUBTOTAL)} 才可使用折扣碼，還差 ${fmt(diff)}`;
    renderSummary();
    return;
  }

  if (code === PROMO_CODE) {
    state.promo = { code, type: 'amount', value: 100 }; // 固定折抵 $100
    msg.textContent = '已套用 $100 折抵';
  } else {
    state.promo = null;
    msg.textContent = '無效的折扣碼';
  }
  renderSummary();
});

// ===== 收件人切換 =====
const buyer = {
  name: $('#buyerName'), email: $('#buyerEmail'), mobile: $('#buyerMobile'),
  phone: $('#buyerPhone'), city: $('#buyerCity'), district: $('#buyerDistrict'), address: $('#buyerAddress'),
};
const recv = {
  name: $('#recvName'), mobile: $('#recvMobile'), phone: $('#recvPhone'),
  city: $('#recvCity'), district: $('#recvDistrict'), address: $('#recvAddress'), note: $('#recvNote'),
};
function fillRecvFromBuyer(){
  recv.name.value=buyer.name.value; recv.mobile.value=buyer.mobile.value; recv.phone.value=buyer.phone.value;
  recv.city.value=buyer.city.value; recv.district.value=buyer.district.value; recv.address.value=buyer.address.value;
}
function setRecvDisabled(disabled){
  Object.values(recv).forEach(el=>{ if(el && el.tagName) el.disabled = disabled; });
  $('#recvNote').disabled = !!disabled;
}

$('#recvTabs').addEventListener('change', (e) => {
  const val = e.target.value;
  if(val==='same'){ fillRecvFromBuyer(); setRecvDisabled(true); }
  else if(val==='recent'){
    setRecvDisabled(false);
    // 示意「最近地址」
    recv.name.value='王小明';
    recv.mobile.value='0911-222-333';
    recv.phone.value='(02) 2266-7788 分機 111';
    recv.city.value='台北市';
    recv.district.value='松山區';
    recv.address.value='南京東路五段 100 號 10 樓';
  }else{ setRecvDisabled(false); }
});
fillRecvFromBuyer(); setRecvDisabled(true);

// 同訂購人→同步變更
['input','change'].forEach(evt=>{
  Object.values(buyer).forEach(el=>{
    el.addEventListener(evt, ()=>{
      if(document.querySelector('input[name="recvTab"]:checked')?.value==='same'){ fillRecvFromBuyer(); }
    });
  });
});

// ===== 配送方式（宅配/超商）＋ 付款方式（含 COD） =====
const homeBlock  = $('#homeAddressBlock');   // 宅配地址區塊
const storeBlock = $('#storePickupBlock');   // 超商門市區塊
document.getElementById('deliveryGroup')?.addEventListener('change', (e) => {
  if(e.target.name !== 'delivery') return;
  state.delivery = e.target.value;          // 'home' | 'store'
  const isStore = state.delivery === 'store';
  homeBlock?.classList.toggle('hidden', isStore);
  storeBlock?.classList.toggle('hidden', !isStore);
  // 超商取貨不需要宅配單顯示訂購人
  const showBuyerBox = $('#showBuyerOnLabel');
  if (showBuyerBox) showBuyerBox.disabled = isStore;
  renderSummary();
});

document.getElementById('paymentGroup')?.addEventListener('change', (e) => {
  if(e.target.name !== 'payment') return;
  state.payment = e.target.value;           // 'card' | 'linepay' | 'cod'
  renderSummary();
});

// ===== 發票切換與載具 =====
const invPersonal = $('#invPersonal'), invDonate = $('#invDonate'), invCompany = $('#invCompany'), mobileBox = $('#mobileCarrierBox');
function switchInvoice(t){ invPersonal.classList.toggle('hidden',t!=='personal'); invDonate.classList.toggle('hidden',t!=='donate'); invCompany.classList.toggle('hidden',t!=='company'); }
document.querySelectorAll('input[name="invType"]').forEach(r=> r.addEventListener('change', e => switchInvoice(e.target.value)));
switchInvoice('personal');
document.querySelectorAll('input[name="carrier"]').forEach(r=> r.addEventListener('change', e => mobileBox.classList.toggle('hidden', e.target.value!=='mobile')));

// ===== 送出訂單（加入配送/付款與不同必填） =====
$('#btnSubmit').addEventListener('click', () => {
  const requiredBuyer     = ['#buyerName','#buyerMobile','#buyerCity','#buyerDistrict','#buyerAddress'];
  const requiredRecvHome  = ['#recvName','#recvMobile','#recvCity','#recvDistrict','#recvAddress'];
  const requiredRecvStore = ['#recvName','#recvMobile','#storeBrand','#storeCode','#storeName'];
  const isOk = (arr)=>arr.every(sel => (document.querySelector(sel)?.value || '').trim().length>0);

  const invType = document.querySelector('input[name="invType"]:checked').value;
  let invOk = true;
  if(invType==='personal' && document.querySelector('input[name="carrier"]:checked').value==='mobile'){ invOk = $('#mobileBarcode').value.trim().length>0; }
  if(invType==='donate'){  invOk = $('#donateCode').value.trim().length>0; }
  if(invType==='company'){ invOk = $('#companyName').value.trim().length>0 && $('#taxId').value.trim().length>0; }

  const delivery = document.querySelector('input[name="delivery"]:checked')?.value || state.delivery;
  const payment  = document.querySelector('input[name="payment"]:checked')?.value  || state.payment;

  if(!isOk(requiredBuyer)){ alert('請完整填寫「訂購人」必填欄位'); return; }
  if(delivery==='home'){
    if(document.querySelector('input[name="recvTab"]:checked').value!=='same' && !isOk(requiredRecvHome)){
      alert('請完整填寫「收件人（宅配）」必填欄位'); return;
    }
  }else{
    if(!isOk(requiredRecvStore)){ alert('請完整填寫「收件人（超商取貨）」必填欄位'); return; }
  }
  if(!invOk){ alert('請完整填寫「發票」必填欄位'); return; }

  // 重新計算金額（與摘要一致）
  const subtotal = getSubtotal();
  let discount = 0;
  if(state.promo){
    if(state.promo.type==='amount')  discount = Math.min(state.promo.value, subtotal);
    if(state.promo.type==='percent') discount = Math.round(subtotal * (state.promo.value/100));
  }
  const after = Math.max(0, subtotal - discount);
  let shipFee = 0;
  if(subtotal > 0){
    shipFee = (delivery === 'home')
      ? (after >= state.FREE_THRESHOLD_HOME ? 0 : state.SHIPPING_HOME)
      : (after >= state.FREE_THRESHOLD_STORE ? 0 : state.SHIPPING_STORE);
  }
  const codFee = (payment === 'cod') ? (state.COD_FEE || 0) : 0;
  const total  = after + shipFee + codFee;

  const orderNo = 'OD' + Date.now();
  alert(`下單成功！\n訂單編號：${orderNo}`);

  console.log('[訂單內容]', {
    orderNo,
    delivery,
    payment,
    amounts: { subtotal, discount, shipFee, codFee, total },
    buyer: {
      name: buyer.name.value, email: buyer.email.value, mobile: buyer.mobile.value,
      phone: buyer.phone.value, city: buyer.city.value, district: buyer.district.value, address: buyer.address.value,
    },
    receiver: (delivery === 'home') ? {
      name: recv.name.value, mobile: recv.mobile.value, phone: recv.phone.value,
      city: recv.city.value, district: recv.district.value, address: recv.address.value,
      note: recv.note.value, showBuyer: $('#showBuyerOnLabel').checked
    } : {
      name: recv.name.value, mobile: recv.mobile.value, phone: recv.phone.value,
      storeBrand: $('#storeBrand').value, storeCode: $('#storeCode').value, storeName: $('#storeName').value,
      note: recv.note.value
    },
    invoice: (() => {
      if(invType==='personal') return {
        type:'personal',
        carrier: document.querySelector('input[name="carrier"]:checked').value,
        memberCarrier: $('#memberCarrier').value,
        mobileBarcode: $('#mobileBarcode').value
      };
      if(invType==='donate') return { type:'donate', donateCode: $('#donateCode').value };
      return { type:'company', companyName: $('#companyName').value, taxId: $('#taxId').value };
    })(),
    items: state.items
  });
});
