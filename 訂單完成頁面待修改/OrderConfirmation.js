const fmt = n => '$' + Math.round(Number(n||0)).toString();
const FREE_SHIP = 1500, BASE_SHIP = 0, TAX_RATE = 0.00, PROMO_MIN = 1000;

// 讀資料：先 sessionStorage，再 lastOrder 後備
const ssItems   = (()=>{ try{ return JSON.parse(sessionStorage.getItem('checkoutItems')||'null'); }catch{ return null } })();
const ssSummary = (()=>{ try{ return JSON.parse(sessionStorage.getItem('checkoutSummary')||'null'); }catch{ return null } })();
const lastOrder = (()=>{ try{ return JSON.parse(localStorage.getItem('lastOrder')||'null'); }catch{ return null } })();

console.log('[OC] session items:', ssItems);
console.log('[OC] session summary:', ssSummary);
console.log('[OC] lastOrder:', lastOrder);

let items   = (ssItems && ssItems.length) ? ssItems : (lastOrder?.items || []);
let promo   = ssSummary?.promo ?? lastOrder?.promo ?? null;
let contact = lastOrder?.contact || {name:'', phone:'', address:''};
let pay     = lastOrder?.payment || 'card';
let amounts = ssSummary || lastOrder?.amounts || null;

// 回推 amounts（防呆）
if(!amounts){
  const subtotal = items.reduce((s,i)=> s + (i.price||0)*(i.qty||1), 0);
  const shipping = subtotal >= FREE_SHIP ? 0 : BASE_SHIP;
  const tax = Math.round(subtotal * TAX_RATE);
  let discount = 0;
  if(promo && subtotal >= PROMO_MIN){
    discount = (promo.type === 'amount') ? Math.min(promo.value, subtotal)
             : Math.round(subtotal * (promo.value||0));
  }
  amounts = { subtotal, shipping, tax, discount, total: Math.max(0, subtotal + shipping + tax - discount) };
}

const $ = (s,el=document)=>el.querySelector(s);

(function render(){
  // 訂單 meta
  $('#orderNo')    && ($('#orderNo').textContent = (lastOrder?.orderNo) || genOrderNo());
  $('#orderTime')  && ($('#orderTime').textContent = new Date().toLocaleString('zh-TW'));
  $('#orderPay')   && ($('#orderPay').textContent = pay==='card' ? '信用卡' : '貨到付款');
  $('#orderPromo') && ($('#orderPromo').textContent = promo ? promo.code : '—');

  // 收件
  $('#buyerName')  && ($('#buyerName').textContent  = contact.name || '—');
  $('#buyerPhone') && ($('#buyerPhone').textContent = contact.phone || '—');
  $('#buyerAddr')  && ($('#buyerAddr').textContent  = contact.address || '—');

  // 商品
  const wrap = $('#items');
  if(wrap){
    wrap.innerHTML = '';
    if(!items?.length){
      wrap.innerHTML = '<div class="help">沒有可顯示的商品。</div>';
    }else{
      items.forEach(it=>{
        const row = document.createElement('div');
        row.className = 'item';
        row.innerHTML = `
          <div class="thumb"><img src="${it.img||''}" alt="${it.name||''}" onerror="this.src='images/placeholder.png'"></div>
          <div class="info"><div class="name">${it.name||''}</div><div class="sku">${(it.sku||'')}${it.shop?`｜${it.shop}`:''}</div></div>
          <div class="price">${fmt(it.price)}</div>
          <div class="qty">x${it.qty||1}</div>
          <div class="subtotal">${fmt((it.qty||1)*(it.price||0))}</div>`;
        wrap.appendChild(row);
      });
    }
  }

  // 摘要
  const { subtotal=0, shipping=0, tax=0, discount=0, total=0 } = amounts || {};
  $('#selCount')    && ($('#selCount').textContent    = items?.reduce((s,i)=>s+(i.qty||0),0) || 0);
  $('#sumSub')      && ($('#sumSub').textContent      = fmt(subtotal));
  $('#sumShip')     && ($('#sumShip').textContent     = fmt(shipping));
  $('#sumTax')      && ($('#sumTax').textContent      = fmt(tax));
  $('#sumDiscount') && ($('#sumDiscount').textContent = discount>0 ? ('−'+fmt(discount)) : fmt(0));
  $('#sumTotal')    && ($('#sumTotal').textContent    = fmt(total));

  const pm = $('#promoMsg');
  if(pm){
    if(!promo) pm.textContent = '';
    else if(subtotal >= PROMO_MIN){
      const applied = (promo.type==='amount') ? promo.value : Math.round(subtotal*(promo.value||0));
      pm.textContent = `優惠已套用：${promo.code}（折抵 ${fmt(applied)}）`;
    }else{
      pm.textContent = `已輸入 ${promo.code}，但需滿 ${fmt(PROMO_MIN)} 才生效（本單小計 ${fmt(subtotal)}）`;
    }
  }

  // 按鈕
  document.querySelector('#btnPrint')?.addEventListener('click', ()=> window.print());
  document.querySelector('#btnBack') ?.addEventListener('click', ()=> location.href = './ShoppingCart.html');
})();

function genOrderNo(){
  const t=new Date();
  const y=t.getFullYear(), m=String(t.getMonth()+1).padStart(2,'0'), d=String(t.getDate()).padStart(2,'0');
  const h=String(t.getHours()).padStart(2,'0'), i=String(t.getMinutes()).padStart(2,'0'), s=String(t.getSeconds()).padStart(2,'0');
  return `OC-${y}${m}${d}-${h}${i}${s}`;
}
