
/* ===== legacy script 1 ===== */

(function(){
  function sortedCartTotal(){
    try {
      return (db.cart || []).reduce(function(sum, item){
        return sum + Math.max(0, Number(item.qty || 0));
      }, 0);
    } catch(e) { return 0; }
  }

  window.updateSortedCartBadge = function(){
    var total = sortedCartTotal();

    // Update any existing badge.
    document.querySelectorAll('.sorted-cart-badge').forEach(function(b){
      b.textContent = total;
      b.style.display = total > 0 ? 'flex' : 'none';
    });

    // Add a badge to the buyer-nav Cart button if it doesn't already exist.
    document.querySelectorAll('.buyer-nav button[data-screen="cart"]').forEach(function(btn){
      if(getComputedStyle(btn).position === 'static') btn.style.position = 'relative';
      var badge = btn.querySelector('.sorted-cart-badge');
      if(!badge){
        badge = document.createElement('span');
        badge.className = 'sorted-cart-badge';
        btn.appendChild(badge);
      }
      badge.textContent = total;
      badge.style.display = total > 0 ? 'flex' : 'none';
    });

    // Also update common header cart icons/badges without changing their layout.
    document.querySelectorAll('[data-cart-badge], .cart-badge, .cart-count').forEach(function(b){
      b.textContent = total;
      b.style.display = total > 0 ? '' : 'none';
    });
  };

  window.sortedInlineQuantityChange = function(id, delta, event){
    if(event){
      event.preventDefault();
      event.stopPropagation();
      if(event.stopImmediatePropagation) event.stopImmediatePropagation();
    }

    var p = (db.products || []).find(function(x){ return String(x.id) === String(id); });
    if(!p) return;

    var max = typeof availableStock === 'function'
      ? Math.max(0, Number(availableStock(p)))
      : Math.max(0, Number(p.stock || 0) - Number(p.reserved || 0));

    var item = (db.cart || []).find(function(x){ return String(x.productId) === String(id); });
    var oldQty = item ? Number(item.qty || 0) : 0;
    var newQty = Math.max(0, Math.min(max, oldQty + Number(delta)));

    if(newQty === oldQty) return;

    if(newQty === 0){
      db.cart = (db.cart || []).filter(function(x){
        return String(x.productId) !== String(id);
      });
    } else if(item){
      item.qty = newQty;
    } else {
      db.cart = db.cart || [];
      db.cart.push({productId:p.id, qty:newQty, method:null});
    }

    // Persist, but DO NOT re-render/navigate the product page.
    try { save(); } catch(e) {}

    // Update the exact visible control immediately.
    document.querySelectorAll('.product-qty-control[data-product-id="' + CSS.escape(String(id)) + '"] .qty-value')
      .forEach(function(el){ el.textContent = String(newQty); });

    // Keep every duplicate visible control for the same product synchronized.
    document.querySelectorAll('.product-qty-control').forEach(function(control){
      if(String(control.dataset.productId) === String(id)){
        var value = control.querySelector('.qty-value');
        if(value) value.textContent = String(newQty);
      }
    });

    // Update cart count/badge immediately.
    window.updateSortedCartBadge();
  };

  // Build/refresh quantity controls without replacing the product cards.
  window.syncSortedInlineQuantities = function(){
    var cart = db.cart || [];
    document.querySelectorAll('.product-qty-control[data-product-id]').forEach(function(control){
      var id = String(control.dataset.productId);
      var item = cart.find(function(x){ return String(x.productId) === id; });
      var value = control.querySelector('.qty-value');
      if(value) value.textContent = String(item ? Number(item.qty || 0) : 0);
    });
    window.updateSortedCartBadge();
  };

  // Initial sync and a delayed sync for dynamically-rendered navigation.
  document.addEventListener('DOMContentLoaded', function(){
    setTimeout(window.updateSortedCartBadge, 50);
    setTimeout(window.syncSortedInlineQuantities, 100);
  });
  window.addEventListener('load', function(){
    setTimeout(window.updateSortedCartBadge, 50);
    setTimeout(window.syncSortedInlineQuantities, 100);
  });
})();



/* ===== legacy script 2 ===== */

(function(){
  function handleBusinessQty(e){
    const btn=e.target.closest && e.target.closest('.buyer-business-qty button');
    if(!btn)return;
    const card=btn.closest('.buyer-business-product');
    const id=card && card.getAttribute('data-product-id');
    if(!id)return;

    e.preventDefault();
    e.stopPropagation();
    if(e.stopImmediatePropagation)e.stopImmediatePropagation();

    const delta=(btn.textContent||'').trim()==='+'?1:-1;
    if(typeof window.changeProductQty==='function'){
      window.changeProductQty(String(id),delta);
    }
  }

  document.addEventListener('click',handleBusinessQty,true);
  document.addEventListener('touchend',handleBusinessQty,{capture:true,passive:false});
})();



/* ===== legacy script 4 ===== */

  window.SORTED_SUPABASE_URL = 'https://qyjksetznuszwyfmyqjj.supabase.co';
  window.SORTED_SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_7QmvldDlJSDQGyUZOlJ-7w_D130Fg3E';
  window.sortedSupabase = window.supabase.createClient(
    window.SORTED_SUPABASE_URL,
    window.SORTED_SUPABASE_PUBLISHABLE_KEY,
    { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } }
  );



/* ===== legacy script 5 ===== */

const KEY='SORTED_FULL_PROTO_V1';
const defaultCategories=[
 {id:'cat-grocery',name:'Grocery',type:'products',scope:'marketplace'},
 {id:'cat-electronics',name:'Electronics',type:'products',scope:'marketplace'},
 {id:'cat-fashion',name:'Fashion',type:'products',scope:'marketplace'},
 {id:'cat-pharmacy',name:'Pharmacy',type:'products',scope:'marketplace'},
 {id:'cat-books',name:'Books',type:'products',scope:'marketplace'},
 {id:'cat-furniture',name:'Furniture',type:'products',scope:'marketplace'},
 {id:'cat-hardware',name:'Hardware',type:'products',scope:'marketplace'},
 {id:'cat-pets',name:'Pets',type:'products',scope:'marketplace'},
 {id:'scat-repairs',name:'Repairs',type:'services',scope:'marketplace'},
 {id:'scat-beauty',name:'Beauty',type:'services',scope:'marketplace'},
 {id:'scat-education',name:'Education',type:'services',scope:'marketplace'},
 {id:'scat-home',name:'Home Services',type:'services',scope:'marketplace'},
 {id:'scat-professional',name:'Professional Services',type:'services',scope:'marketplace'},
 {id:'scat-auto',name:'Automotive',type:'services',scope:'marketplace'}
];
let db=JSON.parse(localStorage.getItem(KEY)||'null')||{users:[],businesses:[],categories:defaultCategories,products:[],services:[],cart:[],reservations:[],session:null};
if(!db.categories?.length)db.categories=defaultCategories;
const ODISHA_LOCATIONS=[
 ['Bhubaneswar','Khordha'],['Angul','Angul'],['Boudh','Boudh'],['Balangir','Balangir'],['Bargarh','Bargarh'],['Balasore','Balasore'],['Bhadrak','Bhadrak'],['Cuttack','Cuttack'],['Deogarh','Deogarh'],['Dhenkanal','Dhenkanal'],['Berhampur','Ganjam'],['Paralakhemundi','Gajapati'],['Jharsuguda','Jharsuguda'],['Jajpur','Jajpur'],['Jagatsinghpur','Jagatsinghpur'],['Keonjhar','Keonjhar'],['Bhawanipatna','Kalahandi'],['Phulbani','Kandhamal'],['Koraput','Koraput'],['Kendrapara','Kendrapara'],['Malkangiri','Malkangiri'],['Baripada','Mayurbhanj'],['Nabarangpur','Nabarangpur'],['Nuapada','Nuapada'],['Nayagarh','Nayagarh'],['Puri','Puri'],['Rayagada','Rayagada'],['Sambalpur','Sambalpur'],['Sonepur','Subarnapur'],['Sundargarh','Sundargarh']
];
let currentCategory=null,currentType=null,currentBusiness=null,navigating=false;
let selectedLocation=(()=>{try{return JSON.parse(localStorage.getItem('sortedLocation')||'null')}catch(e){return null}})()||{city:'Bhubaneswar',district:'Khordha',area:''};
function normalizeBusinessLocation(b){
 if(!b)return b;
 if(!b.city){
  const hit=ODISHA_LOCATIONS.find(([city,district])=>[b.locality,b.address,b.name].some(v=>String(v||'').toLowerCase().includes(city.toLowerCase()))||[b.locality,b.address].some(v=>String(v||'').toLowerCase().includes(district.toLowerCase())));
  if(hit){b.city=hit[0];b.district=hit[1];}
 }
 if(!b.district&&b.city){const hit=ODISHA_LOCATIONS.find(x=>x[0]===b.city);if(hit)b.district=hit[1];}
 b.locality=String(b.locality||'').trim();
 return b;
}
function normLocationText(v){return String(v||'').trim().toLowerCase().replace(/[^a-z0-9\s]/g,' ').replace(/\s+/g,' ');}
function locationMatchesBusiness(b){
 if(!selectedLocation||!selectedLocation.city)return true;
 normalizeBusinessLocation(b);
 const city=normLocationText(selectedLocation.city), district=normLocationText(selectedLocation.district);
 const bCity=normLocationText(b?.city), bDistrict=normLocationText(b?.district);
 if(bCity!==city) return false;
 const area=normLocationText(selectedLocation.area);
 if(!area)return true;
 const local=normLocationText(b?.locality), addr=normLocationText(b?.address);
 return local===area || local.includes(area) || addr.includes(area);
}
function updateLocationUI(){
 const el=document.getElementById('locationLabel');
 if(el){const area=selectedLocation?.area?selectedLocation.area+', ':'';el.textContent=area+(selectedLocation?.city||'Bhubaneswar')+', Odisha';}
}
function getBusinessAreas(city){
 const c=normLocationText(city);
 return [...new Set((db.businesses||[]).map(b=>{normalizeBusinessLocation(b);return b;}).filter(b=>normLocationText(b.city)===c && b.locality).map(b=>b.locality))].sort((a,b)=>a.localeCompare(b));
}
function openLocationPicker(){
 const current=selectedLocation?.city||'Bhubaneswar', currentArea=selectedLocation?.area||'';
 const cityOptions=ODISHA_LOCATIONS.map(([city,district])=>`<option value="${esc(city)}" data-district="${esc(district)}" ${city===current?'selected':''}>${esc(city)} — ${esc(district)}</option>`).join('');
 const areaOptions=getBusinessAreas(current).map(a=>`<option value="${esc(a)}" ${a===currentArea?'selected':''}>${esc(a)}</option>`).join('');
 openModal(`<button class="close" onclick="closeModal()">×</button><h2>SELECT LOCATION</h2><p class="muted">Choose a city and, optionally, an area. Only businesses serving that selected area will appear in categories.</p><div class="field"><label>CITY / DISTRICT</label><select id="locCity" onchange="refreshLocationAreas()">${cityOptions}</select></div><div class="field"><label>AREA / LOCALITY</label><select id="locArea"><option value="">ALL AREAS IN THIS CITY</option>${areaOptions}</select><small class="muted">Areas come from business locations. Sellers should enter their exact locality when creating a business.</small></div><div class="field"><label>OR ENTER AN AREA</label><input id="locAreaCustom" placeholder="e.g. Patia, Saheed Nagar" value="" /></div><button class="btn primary full" onclick="applyLocationSelection()">APPLY LOCATION</button>`);
}
function refreshLocationAreas(){
 const city=document.getElementById('locCity')?.value||'Bhubaneswar'; const sel=document.getElementById('locArea'); if(!sel)return;
 const areas=getBusinessAreas(city); sel.innerHTML='<option value="">ALL AREAS IN THIS CITY</option>'+areas.map(a=>`<option value="${esc(a)}">${esc(a)}</option>`).join('');
}
function applyLocationSelection(){
 const city=document.getElementById('locCity')?.value||'Bhubaneswar';
 const district=(ODISHA_LOCATIONS.find(x=>x[0]===city)||[])[1]||'';
 const selected=document.getElementById('locArea')?.value||''; const custom=(document.getElementById('locAreaCustom')?.value||'').trim();
 selectLocation(city,district,custom||selected);
}
function selectLocation(city,district,area=''){
 selectedLocation={city,district,area:String(area||'').trim()};
 try{localStorage.setItem('sortedLocation',JSON.stringify(selectedLocation))}catch(e){}
 updateLocationUI(); closeModal();
 try{homeBusinesses()}catch(e){}
 try{if(typeof renderProducts==='function'&&document.getElementById('products')?.classList.contains('active'))renderProducts(document.getElementById('productSearch')?.value||'')}catch(e){}
 try{if(typeof renderBusinessTiles==='function'&&currentCategory)renderBusinessTiles(currentCategory)}catch(e){}
 toast('Location changed to '+(selectedLocation.area?selectedLocation.area+', ':'')+city+', Odisha');
}
updateLocationUI();


function save(){
  const write=(obj)=>localStorage.setItem(KEY,JSON.stringify(obj));
  try{ write(db); return true; }
  catch(e){
    try{
      const slim=JSON.parse(JSON.stringify(db));
      (slim.products||[]).forEach(p=>{
        if(Array.isArray(p.images)&&p.images.length){ p.image=p.images[0]||p.image||''; delete p.images; }
      });
      (slim.services||[]).forEach(s=>{ if(Array.isArray(s.images)&&s.images.length){ s.image=s.images[0]||s.image||''; delete s.images; } });
      write(slim); db=slim; toast('Storage optimized automatically'); return true;
    }catch(e2){
      toast('Storage is full. Please remove some old product photos before uploading business photos.');
      return false;
    }
  }
}
function uid(p='id'){return p+'-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,7)}
function esc(v){return String(v??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'","&#39;")}
function user(){return db.users.find(u=>u.id===db.session)||null}
function go(id,push=true){
 if(id!=='businessDetail') document.body.classList.remove('business-profile-mode');
 document.querySelectorAll('.screen').forEach(x=>x.classList.remove('active'));
 const el=document.getElementById(id)||document.getElementById('home');el.classList.add('active');
 document.querySelectorAll('.bottom-nav button').forEach(b=>b.classList.toggle('active',b.dataset.screen===id));
 if(push&&!navigating)history.pushState({screen:el.id},'',location.pathname+'#'+el.id);
 scrollTo({top:0,behavior:'smooth'});
}
window.addEventListener('popstate',(event)=>{
  navigating=true;
  try{
    const state=event.state||{};
    const hash=(location.hash||'#home').slice(1);
    const target=state.screen||hash||'home';

    // Dynamically-created detail screens are not part of the original HTML.
    // Restore them when navigating forward, and remove them when navigating back.
    if(target==='productDetail' || target==='product-detail' || target==='product'){
      if(!document.getElementById('productDetail') && state.productId && typeof window.showProductDetail==='function'){
        window.showProductDetail(state.productId,true);
        history.replaceState(state,'',location.href);
      }else{
        const el=document.getElementById('productDetail');
        if(el){document.querySelectorAll('.screen').forEach(x=>x.classList.remove('active'));el.classList.add('active');}
      }
      scrollTo({top:0,behavior:'auto'});
      return;
    }

    if(target==='businessDetail' || target==='business'){
      document.body.classList.add('business-profile-mode');
      if(!document.getElementById('businessDetail') && state.businessId && typeof window.showBusinessProfile==='function'){
        window.showBusinessProfile(state.businessId,true);
        history.replaceState(state,'',location.href);
      }else{
        const el=document.getElementById('businessDetail');
        if(el){document.querySelectorAll('.screen').forEach(x=>x.classList.remove('active'));el.classList.add('active');}
      }
      scrollTo({top:0,behavior:'auto'});
      return;
    }

    // We have navigated away from a dynamic detail screen. Remove it before
    // restoring the actual previous screen.
    document.getElementById('productDetail')?.remove();
    document.getElementById('businessDetail')?.remove();
    document.body.classList.remove('business-profile-mode');

    const id=document.getElementById(target)?target:'home';
    go(id,false);
  }finally{
    navigating=false;
  }
});

// Establish a real starting history entry so the first Android back gesture
// returns to the previous in-app screen instead of jumping to the homepage.
if(!history.state || !history.state.screen){
  try{history.replaceState({screen:'home'},'',location.pathname+'#home')}catch(e){}
}
function toast(msg){const t=document.getElementById('toast');t.textContent=msg;t.style.display='block';clearTimeout(window.__toast);window.__toast=setTimeout(()=>t.style.display='none',2200)}
function openModal(content){document.getElementById('sheet').innerHTML=content;document.getElementById('modal').classList.add('show')}
function closeModal(){document.getElementById('modal').classList.remove('show')}

function openCategories(type){
 currentType=type;go('categories');document.getElementById('categoryTitle').textContent=type.toUpperCase();
 const cats=db.categories.filter(c=>c.type===type);
 document.getElementById('categoryTiles').innerHTML=cats.map(c=>{
   const count=type==='products'?new Set(db.products.filter(p=>p.categoryId===c.id).map(p=>p.businessId)).size:db.businesses.filter(b=>b.businessType==='services'&&String(b.categoryId)===String(c.id)&&locationMatchesBusiness(b)).length;
   return `<button class="tile" onclick="openCategory('${c.id}')"><div class="tile-name">${esc(c.name)}</div><div class="tile-count">${count} ${type==='products'?'Shops':'Providers'}</div></button>`
 }).join('')||`<div class="empty" style="grid-column:1/-1"><strong>No categories yet</strong></div>`;
}
function openCategory(id){
 const c=db.categories.find(x=>x.id===id);if(!c)return;currentCategory=id;currentType=c.type;
 if(c.type==='products'){document.getElementById('productsTitle').textContent=c.name.toUpperCase();document.getElementById('productSearch').value='';currentBusiness=null;renderProducts('');go('products')}
 else{document.getElementById('servicesTitle').textContent=c.name.toUpperCase();document.getElementById('serviceSearch').value='';renderServices('');go('services')}
}
function globalSearch(q){
 if(q.trim()){currentCategory=null;currentType='products';document.getElementById('productsTitle').textContent='SEARCH';document.getElementById('productSearch').value=q;renderProducts(q);go('products')}
 else{currentCategory=null;currentType='products';document.getElementById('productsTitle').textContent='SEARCH';document.getElementById('productSearch').value='';renderProducts('');go('products')}
}
function renderBusinessFilter(){
 const ids=[...new Set(db.products.filter(p=>!currentCategory||p.categoryId===currentCategory).map(p=>p.businessId))];
 const bs=ids.map(id=>db.businesses.find(b=>b.id===id)).filter(Boolean);
 document.getElementById('businessFilter').innerHTML=bs.length?`<div class="business-switch"><button class="business-pill ${!currentBusiness?'active':''}" onclick="currentBusiness=null;renderProducts(document.getElementById('productSearch').value)">All shops</button>${bs.map(b=>`<button class="business-pill ${currentBusiness===b.id?'active':''}" onclick="currentBusiness='${b.id}';renderProducts(document.getElementById('productSearch').value)">${esc(b.name)}</button>`).join('')}</div>`:'';
}
function cartQty(id){
 const item=(db.cart||[]).find(x=>String(x.productId)===String(id));
 return item?Number(item.qty||0):0;
}
function changeProductQty(id,delta){
 const p=db.products.find(x=>String(x.id)===String(id));
 if(!p)return;
 if(user()?.role==='seller'){toast('Seller accounts cannot add products to cart');return}

 const current=cartQty(id);
 let next=current;

 if(delta>0){
   if(availableStock(p)<current+1)return toast('Only '+availableStock(p)+' available');
   if(current){
     const item=db.cart.find(x=>String(x.productId)===String(id));
     if(item)item.qty++;
   }else{
     db.cart=db.cart||[];
     db.cart.push({productId:p.id,qty:1});
   }
   next=current+1;
 }else if(delta<0 && current>0){
   const item=db.cart.find(x=>String(x.productId)===String(id));
   if(current===1) db.cart=db.cart.filter(x=>x!==item);
   else if(item)item.qty--;
   next=Math.max(0,current-1);
 }else{
   return;
 }

 // Persist without re-rendering or navigating.
 save();

 // MULTI-PRODUCT BUSINESS VIEW: update the exact visible quantity now.
 document.querySelectorAll('.buyer-business-product[data-product-id]').forEach(card=>{
   if(String(card.getAttribute('data-product-id'))===String(id)){
     card.querySelectorAll('.buyer-business-qty b').forEach(el=>{
       el.textContent=String(next);
     });
   }
 });

 // GENERIC PRODUCT VIEW: keep its quantity control synchronized too.
 document.querySelectorAll('.product-card[data-product-id]').forEach(card=>{
   if(String(card.getAttribute('data-product-id'))===String(id)){
     card.querySelectorAll('.product-qty b').forEach(el=>{
       el.textContent=String(next);
     });
   }
 });

 // TOTAL ITEMS in cart, not number of different products.
 const total=(db.cart||[]).reduce((n,item)=>{
   return n+Math.max(0,Number(item?.qty||0));
 },0);

 // Update every known badge immediately.
 document.querySelectorAll(
   '[data-cart-count],#cartCount,.cart-count,.cart-badge,.sorted-cart-badge,.buyer-business-cart-count'
 ).forEach(el=>{
   el.textContent=String(total);
   el.style.display=total>0?'':'none';
 });

 // Specifically update the cart badge inside the business storefront header.
 document.querySelectorAll('.buyer-business-cart').forEach(cartButton=>{
   const badge=cartButton.querySelector('.buyer-business-cart-count');
   if(badge){
     badge.textContent=String(total);
     badge.style.display=total>0?'':'none';
   }
 });
}

function renderProducts(q=''){
 renderBusinessFilter();
 const term=q.toLowerCase();
 const list=db.products.filter(p=>{const b=db.businesses.find(x=>x.id===p.businessId);return locationMatchesBusiness(b)&&(!currentCategory||p.categoryId===currentCategory)&&(!currentBusiness||p.businessId===currentBusiness)&&(!term||[p.name,p.description,p.sku].join(' ').toLowerCase().includes(term));});
 const el=document.getElementById('productList');
 if(!list.length){el.innerHTML=`<div class="empty"><strong>No products available</strong>Local sellers will appear here when they add products.</div>`;return}
 el.innerHTML=list.map(p=>{
   const b=db.businesses.find(x=>x.id===p.businessId);const c=db.categories.find(x=>x.id===p.categoryId);
   const me=user(); const sellerView=me&&me.role==='seller';
   return `<article class="product-card" data-product-id="${p.id}" onclick="showProductDetail('${p.id}')"><div class="product-image">${p.image?`<img src="${esc(p.image)}" alt="${esc(p.name)}" onerror="this.style.display='none';this.parentElement.innerHTML='📷'">`:'📷'}</div><div class="product-info"><div class="product-name">${esc(p.name)}</div><div class="product-shop">${esc(b?.name||'Business')} · ${esc(c?.name||'')}</div><div class="product-price">${p.discountPrice?`<s style="color:#777">₹${Number(p.price).toLocaleString('en-IN')}</s> `:''}₹${Number(p.discountPrice||p.price||0).toLocaleString('en-IN')}</div><div class="product-meta"><span class="${availableStock(p)>0?'available':'unavailable'}">${availableStock(p)>0?'✓ '+availableStock(p)+' Available':'✕ Out of stock'}</span><span>📍 ${esc(b?.locality||'Nearby')}</span>${b?.delivery?'<span>Delivery</span>':'<span>Pickup only</span>'}</div>${!sellerView&&availableStock(p)>0?`<div class="product-qty-wrap" onclick="event.stopPropagation()"><div class="product-qty"><button type="button" aria-label="Decrease quantity" onclick="changeProductQty('${p.id}',-1)">−</button><b>${cartQty(p.id)}</b><button type="button" aria-label="Increase quantity" onclick="changeProductQty('${p.id}',1)">+</button></div></div>`:''}</div></article>`
 }).join('');
}
function addToCart(id){
 if(user()?.role==='seller'){toast('Seller accounts cannot add products to cart');return}
 const p=db.products.find(x=>x.id===id);if(!p||availableStock(p)<1)return toast('Out of stock');
 const item=db.cart.find(x=>x.productId===id);if(item){if(item.qty>=availableStock(p))return toast('Only '+availableStock(p)+' available');item.qty++}else db.cart.push({productId:id,qty:1});
 save();toast('Added to cart');renderCart()
}
function renderCart(){
 const el=document.getElementById('cartList');
 if(!db.cart.length){el.innerHTML=`<div class="empty"><strong>Your cart is empty</strong>Find a product and use the + quantity control.</div>`;return}
 const groups={};db.cart.forEach(i=>{const p=db.products.find(x=>x.id===i.productId);if(!p)return;groups[p.businessId]??=[];groups[p.businessId].push({i,p})});
 el.innerHTML=Object.entries(groups).map(([bid,items])=>{
  const b=db.businesses.find(x=>x.id===bid);const total=items.reduce((n,x)=>n+Number(x.p.discountPrice||x.p.price||0)*x.i.qty,0);
  return `<div class="card"><div class="row"><strong>${esc(b?.name||'Business')}</strong><span class="muted">${b?.delivery?'Delivery available':'Self pickup only'}</span></div>${items.map(x=>`<div class="row" style="margin-top:12px"><div><b>${esc(x.p.name)}</b><div class="muted">₹${Number(x.p.discountPrice||x.p.price||0).toLocaleString('en-IN')} × ${x.i.qty}</div></div><div class="qty"><button onclick="changeCart('${x.p.id}',-1)">−</button><b>${x.i.qty}</b><button onclick="changeCart('${x.p.id}',1)">+</button></div></div>`).join('')}<div class="row" style="margin-top:14px"><b>Subtotal ₹${total.toLocaleString('en-IN')}</b><button class="btn primary" onclick="checkoutBusiness('${bid}')">ORDER NOW</button></div></div>`
 }).join('');
}
function changeCart(id,d){
 const i=db.cart.find(x=>String(x.productId)===String(id)),p=db.products.find(x=>String(x.id)===String(id));
 if(!i||!p)return;
 if(d>0&&i.qty>=availableStock(p))return toast('Only '+availableStock(p)+' available');

 i.qty+=d;
 if(i.qty<1) db.cart=db.cart.filter(x=>x!==i);
 else if(i.qty>availableStock(p)) i.qty=availableStock(p);

 save();
 renderCart();

 // Keep every cart badge synchronized immediately, including the header and bottom nav.
 const total=(db.cart||[]).reduce((n,item)=>n+Math.max(0,Number(item?.qty||0)),0);
 document.querySelectorAll('[data-cart-count],#cartCount,.cart-count,.cart-badge,.sorted-cart-badge,.buyer-business-cart-count').forEach(el=>{
   el.textContent=String(total);
   el.style.display=total>0?'':'none';
 });
 if(typeof window.updateSortedCartBadge==='function') window.updateSortedCartBadge();
}
function checkoutBusiness(bid){
 const b=db.businesses.find(x=>x.id===bid);const items=db.cart.filter(i=>db.products.find(p=>p.id===i.productId)?.businessId===bid);if(!items.length)return;
 openModal(`<button class="close" onclick="closeModal()">×</button><h2>Order at ${esc(b.name)}</h2><p class="muted">${esc(b.address||'Local address')}</p><div class="field"><label>RECEIVE IT</label><select id="method">${b.delivery?'<option value="delivery">Home Delivery</option>':''}<option value="pickup">Self Pickup</option></select></div><div class="field"><label>PAYMENT POLICY</label><div class="notice">${esc(b.paymentPolicy||'Pay at store')}</div></div><div class="field"><label>VALID UNTIL</label><input id="expiry" type="time" value="19:00"></div><button class="btn primary full" onclick="confirmBusinessReservation('${bid}')">CONFIRM RESERVATION</button>`);
}
function confirmBusinessReservation(bid){
 const u=requireBuyer(); if(!u)return;
 const b=db.businesses.find(x=>x.id===bid); if(!b)return toast('Business not found');
 const items=db.cart.filter(i=>db.products.find(p=>p.id===i.productId)?.businessId===bid); if(!items.length)return;
 for(const i of items){const p=db.products.find(x=>x.id===i.productId);if(!p||Number(i.qty)<1||availableStock(p)<Number(i.qty))return toast('Stock changed — please review your order');}
 const method=document.getElementById('method')?.value||'pickup';
 const expiryTime=document.getElementById('expiry')?.value||'19:00';
 const expiresAt=nextExpiryTimestamp(expiryTime);
 const number='#SORT-'+Math.floor(10000+Math.random()*89999);
 const otp=String(Math.floor(1000+Math.random()*9000));
 let total=0;const reservationItems=[];
 for(const i of items){
   const p=db.products.find(x=>x.id===i.productId); const qty=Number(i.qty);
   p.reserved=Number(p.reserved||0)+qty;
   const price=Number(p.discountPrice||p.price||0);
   total+=price*qty;
   reservationItems.push({productId:p.id,name:p.name,qty,price,image:p.image||'',images:Array.isArray(p.images)?p.images.slice(0,8):(p.image?[p.image]:[])});
 }
 const r={id:uid('res'),number,businessId:bid,userId:db.session,items:reservationItems,total,method,status:'RESERVED',otp,otpVerified:false,createdAt:Date.now(),validUntil:expiryTime,expiresAt};
 db.reservations.push(r);
 db.cart=db.cart.filter(i=>!items.includes(i)); save();
 if(typeof window.updateSortedCartBadge==='function') window.updateSortedCartBadge();
 document.querySelectorAll('[data-cart-count],#cartCount,.cart-count,.cart-badge,.sorted-cart-badge,.buyer-business-cart-count').forEach(el=>{
   const total=(db.cart||[]).reduce((n,item)=>n+Math.max(0,Number(item?.qty||0)),0);
   el.textContent=String(total);
   el.style.display=total>0?'':'none';
 });
 closeModal();
 openModal(`<button class="close" onclick="closeModal()">×</button><h2>Reservation Confirmed</h2><p class="muted">Your 4-digit handover OTP has been generated for <b>${esc(number)}</b>.</p><div class="notice" style="font-size:28px;text-align:center;letter-spacing:8px;font-weight:900;margin:18px 0">${otp}</div><p class="muted"><b>Show this OTP to the seller only when you receive your order.</b> The seller verifies it at pickup/delivery to complete the order.</p><button class="btn primary full" onclick="closeModal();renderOrders();go('orders')">VIEW ORDER</button>`);
}
function confirmReservationOtp(id){ const r=db.reservations.find(x=>x.id===id); if(r) toast('The seller verifies this OTP at pickup/delivery'); }

function renderOrders(){
 const list=(db.reservations||[]).filter(r=>String(r.userId||r.customerId||'')===String(db.session)).slice().reverse();
 const el=document.getElementById('ordersList');
 if(!el)return;
 el.innerHTML=list.length?list.map(r=>{
   const b=db.businesses.find(x=>x.id===r.businessId);
   const isService=String(r.type||'')==='SERVICE_BOOKING';
   const title=isService?(r.serviceName||'Service booking'):(r.number||'Order');
   const sub=isService?`Service · ${esc(b?.name||'Provider')}`:`${esc(b?.name||'Business')}`;
   const details=isService
     ? `<div style="margin-top:9px"><b>${esc(title)}</b></div><div class="muted" style="margin-top:6px">${esc(r.date||'')} ${r.time?'· '+esc(r.time):''}</div>`
     : `${(r.items||[]).slice(0,3).map(i=>`<div style="margin-top:9px">${esc(i.name)} × ${i.qty}</div>`).join('')}${(r.items||[]).length>3?`<div class="muted" style="margin-top:5px">+ ${(r.items||[]).length-3} more item(s)</div>`:''}`;
   return `<button class="card" style="width:100%;text-align:left;display:block;cursor:pointer" onclick="openOrderDetails('${r.id}')"><div class="row"><b>${esc(title)}</b><span class="status">${esc(r.status||'PENDING')}</span></div><div class="muted" style="margin-top:5px">${sub}</div>${details}<div class="muted" style="margin-top:7px">₹${Number(r.total||r.price||0).toLocaleString('en-IN')}${isService?' · Service booking':` · ${r.method==='delivery'?'Home Delivery':'Self Pickup'}`}</div><div class="muted" style="margin-top:8px;font-size:11px">TAP TO VIEW DETAILS</div></button>`;
 }).join(''):`<div class="empty"><strong>No orders yet</strong>Your confirmed and previous orders will appear here.</div>`;
}
function openOrderDetails(id){
 const r=(db.reservations||[]).find(x=>x.id===id&&String(x.userId||x.customerId||'')===String(db.session)); if(!r)return;
 if(String(r.type||'')==='SERVICE_BOOKING'){ if(typeof window.openServiceBookingDetails==='function'){ window.openServiceBookingDetails(r.id); } return; }
 const b=db.businesses.find(x=>x.id===r.businessId);
 const otpVisible=!r.otpVerified && !['CANCELLED','REJECTED'].includes(r.status);
 openModal(`<button class="close" onclick="closeModal()">×</button><h2>ORDER ${esc(r.number)}</h2><div class="notice"><b>${esc(r.status)}</b><br><span class="muted">${esc(b?.name||'Business')} · ${r.method==='delivery'?'Home Delivery':'Self Pickup'}</span></div><h3 style="margin-top:18px">ITEMS</h3>${r.items.map(i=>{const p=db.products.find(x=>x.id===i.productId);const imgs=productImages(p);return `<div class="card" style="margin:8px 0;display:flex;gap:10px;align-items:center">${imgs[0]?`<img src="${esc(imgs[0])}" style="width:64px;height:64px;object-fit:cover;border-radius:10px">`:''}<div><b>${esc(i.name)}</b><div class="muted">Qty ${i.qty} · ₹${Number(i.price||0).toLocaleString('en-IN')} each</div></div></div>`}).join('')}<div class="row" style="margin-top:14px"><b>TOTAL</b><b>₹${Number(r.total||0).toLocaleString('en-IN')}</b></div>${otpVisible?`<div class="notice" style="margin-top:16px;text-align:center"><div class="muted">HANDOVER OTP — GIVE THIS TO THE SELLER</div><div style="font-size:32px;letter-spacing:9px;font-weight:950;margin-top:8px">${esc(r.otp)}</div><div class="muted" style="margin-top:7px">The seller enters this OTP at pickup/delivery to complete your order.</div></div>`:r.otpVerified?`<div class="notice" style="margin-top:16px">✓ Handover OTP verified by seller.</div>`:''}${['RESERVED — WAITING FOR SELLER CONFIRMATION','CONFIRMED'].includes(r.status)?`<button class="btn danger full" style="margin-top:14px" onclick="closeModal();cancelReservation('${r.id}')">CANCEL ORDER</button>`:''}`);
}
function sellerUserSafe(){const u=db.users.find(x=>x.id===db.session);return !!(u&&u.role==='seller')}
function cancelReservation(id){const r=db.reservations.find(x=>x.id===id&&x.userId===db.session);if(!r||['COLLECTED','DELIVERED','CANCELLED','REJECTED','EXPIRED'].includes(r.status))return;releaseReservationStock(r);r.status='CANCELLED';save();renderOrders();toast('Order cancelled')}
function renderServices(q=''){
 const term=q.toLowerCase();const list=db.services.filter(s=>(!currentCategory||s.categoryId===currentCategory)&&(!term||[s.name,s.description].join(' ').toLowerCase().includes(term)));
 document.getElementById('serviceList').innerHTML=list.length?list.map(s=>{const b=db.businesses.find(x=>x.id===s.businessId);return `<article class="product-card"><div class="product-image">🛠️</div><div class="product-info"><div class="product-name">${esc(s.name)}</div><div class="product-shop">${esc(b?.name||'Provider')}</div><div class="product-price">${s.price?'From ₹'+Number(s.price).toLocaleString('en-IN'):'Price on request'}</div><div class="product-meta"><span class="available">✓ Available</span><span>📍 ${esc(b?.locality||'Nearby')}</span></div><div style="margin-top:8px"><button class="btn primary" onclick="requestService('${s.id}')">REQUEST SERVICE</button></div></div></article>`}).join(''):`<div class="empty"><strong>No services available</strong>Local providers will appear here when they publish services.</div>`;
}
function requestService(id){const s=db.services.find(x=>x.id===id),b=db.businesses.find(x=>x.id===s.businessId);openModal(`<button class="close" onclick="closeModal()">×</button><h2>${esc(s.name)}</h2><p class="muted">${esc(b?.name||'Provider')}</p><div class="field"><label>YOUR REQUEST</label><textarea id="serviceRequest" placeholder="Describe what you need"></textarea></div><button class="btn primary full" onclick="toast('Service request sent');closeModal()">SEND REQUEST</button>`)}
function renderProfile(){
 const u=user();const el=document.getElementById('profileContent');
 if(!u){el.innerHTML=`<div class="card"><h2 style="margin-top:0">Welcome to SORTED</h2><p class="muted">Sign up to order products, request services, or sell locally.</p><button class="btn primary full" onclick="setAuthMode('login');go('auth')">LOG IN</button><button class="btn secondary full" style="margin-top:8px" onclick="setAuthMode('signup');go('auth')">CREATE ACCOUNT</button></div>`;return}
 const businesses=db.businesses.filter(b=>b.ownerId===u.id);
 el.innerHTML=`<div class="card"><h2 style="margin:0">${esc(u.name)}</h2><div class="muted">${esc(u.contact)} · ${u.role.toUpperCase()}</div></div>${u.role==='seller'?`<div class="card"><div class="row"><b>MY BUSINESSES</b><button class="btn primary" onclick="createBusiness()">+ BUSINESS</button></div>${businesses.length?businesses.map(b=>`<div class="row" style="margin-top:12px"><span>${esc(b.name)}</span><button class="btn secondary" onclick="openSeller('${b.id}')">MANAGE</button></div>`).join(''):'<div class="empty" style="padding:25px">No businesses yet.</div>'}</div>`:''}<button class="btn secondary full" onclick="logout()">SIGN OUT</button>`;
}
function setAuthMode(mode){
 const login=mode==='login';
 document.getElementById('loginForm').style.display=login?'block':'none';
 document.getElementById('signupForm').style.display=login?'none':'block';
 document.getElementById('authTabLogin').classList.toggle('active',login);
 document.getElementById('authTabSignup').classList.toggle('active',!login);
 setTimeout(()=>{const id=login?'loginContact':'authName';document.getElementById(id)?.focus()},30);
}
function loginAccount(){
 const contact=document.getElementById('loginContact').value.trim();
 const password=document.getElementById('loginPassword').value;
 if(!contact)return toast('Enter your phone or email');
 if(!password)return toast('Enter your password');
 const u=db.users.find(x=>String(x.contact).toLowerCase()===contact.toLowerCase());
 if(!u)return toast('Account not found. Please sign up first.');
 // Accounts from the earlier prototype had no password. Keep them usable locally.
 if(u.password && u.password!==password)return toast('Incorrect password');
 db.session=u.id;save();
 if(u.role==='seller'){
   const bs=(db.businesses||[]).filter(b=>b.ownerId===u.id);
   currentBusiness=bs[0]?.id||null;
   if(typeof sellerSelectedBusiness!=='undefined') sellerSelectedBusiness=currentBusiness;
   if(typeof sellerSection!=='undefined') sellerSection='dashboard';
   if(typeof sellerTabName!=='undefined') sellerTabName='dashboard';
   if(typeof setSellerNav==='function') setSellerNav();
   go('seller');
   if(typeof renderSellerShell==='function') renderSellerShell();
   else if(typeof renderSellerTab==='function') renderSellerTab();
   else if(typeof renderSeller==='function') renderSeller();
   toast('Logged in as seller');
 }else{
   renderProfile();go('home');toast('Logged in successfully');
 }
}
function createAccount(){
 const name=document.getElementById('authName').value.trim()||'SORTED User';
 const contact=document.getElementById('authContact').value.trim();
 const password=document.getElementById('authPassword').value;
 const role=document.getElementById('authRole').value;
 if(!contact)return toast('Enter phone or email');
 if(password.length<4)return toast('Password must be at least 4 characters');
 if(db.users.some(x=>String(x.contact).toLowerCase()===contact.toLowerCase()))return toast('An account already exists with that phone/email. Log in instead.');
 const u={id:uid('user'),name,contact,password,role};
 db.users.push(u);db.session=u.id;save();
 if(role==='seller')createBusiness();else{renderProfile();go('home');toast('Account created')}
}
function logout(){
  db.session = null;
  currentBusiness = null;
  if(typeof closeModal==='function') closeModal();
  save();
  if(typeof updateRoleUI==='function') updateRoleUI();
  if(typeof go==='function') go('home');
  toast('Signed out');
}
function createBusiness(){
 if(!user()||user().role!=='seller')return go('auth');
 openModal(`<button class="close" onclick="closeModal()">×</button><h2>Create Business</h2>
 <div class="field"><label>BUSINESS NAME</label><input id="bn" placeholder="ABC Auto Parts"></div>
 <div class="field"><label>OWNER NAME</label><input id="bo" value="${esc(user().name)}"></div>
 <div class="field"><label>PHONE</label><input id="bp" value="${esc(user().contact)}"></div>
 <div class="field"><label>BUSINESS CATEGORY</label><div class="row"><select id="bc">${db.categories.filter(c=>c.type==='products'&&c.scope==='marketplace').map(c=>`<option value="${c.id}">${esc(c.name)}</option>`).join('')}</select><button class="btn secondary" type="button" onclick="createBusinessCategory()">+ CATEGORY</button></div><small class="muted">Choose the category this business belongs to. All products will automatically use it.</small></div>
 <div class="field"><label>ADDRESS</label><input id="ba" placeholder="Full shop address"></div>
 <div class="field"><label>CITY / DISTRICT</label><select id="bcity">${ODISHA_LOCATIONS.map(([city,district])=>`<option value="${city}" ${city==='Bhubaneswar'?'selected':''}>${city} — ${district}</option>`).join('')}</select></div><div class="field"><label>LOCALITY / AREA</label><input id="bl" list="businessAreaList" placeholder="e.g. Patia, Saheed Nagar"><datalist id="businessAreaList"></datalist><small class="muted">Enter the exact area/locality customers should select when shopping.</small></div>
 <div class="field"><label>BUSINESS LOGO</label><input id="blogoFile" type="file" accept="image/*" onchange="previewUpload(this,'businessLogoPreview')"><div id="businessLogoPreview" class="upload-preview"></div></div>
 <div class="field"><label>COVER IMAGE</label><input id="bcoverFile" type="file" accept="image/*" onchange="previewUpload(this,'businessCoverPreview')"><div id="businessCoverPreview" class="upload-preview cover-preview"></div></div>
 <div class="field"><label>OPENING HOURS</label><input id="bhours" placeholder="9:00 AM – 8:00 PM"></div>
 <div class="field"><label>DELIVERY</label><select id="bd"><option value="no">NO, SELF PICKUP ONLY</option><option value="yes">YES, I PROVIDE HOME DELIVERY</option></select></div>
 <div class="field"><label>PAYMENT POLICY</label><select id="bpay"><option>Pay at store</option><option>Online payment accepted</option><option>Advance payment required</option></select></div>
 <button class="btn primary full" onclick="saveBusiness()">CREATE BUSINESS</button>`);
 const dl=document.getElementById('businessAreaList'); if(dl){dl.innerHTML=getBusinessAreas(document.getElementById('bcity')?.value||'Bhubaneswar').map(a=>`<option value="${esc(a)}"></option>`).join('');}
}
async function saveBusiness(){
 let logo='',cover=''; try{logo=await window.imageFrom('blogoFile',360,.55);cover=await window.imageFrom('bcoverFile',1000,.60);}catch(e){toast(e.message||'Could not read business photo. Please choose it again.');return;}
 const b={id:uid('biz'),ownerId:user().id,name:document.getElementById('bn').value.trim()||'My Business',ownerName:document.getElementById('bo').value,phone:document.getElementById('bp').value,categoryId:document.getElementById('bc').value,category:(db.categories.find(c=>c.id===document.getElementById('bc').value)||{}).name||'Local Business',address:document.getElementById('ba').value||'Local address',locality:document.getElementById('bl').value||document.getElementById('bcity')?.value||'Nearby',city:document.getElementById('bcity')?.value||'Bhubaneswar',district:(ODISHA_LOCATIONS.find(x=>x[0]===(document.getElementById('bcity')?.value||'Bhubaneswar'))||[])[1]||'Khordha',logo,cover,hours:document.getElementById('bhours').value||'Opening hours not provided',delivery:document.getElementById('bd').value==='yes',paymentPolicy:document.getElementById('bpay').value};
 db.businesses.push(b);save();closeModal();openSeller(b.id)
}
function openSeller(bid){currentBusiness=bid;go('seller');renderSeller()}
function renderSeller(){
 document.body.classList.toggle('seller-mode', !!(user()&&user().role==='seller'));
 const sn=document.getElementById('sellerDashNav'); if(sn) sn.style.display=(user()&&user().role==='seller')?'grid':'none';
 const u=user(); if(!u||u.role!=='seller'){toast('Seller account required');go('home');return}
 const b=db.businesses.find(x=>x.id===currentBusiness && x.ownerId===u.id);
 if(!b){document.getElementById('sellerContent').innerHTML='<div class="empty"><strong>No business selected</strong>Create a business from Profile.</div>';return}
 const cats=db.categories.filter(c=>c.type==='products'&&(c.scope==='marketplace'||c.businessId===b.id));
 const products=db.products.filter(p=>p.businessId===b.id);
 const reservations=db.reservations.filter(r=>r.businessId===b.id);
 const pending=reservations.filter(r=>['AWAITING CUSTOMER OTP','RESERVED — WAITING FOR SELLER CONFIRMATION','RESERVED','ORDER CONFIRMED'].includes(r.status)).length;
 const confirmed=reservations.filter(r=>r.status==='CONFIRMED').length;
 const ready=reservations.filter(r=>r.status==='READY FOR PICKUP').length;
 const completed=reservations.filter(r=>['COLLECTED','DELIVERED'].includes(r.status)).length;
 document.getElementById('sellerContent').innerHTML=`<div class="page-head"><div class="page-title">SELLER DASHBOARD</div></div>
 <div class="card seller-business-head">${b.cover?`<div class="seller-cover"><img src="${esc(b.cover)}"></div>`:''}<div class="row"><div class="seller-biz-main">${b.logo?`<img class="seller-logo" src="${esc(b.logo)}">`:''}<div><h2 style="margin:0">${esc(b.name)}</h2><div class="muted">${esc(b.address)}</div></div></div><div style="display:flex;gap:6px;flex-wrap:wrap;justify-content:flex-end"><button class="btn secondary" onclick="renderProfile();go('profile')">PROFILE</button><button class="btn danger business-delete-btn" onclick="deleteBusiness('${b.id}')">DELETE BUSINESS</button></div></div><div class="notice" style="margin-top:12px">${b.delivery?'Home Delivery Available':'Self Pickup Only'} · ${esc(b.paymentPolicy)}</div></div>
 <div class="dashboard-stats">
   <div class="stat-card"><b>${pending}</b><span>Pending</span></div><div class="stat-card"><b>${confirmed}</b><span>Confirmed</span></div><div class="stat-card"><b>${ready}</b><span>Ready</span></div><div class="stat-card"><b>${completed}</b><span>Completed</span></div>
 </div>
 <div class="dashboard-actions"><button class="btn primary" onclick="addProduct('${b.id}')">+ PRODUCT</button><button class="btn secondary" onclick="addService()">+ SERVICE</button><button class="btn secondary" onclick="manageCategories('${b.id}')">CATEGORIES</button></div>
 <div class="row" style="margin-bottom:9px"><h3 style="margin:0">PRODUCTS</h3><span class="status">${products.length}</span></div>
 <div class="card">${products.length?products.map(p=>`<div class="row" style="padding:10px 0;border-bottom:1px solid #292a2f"><div class="row" style="gap:10px;flex:1;justify-content:flex-start">${p.image?`<img class="photo-thumb" src="${esc(p.image)}" alt="">`:`<div class="photo-thumb" style="display:grid;place-items:center">📷</div>`}<span><b>${esc(p.name)}</b><small class="muted" style="display:block">${availableStock(p)} available · ${p.reserved||0} reserved</small></span></div><div style="display:flex;gap:6px"><button class="btn secondary" onclick="changeProductImage('${p.id}')">PHOTO</button><button class="btn secondary" onclick="editStock('${p.id}')">STOCK</button><button class="btn danger product-delete-btn" onclick="deleteProduct('${p.id}')">DELETE</button></div></div>`).join(''):'<div class="muted">No products yet.</div>'}</div>
 <div class="row" style="margin-top:18px"><h3 style="margin:0">ORDERS</h3><span class="status">${reservations.length}</span></div>
 <div style="height:8px"></div>${reservations.length?reservations.slice().reverse().map(r=>sellerReservation(r)).join(''):'<div class="card muted">No orders yet.</div>'}`;
}
function sellerReservation(r){return `<div class="card"><div class="row"><b>${r.number}</b><span class="status">${esc(r.status)}</span></div>${r.items.map(i=>`<div style="margin-top:8px">${esc(i.name)} × ${i.qty}</div>`).join('')}<div class="muted" style="margin-top:5px">${r.method==='delivery'?'Home Delivery':'Self Pickup'} · ₹${r.total.toLocaleString('en-IN')}</div><div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:10px">${['AWAITING CUSTOMER OTP','RESERVED — WAITING FOR SELLER CONFIRMATION','RESERVED'].includes(r.status)?`<button class="btn primary" onclick="sellerStatus('${r.id}','CONFIRMED')">ACCEPT</button><button class="btn danger" onclick="sellerStatus('${r.id}','REJECTED')">REJECT</button>`:''}${['CONFIRMED','ORDER CONFIRMED'].includes(r.status)&&r.method==='pickup'?`<button class="btn primary" onclick="sellerStatus('${r.id}','READY FOR PICKUP')">READY</button>`:''}${['CONFIRMED','ORDER CONFIRMED'].includes(r.status)&&r.method==='delivery'?`<button class="btn primary" onclick="sellerStatus('${r.id}','PREPARING')">PREPARING</button>`:''}${r.status==='READY FOR PICKUP'?`<button class="btn primary" onclick="verifyHandoverOtp('${r.id}','COLLECTED')">VERIFY OTP & COMPLETE</button>`:''}${r.status==='PREPARING'?`<button class="btn primary" onclick="sellerStatus('${r.id}','OUT FOR DELIVERY')">OUT FOR DELIVERY</button>`:''}${r.status==='OUT FOR DELIVERY'?`<button class="btn primary" onclick="verifyHandoverOtp('${r.id}','DELIVERED')">VERIFY OTP & COMPLETE</button>`:''}</div></div>`}
window.verifyHandoverOtp=function(id,finalStatus){
 const r=db.reservations.find(x=>x.id===id); if(!r)return;
 openModal(`<button class="close" onclick="closeModal()">×</button><h2>Verify Customer OTP</h2><p class="muted">Ask the customer for the 4-digit OTP shown in their order. Do not reveal the stored OTP to the seller.</p><div class="field"><label>4-DIGIT CUSTOMER OTP</label><input id="sellerHandoverOtp" inputmode="numeric" maxlength="4" pattern="[0-9]{4}" placeholder="0000"></div><button class="btn primary full" onclick="completeHandover('${r.id}','${finalStatus}')">VERIFY & COMPLETE</button>`);
};
window.completeHandover=function(id,finalStatus){
 const r=db.reservations.find(x=>x.id===id); if(!r)return;
 const input=String(document.getElementById('sellerHandoverOtp')?.value||'').replace(/\D/g,'');
 if(input.length!==4 || input!==String(r.otp))return toast('Incorrect OTP — order not completed');
 r.otpVerified=true;r.handoverVerifiedAt=Date.now();r.status=finalStatus;
 save();closeModal();if(window.renderSellerShell)window.renderSellerShell();else renderSeller();toast(finalStatus==='DELIVERED'?'Delivery completed successfully':'Pickup completed successfully');
};
function nextExpiryTimestamp(time){
 const [h,m]=String(time||'19:00').split(':').map(Number); const d=new Date(); d.setHours(Number.isFinite(h)?h:19,Number.isFinite(m)?m:0,0,0); if(d.getTime()<=Date.now())d.setDate(d.getDate()+1); return d.getTime();
}
function releaseReservationStock(r){
 (r.items||[]).forEach(i=>{const p=db.products.find(x=>x.id===i.productId);if(p)p.reserved=Math.max(0,Number(p.reserved||0)-Number(i.qty||0));});
}
function completeReservationStock(r){
 (r.items||[]).forEach(i=>{const p=db.products.find(x=>x.id===i.productId);if(p){p.reserved=Math.max(0,Number(p.reserved||0)-Number(i.qty||0));p.stock=Math.max(0,Number(p.stock||0)-Number(i.qty||0));}});
}
function sellerStatus(id,status){
 const r=db.reservations.find(x=>x.id===id); if(!r)return;
 const seller=user(); const b=db.businesses.find(x=>x.id===r.businessId); if(!seller||!b||b.ownerId!==seller.id)return toast('You can only update your own reservations');
 if(['REJECTED','CANCELLED','EXPIRED'].includes(status)) releaseReservationStock(r);
 if(['COLLECTED','DELIVERED'].includes(status)) completeReservationStock(r);
 r.status=status;save();if(window.renderSellerShell)window.renderSellerShell();else if(window.renderSellerTab)window.renderSellerTab();else renderSeller();toast('Reservation updated')
}
function deleteProduct(id){
 const u=user(); const p=db.products.find(x=>x.id===id);
 if(!p || !u || p.businessId===undefined) return;
 const b=db.businesses.find(x=>x.id===p.businessId);
 if(!b || b.ownerId!==u.id) return toast('You can only delete your own products');
 if(!confirm(`Delete "${p.name}"? This cannot be undone.`)) return;
 db.products=db.products.filter(x=>x.id!==id);
 db.cart=(db.cart||[]).filter(x=>x.productId!==id);
 save(); renderSeller(); toast('Product deleted');
}
function deleteBusiness(id){
 const u=user(); const b=db.businesses.find(x=>x.id===id);
 if(!b || !u || b.ownerId!==u.id) return toast('You can only delete your own business');
 if(!confirm(`Delete "${b.name}" and all its products, services and reservations? This cannot be undone.`)) return;
 const pids=new Set(db.products.filter(p=>p.businessId===id).map(p=>p.id));
 db.products=db.products.filter(p=>p.businessId!==id);
 db.services=(db.services||[]).filter(x=>x.businessId!==id);
 db.reservations=(db.reservations||[]).filter(x=>x.businessId!==id);
 db.cart=(db.cart||[]).filter(x=>!pids.has(x.productId));
 db.businesses=db.businesses.filter(x=>x.id!==id);
 currentBusiness=null; save(); toast('Business deleted'); go('profile'); if(typeof renderProfile==='function') renderProfile();
}
function productImages(p){
 const imgs=Array.isArray(p?.images)?p.images.filter(Boolean):[];
 if(!imgs.length && p?.image) imgs.push(p.image);
 return imgs;
}
async function changeProductImage(id){
 const p=db.products.find(x=>x.id===id); if(!p)return;
 const imgs=productImages(p);
 openModal(`<button class="close" onclick="closeModal()">×</button>
 <h2>Product Photos</h2>
 <p class="muted">Add multiple photos. Customers will be able to swipe through them.</p>
 <div class="field"><label>PRODUCT PHOTOS — MULTIPLE</label><input id="editPiFile" type="file" accept="image/*" multiple onchange="previewMultiUpload(this,'editProductImagePreview')">
 <div id="editProductImagePreview" class="multi-upload-preview">${imgs.map((x,i)=>`<div><img src="${esc(x)}" alt="Photo ${i+1}"><small>Photo ${i+1}</small></div>`).join('')}</div></div>
 <button class="btn primary full" onclick="saveProductImages('${id}')">SAVE PHOTOS</button>`);
}
async function saveProductImages(id){
 const p=db.products.find(x=>x.id===id); if(!p)return;
 let images=[];
 try{images=await window.imageFromMany('editPiFile');}catch(e){toast(e.message||'Could not read photos. Please choose them again.');return;}
 if(!images.length){toast('Choose at least one photo');return;}
 p.images=images.slice(0,8); p.image=p.images[0];
 try{save();}catch(e){toast('Storage is full. Try fewer or smaller photos');return}
 closeModal();renderSeller();toast(`${p.images.length} product photos saved`);
}
function addProduct(bid){
 const b=db.businesses.find(x=>x.id===bid);if(!b)return;
 const cat=db.categories.find(c=>c.id===b.categoryId);
 if(!cat)return toast('Please set a business category first');
 openModal(`<button class="close" onclick="closeModal()">×</button><h2>Add Product</h2>
 <div class="notice">BUSINESS CATEGORY: <b>${esc(cat.name)}</b><br><span class="muted">This product will automatically appear under this category.</span></div>
 <div class="field"><label>PRODUCT NAME</label><input id="pn" placeholder="Maruti Swift Car Cover"></div>
 <div class="field"><label>PRODUCT PHOTOS — SELECT MULTIPLE</label><input id="piFile" type="file" accept="image/*" multiple onchange="previewMultiUpload(this,'productImagePreview')"><div id="productImagePreview" class="multi-upload-preview"></div><small class="muted">Add up to 8 photos. The first photo is the main photo.</small></div>
 <div class="field"><label>PRICE</label><input id="pp" type="number" min="0" placeholder="1200"></div>
 <div class="field"><label>DISCOUNT PRICE (OPTIONAL)</label><input id="pd" type="number" min="0"></div>
 <div class="field"><label>STOCK QUANTITY — REQUIRED</label><input id="ps" type="number" min="0" placeholder="5"></div>
 <div class="field"><label>UNIT</label><input id="pu" placeholder="piece"></div>
 <div class="field"><label>DESCRIPTION</label><textarea id="px"></textarea></div>
 <button class="btn primary full" onclick="saveProduct('${bid}')">LIST PRODUCT</button>`);
}
async function saveProduct(bid){
 const name=document.getElementById('pn').value.trim(),price=Number(document.getElementById('pp').value),stock=Number(document.getElementById('ps').value),b=db.businesses.find(x=>x.id===bid);
 if(!b||!b.categoryId)return toast('Business category is required');
 if(!name||price<0||stock<0)return toast('Name, price and stock are required');
 let images=[];try{images=await window.imageFromMany('piFile');}catch(e){toast(e.message||'Could not read product photos. Please choose them again.');return;}
 const p={id:uid('prod'),businessId:bid,categoryId:b.categoryId,name,images:images.slice(0,8),image:images[0]||'',price,discountPrice:Number(document.getElementById('pd').value)||null,stock,reserved:0,unit:document.getElementById('pu').value||'piece',description:document.getElementById('px').value,sku:'',available:true};
 db.products.push(p);if(!persist('Product listed')){db.products=db.products.filter(x=>x.id!==p.id);return;}
 closeModal();renderSeller();toast(`Product listed under ${(db.categories.find(c=>c.id===b.categoryId)||{}).name||b.category}`);
}
function createBusinessCategory(){
 const name=prompt('New business category name');if(!name||!name.trim())return;const clean=name.trim();
 if(db.categories.some(c=>c.type==='products'&&c.scope==='marketplace'&&c.name.toLowerCase()===clean.toLowerCase()))return toast('Category already exists');
 const c={id:uid('cat'),name:clean,type:'products',scope:'marketplace',createdAt:Date.now(),status:'active'};db.categories.push(c);save();
 const sel=document.getElementById('bc');if(sel){sel.innerHTML=db.categories.filter(x=>x.type==='products'&&x.scope==='marketplace').map(x=>`<option value="${x.id}">${esc(x.name)}</option>`).join('');sel.value=c.id;}toast('Business category created');
}
function editStock(pid){
 const p=db.products.find(x=>x.id===pid);openModal(`<button class="close" onclick="closeModal()">×</button><h2>Update Stock</h2><div class="field"><label>AVAILABLE STOCK</label><input id="stockEdit" type="number" min="0" value="${p.stock}"></div><button class="btn primary full" onclick="saveStock('${pid}')">SAVE STOCK</button>`)
}
function saveStock(pid){const p=db.products.find(x=>x.id===pid);p.stock=Math.max(0,Number(document.getElementById('stockEdit').value)||0);save();closeModal();renderSeller()}
function homeBusinesses(){
 const el=document.getElementById('homeBusinesses');
 if(!el)return;
 const start=new Date(); start.setHours(0,0,0,0);
 const end=new Date(start); end.setDate(end.getDate()+1);
 const sold={};
 (db.reservations||[]).filter(r=>{
   const t=Number(r.createdAt||0);
   const status=String(r.status||'').toUpperCase();
   return t>=start.getTime() && t<end.getTime() && ['COMPLETED','DELIVERED','COLLECTED'].includes(status);
 }).forEach(r=>{
   (r.items||[]).forEach(i=>{ sold[i.productId]=(sold[i.productId]||0)+Number(i.qty||0); });
 });
 let ranked=Object.entries(sold)
   .map(([id,qty])=>({p:db.products.find(x=>x.id===id),qty}))
   .filter(x=>x.p && locationMatchesBusiness(db.businesses.find(b=>b.id===x.p.businessId)))
   .sort((a,b)=>b.qty-a.qty);
 if(!ranked.length){
   const fallback={};
   (db.reservations||[]).filter(r=>{const t=Number(r.createdAt||0);return t>=start.getTime()&&t<end.getTime()&& !['CANCELLED','REJECTED','EXPIRED'].includes(String(r.status||'').toUpperCase());}).forEach(r=>(r.items||[]).forEach(i=>fallback[i.productId]=(fallback[i.productId]||0)+Number(i.qty||0)));
   ranked=Object.entries(fallback).map(([id,qty])=>({p:db.products.find(x=>x.id===id),qty})).filter(x=>x.p && locationMatchesBusiness(db.businesses.find(b=>b.id===x.p.businessId))).sort((a,b)=>b.qty-a.qty);
 }
 if(!ranked.length){
   ranked=(db.products||[]).filter(p=>Number(availableStock(p))>0 && locationMatchesBusiness(db.businesses.find(b=>b.id===p.businessId))).slice().sort((a,b)=>Number(b.reserved||0)-Number(a.reserved||0)).slice(0,6).map(p=>({p,qty:Number(p.reserved||0)}));
 }
 ranked=ranked.slice(0,6);
 el.innerHTML=`<div class="section-title" style="margin-top:28px">FREQUENTLY BOUGHT ITEMS OF THE DAY</div>`+
   (ranked.length?`<div class="product-list" style="margin-top:12px">${ranked.map(({p,qty})=>{const b=db.businesses.find(x=>x.id===p.businessId);return `<article class="product-card" data-product-id="${p.id}" onclick="showProductDetail('${p.id}')"><div class="product-image">${p.image?`<img src="${esc(p.image)}" alt="${esc(p.name)}" onerror="this.style.display='none';this.parentElement.innerHTML='📷'">`:'📷'}</div><div class="product-info"><div class="product-name">${esc(p.name)}</div><div class="product-shop">${esc(b?.name||'Business')}</div><div class="product-price">${p.discountPrice?`<s style="color:#777">₹${Number(p.price).toLocaleString('en-IN')}</s> `:''}₹${Number(p.discountPrice||p.price||0).toLocaleString('en-IN')}</div><div class="product-meta"><span>🔥 ${qty||0} bought today</span><span>${availableStock(p)>0?'✓ Available':'✕ Out of stock'}</span></div>${user()?.role!=='seller'&&availableStock(p)>0?`<div style="margin-top:8px"><button class="btn primary" onclick="event.stopPropagation();addToCart('${p.id}')">+ ADD TO CART</button></div>`:''}</div></article>`;}).join('')}</div>`:`<div class="empty" style="margin-top:12px"><strong>No purchases yet today</strong><div class="muted">Popular products will appear here as customers buy them.</div></div>`);
}
function showBusiness(bid){const b=db.businesses.find(x=>x.id===bid);if(!b)return;currentBusiness=bid;currentCategory=null;document.getElementById('productsTitle').textContent=b.name.toUpperCase();renderProducts('');go('products')}
function init(){
 (db.businesses||[]).forEach(normalizeBusinessLocation);
 try{save()}catch(e){}
 updateLocationUI();homeBusinesses();renderProfile();renderCart();renderOrders();
 if(location.hash){const id=location.hash.slice(1);if(document.getElementById(id))go(id,false)}
}
init();



/* ===== legacy script 6 ===== */

/* SORTED prototype hardening + missing flows */
(function(){
  const originalSave = window.save;
  window.save = function(){
    try { expireReservations(); } catch(e) {}
    return originalSave ? originalSave() : null;
  };

  function currentUser(){
    return db && db.users ? db.users.find(u=>u.id===db.session) : null;
  }
  window.currentUser = currentUser;

  function requireBuyer(){
    const u=currentUser();
    if(!u){ toast('Please log in as a buyer first'); setAuthMode('login'); go('auth'); return null; }
    if(u.role!=='buyer'){ toast('This action is for buyer accounts'); return null; }
    return u;
  }
  window.requireBuyer=requireBuyer;

  function requireSeller(){
    const u=currentUser();
    if(!u){ toast('Please log in as a seller first'); setAuthMode('login'); go('auth'); return null; }
    if(u.role!=='seller'){ toast('Seller account required'); return null; }
    return u;
  }
  window.requireSeller=requireSeller;

  function uniqueBusinessCount(category){
    const ids=new Set((db.products||[]).filter(p=>p.categoryId===category.id).map(p=>p.businessId));
    return ids.size;
  }
  window.uniqueBusinessCount=uniqueBusinessCount;

  window.expireReservations=function(){
    const now=Date.now(); let changed=false;
    (db.reservations||[]).forEach(r=>{
      if(['COLLECTED','DELIVERED','REJECTED','CANCELLED','EXPIRED'].includes(r.status)) return;
      const expires=Number(r.expiresAt||0);
      if(expires && expires<=now){ releaseReservationStock(r); r.status='EXPIRED'; changed=true; }
    });
    if(changed && originalSave) originalSave();
  };

  // Correct available stock and atomic reservation creation.
  window.availableStock=function(p){
    return Math.max(0,Number(p.stock||0)-Number(p.reserved||0));
  };

  window.reserveItemAtomic=function(productId,qty){
    const p=db.products.find(x=>x.id===productId);
    qty=Number(qty||0);
    if(!p || qty<1) return false;
    expireReservations();
    if(availableStock(p)<qty) return false;
    p.reserved=Number(p.reserved||0)+qty;
    return true;
  };

  // Guard all quantity/reservation actions.
  const oldAdd = window.addToCart;
  if(oldAdd){
    window.addToCart=function(productId, qty){
      if(!requireBuyer()) return;
      const p=db.products.find(x=>x.id===productId);
      if(!p) return;
      qty=Number(qty||1);
      const existing=(db.cart||[]).find(x=>x.productId===productId);
      const target=(existing?existing.qty:0)+qty;
      if(availableStock(p)<target){ toast('Only '+availableStock(p)+' available'); return; }
      return oldAdd.apply(this,arguments);
    };
  }

  // Search across products, businesses, categories and services.
  window.globalSearch=function(q){
    q=String(q||'').trim().toLowerCase();
    if(!q){ toast('Type something to search'); return; }
    const products=(db.products||[]).filter(p=>{
      const b=db.businesses.find(x=>x.id===p.businessId);
      const c=db.categories.find(x=>x.id===p.categoryId);
      return [p.name,p.description,p.sku,b&&b.name,c&&c.name].some(v=>String(v||'').toLowerCase().includes(q));
    });
    const businesses=(db.businesses||[]).filter(b=>locationMatchesBusiness(b)&&[b.name,b.category,b.locality,b.address,b.description].some(v=>String(v||'').toLowerCase().includes(q)));
    const categories=(db.categories||[]).filter(c=>String(c.name||'').toLowerCase().includes(q));
    const services=(db.services||[]).filter(s=>[s.name,s.description,s.category,s.providerName,s.serviceArea].some(v=>String(v||'').toLowerCase().includes(q)));
    window._searchResults={products,businesses,categories,services};
    if(typeof renderSearchResults==='function') renderSearchResults(window._searchResults,q);
    else if(typeof go==='function') go('search');
  };

  // Proper product detail.
  window.showProductDetail=function(id,noHistory){
    const previous=document.querySelector('.screen.active')?.id||'home';
    const productId=String(id??'');
    const p=db.products.find(x=>String(x.id)===productId);
    if(!p){ toast('Product not found'); return; }
    const b=db.businesses.find(x=>x.id===p.businessId);
    const delivery=!!b?.delivery;
    const price=Number(p.discountPrice||p.price||0);
    const imgs=productImages(p);
    const old=document.getElementById('productDetail');
    if(old) old.remove();
    const el=document.createElement('section');
    el.id='productDetail'; el.className='screen active';
    el.innerHTML=`<div class="page">
      <div class="page-head"><span></span><b>PRODUCT</b></div>
      <div class="detail-card">
        <div class="product-gallery" id="productGallery_${xesc(p.id)}">
          <div class="product-gallery-track" id="productGalleryTrack_${xesc(p.id)}">${imgs.length?imgs.map((src,i)=>`<div class="product-gallery-slide"><img src="${xesc(src)}" alt="${esc(p.name)} photo ${i+1}"></div>`).join(''):`<div class="product-gallery-slide"><span>PRODUCT</span></div>`}</div>
          ${imgs.length>1?`<button class="gallery-arrow gallery-prev" onclick="productGalleryMove('${xesc(p.id)}',-1)">‹</button><button class="gallery-arrow gallery-next" onclick="productGalleryMove('${xesc(p.id)}',1)">›</button>`:''}
        </div>
        ${imgs.length>1?`<div class="gallery-dots" id="productGalleryDots_${xesc(p.id)}">${imgs.map((_,i)=>`<button class="gallery-dot ${i===0?'active':''}" onclick="productGalleryGo('${xesc(p.id)}',${i})"></button>`).join('')}</div><div class="gallery-hint">Swipe to view ${imgs.length} photos</div>`:''}
        <h1>${esc(p.name)}</h1>
        <div class="price">₹${price.toLocaleString('en-IN')}</div>
        ${p.discountPrice?`<div class="muted"><s>₹${Number(p.price||0).toLocaleString('en-IN')}</s> discounted price</div>`:''}
        <div class="availability">${availableStock(p)>0?'✓ Available':'✕ Out of stock'} · ${availableStock(p)} available</div>
        <p class="muted">${esc(p.description||'No description provided.')}</p>
        <div class="info-box"><b>${esc(b?.name||'Business')}</b><br>${esc(b?.address||'Address not provided')}<br>${esc(b?.locality||'')}<br>${b?.delivery?'Home delivery available':'Self pickup only'} · ${esc(b?.hours||'Hours not provided')}</div>
        <div class="field"><label>QUANTITY</label><input id="detailQty" type="number" min="1" max="${availableStock(p)}" value="1"></div>
        <div class="detail-actions">
          ${delivery?`<button class="btn secondary" onclick="detailReserve('${xesc(p.id)}','delivery')">HOME DELIVERY</button>`:''}
          <button class="btn primary" onclick="detailReserve('${xesc(p.id)}','pickup')">ORDER NOW FOR SELF PICKUP</button>
        </div>
      </div></div>`;
    (document.querySelector('main.shell') || document.querySelector('.app') || document.body).appendChild(el);
    // Product details must always open at the top; otherwise the previous screen's
    // scroll position leaves a large blank area above the detail card.
    window.scrollTo({top:0,left:0,behavior:'auto'});
    document.documentElement.scrollTop=0;
    document.body.scrollTop=0;
    let idx=0, sx=0;
    const track=document.getElementById('productGalleryTrack_'+String(p.id));
    if(track && imgs.length>1){
      track.addEventListener('touchstart',e=>{sx=e.changedTouches[0].clientX;},{passive:true});
      track.addEventListener('touchend',e=>{const dx=e.changedTouches[0].clientX-sx;if(Math.abs(dx)>45){productGalleryMove(p.id,dx<0?1:-1);}},{passive:true});
    }
    window._productGalleryState=window._productGalleryState||{}; window._productGalleryState[String(p.id)]={index:idx,count:imgs.length};
    history.pushState({screen:'productDetail'},'', '#product');
  };
  window.productGalleryGo=function(id,index){
    const p=db.products.find(x=>x.id===id); if(!p)return;
    const imgs=productImages(p); if(!imgs.length)return;
    index=Math.max(0,Math.min(index,imgs.length-1));
    const track=document.getElementById('productGalleryTrack_'+id); if(track) track.style.transform=`translateX(-${index*100}%)`;
    document.querySelectorAll('#productGalleryDots_'+id+' .gallery-dot').forEach((d,i)=>d.classList.toggle('active',i===index));
    window._productGalleryState=window._productGalleryState||{}; window._productGalleryState[id]={index,count:imgs.length};
  };
  window.productGalleryMove=function(id,delta){
    const p=db.products.find(x=>x.id===id); if(!p)return;
    const imgs=productImages(p); if(imgs.length<2)return;
    const state=window._productGalleryState?.[id]||{index:0};
    let next=state.index+delta; if(next<0)next=imgs.length-1; if(next>=imgs.length)next=0;
    productGalleryGo(id,next);
  };
  window.detailReserve=function(id,method){
    if(!requireBuyer()) return;
    const p=db.products.find(x=>x.id===id), q=Math.max(1,Number(document.getElementById('detailQty')?.value ?? document.getElementById('detailQty')?.textContent ?? 1));
    if(!p || availableStock(p)<q){toast('Not enough stock available');return;}
    if(method==='delivery'){
      const b=db.businesses.find(x=>x.id===p.businessId);
      if(!b?.delivery){toast('This seller does not provide delivery');return;}
    }
    const item=(db.cart||[]).find(x=>x.productId===id);
    if(item)item.qty=q;else db.cart.push({productId:id,qty:q,method});
    if(typeof save==='function')save();
    if(typeof renderCart==='function')renderCart();
    go('cart'); toast('Added to reservation');
  };

  // Seller service creation/editing.
  window.addService=function(){
    const u=requireSeller(); if(!u)return;
    const businesses=db.businesses.filter(b=>b.ownerId===u.id);
    if(!businesses.length){toast('Create a business first');return;}
    const b=businesses[0];
    const name=prompt('Service name'); if(!name)return;
    const desc=prompt('Description','Local service'); 
    const category=prompt('Category','Home Services')||'Services';
    const price=prompt('Starting price (optional)','');
    const area=prompt('Service area',b.locality||'');
    db.services=db.services||[];
    db.services.push({id:uid('service'),businessId:b.id,providerName:b.name,name,description:desc||'',category,startingPrice:price||'',serviceArea:area,available:true,phone:b.phone||''});
    save(); toast('Service added'); renderSellerHome?.();
  };

  // Service request/contact flow.
  window.requestService=function(id){
    const u=requireBuyer(); if(!u)return;
    const s=(db.services||[]).find(x=>x.id===id); if(!s)return;
    db.serviceRequests=db.serviceRequests||[];
    db.serviceRequests.push({id:uid('request'),serviceId:id,buyerId:u.id,status:'REQUESTED',createdAt:Date.now()});
    save(); toast('Service request sent'); 
  };
  window.contactService=function(id){
    const s=(db.services||[]).find(x=>x.id===id); if(!s)return;
    const b=db.businesses.find(x=>x.id===s.businessId);
    if(b?.phone) window.location.href='tel:'+b.phone; else toast('Provider contact is not available');
  };

  // Safer product rendering hook: make product cards clickable where possible.
  window.openProduct=function(id){ showProductDetail(id); };

  // Safe cart counter used by the buyer business storefront.
  // v86 referenced cartCount() without defining it, which caused the storefront
  // renderer to throw before the page could be mounted.
  window.cartCount=function(){
    return (db.cart||[]).reduce((n,item)=>n+Math.max(0,Number(item?.qty||0)),0);
  };

  // Buyer business profile: clicking a business opens a storefront-style page
  // with a large cover photo, overlapping profile/logo photo, store details,
  // filter/sort controls and the business's products below.
  window.showBusinessProfile=function(id,noHistory){
    document.body.classList.add('business-profile-mode');
    const previous=document.querySelector('.screen.active')?.id||'home';
    const b=db.businesses.find(x=>x.id===id); if(!b)return;
    const isServiceBusiness=b.businessType==='services';
    const allBusinessProducts=db.products.filter(p=>p.businessId===id);
    const products=allBusinessProducts.slice(0,20);
    const services=(db.services||[]).filter(x=>{ const sid=String(x.businessId||''); const pid=String(x.providerName||'').trim().toLowerCase(); const bn=String(b.name||'').trim().toLowerCase(); return sid===String(id) || (!!pid && !!bn && pid===bn); });
    const el=document.getElementById('businessDetail'); if(el)el.remove();

    const sec=document.createElement('section');
    sec.id='businessDetail';
    sec.className='screen active';

    const cover = b.cover
      ? `<img src="${esc(b.cover)}" alt="${esc(b.name)} cover">`
      : `<div class="buyer-business-cover-placeholder">BUSINESS COVER</div>`;
    const logo = b.logo
      ? `<img src="${esc(b.logo)}" alt="${esc(b.name)} logo">`
      : `<div class="buyer-business-logo-placeholder">🏪</div>`;

    const rating = Number(b.rating||0);
    const reviewCount = Number(b.reviewCount||b.reviews||0);
    const ratingText = rating > 0 ? rating.toFixed(1)+'/5' : '0.00/5';
    const reviewText = reviewCount ? ` (${reviewCount})` : ' (0)';

    const serviceCards=services.length ? services.map(s=>{
      const price=s.price!=null && s.price!=='' ? 'From ₹'+Number(s.price).toLocaleString('en-IN') : (s.startingPrice ? 'From ₹'+Number(s.startingPrice).toLocaleString('en-IN') : 'Price on request');
      return `<article class="buyer-business-product service-business-item" data-service-id="${esc(String(s.id||''))}" data-service-name="${esc(String(s.name||'').toLowerCase())}" onclick="showServiceDetail('${esc(String(s.id||''))}')">
        <div class="buyer-business-product-image service-business-image">${s.image?`<img src="${esc(s.image)}" alt="${esc(s.name||'Service')}" loading="lazy">`:'<span>🛠️</span>'}</div>
        <div class="buyer-business-product-name">${esc(s.name||'Service')}</div>
        <div class="buyer-business-product-price">${price}</div>
        <div class="buyer-business-product-stock">✓ Available</div>
        ${s.description?`<div class="muted" style="font-size:10px;margin:5px 3px;line-height:1.35">${esc(s.description)}</div>`:''}
        <button type="button" class="btn primary full" style="margin-top:8px" onclick="event.stopPropagation();bookService('${esc(s.id)}')">BOOK NOW</button>
      </article>`;
    }).join('') : `<div class="empty" style="grid-column:1/-1"><strong>No services listed yet</strong>This provider has not added any services yet.</div>`;

    sec.innerHTML=`
      <div class="buyer-business-page">
        <div class="buyer-business-topbar">
          <button class="buyer-business-back" type="button" onclick="if(history.length>1)history.back();else go('products')" aria-label="Back">‹</button>
          <div class="buyer-business-search">
            <span>⌕</span>
            <input id="buyerBusinessSearch" placeholder="Search in ${esc(b.name)}..." oninput="${isServiceBusiness ? `filterBuyerBusinessServices('${esc(b.id)}', this.value)` : `filterBuyerBusinessProducts('${esc(b.id)}', this.value)`}">
            <span>⌕</span>
          </div>
          <button class="buyer-business-cart" type="button" onclick="${isServiceBusiness ? `void 0` : `renderCart();go('cart')`}" aria-label="${isServiceBusiness?'Contact':'Cart'}"><span style="position:relative;display:inline-grid;place-items:center">${isServiceBusiness?'☎':'🛍'}${!isServiceBusiness?`<b class="buyer-business-cart-count" style="position:absolute;right:-8px;top:-8px;min-width:17px;height:17px;padding:0 4px;border-radius:9px;background:#111;color:#fff;font-size:9px;line-height:17px">${cartCount()}</b>`:''}</span></button>
        </div>

        <div class="buyer-business-card">
          <div class="buyer-business-cover">${cover}</div>
          <div class="buyer-business-main">
            <div class="buyer-business-logo">${logo}</div>
            <div class="buyer-business-rating">★ <span>${ratingText}</span>${reviewText}</div>
            <h1>${esc(b.name)}</h1>
            <div class="buyer-business-category">${esc(b.category||'Local business')}</div>
            <div class="buyer-business-meta">
              📍 ${esc(b.locality||b.address||'Nearby')} ·
              ${b.delivery?'Home Delivery Available':'Self Pickup Only'}
            </div>
            <div class="buyer-business-info">
              <span>🕒 ${esc(b.hours||'Opening hours not provided')}</span>
              <span>💳 ${esc(b.paymentPolicy||'Pay at store')}</span>
            </div>
          </div>
        </div>

        <div class="buyer-business-toolbar">
          <button type="button" class="buyer-business-control" onclick="${isServiceBusiness ? `filterBuyerBusinessServices('${esc(b.id)}','')` : `toggleBuyerBusinessSort('${esc(b.id)}')`}">☷ &nbsp; ${isServiceBusiness?'All Services':'Filter'} <span>⌄</span></button>
          <button type="button" class="buyer-business-control" onclick="${isServiceBusiness ? `toast('Services are shown by availability')` : `toggleBuyerBusinessSort('${esc(b.id)}')`}">⇅ &nbsp; Sort <span>⌄</span></button>
        </div>

        <div class="buyer-business-products-head">
          <h2>${isServiceBusiness?'Services':'Products'}</h2>
          <span>${isServiceBusiness?services.length:products.length} ${isServiceBusiness?'service':'item'}${(isServiceBusiness?services.length:products.length)===1?'':'s'}</span>
        </div>
        <div id="buyerBusinessProducts" class="buyer-business-product-grid" data-business-id="${esc(b.id)}" data-render-limit="20">
          ${isServiceBusiness ? serviceCards : buyerBusinessProductCards(products)}
        </div>
        ${!isServiceBusiness && allBusinessProducts.length>20 ? `<button type="button" class="buyer-business-load-more" onclick="loadMoreBuyerBusinessProducts('${esc(b.id)}')">SHOW MORE PRODUCTS · ${allBusinessProducts.length-20} LEFT</button>` : ''}
      </div>`;

    // Hide the current buyer screen before showing the dynamic business page.
    document.querySelectorAll('.screen').forEach(x=>x.classList.remove('active'));
    // Mount inside the app's main shell. The previous version appended this
    // screen directly to <body>, which could leave the buyer with a blank
    // viewport because the app layout owns the visible content area.
    const mount=(document.querySelector('main.shell') || document.querySelector('.app') || document.body);
    mount.appendChild(sec);
    sec.classList.add('active');

    if(!noHistory){
      history.pushState(
        {screen:'businessDetail',businessId:id,previous},
        '',
        location.pathname+'#business'
      );
    }
    scrollTo({top:0,behavior:'auto'});
  };

  // Robust buyer store click handler. Business tiles are handled here so a
  // parent/product click handler or inline-handler issue cannot swallow them.
  window.openBuyerBusinessProfile=function(id){
    const bid=String(id||'').trim();
    if(!bid) return;
    try{
      if(typeof window.showBusinessProfile==='function'){
        window.showBusinessProfile(bid,false);
      }else if(typeof window.showBusiness==='function'){
        window.showBusiness(bid);
      }
    }catch(err){
      console.error('Buyer business profile failed:',err);
      if(typeof window.toast==='function') window.toast('Could not open this business');
    }
  };

  function buyerBusinessProductCards(products){
    if(!products.length){
      return `<div class="empty" style="grid-column:1/-1"><strong>No products yet</strong>This business has not added any products.</div>`;
    }
    return products.map(p=>{
      const price=Number(p.discountPrice||p.price||0);
      const oldPrice=p.discountPrice ? Number(p.price||0) : 0;
      const image=p.image || (Array.isArray(p.images)&&p.images[0]) || '';
      const available=availableStock(p)>0;
      return `<article class="buyer-business-product" data-product-id="${esc(p.id)}" data-product-name="${esc(String(p.name||'').toLowerCase())}" onclick="showProductDetail('${esc(p.id)}')">
        <div class="buyer-business-product-image">
          ${image?`<img src="${esc(image)}" alt="${esc(p.name)}" loading="lazy" decoding="async">`:'<span>📷</span>'}
          <button class="buyer-business-heart" type="button" data-favorite-product-id="${esc(p.id)}" aria-label="Add to favorites" onclick="toggleFavorite('${esc(p.id)}',event)">♡</button>
          ${available?`<div class="buyer-business-qty" onclick="event.stopPropagation()"><button type="button" aria-label="Decrease quantity" onclick="changeProductQty('${esc(p.id)}',-1)">−</button><b>${cartQty(p.id)}</b><button type="button" aria-label="Increase quantity" onclick="changeProductQty('${esc(p.id)}',1)">+</button></div>`:''}
        </div>
        <div class="buyer-business-product-name">${esc(p.name)}</div>
        <div class="buyer-business-product-price">${oldPrice?`<s>₹${oldPrice.toLocaleString('en-IN')}</s> `:''}₹${price.toLocaleString('en-IN')}</div>
        <div class="buyer-business-product-stock ${available?'':'out'}">${available?'✓ Available':'✕ Out of stock'}</div>
      </article>`;
    }).join('');
  }

  window.loadMoreBuyerBusinessProducts=function(bid){
    const el=document.getElementById('buyerBusinessProducts'); if(!el)return;
    const all=db.products.filter(p=>String(p.businessId)===String(bid));
    const current=Math.max(20,Number(el.dataset.renderLimit||20));
    const next=Math.min(all.length,current+20);
    el.dataset.renderLimit=String(next);
    el.innerHTML=buyerBusinessProductCards(all.slice(0,next));
    const btn=document.querySelector('.buyer-business-load-more');
    if(btn){if(next<all.length)btn.textContent='SHOW MORE PRODUCTS · '+(all.length-next)+' LEFT';else btn.remove();}
  };

  window.filterBuyerBusinessProducts=function(bid,q){
    const b=db.businesses.find(x=>x.id===bid); if(!b)return;
    const term=String(q||'').trim().toLowerCase();
    const products=db.products.filter(p=>p.businessId===bid && (!term || String(p.name||'').toLowerCase().includes(term) || String(p.description||'').toLowerCase().includes(term)));
    const el=document.getElementById('buyerBusinessProducts');
    if(el)el.innerHTML=buyerBusinessProductCards(products);
  };

  window.toggleBuyerBusinessSort=function(bid){
    const el=document.getElementById('buyerBusinessProducts'); if(!el)return;
    const products=db.products.filter(p=>p.businessId===bid);
    const sorted=products.slice().sort((a,b)=>Number(b.sales||b.sold||0)-Number(a.sales||a.sold||0));
    el.innerHTML=buyerBusinessProductCards(sorted);
    toast('Products sorted by popularity');
  };

  // Escape helper for dynamic HTML.
  window.esc=function(s){return String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));};

  // Patch category counts if the existing category renderer is present.
  const oldRenderCategories=window.renderCategories;
  if(oldRenderCategories){
    window.renderCategories=function(){
      const r=oldRenderCategories.apply(this,arguments);
      document.querySelectorAll('[data-category-id]').forEach(node=>{
        const c=db.categories.find(x=>x.id===node.dataset.categoryId); if(!c)return;
        const count=node.querySelector('.count,.muted,small'); if(count)count.textContent=(c.type==='service'?0:uniqueBusinessCount(c))+' Shops';
      }); return r;
    };
  }

  // Normalize legacy records and add missing storage buckets.
  db.services=db.services||[];
  db.serviceRequests=db.serviceRequests||[];
  db.notifications=db.notifications||[];
  db.categories=db.categories||[];
  db.products=db.products||[];
  db.reservations=db.reservations||[];
  db.cart=db.cart||[];

  // Add sensible legacy defaults.
  db.businesses.forEach(b=>{
    if(b.delivery===undefined)b.delivery=!!b.deliveryAvailable;
    if(!b.paymentPolicy)b.paymentPolicy='Pay at store';
    if(!b.hours)b.hours='Opening hours not provided';
  });
  db.products.forEach(p=>{
    if(p.reserved===undefined)p.reserved=0;
    if(p.available===undefined)p.available=true;
  });
  if(originalSave) originalSave();
})();



/* ===== legacy script 7 ===== */

(function(){
  function enforceSignedOut(){
    const u = (typeof user === 'function') ? user() : null;
    if(!u){
      const dash=document.getElementById('sellerDashNav');
      if(dash) dash.style.display='none';
      document.querySelectorAll('[data-signed-in-only]').forEach(x=>x.style.display='none');
    }
  }
  const oldUpdate = window.updateRoleUI;
  window.updateRoleUI = function(){
    if(oldUpdate) oldUpdate.apply(this, arguments);
    enforceSignedOut();
  };
  setTimeout(enforceSignedOut, 50);
})();



/* ===== legacy script 8 ===== */

function resetSORTEDData(){
  if(!confirm('Delete all profiles, businesses, products, services and reservations and start over?')) return;
  try{
    localStorage.clear();
    sessionStorage.clear();
  }catch(e){}
  location.reload();
}



/* ===== legacy script 9 ===== */

/* SORTED: Products -> Category -> Businesses -> Products */
(function(){
  window.productBrowse = {category:null,business:null};

  function esc(v){
    return String(v ?? '').replace(/[&<>"']/g, c => ({
      '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
    }[c]));
  }

  window.openProductCategory = function(category){
    productBrowse.category = category;
    productBrowse.business = null;
    if(typeof go === 'function') go('productBusinesses');
    else renderProductBrowse();
  };

  window.openProductBusiness = function(id){
    productBrowse.business = id;
    if(typeof go === 'function') go('businessProducts');
    else renderProductBrowse();
  };

  window.backProductBrowse = function(){
    if(productBrowse.business){
      productBrowse.business=null;
      if(typeof go === 'function') go('productBusinesses');
    }else{
      productBrowse.category=null;
      if(typeof go === 'function') go('products');
    }
  };

  window.renderProductBrowse = function(){
    const cat=productBrowse.category;
    const bid=productBrowse.business;
    if(!cat) return;

    const products=(db.products||[]).filter(p =>
      String(p.categoryId||'').toLowerCase()===String((db.categories.find(c=>c.name.toLowerCase()===String(cat).toLowerCase())||{}).id||cat).toLowerCase()
    );
    const ids=[...new Set(products.map(p=>p.businessId).filter(Boolean))];
    const businesses=ids.map(id=>(db.businesses||[]).find(b=>b.id===id)).filter(Boolean);
    const business=bid ? businesses.find(b=>b.id===bid) : null;

    const root=document.querySelector('main') || document.body;

    if(!business){
      root.innerHTML=`
        <section class="sb-flow">
          <div class="sb-title">
            <h2>${esc(cat)}</h2>
          </div>
          <p class="sb-sub">Businesses in ${esc(cat)}</p>
          <div class="sb-businesses">
            ${businesses.length ? businesses.map(b=>`
              <button class="sb-business" onclick="openProductBusiness('${esc(b.id)}')">
                <div class="sb-logo">${b.logo?`<img src="${b.logo}" alt="">`:'🏪'}</div>
                <div>
                  <strong>${esc(b.name)}</strong>
                  <span>${esc(b.locality||b.address||'Local business')}</span>
                  <small>${products.filter(p=>p.businessId===b.id).length} products</small>
                </div>
                <b>›</b>
              </button>`).join('') :
              `<div class="sb-empty">No businesses have products in this category yet.</div>`}
          </div>
        </section>`;
      return;
    }

    const list=products.filter(p=>p.businessId===bid);
    root.innerHTML=`
      <section class="sb-flow">
        <div class="sb-title">
          <div><h2>${esc(business.name)}</h2><p>${esc(cat)}</p></div>
        </div>
        <p class="sb-sub">${esc(business.address||business.locality||'Local business')} · ${business.delivery?'Home delivery':'Pickup only'}</p>
        <div class="sb-products">
          ${list.length ? list.map(p=>`
            <article class="sb-product">
              <div class="sb-photo">${p.image?`<img src="${p.image}" alt="">`:'📦'}</div>
              <div class="sb-product-info">
                <strong>${esc(p.name)}</strong>
                <b>₹${esc(p.discountPrice||p.price||0)}</b>
                <span class="${Number(p.stock)>0?'available':'out'}">${Number(p.stock)>0?'✓ '+Number(p.stock)+' Available':'✕ Out of stock'}</span>
                ${typeof user==='function' && user()?.role==='buyer' && Number(p.stock)>0
                  ? `<button onclick="addToCart('${esc(p.id)}')">+ ORDER NOW</button>` : ''}
              </div>
            </article>`).join('') :
            `<div class="sb-empty">No products listed by this business in this category.</div>`}
        </div>
      </section>`;
  };

  const st=document.createElement('style');
  st.textContent=`
    .sb-flow{padding:28px 34px 100px}
    .sb-title{display:flex;align-items:center;gap:14px;margin-bottom:8px}
    .sb-title button{border:0;background:none;color:#eee;font-size:30px}
    .sb-title h2{margin:0;font-size:25px}.sb-title p{margin:3px 0;color:#85858d}
    .sb-sub{color:#85858d;margin:0 0 22px}
    .sb-businesses{display:grid;grid-template-columns:1fr 1fr;gap:18px}
    .sb-business{min-height:125px;border:1px solid #173f31;border-radius:24px;background:#19191c;color:#eee;padding:18px;display:flex;align-items:center;gap:14px;text-align:left}
    .sb-logo{width:58px;height:58px;border-radius:17px;background:#24252a;display:grid;place-items:center;overflow:hidden;font-size:24px;flex:none}
    .sb-logo img{width:100%;height:100%;object-fit:cover}
    .sb-business div:nth-child(2){display:flex;flex-direction:column;gap:4px;min-width:0}
    .sb-business span,.sb-business small{color:#85858d}.sb-business b{margin-left:auto;color:#20e889;font-size:28px}
    .sb-products{display:flex;flex-direction:column;gap:18px}
    .sb-product{display:flex;gap:18px;padding:18px;background:#19191c;border:1px solid #292a2e;border-radius:22px}
    .sb-photo{width:125px;height:125px;border-radius:18px;background:#24252a;display:grid;place-items:center;font-size:40px;overflow:hidden;flex:none}
    .sb-photo img{width:100%;height:100%;object-fit:cover}
    .sb-product-info{display:flex;flex-direction:column;gap:7px}.sb-product-info strong{font-size:20px}.sb-product-info b{font-size:18px}
    .sb-product-info .available{color:#20e889;font-weight:700}.sb-product-info .out{color:#f06a6a;font-weight:700}
    .sb-product-info button{align-self:flex-start;border:0;background:#20e889;color:#06130c;border-radius:13px;padding:11px 17px;font-weight:900}
    .sb-empty{padding:50px 20px;text-align:center;color:#85858d;border:1px dashed #333;border-radius:20px}
    @media(max-width:650px){.sb-flow{padding:28px 34px 100px}.sb-businesses{gap:16px}.sb-business{padding:16px;min-height:116px}.sb-logo{width:52px;height:52px}.sb-product{padding:16px}.sb-photo{width:112px;height:112px}}
  `;
  document.head.appendChild(st);

  // Intercept category selection from the existing Products category screen.
  document.addEventListener('click', function(e){
    const tile=e.target.closest('[data-product-category]');
    if(tile) openProductCategory(tile.dataset.productCategory);
  });
})();



/* ===== legacy script 10 ===== */

(function(){
  async function imageToDataURL(file){
    if(!file) return '';
    const name=String(file.name||'').toLowerCase(), type=String(file.type||'').toLowerCase();
    if(!(type.startsWith('image/') || /\.(jpg|jpeg|png|webp|gif|bmp|heic|heif|avif)$/i.test(name))) throw new Error('Please select an image file');
    if(file.size>20*1024*1024) throw new Error('Image must be under 20 MB');
    return await new Promise((resolve,reject)=>{
      const r=new FileReader();
      r.onload=()=>resolve(String(r.result||''));
      r.onerror=()=>reject(new Error('Could not read image. Please choose the photo again.'));
      try{r.readAsDataURL(file);}catch(e){reject(new Error('Could not read image. Please choose the photo again.'));}
    });
  }

  window.readUpload = imageToDataURL;

  window.previewUpload = function(input,targetId){
    const file=input && input.files && input.files[0];
    const target=document.getElementById(targetId);
    if(!file || !target) return;
    if(file.type && !file.type.startsWith('image/')){
      target.textContent='Please select an image';
      input.value='';
      return;
    }
    const url=URL.createObjectURL(file);
    target.innerHTML='<img src="'+url+'" alt="Photo preview">';
    target.querySelector('img').onload=()=>URL.revokeObjectURL(url);
  };

  window.previewMultiUpload=function(input,targetId){
    const target=document.getElementById(targetId);
    if(!target) return;
    const files=Array.from(input?.files||[]).slice(0,8);
    target.innerHTML='';
    files.forEach((file,i)=>{
      const box=document.createElement('div'); box.className='multi-upload-item';
      const img=document.createElement('img'); img.alt='Photo '+(i+1);
      img.onload=()=>URL.revokeObjectURL(img.src);
      img.src=URL.createObjectURL(file);
      const cap=document.createElement('small'); cap.textContent=i===0?'Main photo':'Photo '+(i+1);
      box.appendChild(img); box.appendChild(cap); target.appendChild(box);
    });
    if((input?.files?.length||0)>8) toast('Only the first 8 photos will be used');
  };
})();



/* ===== legacy script 11 ===== */

(function(){
  window.editBusiness = function(id){
    const b=(db.businesses||[]).find(x=>x.id===id);
    if(!b) return;
    const name=prompt('Business name',b.name||'');
    if(name===null) return;
    const address=prompt('Address',b.address||'');
    if(address===null) return;
    const locality=prompt('Locality / area',b.locality||'');
    if(locality===null) return;
    const phone=prompt('Phone number',b.phone||'');
    if(phone===null) return;
    b.name=name.trim()||b.name;
    b.address=address.trim();
    b.locality=locality.trim();
    b.phone=phone.trim();
    save();
    if(typeof render==='function') render();
    toast('Business updated');
  };

  window.editBusinessPhoto = async function(id,type,input){
    const b=(db.businesses||[]).find(x=>x.id===id);
    if(!b || !input.files[0]) return;
    try{
      const data=await window.readUpload(input.id);
      if(!data) throw new Error('No image');
      b[type]=data;
      save();
      if(typeof render==='function') render();
      toast(type==='logo'?'Logo updated':'Cover image updated');
    }catch(e){
      toast('Could not upload photo. Please try another image.');
    }finally{
      input.value='';
    }
  };
})();



/* ===== legacy script 12 ===== */

/* SORTED: category -> business profile tiles -> business products */
(function(){
  function xesc(v){return String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));}

  function businessProducts(categoryId,businessId){
    return (db.products||[]).filter(p =>
      (!categoryId || p.categoryId===categoryId) &&
      (!businessId || p.businessId===businessId)
    );
  }

  function renderBusinessTiles(categoryId){
    currentCategory=categoryId;
    currentType='products';
    currentBusiness=null;
    const c=db.categories.find(x=>x.id===categoryId);
    if(!c)return;
    const products=businessProducts(categoryId,null);
    const ids=[...new Set(products.map(p=>p.businessId).filter(Boolean))];
    const businesses=ids.map(id=>db.businesses.find(b=>b.id===id)).filter(Boolean);
    document.getElementById('productsTitle').textContent=c.name.toUpperCase();
    document.getElementById('productSearch').value='';
    document.getElementById('businessFilter').innerHTML='';
    const el=document.getElementById('productList');
    el.className='business-profile-grid';
    el.innerHTML=businesses.length ? businesses.map(b=>{
      const ps=products.filter(p=>p.businessId===b.id);
      const available=ps.filter(p=>availableStock(p)>0).length;
      return `<button class="business-profile-tile" data-business-id="${xesc(b.id)}" type="button" onclick="openBuyerBusinessProfile('${xesc(b.id)}')">
        <div class="business-cover">${b.cover?`<img src="${xesc(b.cover)}" alt="">`:'<span>BUSINESS</span>'}</div>
        <div class="business-profile-body">
          <div class="business-profile-logo">${b.logo?`<img src="${xesc(b.logo)}" alt="">`:'🏪'}</div>
          <div class="business-profile-text">
            <strong>${xesc(b.name)}</strong>
            <span>${xesc(b.category||c.name)}</span>
            <small>📍 ${xesc(b.locality||b.address||'Nearby')}</small>
            <small>${ps.length} product${ps.length===1?'':'s'} · ${available} available</small>
          </div>
          <b class="business-arrow">›</b>
        </div>
      </button>`;
    }).join('') : `<div class="empty" style="grid-column:1/-1"><strong>No businesses yet</strong>Businesses with products in ${xesc(c.name)} will appear here.</div>`;
    go('products');
  }

  window.openBusinessProducts=function(bid,categoryId){
    currentBusiness=bid;
    currentCategory=categoryId||currentCategory;
    const b=db.businesses.find(x=>x.id===bid);
    if(!b)return;
    document.getElementById('productsTitle').textContent=b.name.toUpperCase();
    document.getElementById('productSearch').value='';
    const el=document.getElementById('productList');
    el.className='product-list';
    document.getElementById('businessFilter').innerHTML=``;
    const list=businessProducts(currentCategory,bid);
    el.innerHTML=list.length ? list.map(p=>{
      const price=Number(p.discountPrice||p.price||0);
      return `<article class="product-card" onclick="showProductDetail('${xesc(p.id)}')">
        <div class="product-image">${p.image?`<img src="${xesc(p.image)}" alt="${xesc(p.name)}">`:'📷'}</div>
        <div class="product-info"><div class="product-name">${xesc(p.name)}</div><div class="product-shop">${xesc(b.name)} · ${xesc(db.categories.find(c=>c.id===p.categoryId)?.name||'')}</div><div class="product-price">₹${price.toLocaleString('en-IN')}</div><div class="product-meta"><span class="${availableStock(p)>0?'available':'unavailable'}">${availableStock(p)>0?'✓ '+availableStock(p)+' Available':'✕ Out of stock'}</span><span>📍 ${xesc(b.locality||'Nearby')}</span><span>${b.delivery?'Delivery':'Pickup only'}</span></div>${availableStock(p)>0&&user()?.role!=='seller'?`<div style="margin-top:8px"><button class="btn primary" onclick="event.stopPropagation();addToCart('${xesc(p.id)}')">+ ADD TO CART</button></div>`:''}</div>
      </article>`;
    }).join('') : `<div class="empty"><strong>No products in this business</strong>This business has no products in the selected category.</div>`;
    go('products');
  };

  window.renderBusinessTiles=renderBusinessTiles;

  const originalOpenCategory=window.openCategory;
  window.openCategory=function(id){
    const c=db.categories.find(x=>x.id===id);
    if(c && c.type==='products') return renderBusinessTiles(id);
    return originalOpenCategory ? originalOpenCategory(id) : undefined;
  };

  /* The older product-browse patch compared p.category (legacy) instead of p.categoryId.
     Override it so category clicks use the actual product records in this prototype. */
  window.openProductCategory=function(categoryId){ renderBusinessTiles(categoryId); };
  window.openProductBusiness=function(id){ openBusinessProducts(id,currentCategory); };

  // SORTED service marketplace: Services -> Category -> Businesses -> Services.
  // A service business belongs to its selected service category immediately when
  // the business is created, so it must not depend on a service record existing
  // before the business can appear in that category.
  function renderServiceBusinessTiles(categoryId){
    currentCategory=categoryId;
    currentType='services';
    currentBusiness=null;
    const c=db.categories.find(x=>x.id===categoryId && x.type==='services');
    if(!c)return;

    const businesses=(db.businesses||[]).filter(b=>{
      if(b.businessType!=='services')return false;
      if(String(b.categoryId)!==String(categoryId))return false;
      return locationMatchesBusiness(b);
    });

    document.getElementById('servicesTitle').textContent=c.name.toUpperCase();
    document.getElementById('serviceSearch').value='';
    const el=document.getElementById('serviceList');
    el.className='business-profile-grid';

    el.innerHTML=businesses.length ? businesses.map(b=>{
      const services=(db.services||[]).filter(s=>s.businessId===b.id && String(s.categoryId)===String(categoryId));
      return `<button class="business-profile-tile" type="button" onclick="openServiceBusiness('${xesc(b.id)}')">
        <div class="business-cover">${b.cover?`<img src="${xesc(b.cover)}" alt="">`:'<span>BUSINESS</span>'}</div>
        <div class="business-profile-body">
          <div class="business-profile-logo">${b.logo?`<img src="${xesc(b.logo)}" alt="">`:'🛠️'}</div>
          <div class="business-profile-text">
            <strong>${xesc(b.name)}</strong>
            <span>${xesc(b.category||c.name)}</span>
            <small>📍 ${xesc(b.locality||b.address||'Nearby')}</small>
            <small>${services.length} service${services.length===1?'':'s'}</small>
          </div>
          <b class="business-arrow">›</b>
        </div>
      </button>`;
    }).join('') : `<div class="empty" style="grid-column:1/-1">
      <strong>No businesses yet</strong>
      Service businesses created under ${xesc(c.name)} will appear here.
    </div>`;

    go('services');
  }

  window.openServiceBusiness=function(bid){
    const b=db.businesses.find(x=>x.id===bid && x.businessType==='services');
    if(!b)return;
    currentBusiness=bid;
    showBusinessProfile(bid,false);
  };

  window.filterBuyerBusinessServices=function(bid,q){
    const services=(db.services||[]).filter(s=>{ const sid=String(s.businessId||''); const pid=String(s.providerName||'').trim().toLowerCase(); const bn=String(b?.name||'').trim().toLowerCase(); return sid===String(bid) || (!!pid && !!bn && pid===bn); });
    const term=String(q||'').trim().toLowerCase();
    const list=services.filter(s=>!term || [s.name,s.description,s.category,s.serviceArea].join(' ').toLowerCase().includes(term));
    const el=document.getElementById('buyerBusinessProducts');
    if(!el)return;
    el.innerHTML=list.length ? list.map(s=>{
      const price=s.price!=null && s.price!=='' ? 'From ₹'+Number(s.price).toLocaleString('en-IN') : (s.startingPrice ? 'From ₹'+Number(s.startingPrice).toLocaleString('en-IN') : 'Price on request');
      return `<article class="buyer-business-product service-business-item" data-service-id="${esc(String(s.id||''))}" onclick="showServiceDetail('${esc(String(s.id||''))}')">
        <div class="buyer-business-product-image service-business-image">${s.image?`<img src="${esc(s.image)}" alt="${esc(s.name||'Service')}" loading="lazy">`:'<span>🛠️</span>'}</div>
        <div class="buyer-business-product-name">${esc(s.name||'Service')}</div>
        <div class="buyer-business-product-price">${price}</div>
        <div class="buyer-business-product-stock">✓ Available</div>
        ${s.description?`<div class="muted" style="font-size:10px;margin:5px 3px;line-height:1.35">${esc(s.description)}</div>`:''}
        <button type="button" class="btn primary full" style="margin-top:8px" onclick="event.stopPropagation();bookService('${esc(s.id)}')">BOOK NOW</button>
      </article>`;
    }).join('') : '<div class="empty" style="grid-column:1/-1"><strong>No services found</strong>Try another service name.</div>';
  };

  const originalOpenServiceCategory=window.openCategory;
  window.openCategory=function(id){
    const c=db.categories.find(x=>x.id===id);
    if(c && c.type==='services') return renderServiceBusinessTiles(id);
    return originalOpenServiceCategory ? originalOpenServiceCategory(id) : undefined;
  };


  const style=document.createElement('style');
  style.textContent=`
    .service-business-image{background:#f5f7f6!important;}
    .service-business-image span{font-size:42px}
    .business-profile-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px}
    .business-profile-tile{padding:0;overflow:hidden;text-align:left;background:#18191c;border:1px solid #292a2f;border-radius:20px;color:#eee;cursor:pointer;transition:transform .12s ease,border-color .12s ease}
    .business-profile-tile:hover{transform:translateY(-1px);border-color:#20e889}
    .business-cover{height:118px;background:#101114;display:flex;align-items:center;justify-content:center;color:#555;font-size:10px;font-weight:900;overflow:hidden}
    .business-cover img{width:100%;height:100%;object-fit:cover}
    .business-profile-body{padding:13px;display:flex;gap:10px;align-items:center;min-width:0}
    .business-profile-logo{width:48px;height:48px;flex:none;border-radius:13px;background:#24252a;display:grid;place-items:center;overflow:hidden;font-size:21px}
    .business-profile-logo img{width:100%;height:100%;object-fit:cover}
    .business-profile-text{display:flex;flex-direction:column;gap:3px;min-width:0;flex:1}
    .business-profile-text strong{font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .business-profile-text span{font-size:10px;color:#aaa;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .business-profile-text small{font-size:9px;color:#777;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .business-arrow{color:#20e889;font-size:25px;line-height:1}
    .business-back{background:#232428;border:1px solid #34353a;color:#eee;border-radius:10px;padding:8px 11px;font-size:11px;font-weight:800;margin-bottom:10px}
    @media(max-width:520px){.business-profile-grid{grid-template-columns:1fr}.business-cover{height:125px}}
  `;
  document.head.appendChild(style);
})();



/* ===== legacy script 13 ===== */

/* SORTED: business/product persistence + editing hardening */
(function(){
  function compactImage(file, max=600, quality=.58){
    return new Promise((resolve,reject)=>{
      if(!file){resolve('');return;}
      const name=String(file.name||'').toLowerCase();
      const type=String(file.type||'').toLowerCase();
      const looksImage=type.startsWith('image/') || /\.(jpg|jpeg|png|webp|gif|bmp|heic|heif|avif)$/i.test(name);
      if(!looksImage){reject(new Error('Please select an image file'));return;}
      if(file.size > 20*1024*1024){reject(new Error('Image must be under 20 MB'));return;}

      // Android file providers can expose a photo that the browser can display
      // but that cannot be decoded again through a second Image/object-URL path.
      // Read the selected File directly first. This avoids the "Could not decode
      // image" failure seen with some content:// providers.
      const reader=new FileReader();
      reader.onload=async()=>{
        const raw=String(reader.result||'');
        if(!raw){reject(new Error('Could not read image'));return;}

        // If the browser can decode the File as an ImageBitmap, compress it to
        // keep localStorage small. If not, preserve the original data URL rather
        // than failing — the original image is still a valid <img> source.
        try{
          if(window.createImageBitmap){
            let bitmap=null;
            try{ bitmap=await createImageBitmap(file); }catch(e){ bitmap=null; }
            if(bitmap){
              const w=bitmap.width||0,h=bitmap.height||0;
              if(w&&h){
                const scale=Math.min(1,max/Math.max(w,h));
                const c=document.createElement('canvas');
                c.width=Math.max(1,Math.round(w*scale));
                c.height=Math.max(1,Math.round(h*scale));
                const ctx=c.getContext('2d');
                if(ctx){
                  ctx.drawImage(bitmap,0,0,c.width,c.height);
                  const out=c.toDataURL('image/jpeg',quality);
                  bitmap.close&&bitmap.close();
                  if(out&&out.length>100)return resolve(out);
                }
                bitmap.close&&bitmap.close();
              }else{ bitmap.close&&bitmap.close(); }
            }
          }
        }catch(e){}

        // Critical fallback: do NOT try to decode the photo again. Store the
        // FileReader data URL exactly as selected by the user.
        resolve(raw);
      };
      reader.onerror=()=>reject(new Error('Could not read image. Please choose the photo again.'));
      try{reader.readAsDataURL(file);}catch(e){reject(new Error('Could not read image. Please choose the photo again.'));}
    });
  }

  async function imageFrom(id,max=600,quality=.58){
    const el=document.getElementById(id), file=el?.files?.[0];
    if(!file) return '';
    return compactImage(file,max,quality);
  }
  // Expose the single-image helper because the business/product save handlers
  // are installed on window and therefore run outside this helper's scope.
  window.imageFrom = imageFrom;

  async function imageFromMany(id){
    const el=document.getElementById(id);
    const files=Array.from(el?.files||[]).slice(0,8);
    if(!files.length) return [];
    const out=[];
    for(const file of files){ out.push(await compactImage(file)); }
    return out.filter(Boolean);
  }
  window.imageFromMany=imageFromMany;

  function persist(message){
    try{
      const ok=window.save();
      if(ok===false){ toast('Could not save. Try smaller photos or clear old app data.'); return false; }
      return true;
    }catch(e){ toast('Could not save changes: '+(e.message||'storage error')); return false; }
  }

  window.saveBusiness=async function(){
    const u=typeof user==='function'?user():null;
    if(!u || u.role!=='seller'){toast('Seller account required');return;}
    const get=id=>document.getElementById(id);
    const name=get('bn')?.value.trim();
    if(!name){toast('Business name is required');return;}
    let logo='',cover='';
    try{logo=await window.imageFrom('blogoFile');cover=await window.imageFrom('bcoverFile');}
    catch(e){toast(e.message||'Could not read photo');return;}
    const b={
      id:uid('biz'),ownerId:u.id,name,ownerName:get('bo')?.value.trim()||u.name,
      phone:get('bp')?.value.trim()||u.contact,category:get('bc')?.value.trim()||'Local Business',
      address:get('ba')?.value.trim()||'Local address',locality:get('bl')?.value.trim()||'Nearby',
      logo,cover,hours:get('bhours')?.value.trim()||'Opening hours not provided',
      delivery:get('bd')?.value==='yes',paymentPolicy:get('bpay')?.value||'Pay at store'
    };
    db.businesses=db.businesses||[]; db.businesses.push(b);
    if(!persist('Business created')){db.businesses=db.businesses.filter(x=>x.id!==b.id);return;}
    closeModal(); currentBusiness=b.id; homeBusinesses(); openSeller(b.id); toast('Business created successfully');
  };

  window.editBusinessProfile=function(id){
    const u=typeof user==='function'?user():null, b=(db.businesses||[]).find(x=>x.id===id);
    if(!u||!b||b.ownerId!==u.id){toast('You can only edit your own business');return;}
    openModal(`<button class="close" onclick="closeModal()">×</button><h2>Edit Business</h2>
      <div class="field"><label>BUSINESS NAME</label><input id="ebn" value="${esc(b.name)}"></div>
      <div class="field"><label>OWNER NAME</label><input id="ebo" value="${esc(b.ownerName||u.name)}"></div>
      <div class="field"><label>PHONE</label><input id="ebp" value="${esc(b.phone||u.contact)}"></div>
      <div class="field"><label>BUSINESS CATEGORY</label><input id="ebc" value="${esc(b.category||'Local Business')}"></div>
      <div class="field"><label>ADDRESS</label><input id="eba" value="${esc(b.address||'')}"></div>
      <div class="field"><label>LOCALITY / AREA</label><input id="ebl" value="${esc(b.locality||'')}"></div>
      <div class="field"><label>OPENING HOURS</label><input id="ebhours" value="${esc(b.hours||'')}"></div>
      <div class="field"><label>DELIVERY</label><select id="ebd"><option value="no" ${!b.delivery?'selected':''}>NO, SELF PICKUP ONLY</option><option value="yes" ${b.delivery?'selected':''}>YES, I PROVIDE HOME DELIVERY</option></select></div>
      <div class="field"><label>PAYMENT POLICY</label><select id="ebpay"><option ${b.paymentPolicy==='Pay at store'?'selected':''}>Pay at store</option><option ${b.paymentPolicy==='Online payment accepted'?'selected':''}>Online payment accepted</option><option ${b.paymentPolicy==='Advance payment required'?'selected':''}>Advance payment required</option></select></div>
      <button class="btn primary full" onclick="saveBusinessProfile('${id}')">SAVE DETAILS</button>`);
  };

  window.saveBusinessProfile=function(id){
    const u=typeof user==='function'?user():null,b=(db.businesses||[]).find(x=>x.id===id);
    if(!u||!b||b.ownerId!==u.id)return toast('You can only edit your own business');
    const v=id=>document.getElementById(id)?.value.trim()||'';
    b.name=v('ebn')||b.name;b.ownerName=v('ebo');b.phone=v('ebp');b.category=v('ebc')||'Local Business';
    b.address=v('eba');b.locality=v('ebl');b.hours=v('ebhours')||'Opening hours not provided';
    b.delivery=document.getElementById('ebd')?.value==='yes';b.paymentPolicy=document.getElementById('ebpay')?.value||'Pay at store';
    if(!persist('Business updated'))return;
    closeModal();renderSeller();homeBusinesses();toast('Business details updated');
  };

  window.editBusinessPhotoFixed=async function(id,type,input){
    const u=typeof user==='function'?user():null,b=(db.businesses||[]).find(x=>x.id===id);
    if(!u||!b||b.ownerId!==u.id)return toast('You can only edit your own business');
    const file=input?.files?.[0]; if(!file)return;
    try{
      const image=await compactImage(file,type==='cover'?1100:700,.68);
      const old=b[type];b[type]=image;
      if(!persist('Photo updated')){b[type]=old;return;}
      renderSeller();toast(type==='logo'?'Business logo updated':'Business cover updated');
    }catch(e){toast(e.message||'Could not save photo');}
    finally{if(input)input.value='';}
  };

  window.editProduct=function(id){
    const u=typeof user==='function'?user():null,p=(db.products||[]).find(x=>x.id===id),b=p&&db.businesses.find(x=>x.id===p.businessId);
    if(!u||!p||!b||b.ownerId!==u.id){toast('You can only edit your own products');return;}
    const cats=db.categories.filter(c=>c.type==='products'&&(c.scope==='marketplace'||c.businessId===b.id));
    openModal(`<button class="close" onclick="closeModal()">×</button><h2>Edit Product</h2>
      <div class="field"><label>PRODUCT NAME</label><input id="epn" value="${esc(p.name)}"></div>
      <div class="field"><label>CATEGORY</label><select id="epc">${cats.map(c=>`<option value="${esc(c.id)}" ${c.id===p.categoryId?'selected':''}>${esc(c.name)}</option>`).join('')}</select></div>
      <div class="field"><label>PRODUCT PHOTO</label><input id="epFile" type="file" accept="image/*" onchange="previewUpload(this,'editProductPreviewFixed')"><div id="editProductPreviewFixed" class="upload-preview product-upload-preview">${p.image?`<img src="${esc(p.image)}" alt="Current photo">`:''}</div></div>
      <div class="field"><label>PRICE</label><input id="epp" type="number" min="0" value="${Number(p.price||0)}"></div>
      <div class="field"><label>DISCOUNT PRICE</label><input id="epd" type="number" min="0" value="${p.discountPrice==null?'':Number(p.discountPrice)}"></div>
      <div class="field"><label>STOCK QUANTITY</label><input id="eps" type="number" min="0" value="${Number(p.stock||0)}"></div>
      <div class="field"><label>UNIT</label><input id="epu" value="${esc(p.unit||'piece')}"></div>
      <div class="field"><label>DESCRIPTION</label><textarea id="epx">${esc(p.description||'')}</textarea></div>
      <button class="btn primary full" onclick="saveProductEdit('${id}')">SAVE PRODUCT</button>`);
  };

  window.saveProductEdit=async function(id){
    const u=typeof user==='function'?user():null,p=(db.products||[]).find(x=>x.id===id),b=p&&db.businesses.find(x=>x.id===p.businessId);
    if(!u||!p||!b||b.ownerId!==u.id)return toast('You can only edit your own products');
    const v=x=>document.getElementById(x)?.value||'';
    const name=v('epn').trim(),price=Number(v('epp')),stock=Number(v('eps'));
    if(!name||!v('epc')||!Number.isFinite(price)||price<0||!Number.isFinite(stock)||stock<0)return toast('Name, category, price and stock are required');
    let image=p.image||'';
    try{const chosen=await window.imageFrom('epFile');if(chosen)image=chosen;}catch(e){toast(e.message||'Could not read photo');return;}
    const old={...p};
    p.name=name;p.categoryId=v('epc');p.image=image;p.price=price;
    p.discountPrice=v('epd').trim()===''?null:Math.max(0,Number(v('epd')));
    p.stock=stock;p.unit=v('epu').trim()||'piece';p.description=v('epx');
    if(!persist('Product updated')){Object.assign(p,old);return;}
    closeModal();renderSeller();toast('Product details updated');
  };

  // Replace the seller dashboard renderer so editing is always visible.
  const oldRenderSeller=window.renderSeller;
  window.renderSeller=function(){
    oldRenderSeller.apply(this,arguments);
    const u=typeof user==='function'?user():null,b=(db.businesses||[]).find(x=>x.id===currentBusiness&&x.ownerId===u?.id);
    if(!b)return;
    const head=document.querySelector('#sellerContent .seller-business-head');
    if(head){
      const row=head.querySelector('.row');
      if(row && !row.querySelector('[data-edit-business]')){
        const actions=document.createElement('div');actions.style.cssText='display:flex;gap:6px;flex-wrap:wrap';
        actions.innerHTML=`<button class="btn secondary" data-edit-business onclick="editBusinessProfile('${b.id}')">EDIT BUSINESS</button><label class="btn secondary" style="cursor:pointer">LOGO <input type="file" accept="image/*" hidden onchange="editBusinessPhotoFixed('${b.id}','logo',this)"></label><label class="btn secondary" style="cursor:pointer">COVER <input type="file" accept="image/*" hidden onchange="editBusinessPhotoFixed('${b.id}','cover',this)"></label>`;
        row.appendChild(actions);
      }
    }
    document.querySelectorAll('#sellerContent .photo-thumb').forEach(img=>{
      const productRow=img.closest('.row'); if(!productRow)return;
      const text=productRow.querySelector('b'); if(!text)return;
      const p=[...(db.products||[])].find(x=>x.businessId===b.id && x.name===text.textContent);
      if(!p)return;
      const actions=productRow.lastElementChild;
      if(actions && !actions.querySelector('[data-edit-product]')){
        const btn=document.createElement('button');btn.className='btn secondary';btn.dataset.editProduct='1';btn.textContent='EDIT';btn.onclick=()=>editProduct(p.id);actions.insertBefore(btn,actions.firstChild);
      }
    });
  };

  // Make existing home/business tiles open the actual business profile.
  window.showBusiness=function(bid){showBusinessProfile(bid);};
})();



/* ===== legacy script 14 ===== */

/* SORTED v7: Android gallery-safe multi-photo reader.
   The selected Android file is first opened through the same object URL
   mechanism used by the browser preview. This avoids relying on the
   content:// FileReader/arrayBuffer path that was failing on some phones. */
(function(){
  function readBlobAsDataURL(blob){
    return new Promise((resolve,reject)=>{
      try{
        const r=new FileReader();
        r.onload=()=>{ const v=String(r.result||''); v?resolve(v):reject(new Error('Empty image data')); };
        r.onerror=()=>reject(new Error('Could not read image'));
        r.readAsDataURL(blob);
      }catch(e){ reject(new Error('Could not read image')); }
    });
  }

  function objectURLToDataURL(file){
    return new Promise((resolve,reject)=>{
      const url=URL.createObjectURL(file);
      const img=new Image();
      let finished=false;
      const cleanup=()=>{ try{URL.revokeObjectURL(url);}catch(e){} };
      const fail=()=>{ if(finished)return; finished=true; cleanup(); reject(new Error('Could not decode image')); };
      img.onload=()=>{
        if(finished)return;
        try{
          const w=img.naturalWidth||img.width, h=img.naturalHeight||img.height;
          if(!w||!h) return fail();
          const max=1000, scale=Math.min(1,max/Math.max(w,h));
          const c=document.createElement('canvas');
          c.width=Math.max(1,Math.round(w*scale));
          c.height=Math.max(1,Math.round(h*scale));
          const ctx=c.getContext('2d');
          if(!ctx) return fail();
          ctx.drawImage(img,0,0,c.width,c.height);
          const out=c.toDataURL('image/jpeg',.72);
          if(!out) return fail();
          finished=true; cleanup(); resolve(out);
        }catch(e){ fail(); }
      };
      img.onerror=fail;
      try{img.src=url;}catch(e){fail();}
      setTimeout(()=>{if(!finished)fail();},10000);
    });
  }

  async function rawFallback(file){
    // If the browser can expose the object URL but canvas conversion fails,
    // fetch that already-authorized object URL into a Blob and read the Blob.
    // This is deliberately not FileReader(file) or file.arrayBuffer().
    const url=URL.createObjectURL(file);
    try{
      const response=await fetch(url);
      if(!response.ok) throw new Error('Could not open selected photo');
      const blob=await response.blob();
      if(!blob || !blob.size) throw new Error('Empty image file');
      return await readBlobAsDataURL(blob);
    }finally{ try{URL.revokeObjectURL(url);}catch(e){} }
  }

  async function safeOne(file){
    if(!file) return '';
    const name=String(file.name||'').toLowerCase();
    const type=String(file.type||'').toLowerCase();
    const looks=type.startsWith('image/') || /\.(jpg|jpeg|png|webp|gif|bmp|heic|heif|avif)$/i.test(name);
    if(!looks) throw new Error('Please select image files only');
    if(file.size>20*1024*1024) throw new Error('Each image must be under 20 MB');

    // Android content:// file pickers can render the selected image in an
    // <img> preview but reject fetch(blob:) on the same temporary object URL.
    // Read the File directly first; only use the object-URL/canvas path as a
    // fallback for formats that need browser decoding (for example HEIC).
    try{
      const direct=await imageToDataURL(file);
      if(direct) return direct;
    }catch(e){}
    try{ return await objectURLToDataURL(file); }
    catch(e){ return await rawFallback(file); }
  }

  window.imageFromMany=async function(id){
    const el=document.getElementById(id);
    if(!el) return [];
    // Copy the File references immediately while the picker selection is live.
    const files=Array.from(el.files||[]).slice(0,8);
    if(!files.length) return [];
    const out=[];
    for(let i=0;i<files.length;i++){
      try{
        const data=await safeOne(files[i]);
        if(data) out.push(data);
      }catch(e){
        throw new Error('Photo '+(i+1)+': '+(e.message||'Could not read image. Please choose it again.'));
      }
    }
    return out;
  };

  window.saveProductImages=async function(id){
    const p=(db.products||[]).find(x=>x.id===id); if(!p)return;
    const input=document.getElementById('editPiFile');
    if(!input?.files?.length){toast('Choose at least one product photo');return;}
    let images;
    try{images=await window.imageFromMany('editPiFile');}
    catch(e){toast(e.message||'Could not read the photos. Please choose them again.');return;}
    if(!images.length){toast('No readable photos were selected');return;}
    const oldImages=productImages(p);
    p.images=images.slice(0,8); p.image=p.images[0]||'';
    try{
      const ok=window.save();
      if(ok===false) throw new Error('Storage is full');
      closeModal(); renderSeller(); toast(`${p.images.length} product photos saved`);
    }catch(e){
      p.images=oldImages.slice(); p.image=oldImages[0]||'';
      toast('Could not save photos. Try fewer or smaller images.');
    }
  };

  window.saveProduct=async function(bid){
    const v=id=>document.getElementById(id)?.value||'';
    const name=v('pn').trim(), cat=v('pc'), price=Number(v('pp')), stock=Number(v('ps'));
    if(!name||!cat||price<0||stock<0) return toast('Name, category, price and stock are required');
    let images=[];
    if(document.getElementById('piFile')?.files?.length){
      try{images=await window.imageFromMany('piFile');}
      catch(e){toast(e.message||'Could not read the product photos. Please choose them again.');return;}
    }
    const p={id:uid('prod'),businessId:bid,categoryId:cat,name,images:images.slice(0,8),image:images[0]||'',price,discountPrice:Number(v('pd'))||null,stock,reserved:0,unit:v('pu')||'piece',description:v('px'),sku:'',available:true};
    db.products.push(p);
    try{
      const ok=window.save();
      if(ok===false) throw new Error('Storage is full');
      closeModal(); renderSeller(); toast(`Product listed with ${p.images.length} photo${p.images.length===1?'':'s'}`);
    }catch(e){
      db.products=db.products.filter(x=>x.id!==p.id);
      toast('Could not save product. Try fewer or smaller photos.');
    }
  };
})();



/* ===== legacy script 15 ===== */

(function(){
  window.sellerSection='dashboard';
  window.sellerSelectedBusiness=null;
  function sellerUser(){return db.users.find(u=>u.id===db.session&&u.role==='seller')||null}
  function ownedBusinesses(){const u=sellerUser();return u?db.businesses.filter(b=>b.ownerId===u.id):[]}
  function setSellerNav(){
    const seller=!!sellerUser();
    document.body.classList.toggle('seller-mode',seller);
    document.querySelector('.buyer-nav').style.display=seller?'none':'';
    document.querySelector('.seller-nav').style.display=seller?'grid':'none';
  }
  window.sellerGo=function(section){
    if(!sellerUser()){toast('Seller account required');go('auth');return}
    sellerSection=section; setSellerNav(); renderSellerShell();
  };
  window.renderSellerShell=renderSellerShell;
  function renderSellerShell(){
    let root=document.getElementById('sellerContent');
    if(!root)return;
    const bs=ownedBusinesses();
    if(!sellerSelectedBusiness || !bs.some(b=>b.id===sellerSelectedBusiness)) sellerSelectedBusiness=bs[0]?.id||null;
    const b=bs.find(x=>x.id===sellerSelectedBusiness);
    const nav=document.querySelectorAll('.seller-nav button');
    nav.forEach(x=>x.classList.toggle('active',x.dataset.sellerScreen==='seller'+sellerSection.charAt(0).toUpperCase()+sellerSection.slice(1)));
    if(sellerSection==='dashboard') renderSellerDashboard(root,bs,b);
    else if(sellerSection==='reservations') renderSellerReservations(root,bs,b);
    else renderSellerBusinesses(root,bs);
  }
  function selector(bs){return `<div class="field"><label>BUSINESS</label><select class="seller-select" onchange="sellerSelectedBusiness=this.value;renderSellerShell()">${bs.map(b=>`<option value="${esc(b.id)}" ${b.id===sellerSelectedBusiness?'selected':''}>${esc(b.name)}</option>`).join('')}</select></div>`}
  function renderSellerDashboard(root,bs,b){
    if(!bs.length){root.innerHTML='<div class="seller-panel"><div class="empty"><strong>No businesses yet</strong><button class="btn primary" onclick="createBusiness()">+ ADD BUSINESS</button></div></div>';return}
    const rs=db.reservations.filter(r=>r.businessId===b.id);
    const completed=rs.filter(r=>['COLLECTED','DELIVERED'].includes(r.status));
    const revenue=completed.reduce((n,r)=>n+Number(r.total||0),0);
    const pending=rs.filter(r=>String(r.status).startsWith('RESERVED')).length;
    const products=db.products.filter(p=>p.businessId===b.id).length;
    root.innerHTML=`<div class="seller-panel"><div class="page-head"><div class="page-title">DASHBOARD</div></div>${selector(bs)}<div class="card"><h2>${esc(b.name)}</h2><div class="muted">${esc(b.locality||b.address||'')}</div></div><div class="metric-grid"><div class="metric"><b>₹${revenue.toLocaleString('en-IN')}</b><span>SALES REVENUE</span></div><div class="metric"><b>${rs.length}</b><span>TOTAL RESERVATIONS</span></div><div class="metric"><b>${pending}</b><span>PENDING</span></div><div class="metric"><b>${products}</b><span>PRODUCTS</span></div></div><button class="btn primary full" onclick="sellerGo('reservations')">VIEW RESERVATIONS</button></div>`;
  }
  function renderSellerReservations(root,bs,b){
    if(!bs.length){root.innerHTML='<div class="seller-panel"><div class="empty"><strong>Add a business first</strong></div></div>';return}
    const rs=db.reservations.filter(r=>r.businessId===b.id).slice().reverse();
    root.innerHTML=`<div class="seller-panel"><div class="page-head"><div class="page-title">RESERVATIONS</div></div>${selector(bs)}${rs.length?rs.map(r=>sellerReservation(r)).join(''):'<div class="empty"><strong>No reservations</strong>Reservations for this business will appear here.</div>'}</div>`;
  }
  function renderSellerBusinesses(root,bs){
    root.innerHTML=`<div class="seller-panel"><div class="page-head"><div class="page-title">BUSINESSES</div><button class="btn primary" onclick="createBusiness()">+ BUSINESS</button></div>${bs.length?bs.map(b=>`<div class="biz-item"><div class="row"><div><h3 style="margin:0">${esc(b.name)}</h3><div class="muted">${esc(b.category||'Local Business')} · ${esc(b.locality||'')}</div></div></div><div class="biz-actions"><button class="btn secondary" onclick="editBusiness('${b.id}')">EDIT</button><button class="btn secondary" onclick="openSellerProducts('${b.id}')">PRODUCTS</button><button class="btn primary" onclick="addProduct('${b.id}')">+ PRODUCT</button><button class="btn danger" onclick="deleteBusiness('${b.id}')">DELETE</button></div></div>`).join(''):'<div class="empty"><strong>No businesses</strong></div>'}</div>`;
  }
  window.renderSellerShell=renderSellerShell;
  window.openSellerProducts=function(bid){sellerSelectedBusiness=bid; sellerSection='businesses'; renderSellerShell(); const b=db.businesses.find(x=>x.id===bid); const ps=db.products.filter(p=>p.businessId===bid); openModal(`<button class="close" onclick="closeModal()">×</button><h2>${esc(b?.name||'Products')}</h2>${ps.length?ps.map(p=>`<div class="card"><div class="row"><div><b>${esc(p.name)}</b><div class="muted">₹${Number(p.discountPrice||p.price||0).toLocaleString('en-IN')} · ${availableStock(p)} available</div></div><button class="btn danger" onclick="deleteProduct('${p.id}')">DELETE</button></div><div class="biz-actions"><button class="btn secondary" onclick="editStock('${p.id}')">STOCK</button><button class="btn secondary" onclick="changeProductImage('${p.id}')">PHOTO</button></div></div>`).join(''):'<div class="empty">No products yet.</div>'}`)};
  window.deleteProduct=function(id){const p=db.products.find(x=>x.id===id);if(!p)return;if(!confirm('Delete this product?'))return;db.cart=db.cart.filter(i=>i.productId!==id);db.products=db.products.filter(x=>x.id!==id);save();closeModal();renderSellerShell();toast('Product deleted')};
  window.deleteBusiness=function(id){const b=db.businesses.find(x=>x.id===id);if(!b)return;if(!confirm('Delete this business and all its products and reservations?'))return;db.products=db.products.filter(p=>p.businessId!==id);db.services=db.services.filter(s=>s.businessId!==id);db.reservations=db.reservations.filter(r=>r.businessId!==id);db.businesses=db.businesses.filter(x=>x.id!==id);db.cart=db.cart.filter(i=>db.products.some(p=>p.id===i.productId));save();sellerSelectedBusiness=null;renderSellerShell();toast('Business deleted')};
  const oldOpenSeller=window.openSeller; window.openSeller=function(bid){sellerSelectedBusiness=bid;sellerSection='dashboard';go('seller');setSellerNav();renderSellerShell()};
  const oldGo=window.go; window.go=function(id,push){if(id==='seller'){setSellerNav();return oldGo(id,push)} if(sellerUser() && ['home','products','cart','orders','profile'].includes(id)){setSellerNav();} return oldGo(id,push)};
  window.addEventListener('load',()=>{setTimeout(()=>{if(sellerUser()){setSellerNav();renderSellerShell()}},50)});
})();



/* ===== legacy script 16 ===== */

(function(){
  let sellerTabName='dashboard';
  function sellerUser(){ return typeof user==='function' ? user() : null; }
  function sellerBusinesses(){ const u=sellerUser(); return u&&u.role==='seller' ? (db.businesses||[]).filter(b=>b.ownerId===u.id) : []; }

  window.updateSellerNav=function(){
    const u=sellerUser();
    const sn=document.getElementById('sellerNav');
    const bn=document.querySelector('.buyer-nav');
    const isSeller=!!(u&&u.role==='seller');
    if(sn) sn.style.display=isSeller?'grid':'none';
    if(bn) bn.style.display=isSeller?'none':'grid';
  };

  window.sellerTab=function(tab){
    const u=sellerUser();
    if(!u||u.role!=='seller'){ toast('Seller account required'); setAuthMode('login'); go('auth'); return; }
    sellerTabName=tab;
    const bs=sellerBusinesses();
    if(!currentBusiness || !bs.some(b=>b.id===currentBusiness)) currentBusiness=bs[0]?.id||null;
    document.querySelectorAll('#sellerNav button').forEach(b=>b.classList.toggle('active',b.dataset.sellerTab===tab));
    go('seller');
    renderSellerTab();
    updateSellerNav();
  };

  window.renderSellerTab=function(){
    const el=document.getElementById('sellerContent'); if(!el)return;
    const u=sellerUser(); if(!u||u.role!=='seller'){el.innerHTML='';return;}
    if(sellerTabName==='profile') return renderSellerProfile();
    if(sellerTabName==='businesses') return renderSellerBusinesses();
    if(sellerTabName==='reservations') return renderSellerReservations();
    return renderSellerDashboard();
  };

  function businessSelector(){
    const bs=sellerBusinesses();
    if(!bs.length) return `<div class="notice">You don't have a business yet. Open <b>Businesses</b> and create one.</div>`;
    return `<div class="field"><label>SELECT BUSINESS</label><select onchange="currentBusiness=this.value;renderSellerTab()">${bs.map(b=>`<option value="${esc(b.id)}" ${currentBusiness===b.id?'selected':''}>${esc(b.name)}</option>`).join('')}</select></div>`;
  }

  function renderSellerDashboard(){
    const el=document.getElementById('sellerContent'); const b=(db.businesses||[]).find(x=>x.id===currentBusiness);
    if(!b){el.innerHTML=`<div class="page-head"><div class="page-title">DASHBOARD</div></div>${businessSelector()}<div class="empty"><strong>No business selected</strong>Create a business from Businesses.</div>`;return;}
    const rs=(db.reservations||[]).filter(r=>r.businessId===b.id);
    const completed=rs.filter(r=>['COLLECTED','DELIVERED'].includes(r.status));
    const revenue=completed.reduce((n,r)=>n+Number(r.total||0),0);
    const pending=rs.filter(r=>['RESERVED — WAITING FOR SELLER CONFIRMATION','RESERVED'].includes(r.status)).length;
    const products=(db.products||[]).filter(p=>p.businessId===b.id);
    el.innerHTML=`<div class="page-head"><div class="page-title">DASHBOARD</div></div>${businessSelector()}
      <div class="card"><h2 style="margin:0 0 4px">${esc(b.name)}</h2><div class="muted">${esc(b.locality||b.address||'')}</div></div>
      <div class="dashboard-stats"><div class="stat-card"><b>₹${revenue.toLocaleString('en-IN')}</b><span>SALES REVENUE</span></div><div class="stat-card"><b>${rs.length}</b><span>RESERVATIONS</span></div><div class="stat-card"><b>${pending}</b><span>PENDING</span></div><div class="stat-card"><b>${products.length}</b><span>PRODUCTS</span></div></div>
      <button class="btn primary full" onclick="sellerTab('reservations')">VIEW RESERVATIONS</button>`;
  }

  function renderSellerReservations(){
    const el=document.getElementById('sellerContent'); const b=(db.businesses||[]).find(x=>x.id===currentBusiness);
    if(!b){el.innerHTML=`<div class="page-head"><div class="page-title">RESERVATIONS</div></div>${businessSelector()}<div class="empty"><strong>No business selected</strong></div>`;return;}
    const rs=(db.reservations||[]).filter(r=>r.businessId===b.id).slice().reverse();
    el.innerHTML=`<div class="page-head"><div class="page-title">RESERVATIONS</div></div>${businessSelector()}${rs.length?rs.map(r=>sellerReservation(r)).join(''):'<div class="empty"><strong>No orders yet</strong>Reservations for this business will appear here.</div>'}`;
  }

  function renderSellerBusinesses(){
    const el=document.getElementById('sellerContent'); const bs=sellerBusinesses();
    el.innerHTML=`<div class="page-head"><div class="page-title">BUSINESSES</div></div>
      <button class="btn primary full" onclick="createBusiness();updateSellerNav()">+ ADD BUSINESS</button>
      <div style="height:10px"></div>
      ${bs.length?bs.map(b=>`<div class="card"><div class="row"><div><h3 style="margin:0">${esc(b.name)}</h3><div class="muted">${esc(b.category||'Local business')} · ${esc(b.locality||'')}</div></div><span class="status">${(db.products||[]).filter(p=>p.businessId===b.id).length} products</span></div><div style="display:flex;gap:7px;flex-wrap:wrap;margin-top:12px"><button class="btn secondary" onclick="editBusiness('${b.id}');sellerTab('businesses')">EDIT</button><button class="btn primary" onclick="openSeller('${b.id}');sellerTab('dashboard')">MANAGE</button><button class="btn danger" onclick="deleteSellerBusiness('${b.id}')">DELETE</button></div></div>`).join(''):'<div class="empty"><strong>No businesses yet</strong>Create your first business here.</div>'}`;
  }

  window.renderSellerProfile=function(){
    const el=document.getElementById('sellerContent'); const u=sellerUser(); if(!u)return;
    const bs=sellerBusinesses();
    el.innerHTML=`<div class="page-head"><div class="page-title">PROFILE</div></div>
      <div class="card"><div class="row"><div><h2 style="margin:0">${esc(u.name||'Seller')}</h2><div class="muted">SELLER ACCOUNT</div></div><span class="status">SELLER</span></div>
      <div class="profile-row"><span class="profile-label">NAME</span><span class="profile-value">${esc(u.name||'')}</span></div>
      <div class="profile-row"><span class="profile-label">PHONE / EMAIL</span><span class="profile-value">${esc(u.contact||'')}</span></div>
      <div class="profile-row"><span class="profile-label">BUSINESSES</span><span class="profile-value">${bs.length}</span></div>
      </div>
      <button class="btn primary full" onclick="editSellerProfile()">UPDATE INFORMATION</button>
      <button class="btn secondary full" style="margin-top:9px" onclick="logout()">LOGOUT</button>`;
  };

  window.editSellerProfile=function(){
    const u=sellerUser(); if(!u)return;
    openModal(`<button class="close" onclick="closeModal()">×</button><h2>Update Profile</h2>
      <div class="field"><label>NAME</label><input id="sellerProfileName" value="${esc(u.name||'')}"></div>
      <div class="field"><label>PHONE / EMAIL</label><input id="sellerProfileContact" value="${esc(u.contact||'')}"></div>
      <div class="field"><label>NEW PASSWORD (OPTIONAL)</label><input id="sellerProfilePassword" type="password" placeholder="Leave blank to keep current password"></div>
      <button class="btn primary full" onclick="saveSellerProfile()">SAVE CHANGES</button>`);
  };
  window.saveSellerProfile=function(){
    const u=sellerUser(); if(!u)return;
    const name=document.getElementById('sellerProfileName').value.trim(); const contact=document.getElementById('sellerProfileContact').value.trim(); const pw=document.getElementById('sellerProfilePassword').value;
    if(!name||!contact)return toast('Name and phone/email are required');
    const duplicate=db.users.some(x=>x.id!==u.id&&String(x.contact).toLowerCase()===contact.toLowerCase());
    if(duplicate)return toast('That phone/email is already in use');
    u.name=name;u.contact=contact;if(pw)u.password=pw;save();closeModal();renderSellerProfile();toast('Profile updated');
  };

  window.deleteSellerBusiness=function(id){
    const b=(db.businesses||[]).find(x=>x.id===id); if(!b)return;
    if(!confirm(`Delete ${b.name}? This will also delete its products and reservations.`))return;
    const pids=(db.products||[]).filter(p=>p.businessId===id).map(p=>p.id);
    db.products=(db.products||[]).filter(p=>p.businessId!==id);
    db.businesses=(db.businesses||[]).filter(x=>x.id!==id);
    db.reservations=(db.reservations||[]).filter(r=>r.businessId!==id);
    db.cart=(db.cart||[]).filter(i=>!pids.includes(i.productId));
    currentBusiness=sellerBusinesses()[0]?.id||null;save();renderSellerBusinesses();toast('Business deleted');
  };

  // Keep seller navigation synchronized after login/logout and seller actions.
  const oldGo=window.go;
  window.go=function(id,push){
    const r=oldGo.apply(this,arguments);
    updateSellerNav();
    return r;
  };
  const oldOpenSeller=window.openSeller;
  window.openSeller=function(bid){ currentBusiness=bid; sellerTabName='dashboard'; if(oldOpenSeller) oldOpenSeller(bid); else {go('seller');renderSellerTab();} updateSellerNav(); };
  const oldLogout=window.logout;
  window.logout=function(){ if(oldLogout) oldLogout(); updateSellerNav(); };

  // Refresh the seller screen immediately after reservation status changes.
  const oldSellerStatus=window.sellerStatus;
  window.sellerStatus=function(id,status){ if(oldSellerStatus) oldSellerStatus(id,status); if(sellerTabName==='reservations')renderSellerReservations(); else if(sellerTabName==='dashboard')renderSellerDashboard(); };

  setTimeout(updateSellerNav,50);
})();



/* ===== legacy script 17 ===== */

/* SORTED v15 seller management fixes
   - Seller Profile is a real fourth bottom-nav tab.
   - Business editing is a complete form with category selector and photo controls.
   - Products can be added, fully edited, have multiple photos changed, or deleted.
   - Product category is inherited from the business; it is never edited on the product.
*/
(function(){
  function sellerOwnerBusiness(id){
    const u=typeof user==='function'?user():null;
    return u && u.role==='seller' ? (db.businesses||[]).find(b=>b.id===id && b.ownerId===u.id) : null;
  }
  function sellerOwnerProduct(id){
    const u=typeof user==='function'?user():null;
    // Product IDs can be numbers in persisted data but arrive as strings
    // from inline onclick attributes. Normalize both sides before lookup.
    const pid=String(id ?? '');
    const p=(db.products||[]).find(x=>String(x.id ?? '')===pid);
    const b=p && (db.businesses||[]).find(x=>String(x.id ?? '')===String(p.businessId ?? ''));
    return u && u.role==='seller' && p && b && String(b.ownerId ?? '')===String(u.id ?? '') ? {p,b} : null;
  }
  function businessCatsFor(b){
    const type=(b&&b.businessType==='services')?'services':'products';
    return (db.categories||[]).filter(c=>c.scope==='marketplace' && c.type===type);
  }
  function businessCats(){
    const s=document.getElementById('ebc');
    const b=s?.dataset?.businessId ? (db.businesses||[]).find(x=>String(x.id)===String(s.dataset.businessId)) : null;
    return businessCatsFor(b);
  }

  // Full business editor: all business fields + logo/cover replacement.
  window.editBusinessProfile=function(id){
    const u=typeof user==='function'?user():null, b=sellerOwnerBusiness(id);
    if(!u||!b)return toast('You can only edit your own business');
    const cats=businessCatsFor(b);
    const catId=b.categoryId || (cats.find(c=>c.name===b.category)?.id||'');
    openModal(`<button class="close" onclick="closeModal()">×</button><h2>Edit Business</h2>
      <div class="field"><label>BUSINESS NAME</label><input id="ebn" value="${esc(b.name||'')}"></div>
      <div class="field"><label>OWNER NAME</label><input id="ebo" value="${esc(b.ownerName||u.name||'')}"></div>
      <div class="field"><label>PHONE</label><input id="ebp" value="${esc(b.phone||u.contact||'')}"></div>
      <div class="field"><label>BUSINESS CATEGORY</label><select id="ebc" data-business-id="${id}">${cats.map(c=>`<option value="${esc(c.id)}" ${c.id===catId?'selected':''}>${esc(c.name)}</option>`).join('')}</select><button class="btn secondary full" style="margin-top:7px" onclick="addBusinessCategoryToEditor()">+ ADD CATEGORY</button></div>
      <div class="field"><label>ADDRESS</label><input id="eba" value="${esc(b.address||'')}"></div>
      <div class="field"><label>LOCALITY / AREA</label><input id="ebl" value="${esc(b.locality||'')}"></div>
      <div class="field"><label>OPENING HOURS</label><input id="ebhours" value="${esc(b.hours||'')}"></div>
      <div class="field"><label>DELIVERY</label><select id="ebd"><option value="no" ${!b.delivery?'selected':''}>NO, SELF PICKUP ONLY</option><option value="yes" ${b.delivery?'selected':''}>YES, I PROVIDE HOME DELIVERY</option></select></div>
      <div class="field"><label>PAYMENT POLICY</label><select id="ebpay"><option ${b.paymentPolicy==='Pay at store'?'selected':''}>Pay at store</option><option ${b.paymentPolicy==='Online payment accepted'?'selected':''}>Online payment accepted</option><option ${b.paymentPolicy==='Advance payment required'?'selected':''}>Advance payment required</option></select></div>
      <div class="field"><label>BUSINESS LOGO</label><input id="ebLogoFile" type="file" accept="image/*" onchange="previewUpload(this,'ebLogoPreview')"><div id="ebLogoPreview" class="upload-preview">${b.logo?`<img src="${esc(b.logo)}" alt="Logo">`:''}</div></div>
      <div class="field"><label>COVER IMAGE</label><input id="ebCoverFile" type="file" accept="image/*" onchange="previewUpload(this,'ebCoverPreview')"><div id="ebCoverPreview" class="upload-preview">${b.cover?`<img src="${esc(b.cover)}" alt="Cover">`:''}</div></div>
      <button class="btn primary full" onclick="saveBusinessProfile('${id}')">SAVE ALL BUSINESS DETAILS</button>`);
  };

  window.saveBusinessProfile=async function(id){
    const u=typeof user==='function'?user():null,b=sellerOwnerBusiness(id);
    if(!u||!b)return toast('You can only edit your own business');
    const v=x=>document.getElementById(x)?.value.trim()||'';
    const catId=document.getElementById('ebc')?.value||b.categoryId||'';
    const expectedType=b.businessType==='services'?'services':'products';
    const cat=(db.categories||[]).find(c=>c.id===catId && c.type===expectedType && c.scope==='marketplace');
    if(!cat)return toast('Please select a valid '+(expectedType==='services'?'service':'product')+' category');
    const old={...b};
    b.name=v('ebn')||b.name;b.ownerName=v('ebo')||u.name;b.phone=v('ebp')||u.contact;
    b.categoryId=catId;b.category=cat?.name||b.category||'Local Business';
    b.address=v('eba');b.locality=v('ebl');b.hours=v('ebhours')||'Opening hours not provided';
    b.delivery=document.getElementById('ebd')?.value==='yes';b.paymentPolicy=document.getElementById('ebpay')?.value||'Pay at store';
    try{
      const li=document.getElementById('ebLogoFile'),ci=document.getElementById('ebCoverFile');
      if(li?.files?.length){const a=await imageFromMany('ebLogoFile');if(a[0])b.logo=a[0];}
      if(ci?.files?.length){const a=await imageFromMany('ebCoverFile');if(a[0])b.cover=a[0];}
    }catch(e){Object.assign(b,old);return toast(e.message||'Could not read business photo');}
    // Ensure every product remains attached to this business category.
    (db.products||[]).filter(p=>p.businessId===b.id).forEach(p=>{p.categoryId=b.categoryId;});
    if(!persist('Business updated')){Object.assign(b,old);return;}
    closeModal();currentBusiness=b.id;renderSellerTab();toast('All business details updated');
  };

  window.addBusinessCategoryToEditor=function(){
    const s=document.getElementById('ebc');
    const b=s?.dataset?.businessId ? (db.businesses||[]).find(x=>String(x.id)===String(s.dataset.businessId)) : null;
    if(!b)return;
    const type=b.businessType==='services'?'services':'products';
    const name=prompt('New '+(type==='services'?'service':'product')+' category name');
    if(!name||!name.trim())return;
    const clean=name.trim();
    if((db.categories||[]).some(c=>c.type===type&&c.scope==='marketplace'&&String(c.name).toLowerCase()===clean.toLowerCase()))return toast('Category already exists');
    const c={id:uid('cat'),name:clean,type,scope:'marketplace',createdAt:Date.now(),status:'active'};
    db.categories.push(c);save();
    const cs=businessCatsFor(b);s.innerHTML=cs.map(x=>'<option value="'+esc(x.id)+'">'+esc(x.name)+'</option>').join('');s.value=c.id;
    toast((type==='services'?'Service':'Product')+' category created');
  };

  // Replace the old prompt-based edit entry point.
  window.editBusiness=function(id){window.editBusinessProfile(id);};

  // Full product editor. No category field: category comes from the business.
  window.editProduct=function(id){
    const ctx=sellerOwnerProduct(id); if(!ctx)return toast('You can only edit your own products');
    const {p,b}=ctx; const imgs=productImages(p);
    openModal(`<button class="close" onclick="closeModal()">×</button><h2>Edit Product</h2>
      <div class="notice">BUSINESS: <b>${esc(b.name)}</b><br><span class="muted">CATEGORY: ${(esc((db.categories||[]).find(c=>c.id===b.categoryId)?.name||b.category||'Local Business'))}</span><br><span class="muted">Products automatically belong to this business category.</span></div>
      <div class="field"><label>PRODUCT NAME</label><input id="epn" value="${esc(p.name||'')}"></div>
      <div class="field"><label>PRODUCT PHOTOS — MULTIPLE</label><input id="epFile" type="file" accept="image/*" multiple onchange="previewMultiUpload(this,'editProductPreviewFixed')"><div id="editProductPreviewFixed" class="multi-upload-preview">${imgs.map((x,i)=>`<div><img src="${esc(x)}" alt="Photo ${i+1}"><small>${i===0?'Current main photo':'Photo '+(i+1)}</small></div>`).join('')}</div><small class="muted">Select replacement photos to replace the current gallery. Up to 8.</small></div>
      <div class="field"><label>PRICE</label><input id="epp" type="number" min="0" value="${Number(p.price||0)}"></div>
      <div class="field"><label>DISCOUNT PRICE (OPTIONAL)</label><input id="epd" type="number" min="0" value="${p.discountPrice==null?'':Number(p.discountPrice)}"></div>
      <div class="field"><label>STOCK QUANTITY</label><input id="eps" type="number" min="0" value="${Number(p.stock||0)}"></div>
      <div class="field"><label>UNIT</label><input id="epu" value="${esc(p.unit||'piece')}"></div>
      <div class="field"><label>DESCRIPTION</label><textarea id="epx">${esc(p.description||'')}</textarea></div>
      <button class="btn primary full" onclick="saveProductEdit('${id}')">SAVE ALL PRODUCT DETAILS</button>`);
  };

  window.saveProductEdit=async function(id){
    const ctx=sellerOwnerProduct(id); if(!ctx)return toast('You can only edit your own products');
    const {p,b}=ctx; const v=x=>document.getElementById(x)?.value||'';
    const name=v('epn').trim(),price=Number(v('epp')),stock=Number(v('eps'));
    if(!name||!Number.isFinite(price)||price<0||!Number.isFinite(stock)||stock<0)return toast('Name, price and stock are required');
    const old={...p,images:productImages(p).slice()};
    p.name=name;p.price=price;p.discountPrice=v('epd').trim()===''?null:Math.max(0,Number(v('epd')));p.stock=stock;p.unit=v('epu').trim()||'piece';p.description=v('epx');p.categoryId=b.categoryId;
    try{
      const input=document.getElementById('epFile');
      if(input?.files?.length){const images=await imageFromMany('epFile');if(!images.length)throw new Error('No readable photos selected');p.images=images.slice(0,8);p.image=p.images[0]||'';}
    }catch(e){Object.assign(p,old);return toast(e.message||'Could not read product photos');}
    if(!persist('Product updated')){Object.assign(p,old);return;}
    closeModal();renderSellerTab();toast('All product details updated');
  };

  // Business management page: photos + full edit + product management.
  function businessProfileTile(b){
    const cat=(db.categories||[]).find(c=>c.id===b.categoryId)?.name||b.category||'Local Business';
    const isService=b.businessType==='services'; const count=(isService?(db.services||[]):(db.products||[])).filter(x=>String(x.businessId)===String(b.id)).length;
    const img=b.logo||b.cover||'';
    return `<button type="button" class="manage-business-profile" onclick="openBusinessManagement('${esc(b.id)}')">
      <div class="manage-business-avatar">${img?`<img src="${esc(img)}" alt="${esc(b.name)}" loading="lazy" onerror="this.style.display='none';this.parentElement.classList.add('no-image')">`:'<span>🏪</span>'}</div>
      <div class="manage-business-name">${esc(b.name)}</div>
      <div class="manage-business-meta">${esc(cat)}</div>
      <div class="manage-business-products">${count} product${count===1?'':'s'}</div>
    </button>`;
  }

  function renderBusinessManagementList(){
    const el=document.getElementById('sellerContent');if(!el)return;
    const bs=sellerBusinesses();
    el.innerHTML=`<div class="page-head"><div class="page-title">BUSINESSES</div><button class="btn primary" onclick="createBusiness()">+ BUSINESS</button></div>
      <div class="manage-business-heading"><b>YOUR BUSINESSES</b><span>Select a business to manage its details, photos and products</span></div>
      ${bs.length?`<div class="manage-business-profiles">${bs.map(businessProfileTile).join('')}</div>`:`<div class="empty"><strong>No businesses yet</strong><div style="margin-top:8px">Create your first business here.</div></div>`}`;
  }

  function renderBusinessManagementDetail(id){
    const el=document.getElementById('sellerContent');if(!el)return;
    const b=sellerOwnerBusiness(id);if(!b){window.__businessManagementSelected=false;return renderBusinessManagementList();}
    currentBusiness=id;
    const cat=(db.categories||[]).find(c=>c.id===b.categoryId)?.name||b.category||'Local Business';
    const products=(db.products||[]).filter(p=>p.businessId===b.id);
    el.innerHTML=`<div class="page-head"><button class="btn secondary" onclick="backToBusinessProfiles()">← BUSINESSES</button><div class="page-title">BUSINESS</div></div>
      <div class="manage-business-detail-card">
        ${b.cover?`<img class="manage-business-cover" src="${esc(b.cover)}" alt="Business cover" loading="lazy" onerror="this.style.display='none'">`:''}
        <div class="manage-business-detail-head">
          <div class="manage-business-detail-avatar">${b.logo?`<img src="${esc(b.logo)}" alt="${esc(b.name)}" loading="lazy">`:'🏪'}</div>
          <div class="grow"><h2 style="margin:0">${esc(b.name)}</h2><div class="muted">${esc(cat)} · ${esc(b.locality||b.address||'')}</div><div class="muted">${products.length} product${products.length===1?'':'s'}</div></div>
        </div>
        <div class="manage-business-actions">
          <button class="btn primary" onclick="editBusinessProfile('${b.id}')">EDIT BUSINESS</button>
          <label class="btn secondary" style="cursor:pointer">CHANGE LOGO <input type="file" accept="image/*" hidden onchange="editBusinessPhotoFixed('${b.id}','logo',this)"></label>
          <label class="btn secondary" style="cursor:pointer">CHANGE COVER <input type="file" accept="image/*" hidden onchange="editBusinessPhotoFixed('${b.id}','cover',this)"></label>
          <button class="btn secondary" onclick="openSellerProducts('${b.id}')">PRODUCTS</button>
          <button class="btn primary" onclick="addProduct('${b.id}')">+ PRODUCT</button>
          <button class="btn danger" onclick="deleteSellerBusiness('${b.id}')">DELETE BUSINESS</button>
        </div>
      </div>
      <div class="row" style="margin-top:18px"><h3 style="margin:0">PRODUCTS</h3><button class="btn primary" onclick="addProduct('${b.id}')">+ PRODUCT</button></div>
      <div class="card" style="margin-top:8px">${products.length?products.map(p=>{const imgs=productImages(p);return `<div class="business-product"><img src="${esc(imgs[0]||'')}" loading="lazy" onerror="this.style.display='none'" alt=""><div class="product-info"><b>${esc(p.name)}</b><small class="muted" style="display:block">₹${Number(p.discountPrice??p.price??0).toLocaleString('en-IN')} · ${Number(p.stock||0)} in stock</small></div><div class="product-actions"><button class="btn secondary" onclick="editProduct('${p.id}')">EDIT</button><button class="btn secondary" onclick="editProduct('${p.id}')">PHOTOS</button><button class="btn danger" onclick="deleteProduct('${p.id}')">DELETE</button></div></div>`}).join(''):`<div class="empty">No products yet. Add your first product above.</div>`}</div>`;
  }

  window.__v129Detail=v129Detail;
window.openBusinessManagement=function(id){
    const bs=sellerBusinesses();if(!bs.some(b=>b.id===id))return;
    currentBusiness=id;window.__businessManagementSelected=true;
    try{history.pushState({sellerBusinessManagement:true,businessId:id},'',location.pathname+'#seller-business-'+encodeURIComponent(id));}catch(e){}
    renderBusinessManagementDetail(id);
    window.scrollTo({top:0,behavior:'smooth'});
  };
  window.backToBusinessProfiles=function(){
    window.__businessManagementSelected=false;
    try{history.replaceState({sellerBusinesses:true},'',location.pathname+'#seller-businesses');}catch(e){}
    renderBusinessManagementList();
    window.scrollTo({top:0,behavior:'smooth'});
  };

  window.renderSellerBusinesses=function(){
    if(window.__businessManagementSelected && currentBusiness) return renderBusinessManagementDetail(currentBusiness);
    renderBusinessManagementList();
  };



  // Product manager with add/edit/photo/delete actions.
  window.openSellerProducts=function(bid){
    const b=sellerOwnerBusiness(bid);if(!b)return toast('Business not found');
    currentBusiness=bid;const ps=(db.products||[]).filter(p=>p.businessId===bid);
    openModal(`<button class="close" onclick="closeModal()">×</button><div class="row"><h2 style="margin:0">${esc(b.name)} — Products</h2><button class="btn primary" onclick="closeModal();addProduct('${bid}')">+ PRODUCT</button></div>
      <div class="notice" style="margin-top:10px">Category: <b>${esc((db.categories||[]).find(c=>c.id===b.categoryId)?.name||b.category||'Local Business')}</b>. All products automatically belong to this category.</div>
      ${ps.length?ps.map(p=>{const imgs=productImages(p);return `<div class="card" style="margin-top:10px"><div class="row"><div style="display:flex;gap:10px;align-items:center"><div class="product-image">${imgs[0]?`<img src="${esc(imgs[0])}" alt="">`:'📷'}</div><div><b>${esc(p.name)}</b><div class="muted">₹${Number(p.discountPrice||p.price||0).toLocaleString('en-IN')} · ${availableStock(p)} available</div></div></div></div><div class="biz-actions" style="margin-top:10px"><button class="btn secondary" onclick="editProduct('${p.id}')">EDIT DETAILS</button><button class="btn secondary" onclick="changeProductImage('${p.id}')">PHOTOS</button><button class="btn secondary" onclick="editStock('${p.id}')">STOCK</button><button class="btn danger" onclick="deleteProduct('${p.id}')">DELETE</button></div></div>`;}).join(''):'<div class="empty" style="margin-top:10px">No products yet. Add your first product.</div>'}`);
  };

  // Keep product category synced to its business whenever the seller views/manages it.
  const oldAddProduct=window.addProduct;
  // The existing addProduct already has no category input and inherits business category.

  // Fix all seller-nav instances: only #sellerNav is active, with Profile on the same row.
  function fixSellerNav(){
    document.querySelectorAll('.seller-nav').forEach(n=>{if(n.id!=='sellerNav')n.style.display='none';});
    const sn=document.getElementById('sellerNav');if(sn){const u=typeof user==='function'?user():null;sn.style.display=(u&&u.role==='seller')?'grid':'none';}
  }
  const oldUpdateSellerNav=window.updateSellerNav;
  window.updateSellerNav=function(){if(oldUpdateSellerNav)oldUpdateSellerNav();fixSellerNav();};
  const oldSellerTab=window.sellerTab;
  window.sellerTab=function(tab){if(oldSellerTab)oldSellerTab(tab);fixSellerNav();};
  window.addEventListener('load',()=>setTimeout(fixSellerNav,100));
})();



/* ===== legacy script 18 ===== */

/* SORTED v16: seller UX + business media management + analytics */
(function(){
  const sellerUser=()=>typeof user==='function'?user():null;
  const sellerBusinesses=()=>{const u=sellerUser();return u&&u.role==='seller'?(db.businesses||[]).filter(b=>b.ownerId===u.id):[]};
  const ownBusiness=id=>{const u=sellerUser();return u?(db.businesses||[]).find(b=>b.id===id&&b.ownerId===u.id):null};
  const ownProducts=bid=>{const u=sellerUser();return u?(db.products||[]).filter(p=>p.businessId===bid && (db.businesses||[]).some(b=>b.id===bid&&b.ownerId===u.id)):[]};
  const productImgs=p=>typeof productImages==='function'?productImages(p):(p?.images?.length?p.images:(p?.image?[p.image]:[]));

  async function setBusinessPhoto(id,type,input){
    const b=ownBusiness(id),file=input?.files?.[0];
    if(!b||!file)return;
    try{
      const image=await window.readBusinessPhoto(input,type==='cover'?1200:700);
      const old=b[type];b[type]=image;
      if(!persist('Photo updated')){b[type]=old;return;}
      renderSellerTab();toast(type==='logo'?'Business logo updated':'Business cover updated');
    }catch(e){toast(e.message||'Could not save photo');}
    finally{if(input)input.value='';}
  }
  window.setBusinessPhoto=setBusinessPhoto;

  window.removeBusinessPhoto=function(id,type){
    const b=ownBusiness(id);if(!b)return;
    if(!confirm(`Remove business ${type==='logo'?'logo':'cover image'}?`))return;
    const old=b[type];b[type]='';
    if(!persist('Photo removed')){b[type]=old;return;}
    renderSellerTab();toast('Business photo removed');
  };

  function businessCard(b){
    const products=ownProducts(b.id), logo=b.logo||'',cover=b.cover||'';
    return `<div class="card">
      <div class="row"><div style="min-width:0"><h3 style="margin:0">${esc(b.name)}</h3><div class="muted">${esc((db.categories||[]).find(c=>c.id===b.categoryId)?.name||b.category||'Local Business')} · ${esc(b.locality||'')}</div></div><span class="status">${products.length} products</span></div>
      <div class="business-photo-grid">
        <div class="business-photo-box"><div class="muted" style="font-size:9px;font-weight:900;margin-bottom:6px">LOGO</div>${logo?`<img src="${esc(logo)}" alt="Business logo">`:`<div class="photo-placeholder">NO LOGO</div>`}<div style="display:flex;gap:5px;margin-top:7px"><label class="btn secondary" style="flex:1;cursor:pointer;text-align:center">${logo?'CHANGE':'ADD'}<input type="file" accept="image/*" hidden onchange="setBusinessPhoto('${b.id}','logo',this)"></label>${logo?`<button class="btn danger" onclick="removeBusinessPhoto('${b.id}','logo')">REMOVE</button>`:''}</div></div>
        <div class="business-photo-box"><div class="muted" style="font-size:9px;font-weight:900;margin-bottom:6px">COVER IMAGE</div>${cover?`<img src="${esc(cover)}" alt="Business cover">`:`<div class="photo-placeholder">NO COVER</div>`}<div style="display:flex;gap:5px;margin-top:7px"><label class="btn secondary" style="flex:1;cursor:pointer;text-align:center">${cover?'CHANGE':'ADD'}<input type="file" accept="image/*" hidden onchange="setBusinessPhoto('${b.id}','cover',this)"></label>${cover?`<button class="btn danger" onclick="removeBusinessPhoto('${b.id}','cover')">REMOVE</button>`:''}</div></div>
      </div>
      <div style="display:flex;gap:7px;flex-wrap:wrap;margin-top:12px"><button class="btn primary" onclick="editBusinessProfile('${b.id}')">EDIT DETAILS</button><button class="btn secondary" onclick="sellerTab('dashboard');currentBusiness='${b.id}'">DASHBOARD</button><button class="btn danger" onclick="deleteSellerBusiness('${b.id}')">DELETE BUSINESS</button></div>
      <div class="row" style="margin-top:18px"><h3 style="margin:0">PRODUCTS</h3><button class="btn primary" onclick="addProduct('${b.id}')">+ PRODUCT</button></div>
      <div class="card" style="margin-top:8px">${products.length?products.map(p=>{const imgs=productImgs(p);return `<div class="business-product"><img src="${esc(imgs[0]||'')}" onerror="this.style.display='none'" alt=""><div class="product-info"><b>${esc(p.name)}</b><small class="muted" style="display:block">₹${Number(p.discountPrice??p.price??0).toLocaleString('en-IN')} · ${Number(p.stock||0)} in stock</small></div><div class="product-actions"><button class="btn secondary" onclick="editProduct('${p.id}')">EDIT</button><button class="btn secondary" onclick="editProduct('${p.id}')">PHOTOS</button><button class="btn danger" onclick="deleteProduct('${p.id}')">DELETE</button></div></div>`}).join(''):`<div class="empty">No products yet. Add your first product above.</div>`}</div>
    </div>`;
  }

  function renderBusinesses(){
    const el=document.getElementById('sellerContent');if(!el)return;
    const bs=sellerBusinesses();
    el.innerHTML=`<div class="page-head"><div class="page-title">BUSINESSES</div></div><button class="btn primary full" onclick="createBusiness()">+ ADD BUSINESS</button><div style="height:10px"></div>${bs.length?bs.map(businessCard).join(''):`<div class="empty"><strong>No businesses yet</strong>Create your first business here.</div>`}`;
  }
  window.renderSellerBusinesses=renderBusinesses;

  function dashboardBusinessSelector(bs,b){
    if(!bs.length) return '<div class="notice">No business found. Create a business first.</div>';
    return `<div class="selected-business-picker orders-business-picker"><label>SELECT BUSINESS TO MANAGE</label><select onchange="currentBusiness=this.value;window.renderSellerTab()">${bs.map(x=>`<option value="${esc(x.id)}" ${x.id===b.id?'selected':''}>${esc(x.name)}</option>`).join('')}</select><div class="orders-business-picker-note">Only the selected business is shown below for management.</div></div>`;
  }

  function renderDashboard(){
    const el=document.getElementById('sellerContent');if(!el)return;
    const bs=sellerBusinesses();
    if(!bs.length){el.innerHTML=`<div class="page-head"><div class="page-title">DASHBOARD</div></div><div class="empty"><strong>No business yet</strong>Add a business from Businesses.</div>`;return;}
    if(!currentBusiness||!bs.some(b=>b.id===currentBusiness))currentBusiness=bs[0].id;
    const b=ownBusiness(currentBusiness),rs=(db.reservations||[]).filter(r=>r.businessId===b.id),products=ownProducts(b.id);
    const completed=rs.filter(r=>['COLLECTED','DELIVERED'].includes(r.status));
    const revenue=completed.reduce((n,r)=>n+Number(r.total||0),0);
    const pending=rs.filter(r=>['AWAITING CUSTOMER OTP','RESERVED — WAITING FOR SELLER CONFIRMATION','RESERVED'].includes(r.status)).length;
    const confirmed=rs.filter(r=>['CONFIRMED','ORDER CONFIRMED','READY FOR PICKUP','PREPARING','OUT FOR DELIVERY'].includes(r.status)).length;
    const units={};const productRevenue={};
    completed.forEach(r=>(r.items||[]).forEach(i=>{const key=i.productId||i.name;units[key]=(units[key]||0)+Number(i.qty||0);productRevenue[key]=(productRevenue[key]||0)+Number(i.price||0)*Number(i.qty||0)}));
    const best=products.map(p=>({p,units:units[p.id]||0,revenue:productRevenue[p.id]||0})).sort((a,b)=>b.units-a.units||b.revenue-a.revenue);
    const top=best[0];const avg=completed.length?revenue/completed.length:0;
    const lowStock=products.filter(p=>Number(p.stock||0)<=3).length;
    const recent=rs.slice().sort((a,b)=>Number(b.createdAt||0)-Number(a.createdAt||0)).slice(0,5);
    el.innerHTML=`<div class="page-head"><div class="page-title">DASHBOARD</div></div>
      <div class="field"><label>SELECT BUSINESS</label><select onchange="currentBusiness=this.value;renderSellerTab()">${bs.map(x=>`<option value="${esc(x.id)}" ${x.id===b.id?'selected':''}>${esc(x.name)}</option>`).join('')}</select></div>
      <div class="card"><h2 style="margin:0 0 4px">${esc(b.name)}</h2><div class="muted">${esc((db.categories||[]).find(c=>c.id===b.categoryId)?.name||b.category||'Local Business')} · ${esc(b.locality||b.address||'')}</div></div>
      <div class="dashboard-stats"><div class="stat-card"><b>₹${revenue.toLocaleString('en-IN')}</b><span>SALES REVENUE</span></div><div class="stat-card"><b>${rs.length}</b><span>TOTAL RESERVATIONS</span></div><div class="stat-card"><b>${pending}</b><span>PENDING</span></div><div class="stat-card"><b>${products.length}</b><span>PRODUCTS</span></div></div>
      <div class="dashboard-stats"><div class="stat-card"><b>${confirmed}</b><span>ACTIVE ORDERS</span></div><div class="stat-card"><b>${completed.length}</b><span>COMPLETED SALES</span></div><div class="stat-card"><b>₹${Math.round(avg).toLocaleString('en-IN')}</b><span>AVG ORDER VALUE</span></div><div class="stat-card"><b>${lowStock}</b><span>LOW STOCK</span></div></div>
      <div class="card"><div class="row"><h3 style="margin:0">TOP SELLING PRODUCTS</h3><span class="status">BY UNITS SOLD</span></div><div class="analytics-list">${best.length?best.slice(0,5).map((x,i)=>`<div class="analytics-row"><div class="analytics-rank">${i+1}</div><div class="grow"><b>${esc(x.p.name)}</b><div class="muted">${x.units} unit${x.units===1?'':'s'} sold</div></div><div class="right"><b>₹${Math.round(x.revenue).toLocaleString('en-IN')}</b><div class="muted">revenue</div></div></div>`).join(''):`<div class="empty">No completed sales yet. Product performance will appear here after sales are completed.</div>`}</div></div>
      <div class="card"><div class="row"><h3 style="margin:0">INVENTORY PERFORMANCE</h3></div>${products.length?products.map(p=>{const u=units[p.id]||0;return `<div class="analytics-row"><div class="grow"><b>${esc(p.name)}</b><div class="muted">${Number(p.stock||0)} currently in stock · ${u} sold</div></div><div class="right"><b>${u?Math.round((u/(u+Number(p.stock||0)))*100):0}%</b><div class="muted">sell-through</div></div></div>`}).join(''):`<div class="empty">No products.</div>`}</div>
      <div class="card"><div class="row"><h3 style="margin:0">RECENT RESERVATIONS</h3><button class="btn secondary" onclick="sellerTab('reservations')">VIEW ALL</button></div>${recent.length?recent.map(r=>`<div class="analytics-row"><div class="grow"><b>${esc(r.number||'Reservation')}</b><div class="muted">${esc(r.items?.[0]?.name||'Order')} · ${r.items?.length>1?`+${r.items.length-1} more`:''}</div></div><div class="right"><b>₹${Number(r.total||0).toLocaleString('en-IN')}</b><div class="muted">${esc(r.status||'')}</div></div></div>`).join(''):`<div class="empty">No orders yet.</div>`}</div>
      <button class="btn primary full" onclick="sellerTab('reservations')">VIEW RESERVATIONS</button>`;
  }
  window.renderSellerDashboard=renderDashboard;

  let tab='dashboard';
  window.sellerTab=function(next){
    const u=sellerUser();if(!u||u.role!=='seller'){toast('Seller account required');setAuthMode('login');go('auth');return;}
    tab=next;const bs=sellerBusinesses();if(!currentBusiness||!bs.some(b=>b.id===currentBusiness))currentBusiness=bs[0]?.id||null;
    document.querySelectorAll('#sellerNav button').forEach(x=>x.classList.toggle('active',x.dataset.sellerTab===tab));
    go('seller');
    if(tab==='dashboard')renderDashboard();else if(tab==='businesses')renderBusinesses();else if(tab==='profile')renderSellerProfile();else if(tab==='reservations')renderSellerReservations();
    updateSellerNav();
  };
  window.renderSellerTab=function(){
    if(tab==='dashboard')renderDashboard();else if(tab==='businesses')renderBusinesses();else if(tab==='profile')renderSellerProfile();else renderSellerReservations();
    updateSellerNav();
  };
  window.updateSellerNav=window.updateSellerNav||function(){};
})();



/* ===== legacy script 19 ===== */

(function(){
  function syncFinalSellerNav(){
    try{
      const u=typeof user==='function'?user():null;
      const seller=!!(u&&u.role==='seller');
      const n=document.getElementById('sellerNav');
      if(n){n.classList.toggle('seller-visible',seller);n.style.display=seller?'grid':'none';}
      document.body.classList.toggle('seller-mode',seller);
      const b=document.querySelector('.buyer-nav');
      if(b)b.style.display=seller?'none':'';
    }catch(e){}
  }
  window.addEventListener('load',syncFinalSellerNav);
  setTimeout(syncFinalSellerNav,100);
  setTimeout(syncFinalSellerNav,500);
  const oldSet=window.updateSellerNav;
  window.updateSellerNav=function(){if(oldSet)oldSet();syncFinalSellerNav()};
})();



/* ===== legacy script 20 ===== */

(function(){
  // Final consistency guards for the prototype's shared state.
  window.availableStock=function(p){return Math.max(0,Number(p?.stock||0)-Number(p?.reserved||0));};
  window.requireBuyer=window.requireBuyer||function(){const u=user();if(!u){toast('Please log in as a buyer first');setAuthMode('login');go('auth');return null;}if(u.role!=='buyer'){toast('This action is for buyer accounts');return null;}return u;};
  window.requireSeller=window.requireSeller||function(){const u=user();if(!u){toast('Please log in as a seller first');setAuthMode('login');go('auth');return null;}if(u.role!=='seller'){toast('Seller account required');return null;}return u;};
  const originalAdd=window.addToCart;
  if(originalAdd){window.addToCart=function(id,qty){const u=requireBuyer();if(!u)return;const p=db.products.find(x=>x.id===id);if(!p)return toast('Product not found');qty=Math.max(1,Number(qty||1));const existing=db.cart.find(x=>x.productId===id);const target=(existing?.qty||0)+qty;if(availableStock(p)<target)return toast('Only '+availableStock(p)+' available');return originalAdd.call(this,id,qty);};}
  const originalCheckout=window.checkoutBusiness;
  if(originalCheckout){window.checkoutBusiness=function(bid){expireReservations();const items=db.cart.filter(i=>db.products.find(p=>p.id===i.productId)?.businessId===bid);if(items.some(i=>{const p=db.products.find(x=>x.id===i.productId);return !p||i.qty>availableStock(p)})){renderCart();return toast('Stock changed — please review your order');}return originalCheckout.call(this,bid);};}
  // One-time migration from the old inventory model (stock was decremented and reserved was also incremented).
  // Active legacy reservations are restored into `stock` so the new invariant is: stock = physical units, reserved = held units.
  if(!db.__inventoryModelV2){
    const activeStatuses=new Set(['RESERVED','RESERVED — WAITING FOR SELLER CONFIRMATION','AWAITING CUSTOMER OTP','CONFIRMED','ORDER CONFIRMED','READY FOR PICKUP','PREPARING','OUT FOR DELIVERY']);
    (db.reservations||[]).filter(r=>activeStatuses.has(r.status)).forEach(r=>{
      (r.items||[]).forEach(i=>{const p=db.products.find(x=>x.id===i.productId);if(p)p.stock=Number(p.stock||0)+Number(i.qty||0);});
    });
    db.__inventoryModelV2=true;
  }
  // Normalize legacy sessions created by older prototype versions.
  if(db.session && typeof db.session==='object') db.session=db.session.userId||null;
  // Migrate legacy reservations that have no absolute expiry timestamp.
  (db.reservations||[]).forEach(r=>{if(!r.expiresAt&&r.validUntil)r.expiresAt=nextExpiryTimestamp(r.validUntil);});

  // Protect OTP completion and make it perform the same inventory transition as sellerStatus().
  window.completeHandover=function(id,finalStatus){
    const r=db.reservations.find(x=>x.id===id); if(!r)return;
    const seller=user(); const b=db.businesses.find(x=>x.id===r.businessId);
    if(!seller||seller.role!=='seller'||!b||b.ownerId!==seller.id)return toast('You can only complete your own orders');
    if(!['COLLECTED','DELIVERED'].includes(finalStatus))return toast('Invalid completion status');
    if(r.otpVerified)return toast('Order is already completed');
    const input=String(document.getElementById('sellerHandoverOtp')?.value||'').replace(/\D/g,'');
    if(input.length!==4 || input!==String(r.otp))return toast('Incorrect OTP — order not completed');
    completeReservationStock(r);
    r.otpVerified=true;r.handoverVerifiedAt=Date.now();r.status=finalStatus;
    save();closeModal();if(window.renderSellerShell)window.renderSellerShell();else if(window.renderSellerTab)window.renderSellerTab();else renderSeller();toast(finalStatus==='DELIVERED'?'Delivery completed successfully':'Pickup completed successfully');
  };

  // Ensure seller business deletion cannot cross account boundaries.
  window.deleteSellerBusiness=function(id){
    const u=user(); const b=(db.businesses||[]).find(x=>x.id===id);
    if(!u||u.role!=='seller')return toast('Seller account required');
    if(!b)return toast('Business not found');
    if(b.ownerId!==u.id)return toast('You can only delete your own business');
    if(!confirm(`Delete ${b.name}? This will also delete its products and reservations.`))return;
    const pids=(db.products||[]).filter(p=>p.businessId===id).map(p=>p.id);
    db.products=(db.products||[]).filter(p=>p.businessId!==id);
    db.businesses=(db.businesses||[]).filter(x=>x.id!==id);
    db.reservations=(db.reservations||[]).filter(r=>r.businessId!==id);
    db.services=(db.services||[]).filter(s=>s.businessId!==id);
    db.cart=(db.cart||[]).filter(i=>!pids.includes(i.productId));
    currentBusiness=sellerBusinesses?.()[0]?.id||null; save();
    if(window.renderSellerTab)window.renderSellerTab(); else if(window.renderSellerShell)window.renderSellerShell();
    toast('Business deleted');
  };

  try{save();}catch(e){}
})();



/* ===== legacy script 21 ===== */

(function(){
  'use strict';
  function getTheme(){return localStorage.getItem('sorted_theme')||'dark'}
  function applyTheme(theme){
    document.documentElement.setAttribute('data-theme',theme);
    try{localStorage.setItem('sorted_theme',theme)}catch(e){}
    const m=document.querySelector('meta[name="theme-color"]');if(m)m.content=theme==='light'?'#ffffff':'#0a0b0e';
  }
  applyTheme(getTheme());
  window.toggleDarkMode=function(on){applyTheme(on?'dark':'light');renderThemeSettings();toast(on?'Dark mode on':'Dark mode off — Premium White + Hulu Green')};
  window.renderThemeSettings=function(){
    const el=document.getElementById('themeSettingsContent');if(!el)return;
    const dark=getTheme()==='dark';
    el.innerHTML=`<div class="card"><div class="v40-theme-row"><div><b>Dark Mode</b><div class="muted" style="margin-top:4px">Turn dark mode on or off</div></div><label class="v40-theme-switch"><input type="checkbox" ${dark?'checked':''} onchange="toggleDarkMode(this.checked)"><span class="v40-slider"></span></label></div><div class="notice" style="margin-top:10px">${dark?'Dark theme is active.':'Premium White + Hulu Green theme is active.'}</div></div>`;
  };
  window.openThemeSettings=function(){
    let el=document.getElementById('themeSettings');
    if(!el){
      el=document.createElement('section');el.id='themeSettings';el.className='screen';
      const host=document.querySelector('main')||document.body;host.appendChild(el);
    }
    el.innerHTML='<div class="page-head"><div class="page-title">DARK MODE</div></div><div id="themeSettingsContent"></div>';
    document.querySelectorAll('.screen').forEach(x=>x.classList.remove('active'));el.classList.add('active');
    renderThemeSettings();
    try{history.pushState({screen:'themeSettings'},'',location.pathname+'#themeSettings')}catch(e){}
    scrollTo({top:0,behavior:'auto'});
  };
  // Add Settings -> Dark Mode to buyer profile without exposing the theme control directly.
  const oldRenderProfile=window.renderProfile;
  window.renderProfile=function(){
    if(typeof oldRenderProfile==='function')oldRenderProfile.apply(this,arguments);
    const u=typeof user==='function'?user():null;if(!u||u.role==='seller')return;
    const host=document.getElementById('profileContent');if(!host)return;
    if(document.getElementById('profileSettingsCard'))return;
    host.insertAdjacentHTML('beforeend','<div class="card" id="profileSettingsCard"><div class="row"><div><b>SETTINGS</b><div class="muted" style="margin-top:4px">Appearance and preferences</div></div></div><button class="btn secondary full" style="margin-top:12px" onclick="openThemeSettings()">DARK MODE</button></div>');
  };
})();



/* ===== legacy script 22 ===== */

(function(){
  function refresh(){
    try{
      if(window.selectedLocation) localStorage.setItem('sortedLocation',JSON.stringify(window.selectedLocation));
      const active=document.getElementById('products');
      if(active && active.classList.contains('active') && window.currentCategory && window.currentType==='products'){
        if(window.currentBusiness && typeof window.renderBusinessProductsView==='function') window.renderBusinessProductsView(window.currentBusiness,window.currentCategory);
      }
    }catch(e){}
  }
  const oldUpdate=window.updateLocationUI;
  if(typeof oldUpdate==='function') window.updateLocationUI=function(){const r=oldUpdate.apply(this,arguments);setTimeout(refresh,0);return r;};
})();



/* ===== legacy script 23 ===== */

(function(){
  'use strict';
  // Final, independent product-details handler. This intentionally sits last so
  // older product-card handlers cannot break the click flow.
  window.showProductDetail=function(rawId){
    const id=String(rawId ?? '').trim();
    const products=Array.isArray(db?.products)?db.products:[];
    const product=products.find(p=>String(p?.id ?? '').trim()===id);
    if(!product){
      if(typeof window.toast==='function') window.toast('Product not found');
      return false;
    }
    const businesses=Array.isArray(db?.businesses)?db.businesses:[];
    const business=businesses.find(b=>String(b?.id ?? '').trim()===String(product.businessId ?? '').trim());
    const images=(typeof window.productImages==='function' ? window.productImages(product) :
      (Array.isArray(product.images)&&product.images.length ? product.images : (product.image?[product.image]:[]))) || [];
    const price=Number(product.discountPrice ?? product.price ?? 0);
    const stock=(typeof window.availableStock==='function' ? Number(window.availableStock(product)) : Number(product.stock ?? product.quantity ?? 0));
    const old=document.getElementById('productDetail'); if(old) old.remove();
    const sec=document.createElement('section');
    sec.id='productDetail'; sec.className='screen active';
    const escFn=typeof window.esc==='function' ? window.esc : (v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])));
    const xid=escFn(id);
    sec.innerHTML=`<div class="page">
      <div class="page-head"><button type="button" class="btn secondary" onclick="history.back()">‹ BACK</button><b>PRODUCT DETAILS</b></div>
      <div class="detail-card">
        <div class="product-gallery" id="buyerProductGallery_${xid}" style="position:relative;overflow:hidden;touch-action:pan-y">
          <div class="buyer-product-gallery-track" id="buyerProductGalleryTrack_${xid}" style="display:flex;width:100%;transition:transform .25s ease">
            ${images.length ? images.map((src,i)=>`<div style="min-width:100%;height:300px;display:flex;align-items:center;justify-content:center;background:#101114"><img src="${escFn(src)}" alt="${escFn(product.name||'Product')} photo ${i+1}" style="width:100%;height:100%;object-fit:contain" onerror="this.style.display='none'"></div>`).join('') : '<div style="min-width:100%;height:300px;display:grid;place-items:center">PRODUCT</div>'}
          </div>
          ${images.length>1 ? `<button type="button" class="gallery-arrow gallery-prev" data-buyer-gallery-prev="${xid}" aria-label="Previous photo">‹</button><button type="button" class="gallery-arrow gallery-next" data-buyer-gallery-next="${xid}" aria-label="Next photo">›</button>` : ''}
        </div>
        ${images.length>1 ? `<div class="gallery-dots" id="buyerProductGalleryDots_${xid}">${images.map((_,i)=>`<button type="button" class="gallery-dot ${i===0?'active':''}" data-buyer-gallery-dot="${xid}" data-index="${i}" aria-label="Photo ${i+1}"></button>`).join('')}</div><div class="gallery-hint">Swipe to view ${images.length} photos</div>` : ''}
        <h1>${escFn(product.name||'Product')}</h1>
        <div class="price">₹${price.toLocaleString('en-IN')}</div>
        ${product.discountPrice?`<div class="muted"><s>₹${Number(product.price||0).toLocaleString('en-IN')}</s> discounted price</div>`:''}
        <div class="availability">${stock>0?'✓ Available':'✕ Out of stock'} · ${stock} available</div>
        <p class="muted">${escFn(product.description||'No description provided.')}</p>
        <div class="info-box"><b>${escFn(business?.name||'Business')}</b><br>${escFn(business?.address||'Address not provided')}<br>${escFn(business?.locality||'')}<br>${business?.delivery?'Home delivery available':'Self pickup only'}</div>
        <div class="field detail-quantity-field"><label>QUANTITY</label><div class="detail-qty-control" data-max-qty="${Math.max(1,stock)}"><button type="button" class="detail-qty-btn" data-detail-qty-minus aria-label="Decrease quantity">−</button><span id="detailQty" class="detail-qty-value" aria-live="polite">1</span><button type="button" class="detail-qty-btn" data-detail-qty-plus aria-label="Increase quantity">+</button></div></div>
        <div class="detail-actions">
          <button type="button" class="btn secondary" data-product-detail-cart="${xid}">+ ADD TO CART</button>
          <button type="button" class="btn primary" data-product-detail-order="${xid}">ORDER NOW</button>
        </div>
      </div>
    </div>`;
    (document.querySelector('main.shell') || document.querySelector('.app') || document.body).appendChild(sec);
    document.querySelectorAll('.screen').forEach(x=>{if(x!==sec)x.classList.remove('active');});
    sec.classList.add('active');
    // Initialize the final buyer gallery. All saved product images are rendered as slides.
    if(images.length>1){
      let galleryIndex=0, touchStartX=0;
      const track=document.getElementById('buyerProductGalleryTrackFinal_'+id);
      const gallery=document.getElementById('buyerProductGalleryFinal_'+id);
      const setGalleryIndex=(next)=>{
        galleryIndex=(next+images.length)%images.length;
        if(track) track.style.transform=`translateX(-${galleryIndex*100}%)`;
        document.querySelectorAll('#buyerProductGalleryDotsFinal_'+id+' .gallery-dot').forEach((dot,i)=>dot.classList.toggle('active',i===galleryIndex));
      };
      gallery?.addEventListener('touchstart',e=>{touchStartX=e.changedTouches[0].clientX;},{passive:true});
      gallery?.addEventListener('touchend',e=>{const dx=e.changedTouches[0].clientX-touchStartX;if(Math.abs(dx)>45)setGalleryIndex(galleryIndex+(dx<0?1:-1));},{passive:true});
      document.getElementById('buyerGalleryPrevFinal_'+id)?.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();setGalleryIndex(galleryIndex-1);});
      document.getElementById('buyerGalleryNextFinal_'+id)?.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();setGalleryIndex(galleryIndex+1);});
      document.querySelectorAll('#buyerProductGalleryDotsFinal_'+id+' .gallery-dot').forEach(dot=>dot.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();setGalleryIndex(Number(dot.dataset.finalGalleryIndex||0));}));
    }
    window.scrollTo({top:0,left:0,behavior:'auto'});
    document.documentElement.scrollTop=0; document.body.scrollTop=0;
    // Initialize the buyer gallery after the details screen is mounted.
    if(images.length>1){
      let galleryIndex=0, touchStartX=0;
      const track=document.getElementById('buyerProductGalleryTrack_'+id);
      const setGalleryIndex=(next)=>{
        galleryIndex=(next+images.length)%images.length;
        if(track) track.style.transform=`translateX(-${galleryIndex*100}%)`;
        document.querySelectorAll('[data-buyer-gallery-dot="'+id+'"]').forEach((dot,i)=>dot.classList.toggle('active',i===galleryIndex));
      };
      const gallery=document.getElementById('buyerProductGallery_'+id);
      gallery?.addEventListener('touchstart',e=>{touchStartX=e.changedTouches[0].clientX;},{passive:true});
      gallery?.addEventListener('touchend',e=>{
        const dx=e.changedTouches[0].clientX-touchStartX;
        if(Math.abs(dx)>45) setGalleryIndex(galleryIndex+(dx<0?1:-1));
      },{passive:true});
      document.querySelector('[data-buyer-gallery-prev="'+id+'"]')?.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();setGalleryIndex(galleryIndex-1);});
      document.querySelector('[data-buyer-gallery-next="'+id+'"]')?.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();setGalleryIndex(galleryIndex+1);});
      document.querySelectorAll('[data-buyer-gallery-dot="'+id+'"]').forEach(dot=>{
        dot.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();setGalleryIndex(Number(dot.dataset.index||0));});
      });
    }
    try{history.pushState({screen:'productDetail',productId:id},'', '#product');}catch(e){}
    return true;
  };
  function openFromElement(el){
    const card=el.closest('[data-product-id], .product-card, .favorite-product-row');
    if(!card) return false;
    let id=card.getAttribute('data-product-id') || card.getAttribute('data-productid');
    if(!id){
      const m=(card.getAttribute('onclick')||'').match(/showProductDetail\(['"]([^'"]+)['"]\)/);
      if(m) id=m[1];
    }
    if(!id) return false;
    window.showProductDetail(id);
    return true;
  }
  document.addEventListener('click',function(e){
    const t=e.target;
    if(!(t instanceof Element)) return;
    if(t.closest('[data-product-detail-cart]') || t.closest('[data-product-detail-order]') || t.closest('button,.btn')) return;
    if(!t.closest('.product-card') && !t.closest('.favorite-product-row')) return;
    const handled=openFromElement(t);
    if(handled){e.preventDefault();e.stopImmediatePropagation();}
  },true);
  document.addEventListener('click',function(e){
    const t=e.target;
    if(!(t instanceof Element)) return;
    const cart=t.closest('[data-product-detail-cart]');
    const order=t.closest('[data-product-detail-order]');
    const btn=cart||order;
    if(!btn) return;
    e.preventDefault(); e.stopPropagation();
    const id=btn.getAttribute(cart?'data-product-detail-cart':'data-product-detail-order');
    const qty=Math.max(1,Number(document.getElementById('detailQty')?.value ?? document.getElementById('detailQty')?.textContent ?? 1));
    if(typeof window.addToCart==='function'){ window.addToCart(id,qty); }
    else if(Array.isArray(db?.cart)){
      const p=db.products.find(x=>String(x.id)===String(id));
      if(!p)return;
      const existing=db.cart.find(x=>String(x.productId)===String(id));
      if(existing) existing.qty+=qty; else db.cart.push({productId:p.id,qty});
      if(typeof window.save==='function')window.save();
    }
    if(order && typeof window.go==='function') window.go('cart');
  },true);
})();



/* ===== legacy script 24 ===== */

(function(){
  function isLoggedIn(){
    try {
      var u = (typeof currentUser !== 'undefined' && currentUser) ||
              (typeof db !== 'undefined' && db && db.currentUser) || null;
      return !!(u && (u.id || u.uid || u.email));
    } catch(e){ return false; }
  }
  function updateBuyerNavAuth(){
    var loggedIn = isLoggedIn();
    document.querySelectorAll(
      '[data-page="orders"],[data-page="cart"],[data-nav="orders"],[data-nav="cart"]'
    ).forEach(function(el){
      if(!loggedIn){
        el.classList.add('logged-out-hidden-nav');
        el.setAttribute('aria-hidden','true');
      } else {
        el.classList.remove('logged-out-hidden-nav');
        el.removeAttribute('aria-hidden');
      }
    });
    // Fallback for common bottom-nav labels when no data attributes exist.
    document.querySelectorAll('nav a, nav button, .bottom-nav a, .bottom-nav button').forEach(function(el){
      var label=(el.textContent||'').trim().toLowerCase();
      if(label==='orders' || label==='cart'){
        el.classList.toggle('logged-out-hidden-nav', !loggedIn);
      }
    });
  }
  window.updateBuyerNavAuth = updateBuyerNavAuth;
  document.addEventListener('DOMContentLoaded', function(){
    updateBuyerNavAuth();
    setInterval(updateBuyerNavAuth, 500);
  });
})();



/* ===== legacy script 25 ===== */

(function(){
  function fixBuyerNavColumns(){
    var loggedIn = false;
    try { loggedIn = typeof isLoggedIn === 'function' ? !!isLoggedIn() : false; }
    catch(e) {}
    document.querySelectorAll('.bottom-nav.buyer-nav').forEach(function(nav){
      nav.classList.toggle('logged-out', !loggedIn);
      nav.classList.toggle('logged-in', loggedIn);
    });
  }
  window.fixBuyerNavColumns = fixBuyerNavColumns;
  document.addEventListener('DOMContentLoaded', fixBuyerNavColumns);
  setInterval(fixBuyerNavColumns, 250);
})();



/* ===== legacy script 26 ===== */

(function(){
  function openSearchFromNav(e){
    var el=e.currentTarget;
    e.preventDefault();
    e.stopPropagation();
    try {
      if (typeof showPage === 'function') { showPage('search'); return; }
      if (typeof navigateTo === 'function') { navigateTo('search'); return; }
      if (typeof navigate === 'function') { navigate('search'); return; }
      if (typeof goToPage === 'function') { goToPage('search'); return; }
    } catch(err) {}
    var searchPage=document.getElementById('search-page') ||
                   document.querySelector('[data-page="search"]');
    if(searchPage){
      document.querySelectorAll('[data-page]').forEach(function(p){
        p.classList.remove('active');
        p.hidden=true;
      });
      searchPage.hidden=false;
      searchPage.classList.add('active');
      window.scrollTo(0,0);
    }
  }

  function bindSearch(){
    document.querySelectorAll(
      '.bottom-nav a[href*="search"],' +
      '.bottom-nav button[data-page="search"],' +
      '.bottom-nav [data-route="search"],' +
      '.bottom-nav [data-nav="search"]'
    ).forEach(function(el){
      if(el.dataset.searchNavFixed==='1') return;
      el.dataset.searchNavFixed='1';
      el.addEventListener('click',openSearchFromNav,true);
    });
  }
  document.addEventListener('DOMContentLoaded',bindSearch);
  setInterval(bindSearch,500);
})();



/* ===== legacy script 27 ===== */

(function(){
  function signedIn(){
    try{
      if(typeof db==='undefined' || !db || !db.session || !Array.isArray(db.users)) return false;
      return !!db.users.find(function(x){
        return String(x.id)===String(db.session);
      });
    }catch(e){ return false; }
  }

  function loginPrompt(){
    try {
      if(typeof showPage==='function'){ showPage('profile'); }
      else if(typeof navigateTo==='function'){ navigateTo('profile'); }
      else if(typeof navigate==='function'){ navigate('profile'); }
      else if(typeof goToPage==='function'){ goToPage('profile'); }
    } catch(e) {}
    setTimeout(function(){
      var login = document.querySelector(
        '#loginModal, .login-modal, [data-page="login"], [data-screen="login"]'
      );
      if(login && typeof login.click==='function') login.click();
    }, 50);
  }

  function gateNav(e){
    if(signedIn()) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    loginPrompt();
  }

  function apply(){
    var loggedIn=signedIn();
    document.querySelectorAll('.bottom-nav.buyer-nav').forEach(function(nav){
      nav.classList.toggle('buyer-auth-logged-in',loggedIn);
      nav.classList.toggle('buyer-auth-logged-out',!loggedIn);

      nav.querySelectorAll(
        'button[data-screen="orders"],button[data-screen="cart"],' +
        'a[data-screen="orders"],a[data-screen="cart"]'
      ).forEach(function(el){
        el.style.display='flex';
        el.style.visibility='visible';
        el.style.opacity='1';
        el.style.pointerEvents='auto';

        if(el.dataset.authGateBound!=='1'){
          el.dataset.authGateBound='1';
          el.addEventListener('click',gateNav,true);
        }
      });
    });
  }

  window.applyAlwaysVisibleBuyerNav=apply;
  document.addEventListener('DOMContentLoaded',apply);
  window.addEventListener('storage',apply);
})();



/* ===== legacy script 28 ===== */

(function(){
  function serviceCategories(){
    return db.categories.filter(function(c){
      return c.type==='services' && c.scope==='marketplace';
    });
  }
  function productCategories(){
    return db.categories.filter(function(c){
      return c.type==='products' && c.scope==='marketplace';
    });
  }

  window.createBusiness=function(){
    if(!user()||user().role!=='seller') return go('auth');
    openModal(`<button class="close" onclick="closeModal()">×</button><h2>Create Business</h2>
      <div class="field"><label>BUSINESS TYPE</label>
        <div class="business-type-choice">
          <button id="btProduct" class="btn secondary active" type="button" onclick="selectBusinessType('products')">🛍️<br><b>PRODUCT BUSINESS</b><br><small>Sell physical products</small></button>
          <button id="btService" class="btn secondary" type="button" onclick="selectBusinessType('services')">🛠️<br><b>SERVICE BUSINESS</b><br><small>Offer local services</small></button>
        </div>
        <input type="hidden" id="btype" value="products">
      </div>
      <div class="field"><label>BUSINESS NAME</label><input id="bn" placeholder="ABC Auto Parts"></div>
      <div class="field"><label>OWNER NAME</label><input id="bo" value="${esc(user().name)}"></div>
      <div class="field"><label>PHONE</label><input id="bp" value="${esc(user().contact)}"></div>
      <div class="field"><label id="businessCategoryLabel">PRODUCT CATEGORY</label>
        <div class="row">
          <select id="bc">${productCategories().map(c=>`<option value="${c.id}">${esc(c.name)}</option>`).join('')}</select>
          <button class="btn secondary" type="button" onclick="createBusinessCategory()">+ CATEGORY</button>
        </div>
        <small id="businessCategoryHint" class="muted">Products listed in this business will use this category.</small>
      </div>
      <div class="field"><label>ADDRESS</label><input id="ba" placeholder="Full shop / office address"></div>
      <div class="field"><label>CITY / DISTRICT</label><select id="bcity">${ODISHA_LOCATIONS.map(([city,district])=>`<option value="${city}" ${city==='Bhubaneswar'?'selected':''}>${city} — ${district}</option>`).join('')}</select></div>
      <div class="field"><label>LOCALITY / AREA</label><input id="bl" list="businessAreaList" placeholder="e.g. Patia, Saheed Nagar"><datalist id="businessAreaList"></datalist></div>
      <div class="field"><label>BUSINESS LOGO</label><input id="blogoFile" type="file" accept="image/*" onchange="previewUpload(this,'businessLogoPreview')"><div id="businessLogoPreview" class="upload-preview"></div></div>
      <div class="field"><label>COVER IMAGE</label><input id="bcoverFile" type="file" accept="image/*" onchange="previewUpload(this,'businessCoverPreview')"><div id="businessCoverPreview" class="upload-preview cover-preview"></div></div>
      <div class="field"><label>OPENING HOURS</label><input id="bhours" placeholder="9:00 AM – 8:00 PM"></div>
      <div class="field"><label>DELIVERY</label><select id="bd"><option value="no">NO, SELF PICKUP ONLY</option><option value="yes">YES, I PROVIDE HOME DELIVERY</option></select></div>
      <div class="field"><label>PAYMENT POLICY</label><select id="bpay"><option>Pay at store</option><option>Online payment accepted</option><option>Advance payment required</option></select></div>
      <button class="btn primary full" onclick="saveBusiness()">CREATE BUSINESS</button>`);
    const dl=document.getElementById('businessAreaList');
    if(dl) dl.innerHTML=getBusinessAreas(document.getElementById('bcity')?.value||'Bhubaneswar').map(a=>`<option value="${esc(a)}"></option>`).join('');
  };

  window.selectBusinessType=function(type){
    const input=document.getElementById('btype'), select=document.getElementById('bc');
    if(!input||!select)return;
    input.value=type;
    const isService=type==='services';
    document.getElementById('btProduct')?.classList.toggle('active',!isService);
    document.getElementById('btService')?.classList.toggle('active',isService);
    const cats=isService?serviceCategories():productCategories();
    select.innerHTML=cats.map(c=>`<option value="${c.id}">${esc(c.name)}</option>`).join('');
    const label=document.getElementById('businessCategoryLabel');
    const hint=document.getElementById('businessCategoryHint');
    if(label)label.textContent=isService?'SERVICE CATEGORY':'PRODUCT CATEGORY';
    if(hint)hint.textContent=isService?'Services listed in this business will use this category.':'Products listed in this business will use this category.';
  };

  window.saveBusiness=async function(){
    const u=user();
    if(!u||u.role!=='seller')return go('auth');
    const type=document.getElementById('btype')?.value==='services'?'services':'products';
    const catId=document.getElementById('bc')?.value;
    const cat=db.categories.find(c=>c.id===catId && c.type===type);
    if(!cat)return toast('Please select a valid '+(type==='services'?'service':'product')+' category');
    let logo='',cover='';
    try{
      logo=await window.imageFrom('blogoFile');
      cover=await window.imageFrom('bcoverFile');
    }catch(e){
      toast(e.message||'Could not read business photo. Please choose it again.');
      return;
    }
    const city=document.getElementById('bcity')?.value||'Bhubaneswar';
    const b={
      id:uid('biz'),ownerId:u.id,name:document.getElementById('bn').value.trim()||'My Business',
      ownerName:document.getElementById('bo').value,phone:document.getElementById('bp').value,
      businessType:type,categoryType:type,categoryId:cat.id,category:cat.name,
      address:document.getElementById('ba').value||'Local address',
      locality:document.getElementById('bl').value||city,city,
      district:(ODISHA_LOCATIONS.find(x=>x[0]===city)||[])[1]||'Khordha',
      logo,cover,hours:document.getElementById('bhours').value||'Opening hours not provided',
      delivery:document.getElementById('bd').value==='yes',
      paymentPolicy:document.getElementById('bpay').value
    };
    db.businesses.push(b);
    save();closeModal();currentBusiness=b.id;openSeller(b.id);
    toast(type==='services'?'Service business created':'Product business created');
  };

  window.createBusinessCategory=function(){
    const type=document.getElementById('btype')?.value==='services'?'services':'products';
    const name=prompt('New '+(type==='services'?'service':'product')+' category name');
    if(!name||!name.trim())return;
    const clean=name.trim();
    if(db.categories.some(c=>c.type===type&&c.scope==='marketplace'&&c.name.toLowerCase()===clean.toLowerCase()))
      return toast('Category already exists');
    const c={id:uid('cat'),name:clean,type,scope:'marketplace',createdAt:Date.now(),status:'active'};
    db.categories.push(c);save();
    const sel=document.getElementById('bc');
    if(sel){
      const cats=type==='services'?serviceCategories():productCategories();
      sel.innerHTML=cats.map(x=>`<option value="${x.id}">${esc(x.name)}</option>`).join('');
      sel.value=c.id;
    }
    toast((type==='services'?'Service':'Product')+' category created');
  };

  window.addService=function(){
    const u=requireSeller();if(!u)return;
    const bid=currentBusiness || db.businesses.find(b=>b.ownerId===u.id&&b.businessType==='services')?.id;
    const b=db.businesses.find(x=>x.id===bid&&x.ownerId===u.id);
    if(!b)return toast('Create a service business first');
    if(b.businessType!=='services')return toast('This is a product business. Create a service business to add services.');
    const cats=serviceCategories();
    openModal(`<button class="close" onclick="closeModal()">×</button><h2>Add Service</h2>
      <div class="notice"><b>${esc(b.name)}</b><br><span class="muted">${esc(b.locality||'')}</span></div>
      <div class="field"><label>SERVICE NAME</label><input id="sn" placeholder="AC Repair"></div>
      <div class="field"><label>SERVICE CATEGORY</label><select id="sc">${cats.map(c=>`<option value="${c.id}">${esc(c.name)}</option>`).join('')}</select></div>
      <div class="field"><label>STARTING PRICE (OPTIONAL)</label><input id="sp" type="number" min="0" placeholder="500"></div>
      <div class="field"><label>DESCRIPTION</label><textarea id="sx" placeholder="Describe the service"></textarea></div>
      <div class="field"><label>SERVICE AREA</label><input id="sa" value="${esc(b.locality||'')}"></div>
      <button class="btn primary full" onclick="saveServiceForBusiness('${b.id}')">ADD SERVICE</button>`);
  };

  window.saveServiceForBusiness=function(bid){
    const u=requireSeller();if(!u)return;
    const selectedId=String(bid||currentBusiness||'');
    const b=db.businesses.find(x=>String(x.id)===selectedId&&x.ownerId===u.id&&x.businessType==='services');
    if(!b)return toast('Service business required');
    const name=document.getElementById('sn')?.value.trim();
    const categoryId=document.getElementById('sc')?.value;
    if(!name||!categoryId)return toast('Service name and category are required');
    const cat=db.categories.find(c=>c.id===categoryId&&c.type==='services');
    db.services=db.services||[];
    db.services.push({
      id:uid('service'),businessId:b.id,ownerId:u.id,providerName:b.name,name,
      description:document.getElementById('sx')?.value||'',
      categoryId,category:cat?.name||'Services',
      price:Number(document.getElementById('sp')?.value)||null,
      startingPrice:document.getElementById('sp')?.value||'',
      serviceArea:document.getElementById('sa')?.value||b.locality||'',
      available:true,phone:b.phone||''
    });
    save();closeModal();renderSeller();toast('Service added');
  };

  const originalRenderSeller=window.renderSeller;
  window.renderSeller=function(){
    const u=user();
    if(!u||u.role!=='seller'){if(typeof originalRenderSeller==='function')return originalRenderSeller();return;}
    const b=db.businesses.find(x=>x.id===currentBusiness&&x.ownerId===u.id);
    if(!b||b.businessType!=='services'){
      if(typeof originalRenderSeller==='function')return originalRenderSeller();
      return;
    }
    document.body.classList.add('seller-mode');
    const services=(db.services||[]).filter(s=>s.businessId===b.id);
    const reservations=(db.reservations||[]).filter(r=>r.businessId===b.id);
    const pending=reservations.filter(r=>String(r.status||'').includes('WAITING')||r.status==='RESERVED').length;
    document.getElementById('sellerContent').innerHTML=`<div class="page-head"><div class="page-title">SERVICE BUSINESS</div></div>
      <div class="card seller-business-head">${b.cover?`<div class="seller-cover"><img src="${esc(b.cover)}"></div>`:''}
        <div class="row"><div class="seller-biz-main">${b.logo?`<img class="seller-logo" src="${esc(b.logo)}">`:''}<div><h2 style="margin:0">${esc(b.name)}</h2><div class="muted">${esc(b.address)}</div><div class="muted">Service business · ${esc(b.category||'Services')}</div></div></div>
        <button class="btn danger" onclick="deleteBusiness('${b.id}')">DELETE BUSINESS</button></div>
      </div>
      <div class="dashboard-stats"><div class="stat-card"><b>${services.length}</b><span>SERVICES</span></div><div class="stat-card"><b>${reservations.length}</b><span>REQUESTS / ORDERS</span></div><div class="stat-card"><b>${pending}</b><span>PENDING</span></div></div>
      <div class="dashboard-actions"><button class="btn primary" onclick="addService()">+ SERVICE</button><button class="btn secondary" onclick="renderProfile();go('profile')">PROFILE</button></div>
      <div class="row" style="margin-bottom:9px"><h3 style="margin:0">MY SERVICES</h3><span class="status">${services.length}</span></div>
      <div class="card">${services.length?services.map(s=>`<div class="row" style="padding:10px 0;border-bottom:1px solid #292a2f"><div><b>${esc(s.name)}</b><small class="muted" style="display:block">${esc(s.category||'Services')} · ${s.price?'From ₹'+Number(s.price).toLocaleString('en-IN'):'Price on request'} · ${esc(s.serviceArea||b.locality||'')}</small></div></div>`).join(''):'<div class="muted">No services yet. Tap + SERVICE to add one.</div>'}</div>`;
  };
})();



/* ===== legacy script 29 ===== */

(function(){
  db.services=db.services||[];
  db.serviceBookings=db.serviceBookings||[];

  function getService(id){return db.services.find(function(x){return String(x.id)===String(id);});}
  function getBusiness(id){return db.businesses.find(function(x){return String(x.id)===String(id);});}

  /* Override the old "Request Service" action with the real booking flow. */
  window.requestService=function(serviceId){
    return window.bookService(serviceId);
  };

  window.bookService=function(serviceId){
    var s=getService(serviceId);
    var b=s&&getBusiness(s.businessId);
    var u=typeof user==='function'?user():null;
    if(!u){go('auth');return;}
    if(!s||!b){toast('Service not found');return;}

    var dates=[];
    for(var i=0;i<14;i++){
      var d=new Date();d.setDate(d.getDate()+i);
      dates.push(d.toISOString().slice(0,10));
    }
    var times=[];
    for(var h=9;h<=19;h++){
      times.push(String(h).padStart(2,'0')+':00');
      if(h<19)times.push(String(h).padStart(2,'0')+':30');
    }

    openModal(
      '<button class="close" onclick="closeModal()">×</button>'+
      '<h2>Book Service</h2>'+
      '<div class="notice"><b>'+esc(s.name)+'</b><br>'+esc(b.name)+
      '<br>'+(s.price?'Starting from ₹'+Number(s.price).toLocaleString('en-IN'):'Price on request')+'</div>'+
      '<div class="field"><label>VEHICLE TYPE</label><select id="realSvcVehicle"><option>Hatchback</option><option>Sedan</option><option>SUV</option><option>MUV</option><option>Other</option></select></div>'+
      '<div class="field"><label>VEHICLE NUMBER</label><input id="realSvcVehicleNo" placeholder="OD 02 AB 1234"></div>'+
      '<div class="field"><label>DATE</label><select id="realSvcDate">'+
      dates.map(function(d,i){return '<option value="'+d+'">'+(i===0?'Today':i===1?'Tomorrow':new Date(d).toLocaleDateString('en-IN',{day:'numeric',month:'short'}))+'</option>';}).join('')+
      '</select></div>'+
      '<div class="field"><label>TIME SLOT</label><div class="service-action-grid" id="realSvcTimes">'+
      times.map(function(t){return '<button type="button" class="service-slot" data-time="'+t+'" onclick="chooseRealServiceTime(this)">'+t+'</button>';}).join('')+
      '</div><input id="realSvcTime" type="hidden"></div>'+
      '<div class="field"><label>NOTES</label><textarea id="realSvcNotes" placeholder="Anything the service provider should know"></textarea></div>'+
      '<button class="btn primary full" onclick="confirmRealServiceBooking(\''+s.id+'\')">CONFIRM BOOKING</button>'
    );
  };

  window.chooseRealServiceTime=function(el){
    document.querySelectorAll('#realSvcTimes .service-slot').forEach(function(x){x.classList.remove('active');});
    el.classList.add('active');
    document.getElementById('realSvcTime').value=el.dataset.time;
  };

  window.confirmRealServiceBooking=function(serviceId){
    var s=getService(serviceId);
    var b=s&&getBusiness(s.businessId);
    var u=typeof user==='function'?user():null;
    if(!u){go('auth');return;}
    if(!s||!b){toast('Service not found');return;}
    var time=document.getElementById('realSvcTime').value;
    if(!time){toast('Please select a time slot');return;}

    var booking={
      id:uid('booking'),
      type:'SERVICE_BOOKING',
      serviceId:s.id,
      businessId:b.id,
      customerId:u.id,
      customerName:u.name||u.email||'Customer',
      serviceName:s.name,
      vehicleType:document.getElementById('realSvcVehicle').value,
      vehicleNumber:document.getElementById('realSvcVehicleNo').value.trim(),
      date:document.getElementById('realSvcDate').value,
      time:time,
      notes:document.getElementById('realSvcNotes').value.trim(),
      price:Number(s.price)||0,
      status:'PENDING',
      createdAt:Date.now()
    };

    db.serviceBookings=db.serviceBookings||[];
    db.serviceBookings.push(booking);
    db.reservations=db.reservations||[];
    db.reservations.push({
      id:booking.id,
      userId:u.id,
      businessId:b.id,
      customerId:u.id,
      customerName:booking.customerName,
      type:'SERVICE_BOOKING',
      serviceId:s.id,
      serviceName:s.name,
      vehicleType:booking.vehicleType,
      vehicleNumber:booking.vehicleNumber,
      date:booking.date,
      time:booking.time,
      total:booking.price,
      status:'PENDING',
      createdAt:booking.createdAt
    });
    save();
    closeModal();
    toast('Service booking request sent');
  };

  /* Replace common old service-request buttons wherever they are rendered. */
  function replaceServiceRequestButtons(){
    document.querySelectorAll('button,a').forEach(function(el){
      var label=(el.textContent||'').trim().toLowerCase();
      if(label!=='request service' && label!=='request' && label!=='reserve service')return;

      var onclick=el.getAttribute('onclick')||'';
      var m=onclick.match(/['"]([^'"]+)['"]/);
      var id=m&&m[1];
      if(!id)return;

      el.textContent='BOOK NOW';
      el.classList.remove('secondary','danger');
      el.classList.add('primary');
      el.setAttribute('onclick','bookService(\''+id+'\')');
      el.removeAttribute('href');
    });
  }

  document.addEventListener('DOMContentLoaded',replaceServiceRequestButtons);
  setInterval(replaceServiceRequestButtons,500);
})();



/* ===== legacy script 30 ===== */

(function(){
  const originalCreateBusiness = window.createBusiness;
  window.createBusiness = function(){
    const u = typeof user==='function' ? user() : null;
    if(!u || u.role!=='seller'){ if(typeof go==='function') go('auth'); return; }
    const cats = db.categories.filter(c=>c.type==='products' && c.scope==='marketplace');
    openModal(`
      <div class="premium-sheet">
        <div class="premium-scroll">
          <button class="premium-close" onclick="closeModal()">×</button>
          <div class="premium-hero">
            <div class="premium-kicker">SELLER SETUP</div>
            <h2>Create your business</h2>
            <p>Build a professional storefront customers can discover, trust and shop from.</p>
            <div style="margin-top:12px"><span class="form-badge">✓ FREE BUSINESS LISTING</span></div>
          </div>

          <div class="form-section">
            <div class="form-section-title">Business identity</div>
            <div class="form-section-sub">The information customers will see first.</div>
            <div class="premium-field">
              <label>BUSINESS NAME *</label>
              <input id="bn" placeholder="e.g. Rout Electronics" autocomplete="organization">
            </div>
            <div class="premium-grid">
              <div class="premium-field">
                <label>OWNER NAME</label>
                <input id="bo" value="${esc(u.name)}">
              </div>
              <div class="premium-field">
                <label>PHONE</label>
                <input id="bp" value="${esc(u.contact)}" inputmode="tel">
              </div>
            </div>
            <div class="premium-field">
              <label>BUSINESS CATEGORY *</label>
              <div style="display:flex;gap:8px">
                <select id="bc" style="flex:1">${cats.map(c=>`<option value="${esc(c.id)}">${esc(c.name)}</option>`).join('')}</select>
                <button class="btn secondary" type="button" onclick="createBusinessCategory()" style="height:46px;border-radius:12px;white-space:nowrap">+ New</button>
              </div>
              <div class="premium-help">Your products will appear automatically in this category.</div>
            </div>
          </div>

          <div class="form-section">
            <div class="form-section-title">Store location</div>
            <div class="form-section-sub">Help nearby customers find your exact business.</div>
            <div class="premium-field">
              <label>FULL ADDRESS</label>
              <input id="ba" placeholder="Shop no., street, landmark">
            </div>
            <div class="premium-grid">
              <div class="premium-field">
                <label>CITY / DISTRICT</label>
                <select id="bcity" onchange="this.form?.dispatchEvent(new Event('change'))">
                  ${ODISHA_LOCATIONS.map(([city,district])=>`<option value="${esc(city)}" ${city===selectedLocation.city?'selected':''}>${esc(city)} — ${esc(district)}</option>`).join('')}
                </select>
              </div>
              <div class="premium-field">
                <label>LOCALITY / AREA *</label>
                <input id="bl" list="businessAreaList" placeholder="e.g. Patia, Saheed Nagar">
                <datalist id="businessAreaList"></datalist>
              </div>
            </div>
            <div class="premium-help">Use the locality customers normally search for. This also helps SORTED show your shop in the right area.</div>
          </div>

          <div class="form-section">
            <div class="form-section-title">Brand photos</div>
            <div class="form-section-sub">A good logo and cover photo make your business tile look much more professional.</div>
            <div class="premium-grid">
              <div class="premium-field">
                <label>BUSINESS LOGO</label>
                <div class="photo-drop">
                  <div class="photo-drop-icon">◎</div><strong>Upload logo</strong><span>Square image recommended</span>
                  <input id="blogoFile" type="file" accept="image/*" onchange="previewUpload(this,'businessLogoPreview')">
                  <div id="businessLogoPreview" class="upload-preview"></div>
                </div>
              </div>
              <div class="premium-field">
                <label>COVER IMAGE</label>
                <div class="photo-drop" style="min-height:118px">
                  <div class="photo-drop-icon">▧</div><strong>Upload cover</strong><span>Wide image recommended</span>
                  <input id="bcoverFile" type="file" accept="image/*" onchange="previewUpload(this,'businessCoverPreview')">
                  <div id="businessCoverPreview" class="upload-preview"></div>
                </div>
              </div>
            </div>
          </div>

          <div class="form-section">
            <div class="form-section-title">Customer experience</div>
            <div class="form-section-sub">Set expectations before customers visit or order.</div>
            <div class="premium-grid">
              <div class="premium-field">
                <label>OPENING HOURS</label>
                <input id="bhours" placeholder="9:00 AM – 8:00 PM">
              </div>
              <div class="premium-field">
                <label>DELIVERY</label>
                <select id="bd">
                  <option value="no">Self pickup only</option>
                  <option value="yes">Home delivery available</option>
                </select>
              </div>
            </div>
            <div class="premium-field">
              <label>PAYMENT POLICY</label>
              <select id="bpay">
                <option>Pay at store</option>
                <option>Online payment accepted</option>
                <option>Advance payment required</option>
              </select>
            </div>
          </div>

          <div class="premium-actions">
            <button class="btn secondary" onclick="closeModal()">Cancel</button>
            <button class="btn primary" onclick="saveBusiness()">Create business</button>
          </div>
        </div>
      </div>
    `);
    const dl=document.getElementById('businessAreaList');
    if(dl) dl.innerHTML=getBusinessAreas(document.getElementById('bcity')?.value||selectedLocation.city||'Bhubaneswar').map(a=>`<option value="${esc(a)}"></option>`).join('');
  };

  window.addProduct = function(bid){
    const b=db.businesses.find(x=>x.id===bid);
    if(!b) return;
    const cat=db.categories.find(c=>c.id===b.categoryId);
    if(!cat) return toast('Please set a business category first');

    openModal(`
      <div class="premium-sheet">
        <div class="premium-scroll">
          <button class="premium-close" onclick="closeModal()">×</button>
          <div class="premium-hero">
            <div class="premium-kicker">PRODUCT LISTING</div>
            <h2>Add a new product</h2>
            <p>Give customers the information they need to understand, compare and buy your product.</p>
            <div style="margin-top:12px"><span class="form-badge">CATEGORY · ${esc(cat.name)}</span></div>
          </div>

          <div class="form-section">
            <div class="form-section-title">Product basics</div>
            <div class="form-section-sub">Keep the product name short and easy to search.</div>
            <div class="premium-field">
              <label>PRODUCT NAME *</label>
              <input id="pn" placeholder="e.g. Samsung 55-inch Smart TV" autocomplete="off">
            </div>
            <div class="premium-field">
              <label>DESCRIPTION</label>
              <textarea id="px" placeholder="Describe the product, key features, size, model or other useful details..."></textarea>
            </div>
          </div>

          <div class="form-section">
            <div class="form-section-title">Product photos</div>
            <div class="form-section-sub">Add up to 8 clear photos. The first image becomes the main product photo.</div>
            <div class="photo-drop" style="min-height:145px">
              <div class="photo-drop-icon">▣</div><strong>Choose product photos</strong><span>Multiple images supported</span>
              <input id="piFile" type="file" accept="image/*" multiple onchange="previewMultiUpload(this,'productImagePreview')">
              <div id="productImagePreview" class="multi-upload-preview"></div>
            </div>
          </div>

          <div class="form-section">
            <div class="form-section-title">Pricing & stock</div>
            <div class="form-section-sub">Customers will see the selling price. Keep stock accurate for real-time availability.</div>
            <div class="price-row">
              <div class="premium-field">
                <label>PRICE (₹) *</label>
                <input id="pp" type="number" min="0" step="0.01" placeholder="1200" inputmode="decimal">
              </div>
              <div class="premium-field">
                <label>DISCOUNT PRICE (₹)</label>
                <input id="pd" type="number" min="0" step="0.01" placeholder="Optional" inputmode="decimal">
              </div>
            </div>
            <div class="price-row">
              <div class="premium-field">
                <label>AVAILABLE STOCK *</label>
                <input id="ps" type="number" min="0" step="1" placeholder="25" inputmode="numeric">
              </div>
              <div class="premium-field">
                <label>UNIT</label>
                <select id="pu">
                  <option value="piece">Piece</option>
                  <option value="pair">Pair</option>
                  <option value="set">Set</option>
                  <option value="box">Box</option>
                  <option value="kg">Kg</option>
                  <option value="gram">Gram</option>
                  <option value="litre">Litre</option>
                  <option value="metre">Metre</option>
                </select>
              </div>
            </div>
          </div>

          <div class="premium-actions">
            <button class="btn secondary" onclick="closeModal()">Cancel</button>
            <button class="btn primary" onclick="saveProduct('${bid}')">List product</button>
          </div>
        </div>
      </div>
    `);
  };
})();



/* ===== legacy script 31 ===== */

(function(){
  const state={biz:{step:1,logo:'',cover:''},prod:{step:1,images:[],draft:false}};
  const oldCreateBusiness=window.createBusiness;
  const oldAddProduct=window.addProduct;

  function sheet(inner){
    openModal('<div class="onboard-sheet"><div class="onboard-scroll">'+inner+'</div></div>');
  }
  function esc2(v){return typeof esc==='function'?esc(v):String(v||'');}

  window.createBusiness=function(){
    const u=user(); if(!u||u.role!=='seller'){go('auth');return;}
    state.biz={step:1,logo:'',cover:'',businessType:'products'}; renderBiz();
  };
  function renderBiz(){
    const s=state.biz.step, u=user();
    const titles=['Business identity','Location','Brand your storefront','Customer experience'];
    const subs=[
      'Tell customers what your business is and what you sell.',
      'Set the location customers should use to discover your store.',
      'Add your logo and cover photo and preview your storefront.',
      'Choose how customers can visit, collect and pay.'
    ];
    let body='';
    if(s===1) body=`
      <div class="onboard-panel">
        <div class="onboard-field"><label class="onboard-label">BUSINESS NAME *</label><input class="onboard-input" id="bn" placeholder="e.g. Rout Electronics"></div>
        <div class="onboard-grid">
          <div class="onboard-field"><label class="onboard-label">OWNER NAME</label><input class="onboard-input" id="bo" value="${esc2(u.name)}"></div>
          <div class="onboard-field"><label class="onboard-label">PHONE</label><input class="onboard-input" id="bp" value="${esc2(u.contact)}" inputmode="tel"></div>
        </div>
        <div class="onboard-field"><label class="onboard-label">BUSINESS TYPE *</label>
          <div class="business-type-choice" style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
            <button type="button" class="btn secondary ${state.biz.businessType==='products'?'active':''}" onclick="selectOnboardBusinessType('products')">🛍️<br><b>PRODUCT BUSINESS</b><br><small>Sell products</small></button>
            <button type="button" class="btn secondary ${state.biz.businessType==='services'?'active':''}" onclick="selectOnboardBusinessType('services')">🛠️<br><b>SERVICE BUSINESS</b><br><small>Offer services</small></button>
          </div>
          <input type="hidden" id="btype" value="${esc2(state.biz.businessType||'products')}">
        </div>
        <div class="onboard-field"><label class="onboard-label" id="businessCategoryLabel">${state.biz.businessType==='services'?'SERVICE CATEGORY':'PRODUCT CATEGORY'} *</label>
          <div style="display:flex;gap:8px"><select class="onboard-select" id="bc" onchange="state.biz.bc=this.value" style="flex:1">${db.categories.filter(c=>c.type===(state.biz.businessType==='services'?'services':'products')&&c.scope==='marketplace').map(c=>`<option value="${esc2(c.id)}" ${c.id===state.biz.bc?'selected':''}>${esc2(c.name)}</option>`).join('')}</select><button class="btn secondary" type="button" onclick="createOnboardBusinessCategory()" style="height:46px;border-radius:12px">+ New</button></div>
          <small id="businessCategoryHint" class="muted">${state.biz.businessType==='services'?'Services listed in this business will use this category.':'Products listed in this business will use this category.'}</small>
        </div>
        <div class="onboard-field"><label class="onboard-label">SHORT DESCRIPTION</label><textarea class="onboard-textarea" id="bdesc" placeholder="What makes your business useful to local customers?"></textarea></div>
      </div>`;
    if(s===2) body=`
      <div class="onboard-panel">
        <div class="onboard-field"><label class="onboard-label">CITY / DISTRICT</label><select class="onboard-select" id="bcity">${ODISHA_LOCATIONS.map(([c,d])=>`<option value="${esc2(c)}" ${c===selectedLocation.city?'selected':''}>${esc2(c)} — ${esc2(d)}</option>`).join('')}</select></div>
        <div class="onboard-field"><label class="onboard-label">LOCALITY / AREA *</label><input class="onboard-input" id="bl" list="businessAreaList" placeholder="e.g. Patia, Saheed Nagar"></div>
        <div class="onboard-field"><label class="onboard-label">FULL ADDRESS</label><input class="onboard-input" id="ba" placeholder="Shop no., street, landmark"></div>
        <div style="background:#eafff2;border:1px solid #c7f1d9;border-radius:13px;padding:11px;font-size:10px;color:#08753c">✓ Your locality helps SORTED show your store to customers shopping nearby.</div>
      </div>`;
    if(s===3) body=`
      <div class="onboard-panel">
        <div class="onboard-grid">
          <div><label class="onboard-label">BUSINESS LOGO</label><div class="onboard-upload"><div style="font-size:28px">◎</div><strong>Upload logo</strong><span>Square image recommended</span><input id="blogoFile" type="file" accept="image/*" onchange="bizPhotoPreview(this,'logo')"><div id="bizLogoMini"></div></div></div>
          <div><label class="onboard-label">COVER PHOTO</label><div class="onboard-upload"><div style="font-size:28px">▧</div><strong>Upload cover</strong><span>Wide image recommended</span><input id="bcoverFile" type="file" accept="image/*" onchange="bizPhotoPreview(this,'cover')"><div id="bizCoverMini"></div></div></div>
        </div>
      </div>
      <div class="onboard-panel"><div style="font-size:11px;font-weight:950;margin-bottom:10px">CUSTOMER VIEW</div>${bizPreview()}</div>`;
    if(s===4) body=`
      <div class="onboard-panel">
        <div class="onboard-grid">
          <div class="onboard-field"><label class="onboard-label">OPENING HOURS</label><input class="onboard-input" id="bhours" placeholder="9:00 AM – 8:00 PM"></div>
          <div class="onboard-field"><label class="onboard-label">DELIVERY</label><select class="onboard-select" id="bd"><option value="no">Self pickup only</option><option value="yes">Home delivery available</option></select></div>
        </div>
        <div class="onboard-field"><label class="onboard-label">PAYMENT POLICY</label><select class="onboard-select" id="bpay"><option>Pay at store</option><option>Online payment accepted</option><option>Advance payment required</option></select></div>
      </div>
      <div class="onboard-panel">${bizPreview()}<div style="margin-top:10px;font-size:10px;color:#6d7873">You can edit your storefront later from Seller Dashboard.</div></div>`;
    sheet(`<div class="onboard-top"><button class="onboard-back" onclick="${s===1?'closeModal()':'bizPrev()'}">${s===1?'×':'‹'}</button><div class="onboard-steptext">BUSINESS SETUP · ${s} OF 4</div></div><div class="onboard-progress"><i style="width:${s*25}%"></i></div><h2 class="onboard-title">${titles[s-1]}</h2><p class="onboard-sub">${subs[s-1]}</p>${body}<div class="onboard-actions">${s>1?'<button class="onboard-secondary" onclick="bizPrev()">Back</button>':''}<button class="onboard-primary" onclick="${s<4?'bizNext()':'saveBusinessV80()'}">${s<4?'Continue':'Create business'}</button></div>`);
  }
  window.selectOnboardBusinessType=function(type){
    state.biz.businessType=type==='services'?'services':'products';
    state.biz.bc='';
    renderBiz();
  };
  window.createOnboardBusinessCategory=function(){
    const type=state.biz.businessType==='services'?'services':'products';
    const name=prompt('New '+(type==='services'?'service':'product')+' category name');
    if(!name||!name.trim())return;
    const clean=name.trim();
    if(db.categories.some(c=>c.type===type&&c.scope==='marketplace'&&String(c.name).toLowerCase()===clean.toLowerCase()))return toast('Category already exists');
    const c={id:uid('cat'),name:clean,type,scope:'marketplace',createdAt:Date.now(),status:'active'};
    db.categories.push(c); save(); state.biz.bc=c.id; renderBiz(); toast((type==='services'?'Service':'Product')+' category created');
  };
  window.bizNext=function(){
    const s=state.biz.step;
    if(s===1&&!document.getElementById('bn')?.value.trim())return toast('Enter a business name');
    if(s===2&&!document.getElementById('bl')?.value.trim())return toast('Enter your locality / area');
    captureBiz();
    state.biz.step=Math.min(4,s+1);renderBiz();
  };
  window.bizPrev=function(){captureBiz();state.biz.step=Math.max(1,state.biz.step-1);renderBiz();};
  function captureBiz(){
    ['bn','bo','bp','bc','bdesc','bcity','bl','ba','bhours','bd','bpay','btype'].forEach(id=>{const e=document.getElementById(id);if(e)state.biz[id]=e.value;});
    // Keep the business type/category permanently in state even after the
    // step-1 controls are unmounted by the multi-step renderer.
    if(state.biz.btype) state.biz.businessType = state.biz.btype==='services' ? 'services' : 'products';
    if(state.biz.bc){
      state.biz.categoryId = String(state.biz.bc);
      const c=(db.categories||[]).find(x=>String(x.id)===String(state.biz.bc));
      if(c) state.biz.categoryName=c.name;
    }
  }
  window.bizPhotoPreview=async function(input,type){
    try{const data=await window.imageFrom(input);state.biz[type]=data;renderBiz();}
    catch(e){toast(e.message||'Could not read photo. Please choose it again.');}
  };
  function bizPreview(){
    const cat=db.categories.find(c=>c.id===state.biz.bc);
    return `<div class="onboard-preview-card"><div class="onboard-cover">${state.biz.cover?`<img src="${esc2(state.biz.cover)}">`:'<div style="height:100%;display:flex;align-items:center;justify-content:center;color:#87938d;font-size:11px">Cover photo</div>'}</div><div class="onboard-biz-body">${state.biz.logo?`<img class="onboard-logo" src="${esc2(state.biz.logo)}">`:'<div class="onboard-logo" style="display:flex;align-items:center;justify-content:center;font-size:22px">◎</div>'}<div><div class="onboard-biz-name">${esc2(state.biz.bn||'Your Business')}</div><div class="onboard-meta">${esc2(cat?.name||'Business')} · 📍 ${esc2(state.biz.bl||'Your area')}</div><div class="onboard-pills"><span class="onboard-pill">✓ Local</span><span class="onboard-pill">${state.biz.bd==='yes'?'Delivery':'Pickup'}</span></div></div></div></div>`;
  }

  window.saveBusinessV80=async function(){
    // Persist the final step's fields and explicitly preserve the category chosen on step 1.
    captureBiz();
    const btype=state.biz.businessType==='services'?'services':'products';
    let catId=String(state.biz.bc||'');
    let cat=db.categories.find(c=>String(c.id)===catId && c.type===btype && c.scope==='marketplace');

    // If a browser/onboarding rerender cleared the selected value, recover the
    // first available category of the selected business type instead of rejecting
    // a category the user already chose.
    if(!cat){
      const available=db.categories.filter(c=>c.type===btype && c.scope==='marketplace');
      if(available.length){
        cat=available[0];
        state.biz.bc=cat.id;
      }
    }
    if(!cat)return toast('Please select a valid '+(btype==='services'?'service':'product')+' category');

    let logo=state.biz.logo||'',cover=state.biz.cover||'';
    const b={
      id:uid('biz'),ownerId:user().id,businessType:btype,categoryType:btype,
      name:state.biz.bn.trim()||'My Business',ownerName:state.biz.bo||user().name,
      phone:state.biz.bp||user().contact,categoryId:cat.id,category:cat.name,
      description:state.biz.bdesc||'',address:state.biz.ba||'Local address',
      locality:state.biz.bl||state.biz.bcity||'Nearby',city:state.biz.bcity||'Bhubaneswar',
      district:(ODISHA_LOCATIONS.find(x=>x[0]===state.biz.bcity)||[])[1]||'Khordha',
      logo,cover,hours:state.biz.bhours||'Opening hours not provided',
      delivery:state.biz.bd==='yes',paymentPolicy:state.biz.bpay||'Pay at store'
    };
    db.businesses.push(b);save();closeModal();openSeller(b.id);
  };

  window.addProduct=function(bid){
    const b=db.businesses.find(x=>x.id===bid);if(!b)return;
    state.prod={step:1,images:[],draft:false,bid};renderProd();
  };
  function renderProd(){
    const s=state.prod.step,b=db.businesses.find(x=>x.id===state.prod.bid),cat=db.categories.find(c=>c.id===b?.categoryId);
    let body='';
    if(s===1)body=`<div class="onboard-panel"><div class="onboard-field"><label class="onboard-label">PRODUCT PHOTOS</label><div class="onboard-upload" style="min-height:170px"><div style="font-size:34px">▣</div><strong>Add product photos</strong><span>Up to 8 images · First image is the main photo</span><input id="piFile" type="file" accept="image/*" multiple onchange="prodPhotos(this)">${state.prod.images.length?`<div class="photo-count">${state.prod.images.length} photo${state.prod.images.length>1?'s':''}</div>`:''}</div></div></div><div class="onboard-panel"><div style="font-size:11px;font-weight:950;margin-bottom:10px">CUSTOMER PREVIEW</div>${prodPreview()}</div>`;
    if(s===2)body=`<div class="onboard-panel"><div class="onboard-field"><label class="onboard-label">PRODUCT NAME *</label><input class="onboard-input" id="pn" value="${esc2(state.prod.pn||'')}" placeholder="e.g. Samsung 55-inch Smart TV"></div><div class="onboard-field"><label class="onboard-label">DESCRIPTION</label><textarea class="onboard-textarea" id="px" placeholder="Describe features, model, size and useful details...">${esc2(state.prod.px||'')}</textarea></div><div style="font-size:10px;color:#68736e">Category: <b>${esc2(cat?.name||'')}</b></div></div><div class="onboard-panel">${prodPreview()}</div>`;
    if(s===3)body=`<div class="onboard-panel"><div class="onboard-grid"><div class="onboard-field"><label class="onboard-label">PRICE (₹) *</label><input class="onboard-input" id="pp" type="number" min="0" value="${esc2(state.prod.pp||'')}" placeholder="1200"></div><div class="onboard-field"><label class="onboard-label">SALE PRICE (₹)</label><input class="onboard-input" id="pd" type="number" min="0" value="${esc2(state.prod.pd||'')}" placeholder="Optional"></div></div><div class="onboard-grid"><div class="onboard-field"><label class="onboard-label">STOCK *</label><input class="onboard-input" id="ps" type="number" min="0" value="${esc2(state.prod.ps||'')}" placeholder="25"></div><div class="onboard-field"><label class="onboard-label">UNIT</label><select class="onboard-select" id="pu"><option>piece</option><option>pair</option><option>set</option><option>box</option><option>kg</option><option>gram</option><option>litre</option><option>metre</option></select></div></div></div><div class="onboard-panel">${prodPreview()}</div>`;
    if(s===4)body=`<div class="onboard-panel">${prodPreview()}<div style="margin-top:14px;background:#eafff2;border:1px solid #c7f1d9;border-radius:13px;padding:12px;font-size:10px;color:#08753c">✓ Ready to publish. Customers will see this product in <b>${esc2(cat?.name||'')}</b>.</div></div>`;
    const titles=['Product photos','Product details','Price & stock','Ready to publish'];
    sheet(`<div class="onboard-top"><button class="onboard-back" onclick="${s===1?'closeModal()':'prodPrev()'}">${s===1?'×':'‹'}</button><div class="onboard-steptext">PRODUCT LISTING · ${s} OF 4</div></div><div class="onboard-progress"><i style="width:${s*25}%"></i></div><h2 class="onboard-title">${titles[s-1]}</h2><p class="onboard-sub">${s===1?'Start with clear photos.':s===2?'Add the information customers will search for.':s===3?'Set a price and keep availability accurate.':'Review how your product will appear to customers.'}</p>${body}<div class="onboard-actions">${s>1?'<button class="onboard-secondary" onclick="prodPrev()">Back</button>':''}<button class="onboard-draft" onclick="saveProductDraft()">${s===4?'Save draft':'Save draft'}</button><button class="onboard-primary" onclick="${s<4?'prodNext()':'saveProductV80()'}">${s<4?'Continue':'Publish product'}</button></div>`);
  }
  function captureProd(){['pn','px','pp','pd','ps','pu'].forEach(id=>{const e=document.getElementById(id);if(e)state.prod[id]=e.value;});}
  window.prodNext=function(){
    captureProd();const s=state.prod.step;
    if(s===2&&!state.prod.pn?.trim())return toast('Enter a product name');
    if(s===3&&(!state.prod.pp||Number(state.prod.pp)<0||state.prod.ps===''))return toast('Enter price and stock');
    state.prod.step=Math.min(4,s+1);renderProd();
  };
  window.prodPrev=function(){captureProd();state.prod.step=Math.max(1,state.prod.step-1);renderProd();};
  window.prodPhotos=async function(input){
    try{
      const files=[...(input.files||[])].slice(0,8);const out=[];
      for(const f of files){const fake={files:[f]};out.push(await window.imageFrom(fake));}
      state.prod.images=out;renderProd();
    }catch(e){toast(e.message||'Could not read product photo. Please choose it again.');}
  };
  function prodPreview(){
    const p=state.prod, img=p.images?.[0];
    return `<div class="product-preview"><div class="product-preview-img">${img?`<img src="${esc2(img)}">`:'<div class="noimg">▣</div>'}</div><div class="product-preview-info"><div class="product-preview-name">${esc2(p.pn||'Your product')}</div><div class="product-preview-desc">${esc2(p.px||'Product description will appear here.')}</div><div class="product-preview-price">${p.pd?`₹${Number(p.pd).toLocaleString('en-IN')} <span class="product-preview-old">₹${Number(p.pp||0).toLocaleString('en-IN')}</span>`:p.pp?`₹${Number(p.pp).toLocaleString('en-IN')}`:'₹—'}</div><div class="product-preview-stock">${p.ps!==undefined&&p.ps!==''?'✓ '+esc2(p.ps)+' '+esc2(p.pu||'piece')+' available':'Stock not set'}</div></div></div>`;
  }
  window.saveProductDraft=function(){
    captureProd();state.prod.draft=true;toast('Product saved as draft');
  };
  window.saveProductV80=function(){
    captureProd();
    if(!state.prod.pn?.trim())return toast('Enter a product name');
    if(!state.prod.pp||Number(state.prod.pp)<0)return toast('Enter a valid price');
    if(state.prod.ps==='')return toast('Enter available stock');
    const p={id:uid('prod'),businessId:state.prod.bid,categoryId:db.businesses.find(b=>b.id===state.prod.bid)?.categoryId,name:state.prod.pn.trim(),description:state.prod.px||'',price:Number(state.prod.pp||0),discountPrice:state.prod.pd?Number(state.prod.pd):0,stock:Number(state.prod.ps||0),reserved:0,unit:state.prod.pu||'piece',image:state.prod.images[0]||'',images:state.prod.images.slice(0,8)};
    db.products.push(p);save();closeModal();renderSeller();toast('Product published');
  };
})();



/* ===== legacy script 32 ===== */

(function(){
  function seller(){
    const u=typeof user==='function'?user():null;
    return u&&u.role==='seller'?u:null;
  }
  function owned(){
    const u=seller();
    return u?(db.businesses||[]).filter(b=>b.ownerId===u.id):[];
  }
  function escV(v){return typeof esc==='function'?esc(v):String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
  function syncSelected(id){
    currentBusiness=id||null;
    try{sellerSelectedBusiness=currentBusiness}catch(e){}
  }
  window.selectSellerBusiness=function(id){
    const bs=owned();
    if(!bs.some(b=>b.id===id))return;
    syncSelected(id);
    renderSelectedBusinessScreen();
  };

  window.renderSelectedBusinessScreen=function(){
    const root=document.getElementById('sellerContent');
    if(!root)return;
    const bs=owned();

    if(!bs.length){
      root.innerHTML=`
        <div class="selected-business-wrap">
          <div class="page-head"><div class="page-title">BUSINESSES</div></div>
          <button class="btn primary full selected-add-business" onclick="createBusiness()">+ ADD BUSINESS</button>
          <div class="empty"><strong>No businesses yet</strong><div style="margin-top:7px">Create your first business to start adding products.</div></div>
        </div>`;
      return;
    }

    if(!currentBusiness || !bs.some(b=>b.id===currentBusiness)) syncSelected(bs[0].id);
    const b=bs.find(x=>x.id===currentBusiness);
    if(!b){syncSelected(bs[0].id);return renderSelectedBusinessScreen();}

    const products=(db.products||[]).filter(p=>p.businessId===b.id);
    const cat=(db.categories||[]).find(c=>c.id===b.categoryId)?.name||b.category||'Local Business';

    root.innerHTML=`
      <div class="selected-business-wrap">
        <div class="page-head"><div class="page-title">BUSINESSES</div></div>

        <button class="btn primary full selected-add-business" onclick="createBusiness()">+ ADD NEW BUSINESS</button>

        <div class="selected-business-picker">
          <label>SELECT BUSINESS TO MANAGE</label>
          <select onchange="selectSellerBusiness(this.value)">
            ${bs.map(x=>`<option value="${escV(x.id)}" ${x.id===b.id?'selected':''}>${escV(x.name)}</option>`).join('')}
          </select>
          <div style="font-size:10px;color:#78847f;margin-top:7px">Only the selected business is shown below for editing, products and deletion.</div>
        </div>

        <div class="selected-business-card">
          <div class="selected-business-cover">
            ${b.cover?`<img src="${escV(b.cover)}" alt="">`:'<div style="height:100%;display:grid;place-items:center;color:#8a958f;font-size:11px">NO COVER IMAGE</div>'}
          </div>
          <div class="selected-business-main">
            <div class="selected-business-head">
              ${b.logo?`<img class="selected-business-logo" src="${escV(b.logo)}" alt="">`:'<div class="selected-business-logo" style="display:grid;place-items:center;font-size:24px">◎</div>'}
              <div>
                <div class="selected-business-name">${escV(b.name)}</div>
                <div class="selected-business-meta">${escV(cat)} · 📍 ${escV(b.locality||b.address||'Local business')}</div>
                <div class="selected-business-meta">${products.length} product${products.length===1?'':'s'} · ${b.delivery?'Delivery available':'Pickup only'}</div>
              </div>
            </div>

            <div class="selected-business-actions">
              <button class="btn primary" onclick="editBusinessProfile('${escV(b.id)}')">EDIT BUSINESS</button>
              <button class="btn danger" onclick="deleteSelectedBusinessV81()">DELETE BUSINESS</button>
            </div>
          </div>
        </div>

        <div class="selected-products-head">
          <div>
            <h3>PRODUCTS</h3>
            <div class="selected-products-count">Products belonging only to ${escV(b.name)}</div>
          </div>
          <button class="btn primary" onclick="addProduct('${escV(b.id)}')">+ ADD PRODUCT</button>
        </div>

        <div>
          ${products.length?products.map(p=>`
            <div class="selected-product">
              ${p.image?`<img class="selected-product-img" src="${escV(p.image)}" alt="">`:'<div class="selected-product-img" style="display:grid;place-items:center;font-size:22px">▣</div>'}
              <div class="selected-product-info">
                <b>${escV(p.name)}</b>
                <span>₹${Number(p.discountPrice||p.price||0).toLocaleString('en-IN')} · ${Number(p.stock||0)} ${escV(p.unit||'piece')} in stock</span>
              </div>
              <div class="selected-product-actions">
                <button class="btn secondary" onclick="editProduct('${escV(p.id)}')">EDIT</button>
                <button class="btn secondary" onclick="changeProductImage('${escV(p.id)}')">PHOTOS</button>
                <button class="btn danger" onclick="deleteSelectedProductV81('${escV(p.id)}')">DELETE</button>
              </div>
            </div>`).join(''):`<div class="selected-empty">No products in <b>${escV(b.name)}</b> yet.<br><button class="btn primary" style="margin-top:10px" onclick="addProduct('${escV(b.id)}')">+ ADD FIRST PRODUCT</button></div>`}
        </div>
      </div>`;
  };

  window.deleteSelectedProductV81=function(id){
    const p=(db.products||[]).find(x=>x.id===id);
    const b=p&&(db.businesses||[]).find(x=>x.id===p.businessId);
    const u=seller();
    if(!u||!p||!b||b.ownerId!==u.id)return toast('You can only delete your own products');
    if(b.id!==currentBusiness)return toast('Select this business first');
    if(!confirm(`Delete "${p.name}"? This cannot be undone.`))return;
    db.products=db.products.filter(x=>x.id!==id);
    db.cart=(db.cart||[]).filter(x=>x.productId!==id);
    save();
    renderSelectedBusinessScreen();
    toast('Product deleted');
  };

  window.deleteSelectedBusinessV81=function(){
    const u=seller(),bs=owned(),b=bs.find(x=>x.id===currentBusiness);
    if(!u||!b)return toast('Select a business first');
    if(!confirm(`Delete "${b.name}" and all its products, services and reservations? This cannot be undone.`))return;
    const pids=new Set((db.products||[]).filter(p=>p.businessId===b.id).map(p=>p.id));
    db.products=(db.products||[]).filter(p=>p.businessId!==b.id);
    db.services=(db.services||[]).filter(s=>s.businessId!==b.id);
    db.reservations=(db.reservations||[]).filter(r=>r.businessId!==b.id);
    db.cart=(db.cart||[]).filter(i=>!pids.has(i.productId));
    db.businesses=(db.businesses||[]).filter(x=>x.id!==b.id);
    const next=owned()[0]?.id||null;
    syncSelected(next);
    save();
    renderSelectedBusinessScreen();
    toast('Business deleted');
  };

  // Make the Businesses tab authoritative: it no longer renders every owned
  // business as cards. It renders one selected business from the dropdown.
  window.renderSellerBusinesses=function(){renderSelectedBusinessScreen();};

  // Keep dashboard/reservations selector behaviour intact, but sync the same
  // selected business so switching tabs doesn't unexpectedly change it.
  const oldSellerTab=window.sellerTab;
  window.sellerTab=function(tab){
    if(tab==='businesses'){
      const u=seller();
      if(!u){toast('Seller account required');return;}
      const bs=owned();
      if(!currentBusiness||!bs.some(b=>b.id===currentBusiness))syncSelected(bs[0]?.id||null);
      if(typeof oldSellerTab==='function') oldSellerTab.call(this,'businesses');
      setTimeout(renderSelectedBusinessScreen,0);
      return;
    }
    if(typeof oldSellerTab==='function')return oldSellerTab.apply(this,arguments);
  };

  // If any older navigation calls renderSellerTab directly, force the new
  // Businesses renderer when the active seller tab is Businesses.
  const oldRenderSellerTab=window.renderSellerTab;
  window.renderSellerTab=function(){
    const active=document.querySelector('#sellerNav button.active')?.dataset.sellerTab;
    if(active==='businesses')return renderSelectedBusinessScreen();
    if(typeof oldRenderSellerTab==='function')return oldRenderSellerTab.apply(this,arguments);
  };
})();



/* ===== legacy script 33 ===== */

/* SORTED v89: Android-safe image reader. Never uses fetch(blob:) for uploads.
   Some Android content providers expose a File that previews correctly but
   reject fetch() on its temporary object URL. Business/logo/cover uploads use
   the File bytes directly instead. */
(function(){
  function validImage(file){
    if(!file) throw new Error('Please select an image file');
    const name=String(file.name||'').toLowerCase();
    const type=String(file.type||'').toLowerCase();
    const ok=type.startsWith('image/') || /\.(jpg|jpeg|png|webp|gif|bmp|heic|heif|avif)$/i.test(name);
    if(!ok) throw new Error('Please select an image file');
    if(Number(file.size||0)>20*1024*1024) throw new Error('Image must be under 20 MB');
  }

  function bytesToDataURL(buf,type){
    const bytes=new Uint8Array(buf);
    let binary='';
    const chunk=0x8000;
    for(let i=0;i<bytes.length;i+=chunk){
      binary+=String.fromCharCode.apply(null,bytes.subarray(i,Math.min(i+chunk,bytes.length)));
    }
    return 'data:'+(type||'application/octet-stream')+';base64,'+btoa(binary);
  }

  function readerDataURL(file){
    return new Promise((resolve,reject)=>{
      try{
        const r=new FileReader();
        r.onload=()=>{const v=String(r.result||'');v?resolve(v):reject(new Error('Empty image data'));};
        r.onerror=()=>reject(new Error('Could not read image. Please choose the photo again.'));
        r.readAsDataURL(file);
      }catch(e){reject(new Error('Could not read image. Please choose the photo again.'));}
    });
  }

  async function directDataURL(file){
    validImage(file);
    // Preferred Android path: consume the File as bytes. This avoids the
    // content:// -> blob URL -> fetch chain that was failing on this device.
    try{
      if(typeof file.arrayBuffer==='function'){
        const buf=await file.arrayBuffer();
        if(buf && buf.byteLength) return bytesToDataURL(buf,file.type||'image/jpeg');
      }
    }catch(e){}
    // Fallback for browsers where File.arrayBuffer() is unavailable.
    return await readerDataURL(file);
  }

  async function uploadDataURL(file){
    const raw=await directDataURL(file);
    // For common browser-supported images, raw bytes are already ideal and
    // avoid any second decode. Keep PNG/JPEG/WebP/etc. exactly as selected.
    return raw;
  }

  window.imageFrom=async function(id){
    const el=document.getElementById(id), file=el?.files?.[0];
    if(!file)return '';
    return await uploadDataURL(file);
  };

  window.imageFromMany=async function(id){
    const el=document.getElementById(id);
    const files=Array.from(el?.files||[]).slice(0,8);
    if(!files.length)return [];
    const out=[];
    for(let i=0;i<files.length;i++){
      try{
        const data=await uploadDataURL(files[i]);
        if(data)out.push(data);
      }catch(e){
        throw new Error('Photo '+(i+1)+': '+(e.message||'Could not read image. Please choose it again.'));
      }
    }
    return out;
  };
})();



/* ===== legacy script 34 ===== */

(function(){
  function handleProductQtyButton(e){
    const btn=e.target.closest && e.target.closest('.product-qty button');
    if(!btn) return;
    const wrap=btn.closest('.product-qty');
    const card=btn.closest('.product-card');
    if(!wrap || !card) return;
    const id=card.getAttribute('data-product-id');
    if(!id) return;
    const delta=(btn.textContent||'').trim()==='+' ? 1 : -1;
    e.preventDefault();
    e.stopImmediatePropagation();
    if(typeof window.changeProductQty==='function'){
      window.changeProductQty(String(id),delta);
    }
  }
  document.addEventListener('click',handleProductQtyButton,true);
  document.addEventListener('touchend',function(e){
    const btn=e.target.closest && e.target.closest('.product-qty button');
    if(btn){
      e.preventDefault();
      handleProductQtyButton(e);
    }
  },{capture:true,passive:false});
})();



/* ===== legacy script 35 ===== */

document.addEventListener('click', function(e){
  var btn = e.target.closest && e.target.closest('.product-qty-control button');
  if(!btn) return;
  var control = btn.closest('.product-qty-control');
  var id = control && control.dataset.productId;
  if(!id) return;
  e.preventDefault();
  e.stopPropagation();
  if(e.stopImmediatePropagation) e.stopImmediatePropagation();

  if(btn.classList.contains('qty-plus')) window.sortedInlineQuantityChange(id, 1, e);
  else if(btn.classList.contains('qty-minus')) window.sortedInlineQuantityChange(id, -1, e);
}, true);



/* ===== legacy script 36 ===== */

(function(){
  window.syncBusinessCartBadges=function(){
    const total=(db.cart||[]).reduce((n,item)=>n+Math.max(0,Number(item?.qty||0)),0);
    document.querySelectorAll('.buyer-business-cart-count').forEach(el=>{
      el.textContent=String(total);
      el.style.display=total>0?'':'none';
    });
  };
})();



/* ===== legacy script 37 ===== */

(function(){
  function nearbyBusiness(b){
    try { return typeof locationMatchesBusiness === 'function' ? locationMatchesBusiness(b) : true; }
    catch(e){ return true; }
  }

  window.renderExcitingOffers = function(){
    const root=document.getElementById('excitingOffers');
    if(!root || !window.db) return;

    const offers=(db.products||[])
      .filter(p=>{
        const b=(db.businesses||[]).find(x=>x.id===p.businessId);
        return b && nearbyBusiness(b) &&
          Number(p.price||0)>0 &&
          p.discountPrice!=null &&
          Number(p.discountPrice)<Number(p.price) &&
          availableStock(p)>0;
      })
      .map(p=>{
        const b=(db.businesses||[]).find(x=>x.id===p.businessId);
        const discount=Math.round((1-(Number(p.discountPrice)/Number(p.price)))*100);
        return {p,b,discount};
      })
      .sort((a,b)=>b.discount-a.discount)
      .slice(0,10);

    root.innerHTML=`
      <div class="offers-head">
        <div>
          <div class="offers-title">🔥 Exciting Offers</div>
          <div class="offers-subtitle">Best deals from businesses near you</div>
        </div>
        <span class="offers-badge">NEARBY DEALS</span>
      </div>
      ${offers.length ? `<div class="offers-scroller">${offers.map(({p,b,discount})=>`
        <article class="offer-card" onclick="showProductDetail('${esc(p.id)}')">
          <div class="offer-image">
            ${p.image?`<img src="${esc(p.image)}" alt="${esc(p.name)}" onerror="this.style.display='none'">`:'<span style="display:flex;height:100%;align-items:center;justify-content:center;font-size:36px">🏷️</span>'}
            <span class="offer-discount">${discount}% OFF</span>
          </div>
          <div class="offer-body">
            <div class="offer-product">${esc(p.name)}</div>
            <div class="offer-business">${esc(b.name||'Nearby business')}</div>
            <div class="offer-price"><s>₹${Number(p.price).toLocaleString('en-IN')}</s> ₹${Number(p.discountPrice).toLocaleString('en-IN')}</div>
            <div class="offer-location">📍 ${esc(b.locality||'Nearby')}</div>
            <button class="offer-add" onclick="event.stopPropagation();changeProductQty('${esc(p.id)}',1)">+ ADD</button>
          </div>
        </article>
      `).join('')}</div>` : `<div class="offer-empty"><strong>No special offers nearby yet.</strong><br>Discounted products from nearby businesses will appear here.</div>`}
    `;
  };

  window.renderSearchProductPage = function(q){
    const root=document.getElementById('searchProductResults');
    if(!root || !window.db) return;
    q=String(q||'').trim().toLowerCase();

    if(!q){
      root.innerHTML=`<div class="search-empty"><strong>What are you looking for?</strong>Search for products from businesses near you.</div>`;
      return;
    }

    const products=(db.products||[]).filter(p=>{
      const b=(db.businesses||[]).find(x=>x.id===p.businessId);
      if(!b || !nearbyBusiness(b)) return false;
      const c=(db.categories||[]).find(x=>x.id===p.categoryId);
      return [p.name,p.description,p.sku,b.name,b.category,b.locality,c&&c.name]
        .some(v=>String(v||'').toLowerCase().includes(q));
    }).filter(p=>availableStock(p)>0);

    root.innerHTML=products.length
      ? `<div class="search-result-heading">${products.length} PRODUCT${products.length===1?'':'S'} FOUND NEAR YOU</div>
         <div class="product-list search-results-list">${products.map(p=>{
           const b=(db.businesses||[]).find(x=>x.id===p.businessId);
           const c=(db.categories||[]).find(x=>x.id===p.categoryId);
           return `<article class="product-card search-result-card" data-product-id="${esc(p.id)}" onclick="showProductDetail('${esc(p.id)}')">
             <div class="product-image">${p.image?`<img src="${esc(p.image)}" alt="${esc(p.name)}" onerror="this.style.display='none'">`:'📷'}</div>
             <div class="product-info">
               <div class="product-name">${esc(p.name)}</div>
               <div class="product-shop">${esc(b?.name||'Business')} · ${esc(c?.name||'')}</div>
               <div class="product-price">${p.discountPrice?`<s style="color:#777">₹${Number(p.price).toLocaleString('en-IN')}</s> `:''}₹${Number(p.discountPrice||p.price||0).toLocaleString('en-IN')}</div>
               <div class="product-meta"><span class="available">✓ ${availableStock(p)} Available</span><span>📍 ${esc(b?.locality||'Nearby')}</span>${b?.delivery?'<span>Delivery</span>':'<span>Pickup only</span>'}</div>
               <div class="product-qty-wrap" onclick="event.stopPropagation()">
                 <div class="product-qty">
                   <button type="button" aria-label="Decrease quantity" onclick="changeProductQty('${esc(p.id)}',-1)">−</button>
                   <b>${cartQty(p.id)}</b>
                   <button type="button" aria-label="Increase quantity" onclick="changeProductQty('${esc(p.id)}',1)">+</button>
                 </div>
               </div>
             </div>
           </article>`;
         }).join('')}</div>`
      : `<div class="search-empty"><strong>No products found</strong>Try a different product name.</div>`;
  };

  window.openSearchPage = function(query){
    go('search');
    const input=document.getElementById('globalProductSearch');
    if(input){
      input.value=query||'';
      setTimeout(()=>{ input.focus(); renderSearchProductPage(query||''); },20);
    }
  };

  // Make the bottom Search tab open a real dedicated page.
  document.addEventListener('DOMContentLoaded', function(){
    const btn=document.querySelector('.buyer-nav button[data-screen="search"]');
    if(btn) btn.onclick=function(){ openSearchPage(''); };
    setTimeout(renderExcitingOffers,60);
  });

  // Re-render offers whenever returning to Home, without touching the current screen.
  const oldGo=window.go;
  if(typeof oldGo==='function'){
    window.go=function(screen){
      const result=oldGo.apply(this,arguments);
      if(screen==='home') setTimeout(renderExcitingOffers,40);
      if(screen==='search') setTimeout(()=>renderSearchProductPage(document.getElementById('globalProductSearch')?.value||''),40);
      return result;
    };
  }

  // Replace the old global search behavior so any existing search call opens the new page.
  window.globalSearch=function(q){ openSearchPage(String(q||'')); };
})();



/* ===== legacy script 38 ===== */

(function(){
  function syncSellerTheme(){
    if(!document.body) return;
    if(document.body.classList.contains('seller-mode')){
      document.documentElement.setAttribute('data-theme','light');
    }
  }
  document.addEventListener('DOMContentLoaded', syncSellerTheme);
  setTimeout(syncSellerTheme, 80);
  setTimeout(syncSellerTheme, 250);
})();



/* ===== legacy script 39 ===== */

(function(){
  function syncCartBadges(){
    try{
      const total=(db.cart||[]).reduce((n,item)=>n+Math.max(0,Number(item?.qty||0)),0);
      document.querySelectorAll('[data-cart-count],#cartCount,.cart-count,.cart-badge,.sorted-cart-badge,.buyer-business-cart-count').forEach(el=>{
        el.textContent=String(total);
        el.style.display=total>0?'':'none';
      });
      if(typeof window.updateSortedCartBadge==='function') window.updateSortedCartBadge();
    }catch(e){}
  }
  window.addEventListener('load',syncCartBadges);
  document.addEventListener('click',function(e){
    const cartBtn=e.target.closest && e.target.closest('[data-screen="cart"]');
    if(cartBtn) setTimeout(syncCartBadges,30);
  },true);
  setInterval(syncCartBadges,500);
})();



/* ===== legacy script 40 ===== */

(function(){
  function favList(){
    if(!Array.isArray(db.favorites)) db.favorites=[];
    return db.favorites;
  }
  function current(){
    return typeof user==='function' ? user() : null;
  }
  function fav(id){
    const u=current();
    return !!(u && favList().some(x=>String(x.userId)===String(u.id) && String(x.productId)===String(id)));
  }
  function sync(id){
    const on=fav(id);
    document.querySelectorAll('[data-favorite-product-id="'+CSS.escape(String(id))+'"], .favorite-heart[data-product-id="'+CSS.escape(String(id))+'"]').forEach(btn=>{
      btn.classList.toggle('active',on);
      btn.textContent=on?'♥':'♡';
      btn.setAttribute('aria-label',on?'Remove from favorites':'Add to favorites');
      btn.title=on?'Remove from favorites':'Add to favorites';
    });
  }

  // Override with one handler that updates every visible heart immediately.
  window.toggleFavorite=function(id,ev){
    if(ev){
      ev.preventDefault();
      ev.stopPropagation();
      if(ev.stopImmediatePropagation) ev.stopImmediatePropagation();
    }
    const u=current();
    if(!u){
      if(typeof toast==='function') toast('Log in to add favorites');
      if(typeof setAuthMode==='function') setAuthMode('login');
      if(typeof go==='function') go('auth');
      return;
    }
    const list=favList();
    const idx=list.findIndex(x=>String(x.userId)===String(u.id) && String(x.productId)===String(id));
    if(idx>=0){
      list.splice(idx,1);
      if(typeof toast==='function') toast('Removed from favorites');
    }else{
      list.push({id:typeof uid==='function'?uid('fav'):('fav_'+Date.now()),userId:u.id,productId:id,createdAt:Date.now()});
      if(typeof toast==='function') toast('Added to favorites');
    }
    if(typeof save==='function') save();

    // Update the heart that was tapped and any duplicate card/detail hearts.
    sync(id);

    // Keep the Profile > Favorites count current if Profile is visible.
    if(document.getElementById('profile')?.classList.contains('active') && typeof renderProfile==='function'){
      renderProfile();
    }
  };

  // Make sure all multi-product hearts reflect persisted state after any render.
  function syncAll(){
    document.querySelectorAll('[data-favorite-product-id]').forEach(btn=>{
      const id=btn.dataset.favoriteProductId;
      sync(id);
    });
  }

  document.addEventListener('DOMContentLoaded',()=>setTimeout(syncAll,100));
  window.addEventListener('load',()=>setTimeout(syncAll,100));
  setInterval(syncAll,700);
})();



/* ===== legacy script 41 ===== */

(function(){
  function sync(){
    try{
      const isSeller=!!(typeof sellerUser==='function' && sellerUser());
      const sellerScreen=document.getElementById('seller');
      const sellerNav=document.querySelector('.seller-nav');
      const visibleSeller=!!(sellerScreen && sellerScreen.classList.contains('active'));
      const seller=isSeller || visibleSeller || (sellerNav && getComputedStyle(sellerNav).display!=='none');
      document.body.classList.toggle('seller-mode',!!seller);
      if(seller){
        document.documentElement.style.setProperty('--bg','#f7f8f8');
        document.documentElement.style.setProperty('--panel','#ffffff');
        document.documentElement.style.setProperty('--panel2','#ffffff');
        document.documentElement.style.setProperty('--text','#111315');
        document.documentElement.style.setProperty('--muted','#66706b');
        document.documentElement.style.setProperty('--line','#e2e7e4');
      }
    }catch(e){}
  }
  document.addEventListener('DOMContentLoaded',sync);
  window.addEventListener('load',sync);
  setInterval(sync,300);
})();



/* ===== legacy script 42 ===== */

(function(){
  function isSeller(){
    try{
      const u=typeof user==='function'?user():null;
      return !!(u && u.role==='seller');
    }catch(e){ return false; }
  }

  function sellerDashboard(){
    if(!isSeller()) return false;
    try{
      document.body.classList.add('seller-mode');
      if(typeof sellerTab==='function'){
        sellerTab('dashboard');
      }else if(typeof sellerGo==='function'){
        sellerGo('dashboard');
      }else{
        const seller=document.getElementById('seller');
        document.querySelectorAll('.screen').forEach(x=>x.classList.remove('active'));
        if(seller) seller.classList.add('active');
      }
      if(typeof setSellerNav==='function') setSellerNav();
      if(typeof updateSellerNav==='function') updateSellerNav();
      return true;
    }catch(e){ return false; }
  }

  // Sellers must never land on the buyer Home screen.
  const originalGo=window.go;
  window.go=function(id,push){
    if(isSeller() && ['home','search','products','services','categories','cart','orders','profile','favorites'].includes(id)){
      return sellerDashboard();
    }
    return originalGo ? originalGo(id,push) : undefined;
  };

  // If a seller refreshes the file while Home was the active screen,
  // immediately replace it with the seller dashboard.
  function enforce(){
    if(!isSeller()) return;
    const sellerScreen=document.getElementById('seller');
    const homeScreen=document.getElementById('home');
    if(!sellerScreen) return;

    const buyerHomeVisible=!!(homeScreen && homeScreen.classList.contains('active'));
    const sellerVisible=sellerScreen.classList.contains('active');

    if(!sellerVisible || buyerHomeVisible){
      sellerDashboard();
    }else{
      document.body.classList.add('seller-mode');
      if(typeof setSellerNav==='function') setSellerNav();
      if(typeof updateSellerNav==='function') updateSellerNav();
    }
  }

  window.addEventListener('load',function(){
    setTimeout(enforce,50);
    setTimeout(enforce,250);
    setTimeout(enforce,700);
  });

  document.addEventListener('visibilitychange',function(){
    if(!document.hidden) setTimeout(enforce,20);
  });

  // Protect the logo/home route as well.
  document.addEventListener('click',function(e){
    if(!isSeller()) return;
    const logo=e.target.closest && e.target.closest('.logo');
    if(logo){
      e.preventDefault();
      e.stopPropagation();
      if(e.stopImmediatePropagation) e.stopImmediatePropagation();
      sellerDashboard();
    }
  },true);
})();



/* ===== legacy script 43 ===== */

(function(){
  'use strict';
  const previousStatus=window.sellerStatus;
  window.sellerStatus=function(id,status){
    const before=(db.reservations||[]).find(x=>String(x.id)===String(id));
    const businessId=before?.businessId || currentBusiness;
    window.__ordersBusinessSelected=true;
    if(businessId) currentBusiness=businessId;
    if(typeof previousStatus==='function') previousStatus.call(this,id,status);
    window.__ordersBusinessSelected=true;
    if(businessId) currentBusiness=businessId;
    setTimeout(function(){
      window.__ordersBusinessSelected=true;
      if(businessId) currentBusiness=businessId;
      if(typeof window.renderSellerReservations==='function') window.renderSellerReservations();
    },0);
  };
  window.sellerAcceptFromDetail=function(id){
    const r=(db.reservations||[]).find(x=>String(x.id)===String(id)); if(!r)return;
    window.__ordersBusinessSelected=true; currentBusiness=r.businessId;
    closeModal();
    if(typeof window.sellerStatus==='function') window.sellerStatus(id,'CONFIRMED');
  };
  window.sellerRejectFromDetail=function(id){
    const r=(db.reservations||[]).find(x=>String(x.id)===String(id)); if(!r)return;
    window.__ordersBusinessSelected=true; currentBusiness=r.businessId;
    closeModal();
    if(typeof window.sellerStatus==='function') window.sellerStatus(id,'REJECTED');
  };
})();



/* ===== legacy script 44 ===== */

(function(){
  function addBusinessButton(){
    try{
      var root=document.getElementById('sellerContent');
      if(!root || !document.body.classList.contains('seller-mode')) return;
      var heads=root.querySelectorAll('.page-head');
      for(var i=0;i<heads.length;i++){
        var h=heads[i];
        if((h.textContent||'').toUpperCase().indexOf('BUSINESSES')===-1) continue;
        if(h.querySelector('.seller-businesses-inline-add')) return;
        var b=document.createElement('button');
        b.type='button'; b.className='btn primary seller-businesses-inline-add';
        b.textContent='+ ADD BUSINESS';
        b.onclick=function(){ if(typeof window.createBusiness==='function') window.createBusiness(); };
        h.appendChild(b);
        return;
      }
      if((root.textContent||'').toUpperCase().indexOf('BUSINESSES')!==-1 && !root.querySelector('.seller-businesses-add')){
        var b2=document.createElement('button');
        b2.type='button'; b2.className='btn primary seller-businesses-add';
        b2.textContent='+ ADD BUSINESS';
        b2.onclick=function(){ if(typeof window.createBusiness==='function') window.createBusiness(); };
        root.insertBefore(b2,root.firstChild);
      }
    }catch(e){}
  }
  var old=window.renderSellerShell;
  if(typeof old==='function'){
    window.renderSellerShell=function(){ var r=old.apply(this,arguments); setTimeout(addBusinessButton,0); return r; };
  }
  document.addEventListener('click',function(e){
    var n=e.target.closest && e.target.closest('[data-seller-tab="businesses"]');
    if(n) setTimeout(addBusinessButton,30);
  });
  window.addEventListener('load',function(){setTimeout(addBusinessButton,100);});
})();



/* ===== legacy script 45 ===== */

(function(){
  /*
    Final Android image-upload fix.
    The previous versions relied heavily on FileReader and, in some paths,
    attempted another decode of Android picker files. This version:
      1) copies the selected File bytes directly when possible,
      2) compresses through createImageBitmap when supported,
      3) falls back to the original bytes instead of failing,
      4) is used by both new-business and edit-business logo/cover uploads.
  */

  function fileLooksLikeImage(file){
    if(!file) throw new Error('Please select an image file');
    var name=String(file.name||'').toLowerCase();
    var type=String(file.type||'').toLowerCase();
    var ok=type.indexOf('image/')===0 ||
      /\.(jpg|jpeg|png|webp|gif|bmp|heic|heif|avif)$/i.test(name);
    if(!ok) throw new Error('Please select an image file');
    if(Number(file.size||0)>20*1024*1024)
      throw new Error('Image must be under 20 MB');
    return true;
  }

  function bytesToDataURL(buf,type){
    var bytes=new Uint8Array(buf);
    var binary='';
    var chunk=0x8000;
    for(var i=0;i<bytes.length;i+=chunk){
      binary += String.fromCharCode.apply(
        null, bytes.subarray(i, Math.min(i+chunk, bytes.length))
      );
    }
    return 'data:'+(type||'image/jpeg')+';base64,'+btoa(binary);
  }

  function readWithFileReader(file){
    return new Promise(function(resolve,reject){
      try{
        var r=new FileReader();
        r.onload=function(){
          var v=String(r.result||'');
          if(v) resolve(v);
          else reject(new Error('Empty image data'));
        };
        r.onerror=function(){
          reject(new Error('Could not read image. Please choose the photo again.'));
        };
        r.readAsDataURL(file);
      }catch(e){
        reject(e);
      }
    });
  }

  async function readRawBytes(file){
    var last=null;

    try{
      if(typeof file.arrayBuffer==='function'){
        var buf=await file.arrayBuffer();
        if(buf && buf.byteLength) return bytesToDataURL(buf,file.type||'image/jpeg');
      }
    }catch(e){ last=e; }

    try{
      if(typeof file.stream==='function'){
        var response=new Response(file.stream());
        var buf2=await response.arrayBuffer();
        if(buf2 && buf2.byteLength) return bytesToDataURL(buf2,file.type||'image/jpeg');
      }
    }catch(e){ last=e; }

    try{
      return await readWithFileReader(file);
    }catch(e){ last=e; }

    throw new Error('Could not read image. Please choose the photo again.');
  }

  async function compressedImage(file,maxSize,quality){
    fileLooksLikeImage(file);
    maxSize=maxSize||1200;
    quality=(quality==null ? .78 : quality);

    /* Best path on modern Android Chrome/WebView. */
    try{
      if(typeof createImageBitmap==='function'){
        var bitmap=await createImageBitmap(file);
        var w=bitmap.width||0, h=bitmap.height||0;
        if(w && h){
          var scale=Math.min(1,maxSize/Math.max(w,h));
          var canvas=document.createElement('canvas');
          canvas.width=Math.max(1,Math.round(w*scale));
          canvas.height=Math.max(1,Math.round(h*scale));
          var ctx=canvas.getContext('2d');
          if(ctx){
            ctx.drawImage(bitmap,0,0,canvas.width,canvas.height);
            var result=canvas.toDataURL('image/jpeg',quality);
            if(bitmap.close) bitmap.close();
            if(result && result.length>100) return result;
          }
        }
        if(bitmap.close) bitmap.close();
      }
    }catch(e){}

    /*
      Some Android picker providers don't support createImageBitmap(File).
      Read the bytes directly. This avoids objectURL/fetch and avoids a second
      decode step, which is the path that was failing in the existing file.
    */
    return await readRawBytes(file);
  }

  async function finalImageFrom(id,max,quality){
    var el=document.getElementById(id);
    var file=el && el.files && el.files[0];
    if(!file) return '';
    return await compressedImage(file,max||1200,(quality==null ? .78 : quality));
  }

  async function finalImageFromMany(id){
    var el=document.getElementById(id);
    var files=Array.from(el && el.files || []).slice(0,8);
    var out=[];
    for(var i=0;i<files.length;i++){
      out.push(await compressedImage(files[i],1000,.72));
    }
    return out.filter(Boolean);
  }

  window.imageFrom=finalImageFrom;
  window.imageFromMany=finalImageFromMany;

  window.readBusinessPhoto=async function(input,maxSize,kind){
    var file=input && input.files && input.files[0];
    if(!file) return '';
    /*
      Logo and cover both use the same robust reader now. Logo is not forced
      through FileReader anymore.
    */
    return await compressedImage(file,maxSize || (kind==='logo'?700:1200),.78);
  };

  /*
    Use the same safe reader for the standalone business-photo editor.
  */
  window.setBusinessPhoto=window.setBusinessPhoto || null;

  /*
    Improve previews too: don't revoke the object URL until the image has
    actually loaded, and show a useful message when the browser cannot preview.
  */
  window.previewUpload=function(input,targetId){
    var file=input && input.files && input.files[0];
    var target=document.getElementById(targetId);
    if(!file || !target) return;

    try{
      fileLooksLikeImage(file);
    }catch(e){
      target.textContent=e.message;
      if(input) input.value='';
      return;
    }

    target.innerHTML='';
    var url=URL.createObjectURL(file);
    var img=document.createElement('img');
    img.alt='Photo preview';
    img.onload=function(){ try{URL.revokeObjectURL(url);}catch(e){} };
    img.onerror=function(){
      try{URL.revokeObjectURL(url);}catch(e){}
      target.textContent='Photo selected. It will be processed when you save.';
    };
    img.src=url;
    target.appendChild(img);
  };
})();



/* ===== legacy script 46 ===== */

(function(){
  function money(n){return '₹'+Number(n||0).toLocaleString('en-IN')}
  function esc2(v){
    return (typeof esc==='function'?esc(String(v==null?'':v)):
      String(v==null?'':v).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])))
  }
  function sellerData(){
    const u=db.users.find(x=>x.id===db.session&&x.role==='seller');
    const bs=(db.businesses||[]).filter(b=>b.ownerId===u?.id);
    const selected=(typeof sellerSelectedBusiness!=='undefined'?sellerSelectedBusiness:null);
    const b=bs.find(x=>String(x.id)===String(selected))||bs[0]||null;
    const orders=(db.reservations||[]).filter(r=>r.businessId===b?.id);
    const products=(db.products||[]).filter(p=>p.businessId===b?.id);
    return {u,bs,b,orders,products};
  }

  function renderOverview(root){
    const d=sellerData();
    if(!d.u)return;
    if(!d.b){
      root.innerHTML=`
        <div class="seller-overview">
          <div class="seller-welcome">
            <h2>Welcome, ${esc2(d.u.name||'Seller')} 👋</h2>
            <p>Your seller dashboard will show your business performance here.</p>
          </div>
          <div class="seller-overview-section">
            <h3>No business yet</h3>
            <div class="seller-section-sub">Create a business from the Businesses tab to start seeing performance data.</div>
          </div>
        </div>`;
      return;
    }

    const now=new Date();
    const startToday=new Date(now); startToday.setHours(0,0,0,0);
    const weekStart=new Date(startToday); weekStart.setDate(weekStart.getDate()-6);
    const completed=d.orders.filter(r=>['COLLECTED','DELIVERED','COMPLETED'].includes(String(r.status||'').toUpperCase()));
    const todayOrders=d.orders.filter(r=>Number(r.createdAt||r.date||0)>=startToday.getTime());
    const weekOrders=d.orders.filter(r=>Number(r.createdAt||r.date||0)>=weekStart.getTime());
    const todayRevenue=todayOrders.reduce((n,r)=>n+Number(r.total||0),0);
    const weekRevenue=weekOrders.reduce((n,r)=>n+Number(r.total||0),0);

    // Last 7 calendar days, view-only.
    const days=[];
    for(let i=6;i>=0;i--){
      const day=new Date(startToday); day.setDate(day.getDate()-i);
      const next=new Date(day); next.setDate(next.getDate()+1);
      const revenue=d.orders.filter(r=>{
        const t=Number(r.createdAt||r.date||0);
        return t>=day.getTime()&&t<next.getTime();
      }).reduce((n,r)=>n+Number(r.total||0),0);
      days.push({day,revenue});
    }
    const max=Math.max(1,...days.map(x=>x.revenue));

    const recent=d.orders.slice().sort((a,b)=>Number(b.createdAt||b.date||0)-Number(a.createdAt||a.date||0)).slice(0,4);
    const health=(d.b.logo?25:0)+(d.b.cover?25:0)+(d.b.address?20:0)+(d.b.hours?15:0)+(d.b.categoryId?15:0);

    root.innerHTML=`
      <div class="seller-overview">
        <div class="seller-welcome">
          <h2>Good ${now.getHours()<12?'morning':now.getHours()<17?'afternoon':'evening'}, ${esc2(d.u.name||'Seller')} 👋</h2>
          <p>${esc2(d.b.name)} · Here's your business performance at a glance.</p>
        </div>

        <div class="seller-overview-grid">
          <div class="seller-stat"><div class="label">TODAY'S REVENUE</div><div class="value">${money(todayRevenue)}</div><div class="sub">From today's orders</div></div>
          <div class="seller-stat"><div class="label">ORDERS TODAY</div><div class="value">${todayOrders.length}</div><div class="sub">${weekOrders.length} in last 7 days</div></div>
          <div class="seller-stat"><div class="label">7-DAY REVENUE</div><div class="value">${money(weekRevenue)}</div><div class="sub">Last 7 days</div></div>
          <div class="seller-stat"><div class="label">PRODUCTS</div><div class="value">${d.products.length}</div><div class="sub">Currently listed</div></div>
        </div>

        <div class="seller-overview-main">
          <div class="seller-overview-section">
            <h3>Sales overview</h3>
            <div class="seller-section-sub">Revenue trend · Last 7 days</div>
            <div class="seller-trend">
              ${days.map(x=>`
                <div class="seller-bar-wrap" title="${money(x.revenue)}">
                  <div class="seller-bar" style="height:${Math.max(5,(x.revenue/max)*78)}px"></div>
                  <div class="seller-bar-label">${x.day.toLocaleDateString('en-IN',{weekday:'short'}).slice(0,3)}</div>
                </div>`).join('')}
            </div>
          </div>

          <div class="seller-overview-section">
            <h3>Business performance</h3>
            <div class="seller-section-sub">View-only snapshot</div>
            <div style="display:grid;gap:13px;margin-top:15px">
              <div class="row"><span class="muted">Completed orders</span><b>${completed.length}</b></div>
              <div class="row"><span class="muted">Average order</span><b>${money(completed.length?completed.reduce((n,r)=>n+Number(r.total||0),0)/completed.length:0)}</b></div>
              <div class="row"><span class="muted">Active products</span><b>${d.products.filter(p=>p.available!==false).length}</b></div>
            </div>
          </div>
        </div>

        <div class="seller-overview-section">
          <h3>Recent activity</h3>
          <div class="seller-section-sub">Latest activity · Management is available in the relevant tab.</div>
          <div class="seller-activity">
            ${recent.length?recent.map(r=>`
              <div class="seller-activity-row">
                <span class="seller-activity-dot"></span>
                <div>
                  <div class="seller-activity-main">Order ${esc2(r.number||r.id||'')} · ${esc2(r.status||'Updated')} · ${money(r.total)}</div>
                  <div class="seller-activity-time">${r.createdAt?new Date(Number(r.createdAt)).toLocaleString('en-IN',{dateStyle:'medium',timeStyle:'short'}):'Recent activity'}</div>
                </div>
              </div>`).join(''):`<div class="empty" style="padding:18px 0">No recent activity yet.</div>`}
          </div>
        </div>

        <div class="seller-overview-section">
          <div class="seller-health">
            <div>
              <h3>Business profile health</h3>
              <div class="seller-health-copy">${health>=90?'Your business profile is looking great.':health>=70?'Most important business details are complete.':'Complete more business details to improve your profile.'}</div>
            </div>
            <div class="seller-health-score">${health}%</div>
          </div>
          <div class="seller-progress"><i style="width:${health}%"></i></div>
        </div>
      </div>`;
  }

  // Preserve the existing Orders and Businesses tabs. Only replace Dashboard rendering.
  const original=window.renderSellerShell;
  if(typeof original==='function'){
    window.renderSellerShell=function(){
      const root=document.getElementById('sellerContent');
      if(typeof sellerSection!=='undefined' && sellerSection==='dashboard'){
        renderOverview(root);
        return;
      }
      return original.apply(this,arguments);
    };
  }

  // Re-render immediately if the seller dashboard is already open.
  window.addEventListener('load',function(){
    setTimeout(function(){
      try{
        if(typeof sellerSection!=='undefined' && sellerSection==='dashboard' &&
           typeof sellerUser==='function' && sellerUser()) renderOverview(document.getElementById('sellerContent'));
      }catch(e){}
    },80);
  });
})();



/* ===== legacy script 47 ===== */

(function(){
  'use strict';

  /* ---------- LIGHT MODE ONLY ---------- */
  function forceLight(){
    try{localStorage.setItem('sorted_theme','light');}catch(e){}
    document.documentElement.setAttribute('data-theme','light');
    var m=document.querySelector('meta[name="theme-color"]');
    if(m)m.content='#ffffff';
  }
  forceLight();
  window.toggleDarkMode=function(){
    forceLight();
    if(typeof renderThemeSettings==='function')renderThemeSettings();
    if(typeof toast==='function')toast('SORTED uses Light Mode only');
  };
  window.renderThemeSettings=function(){
    var el=document.getElementById('themeSettingsContent');
    if(el)el.innerHTML='<div class="card"><b>Light Mode</b><div class="muted" style="margin-top:6px">SORTED uses the white theme.</div></div>';
  };
  window.openThemeSettings=function(){ forceLight(); if(typeof go==='function')go('profile'); };
  document.addEventListener('DOMContentLoaded',function(){
    forceLight();
    var card=document.getElementById('profileSettingsCard');
    if(card)card.style.display='none';
  });
  setInterval(forceLight,2000);

  /* ---------- SERVICE DETAILS ---------- */
  function escX(v){
    return String(v??'').replace(/[&<>"']/g,function(c){
      return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]);
    });
  }
  function getService(id){
    return (typeof db!=='undefined' ? (db.services||[]) : []).find(function(s){return String(s.id)===String(id);});
  }
  function getBusiness(id){
    return (typeof db!=='undefined' ? (db.businesses||[]) : []).find(function(b){return String(b.id)===String(id);});
  }
  window.showServiceDetail=function(id){
    var s=getService(id), b=s&&getBusiness(s.businessId);
    if(!s||!b){if(typeof toast==='function')toast('Service not found');return;}
    var imgs=Array.isArray(s.images)&&s.images.length?s.images:(s.image?[s.image]:[]);
    var price=s.price!=null&&s.price!==''?'From ₹'+Number(s.price).toLocaleString('en-IN'):
      (s.startingPrice?'From ₹'+Number(s.startingPrice).toLocaleString('en-IN'):'Price on request');
    var gallery=imgs.length
      ? '<div class="service-detail-gallery">'+imgs.map(function(x){return '<img src="'+escX(x)+'" alt="'+escX(s.name)+'" loading="lazy">';}).join('')+'</div>'
      : '<div class="service-detail-hero" style="display:grid;place-items:center;font-size:56px">🛠️</div>';
    var desc=s.description?'<p style="line-height:1.55">'+escX(s.description)+'</p>':'<p class="muted">No description provided.</p>';
    openModal(
      '<button class="close" onclick="closeModal()">×</button>'+
      '<h2>'+escX(s.name||'Service')+'</h2>'+
      '<div class="muted">'+escX(b.name||'Provider')+'</div>'+
      gallery+
      '<div class="row" style="margin-top:10px;gap:8px;flex-wrap:wrap">'+
      '<span class="status">'+escX(s.category||'Services')+'</span>'+
      '<span class="status">'+escX(s.serviceType||'Service')+'</span>'+
      '<span class="status">'+escX(price)+'</span>'+
      (s.duration?'<span class="status">'+escX(s.duration)+'</span>':'')+
      '</div>'+
      desc+
      (s.serviceArea?'<div class="muted" style="margin-top:8px">📍 '+escX(s.serviceArea)+'</div>':'')+
      '<button class="btn primary full" style="margin-top:16px" onclick="closeModal();bookService(\''+escX(s.id)+'\')">BOOK NOW</button>'
    );
  };

  /* ---------- SERVICE BOOKINGS: buyer can see status; seller already has
     ACCEPT/REJECT controls, and this adds a dedicated service-request card. ---------- */
  function sellerForCurrent(){
    try{return typeof user==='function'?user():null}catch(e){return null}
  }
  window.openServiceBookingDetails=function(id){
    var r=(db.reservations||[]).find(function(x){return String(x.id)===String(id);});
    if(!r)return;
    var s=getService(r.serviceId), b=getBusiness(r.businessId);
    var seller=sellerForCurrent();
    var isSeller=!!(seller&&b&&b.ownerId===seller.id);
    var status=String(r.status||'PENDING');
    var actions='';
    if(isSeller && ['PENDING','RESERVED','RESERVED — WAITING FOR SELLER CONFIRMATION'].includes(status)){
      actions='<div style="display:flex;gap:8px;margin-top:14px"><button class="btn primary" onclick="sellerStatus(\''+escX(r.id)+'\',\'CONFIRMED\');closeModal()">ACCEPT</button><button class="btn danger" onclick="sellerStatus(\''+escX(r.id)+'\',\'REJECTED\');closeModal()">REJECT</button></div>';
    }
    openModal(
      '<button class="close" onclick="closeModal()">×</button>'+
      '<h2>'+escX(r.serviceName||s?.name||'Service booking')+'</h2>'+
      '<div class="service-booking-status">'+escX(status)+'</div>'+
      '<div class="card" style="margin-top:12px">'+
      '<b>'+escX(b?.name||'Provider')+'</b>'+
      '<div class="muted" style="margin-top:6px">Customer: '+escX(r.customerName||'Customer')+'</div>'+
      '<div class="muted">Date: '+escX(r.date||r.booking_date||'')+' · Time: '+escX(r.time||r.booking_time||'')+'</div>'+
      (r.studentName?'<div class="muted">Student: '+escX(r.studentName)+'</div>':'')+
      (r.classGrade?'<div class="muted">Class: '+escX(r.classGrade)+'</div>':'')+
      (r.learningMode?'<div class="muted">Mode: '+escX(r.learningMode)+'</div>':'')+
      (r.vehicleType?'<div class="muted">Vehicle: '+escX(r.vehicleType)+' '+escX(r.vehicleNumber||'')+'</div>':'')+
      (r.serviceAddress?'<div class="muted">Address: '+escX(r.serviceAddress)+'</div>':'')+
      (r.notes?'<div style="margin-top:8px">Notes: '+escX(r.notes)+'</div>':'')+
      '</div>'+actions
    );
  }

  /* Make every service reservation card clickable while preserving buttons. */
  document.addEventListener('click',function(e){
    var card=e.target.closest&&e.target.closest('.seller-order-card');
    if(card && !e.target.closest('button')){
      var btn=card.querySelector('button[onclick*="openSellerOrderDetails"]');
      if(btn){
        var m=(btn.getAttribute('onclick')||'').match(/openSellerOrderDetails\('([^']+)'/);
        if(m)window.openServiceBookingDetails(m[1]);
      }
    }
  });

  /* ---------- FORGOT PASSWORD ---------- */
  window.sortedForgotPassword=async function(){
    var input=document.getElementById('loginContact');
    var email=String(input?.value||'').trim();
    if(!email || !email.includes('@')){
      if(typeof toast==='function')toast('Enter your email address first');
      input?.focus();
      return;
    }
    if(!window.sortedSupabase){if(typeof toast==='function')toast('Supabase is not available');return;}
    try{
      var redirect='https://sortedadmin.github.io/SortedGPT/';
      var res=await window.sortedSupabase.auth.resetPasswordForEmail(email,{redirectTo:redirect});
      if(res.error)throw res.error;
      if(typeof toast==='function')toast('Password reset email sent. Check your inbox.');
    }catch(e){
      if(typeof toast==='function')toast(e.message||'Could not send password reset email');
    }
  };
  document.addEventListener('DOMContentLoaded',function(){
    var form=document.getElementById('loginForm');
    if(form && !document.getElementById('forgotPasswordBtn')){
      var btn=document.createElement('button');
      btn.id='forgotPasswordBtn';
      btn.type='button';
      btn.className='text-btn full';
      btn.style.marginTop='4px';
      btn.textContent='Forgot password?';
      btn.onclick=window.sortedForgotPassword;
      var loginBtn=form.querySelector('button[onclick="loginAccount()"]');
      if(loginBtn)loginBtn.insertAdjacentElement('afterend',btn);
    }
  });

  /* Recovery link -> let the user choose a new password. */
  if(window.sortedSupabase){
    window.sortedSupabase.auth.onAuthStateChange(async function(event,session){
      if(event!=='PASSWORD_RECOVERY'||!session)return;
      var next=prompt('Enter your new SORTED password (minimum 6 characters):');
      if(next===null)return;
      if(String(next).length<6){toast('Password must be at least 6 characters');return;}
      var confirmPw=prompt('Confirm your new password:');
      if(next!==confirmPw){toast('Passwords do not match');return;}
      var res=await window.sortedSupabase.auth.updateUser({password:String(next)});
      if(res.error){toast(res.error.message||'Could not update password');return;}
      toast('Password updated successfully. You can now log in.');
      try{await window.sortedSupabase.auth.signOut();}catch(e){}
      try{go('auth');setAuthMode('login');}catch(e){}
    });
  }


  /* ---------- SERVICE BOOKING CLOUD SYNC ---------- */
  async function syncServiceReservationsCloud(){
    try{
      var SB=window.sortedSupabase;if(!SB)return;
      var sess=(await SB.auth.getSession()).data?.session;if(!sess?.user)return;
      var me=(db.users||[]).find(function(x){return x.id===db.session})||null;if(!me)return;
      var list=(db.reservations||[]).filter(function(r){return String(r.type||'')==='SERVICE_BOOKING' && String(r.customerId||'')===String(me.id);});
      for(var r of list){
        var b=(db.businesses||[]).find(function(x){return String(x.id)===String(r.businessId);});
        var svc=(db.services||[]).find(function(x){return String(x.id)===String(r.serviceId);});
        var businessRemote=b?b._supabaseId:null, serviceRemote=svc?svc._supabaseId:null;
        if(!businessRemote||!serviceRemote)continue;
        var remoteId;
        try{var m=JSON.parse(localStorage.getItem('SORTED_SUPABASE_MAP_V1')||'{}')||{};m.reservations=m.reservations||{};remoteId=m.reservations[r.id];if(!remoteId){remoteId=crypto.randomUUID();m.reservations[r.id]=remoteId;localStorage.setItem('SORTED_SUPABASE_MAP_V1',JSON.stringify(m));}}catch(e){remoteId=crypto.randomUUID();}
        var row={id:remoteId,buyer_id:sess.user.id,business_id:businessRemote,service_id:serviceRemote,type:'SERVICE_BOOKING',customer_name:r.customerName||me.name||'Customer',service_name:r.serviceName||svc?.name||'Service',student_name:r.studentName||'',class_grade:r.classGrade||'',learning_mode:r.learningMode||'',vehicle_type:r.vehicleType||'',vehicle_number:r.vehicleNumber||'',service_address:r.serviceAddress||'',booking_date:r.date||null,booking_time:r.time||'',notes:r.notes||'',price:Number(r.price||r.total||0),status:r.status||'PENDING'};
        var q=await SB.from('reservations').upsert(row,{onConflict:'id'}).select().maybeSingle();
        if(q.error)console.warn('service reservation sync',q.error); else r._supabaseId=remoteId;
      }
    }catch(e){console.warn('service reservation cloud sync failed',e);}
  }
  async function pullServiceReservationsCloud(){
    try{
      var SB=window.sortedSupabase;if(!SB)return;
      var sess=(await SB.auth.getSession()).data?.session;if(!sess?.user)return;
      var me=(db.users||[]).find(function(x){return x.id===db.session})||null;if(!me)return;
      var myBusinesses=(db.businesses||[]).filter(function(b){return String(b.ownerId)===String(me.id)&&b._supabaseId;});
      if(!myBusinesses.length)return;
      var ids=myBusinesses.map(function(b){return b._supabaseId;});
      var q=await SB.from('reservations').select('*').in('business_id',ids).order('created_at',{ascending:false});
      if(q.error){console.warn('service reservation pull',q.error);return;}
      for(var rr of (q.data||[])){
        var b=myBusinesses.find(function(x){return String(x._supabaseId)===String(rr.business_id);});if(!b)continue;
        var svc=(db.services||[]).find(function(x){return String(x._supabaseId)===String(rr.service_id);});
        var local=(db.reservations||[]).find(function(x){return String(x._supabaseId)===String(rr.id);});
        var obj={id:local?.id||uid('booking'),_supabaseId:rr.id,type:'SERVICE_BOOKING',serviceId:svc?.id||local?.serviceId||'',businessId:b.id,customerId:local?.customerId||'',customerName:rr.customer_name||'Customer',serviceName:rr.service_name||svc?.name||'Service',studentName:rr.student_name||'',classGrade:rr.class_grade||'',learningMode:rr.learning_mode||'',vehicleType:rr.vehicle_type||'',vehicleNumber:rr.vehicle_number||'',serviceAddress:rr.service_address||'',date:rr.booking_date||'',time:rr.booking_time||'',notes:rr.notes||'',price:Number(rr.price||0),total:Number(rr.price||0),status:rr.status||'PENDING',createdAt:local?.createdAt||Date.parse(rr.created_at)||Date.now()};
        if(local)Object.assign(local,obj);else (db.reservations=db.reservations||[]).push(obj);
      }
      try{localStorage.setItem(KEY,JSON.stringify(db));}catch(e){}
      if(typeof window.renderSellerReservations==='function'&&document.getElementById('seller')?.classList.contains('active'))window.renderSellerReservations();
    }catch(e){console.warn('service reservation pull failed',e);}
  }
  var previousSellerStatusV23=window.sellerStatus;
  window.sellerStatus=async function(id,status){
    if(typeof previousSellerStatusV23==='function')previousSellerStatusV23.apply(this,arguments);
    try{
      var SB=window.sortedSupabase;if(!SB)return;
      var r=(db.reservations||[]).find(function(x){return String(x.id)===String(id);});if(!r||r.type!=='SERVICE_BOOKING')return;
      var remote=r._supabaseId;
      if(!remote){try{var m=JSON.parse(localStorage.getItem('SORTED_SUPABASE_MAP_V1')||'{}')||{};remote=m.reservations?.[r.id];}catch(e){}}
      if(remote)await SB.from('reservations').update({status:status,updated_at:new Date().toISOString()}).eq('id',remote);
    }catch(e){console.warn('service reservation status sync',e);}
  };
  setTimeout(pullServiceReservationsCloud,2200);
  setInterval(function(){if(document.visibilityState!=='hidden')pullServiceReservationsCloud();},15000);
  setInterval(function(){if(document.visibilityState!=='hidden')syncServiceReservationsCloud();},12000);
  setTimeout(syncServiceReservationsCloud,2500);

  /* ---------- SERVICE PHOTO GALLERY COMPATIBILITY ---------- */
  // Keep the first gallery photo mirrored to image so the existing sync engine
  // uploads it to Supabase Storage.
  try{
    (db.services||[]).forEach(function(s){
      if(!s.image && Array.isArray(s.images)&&s.images[0])s.image=s.images[0];
    });
  }catch(e){}

})();



/* ===== legacy script 48 ===== */

(function(){
  'use strict';
  // Final service detail fix: use the actual local db variable, not window.db.
  function serviceById(id){ return (typeof db!=='undefined' ? (db.services||[]) : []).find(function(x){return String(x.id)===String(id);}); }
  function businessById(id){ return (typeof db!=='undefined' ? (db.businesses||[]) : []).find(function(x){return String(x.id)===String(id);}); }
  window.showServiceDetail=function(id){
    var s=serviceById(id), b=s&&businessById(s.businessId);
    if(!s||!b){ if(typeof toast==='function')toast('Service not found'); return; }
    var imgs=(Array.isArray(s.images)&&s.images.length?s.images:[]).filter(Boolean);
    if(!imgs.length && s.image) imgs=[s.image];
    var gallery=imgs.length ? '<div class="service-detail-gallery">'+imgs.map(function(x){return '<img src="'+esc(String(x))+'" alt="'+esc(s.name||'Service')+'" loading="lazy">';}).join('')+'</div>' : '<div class="service-detail-hero" style="display:grid;place-items:center;font-size:56px">🛠️</div>';
    var price=(s.price!=null&&s.price!=='')?'From ₹'+Number(s.price).toLocaleString('en-IN'):(s.startingPrice?'From ₹'+Number(s.startingPrice).toLocaleString('en-IN'):'Price on request');
    openModal('<button class="close" onclick="closeModal()">×</button><h2>'+esc(s.name||'Service')+'</h2><div class="muted">'+esc(b.name||'Provider')+'</div>'+gallery+'<div class="row" style="margin-top:10px;gap:8px;flex-wrap:wrap"><span class="status">'+esc(s.category||'Services')+'</span><span class="status">'+esc(s.serviceType||'Service')+'</span><span class="status">'+esc(price)+'</span>'+(s.duration?'<span class="status">'+esc(s.duration)+'</span>':'')+'</div>'+(s.description?'<p style="line-height:1.55">'+esc(s.description)+'</p>':'<p class="muted">No description provided.</p>')+(s.serviceArea?'<div class="muted" style="margin-top:8px">📍 '+esc(s.serviceArea)+'</div>':'')+'<button class="btn primary full" style="margin-top:16px" onclick="closeModal();bookService(\''+esc(s.id)+'\')">BOOK NOW</button>');
  };
  // Ensure service bookings always appear in buyer Orders and carry userId.
  window.renderOrders=window.renderOrders||function(){};
  document.addEventListener('DOMContentLoaded',function(){ try{ if(typeof renderOrders==='function')renderOrders(); }catch(e){} });
  // Accept/reject PENDING service requests in the seller Orders view.
  var oldSellerStatus=window.sellerStatus;
  window.sellerStatus=async function(id,status){
    if(typeof oldSellerStatus==='function') await oldSellerStatus.apply(this,arguments);
    try{ if(typeof renderSellerReservations==='function')renderSellerReservations(); }catch(e){}
  };
})();



/* ===== legacy script 49 ===== */

(function(){
  window.renderOrders=function(){
    var list=(db.reservations||[]).filter(function(r){return String(r.userId||r.customerId||'')===String(db.session);}).slice().reverse();
    var el=document.getElementById('ordersList'); if(!el)return;
    el.innerHTML=list.length?list.map(function(r){
      var b=(db.businesses||[]).find(function(x){return String(x.id)===String(r.businessId);});
      var isService=String(r.type||'')==='SERVICE_BOOKING';
      var title=isService?(r.serviceName||'Service booking'):(r.number||'Order');
      var details=isService?'<div style="margin-top:9px"><b>'+esc(title)+'</b></div><div class="muted" style="margin-top:6px">'+esc(r.date||'')+(r.time?' · '+esc(r.time):'')+'</div>':(r.items||[]).slice(0,3).map(function(i){return '<div style="margin-top:9px">'+esc(i.name)+' × '+Number(i.qty||0)+'</div>';}).join('');
      return '<button class="card" style="width:100%;text-align:left;display:block;cursor:pointer" onclick="openOrderDetails(\''+esc(r.id)+'\')"><div class="row"><b>'+esc(title)+'</b><span class="status">'+esc(r.status||'PENDING')+'</span></div><div class="muted" style="margin-top:5px">'+esc(b?.name||'Provider')+'</div>'+details+'<div class="muted" style="margin-top:7px">₹'+Number(r.total||r.price||0).toLocaleString('en-IN')+(isService?' · Service booking':' · '+(r.method==='delivery'?'Home Delivery':'Self Pickup'))+'</div><div class="muted" style="margin-top:8px;font-size:11px">TAP TO VIEW DETAILS</div></button>';
    }).join(''):'<div class="empty"><strong>No orders yet</strong>Your confirmed and previous orders will appear here.</div>';
  };
  window.openOrderDetails=function(id){
    var r=(db.reservations||[]).find(function(x){return String(x.id)===String(id)&&String(x.userId||x.customerId||'')===String(db.session);}); if(!r)return;
    if(String(r.type||'')==='SERVICE_BOOKING' && typeof window.openServiceBookingDetails==='function'){window.openServiceBookingDetails(r.id);return;}
    // Let the app's original product-order detail function handle normal orders.
    try{ if(typeof window.__sortedOriginalOpenOrderDetails==='function')return window.__sortedOriginalOpenOrderDetails(id); }catch(e){}
    if(typeof toast==='function')toast('Order details unavailable');
  };
})();



/* ===== legacy script 50 ===== */

(function(){
  try{
    db.services=db.services||[];
    const serviceBusinesses=(db.businesses||[]).filter(b=>b.businessType==='services');
    let changed=false;
    db.services.forEach(s=>{
      const current=(db.businesses||[]).find(b=>String(b.id)===String(s.businessId));
      const provider=String(s.providerName||'').trim().toLowerCase();
      if(provider){
        const exact=serviceBusinesses.find(b=>String(b.name||'').trim().toLowerCase()===provider);
        if(exact && (!current || current.businessType!=='services' || String(current.name||'').trim().toLowerCase()!==provider)){
          s.businessId=exact.id;
          s.ownerId=exact.ownerId;
          changed=true;
        }
      }
    });
    if(changed && typeof save==='function')save();

    // Ensure service profiles always use the business that was clicked.
    const oldShow=window.showBusinessProfile;
    if(oldShow && !window.__v101ShowPatched){
      window.__v101ShowPatched=true;
      window.showBusinessProfile=function(id,noHistory){
        currentBusiness=id;
        return oldShow(id,noHistory);
      };
    }
  }catch(e){ console.warn('v101 service repair:',e); }
})();



/* ===== legacy script 51 ===== */

/* SORTED v20: final business/product save fix.
   - Businesses now always store categoryId + category name.
   - Products inherit categoryId from their business; the product form has no
     category input, so validation must never look for a missing #pc field.
   - Existing v19 businesses that accidentally stored the category id in
     `category` are repaired on load.
*/
(function(){
  function marketplaceCategories(){
    return (db.categories||[]).filter(c=>c.type==='products' && c.scope==='marketplace');
  }

  function resolveBusinessCategory(b){
    if(!b) return '';
    if(b.categoryId && (db.categories||[]).some(c=>c.id===b.categoryId)) return b.categoryId;
    const cats=marketplaceCategories();
    const raw=String(b.category||'').trim();
    const byId=cats.find(c=>c.id===raw);
    if(byId){ b.categoryId=byId.id; b.category=byId.name; return byId.id; }
    const byName=cats.find(c=>String(c.name).toLowerCase()===raw.toLowerCase());
    if(byName){ b.categoryId=byName.id; b.category=byName.name; return byName.id; }
    const fallback=cats[0];
    if(fallback){ b.categoryId=fallback.id; b.category=fallback.name; return fallback.id; }
    return '';
  }

  // Repair businesses created by the broken v19 saveBusiness override.
  (db.businesses||[]).forEach(resolveBusinessCategory);
  (db.products||[]).forEach(p=>{
    const b=(db.businesses||[]).find(x=>x.id===p.businessId);
    if(b){
      const cid=resolveBusinessCategory(b);
      if(cid) p.categoryId=cid;
    }
  });
  try{ window.save?.(); }catch(e){}

  window.saveBusiness=async function(){
    const u=typeof user==='function'?user():null;
    if(!u || u.role!=='seller') return toast('Seller account required');

    const get=id=>document.getElementById(id);
    const name=get('bn')?.value.trim()||'';
    if(!name) return toast('Business name is required');

    const categoryId=get('bc')?.value||'';
    const category=(db.categories||[]).find(c=>c.id===categoryId);
    if(!category) return toast('Please choose a business category');

    let logo='',cover='';
    try{
      logo=await imageFrom('blogoFile');
      cover=await imageFrom('bcoverFile');
    }catch(e){
      return toast(e.message||'Could not read business photo. Please choose it again.');
    }

    const b={
      id:uid('biz'), ownerId:u.id,
      name,
      ownerName:get('bo')?.value.trim()||u.name,
      phone:get('bp')?.value.trim()||u.contact,
      categoryId:category.id,
      category:category.name,
      address:get('ba')?.value.trim()||'Local address',
      locality:get('bl')?.value.trim()||'Nearby',
      logo,cover,
      hours:get('bhours')?.value.trim()||'Opening hours not provided',
      delivery:get('bd')?.value==='yes',
      paymentPolicy:get('bpay')?.value||'Pay at store'
    };

    db.businesses=db.businesses||[];
    db.businesses.push(b);
    try{
      const ok=window.save();
      if(ok===false) throw new Error('Storage is full');
    }catch(e){
      db.businesses=db.businesses.filter(x=>x.id!==b.id);
      return toast('Business could not be saved. Try a smaller logo/cover image or remove old data.');
    }

    closeModal();
    currentBusiness=b.id;
    try{ homeBusinesses(); }catch(e){}
    try{ openSeller(b.id); }catch(e){ go('seller'); try{renderSeller();}catch(_){} }
    toast('Business created successfully');
  };

  window.saveProduct=async function(bid){
    const b=(db.businesses||[]).find(x=>x.id===bid);
    if(!b) return toast('Business not found');

    const categoryId=resolveBusinessCategory(b);
    if(!categoryId) return toast('Please set a business category first');

    const v=id=>document.getElementById(id)?.value||'';
    const name=v('pn').trim();
    const price=Number(v('pp'));
    const stock=Number(v('ps'));

    if(!name || !Number.isFinite(price) || price<0 || !Number.isFinite(stock) || stock<0){
      return toast('Name, price and stock are required');
    }

    let images=[];
    if(document.getElementById('piFile')?.files?.length){
      try{
        images=await window.imageFromMany('piFile');
      }catch(e){
        return toast(e.message||'Could not read the product photos. Please choose them again.');
      }
    }

    const discountRaw=v('pd').trim();
    const discountPrice=discountRaw==='' ? null : Number(discountRaw);
    if(discountPrice!==null && (!Number.isFinite(discountPrice)||discountPrice<0)){
      return toast('Discount price must be a valid amount');
    }
    if(discountPrice!==null && discountPrice>price){
      return toast('Discount price cannot be higher than the regular price');
    }

    const p={
      id:uid('prod'), businessId:bid, categoryId,
      name,
      images:images.slice(0,8), image:images[0]||'',
      price, discountPrice,
      stock, reserved:0,
      unit:v('pu').trim()||'piece',
      description:v('px'), sku:'', available:true
    };

    db.products=db.products||[];
    db.products.push(p);
    try{
      const ok=window.save();
      if(ok===false) throw new Error('Storage is full');
    }catch(e){
      db.products=db.products.filter(x=>x.id!==p.id);
      return toast('Could not save product. Try fewer or smaller photos.');
    }

    closeModal();
    currentBusiness=bid;
    try{ renderSeller(); }catch(e){ try{ renderSellerTab(); }catch(_){} }
    toast(`Product listed under ${esc((db.categories||[]).find(c=>c.id===categoryId)?.name||b.category||'Business')}`);
  };

  // Keep existing records consistent whenever this page is opened.
  window.normalizeSortedData=function(){
    (db.businesses||[]).forEach(resolveBusinessCategory);
    (db.products||[]).forEach(p=>{
      const b=(db.businesses||[]).find(x=>x.id===p.businessId);
      if(b) p.categoryId=resolveBusinessCategory(b)||p.categoryId;
    });
    try{window.save();}catch(e){}
  };
})();



/* ===== legacy script 52 ===== */

(function(){
  'use strict';

  function seller(){
    try { return typeof user==='function' ? user() : null; } catch(e) { return null; }
  }
  function businesses(){
    const u=seller();
    return u&&u.role==='seller' ? (db.businesses||[]).filter(b=>b.ownerId===u.id) : [];
  }
  function ensureBusiness(){
    const bs=businesses();
    if(!bs.length){ currentBusiness=null; return null; }
    if(!currentBusiness || !bs.some(b=>b.id===currentBusiness)) currentBusiness=bs[0].id;
    return bs.find(b=>b.id===currentBusiness)||bs[0];
  }
  function businessSelector(bs,b){
    if(!bs.length) return '<div class="notice">No business found. Create a business first.</div>';
    return `<div class="orders-business-profiles">${bs.map(x=>{
      const orders=(db.reservations||[]).filter(r=>r.businessId===x.id);
      const newCount=orders.filter(r=>['PENDING','AWAITING CUSTOMER OTP','RESERVED — WAITING FOR SELLER CONFIRMATION','RESERVED'].includes(String(r.status||'RESERVED'))).length;
      const pendingCount=orders.filter(r=>!['AWAITING CUSTOMER OTP','RESERVED — WAITING FOR SELLER CONFIRMATION','RESERVED','REJECTED','CANCELLED','EXPIRED','COLLECTED','DELIVERED'].includes(String(r.status||'RESERVED'))).length;
      const img=x.logo||x.cover||'';
      return `<button type="button" class="orders-business-profile ${x.id===b?.id?'selected':''}" onclick="openOrdersForBusiness('${esc(x.id)}')">
        <div class="orders-business-avatar">${img?`<img src="${esc(img)}" alt="${esc(x.name)}" loading="lazy" onerror="this.style.display='none';this.parentElement.classList.add('no-image')">`:'<span>🏪</span>'}</div>
        <div class="orders-business-name">${esc(x.name)}</div>
        <div class="orders-business-counts"><span class="orders-count new"><b>${newCount}</b><small>NEW</small></span><span class="orders-count pending"><b>${pendingCount}</b><small>PENDING</small></span></div>
      </button>`;
    }).join('')}</div>`;
  }
  window.openOrdersForBusiness=function(id){
    currentBusiness=id;
    window.__ordersBusinessSelected=true;
    if(typeof window.renderSellerReservations==='function')window.renderSellerReservations();
    else if(typeof window.sellerTab==='function')window.sellerTab('reservations');
    setTimeout(()=>document.getElementById('sellerContent')?.scrollIntoView({behavior:'smooth',block:'start'}),30);
  };
  function reservationCard(r){
    const items=Array.isArray(r.items)?r.items:[];
    const total=Number(r.total||0);
    const status=String(r.status||'RESERVED');
    return `<div class="seller-order-card">
      <div class="row"><b>${esc(r.number||'Reservation')}</b><span class="status">${esc(status)}</span></div>
      <div class="muted" style="margin-top:5px">${r.method==='delivery'?'Home Delivery':'Self Pickup'} · ₹${total.toLocaleString('en-IN')}</div>
      <div class="seller-order-items">${items.length?items.map(i=>`<div class="seller-order-item"><span>${esc(i.name||'Product')} × ${Number(i.qty||0)}</span><span>₹${(Number(i.price||0)*Number(i.qty||0)).toLocaleString('en-IN')}</span></div>`).join(''):'<div class="muted">No item details</div>'}</div>
      <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:12px">
        <button class="btn secondary" onclick="event.stopPropagation();openSellerOrderDetails('${esc(r.id)}',false)">VIEW DETAILS</button>
        ${['PENDING','AWAITING CUSTOMER OTP','RESERVED — WAITING FOR SELLER CONFIRMATION','RESERVED'].includes(status)?`<button class="btn primary" onclick="event.stopPropagation();sellerStatus('${esc(r.id)}','CONFIRMED')">ACCEPT</button><button class="btn danger" onclick="event.stopPropagation();sellerStatus('${esc(r.id)}','REJECTED')">REJECT</button>`:''}
        ${['CONFIRMED','ORDER CONFIRMED'].includes(status)&&r.method==='pickup'?`<button class="btn primary" onclick="event.stopPropagation();sellerStatus('${esc(r.id)}','READY FOR PICKUP')">READY FOR PICKUP</button>`:''}
        ${['CONFIRMED','ORDER CONFIRMED'].includes(status)&&r.method==='delivery'?`<button class="btn primary" onclick="event.stopPropagation();sellerStatus('${esc(r.id)}','PREPARING')">PREPARING</button>`:''}
        ${status==='READY FOR PICKUP'?`<button class="btn primary" onclick="event.stopPropagation();verifyHandoverOtp('${esc(r.id)}','COLLECTED')">VERIFY OTP & COMPLETE</button>`:''}
        ${status==='PREPARING'?`<button class="btn primary" onclick="event.stopPropagation();sellerStatus('${esc(r.id)}','OUT FOR DELIVERY')">OUT FOR DELIVERY</button>`:''}
        ${status==='OUT FOR DELIVERY'?`<button class="btn primary" onclick="event.stopPropagation();verifyHandoverOtp('${esc(r.id)}','DELIVERED')">VERIFY OTP & COMPLETE</button>`:''}
      </div>
    </div>`;
  }

  function renderReservations(){
    const el=document.getElementById('sellerContent');
    if(!el)return;
    const u=seller();
    if(!u||u.role!=='seller'){ el.innerHTML=''; return; }
    const bs=businesses();
    if(!bs.length){
      el.innerHTML='<div class="page-head"><div class="page-title">ORDERS</div></div><div class="empty"><strong>No business yet</strong><div style="margin-top:8px">Create a business first to receive reservations.</div><button class="btn primary full" style="margin-top:12px" onclick="sellerTab(\'businesses\')">GO TO BUSINESSES</button></div>';
      return;
    }
    const selectedId=window.__ordersBusinessSelected&&currentBusiness&&bs.some(x=>x.id===currentBusiness)?currentBusiness:null;
    if(!selectedId){
      currentBusiness=null;
      const first=bs[0];
      el.innerHTML=`<div class="page-head"><div class="page-title">ORDERS</div></div>
        <div class="orders-business-heading"><b>SELECT BUSINESS</b><span>Choose a business to view its orders</span></div>
        ${businessSelector(bs,first)}`;
      return;
    }
    const b=bs.find(x=>x.id===selectedId)||bs[0];
    const rs=(db.reservations||[]).filter(r=>r.businessId===b.id).slice().sort((a,z)=>Number(z.createdAt||0)-Number(a.createdAt||0));
    const newCount=rs.filter(r=>['PENDING','AWAITING CUSTOMER OTP','RESERVED — WAITING FOR SELLER CONFIRMATION','RESERVED'].includes(String(r.status||'RESERVED'))).length;
    const pendingCount=rs.filter(r=>!['AWAITING CUSTOMER OTP','RESERVED — WAITING FOR SELLER CONFIRMATION','RESERVED','REJECTED','CANCELLED','EXPIRED','COLLECTED','DELIVERED'].includes(String(r.status||'RESERVED'))).length;
    el.innerHTML=`<div class="page-head"><button class="btn secondary" onclick="backToOrdersBusinesses()">← BUSINESSES</button><div class="page-title">ORDERS</div></div>
      <div class="orders-selected-business"><div class="orders-selected-avatar">${b.logo||b.cover?`<img src="${esc(b.logo||b.cover)}" alt="${esc(b.name)}" loading="lazy">`:'🏪'}</div><div class="grow"><h2>${esc(b.name)}</h2><div class="muted">${esc(b.locality||b.address||'')}</div></div><div class="orders-summary-counts"><span class="orders-count new"><b>${newCount}</b><small>NEW</small></span><span class="orders-count pending"><b>${pendingCount}</b><small>PENDING</small></span></div></div>
      <div class="seller-orders-list">${rs.length?rs.map(reservationCard).join(''):'<div class="empty"><strong>No reservations/orders yet</strong><div style="margin-top:6px">Customer reservations for this business will appear here.</div></div>'}</div>`;
  }

  function renderDashboard(){
    const el=document.getElementById('sellerContent');
    if(!el)return;
    const bs=businesses();
    const b=ensureBusiness();
    if(!b){
      el.innerHTML='<div class="page-head"><div class="page-title">DASHBOARD</div></div><div class="empty"><strong>No business yet</strong></div>';
      return;
    }
    const rs=(db.reservations||[]).filter(r=>r.businessId===b.id);
    const completed=rs.filter(r=>['COLLECTED','DELIVERED'].includes(r.status));
    const active=rs.filter(r=>!['COLLECTED','DELIVERED','REJECTED','CANCELLED','EXPIRED'].includes(r.status));
    const revenue=completed.reduce((n,r)=>n+Number(r.total||0),0);
    el.innerHTML=`<div class="page-head"><div class="page-title">DASHBOARD</div></div>${dashboardBusinessSelector(bs,b)}
      <div class="card"><h2 style="margin:0">${esc(b.name)}</h2><div class="muted">${esc(b.locality||b.address||'')}</div></div>
      <div class="dashboard-stats"><div class="stat-card"><b>₹${revenue.toLocaleString('en-IN')}</b><span>SALES REVENUE</span></div><div class="stat-card"><b>${rs.length}</b><span>RESERVATIONS</span></div><div class="stat-card"><b>${active.length}</b><span>ACTIVE ORDERS</span></div><div class="stat-card"><b>${(db.products||[]).filter(p=>p.businessId===b.id).length}</b><span>PRODUCTS</span></div></div>
      <button class="btn primary full" onclick="sellerTab('reservations')">VIEW ORDERS</button>`;
  }

  function renderBusinesses(){
    if(typeof window.renderSellerBusinesses==='function') return window.renderSellerBusinesses();
    const el=document.getElementById('sellerContent'); if(el)el.innerHTML='';
  }
  function renderProfile(){
    if(typeof window.renderSellerProfile==='function') return window.renderSellerProfile();
  }

  window.renderSellerReservations=renderReservations;
  window.renderSellerDashboard=renderDashboard;

  // One authoritative seller navigation handler. This is deliberately the last
  // sellerTab definition so older prototype overrides cannot steal the click.
  window.sellerTab=function(tab){
    const u=seller();
    if(!u||u.role!=='seller'){
      toast('Seller account required');
      if(typeof setAuthMode==='function')setAuthMode('login');
      go('auth');
      return;
    }
    const bs=businesses();
    if(!currentBusiness || !bs.some(b=>b.id===currentBusiness)) currentBusiness=bs[0]?.id||null;
    const sellerScreen=document.getElementById('seller');
    if(sellerScreen){
      document.querySelectorAll('.screen').forEach(x=>x.classList.remove('active'));
      sellerScreen.classList.add('active');
      try{history.replaceState({screen:'seller'},'',location.pathname+'#seller');}catch(e){}
      scrollTo({top:0,behavior:'smooth'});
    }else{
      go('seller');
    }
    document.querySelectorAll('#sellerNav button').forEach(x=>x.classList.toggle('active',x.dataset.sellerTab===tab));
    document.body.classList.add('seller-mode');
    const nav=document.getElementById('sellerNav'); if(nav)nav.style.display='grid';
    const buyerNav=document.querySelector('.buyer-nav'); if(buyerNav)buyerNav.style.display='none';
    if(tab==='reservations') renderReservations();
    else if(tab==='businesses') renderBusinesses();
    else if(tab==='profile') renderProfile();
    else renderDashboard();
  };

  window.sellerGo=window.sellerTab;
  window.renderSellerTab=function(){
    const active=document.querySelector('#sellerNav button.active')?.dataset.sellerTab||'dashboard';
    window.sellerTab(active);
  };

  // Make the dashboard's reservation button and bottom-nav button use the same handler.
  document.addEventListener('click',function(e){
    const btn=e.target.closest?.('#sellerNav button[data-seller-tab="reservations"]');
    if(btn){e.preventDefault();e.stopImmediatePropagation();window.sellerTab('reservations');}
  },true);
})();



/* ===== legacy script 53 ===== */

(function(){
  'use strict';

  function refreshReservations(){
    // Never let a status transition fall back to the seller dashboard.
    if(typeof window.sellerTab==='function'){
      window.sellerTab('reservations');
    }else if(typeof window.renderSellerReservations==='function'){
      window.renderSellerReservations();
    }
  }

  // Preserve the existing business/inventory/authorization logic, but always
  // return to the Reservations / Orders screen after a seller changes status.
  const previousSellerStatus=window.sellerStatus;
  window.sellerStatus=function(id,status){
    if(typeof previousSellerStatus==='function'){
      previousSellerStatus.call(this,id,status);
    }
    refreshReservations();
  };

  // OTP completion previously called renderSellerShell(), whose older state
  // could still be "dashboard". Keep the OTP/inventory logic, then explicitly
  // restore the Reservations / Orders screen.
  const previousCompleteHandover=window.completeHandover;
  window.completeHandover=function(id,finalStatus){
    if(typeof previousCompleteHandover==='function'){
      previousCompleteHandover.call(this,id,finalStatus);
    }
    const r=(db.reservations||[]).find(x=>x.id===id);
    if(r && ['COLLECTED','DELIVERED'].includes(r.status)) refreshReservations();
  };

  // If an old renderer is invoked by another legacy wrapper, re-render the
  // currently selected seller tab rather than silently returning to dashboard.
  const previousRenderSellerShell=window.renderSellerShell;
  window.renderSellerShell=function(){
    if(typeof previousRenderSellerShell==='function') previousRenderSellerShell.apply(this,arguments);
    const active=document.querySelector('#sellerNav button.active')?.dataset.sellerTab;
    if(active==='reservations' && typeof window.renderSellerReservations==='function'){
      window.renderSellerReservations();
    }
  };

  // Explicitly keep the reservation tab selected while the order flow is open.
  window.openSellerReservations=function(){ refreshReservations(); };
})();



/* ===== legacy script 54 ===== */

(function(){
  'use strict';

  db.notifications=db.notifications||[];

  function seller(){try{return typeof user==='function'?user():null}catch(e){return null}}
  function ownedBusinesses(){const u=seller();return u&&u.role==='seller'?(db.businesses||[]).filter(b=>b.ownerId===u.id):[]}
  function ownedBusiness(id){const u=seller();return u&&u.role==='seller'?(db.businesses||[]).find(b=>b.id===id&&b.ownerId===u.id):null}
  function notificationId(){return uid('notif')}

  function ensureOrderNotification(r){
    if(!r||!r.businessId)return;
    const b=db.businesses.find(x=>x.id===r.businessId); if(!b)return;
    const exists=(db.notifications||[]).some(n=>n.type==='ORDER'&&n.reservationId===r.id&&n.recipientId===b.ownerId);
    if(exists)return;
    db.notifications.push({
      id:notificationId(),type:'ORDER',recipientId:b.ownerId,businessId:b.id,reservationId:r.id,
      title:'New order received',body:`${r.number||'New order'} · ${r.items?.length||0} item(s) · ₹${Number(r.total||0).toLocaleString('en-IN')}`,
      createdAt:Date.now(),read:false
    });
  }

  // Create notifications for existing reservations too, so orders created before
  // this version are visible to the seller without duplicating notifications.
  (db.reservations||[]).forEach(ensureOrderNotification);
  try{save()}catch(e){}

  function unreadForSeller(){
    const u=seller(); if(!u||u.role!=='seller')return [];
    const bids=new Set(ownedBusinesses().map(b=>b.id));
    return (db.notifications||[]).filter(n=>n.type==='ORDER'&&n.recipientId===u.id&&!n.read&&bids.has(n.businessId));
  }

  function formatTime(ts){
    if(!ts)return '';
    try{return new Date(ts).toLocaleString('en-IN',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'})}catch(e){return ''}
  }

  function syncBadge(){
    const u=seller();
    const btn=document.querySelector('.bell'); if(!btn)return;
    if(!u||u.role!=='seller'){
      btn.innerHTML='♧';
      btn.onclick=function(){toast('No new notifications')};
      return;
    }
    btn.innerHTML='<span class="seller-bell-wrap">♧<span id="sellerNotificationBadge"></span></span>';
    btn.onclick=function(){openSellerNotifications()};
    const badge=document.getElementById('sellerNotificationBadge');
    const count=unreadForSeller().length;
    if(badge){badge.textContent=count>99?'99+':String(count);badge.style.display=count?'flex':'none'}
  }

  function sellerOrder(id){
    const r=(db.reservations||[]).find(x=>x.id===id); if(!r)return null;
    return ownedBusiness(r.businessId)?r:null;
  }

  window.printSellerBill=function(id){
    const r=sellerOrder(id);
    if(!r)return toast('Order not found or access denied');
    const customer=(db.users||[]).find(u=>u.id===r.userId);
    const b=(db.businesses||[]).find(x=>x.id===r.businessId);
    if(!b)return toast('Business not found');
    const items=Array.isArray(r.items)?r.items:[];
    const rows=items.length?items.map(i=>`<tr><td>${esc(i.name||'Product')}</td><td>${Number(i.qty||0)}</td><td>₹${Number(i.price||0).toLocaleString('en-IN')}</td><td>₹${(Number(i.price||0)*Number(i.qty||0)).toLocaleString('en-IN')}</td></tr>`).join(''):`<tr><td colspan="4">No item details available</td></tr>`;
    let bill=document.getElementById('printBill');
    if(!bill){bill=document.createElement('div');bill.id='printBill';document.body.appendChild(bill)}
    bill.innerHTML=`<div class="print-head"><div><div class="print-title">${esc(b.name||'Business')}</div><div>${esc(b.locality||b.address||'')}</div></div><div class="print-meta"><b>INVOICE / BILL</b><br>Order: ${esc(r.number||r.id)}<br>${esc(formatTime(r.createdAt))}</div></div>
      <div class="print-section"><h3>Customer</h3><div class="print-box"><b>${esc(customer?.name||'Customer')}</b><br>${esc(customer?.contact||'Contact not available')}</div></div>
      <div class="print-section"><h3>Order details</h3><div class="print-box">Status: ${esc(r.status||'RESERVED')}<br>Method: ${r.method==='delivery'?'Home Delivery':'Self Pickup'}${r.validUntil?`<br>Valid until: ${esc(r.validUntil)}`:''}</div></div>
      <div class="print-section"><h3>Items</h3><table><thead><tr><th>Item</th><th>Qty</th><th>Price</th><th>Total</th></tr></thead><tbody>${rows}</tbody></table><div class="print-total"><span>TOTAL</span><span>₹${Number(r.total||0).toLocaleString('en-IN')}</span></div></div>
      <div style="margin-top:28px;padding-top:12px;border-top:1px solid #ccc;font-size:11px">Thank you for shopping locally with SORTED.</div>`;
    const previousTitle=document.title;
    document.title=`Bill ${r.number||''}`;
    const cleanup=()=>{document.title=previousTitle;bill.remove();window.removeEventListener('afterprint',cleanup)};
    window.addEventListener('afterprint',cleanup);
    window.print();
    setTimeout(()=>{if(document.getElementById('printBill'))cleanup()},1000);
  };

  window.openSellerOrderDetails=function(id,fromNotification){
    const r=sellerOrder(id); if(!r)return toast('Order not found or access denied');
    const customer=(db.users||[]).find(u=>u.id===r.userId);
    const b=db.businesses.find(x=>x.id===r.businessId);
    const canDecide=['RESERVED','RESERVED — WAITING FOR SELLER CONFIRMATION','AWAITING CUSTOMER OTP'].includes(String(r.status||''));
    const itemHtml=(r.items||[]).map(i=>{const p=(db.products||[]).find(x=>x.id===i.productId);const imgs=(Array.isArray(i.images)&&i.images.length?i.images:(i.image?[i.image]:[]));const fallback=(typeof productImages==='function'&&p)?productImages(p):((p?.images?.length?p.images:(p?.image?[p.image]:[])));const photo=(imgs[0]||fallback[0]||'');return `<div class="seller-order-detail-row" style="display:flex;gap:10px;align-items:center"><div style="width:64px;height:64px;flex:0 0 64px;border-radius:10px;overflow:hidden;background:#191a1d;display:grid;place-items:center">${photo?`<img src="${esc(photo)}" alt="${esc(i.name||'Product')}" style="width:100%;height:100%;object-fit:cover" onerror="this.style.display='none';this.parentElement.textContent='📷'">`:'📷'}</div><span class="grow"><b>${esc(i.name||'Product')}</b><br><span class="muted">Qty ${Number(i.qty||0)}</span></span><b>₹${(Number(i.price||0)*Number(i.qty||0)).toLocaleString('en-IN')}</b></div>`}).join('')||'<div class="muted">No item details available.</div>';
    const customerName=customer?.name||'Customer';
    const customerContact=customer?.contact||'Not available';
    if(fromNotification){
      const n=(db.notifications||[]).find(x=>x.reservationId===r.id&&x.recipientId===seller()?.id&&x.type==='ORDER');
      if(n){n.read=true;save();}
    }
    openModal(`<button class="close" onclick="closeModal();syncSellerOrderNotifications()">×</button>
      <button class="seller-print-bill-icon" type="button" aria-label="Print bill" title="Print bill" onclick="event.stopPropagation();printSellerBill('${esc(r.id)}')">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9V3h12v6M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2M6 14h12v7H6z"/></svg>
      </button>
      <h2>ORDER ${esc(r.number||'')}</h2>
      <div class="notice"><b>${esc(r.status||'RESERVED')}</b><br><span class="muted">${esc(b?.name||'Business')} · ${r.method==='delivery'?'Home Delivery':'Self Pickup'}</span></div>
      <div class="seller-order-detail-section"><h3 style="margin:0 0 8px">CUSTOMER</h3><div class="seller-order-detail-row"><span>Name</span><b>${esc(customerName)}</b></div><div class="seller-order-detail-row"><span>Phone / Email</span><b>${esc(customerContact)}</b></div></div>
      <div class="seller-order-detail-section"><h3 style="margin:0 0 8px">ORDER ITEMS</h3>${itemHtml}<div class="seller-order-detail-row" style="border-top:1px solid #292a2f;padding-top:9px;margin-top:10px"><span>TOTAL</span><b>₹${Number(r.total||0).toLocaleString('en-IN')}</b></div></div>
      <div class="seller-order-detail-section"><h3 style="margin:0 0 8px">ORDER INFORMATION</h3><div class="seller-order-detail-row"><span>Order placed</span><b>${esc(formatTime(r.createdAt))}</b></div><div class="seller-order-detail-row"><span>Receive by</span><b>${r.method==='delivery'?'Home Delivery':'Self Pickup'}</b></div><div class="seller-order-detail-row"><span>Valid until</span><b>${esc(r.validUntil||'')}</b></div></div>
      ${canDecide?`<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:14px"><button class="btn primary" onclick="event.stopPropagation();sellerAcceptFromDetail('${esc(r.id)}')">ACCEPT ORDER</button><button class="btn danger" onclick="event.stopPropagation();sellerRejectFromDetail('${esc(r.id)}')">REJECT ORDER</button></div>`:''}`);
    syncSellerOrderNotifications();
  };

  window.sellerAcceptFromDetail=function(id){
    const r=sellerOrder(id);if(!r)return;
    closeModal();
    if(typeof window.sellerStatus==='function')window.sellerStatus(id,'CONFIRMED');
    setTimeout(()=>{ window.__ordersBusinessSelected=true; currentBusiness=r.businessId; if(typeof window.renderSellerReservations==='function')window.renderSellerReservations(); },0);
  };
  window.sellerRejectFromDetail=function(id){
    const r=sellerOrder(id);if(!r)return;
    closeModal();
    if(typeof window.sellerStatus==='function')window.sellerStatus(id,'REJECTED');
    setTimeout(()=>{ window.__ordersBusinessSelected=true; currentBusiness=r.businessId; if(typeof window.renderSellerReservations==='function')window.renderSellerReservations(); },0);
  };

  window.openSellerNotifications=function(){
    const u=seller();if(!u||u.role!=='seller')return toast('Seller account required');
    const bids=new Set(ownedBusinesses().map(b=>b.id));
    const list=(db.notifications||[]).filter(n=>n.recipientId===u.id&&n.type==='ORDER'&&bids.has(n.businessId)).sort((a,b)=>Number(b.createdAt||0)-Number(a.createdAt||0));
    openModal(`<button class="close" onclick="closeModal();syncSellerOrderNotifications()">×</button><h2>NOTIFICATIONS</h2><div class="muted">New customer orders appear here instantly.</div><div class="seller-notification-list">${list.length?list.map(n=>{const r=db.reservations.find(x=>x.id===n.reservationId);return `<button class="seller-notification ${n.read?'':'unread'}" onclick="openSellerOrderDetails('${esc(n.reservationId)}',true)"><div class="row"><b>${esc(n.title||'New order')}</b><span class="status">${n.read?'READ':'NEW'}</span></div><div style="margin-top:6px">${esc(n.body||'')}</div><div class="muted" style="margin-top:6px">${esc(formatTime(n.createdAt))}${r?.status?` · ${esc(r.status)}`:''}</div></button>`}).join(''):'<div class="empty"><strong>No notifications</strong><div style="margin-top:6px">New orders will appear here.</div></div>'}</div>${list.some(n=>!n.read)?`<button class="btn secondary full" style="margin-top:12px" onclick="markAllSellerOrderNotificationsRead()">MARK ALL AS READ</button>`:''}`);
  };

  window.markAllSellerOrderNotificationsRead=function(){
    const u=seller();if(!u)return;
    const bids=new Set(ownedBusinesses().map(b=>b.id));
    (db.notifications||[]).forEach(n=>{if(n.type==='ORDER'&&n.recipientId===u.id&&bids.has(n.businessId))n.read=true});
    save();syncSellerOrderNotifications();openSellerNotifications();
  };

  // Search lives only on the dedicated buyer Search page.
  // No persistent/global search field is rendered on Home or other buyer screens.
  function syncBuyerSearch(){
    const screen=document.getElementById('search');
    if(screen && screen.classList.contains('active')){
      const field=document.getElementById('searchPageInput');
      if(field && window._lastBuyerSearchTerm!=null && document.activeElement!==field) field.value=window._lastBuyerSearchTerm;
    }
  }
  const originalGlobalSearchForTop=window.globalSearch;
  window.globalSearch=function(q){
    window._lastBuyerSearchTerm=String(q||'');
    if(typeof originalGlobalSearchForTop==='function') return originalGlobalSearchForTop.call(this,q);
  };
  syncBuyerSearch();
  setTimeout(syncBuyerSearch,100);
  window.addEventListener('hashchange',syncBuyerSearch);

  window.syncSellerOrderNotifications=function(){syncBadge()};

  // Detect orders created in another tab/window immediately through the storage event.
  window.addEventListener('storage',function(e){
    if(e.key!==KEY)return;
    try{
      const fresh=JSON.parse(e.newValue||'null');
      if(!fresh)return;
      const beforeIds=new Set((db.reservations||[]).map(r=>r.id));
      db=fresh;
      db.notifications=db.notifications||[];
      const newOrders=(db.reservations||[]).filter(r=>!beforeIds.has(r.id));
      newOrders.forEach(ensureOrderNotification);
      const u=seller();
      if(u&&u.role==='seller'&&newOrders.some(r=>ownedBusiness(r.businessId))){
        const r=newOrders.find(x=>ownedBusiness(x.businessId));
        toast('New order received: '+(r?.number||'Order'));
        try{if('Notification' in window&&Notification.permission==='granted')new Notification('New order received',{body:(r?.number||'Order')+' · Tap to view',tag:r?.id||'order'}).onclick=function(){window.focus();openSellerOrderDetails(r.id,true)}}catch(err){}
      }
      syncBadge();
      const active=document.querySelector('#sellerNav button.active')?.dataset.sellerTab;
      if(active==='reservations'&&typeof window.renderSellerReservations==='function')window.renderSellerReservations();
    }catch(err){}
  });

  // Poll localStorage as a fallback for environments where storage events are delayed.
  let lastSnapshot='';
  setInterval(function(){
    try{
      const raw=localStorage.getItem(KEY)||'';
      if(!raw||raw===lastSnapshot){syncBadge();return;}
      lastSnapshot=raw;
      const fresh=JSON.parse(raw);if(!fresh)return;
      const oldIds=new Set((db.reservations||[]).map(r=>r.id));
      const newOrders=(fresh.reservations||[]).filter(r=>!oldIds.has(r.id));
      db=fresh;db.notifications=db.notifications||[];
      newOrders.forEach(ensureOrderNotification);
      if(newOrders.length){
        const mine=newOrders.find(r=>ownedBusiness(r.businessId));
        if(mine){toast('New order received: '+(mine.number||'Order'));try{if('Notification' in window&&Notification.permission==='granted')new Notification('New order received',{body:(mine.number||'Order')+' · Tap to view',tag:mine.id})}catch(e){}}
      }
      syncBadge();
      if(newOrders.length&&document.querySelector('#sellerNav button.active')?.dataset.sellerTab==='reservations'&&typeof window.renderSellerReservations==='function')window.renderSellerReservations();
    }catch(e){}
  },1000);

  // Ask for browser notification permission only after a seller explicitly opens notifications.
  const oldOpen=window.openSellerNotifications;
  window.openSellerNotifications=function(){
    try{if('Notification' in window&&Notification.permission==='default')Notification.requestPermission().catch(()=>{})}catch(e){}
    return oldOpen.apply(this,arguments);
  };

  // Make every reservation card clickable for full details, while action buttons keep their actions.
  const oldReservationRenderer=window.renderSellerReservations;
  window.renderSellerReservations=function(){
    const r=oldReservationRenderer?.apply(this,arguments);
    document.querySelectorAll('#sellerContent .seller-order-card').forEach(card=>{
      const anyAction=card.querySelector('button[onclick*="sellerStatus"],button[onclick*="verifyHandoverOtp"]');
      const onclick=anyAction?.getAttribute('onclick')||'';
      const id=onclick.match(/(?:sellerStatus|verifyHandoverOtp)\('([^']+)'/)?.[1];
      if(!id||card.dataset.detailBound)return;
      card.dataset.detailBound='1';card.style.cursor='pointer';card.onclick=function(e){if(e.target.closest('button,select,input'))return;openSellerOrderDetails(id,false)};
    });
    syncBadge();return r;
  };

  // Make the whole seller order card open details; action buttons stop propagation.
  setTimeout(function(){
    document.querySelectorAll('#sellerContent .seller-order-card').forEach(function(card){
      if(card.dataset.orderClickBound)return;
      const detailBtn=card.querySelector('button[onclick*="openSellerOrderDetails"]');
      const m=detailBtn?.getAttribute('onclick')?.match(/openSellerOrderDetails\('([^']+)'/);
      if(!m)return;
      card.dataset.orderClickBound='1';
      card.style.cursor='pointer';
      card.addEventListener('click',function(e){
        if(e.target.closest('button,input,select,a'))return;
        openSellerOrderDetails(m[1],false);
      });
    });
  },250);

  // Patch the reservation-card buttons to stop the card click from opening the modal first.
  const oldStatus=window.sellerStatus;
  if(oldStatus){window.sellerStatus=function(id,status){return oldStatus.apply(this,arguments)}}

  // On load, show the current unread count and create any missing notifications.
  syncBadge();
  setTimeout(syncBadge,250);
  setTimeout(syncBadge,1000);
})();



/* ===== legacy script 55 ===== */

(function(){
  'use strict';
  function currentUser(){ return typeof user==='function' ? user() : null; }
  function ensureFavorites(){ if(!Array.isArray(db.favorites)) db.favorites=[]; return db.favorites; }
  function isFavorite(id){ const u=currentUser(); return !!(u && ensureFavorites().some(x=>x.userId===u.id && String(x.productId)===String(id))); }

  window.toggleFavorite=function(id,ev){
    if(ev){ ev.preventDefault(); ev.stopPropagation(); }
    const u=currentUser();
    if(!u){ toast('Log in to add favorites'); if(typeof setAuthMode==='function')setAuthMode('login'); if(typeof go==='function')go('auth'); return; }
    const list=ensureFavorites();
    const idx=list.findIndex(x=>x.userId===u.id && String(x.productId)===String(id));
    if(idx>=0){ list.splice(idx,1); toast('Removed from favorites'); }
    else { list.push({id:uid('fav'),userId:u.id,productId:id,createdAt:Date.now()}); toast('Added to favorites'); }
    save();
    const btn=document.querySelector('.favorite-heart[data-product-id="'+CSS.escape(String(id))+'"]');
    if(btn){ const on=isFavorite(id); btn.classList.toggle('active',on); btn.textContent=on?'♥':'♡'; btn.setAttribute('aria-label',on?'Remove from favorites':'Add to favorites'); }
    if(document.getElementById('profile')?.classList.contains('active')) renderProfile();
  };

  // Add the heart control to the existing product-details header without replacing
  // the established product-detail/history implementation.
  const oldShowProductDetail=window.showProductDetail;
  if(oldShowProductDetail){
    window.showProductDetail=function(id,noHistory){
      const result=oldShowProductDetail.apply(this,arguments);
      setTimeout(function(){
        const el=document.getElementById('productDetail');
        if(!el)return;
        const head=el.querySelector('.page-head');
        if(!head || head.querySelector('.favorite-heart'))return;
        const p=(db.products||[]).find(x=>String(x.id)===String(id)); if(!p)return;
        const btn=document.createElement('button');
        btn.type='button'; btn.className='favorite-heart'+(isFavorite(id)?' active':'');
        btn.dataset.productId=String(id);
        btn.textContent=isFavorite(id)?'♥':'♡';
        btn.setAttribute('aria-label',isFavorite(id)?'Remove from favorites':'Add to favorites');
        btn.title=isFavorite(id)?'Remove from favorites':'Add to favorites';
        btn.onclick=function(e){window.toggleFavorite(id,e)};
        head.appendChild(btn);
      },0);
      return result;
    };
  }

  // Favorites live behind a single option inside Buyer Profile. They are not shown openly on Profile.
  window.renderFavorites=function(){
    const u=currentUser();
    if(!u || u.role==='seller'){ toast('Buyer account required'); return; }
    let el=document.getElementById('favorites');
    if(!el){
      el=document.createElement('section');
      el.id='favorites';
      el.className='screen';
      const app=document.querySelector('main') || document.querySelector('#app') || document.body;
      app.appendChild(el);
    }
    const list=ensureFavorites().filter(x=>x.userId===u.id);
    const products=list.map(x=>(db.products||[]).find(p=>String(p.id)===String(x.productId))).filter(Boolean);
    el.innerHTML='<div class="section-head"><h2>Favorites</h2><span class="status">'+products.length+'</span></div>'+
      '<div class="muted" style="margin-bottom:14px">Your saved products</div>'+
      (products.length ? products.map(p=>{
        const b=(db.businesses||[]).find(x=>x.id===p.businessId);
        const img=(typeof productImages==='function'?productImages(p):(p.images?.length?p.images:(p.image?[p.image]:[])))[0];
        return '<div class="card favorite-product-row" data-fav-row="'+esc(p.id)+'">'+
          (img?'<img class="favorite-product-thumb" src="'+esc(img)+'" alt="">':'<div class="favorite-product-thumb" style="display:grid;place-items:center">♡</div>')+
          '<div style="min-width:0;flex:1"><b>'+esc(p.name)+'</b><div class="muted">'+esc(b?.name||'Business')+' · ₹'+Number(p.discountPrice||p.price||0).toLocaleString('en-IN')+'</div></div>'+
          '<button type="button" class="btn secondary" onclick="showProductDetail(\''+esc(p.id)+'\')">VIEW</button>'+
          '<button type="button" class="btn secondary" onclick="toggleFavorite(\''+esc(p.id)+'\',event)">REMOVE</button>'+
        '</div>';
      }).join(''):'<div class="empty card">No favorite products yet. Tap the ♡ on a product to save it here.</div>');
    document.querySelectorAll('.screen').forEach(x=>x.classList.remove('active'));
    el.classList.add('active');
    document.querySelectorAll('.bottom-nav button').forEach(b=>b.classList.remove('active'));
    scrollTo({top:0,behavior:'auto'});
  };

  const oldRenderProfile=window.renderProfile;
  if(oldRenderProfile){
    window.renderProfile=function(){
      const result=oldRenderProfile.apply(this,arguments);
      const u=currentUser();
      const el=document.getElementById('profileContent');
      if(!el || !u || u.role==='seller')return result;
      const oldCard=document.getElementById('profileFavoritesCard');
      if(oldCard)oldCard.remove();
      const count=ensureFavorites().filter(x=>x.userId===u.id).length;
      const option=document.createElement('button');
      option.type='button';
      option.id='profileFavoritesOption';
      option.className='card';
      option.style.cssText='width:100%;text-align:left;display:flex;align-items:center;gap:14px;cursor:pointer;margin-top:12px';
      option.innerHTML='<span style="font-size:26px">♥</span><span style="flex:1"><b>Favorites</b><small class="muted" style="display:block">Your saved products</small></span><span class="status">'+count+'</span><span style="font-size:22px">›</span>';
      option.onclick=function(){ renderFavorites(); go('favorites'); };
      el.appendChild(option);
      return result;
    };
  }

  // Migrate any older favorites shape if one exists, then persist the new model.
  if(!Array.isArray(db.favorites)) db.favorites=[];
  db.favorites=db.favorites.map(x=>{
    if(typeof x==='string') return {id:uid('fav'),userId:db.session,productId:x,createdAt:Date.now()};
    return x;
  }).filter(x=>x&&x.userId&&x.productId);
  try{save();}catch(e){}
})();



/* ===== legacy script 56 ===== */

(function(){
  const cleanSaved=()=>document.querySelectorAll('#buyerNav button[data-screen="saved"],#saved,.saved-page').forEach(el=>el.remove());
  cleanSaved();
  setTimeout(cleanSaved,0);
})();



/* ===== legacy script 57 ===== */

(function(){
  'use strict';
  const sellerAccount = ()=>{ const u=typeof user==='function'?user():null; return u&&u.role==='seller'?u:null; };
  const ownedBusinesses = ()=>{ const u=sellerAccount(); return u?(db.businesses||[]).filter(b=>b.ownerId===u.id):[]; };

  // 1) Seller login must always land on the seller dashboard, regardless of
  // older navigation overrides loaded earlier in this prototype.
  window.loginAccount=function(){
    const contact=document.getElementById('loginContact')?.value.trim()||'';
    const password=document.getElementById('loginPassword')?.value||'';
    if(!contact)return toast('Enter your phone or email');
    if(!password)return toast('Enter your password');
    const u=(db.users||[]).find(x=>String(x.contact).toLowerCase()===contact.toLowerCase());
    if(!u)return toast('Account not found. Please sign up first.');
    if(u.password && u.password!==password)return toast('Incorrect password');
    db.session=u.id;
    save();
    if(u.role==='seller'){
      const bs=ownedBusinesses();
      currentBusiness=bs[0]?.id||null;
      try{ if(typeof sellerSelectedBusiness!=='undefined') sellerSelectedBusiness=currentBusiness; }catch(e){}
      try{ if(typeof sellerSection!=='undefined') sellerSection='dashboard'; }catch(e){}
      try{ if(typeof sellerTabName!=='undefined') sellerTabName='dashboard'; }catch(e){}
      try{ if(typeof tab!=='undefined') tab='dashboard'; }catch(e){}
      document.body.classList.add('seller-mode');
      const buyerNav=document.querySelector('.buyer-nav'); if(buyerNav)buyerNav.style.display='none';
      const sellerNav=document.getElementById('sellerNav'); if(sellerNav)sellerNav.style.display='grid';
      const sellerDashNav=document.getElementById('sellerDashNav'); if(sellerDashNav)sellerDashNav.style.display='grid';
      try{ if(typeof setSellerNav==='function') setSellerNav(); }catch(e){}
      // Do not rely on go() wrappers: explicitly activate the seller screen.
      document.querySelectorAll('.screen').forEach(x=>x.classList.remove('active'));
      const sellerScreen=document.getElementById('seller'); if(sellerScreen)sellerScreen.classList.add('active');
      try{ history.replaceState({screen:'seller'},'',location.pathname+'#seller'); }catch(e){}
      scrollTo({top:0,behavior:'auto'});
      try{ if(typeof window.sellerTab==='function') window.sellerTab('dashboard'); }
      catch(e){ try{ if(typeof window.renderSeller==='function') window.renderSeller(); }catch(_){} }
      toast('Logged in as seller');
      return;
    }
    document.body.classList.remove('seller-mode');
    const buyerNav=document.querySelector('.buyer-nav'); if(buyerNav)buyerNav.style.display='grid';
    renderProfile();go('home');toast('Logged in successfully');
  };

  // 2) Deleting a product must keep the seller on the Businesses screen,
  // not jump to the dashboard. Refresh immediately.
  window.deleteProduct=function(id){
    const p=(db.products||[]).find(x=>x.id===id); if(!p)return;
    const u=sellerAccount(); const b=(db.businesses||[]).find(x=>x.id===p.businessId);
    if(!u||!b||b.ownerId!==u.id)return toast('You can only delete your own products');
    if(!confirm(`Delete "${p.name}"? This cannot be undone.`))return;
    const bid=p.businessId;
    db.products=(db.products||[]).filter(x=>x.id!==id);
    db.cart=(db.cart||[]).filter(i=>i.productId!==id);
    save();
    currentBusiness=bid;
    try{closeModal();}catch(e){}
    try{window.sellerTab('businesses');}catch(e){try{window.renderSellerBusinesses();}catch(_){} }
    toast('Product deleted');
  };

  // 3/4) Deleting a business updates every relevant view immediately and
  // removes it from the public home list without requiring navigation.
  window.deleteBusiness=function(id){
    const u=sellerAccount(); const b=(db.businesses||[]).find(x=>x.id===id);
    if(!u||!b||b.ownerId!==u.id)return toast('You can only delete your own business');
    if(!confirm(`Delete "${b.name}" and all its products, services and reservations? This cannot be undone.`))return;
    const pids=new Set((db.products||[]).filter(p=>p.businessId===id).map(p=>p.id));
    db.products=(db.products||[]).filter(p=>p.businessId!==id);
    db.services=(db.services||[]).filter(s=>s.businessId!==id);
    db.reservations=(db.reservations||[]).filter(r=>r.businessId!==id);
    db.businesses=(db.businesses||[]).filter(x=>x.id!==id);
    db.cart=(db.cart||[]).filter(i=>!pids.has(i.productId));
    if(currentBusiness===id) currentBusiness=ownedBusinesses()[0]?.id||null;
    try{if(typeof sellerSelectedBusiness!=='undefined')sellerSelectedBusiness=currentBusiness;}catch(e){}
    save();
    try{homeBusinesses();}catch(e){}
    // Immediately repaint seller businesses/dashboard.
    try{window.sellerTab('businesses');}catch(e){try{window.renderSellerBusinesses();}catch(_){} }
    // Also refresh any visible public business sections.
    try{renderProfile();}catch(e){}
    toast('Business deleted');
  };

  // Dedicated business-photo reader. It deliberately uses the same object-URL
  // path that Android's <img> preview successfully uses, then rasterizes the
  // image into a compact JPEG. It NEVER calls fetch() on the Android file URL.
  async function readBusinessPhoto(input, maxSize, kind){
    const file=input?.files?.[0];
    if(!file) return '';
    if(file.size>20*1024*1024) throw new Error('Image must be under 20 MB');

    // IMPORTANT: Android can preview some logo files through its content
    // provider but fail when that same file is decoded through Image/ObjectURL.
    // For the business LOGO, preserve the selected file bytes directly.
    // This is the same representation the browser can already display in the
    // upload preview, so there is no second decode step to fail.
    if(kind==='logo'){
      return await new Promise((resolve,reject)=>{
        const r=new FileReader();
        r.onload=()=>{
          const data=String(r.result||'');
          if(data) resolve(data); else reject(new Error('Could not read logo. Please choose the photo again.'));
        };
        r.onerror=()=>reject(new Error('Could not read logo. Please choose the photo again.'));
        try{r.readAsDataURL(file);}catch(e){reject(new Error('Could not read logo. Please choose the photo again.'));}
      });
    }

    // Cover images keep the existing resize path, which is already working on
    // the user's device.
    const url=URL.createObjectURL(file);
    try{
      const img=await new Promise((resolve,reject)=>{
        const im=new Image();
        im.onload=()=>resolve(im);
        im.onerror=()=>reject(new Error('Could not decode selected cover photo. Please choose it again.'));
        im.src=url;
      });
      const w=img.naturalWidth||img.width, h=img.naturalHeight||img.height;
      if(!w||!h) throw new Error('Could not decode selected cover photo. Please choose it again.');
      const scale=Math.min(1,maxSize/Math.max(w,h));
      const canvas=document.createElement('canvas');
      canvas.width=Math.max(1,Math.round(w*scale));
      canvas.height=Math.max(1,Math.round(h*scale));
      const ctx=canvas.getContext('2d');
      if(!ctx) throw new Error('Could not process selected cover photo');
      ctx.drawImage(img,0,0,canvas.width,canvas.height);
      const data=canvas.toDataURL('image/jpeg',.78);
      if(!data || data.length<100) throw new Error('Could not process selected cover photo');
      return data;
    }finally{ try{URL.revokeObjectURL(url);}catch(e){} }
  }

  // Keep this helper private to the business editor; do not route these two
  // fields through the global multi-product image reader.
  window.readBusinessPhoto = readBusinessPhoto;

  // 5) One authoritative business editor save. This avoids the older duplicate
  // saveBusinessProfile implementations and saves text + optional photos.
  window.saveBusinessProfile=async function(id){
    const u=sellerAccount();
    const b=(db.businesses||[]).find(x=>x.id===id&&x.ownerId===u?.id);
    if(!u||!b)return toast('You can only edit your own business');
    const val=k=>document.getElementById(k)?.value?.trim()||'';
    const old=JSON.parse(JSON.stringify(b));
    const catId=document.getElementById('ebc')?.value||b.categoryId||'';
    const cat=(db.categories||[]).find(c=>c.id===catId);
    b.name=val('ebn')||b.name;
    b.ownerName=val('ebo')||u.name;
    b.phone=val('ebp')||u.contact;
    b.categoryId=catId||b.categoryId||'';
    b.category=cat?.name||b.category||'Local Business';
    b.address=val('eba')||b.address||'Local address';
    b.locality=val('ebl')||b.locality||'Nearby';
    b.hours=val('ebhours')||b.hours||'Opening hours not provided';
    b.delivery=document.getElementById('ebd')?.value==='yes';
    b.paymentPolicy=document.getElementById('ebpay')?.value||b.paymentPolicy||'Pay at store';
    try{
      const logoInput=document.getElementById('ebLogoFile');
      const coverInput=document.getElementById('ebCoverFile');
      if(logoInput?.files?.length){ b.logo=await window.readBusinessPhoto(logoInput,700,'logo'); }
      if(coverInput?.files?.length){ b.cover=await window.readBusinessPhoto(coverInput,1200,'cover'); }
    }catch(e){ Object.assign(b,old); return toast(e.message||'Could not read business photo'); }
    (db.products||[]).filter(p=>p.businessId===b.id).forEach(p=>{ if(b.categoryId)p.categoryId=b.categoryId; });
    if(!save()){
      Object.assign(b,old);
      return toast('Could not save business changes. Storage may be full.');
    }
    currentBusiness=b.id;
    try{if(typeof sellerSelectedBusiness!=='undefined')sellerSelectedBusiness=b.id;}catch(e){}
    try{closeModal();}catch(e){}
    try{homeBusinesses();}catch(e){}
    try{window.sellerTab('businesses');}catch(e){try{window.renderSellerBusinesses();}catch(_){} }
    toast('Business details updated');
  };

  // Remove stale public business cards immediately whenever storage changes.
  window.addEventListener('storage',function(){try{homeBusinesses();}catch(e){}});
})();



/* ===== legacy script 58 ===== */

(function(){
  'use strict';

  function normalizedRole(u){ return String(u?.role||'').trim().toLowerCase(); }
  function sellerUser(){
    const u=(db.users||[]).find(x=>x.id===db.session)||null;
    return u && normalizedRole(u)==='seller' ? u : null;
  }

  // Seller login: do not call the generic buyer navigation at all.  Some of the
  // older prototype navigation layers can otherwise immediately switch back to home.
  window.loginAccount=function(){
    const contact=document.getElementById('loginContact')?.value.trim()||'';
    const password=document.getElementById('loginPassword')?.value||'';
    if(!contact)return toast('Enter your phone or email');
    if(!password)return toast('Enter your password');
    const u=(db.users||[]).find(x=>String(x.contact||'').toLowerCase()===contact.toLowerCase());
    if(!u)return toast('Account not found. Please sign up first.');
    if(u.password && u.password!==password)return toast('Incorrect password');

    // Repair legacy role values such as SELLER / Seller.
    if(normalizedRole(u)==='seller')u.role='seller';
    else if(normalizedRole(u)==='buyer')u.role='buyer';
    db.session=u.id;
    save();

    if(normalizedRole(u)==='seller'){
      const bs=(db.businesses||[]).filter(b=>b.ownerId===u.id);
      currentBusiness=bs[0]?.id||null;
      try{ if(typeof sellerSelectedBusiness!=='undefined')sellerSelectedBusiness=currentBusiness; }catch(e){}
      try{ if(typeof sellerSection!=='undefined')sellerSection='dashboard'; }catch(e){}
      try{ if(typeof sellerTabName!=='undefined')sellerTabName='dashboard'; }catch(e){}
      try{ if(typeof tab!=='undefined')tab='dashboard'; }catch(e){}
      document.body.classList.add('seller-mode');
      document.querySelectorAll('.buyer-nav').forEach(n=>n.style.display='none');
      const sn=document.getElementById('sellerNav'); if(sn)sn.style.display='grid';
      const sd=document.getElementById('sellerDashNav'); if(sd)sd.style.display='grid';
      document.querySelectorAll('.screen').forEach(x=>x.classList.remove('active'));
      const sellerScreen=document.getElementById('seller'); if(sellerScreen)sellerScreen.classList.add('active');
      try{history.replaceState({screen:'seller'},'',location.pathname+'#seller');}catch(e){}
      try{scrollTo({top:0,left:0,behavior:'auto'});}catch(e){}
      // Render dashboard directly; don't use go('home') or an older sellerTab wrapper.
      try{
        if(typeof window.renderSellerDashboard==='function')window.renderSellerDashboard();
        else if(typeof window.renderSeller==='function')window.renderSeller();
        else if(typeof window.renderSellerTab==='function')window.renderSellerTab();
      }catch(e){
        try{if(typeof window.renderSeller==='function')window.renderSeller();}catch(_){}
      }
      // Final guard against any delayed legacy navigation override.
      setTimeout(function(){
        if(normalizedRole(user())!=='seller')return;
        document.body.classList.add('seller-mode');
        document.querySelectorAll('.buyer-nav').forEach(n=>n.style.display='none');
        document.querySelectorAll('.screen').forEach(x=>x.classList.remove('active'));
        const ss=document.getElementById('seller'); if(ss)ss.classList.add('active');
        try{if(typeof window.renderSellerDashboard==='function')window.renderSellerDashboard();}catch(e){}
      },60);
      toast('Logged in as seller');
      return;
    }

    document.body.classList.remove('seller-mode');
    document.querySelectorAll('.buyer-nav').forEach(n=>n.style.display='grid');
    try{renderProfile();go('home');}catch(e){}
    toast('Logged in successfully');
  };

  // Cart-first buyer flow: browsing a product never creates a order.
  // It only adds the requested quantity to the cart. Reservation happens later
  // from the Cart screen via ORDER NOW.
  window.detailReserve=function(id){
    const u=typeof requireBuyer==='function'?requireBuyer():user();
    if(!u)return;
    if(normalizedRole(u)!=='buyer')return toast('Buyer account required');
    const p=(db.products||[]).find(x=>String(x.id)===String(id));
    if(!p)return toast('Product not found');
    const input=document.getElementById('v24DetailQty')||document.getElementById('detailQty');
    const qty=Math.max(1,Number(input?.value||1));
    const available=typeof availableStock==='function'?availableStock(p):Math.max(0,Number(p.stock||0)-Number(p.reserved||0));
    const existing=(db.cart||[]).find(x=>x.productId===id);
    const target=(existing?.qty||0)+qty;
    if(available<target)return toast('Only '+available+' available');
    if(existing)existing.qty=target;
    else db.cart.push({productId:id,qty,method:null});
    save();
    toast('Added to cart');
    // Stay on the product page. The customer can open Cart from the bottom nav
    // and reserve the products there.
  };

  // Final product-card click guard: dynamically rendered cards may carry IDs as strings
  // while stored products may use non-string IDs. Always normalize before opening details.
  document.addEventListener('click', function(e){
    const card=e.target.closest && e.target.closest('.product-card[onclick*="showProductDetail"]');
    if(!card || e.target.closest('button,a,input,select,textarea')) return;
    const m=card.getAttribute('onclick')?.match(/showProductDetail\(['\"]([^'\"]+)['\"]\)/);
    if(!m) return;
    e.preventDefault();
    e.stopPropagation();
    window.showProductDetail(String(m[1]));
  }, true);

  // Replace any remaining visible browsing labels from older rendered cards.
  function relabelBrowseButtons(){
    document.querySelectorAll('.product-card button').forEach(btn=>{
      if(/reserve/i.test(btn.textContent||''))btn.textContent='+ ADD TO CART';
    });
  }
  window.addEventListener('load',()=>setTimeout(relabelBrowseButtons,50));
})();



/* ===== legacy script 59 ===== */

(function(){
  'use strict';
  const money=n=>'₹'+Number(n||0).toLocaleString('en-IN');
  const dayStart=t=>{const d=new Date(t||Date.now());d.setHours(0,0,0,0);return d.getTime();};
  const sellerNow=()=>{try{return typeof user==='function'?user():null}catch(e){return null}};
  const owned=()=>{const u=sellerNow();return u&&String(u.role).toLowerCase()==='seller'?(db.businesses||[]).filter(b=>b.ownerId===u.id):[]};
  const current=()=>{const bs=owned();if(!bs.length){currentBusiness=null;return null}if(!currentBusiness||!bs.some(b=>b.id===currentBusiness))currentBusiness=bs[0].id;return bs.find(b=>b.id===currentBusiness)||bs[0]};
  const productImg=p=>p?.image||(Array.isArray(p?.images)?p.images[0]:'')||'';
  const completedStatus=s=>['COLLECTED','DELIVERED','COMPLETED'].includes(String(s||'').toUpperCase());
  const validStatus=s=>!['REJECTED','CANCELLED','EXPIRED'].includes(String(s||'').toUpperCase());

  function stats(b){
    const products=(db.products||[]).filter(p=>p.businessId===b.id);
    const orders=(db.reservations||[]).filter(r=>r.businessId===b.id);
    const completed=orders.filter(r=>completedStatus(r.status));
    const revenue=completed.reduce((n,r)=>n+Number(r.total||0),0);
    const today=dayStart();
    const week=today-6*86400000;
    const month=new Date();month.setDate(1);month.setHours(0,0,0,0);
    const salesToday=completed.filter(r=>Number(r.createdAt||0)>=today).reduce((n,r)=>n+Number(r.total||0),0);
    const salesWeek=completed.filter(r=>Number(r.createdAt||0)>=week).reduce((n,r)=>n+Number(r.total||0),0);
    const salesMonth=completed.filter(r=>Number(r.createdAt||0)>=month.getTime()).reduce((n,r)=>n+Number(r.total||0),0);
    const active=orders.filter(r=>validStatus(r.status)&&!completedStatus(r.status));
    const low=products.filter(p=>Number(p.stock||0)-Number(p.reserved||0)<=5&&Number(p.stock||0)-Number(p.reserved||0)>0);
    const out=products.filter(p=>Number(p.stock||0)-Number(p.reserved||0)<=0);
    const stock=products.reduce((n,p)=>n+Math.max(0,Number(p.stock||0)-Number(p.reserved||0)),0);
    const stockValue=products.reduce((n,p)=>n+Math.max(0,Number(p.stock||0)-Number(p.reserved||0))*Number(p.discountPrice||p.price||0),0);
    const customers=[...new Set(orders.map(r=>r.userId).filter(Boolean))];
    const newCustomers=[...new Set(orders.filter(r=>Number(r.createdAt||0)>=Date.now()-30*86400000).map(r=>r.userId).filter(Boolean))];
    const counts={};orders.forEach(r=>{const s=String(r.status||'RESERVED');counts[s]=(counts[s]||0)+1});
    const units={};
    completed.forEach(r=>(r.items||[]).forEach(i=>{const id=i.productId||i.id||i.name;units[id]=(units[id]||0)+Number(i.qty||0)}));
    const perf=products.map(p=>{
      const sold=units[p.id]||0;
      const revenueP=completed.reduce((n,r)=>n+(r.items||[]).filter(i=>i.productId===p.id).reduce((x,i)=>x+Number(i.qty||0)*Number(i.price||p.discountPrice||p.price||0),0),0);
      const fav=(db.favorites||[]).filter(f=>f.productId===p.id).length;
      return {p,sold,revenue:revenueP,fav,available:Math.max(0,Number(p.stock||0)-Number(p.reserved||0))};
    }).sort((a,z)=>z.sold-a.sold||z.revenue-a.revenue);
    return {products,orders,completed,revenue,salesToday,salesWeek,salesMonth,active,low,out,stock,stockValue,customers,newCustomers,counts,perf};
  }

  function salesChart(completed){
    const now=dayStart();const days=[];
    for(let i=6;i>=0;i--){const start=now-i*86400000;days.push({start,end:start+86400000-1,label:new Date(start).toLocaleDateString('en-IN',{weekday:'short'}),value:0})}
    completed.forEach(r=>{const t=dayStart(r.createdAt);const d=days.find(x=>x.start===t);if(d)d.value+=Number(r.total||0)});
    const max=Math.max(1,...days.map(d=>d.value));
    return `<div class="sa-chart">${days.map(d=>`<div class="sa-bar-wrap"><span class="sa-bar-value">${d.value?money(d.value):''}</span><div class="sa-bar" style="height:${Math.max(2,Math.round(d.value/max*105))}px"></div><span class="sa-bar-label">${d.label}</span></div>`).join('')}</div>`;
  }

  function statusRows(s){
    const order=['RESERVED','CONFIRMED','PREPARING','READY FOR PICKUP','OUT FOR DELIVERY','COLLECTED','DELIVERED','REJECTED','CANCELLED','EXPIRED'];
    const labels={'RESERVED':'Pending','CONFIRMED':'Accepted','PREPARING':'Preparing','READY FOR PICKUP':'Ready','OUT FOR DELIVERY':'Out for delivery','COLLECTED':'Completed','DELIVERED':'Delivered','REJECTED':'Rejected','CANCELLED':'Cancelled','EXPIRED':'Expired'};
    return order.map(k=>`<div class="sa-row"><span>${labels[k]}</span><b>${s.counts[k]||0}</b></div>`).join('');
  }

  function trendRows(perf){
    const now=Date.now(),recentStart=now-7*86400000,prevStart=now-14*86400000;
    const rows=perf.map(x=>{
      let recent=0,prev=0;
      (x.p? (db.reservations||[]).filter(r=>r.businessId===current()?.id&&completedStatus(r.status)):[]).forEach(r=>(r.items||[]).forEach(i=>{if(i.productId!==x.p.id)return;const t=Number(r.createdAt||0);if(t>=recentStart)recent+=Number(i.qty||0);else if(t>=prevStart)prev+=Number(i.qty||0)}));
      return {...x,recent,prev,delta:recent-prev};
    }).filter(x=>x.recent||x.prev).sort((a,z)=>z.delta-a.delta||z.recent-a.recent).slice(0,5);
    return rows.map(x=>`<div class="sa-row"><div class="sa-product"><img class="sa-thumb" src="${esc(productImg(x.p))}" onerror="this.style.display='none'" alt=""><div class="sa-product-main"><b>${esc(x.p.name||'Product')}</b><span>${x.recent} sold this week · ${x.delta>=0?'+':''}${x.delta} vs prior week</span></div></div><b>${x.delta>=0?'↑':'↓'}</b></div>`).join('')||'<div class="muted">Not enough recent sales data yet.</div>';
  }

  function renderRichDashboard(){
    const el=document.getElementById('sellerContent');if(!el)return;
    const bs=owned(),b=current();
    if(!b){el.innerHTML='<div class="page-head"><div class="page-title">DASHBOARD</div></div><div class="empty"><strong>No business yet</strong><div style="margin-top:8px">Create a business to start receiving orders and analytics.</div><button class="btn primary full" style="margin-top:12px" onclick="sellerTab(\'businesses\')">CREATE BUSINESS</button></div>';return}
    const s=stats(b);
    const favTotal=s.products.reduce((n,p)=>n+(db.favorites||[]).filter(f=>f.productId===p.id).length,0);
    const avg=s.completed.length?s.revenue/s.completed.length:0;
    const top=s.perf.slice(0,5);
    const alerts=[];
    if(s.orders.filter(r=>['RESERVED','AWAITING CUSTOMER OTP','RESERVED — WAITING FOR SELLER CONFIRMATION'].includes(String(r.status||''))).length)alerts.push({c:'danger',t:'New orders waiting for action',v:s.orders.filter(r=>['RESERVED','AWAITING CUSTOMER OTP','RESERVED — WAITING FOR SELLER CONFIRMATION'].includes(String(r.status||''))).length,go:'reservations'});
    if(s.low.length)alerts.push({c:'warn',t:'Products running low',v:s.low.length,go:'businesses'});
    if(s.out.length)alerts.push({c:'danger',t:'Products out of stock',v:s.out.length,go:'businesses'});
    if(!alerts.length)alerts.push({c:'',t:'Everything looks good',v:'✓',go:''});
    el.innerHTML=`<div class="seller-analytics">
      <div class="page-head"><div><div class="page-title">DASHBOARD</div><div class="muted">Business performance & insights</div></div></div>
      <div class="field"><label>SELECT BUSINESS</label><select class="seller-select" onchange="currentBusiness=this.value;window.renderSellerDashboard()">${bs.map(x=>`<option value="${esc(x.id)}" ${x.id===b.id?'selected':''}>${esc(x.name)}</option>`).join('')}</select></div>
      <div class="sa-card"><div class="row"><div><h2 style="margin:0">${esc(b.name)}</h2><div class="muted">${esc(b.locality||b.address||'')}</div></div><span class="status">${b.delivery?'DELIVERY + PICKUP':'SELF PICKUP'}</span></div></div>
      <div class="sa-grid">
        <div class="sa-card sa-stat"><b>${money(s.salesToday)}</b><span>TODAY'S SALES</span></div>
        <div class="sa-card sa-stat"><b>${money(s.salesWeek)}</b><span>THIS WEEK</span></div>
        <div class="sa-card sa-stat"><b>${money(s.salesMonth)}</b><span>THIS MONTH</span></div>
        <div class="sa-card sa-stat"><b>${money(s.revenue)}</b><span>TOTAL SALES</span></div>
      </div>
      <div class="sa-grid">
        <div class="sa-card sa-stat"><b>${s.orders.length}</b><span>TOTAL ORDERS</span></div>
        <div class="sa-card sa-stat"><b>${s.active.length}</b><span>ACTIVE ORDERS</span></div>
        <div class="sa-card sa-stat"><b>${s.products.length}</b><span>PRODUCTS</span></div>
        <div class="sa-card sa-stat"><b>${s.stock}</b><span>AVAILABLE UNITS</span></div>
      </div>
      <div class="sa-grid">
        <div class="sa-card sa-stat"><b>${s.low.length}</b><span>LOW STOCK</span></div>
        <div class="sa-card sa-stat"><b>${s.out.length}</b><span>OUT OF STOCK</span></div>
        <div class="sa-card sa-stat"><b>${s.customers.length}</b><span>CUSTOMERS</span></div>
        <div class="sa-card sa-stat"><b>${money(avg)}</b><span>AVG ORDER VALUE</span></div>
      </div>
      <div class="sa-card"><h3>📈 SALES — LAST 7 DAYS</h3>${salesChart(s.completed)}<div class="sa-mini">Completed orders only · Total inventory value: ${money(s.stockValue)}</div></div>
      <div class="sa-card"><div class="row"><h3>🏆 MOST-SELLING PRODUCTS</h3><span class="sa-mini">Units sold</span></div>${top.length?top.map((x,i)=>`<div class="sa-row"><div class="sa-product"><span class="sa-rank">${i+1}</span><img class="sa-thumb" src="${esc(productImg(x.p))}" onerror="this.style.display='none'" alt=""><div class="sa-product-main"><b>${esc(x.p.name||'Product')}</b><span>${x.sold} sold · ${money(x.revenue)}</span></div></div><b>${x.sold}</b></div>`).join(''):'<div class="muted">No completed sales yet.</div>'}</div>
      <div class="sa-card"><h3>📦 INVENTORY INSIGHTS</h3><div class="sa-row"><span>Available stock</span><b>${s.stock} units</b></div><div class="sa-row"><span>Reserved stock</span><b>${s.products.reduce((n,p)=>n+Number(p.reserved||0),0)} units</b></div><div class="sa-row"><span>Stock value</span><b>${money(s.stockValue)}</b></div><div class="sa-row"><span>Low-stock products</span><b>${s.low.length}</b></div><div class="sa-row"><span>Out-of-stock products</span><b>${s.out.length}</b></div></div>
      <div class="sa-card"><div class="row"><h3>🛒 ORDER STATUS</h3><span class="sa-mini">${s.orders.length} total</span></div>${statusRows(s)}</div>
      <div class="sa-card"><h3>🔥 TRENDING PRODUCTS</h3>${trendRows(s.perf)}</div>
      <div class="sa-card"><h3>👥 CUSTOMER INSIGHTS</h3><div class="sa-row"><span>Total customers</span><b>${s.customers.length}</b></div><div class="sa-row"><span>New customers (30 days)</span><b>${s.newCustomers.length}</b></div><div class="sa-row"><span>Returning customers</span><b>${Math.max(0,s.customers.length-s.newCustomers.length)}</b></div><div class="sa-row"><span>Favorite actions on products</span><b>${favTotal}</b></div></div>
      <div class="sa-card"><h3>⭐ PRODUCT PERFORMANCE</h3>${s.perf.slice(0,8).map(x=>`<div class="sa-row"><div class="sa-product"><img class="sa-thumb" src="${esc(productImg(x.p))}" onerror="this.style.display='none'" alt=""><div class="sa-product-main"><b>${esc(x.p.name||'Product')}</b><span>${x.sold} sold · ${money(x.revenue)} revenue · ${x.fav} favorites</span></div></div><span class="sa-mini">${x.available} left</span></div>`).join('')||'<div class="muted">No products yet.</div>'}</div>
      <div class="sa-card"><h3>🔔 IMPORTANT ALERTS</h3>${alerts.map(a=>`<div class="sa-card sa-alert ${a.c}" style="margin-top:8px"><div class="row"><span>${esc(a.t)}</span><b>${esc(a.v)}</b></div>${a.go?`<button class="btn secondary full" style="margin-top:8px" onclick="sellerTab('${a.go}')">VIEW</button>`:''}</div>`).join('')}</div>
      <div class="sa-grid"><button class="btn primary" onclick="sellerTab('reservations')">VIEW ORDERS</button><button class="btn secondary" onclick="openSellerFullAnalytics()">VIEW FULL ANALYTICS</button></div>
    </div>`;
  }

  window.renderSellerDashboard=renderRichDashboard;
  window.openSellerFullAnalytics=function(){
    const b=current();if(!b)return;
    const s=stats(b);
    const top=s.perf.slice(0,10);
    openModal(`<button class="close" onclick="closeModal()">×</button><h2>FULL ANALYTICS</h2><p class="muted">${esc(b.name)}</p><div class="dashboard-stats"><div class="stat-card"><b>${money(s.revenue)}</b><span>TOTAL SALES</span></div><div class="stat-card"><b>${s.completed.length}</b><span>COMPLETED ORDERS</span></div><div class="stat-card"><b>${s.customers.length}</b><span>CUSTOMERS</span></div><div class="stat-card"><b>${s.products.length}</b><span>PRODUCTS</span></div></div><h3 style="margin-top:18px">Top product performance</h3>${top.map((x,i)=>`<div class="row" style="padding:10px 0;border-bottom:1px solid #292a2f"><span><b>#${i+1} ${esc(x.p.name||'Product')}</b><br><span class="muted">${x.sold} sold · ${x.fav} favorites · ${x.available} available</span></span><b>${money(x.revenue)}</b></div>`).join('')||'<div class="empty">No sales data yet.</div>'}<button class="btn primary full" style="margin-top:16px" onclick="closeModal();sellerTab('reservations')">GO TO ORDERS</button>`);
  };

  // Make dashboard rendering authoritative while preserving all other seller tabs.
  const previousSellerTab=window.sellerTab;
  window.sellerTab=function(tab){
    if(tab==='dashboard'){
      const u=sellerNow();if(!u||String(u.role).toLowerCase()!=='seller'){toast('Seller account required');return}
      document.body.classList.add('seller-mode');document.querySelectorAll('.buyer-nav').forEach(n=>n.style.display='none');
      const sn=document.getElementById('sellerNav');if(sn)sn.style.display='grid';
      document.querySelectorAll('.screen').forEach(x=>x.classList.remove('active'));const ss=document.getElementById('seller');if(ss)ss.classList.add('active');
      document.querySelectorAll('#sellerNav button').forEach(x=>x.classList.toggle('active',x.dataset.sellerTab==='dashboard'));
      try{history.replaceState({screen:'seller'},'',location.pathname+'#seller');}catch(e){}
      renderRichDashboard();try{scrollTo({top:0,behavior:'auto'})}catch(e){}
      return;
    }
    return previousSellerTab.apply(this,arguments);
  };

  // If a seller is already logged in and the seller screen is active, repaint the richer dashboard.
  setTimeout(()=>{try{const u=sellerNow();if(u&&String(u.role).toLowerCase()==='seller'&&document.getElementById('seller')?.classList.contains('active'))renderRichDashboard()}catch(e){}},0);
})();



/* ===== legacy script 60 ===== */

/* v43: Preserve buyer browse history: Products -> Business -> Categories */
(function(){
  function xe(v){return String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));}
  function businessProductsFor(categoryId,businessId){
    return (db.products||[]).filter(p=>{
      if(categoryId&&p.categoryId!==categoryId)return false;
      if(businessId&&p.businessId!==businessId)return false;
      const b=(db.businesses||[]).find(x=>x.id===p.businessId);
      return !!b && (typeof locationMatchesBusiness==='function'?locationMatchesBusiness(b):true);
    });
  }
  function renderBusinessListView(categoryId){
    const c=db.categories.find(x=>x.id===categoryId); if(!c)return;
    currentCategory=categoryId; currentType='products'; currentBusiness=null;
    document.getElementById('productsTitle').textContent=c.name.toUpperCase();
    document.getElementById('productSearch').value='';
    document.getElementById('businessFilter').innerHTML='';
    const products=businessProductsFor(categoryId,null);
    const ids=[...new Set(products.map(p=>p.businessId).filter(Boolean))];
    const businesses=ids.map(id=>db.businesses.find(b=>b.id===id)).filter(Boolean);
    const el=document.getElementById('productList'); el.className='business-profile-grid';
    el.innerHTML=businesses.length?businesses.map(b=>{
      const ps=products.filter(p=>p.businessId===b.id),available=ps.filter(p=>availableStock(p)>0).length;
      return `<button class="business-profile-tile" data-business-id="${xe(b.id)}" type="button" onclick="openBuyerBusinessProfile('${xe(b.id)}')">
        <div class="business-cover">${b.cover?`<img src="${xe(b.cover)}" alt="">`:'<span>BUSINESS</span>'}</div>
        <div class="business-profile-body"><div class="business-profile-logo">${b.logo?`<img src="${xe(b.logo)}" alt="">`:'🏪'}</div>
        <div class="business-profile-text"><strong>${xe(b.name)}</strong><span>${xe(b.category||c.name)}</span><small>📍 ${xe(b.locality||b.address||'Nearby')}</small><small>${ps.length} product${ps.length===1?'':'s'} · ${available} available</small></div><b class="business-arrow">›</b></div>
      </button>`;
    }).join(''):`<div class="empty" style="grid-column:1/-1"><strong>No businesses yet</strong>Businesses with products in ${xe(c.name)} will appear here.</div>`;
    document.querySelectorAll('.screen').forEach(x=>x.classList.remove('active'));
    document.getElementById('products')?.classList.add('active');
    window.scrollTo({top:0,left:0,behavior:'auto'});
  }
  function pushProductsState(state){
    try{history.pushState(state,'',location.pathname+'#products');}catch(e){}
    renderProductsState(state);
  }
  function renderBusinessProductsView(bid,categoryId){
    const b=db.businesses.find(x=>x.id===bid); if(!b)return;
    currentBusiness=bid; currentCategory=categoryId||currentCategory; currentType='products';
    document.getElementById('productsTitle').textContent=b.name.toUpperCase();
    document.getElementById('productSearch').value='';
    document.getElementById('businessFilter').innerHTML='';
    const el=document.getElementById('productList'); el.className='product-list';
    const list=businessProductsFor(currentCategory,bid);
    el.innerHTML=list.length?list.map(p=>{
      const price=Number(p.discountPrice||p.price||0),imgs=typeof productImages==='function'?productImages(p):(p.images?.length?p.images:(p.image?[p.image]:[]));
      return `<article class="product-card" data-product-id="${xe(p.id)}" onclick="showProductDetail('${xe(p.id)}')">
        <div class="product-image">${imgs[0]?`<img src="${xe(imgs[0])}" alt="${xe(p.name)}">`:'📷'}</div>
        <div class="product-info"><div class="product-name">${xe(p.name)}</div><div class="product-shop">${xe(b.name)} · ${xe(db.categories.find(c=>c.id===p.categoryId)?.name||'')}</div><div class="product-price">₹${price.toLocaleString('en-IN')}</div><div class="product-meta"><span class="${availableStock(p)>0?'available':'unavailable'}">${availableStock(p)>0?'✓ '+availableStock(p)+' Available':'✕ Out of stock'}</span><span>📍 ${xe(b.locality||'Nearby')}</span><span>${b.delivery?'Delivery':'Pickup only'}</span></div>${availableStock(p)>0&&user()?.role!=='seller'?`<div class="product-qty-wrap" onclick="event.stopPropagation()"><div class="product-qty"><button type="button" aria-label="Decrease quantity" onclick="changeProductQty('${xe(p.id)}',-1)">−</button><b>${cartQty(p.id)}</b><button type="button" aria-label="Increase quantity" onclick="changeProductQty('${xe(p.id)}',1)">+</button></div></div>`:''}</div>
      </article>`;
    }).join(''):`<div class="empty"><strong>No products in this business</strong>This business has no products in the selected category.</div>`;
    document.querySelectorAll('.screen').forEach(x=>x.classList.remove('active'));
    document.getElementById('products')?.classList.add('active');
    window.scrollTo({top:0,left:0,behavior:'auto'});
  }
  window.renderBusinessProductsView=renderBusinessProductsView;

  function renderProductsState(state){
    if(!state||state.screen!=='products')return;
    if(state.view==='businessList'&&state.categoryId){renderBusinessListView(state.categoryId);return;}
    if(state.view==='businessProducts'&&state.businessId){renderBusinessProductsView(state.businessId,state.categoryId);return;}
  }

  // Replace the product-category path so it creates a real business-list history entry.
  const oldOpenCategory=window.openCategory;
  window.openCategory=function(id){
    const c=db.categories.find(x=>x.id===id);
    if(c&&c.type==='products'){
      const state={screen:'products',view:'businessList',categoryId:id};
      pushProductsState(state);
      return;
    }
    return oldOpenCategory?oldOpenCategory(id):undefined;
  };

  window.renderBusinessTiles=function(categoryId){
    const state={screen:'products',view:'businessList',categoryId};
    pushProductsState(state);
  };

  // Business -> products gets its own history entry, so the next back gesture returns to businesses.
  window.openBusinessProducts=function(bid,categoryId){
    const state={screen:'products',view:'businessProducts',businessId:bid,categoryId:categoryId||currentCategory};
    pushProductsState(state);
  };

  // Restore the correct business/category view after the existing global popstate handler activates #products.
  window.addEventListener('popstate',function(event){
    const state=event.state||{};
    if(state.screen==='products'&&(state.view==='businessList'||state.view==='businessProducts')){
      setTimeout(()=>renderProductsState(state),0);
    }
  });
})();



/* ===== legacy script 61 ===== */

(function(){
  'use strict';
  // Final, independent product-details handler. This intentionally sits last so
  // older product-card handlers cannot break the click flow.
  window.showProductDetail=function(rawId){
    const id=String(rawId ?? '').trim();
    const products=Array.isArray(db?.products)?db.products:[];
    const product=products.find(p=>String(p?.id ?? '').trim()===id);
    if(!product){
      if(typeof window.toast==='function') window.toast('Product not found');
      return false;
    }
    const businesses=Array.isArray(db?.businesses)?db.businesses:[];
    const business=businesses.find(b=>String(b?.id ?? '').trim()===String(product.businessId ?? '').trim());
    const images=(typeof window.productImages==='function' ? window.productImages(product) :
      (Array.isArray(product.images)&&product.images.length ? product.images : (product.image?[product.image]:[]))) || [];
    const price=Number(product.discountPrice ?? product.price ?? 0);
    const stock=(typeof window.availableStock==='function' ? Number(window.availableStock(product)) : Number(product.stock ?? product.quantity ?? 0));
    const old=document.getElementById('productDetail'); if(old) old.remove();
    const sec=document.createElement('section');
    sec.id='productDetail'; sec.className='screen active';
    const escFn=typeof window.esc==='function' ? window.esc : (v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])));
    const xid=escFn(id);
    sec.innerHTML=`<div class="page">
      <div class="page-head"><button type="button" class="btn secondary" onclick="history.back()">‹ BACK</button><b>PRODUCT DETAILS</b></div>
      <div class="detail-card">
        <div class="product-gallery" id="buyerProductGalleryFinal_${xid}" style="position:relative;overflow:hidden;touch-action:pan-y;border-radius:16px;background:#101114">
          <div id="buyerProductGalleryTrackFinal_${xid}" style="display:flex;width:100%;transition:transform .25s ease">
            ${images.length ? images.map((src,i)=>`<div style="min-width:100%;height:300px;display:flex;align-items:center;justify-content:center;background:#101114"><img src="${escFn(src)}" alt="${escFn(product.name||'Product')} photo ${i+1}" style="width:100%;height:100%;object-fit:contain" onerror="this.style.display='none'"></div>`).join('') : '<div style="min-width:100%;height:300px;display:grid;place-items:center">PRODUCT</div>'}
          </div>
          
        </div>
        ${images.length>1 ? `<div class="gallery-dots" id="buyerProductGalleryDotsFinal_${xid}">${images.map((_,i)=>`<button type="button" class="gallery-dot ${i===0?'active':''}" data-final-gallery-index="${i}" aria-label="Photo ${i+1}"></button>`).join('')}</div><div class="gallery-hint">Swipe to view ${images.length} photos</div>` : ''}
        <h1>${escFn(product.name||'Product')}</h1>
        <div class="price">₹${price.toLocaleString('en-IN')}</div>
        ${product.discountPrice?`<div class="muted"><s>₹${Number(product.price||0).toLocaleString('en-IN')}</s> discounted price</div>`:''}
        <div class="availability">${stock>0?'✓ Available':'✕ Out of stock'} · ${stock} available</div>
        <p class="muted">${escFn(product.description||'No description provided.')}</p>
        <div class="info-box"><b>${escFn(business?.name||'Business')}</b><br>${escFn(business?.address||'Address not provided')}<br>${escFn(business?.locality||'')}<br>${business?.delivery?'Home delivery available':'Self pickup only'}</div>
        <div class="field detail-quantity-field"><label>QUANTITY</label><div class="detail-qty-control" data-max-qty="${Math.max(1,stock)}"><button type="button" class="detail-qty-btn" data-detail-qty-minus aria-label="Decrease quantity">−</button><span id="detailQty" class="detail-qty-value" aria-live="polite">1</span><button type="button" class="detail-qty-btn" data-detail-qty-plus aria-label="Increase quantity">+</button></div></div>
        <div class="detail-actions">
          <button type="button" class="btn secondary" data-product-detail-cart="${xid}">+ ADD TO CART</button>
          <button type="button" class="btn primary" data-product-detail-order="${xid}">ORDER NOW</button>
        </div>
      </div>
    </div>`;
    (document.querySelector('main.shell') || document.querySelector('.app') || document.body).appendChild(sec);
    document.querySelectorAll('.screen').forEach(x=>{if(x!==sec)x.classList.remove('active');});
    sec.classList.add('active');
    window.scrollTo({top:0,left:0,behavior:'auto'});
    document.documentElement.scrollTop=0; document.body.scrollTop=0;

    // v65: robust swipe-only buyer gallery. The handler is attached directly to the
    // mounted viewport and uses both touch and pointer events for Android/WebView.
    try{
      const gallery=document.getElementById('buyerProductGalleryFinal_'+id);
      const viewport=gallery?.querySelector('.gallery-viewport') || gallery;
      const track=document.getElementById('buyerProductGalleryTrackFinal_'+id);
      const dots=[...document.querySelectorAll('#buyerProductGalleryDotsFinal_'+id+' .gallery-dot')];
      let galleryIndex=0, startX=0, startY=0, tracking=false, moved=false;
      const go=(next)=>{
        galleryIndex=(next+images.length)%images.length;
        if(track) track.style.transform='translate3d(-'+(galleryIndex*100)+'%,0,0)';
        dots.forEach((dot,i)=>dot.classList.toggle('active',i===galleryIndex));
      };
      if(viewport && images.length>1){
        viewport.style.touchAction='pan-y';
        if(track){ track.style.touchAction='pan-y'; track.style.willChange='transform'; }
        const begin=(x,y)=>{ startX=x; startY=y; tracking=true; moved=false; };
        const finish=(x,y)=>{
          if(!tracking) return;
          tracking=false;
          const dx=x-startX, dy=y-startY;
          if(Math.abs(dx)>=40 && Math.abs(dx)>Math.abs(dy)*1.15){
            moved=true;
            go(galleryIndex+(dx<0?1:-1));
          }
        };
        viewport.addEventListener('touchstart',e=>{
          if(e.touches && e.touches.length===1) begin(e.touches[0].clientX,e.touches[0].clientY);
        },{passive:true});
        viewport.addEventListener('touchend',e=>{
          if(e.changedTouches && e.changedTouches.length) finish(e.changedTouches[0].clientX,e.changedTouches[0].clientY);
        },{passive:true});
        viewport.addEventListener('touchcancel',()=>{tracking=false;},{passive:true});
        viewport.addEventListener('pointerdown',e=>{
          if(e.pointerType && e.pointerType!=='mouse') begin(e.clientX,e.clientY);
        },{passive:true});
        viewport.addEventListener('pointerup',e=>{
          if(e.pointerType && e.pointerType!=='mouse') finish(e.clientX,e.clientY);
        },{passive:true});
        viewport.addEventListener('pointercancel',()=>{tracking=false;},{passive:true});
        dots.forEach((dot,i)=>dot.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();go(i);}));
      }
    }catch(err){ console.warn('buyer gallery init failed',err); }

    try{history.pushState({screen:'productDetail',productId:id},'', '#product');}catch(e){}
    return true;
  };
  function openFromElement(el){
    const card=el.closest('[data-product-id], .product-card, .favorite-product-row');
    if(!card) return false;
    let id=card.getAttribute('data-product-id') || card.getAttribute('data-productid');
    if(!id){
      const m=(card.getAttribute('onclick')||'').match(/showProductDetail\(['"]([^'"]+)['"]\)/);
      if(m) id=m[1];
    }
    if(!id) return false;
    window.showProductDetail(id);
    return true;
  }
  document.addEventListener('click',function(e){
    const t=e.target;
    if(!(t instanceof Element)) return;
    if(t.closest('[data-product-detail-cart]') || t.closest('[data-product-detail-order]') || t.closest('button,.btn')) return;
    if(!t.closest('.product-card') && !t.closest('.favorite-product-row')) return;
    const handled=openFromElement(t);
    if(handled){e.preventDefault();e.stopImmediatePropagation();}
  },true);
  document.addEventListener('click',function(e){
    const t=e.target;
    if(!(t instanceof Element)) return;
    const cart=t.closest('[data-product-detail-cart]');
    const order=t.closest('[data-product-detail-order]');
    const btn=cart||order;
    if(!btn) return;
    e.preventDefault(); e.stopPropagation();
    const id=btn.getAttribute(cart?'data-product-detail-cart':'data-product-detail-order');
    const qty=Math.max(1,Number(document.getElementById('detailQty')?.value ?? document.getElementById('detailQty')?.textContent ?? 1));
    if(typeof window.addToCart==='function'){ window.addToCart(id,qty); }
    else if(Array.isArray(db?.cart)){
      const p=db.products.find(x=>String(x.id)===String(id));
      if(!p)return;
      const existing=db.cart.find(x=>String(x.productId)===String(id));
      if(existing) existing.qty+=qty; else db.cart.push({productId:p.id,qty});
      if(typeof window.save==='function')window.save();
    }
    if(order && typeof window.go==='function') window.go('cart');
  },true);
})();



/* ===== legacy script 62 ===== */

(function(){
  function getQty(){return Math.max(1,Number(document.getElementById('detailQty')?.textContent||1));}
  function setQty(next){
    const value=document.getElementById('detailQty'); if(!value)return;
    const control=value.closest('.detail-qty-control');
    const max=Math.max(1,Number(control?.dataset.maxQty||999999));
    const qty=Math.min(max,Math.max(1,Number(next)||1));
    value.textContent=String(qty);
  }
  document.addEventListener('click',function(e){
    const t=e.target instanceof Element?e.target:null; if(!t)return;
    const minus=t.closest('[data-detail-qty-minus]'), plus=t.closest('[data-detail-qty-plus]');
    if(!minus&&!plus)return;
    e.preventDefault();e.stopPropagation();
    const q=getQty(); setQty(q+(plus?1:-1));
  },true);
  // Keep older code that reads #detailQty.value working with the new visible stepper.
  const oldGet=window.getDetailQuantity;
  window.getDetailQuantity=function(){return getQty();};
})();



/* ===== legacy script 63 ===== */

(function(){
  // Final authoritative product editor save handler.
  // The editor intentionally inherits category from the owning business,
  // so it must never require a missing #epc field.
  window.saveProductEdit = async function(id){
    // Resolve the product directly from the persisted DB. Do not depend on the
    // older sellerOwnerProduct helper because several legacy seller screens
    // used different role/id representations. Ownership is the authoritative
    // check: the logged-in account must own the product's business.
    const u = typeof user === 'function' ? user() : null;
    const pid = String(id ?? '').trim();
    const p = (db.products || []).find(x => String(x?.id ?? '').trim() === pid);
    const b = p ? (db.businesses || []).find(x => String(x?.id ?? '').trim() === String(p.businessId ?? '').trim()) : null;
    const ownsBusiness = !!(u && b && String(b.ownerId ?? '').trim() === String(u.id ?? '').trim());
    if(!p || !b || !ownsBusiness) return toast('You can only edit your own products');
    const val = key => document.getElementById(key)?.value ?? '';
    const name = String(val('epn')).trim();
    const price = Number(val('epp'));
    const stock = Number(val('eps'));
    const unit = String(val('epu')).trim() || 'piece';
    const discountRaw = String(val('epd')).trim();

    if(!name || !Number.isFinite(price) || price < 0 || !Number.isFinite(stock) || stock < 0){
      return toast('Name, price and stock are required');
    }
    let discountPrice = null;
    if(discountRaw !== ''){
      discountPrice = Number(discountRaw);
      if(!Number.isFinite(discountPrice) || discountPrice < 0) return toast('Discount price must be valid');
      if(discountPrice > price) return toast('Discount price cannot be higher than the regular price');
    }

    const old = Object.assign({}, p, {images: Array.isArray(p.images) ? p.images.slice() : undefined});
    try{
      const input = document.getElementById('epFile');
      if(input?.files?.length){
        const images = await window.imageFromMany('epFile');
        if(!images.length) throw new Error('Could not read the selected product photos');
        p.images = images.slice(0,8);
        p.image = p.images[0] || '';
      }
      p.name = name;
      p.price = price;
      p.discountPrice = discountPrice;
      p.stock = stock;
      p.unit = unit;
      p.description = String(val('epx'));
      p.categoryId = b.categoryId || p.categoryId || '';
      p.businessId = b.id;

      const ok = window.save();
      if(ok === false){ Object.assign(p, old); return toast('Could not save product changes'); }
      closeModal();
      if(typeof renderSellerTab === 'function') renderSellerTab();
      else if(typeof renderSeller === 'function') renderSeller();
      toast('Product details updated');
    }catch(e){
      Object.assign(p, old);
      toast(e.message || 'Could not save product changes');
    }
  };
})();



/* ===== legacy script 64 ===== */

(function(){
  function isLoggedIn(){
    try {
      var u = (typeof currentUser !== 'undefined' && currentUser) ||
              (typeof db !== 'undefined' && db && db.currentUser) || null;
      return !!(u && (u.id || u.uid || u.email));
    } catch(e){ return false; }
  }
  function updateBuyerNavAuth(){
    var loggedIn = isLoggedIn();
    document.querySelectorAll(
      '[data-page="orders"],[data-page="cart"],[data-nav="orders"],[data-nav="cart"]'
    ).forEach(function(el){
      if(!loggedIn){
        el.classList.add('logged-out-hidden-nav');
        el.setAttribute('aria-hidden','true');
      } else {
        el.classList.remove('logged-out-hidden-nav');
        el.removeAttribute('aria-hidden');
      }
    });
    // Fallback for common bottom-nav labels when no data attributes exist.
    document.querySelectorAll('nav a, nav button, .bottom-nav a, .bottom-nav button').forEach(function(el){
      var label=(el.textContent||'').trim().toLowerCase();
      if(label==='orders' || label==='cart'){
        el.classList.toggle('logged-out-hidden-nav', !loggedIn);
      }
    });
  }
  window.updateBuyerNavAuth = updateBuyerNavAuth;
  document.addEventListener('DOMContentLoaded', function(){
    updateBuyerNavAuth();
    setInterval(updateBuyerNavAuth, 500);
  });
})();



/* ===== legacy script 65 ===== */

(function(){
  function fixBuyerNavColumns(){
    var loggedIn = false;
    try { loggedIn = typeof isLoggedIn === 'function' ? !!isLoggedIn() : false; }
    catch(e) {}
    document.querySelectorAll('.bottom-nav.buyer-nav').forEach(function(nav){
      nav.classList.toggle('logged-out', !loggedIn);
      nav.classList.toggle('logged-in', loggedIn);
    });
  }
  window.fixBuyerNavColumns = fixBuyerNavColumns;
  document.addEventListener('DOMContentLoaded', fixBuyerNavColumns);
  setInterval(fixBuyerNavColumns, 250);
})();



/* ===== legacy script 66 ===== */

(function(){
  function openSearchFromNav(e){
    var el=e.currentTarget;
    e.preventDefault();
    e.stopPropagation();
    try {
      if (typeof showPage === 'function') { showPage('search'); return; }
      if (typeof navigateTo === 'function') { navigateTo('search'); return; }
      if (typeof navigate === 'function') { navigate('search'); return; }
      if (typeof goToPage === 'function') { goToPage('search'); return; }
    } catch(err) {}
    var searchPage=document.getElementById('search-page') ||
                   document.querySelector('[data-page="search"]');
    if(searchPage){
      document.querySelectorAll('[data-page]').forEach(function(p){
        p.classList.remove('active');
        p.hidden=true;
      });
      searchPage.hidden=false;
      searchPage.classList.add('active');
      window.scrollTo(0,0);
    }
  }

  function bindSearch(){
    document.querySelectorAll(
      '.bottom-nav a[href*="search"],' +
      '.bottom-nav button[data-page="search"],' +
      '.bottom-nav [data-route="search"],' +
      '.bottom-nav [data-nav="search"]'
    ).forEach(function(el){
      if(el.dataset.searchNavFixed==='1') return;
      el.dataset.searchNavFixed='1';
      el.addEventListener('click',openSearchFromNav,true);
    });
  }
  document.addEventListener('DOMContentLoaded',bindSearch);
  setInterval(bindSearch,500);
})();



/* ===== legacy script 67 ===== */

(function(){
  function signedInBuyer(){
    try{
      if(typeof db==='undefined' || !db || !db.session || !Array.isArray(db.users)) return false;
      var u=db.users.find(function(x){ return String(x.id)===String(db.session); });
      return !!(u && String(u.role||'buyer').toLowerCase()!=='seller');
    }catch(e){ return false; }
  }

  function applyStableBuyerNav(){
    var loggedIn=signedInBuyer();
    document.querySelectorAll('.bottom-nav.buyer-nav').forEach(function(nav){
      nav.classList.toggle('buyer-auth-logged-in',loggedIn);
      nav.classList.toggle('buyer-auth-logged-out',!loggedIn);

      nav.querySelectorAll('button[data-screen="orders"],button[data-screen="cart"]').forEach(function(el){
        el.classList.remove('logged-out-hidden-nav');
        el.removeAttribute('aria-hidden');
        el.style.removeProperty('width');
        el.style.removeProperty('min-width');
        el.style.removeProperty('max-width');
        el.style.removeProperty('flex');
        el.style.removeProperty('margin');
        el.style.removeProperty('padding');
        el.style.removeProperty('border');
        el.style.removeProperty('overflow');
        el.style.removeProperty('display');
      });
    });
  }

  window.applyStableBuyerNav=applyStableBuyerNav;
  document.addEventListener('DOMContentLoaded',applyStableBuyerNav);
  window.addEventListener('storage',applyStableBuyerNav);
})();



/* ===== legacy script 68 ===== */

(function(){
  function serviceCategories(){
    return db.categories.filter(function(c){
      return c.type==='services' && c.scope==='marketplace';
    });
  }
  function productCategories(){
    return db.categories.filter(function(c){
      return c.type==='products' && c.scope==='marketplace';
    });
  }

  window.createBusiness=function(){
    if(!user()||user().role!=='seller') return go('auth');
    openModal(`<button class="close" onclick="closeModal()">×</button><h2>Create Business</h2>
      <div class="field"><label>BUSINESS TYPE</label>
        <div class="business-type-choice">
          <button id="btProduct" class="btn secondary active" type="button" onclick="selectBusinessType('products')">🛍️<br><b>PRODUCT BUSINESS</b><br><small>Sell physical products</small></button>
          <button id="btService" class="btn secondary" type="button" onclick="selectBusinessType('services')">🛠️<br><b>SERVICE BUSINESS</b><br><small>Offer local services</small></button>
        </div>
        <input type="hidden" id="btype" value="products">
      </div>
      <div class="field"><label>BUSINESS NAME</label><input id="bn" placeholder="ABC Auto Parts"></div>
      <div class="field"><label>OWNER NAME</label><input id="bo" value="${esc(user().name)}"></div>
      <div class="field"><label>PHONE</label><input id="bp" value="${esc(user().contact)}"></div>
      <div class="field"><label id="businessCategoryLabel">PRODUCT CATEGORY</label>
        <div class="row">
          <select id="bc">${productCategories().map(c=>`<option value="${c.id}">${esc(c.name)}</option>`).join('')}</select>
          <button class="btn secondary" type="button" onclick="createBusinessCategory()">+ CATEGORY</button>
        </div>
        <small id="businessCategoryHint" class="muted">Products listed in this business will use this category.</small>
      </div>
      <div class="field"><label>ADDRESS</label><input id="ba" placeholder="Full shop / office address"></div>
      <div class="field"><label>CITY / DISTRICT</label><select id="bcity">${ODISHA_LOCATIONS.map(([city,district])=>`<option value="${city}" ${city==='Bhubaneswar'?'selected':''}>${city} — ${district}</option>`).join('')}</select></div>
      <div class="field"><label>LOCALITY / AREA</label><input id="bl" list="businessAreaList" placeholder="e.g. Patia, Saheed Nagar"><datalist id="businessAreaList"></datalist></div>
      <div class="field"><label>BUSINESS LOGO</label><input id="blogoFile" type="file" accept="image/*" onchange="previewUpload(this,'businessLogoPreview')"><div id="businessLogoPreview" class="upload-preview"></div></div>
      <div class="field"><label>COVER IMAGE</label><input id="bcoverFile" type="file" accept="image/*" onchange="previewUpload(this,'businessCoverPreview')"><div id="businessCoverPreview" class="upload-preview cover-preview"></div></div>
      <div class="field"><label>OPENING HOURS</label><input id="bhours" placeholder="9:00 AM – 8:00 PM"></div>
      <div class="field"><label>DELIVERY</label><select id="bd"><option value="no">NO, SELF PICKUP ONLY</option><option value="yes">YES, I PROVIDE HOME DELIVERY</option></select></div>
      <div class="field"><label>PAYMENT POLICY</label><select id="bpay"><option>Pay at store</option><option>Online payment accepted</option><option>Advance payment required</option></select></div>
      <button class="btn primary full" onclick="saveBusiness()">CREATE BUSINESS</button>`);
    const dl=document.getElementById('businessAreaList');
    if(dl) dl.innerHTML=getBusinessAreas(document.getElementById('bcity')?.value||'Bhubaneswar').map(a=>`<option value="${esc(a)}"></option>`).join('');
  };

  window.selectBusinessType=function(type){
    const input=document.getElementById('btype'), select=document.getElementById('bc');
    if(!input||!select)return;
    input.value=type;
    const isService=type==='services';
    document.getElementById('btProduct')?.classList.toggle('active',!isService);
    document.getElementById('btService')?.classList.toggle('active',isService);
    const cats=isService?serviceCategories():productCategories();
    select.innerHTML=cats.map(c=>`<option value="${c.id}">${esc(c.name)}</option>`).join('');
    const label=document.getElementById('businessCategoryLabel');
    const hint=document.getElementById('businessCategoryHint');
    if(label)label.textContent=isService?'SERVICE CATEGORY':'PRODUCT CATEGORY';
    if(hint)hint.textContent=isService?'Services listed in this business will use this category.':'Products listed in this business will use this category.';
  };

  window.saveBusiness=async function(){
    const u=user();
    if(!u||u.role!=='seller')return go('auth');
    const type=document.getElementById('btype')?.value==='services'?'services':'products';
    const catId=document.getElementById('bc')?.value;
    const cat=db.categories.find(c=>c.id===catId && c.type===type);
    if(!cat)return toast('Please select a valid '+(type==='services'?'service':'product')+' category');
    let logo='',cover='';
    try{
      logo=await window.imageFrom('blogoFile');
      cover=await window.imageFrom('bcoverFile');
    }catch(e){
      toast(e.message||'Could not read business photo. Please choose it again.');
      return;
    }
    const city=document.getElementById('bcity')?.value||'Bhubaneswar';
    const b={
      id:uid('biz'),ownerId:u.id,name:document.getElementById('bn').value.trim()||'My Business',
      ownerName:document.getElementById('bo').value,phone:document.getElementById('bp').value,
      businessType:type,categoryType:type,categoryId:cat.id,category:cat.name,
      address:document.getElementById('ba').value||'Local address',
      locality:document.getElementById('bl').value||city,city,
      district:(ODISHA_LOCATIONS.find(x=>x[0]===city)||[])[1]||'Khordha',
      logo,cover,hours:document.getElementById('bhours').value||'Opening hours not provided',
      delivery:document.getElementById('bd').value==='yes',
      paymentPolicy:document.getElementById('bpay').value
    };
    db.businesses.push(b);
    save();closeModal();currentBusiness=b.id;openSeller(b.id);
    toast(type==='services'?'Service business created':'Product business created');
  };

  window.createBusinessCategory=function(){
    const type=document.getElementById('btype')?.value==='services'?'services':'products';
    const name=prompt('New '+(type==='services'?'service':'product')+' category name');
    if(!name||!name.trim())return;
    const clean=name.trim();
    if(db.categories.some(c=>c.type===type&&c.scope==='marketplace'&&c.name.toLowerCase()===clean.toLowerCase()))
      return toast('Category already exists');
    const c={id:uid('cat'),name:clean,type,scope:'marketplace',createdAt:Date.now(),status:'active'};
    db.categories.push(c);save();
    const sel=document.getElementById('bc');
    if(sel){
      const cats=type==='services'?serviceCategories():productCategories();
      sel.innerHTML=cats.map(x=>`<option value="${x.id}">${esc(x.name)}</option>`).join('');
      sel.value=c.id;
    }
    toast((type==='services'?'Service':'Product')+' category created');
  };

  window.addService=function(){
    const u=requireSeller();if(!u)return;
    const bid=currentBusiness || db.businesses.find(b=>b.ownerId===u.id&&b.businessType==='services')?.id;
    const b=db.businesses.find(x=>x.id===bid&&x.ownerId===u.id);
    if(!b)return toast('Create a service business first');
    if(b.businessType!=='services')return toast('This is a product business. Create a service business to add services.');
    const cats=serviceCategories();
    openModal(`<button class="close" onclick="closeModal()">×</button><h2>Add Service</h2>
      <div class="notice"><b>${esc(b.name)}</b><br><span class="muted">${esc(b.locality||'')}</span></div>
      <div class="field"><label>SERVICE NAME</label><input id="sn" placeholder="AC Repair"></div>
      <div class="field"><label>SERVICE CATEGORY</label><select id="sc">${cats.map(c=>`<option value="${c.id}">${esc(c.name)}</option>`).join('')}</select></div>
      <div class="field"><label>STARTING PRICE (OPTIONAL)</label><input id="sp" type="number" min="0" placeholder="500"></div>
      <div class="field"><label>DESCRIPTION</label><textarea id="sx" placeholder="Describe the service"></textarea></div>
      <div class="field"><label>SERVICE AREA</label><input id="sa" value="${esc(b.locality||'')}"></div>
      <button class="btn primary full" onclick="saveServiceForBusiness('${b.id}')">ADD SERVICE</button>`);
  };

  window.saveServiceForBusiness=function(bid){
    const u=requireSeller();if(!u)return;
    const selectedId=String(bid||currentBusiness||'');
    const b=db.businesses.find(x=>String(x.id)===selectedId&&x.ownerId===u.id&&x.businessType==='services');
    if(!b)return toast('Service business required');
    const name=document.getElementById('sn')?.value.trim();
    const categoryId=document.getElementById('sc')?.value;
    if(!name||!categoryId)return toast('Service name and category are required');
    const cat=db.categories.find(c=>c.id===categoryId&&c.type==='services');
    db.services=db.services||[];
    db.services.push({
      id:uid('service'),businessId:b.id,ownerId:u.id,providerName:b.name,name,
      description:document.getElementById('sx')?.value||'',
      categoryId,category:cat?.name||'Services',
      price:Number(document.getElementById('sp')?.value)||null,
      startingPrice:document.getElementById('sp')?.value||'',
      serviceArea:document.getElementById('sa')?.value||b.locality||'',
      available:true,phone:b.phone||''
    });
    save();closeModal();renderSeller();toast('Service added');
  };

  const originalRenderSeller=window.renderSeller;
  window.renderSeller=function(){
    const u=user();
    if(!u||u.role!=='seller'){if(typeof originalRenderSeller==='function')return originalRenderSeller();return;}
    const b=db.businesses.find(x=>x.id===currentBusiness&&x.ownerId===u.id);
    if(!b||b.businessType!=='services'){
      if(typeof originalRenderSeller==='function')return originalRenderSeller();
      return;
    }
    document.body.classList.add('seller-mode');
    const services=(db.services||[]).filter(s=>s.businessId===b.id);
    const reservations=(db.reservations||[]).filter(r=>r.businessId===b.id);
    const pending=reservations.filter(r=>String(r.status||'').includes('WAITING')||r.status==='RESERVED').length;
    document.getElementById('sellerContent').innerHTML=`<div class="page-head"><div class="page-title">SERVICE BUSINESS</div></div>
      <div class="card seller-business-head">${b.cover?`<div class="seller-cover"><img src="${esc(b.cover)}"></div>`:''}
        <div class="row"><div class="seller-biz-main">${b.logo?`<img class="seller-logo" src="${esc(b.logo)}">`:''}<div><h2 style="margin:0">${esc(b.name)}</h2><div class="muted">${esc(b.address)}</div><div class="muted">Service business · ${esc(b.category||'Services')}</div></div></div>
        <button class="btn danger" onclick="deleteBusiness('${b.id}')">DELETE BUSINESS</button></div>
      </div>
      <div class="dashboard-stats"><div class="stat-card"><b>${services.length}</b><span>SERVICES</span></div><div class="stat-card"><b>${reservations.length}</b><span>REQUESTS / ORDERS</span></div><div class="stat-card"><b>${pending}</b><span>PENDING</span></div></div>
      <div class="dashboard-actions"><button class="btn primary" onclick="addService()">+ SERVICE</button><button class="btn secondary" onclick="renderProfile();go('profile')">PROFILE</button></div>
      <div class="row" style="margin-bottom:9px"><h3 style="margin:0">MY SERVICES</h3><span class="status">${services.length}</span></div>
      <div class="card">${services.length?services.map(s=>`<div class="row" style="padding:10px 0;border-bottom:1px solid #292a2f"><div><b>${esc(s.name)}</b><small class="muted" style="display:block">${esc(s.category||'Services')} · ${s.price?'From ₹'+Number(s.price).toLocaleString('en-IN'):'Price on request'} · ${esc(s.serviceArea||b.locality||'')}</small></div></div>`).join(''):'<div class="muted">No services yet. Tap + SERVICE to add one.</div>'}</div>`;
  };
})();



/* ===== legacy script 69 ===== */

(function(){
  db.services=db.services||[];
  db.serviceBookings=db.serviceBookings||[];

  function getService(id){return db.services.find(function(x){return String(x.id)===String(id);});}
  function getBusiness(id){return db.businesses.find(function(x){return String(x.id)===String(id);});}

  /* Override the old "Request Service" action with the real booking flow. */
  window.requestService=function(serviceId){
    return window.bookService(serviceId);
  };

  window.bookService=function(serviceId){
    var s=getService(serviceId);
    var b=s&&getBusiness(s.businessId);
    var u=typeof user==='function'?user():null;
    if(!u){go('auth');return;}
    if(!s||!b){toast('Service not found');return;}

    var dates=[];
    for(var i=0;i<14;i++){
      var d=new Date();d.setDate(d.getDate()+i);
      dates.push(d.toISOString().slice(0,10));
    }
    var times=[];
    for(var h=9;h<=19;h++){
      times.push(String(h).padStart(2,'0')+':00');
      if(h<19)times.push(String(h).padStart(2,'0')+':30');
    }

    openModal(
      '<button class="close" onclick="closeModal()">×</button>'+
      '<h2>Book Service</h2>'+
      '<div class="notice"><b>'+esc(s.name)+'</b><br>'+esc(b.name)+
      '<br>'+(s.price?'Starting from ₹'+Number(s.price).toLocaleString('en-IN'):'Price on request')+'</div>'+
      '<div class="field"><label>VEHICLE TYPE</label><select id="realSvcVehicle"><option>Hatchback</option><option>Sedan</option><option>SUV</option><option>MUV</option><option>Other</option></select></div>'+
      '<div class="field"><label>VEHICLE NUMBER</label><input id="realSvcVehicleNo" placeholder="OD 02 AB 1234"></div>'+
      '<div class="field"><label>DATE</label><select id="realSvcDate">'+
      dates.map(function(d,i){return '<option value="'+d+'">'+(i===0?'Today':i===1?'Tomorrow':new Date(d).toLocaleDateString('en-IN',{day:'numeric',month:'short'}))+'</option>';}).join('')+
      '</select></div>'+
      '<div class="field"><label>TIME SLOT</label><div class="service-action-grid" id="realSvcTimes">'+
      times.map(function(t){return '<button type="button" class="service-slot" data-time="'+t+'" onclick="chooseRealServiceTime(this)">'+t+'</button>';}).join('')+
      '</div><input id="realSvcTime" type="hidden"></div>'+
      '<div class="field"><label>NOTES</label><textarea id="realSvcNotes" placeholder="Anything the service provider should know"></textarea></div>'+
      '<button class="btn primary full" onclick="confirmRealServiceBooking(\''+s.id+'\')">CONFIRM BOOKING</button>'
    );
  };

  window.chooseRealServiceTime=function(el){
    document.querySelectorAll('#realSvcTimes .service-slot').forEach(function(x){x.classList.remove('active');});
    el.classList.add('active');
    document.getElementById('realSvcTime').value=el.dataset.time;
  };

  window.confirmRealServiceBooking=function(serviceId){
    var s=getService(serviceId);
    var b=s&&getBusiness(s.businessId);
    var u=typeof user==='function'?user():null;
    if(!u){go('auth');return;}
    if(!s||!b){toast('Service not found');return;}
    var time=document.getElementById('realSvcTime').value;
    if(!time){toast('Please select a time slot');return;}

    var booking={
      id:uid('booking'),
      type:'SERVICE_BOOKING',
      serviceId:s.id,
      businessId:b.id,
      customerId:u.id,
      customerName:u.name||u.email||'Customer',
      serviceName:s.name,
      vehicleType:document.getElementById('realSvcVehicle').value,
      vehicleNumber:document.getElementById('realSvcVehicleNo').value.trim(),
      date:document.getElementById('realSvcDate').value,
      time:time,
      notes:document.getElementById('realSvcNotes').value.trim(),
      price:Number(s.price)||0,
      status:'PENDING',
      createdAt:Date.now()
    };

    db.serviceBookings=db.serviceBookings||[];
    db.serviceBookings.push(booking);
    db.reservations=db.reservations||[];
    db.reservations.push({
      id:booking.id,
      userId:u.id,
      businessId:b.id,
      customerId:u.id,
      customerName:booking.customerName,
      type:'SERVICE_BOOKING',
      serviceId:s.id,
      serviceName:s.name,
      vehicleType:booking.vehicleType,
      vehicleNumber:booking.vehicleNumber,
      date:booking.date,
      time:booking.time,
      total:booking.price,
      status:'PENDING',
      createdAt:booking.createdAt
    });
    save();
    closeModal();
    toast('Service booking request sent');
  };

  /* Replace common old service-request buttons wherever they are rendered. */
  function replaceServiceRequestButtons(){
    document.querySelectorAll('button,a').forEach(function(el){
      var label=(el.textContent||'').trim().toLowerCase();
      if(label!=='request service' && label!=='request' && label!=='reserve service')return;

      var onclick=el.getAttribute('onclick')||'';
      var m=onclick.match(/['"]([^'"]+)['"]/);
      var id=m&&m[1];
      if(!id)return;

      el.textContent='BOOK NOW';
      el.classList.remove('secondary','danger');
      el.classList.add('primary');
      el.setAttribute('onclick','bookService(\''+id+'\')');
      el.removeAttribute('href');
    });
  }

  document.addEventListener('DOMContentLoaded',replaceServiceRequestButtons);
  setInterval(replaceServiceRequestButtons,500);
})();



/* ===== legacy script 70 ===== */

(function(){
  const originalCreateBusiness = window.createBusiness;
  window.createBusiness = function(){
    const u = typeof user==='function' ? user() : null;
    if(!u || u.role!=='seller'){ if(typeof go==='function') go('auth'); return; }
    const cats = db.categories.filter(c=>c.type==='products' && c.scope==='marketplace');
    openModal(`
      <div class="premium-sheet">
        <div class="premium-scroll">
          <button class="premium-close" onclick="closeModal()">×</button>
          <div class="premium-hero">
            <div class="premium-kicker">SELLER SETUP</div>
            <h2>Create your business</h2>
            <p>Build a professional storefront customers can discover, trust and shop from.</p>
            <div style="margin-top:12px"><span class="form-badge">✓ FREE BUSINESS LISTING</span></div>
          </div>

          <div class="form-section">
            <div class="form-section-title">Business identity</div>
            <div class="form-section-sub">The information customers will see first.</div>
            <div class="premium-field">
              <label>BUSINESS NAME *</label>
              <input id="bn" placeholder="e.g. Rout Electronics" autocomplete="organization">
            </div>
            <div class="premium-grid">
              <div class="premium-field">
                <label>OWNER NAME</label>
                <input id="bo" value="${esc(u.name)}">
              </div>
              <div class="premium-field">
                <label>PHONE</label>
                <input id="bp" value="${esc(u.contact)}" inputmode="tel">
              </div>
            </div>
            <div class="premium-field">
              <label>BUSINESS CATEGORY *</label>
              <div style="display:flex;gap:8px">
                <select id="bc" style="flex:1">${cats.map(c=>`<option value="${esc(c.id)}">${esc(c.name)}</option>`).join('')}</select>
                <button class="btn secondary" type="button" onclick="createBusinessCategory()" style="height:46px;border-radius:12px;white-space:nowrap">+ New</button>
              </div>
              <div class="premium-help">Your products will appear automatically in this category.</div>
            </div>
          </div>

          <div class="form-section">
            <div class="form-section-title">Store location</div>
            <div class="form-section-sub">Help nearby customers find your exact business.</div>
            <div class="premium-field">
              <label>FULL ADDRESS</label>
              <input id="ba" placeholder="Shop no., street, landmark">
            </div>
            <div class="premium-grid">
              <div class="premium-field">
                <label>CITY / DISTRICT</label>
                <select id="bcity" onchange="this.form?.dispatchEvent(new Event('change'))">
                  ${ODISHA_LOCATIONS.map(([city,district])=>`<option value="${esc(city)}" ${city===selectedLocation.city?'selected':''}>${esc(city)} — ${esc(district)}</option>`).join('')}
                </select>
              </div>
              <div class="premium-field">
                <label>LOCALITY / AREA *</label>
                <input id="bl" list="businessAreaList" placeholder="e.g. Patia, Saheed Nagar">
                <datalist id="businessAreaList"></datalist>
              </div>
            </div>
            <div class="premium-help">Use the locality customers normally search for. This also helps SORTED show your shop in the right area.</div>
          </div>

          <div class="form-section">
            <div class="form-section-title">Brand photos</div>
            <div class="form-section-sub">A good logo and cover photo make your business tile look much more professional.</div>
            <div class="premium-grid">
              <div class="premium-field">
                <label>BUSINESS LOGO</label>
                <div class="photo-drop">
                  <div class="photo-drop-icon">◎</div><strong>Upload logo</strong><span>Square image recommended</span>
                  <input id="blogoFile" type="file" accept="image/*" onchange="previewUpload(this,'businessLogoPreview')">
                  <div id="businessLogoPreview" class="upload-preview"></div>
                </div>
              </div>
              <div class="premium-field">
                <label>COVER IMAGE</label>
                <div class="photo-drop" style="min-height:118px">
                  <div class="photo-drop-icon">▧</div><strong>Upload cover</strong><span>Wide image recommended</span>
                  <input id="bcoverFile" type="file" accept="image/*" onchange="previewUpload(this,'businessCoverPreview')">
                  <div id="businessCoverPreview" class="upload-preview"></div>
                </div>
              </div>
            </div>
          </div>

          <div class="form-section">
            <div class="form-section-title">Customer experience</div>
            <div class="form-section-sub">Set expectations before customers visit or order.</div>
            <div class="premium-grid">
              <div class="premium-field">
                <label>OPENING HOURS</label>
                <input id="bhours" placeholder="9:00 AM – 8:00 PM">
              </div>
              <div class="premium-field">
                <label>DELIVERY</label>
                <select id="bd">
                  <option value="no">Self pickup only</option>
                  <option value="yes">Home delivery available</option>
                </select>
              </div>
            </div>
            <div class="premium-field">
              <label>PAYMENT POLICY</label>
              <select id="bpay">
                <option>Pay at store</option>
                <option>Online payment accepted</option>
                <option>Advance payment required</option>
              </select>
            </div>
          </div>

          <div class="premium-actions">
            <button class="btn secondary" onclick="closeModal()">Cancel</button>
            <button class="btn primary" onclick="saveBusiness()">Create business</button>
          </div>
        </div>
      </div>
    `);
    const dl=document.getElementById('businessAreaList');
    if(dl) dl.innerHTML=getBusinessAreas(document.getElementById('bcity')?.value||selectedLocation.city||'Bhubaneswar').map(a=>`<option value="${esc(a)}"></option>`).join('');
  };

  window.addProduct = function(bid){
    const b=db.businesses.find(x=>x.id===bid);
    if(!b) return;
    const cat=db.categories.find(c=>c.id===b.categoryId);
    if(!cat) return toast('Please set a business category first');

    openModal(`
      <div class="premium-sheet">
        <div class="premium-scroll">
          <button class="premium-close" onclick="closeModal()">×</button>
          <div class="premium-hero">
            <div class="premium-kicker">PRODUCT LISTING</div>
            <h2>Add a new product</h2>
            <p>Give customers the information they need to understand, compare and buy your product.</p>
            <div style="margin-top:12px"><span class="form-badge">CATEGORY · ${esc(cat.name)}</span></div>
          </div>

          <div class="form-section">
            <div class="form-section-title">Product basics</div>
            <div class="form-section-sub">Keep the product name short and easy to search.</div>
            <div class="premium-field">
              <label>PRODUCT NAME *</label>
              <input id="pn" placeholder="e.g. Samsung 55-inch Smart TV" autocomplete="off">
            </div>
            <div class="premium-field">
              <label>DESCRIPTION</label>
              <textarea id="px" placeholder="Describe the product, key features, size, model or other useful details..."></textarea>
            </div>
          </div>

          <div class="form-section">
            <div class="form-section-title">Product photos</div>
            <div class="form-section-sub">Add up to 8 clear photos. The first image becomes the main product photo.</div>
            <div class="photo-drop" style="min-height:145px">
              <div class="photo-drop-icon">▣</div><strong>Choose product photos</strong><span>Multiple images supported</span>
              <input id="piFile" type="file" accept="image/*" multiple onchange="previewMultiUpload(this,'productImagePreview')">
              <div id="productImagePreview" class="multi-upload-preview"></div>
            </div>
          </div>

          <div class="form-section">
            <div class="form-section-title">Pricing & stock</div>
            <div class="form-section-sub">Customers will see the selling price. Keep stock accurate for real-time availability.</div>
            <div class="price-row">
              <div class="premium-field">
                <label>PRICE (₹) *</label>
                <input id="pp" type="number" min="0" step="0.01" placeholder="1200" inputmode="decimal">
              </div>
              <div class="premium-field">
                <label>DISCOUNT PRICE (₹)</label>
                <input id="pd" type="number" min="0" step="0.01" placeholder="Optional" inputmode="decimal">
              </div>
            </div>
            <div class="price-row">
              <div class="premium-field">
                <label>AVAILABLE STOCK *</label>
                <input id="ps" type="number" min="0" step="1" placeholder="25" inputmode="numeric">
              </div>
              <div class="premium-field">
                <label>UNIT</label>
                <select id="pu">
                  <option value="piece">Piece</option>
                  <option value="pair">Pair</option>
                  <option value="set">Set</option>
                  <option value="box">Box</option>
                  <option value="kg">Kg</option>
                  <option value="gram">Gram</option>
                  <option value="litre">Litre</option>
                  <option value="metre">Metre</option>
                </select>
              </div>
            </div>
          </div>

          <div class="premium-actions">
            <button class="btn secondary" onclick="closeModal()">Cancel</button>
            <button class="btn primary" onclick="saveProduct('${bid}')">List product</button>
          </div>
        </div>
      </div>
    `);
  };
})();



/* ===== legacy script 71 ===== */

(function(){
  const state={biz:{step:1,logo:'',cover:''},prod:{step:1,images:[],draft:false}};
  const oldCreateBusiness=window.createBusiness;
  const oldAddProduct=window.addProduct;

  function sheet(inner){
    openModal('<div class="onboard-sheet"><div class="onboard-scroll">'+inner+'</div></div>');
  }
  function esc2(v){return typeof esc==='function'?esc(v):String(v||'');}

  window.createBusiness=function(){
    const u=user(); if(!u||u.role!=='seller'){go('auth');return;}
    state.biz={step:1,logo:'',cover:'',businessType:'products',bc:''}; renderBiz();
  };
  function renderBiz(){
    const s=state.biz.step, u=user();
    const titles=['Business identity','Location','Brand your storefront','Customer experience'];
    const subs=[
      'Tell customers what your business is and what you sell.',
      'Set the location customers should use to discover your store.',
      'Add your logo and cover photo and preview your storefront.',
      'Choose how customers can visit, collect and pay.'
    ];
    let body='';
    if(s===1) body=`
      <div class="onboard-panel">
        <div class="onboard-field"><label class="onboard-label">BUSINESS NAME *</label><input class="onboard-input" id="bn" placeholder="e.g. Rout Electronics"></div>
        <div class="onboard-grid">
          <div class="onboard-field"><label class="onboard-label">OWNER NAME</label><input class="onboard-input" id="bo" value="${esc2(u.name)}"></div>
          <div class="onboard-field"><label class="onboard-label">PHONE</label><input class="onboard-input" id="bp" value="${esc2(u.contact)}" inputmode="tel"></div>
        </div>
        <div class="onboard-field"><label class="onboard-label">BUSINESS TYPE *</label>
          <div class="business-type-choice" style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
            <button type="button" class="btn secondary ${state.biz.businessType==='products'?'active':''}" onclick="selectOnboardBusinessType('products')">🛍️<br><b>PRODUCT BUSINESS</b><br><small>Sell products</small></button>
            <button type="button" class="btn secondary ${state.biz.businessType==='services'?'active':''}" onclick="selectOnboardBusinessType('services')">🛠️<br><b>SERVICE BUSINESS</b><br><small>Offer services</small></button>
          </div>
          <input type="hidden" id="btype" value="${esc2(state.biz.businessType||'products')}">
        </div>
        <div class="onboard-field"><label class="onboard-label" id="businessCategoryLabel">${state.biz.businessType==='services'?'SERVICE CATEGORY':'PRODUCT CATEGORY'} *</label>
          <div style="display:flex;gap:8px"><select class="onboard-select" id="bc" onchange="state.biz.bc=this.value" style="flex:1">${db.categories.filter(c=>c.type===(state.biz.businessType==='services'?'services':'products')&&c.scope==='marketplace').map(c=>`<option value="${esc2(c.id)}" ${c.id===state.biz.bc?'selected':''}>${esc2(c.name)}</option>`).join('')}</select><button class="btn secondary" type="button" onclick="createOnboardBusinessCategory()" style="height:46px;border-radius:12px">+ New</button></div>
          <small id="businessCategoryHint" class="muted">${state.biz.businessType==='services'?'Services listed in this business will use this category.':'Products listed in this business will use this category.'}</small>
        </div>
        <div class="onboard-field"><label class="onboard-label">SHORT DESCRIPTION</label><textarea class="onboard-textarea" id="bdesc" placeholder="What makes your business useful to local customers?"></textarea></div>
      </div>`;
    if(s===2) body=`
      <div class="onboard-panel">
        <div class="onboard-field"><label class="onboard-label">CITY / DISTRICT</label><select class="onboard-select" id="bcity">${ODISHA_LOCATIONS.map(([c,d])=>`<option value="${esc2(c)}" ${c===selectedLocation.city?'selected':''}>${esc2(c)} — ${esc2(d)}</option>`).join('')}</select></div>
        <div class="onboard-field"><label class="onboard-label">LOCALITY / AREA *</label><input class="onboard-input" id="bl" list="businessAreaList" placeholder="e.g. Patia, Saheed Nagar"></div>
        <div class="onboard-field"><label class="onboard-label">FULL ADDRESS</label><input class="onboard-input" id="ba" placeholder="Shop no., street, landmark"></div>
        <div style="background:#eafff2;border:1px solid #c7f1d9;border-radius:13px;padding:11px;font-size:10px;color:#08753c">✓ Your locality helps SORTED show your store to customers shopping nearby.</div>
      </div>`;
    if(s===3) body=`
      <div class="onboard-panel">
        <div class="onboard-grid">
          <div><label class="onboard-label">BUSINESS LOGO</label><div class="onboard-upload"><div style="font-size:28px">◎</div><strong>Upload logo</strong><span>Square image recommended</span><input id="blogoFile" type="file" accept="image/*" onchange="bizPhotoPreview(this,'logo')"><div id="bizLogoMini"></div></div></div>
          <div><label class="onboard-label">COVER PHOTO</label><div class="onboard-upload"><div style="font-size:28px">▧</div><strong>Upload cover</strong><span>Wide image recommended</span><input id="bcoverFile" type="file" accept="image/*" onchange="bizPhotoPreview(this,'cover')"><div id="bizCoverMini"></div></div></div>
        </div>
      </div>
      <div class="onboard-panel"><div style="font-size:11px;font-weight:950;margin-bottom:10px">CUSTOMER VIEW</div>${bizPreview()}</div>`;
    if(s===4) body=`
      <div class="onboard-panel">
        <div class="onboard-grid">
          <div class="onboard-field"><label class="onboard-label">OPENING HOURS</label><input class="onboard-input" id="bhours" placeholder="9:00 AM – 8:00 PM"></div>
          <div class="onboard-field"><label class="onboard-label">DELIVERY</label><select class="onboard-select" id="bd"><option value="no">Self pickup only</option><option value="yes">Home delivery available</option></select></div>
        </div>
        <div class="onboard-field"><label class="onboard-label">PAYMENT POLICY</label><select class="onboard-select" id="bpay"><option>Pay at store</option><option>Online payment accepted</option><option>Advance payment required</option></select></div>
      </div>
      <div class="onboard-panel">${bizPreview()}<div style="margin-top:10px;font-size:10px;color:#6d7873">You can edit your storefront later from Seller Dashboard.</div></div>`;
    sheet(`<div class="onboard-top"><button class="onboard-back" onclick="${s===1?'closeModal()':'bizPrev()'}">${s===1?'×':'‹'}</button><div class="onboard-steptext">BUSINESS SETUP · ${s} OF 4</div></div><div class="onboard-progress"><i style="width:${s*25}%"></i></div><h2 class="onboard-title">${titles[s-1]}</h2><p class="onboard-sub">${subs[s-1]}</p>${body}<div class="onboard-actions">${s>1?'<button class="onboard-secondary" onclick="bizPrev()">Back</button>':''}<button class="onboard-primary" onclick="${s<4?'bizNext()':'saveBusinessV80()'}">${s<4?'Continue':'Create business'}</button></div>`);
  }
  window.bizNext=function(){
    const s=state.biz.step;
    if(s===1&&!document.getElementById('bn')?.value.trim())return toast('Enter a business name');
    if(s===2&&!document.getElementById('bl')?.value.trim())return toast('Enter your locality / area');
    captureBiz();
    state.biz.step=Math.min(4,s+1);renderBiz();
  };
  window.bizPrev=function(){captureBiz();state.biz.step=Math.max(1,state.biz.step-1);renderBiz();};
  function captureBiz(){
    ['bn','bo','bp','bc','bdesc','bcity','bl','ba','bhours','bd','bpay','btype'].forEach(id=>{const e=document.getElementById(id);if(e)state.biz[id]=e.value;});
    // Keep the business type/category permanently in state even after the
    // step-1 controls are unmounted by the multi-step renderer.
    if(state.biz.btype) state.biz.businessType = state.biz.btype==='services' ? 'services' : 'products';
    if(state.biz.bc){
      state.biz.categoryId = String(state.biz.bc);
      const c=(db.categories||[]).find(x=>String(x.id)===String(state.biz.bc));
      if(c) state.biz.categoryName=c.name;
    }
  }
  window.bizPhotoPreview=async function(input,type){
    try{const data=await window.imageFrom(input);state.biz[type]=data;renderBiz();}
    catch(e){toast(e.message||'Could not read photo. Please choose it again.');}
  };
  function bizPreview(){
    const cat=db.categories.find(c=>c.id===state.biz.bc);
    return `<div class="onboard-preview-card"><div class="onboard-cover">${state.biz.cover?`<img src="${esc2(state.biz.cover)}">`:'<div style="height:100%;display:flex;align-items:center;justify-content:center;color:#87938d;font-size:11px">Cover photo</div>'}</div><div class="onboard-biz-body">${state.biz.logo?`<img class="onboard-logo" src="${esc2(state.biz.logo)}">`:'<div class="onboard-logo" style="display:flex;align-items:center;justify-content:center;font-size:22px">◎</div>'}<div><div class="onboard-biz-name">${esc2(state.biz.bn||'Your Business')}</div><div class="onboard-meta">${esc2(cat?.name||'Business')} · 📍 ${esc2(state.biz.bl||'Your area')}</div><div class="onboard-pills"><span class="onboard-pill">✓ Local</span><span class="onboard-pill">${state.biz.bd==='yes'?'Delivery':'Pickup'}</span></div></div></div></div>`;
  }

  window.saveBusinessV80=async function(){
    captureBiz();
    const btype=state.biz.businessType==='services' || state.biz.btype==='services' ? 'services' : 'products';
    state.biz.businessType=btype;

    // Resolve the category using the persisted selection first. The category
    // select is destroyed/recreated between steps, so never depend on a live
    // #bc element at the final step.
    const wantedId=String(state.biz.categoryId||state.biz.bc||'');
    const wantedName=String(state.biz.categoryName||'').trim().toLowerCase();
    const pool=(db.categories||[]).filter(c=>c.type===btype && c.scope==='marketplace');
    let cat=pool.find(c=>String(c.id)===wantedId);
    if(!cat && wantedName) cat=pool.find(c=>String(c.name).trim().toLowerCase()===wantedName);
    // If the selection was valid on step 1 but its DOM value was lost during
    // a rerender, keep creation usable by selecting the first category of the
    // chosen type rather than reporting a false validation error.
    if(!cat && pool.length) cat=pool[0];
    if(!cat)return toast('No '+(btype==='services'?'service':'product')+' categories are available. Please add a category first.');

    state.biz.bc=cat.id; state.biz.categoryId=cat.id; state.biz.categoryName=cat.name;
    let logo=state.biz.logo||'',cover=state.biz.cover||'';
    const b={id:uid('biz'),ownerId:user().id,businessType:btype,categoryType:btype,name:String(state.biz.bn||'').trim()||'My Business',ownerName:state.biz.bo||user().name,phone:state.biz.bp||user().contact,categoryId:cat.id,category:cat.name,description:state.biz.bdesc||'',address:state.biz.ba||'Local address',locality:state.biz.bl||state.biz.bcity||'Nearby',city:state.biz.bcity||'Bhubaneswar',district:(ODISHA_LOCATIONS.find(x=>x[0]===state.biz.bcity)||[])[1]||'Khordha',logo,cover,hours:state.biz.bhours||'Opening hours not provided',delivery:state.biz.bd==='yes',paymentPolicy:state.biz.bpay||'Pay at store'};
    db.businesses.push(b);save();closeModal();openSeller(b.id);
  };

  window.addProduct=function(bid){
    const b=db.businesses.find(x=>x.id===bid);if(!b)return;
    state.prod={step:1,images:[],draft:false,bid};renderProd();
  };
  function renderProd(){
    const s=state.prod.step,b=db.businesses.find(x=>x.id===state.prod.bid),cat=db.categories.find(c=>c.id===b?.categoryId);
    let body='';
    if(s===1)body=`<div class="onboard-panel"><div class="onboard-field"><label class="onboard-label">PRODUCT PHOTOS</label><div class="onboard-upload" style="min-height:170px"><div style="font-size:34px">▣</div><strong>Add product photos</strong><span>Up to 8 images · First image is the main photo</span><input id="piFile" type="file" accept="image/*" multiple onchange="prodPhotos(this)">${state.prod.images.length?`<div class="photo-count">${state.prod.images.length} photo${state.prod.images.length>1?'s':''}</div>`:''}</div></div></div><div class="onboard-panel"><div style="font-size:11px;font-weight:950;margin-bottom:10px">CUSTOMER PREVIEW</div>${prodPreview()}</div>`;
    if(s===2)body=`<div class="onboard-panel"><div class="onboard-field"><label class="onboard-label">PRODUCT NAME *</label><input class="onboard-input" id="pn" value="${esc2(state.prod.pn||'')}" placeholder="e.g. Samsung 55-inch Smart TV"></div><div class="onboard-field"><label class="onboard-label">DESCRIPTION</label><textarea class="onboard-textarea" id="px" placeholder="Describe features, model, size and useful details...">${esc2(state.prod.px||'')}</textarea></div><div style="font-size:10px;color:#68736e">Category: <b>${esc2(cat?.name||'')}</b></div></div><div class="onboard-panel">${prodPreview()}</div>`;
    if(s===3)body=`<div class="onboard-panel"><div class="onboard-grid"><div class="onboard-field"><label class="onboard-label">PRICE (₹) *</label><input class="onboard-input" id="pp" type="number" min="0" value="${esc2(state.prod.pp||'')}" placeholder="1200"></div><div class="onboard-field"><label class="onboard-label">SALE PRICE (₹)</label><input class="onboard-input" id="pd" type="number" min="0" value="${esc2(state.prod.pd||'')}" placeholder="Optional"></div></div><div class="onboard-grid"><div class="onboard-field"><label class="onboard-label">STOCK *</label><input class="onboard-input" id="ps" type="number" min="0" value="${esc2(state.prod.ps||'')}" placeholder="25"></div><div class="onboard-field"><label class="onboard-label">UNIT</label><select class="onboard-select" id="pu"><option>piece</option><option>pair</option><option>set</option><option>box</option><option>kg</option><option>gram</option><option>litre</option><option>metre</option></select></div></div></div><div class="onboard-panel">${prodPreview()}</div>`;
    if(s===4)body=`<div class="onboard-panel">${prodPreview()}<div style="margin-top:14px;background:#eafff2;border:1px solid #c7f1d9;border-radius:13px;padding:12px;font-size:10px;color:#08753c">✓ Ready to publish. Customers will see this product in <b>${esc2(cat?.name||'')}</b>.</div></div>`;
    const titles=['Product photos','Product details','Price & stock','Ready to publish'];
    sheet(`<div class="onboard-top"><button class="onboard-back" onclick="${s===1?'closeModal()':'prodPrev()'}">${s===1?'×':'‹'}</button><div class="onboard-steptext">PRODUCT LISTING · ${s} OF 4</div></div><div class="onboard-progress"><i style="width:${s*25}%"></i></div><h2 class="onboard-title">${titles[s-1]}</h2><p class="onboard-sub">${s===1?'Start with clear photos.':s===2?'Add the information customers will search for.':s===3?'Set a price and keep availability accurate.':'Review how your product will appear to customers.'}</p>${body}<div class="onboard-actions">${s>1?'<button class="onboard-secondary" onclick="prodPrev()">Back</button>':''}<button class="onboard-draft" onclick="saveProductDraft()">${s===4?'Save draft':'Save draft'}</button><button class="onboard-primary" onclick="${s<4?'prodNext()':'saveProductV80()'}">${s<4?'Continue':'Publish product'}</button></div>`);
  }
  function captureProd(){['pn','px','pp','pd','ps','pu'].forEach(id=>{const e=document.getElementById(id);if(e)state.prod[id]=e.value;});}
  window.prodNext=function(){
    captureProd();const s=state.prod.step;
    if(s===2&&!state.prod.pn?.trim())return toast('Enter a product name');
    if(s===3&&(!state.prod.pp||Number(state.prod.pp)<0||state.prod.ps===''))return toast('Enter price and stock');
    state.prod.step=Math.min(4,s+1);renderProd();
  };
  window.prodPrev=function(){captureProd();state.prod.step=Math.max(1,state.prod.step-1);renderProd();};
  window.prodPhotos=async function(input){
    try{
      const files=[...(input.files||[])].slice(0,8);const out=[];
      for(const f of files){const fake={files:[f]};out.push(await window.imageFrom(fake));}
      state.prod.images=out;renderProd();
    }catch(e){toast(e.message||'Could not read product photo. Please choose it again.');}
  };
  function prodPreview(){
    const p=state.prod, img=p.images?.[0];
    return `<div class="product-preview"><div class="product-preview-img">${img?`<img src="${esc2(img)}">`:'<div class="noimg">▣</div>'}</div><div class="product-preview-info"><div class="product-preview-name">${esc2(p.pn||'Your product')}</div><div class="product-preview-desc">${esc2(p.px||'Product description will appear here.')}</div><div class="product-preview-price">${p.pd?`₹${Number(p.pd).toLocaleString('en-IN')} <span class="product-preview-old">₹${Number(p.pp||0).toLocaleString('en-IN')}</span>`:p.pp?`₹${Number(p.pp).toLocaleString('en-IN')}`:'₹—'}</div><div class="product-preview-stock">${p.ps!==undefined&&p.ps!==''?'✓ '+esc2(p.ps)+' '+esc2(p.pu||'piece')+' available':'Stock not set'}</div></div></div>`;
  }
  window.saveProductDraft=function(){
    captureProd();state.prod.draft=true;toast('Product saved as draft');
  };
  window.saveProductV80=function(){
    captureProd();
    if(!state.prod.pn?.trim())return toast('Enter a product name');
    if(!state.prod.pp||Number(state.prod.pp)<0)return toast('Enter a valid price');
    if(state.prod.ps==='')return toast('Enter available stock');
    const p={id:uid('prod'),businessId:state.prod.bid,categoryId:db.businesses.find(b=>b.id===state.prod.bid)?.categoryId,name:state.prod.pn.trim(),description:state.prod.px||'',price:Number(state.prod.pp||0),discountPrice:state.prod.pd?Number(state.prod.pd):0,stock:Number(state.prod.ps||0),reserved:0,unit:state.prod.pu||'piece',image:state.prod.images[0]||'',images:state.prod.images.slice(0,8)};
    db.products.push(p);save();closeModal();renderSeller();toast('Product published');
  };
})();



/* ===== legacy script 72 ===== */

(function(){
  function seller(){
    const u=typeof user==='function'?user():null;
    return u&&u.role==='seller'?u:null;
  }
  function owned(){
    const u=seller();
    return u?(db.businesses||[]).filter(b=>b.ownerId===u.id):[];
  }
  function escV(v){return typeof esc==='function'?esc(v):String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
  function syncSelected(id){
    currentBusiness=id||null;
    try{sellerSelectedBusiness=currentBusiness}catch(e){}
  }
  window.selectSellerBusiness=function(id){
    const bs=owned();
    if(!bs.some(b=>b.id===id))return;
    syncSelected(id);
    renderSelectedBusinessScreen();
  };

  window.renderSelectedBusinessScreen=function(){
    const root=document.getElementById('sellerContent');
    if(!root)return;
    const bs=owned();

    if(!bs.length){
      root.innerHTML=`
        <div class="selected-business-wrap">
          <div class="page-head"><div class="page-title">BUSINESSES</div></div>
          <button class="btn primary full selected-add-business" onclick="createBusiness()">+ ADD BUSINESS</button>
          <div class="empty"><strong>No businesses yet</strong><div style="margin-top:7px">Create your first business to start adding products.</div></div>
        </div>`;
      return;
    }

    if(!currentBusiness || !bs.some(b=>b.id===currentBusiness)) syncSelected(bs[0].id);
    const b=bs.find(x=>x.id===currentBusiness);
    if(!b){syncSelected(bs[0].id);return renderSelectedBusinessScreen();}

    const products=(db.products||[]).filter(p=>p.businessId===b.id);
    const cat=(db.categories||[]).find(c=>c.id===b.categoryId)?.name||b.category||'Local Business';

    root.innerHTML=`
      <div class="selected-business-wrap">
        <div class="page-head"><div class="page-title">BUSINESSES</div></div>

        <button class="btn primary full selected-add-business" onclick="createBusiness()">+ ADD NEW BUSINESS</button>

        <div class="selected-business-picker">
          <label>SELECT BUSINESS TO MANAGE</label>
          <select onchange="selectSellerBusiness(this.value)">
            ${bs.map(x=>`<option value="${escV(x.id)}" ${x.id===b.id?'selected':''}>${escV(x.name)}</option>`).join('')}
          </select>
          <div style="font-size:10px;color:#78847f;margin-top:7px">Only the selected business is shown below for editing, products and deletion.</div>
        </div>

        <div class="selected-business-card">
          <div class="selected-business-cover">
            ${b.cover?`<img src="${escV(b.cover)}" alt="">`:'<div style="height:100%;display:grid;place-items:center;color:#8a958f;font-size:11px">NO COVER IMAGE</div>'}
          </div>
          <div class="selected-business-main">
            <div class="selected-business-head">
              ${b.logo?`<img class="selected-business-logo" src="${escV(b.logo)}" alt="">`:'<div class="selected-business-logo" style="display:grid;place-items:center;font-size:24px">◎</div>'}
              <div>
                <div class="selected-business-name">${escV(b.name)}</div>
                <div class="selected-business-meta">${escV(cat)} · 📍 ${escV(b.locality||b.address||'Local business')}</div>
                <div class="selected-business-meta">${products.length} product${products.length===1?'':'s'} · ${b.delivery?'Delivery available':'Pickup only'}</div>
              </div>
            </div>

            <div class="selected-business-actions">
              <button class="btn primary" onclick="editBusinessProfile('${escV(b.id)}')">EDIT BUSINESS</button>
              <button class="btn danger" onclick="deleteSelectedBusinessV81()">DELETE BUSINESS</button>
            </div>
          </div>
        </div>

        <div class="selected-products-head">
          <div>
            <h3>PRODUCTS</h3>
            <div class="selected-products-count">Products belonging only to ${escV(b.name)}</div>
          </div>
          <button class="btn primary" onclick="addProduct('${escV(b.id)}')">+ ADD PRODUCT</button>
        </div>

        <div>
          ${products.length?products.map(p=>`
            <div class="selected-product">
              ${p.image?`<img class="selected-product-img" src="${escV(p.image)}" alt="">`:'<div class="selected-product-img" style="display:grid;place-items:center;font-size:22px">▣</div>'}
              <div class="selected-product-info">
                <b>${escV(p.name)}</b>
                <span>₹${Number(p.discountPrice||p.price||0).toLocaleString('en-IN')} · ${Number(p.stock||0)} ${escV(p.unit||'piece')} in stock</span>
              </div>
              <div class="selected-product-actions">
                <button class="btn secondary" onclick="editProduct('${escV(p.id)}')">EDIT</button>
                <button class="btn secondary" onclick="changeProductImage('${escV(p.id)}')">PHOTOS</button>
                <button class="btn danger" onclick="deleteSelectedProductV81('${escV(p.id)}')">DELETE</button>
              </div>
            </div>`).join(''):`<div class="selected-empty">No products in <b>${escV(b.name)}</b> yet.<br><button class="btn primary" style="margin-top:10px" onclick="addProduct('${escV(b.id)}')">+ ADD FIRST PRODUCT</button></div>`}
        </div>
      </div>`;
  };

  window.deleteSelectedProductV81=function(id){
    const p=(db.products||[]).find(x=>x.id===id);
    const b=p&&(db.businesses||[]).find(x=>x.id===p.businessId);
    const u=seller();
    if(!u||!p||!b||b.ownerId!==u.id)return toast('You can only delete your own products');
    if(b.id!==currentBusiness)return toast('Select this business first');
    if(!confirm(`Delete "${p.name}"? This cannot be undone.`))return;
    db.products=db.products.filter(x=>x.id!==id);
    db.cart=(db.cart||[]).filter(x=>x.productId!==id);
    save();
    renderSelectedBusinessScreen();
    toast('Product deleted');
  };

  window.deleteSelectedBusinessV81=function(){
    const u=seller(),bs=owned(),b=bs.find(x=>x.id===currentBusiness);
    if(!u||!b)return toast('Select a business first');
    if(!confirm(`Delete "${b.name}" and all its products, services and reservations? This cannot be undone.`))return;
    const pids=new Set((db.products||[]).filter(p=>p.businessId===b.id).map(p=>p.id));
    db.products=(db.products||[]).filter(p=>p.businessId!==b.id);
    db.services=(db.services||[]).filter(s=>s.businessId!==b.id);
    db.reservations=(db.reservations||[]).filter(r=>r.businessId!==b.id);
    db.cart=(db.cart||[]).filter(i=>!pids.has(i.productId));
    db.businesses=(db.businesses||[]).filter(x=>x.id!==b.id);
    const next=owned()[0]?.id||null;
    syncSelected(next);
    save();
    renderSelectedBusinessScreen();
    toast('Business deleted');
  };

  // Make the Businesses tab authoritative: it no longer renders every owned
  // business as cards. It renders one selected business from the dropdown.
  window.renderSellerBusinesses=function(){renderSelectedBusinessScreen();};

  // Keep dashboard/reservations selector behaviour intact, but sync the same
  // selected business so switching tabs doesn't unexpectedly change it.
  const oldSellerTab=window.sellerTab;
  window.sellerTab=function(tab){
    if(tab==='businesses'){
      const u=seller();
      if(!u){toast('Seller account required');return;}
      const bs=owned();
      if(!currentBusiness||!bs.some(b=>b.id===currentBusiness))syncSelected(bs[0]?.id||null);
      if(typeof oldSellerTab==='function') oldSellerTab.call(this,'businesses');
      setTimeout(renderSelectedBusinessScreen,0);
      return;
    }
    if(typeof oldSellerTab==='function')return oldSellerTab.apply(this,arguments);
  };

  // If any older navigation calls renderSellerTab directly, force the new
  // Businesses renderer when the active seller tab is Businesses.
  const oldRenderSellerTab=window.renderSellerTab;
  window.renderSellerTab=function(){
    const active=document.querySelector('#sellerNav button.active')?.dataset.sellerTab;
    if(active==='businesses')return renderSelectedBusinessScreen();
    if(typeof oldRenderSellerTab==='function')return oldRenderSellerTab.apply(this,arguments);
  };
})();



/* ===== legacy script 73 ===== */

(function(){
  'use strict';
  const previousStatus=window.sellerStatus;
  window.sellerStatus=function(id,status){
    const before=(db.reservations||[]).find(x=>String(x.id)===String(id));
    const businessId=before?.businessId || currentBusiness;
    window.__ordersBusinessSelected=true;
    if(businessId) currentBusiness=businessId;
    if(typeof previousStatus==='function') previousStatus.call(this,id,status);
    window.__ordersBusinessSelected=true;
    if(businessId) currentBusiness=businessId;
    setTimeout(function(){
      window.__ordersBusinessSelected=true;
      if(businessId) currentBusiness=businessId;
      if(typeof window.renderSellerReservations==='function') window.renderSellerReservations();
    },0);
  };
  window.sellerAcceptFromDetail=function(id){
    const r=(db.reservations||[]).find(x=>String(x.id)===String(id)); if(!r)return;
    window.__ordersBusinessSelected=true; currentBusiness=r.businessId;
    closeModal();
    if(typeof window.sellerStatus==='function') window.sellerStatus(id,'CONFIRMED');
  };
  window.sellerRejectFromDetail=function(id){
    const r=(db.reservations||[]).find(x=>String(x.id)===String(id)); if(!r)return;
    window.__ordersBusinessSelected=true; currentBusiness=r.businessId;
    closeModal();
    if(typeof window.sellerStatus==='function') window.sellerStatus(id,'REJECTED');
  };
})();



/* ===== legacy script 74 ===== */

(function(){
  'use strict';
  /* v140: localStorage quota repair. Images are the payload; never delete records. */
  function key(){return (typeof KEY!=='undefined'?KEY:'sortedDB');}
  function dataUrlSize(s){return typeof s==='string'&&s.indexOf('data:image/')===0?s.length:0;}
  function writeFresh(obj){
    var k=key(), raw=JSON.stringify(obj);
    try{localStorage.removeItem(k);localStorage.setItem(k,raw);return true;}catch(e){try{localStorage.removeItem(k);}catch(_){} return false;}
  }
  function normalize(obj,level){
    var o=JSON.parse(JSON.stringify(obj||{}));
    var products=o.products||[], services=o.services||[];
    /* First remove duplicate copies: p.image is already represented by p.images[0]. */
    products.forEach(function(p){
      if(Array.isArray(p.images)&&p.images.length){
        p.image=p.images[0]||p.image||'';
        if(level>=1) p.images=p.images.slice(0,1);
      }
    });
    services.forEach(function(s){
      if(Array.isArray(s.images)&&s.images.length){
        s.image=s.images[0]||s.image||'';
        if(level>=1) s.images=s.images.slice(0,1);
      }
    });
    /* At higher pressure, keep the primary photo but remove duplicate image
       strings from carts/reservations, which otherwise multiply storage usage. */
    if(level>=2){
      (o.cart||[]).forEach(function(x){if(x.images)x.images=[]; if(x.image && dataUrlSize(x.image)>150000)x.image='';});
      (o.reservations||[]).forEach(function(r){(r.items||[]).forEach(function(x){if(x.images)x.images=[]; if(x.image && dataUrlSize(x.image)>150000)x.image='';});});
    }
    /* If still over quota, remove only secondary product/service images first. */
    if(level>=3){
      products.forEach(function(p){if(p.image && dataUrlSize(p.image)>180000)p.image='';});
      services.forEach(function(s){if(s.image && dataUrlSize(s.image)>180000)s.image='';});
    }
    return o;
  }
  window.sortedStorageRepair=function(){
    try{
      var raw=localStorage.getItem(key()); if(!raw)return true;
      var obj=JSON.parse(raw);
      if(raw.length<2500000)return true;
      for(var level=1;level<=3;level++){
        var compact=normalize(obj,level);
        if(writeFresh(compact)){ if(typeof db!=='undefined')db=compact; return true; }
      }
    }catch(e){}
    return false;
  };
  /* Run once after the app has initialized, before the next upload. */
  setTimeout(function(){try{window.sortedStorageRepair();}catch(e){}},1200);

  /* Replace the final save with a quota-aware version. It retries after removing
     redundant image copies, so "memory/storage full" is no longer the normal path. */
  var oldSave=window.save;
  window.save=function(){
    if(typeof oldSave!=='function')return false;
    try{var ok=oldSave.apply(this,arguments);if(ok!==false)return true;}catch(e){}
    try{
      var obj=normalize(typeof db!=='undefined'?db:{},1);
      if(writeFresh(obj)){if(typeof db!=='undefined')db=obj;return true;}
      obj=normalize(obj,2);
      if(writeFresh(obj)){if(typeof db!=='undefined')db=obj;return true;}
      obj=normalize(obj,3);
      if(writeFresh(obj)){if(typeof db!=='undefined')db=obj;return true;}
    }catch(e){}
    try{if(typeof toast==='function')toast('Storage is full. Remove an old image from this device, then try again.');}catch(_){}
    return false;
  };
})();



/* ===== legacy script 75 ===== */

(function(){
  'use strict';
  const SB = window.sortedSupabase;
  if(!SB) return;

  const LOCAL_UID_KEY='SORTED_SUPABASE_UID';
  const mapKey='SORTED_SUPABASE_MAP_V1';
  let syncTimer=null, syncing=false;

  function mapping(){
    try{return JSON.parse(localStorage.getItem(mapKey)||'{}')||{};}catch(e){return {};}
  }
  function saveMapping(m){try{localStorage.setItem(mapKey,JSON.stringify(m));}catch(e){}}
  function remoteId(type, localId){
    const m=mapping();
    m[type]=m[type]||{};
    if(m[type][localId]) return m[type][localId];
    const id=crypto.randomUUID(); m[type][localId]=id; saveMapping(m); return id;
  }
  function remember(type, remote, local){
    const m=mapping(); m[type]=m[type]||{}; m[type][local]=remote; saveMapping(m);
  }
  function localByRemote(type, remote){
    const m=mapping()[type]||{};
    for(const k in m) if(m[k]===remote) return k;
    return null;
  }
  function currentLocalUser(){
    try{return (db.users||[]).find(u=>u.id===db.session)||null;}catch(e){return null;}
  }
  function roleOf(profile){return ['buyer','seller','admin'].includes(profile?.role)?profile.role:'buyer';}

  async function ensureLocalProfile(session){
    if(!session?.user) return null;
    const supabaseUserId=session.user.id;
    localStorage.setItem(LOCAL_UID_KEY,supabaseUserId);
    const {data:profile}=await SB.from('profiles').select('*').eq('id',supabaseUserId).maybeSingle();
    const name=profile?.name || session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'SORTED User';
    const role=roleOf(profile);
    let u=(db.users||[]).find(x=>x.supabaseUid===supabaseUserId);
    if(!u){
      u={id:uid('user'),name,contact:session.user.email||'',role,supabaseUid:supabaseUserId};
      db.users=db.users||[]; db.users.push(u);
    }else{
      u.name=name; u.contact=session.user.email||u.contact; u.role=role; u.supabaseUid=supabaseUserId;
    }
    db.session=u.id;
    try{localStorage.setItem(KEY,JSON.stringify(db));}catch(e){}
    return u;
  }

  async function signInEmail(contact,password){
    const email=String(contact||'').trim();
    if(!email.includes('@')){toast('Supabase login currently requires an email address. Phone OTP can be added later.');return null;}
    const {data,error}=await SB.auth.signInWithPassword({email,password});
    if(error){toast(error.message||'Login failed');return null;}
    const u=await ensureLocalProfile(data.session);
    return u;
  }

  window.loginAccount=async function(){
    const contact=document.getElementById('loginContact')?.value.trim()||'';
    const password=document.getElementById('loginPassword')?.value||'';
    if(!contact)return toast('Enter your email');
    if(!password)return toast('Enter your password');
    const u=await signInEmail(contact,password);
    if(!u)return;
    if(u.role==='seller'){
      const bs=(db.businesses||[]).filter(b=>b.ownerId===u.id);
      currentBusiness=bs[0]?.id||null;
      try{sellerSelectedBusiness=currentBusiness;}catch(e){}
      try{sellerSection='dashboard';sellerTabName='dashboard';}catch(e){}
      try{setSellerNav();}catch(e){}
      go('seller');
      try{renderSellerShell?.();}catch(e){try{renderSeller?.();}catch(_){}
      }
    }else{renderProfile();go('home');}
    scheduleSync();
    toast('Logged in successfully');
  };

  window.createAccount=async function(){
    const name=document.getElementById('authName')?.value.trim()||'SORTED User';
    const contact=document.getElementById('authContact')?.value.trim()||'';
    const password=document.getElementById('authPassword')?.value||'';
    const role=document.getElementById('authRole')?.value||'buyer';
    if(!contact.includes('@'))return toast('Please use an email address for signup.');
    if(password.length<6)return toast('Password must be at least 6 characters');
    const {data,error}=await SB.auth.signUp({email:contact,password,options:{data:{name,role},emailRedirectTo:'https://sortedadmin.github.io/SortedGPT/'} });
    if(error){toast(error.message||'Could not create account');return;}
    if(data.user){
      // Profile trigger creates the profile; if email confirmation is enabled,
      // the user will receive a confirmation email before first login.
      if(data.session){
        const u=await ensureLocalProfile(data.session);
        if(u?.role==='seller'){createBusiness();}else{renderProfile();go('home');}
      }else{
        toast('Account created. Check your email to confirm your account, then log in.');
        setAuthMode('login');
      }
    }
  };

  window.logout=async function(){
    try{await SB.auth.signOut();}catch(e){}
    db.session=null; currentBusiness=null;
    try{localStorage.removeItem(LOCAL_UID_KEY);localStorage.setItem(KEY,JSON.stringify(db));}catch(e){}
    try{updateRoleUI?.();go('home');}catch(e){}
    toast('Signed out');
  };

  async function upsertProfile(u,session){
    if(!session?.user||!u)return;
    await SB.from('profiles').upsert({
      id:session.user.id,name:u.name||'',phone:u.contact||'',email:session.user.email||u.contact||'',role:roleOf(u),
      avatar_url:u.avatar_url||null
    },{onConflict:'id'});
  }

  async function uploadDataUrl(bucket, path, dataUrl){
    if(!dataUrl || typeof dataUrl!=='string' || !dataUrl.startsWith('data:')) return dataUrl||'';
    try{
      const parts=dataUrl.split(',');
      const mime=(parts[0].match(/data:([^;]+)/)||[])[1]||'image/jpeg';
      const bytes=Uint8Array.from(atob(parts[1]),c=>c.charCodeAt(0));
      const blob=new Blob([bytes],{type:mime});
      const {error}=await SB.storage.from(bucket).upload(path,blob,{contentType:mime,upsert:true});
      if(error) throw error;
      const {data}=SB.storage.from(bucket).getPublicUrl(path);
      return data?.publicUrl||dataUrl;
    }catch(e){console.warn('SORTED storage upload failed',bucket,e);return dataUrl;}
  }

  async function syncCurrentUser(){
    if(syncing)return; syncing=true;
    try{
      const {data:{session}}=await SB.auth.getSession();
      if(!session?.user){syncing=false;return;}
      const u=await ensureLocalProfile(session); if(!u){syncing=false;return;}
      await upsertProfile(u,session);

      const businessMap={};
      for(const b of (db.businesses||[]).filter(x=>x.ownerId===u.id)){
        const rid=remoteId('businesses',b.id);
        let categoryId=null;
        const cat=(db.categories||[]).find(c=>c.id===b.categoryId);
        if(cat){
          let q=await SB.from('categories').select('id').eq('name',cat.name).eq('type',cat.type).limit(1).maybeSingle();
          if(!q.data){const ins=await SB.from('categories').insert({name:cat.name,type:cat.type,scope:cat.scope||'marketplace'}).select('id').single(); q=ins;}
          categoryId=q.data?.id||null;
        }
        let logo=b.logo||'',cover=b.cover||'';
        if(logo.startsWith('data:')) logo=await uploadDataUrl('business-images',session.user.id+'/'+rid+'-logo.jpg',logo);
        if(cover.startsWith('data:')) cover=await uploadDataUrl('business-images',session.user.id+'/'+rid+'-cover.jpg',cover);
        const row={id:rid,owner_id:session.user.id,name:b.name||'My Business',owner_name:b.ownerName||u.name,phone:b.phone||u.contact,category_id:categoryId,address:b.address||'',locality:b.locality||'',city:b.city||'Bhubaneswar',district:b.district||'',description:b.description||'',hours:b.hours||'',delivery:!!b.delivery,payment_policy:b.paymentPolicy||'Pay at store',logo_url:logo||null,cover_url:cover||null,approved:!!b.approved,active:b.active!==false};
        const res=await SB.from('businesses').upsert(row,{onConflict:'id'}).select().maybeSingle();
        if(res.error) console.warn('business sync',res.error);
        businessMap[b.id]=rid;
        b._supabaseId=rid; b.logo=logo; b.cover=cover;
      }

      for(const p of (db.products||[])){
        const b=(db.businesses||[]).find(x=>x.id===p.businessId);
        if(!b||b.ownerId!==u.id||!businessMap[b.id])continue;
        const rid=remoteId('products',p.id); let categoryId=null;
        const cat=(db.categories||[]).find(c=>c.id===p.categoryId);
        if(cat){const q=await SB.from('categories').select('id').eq('name',cat.name).eq('type','products').limit(1).maybeSingle(); categoryId=q.data?.id||null;}
        let image=p.image||'';
        if(image.startsWith('data:')) image=await uploadDataUrl('product-images',session.user.id+'/'+rid+'.jpg',image);
        const row={id:rid,business_id:businessMap[b.id],category_id:categoryId,name:p.name||'Product',price:Number(p.price)||0,discount_price:p.discountPrice==null?null:Number(p.discountPrice),stock:Number(p.stock)||0,unit:p.unit||'piece',description:p.description||'',image_url:image||null,active:p.available!==false};
        const res=await SB.from('products').upsert(row,{onConflict:'id'}).select().maybeSingle();
        if(res.error) console.warn('product sync',res.error); p._supabaseId=rid;p.image=image;
      }

      for(const s of (db.services||[])){
        const b=(db.businesses||[]).find(x=>x.id===s.businessId);
        if(!b||b.ownerId!==u.id||!businessMap[b.id])continue;
        const rid=remoteId('services',s.id); let categoryId=null;
        const cat=(db.categories||[]).find(c=>c.id===s.categoryId||c.name===s.category);
        if(cat){const q=await SB.from('categories').select('id').eq('name',cat.name).eq('type','services').limit(1).maybeSingle(); categoryId=q.data?.id||null;}
        let image=s.image || (Array.isArray(s.images)&&s.images[0]) || '';
        if(image.startsWith('data:')) image=await uploadDataUrl('service-images',session.user.id+'/'+rid+'.jpg',image);
        const row={id:rid,business_id:businessMap[b.id],category_id:categoryId,name:s.name||'Service',service_type:s.serviceType||'',starting_price:s.startingPrice==null||s.startingPrice===''?null:Number(s.startingPrice),duration:s.duration||'',description:s.description||'',service_area:s.serviceArea||'',image_url:image||null,active:s.available!==false};
        const res=await SB.from('services').upsert(row,{onConflict:'id'}).select().maybeSingle();
        if(res.error) console.warn('service sync',res.error); s._supabaseId=rid;s.image=image;
      }

      try{localStorage.setItem(KEY,JSON.stringify(db));}catch(e){}
    }finally{syncing=false;}
  }

  async function pullMarketplace(){
    try{
      const [bs,ps,ss,cats]=await Promise.all([
        SB.from('businesses').select('*').eq('active',true),
        SB.from('products').select('*').eq('active',true),
        SB.from('services').select('*').eq('active',true),
        SB.from('categories').select('*')
      ]);
      if(cats.data?.length){
        db.categories=db.categories||[];
        for(const c of cats.data){
          let lc=db.categories.find(x=>x._supabaseId===c.id || (x.name===c.name&&x.type===c.type));
          if(!lc){lc={id:uid('cat'),name:c.name,type:c.type,scope:c.scope||'marketplace',_supabaseId:c.id};db.categories.push(lc);}else lc._supabaseId=c.id;
        }
      }
      const bRemote=bs.data||[];
      for(const rb of bRemote){
        let b=db.businesses.find(x=>x._supabaseId===rb.id)||db.businesses.find(x=>x.name===rb.name&&x.city===rb.city);
        let ownerLocal=localByRemote('users',rb.owner_id);
        if(!ownerLocal){
          const {data:pr}=await SB.from('profiles').select('*').eq('id',rb.owner_id).maybeSingle();
          if(pr){let u=db.users.find(x=>x.supabaseUid===pr.id);if(!u){u={id:uid('user'),name:pr.name||'Seller',contact:pr.email||pr.phone||'',role:pr.role||'seller',supabaseUid:pr.id};db.users.push(u);}ownerLocal=u.id;}
        }
        const cat=db.categories.find(c=>c._supabaseId===rb.category_id);
        const obj={id:b?.id||uid('biz'),_supabaseId:rb.id,ownerId:ownerLocal||b?.ownerId||'',name:rb.name,ownerName:rb.owner_name||'',phone:rb.phone||'',categoryId:cat?.id||b?.categoryId||'',category:cat?.name||b?.category||'Local Business',address:rb.address||'',locality:rb.locality||'',city:rb.city||'Bhubaneswar',district:rb.district||'',description:rb.description||'',hours:rb.hours||'',delivery:!!rb.delivery,paymentPolicy:rb.payment_policy||'Pay at store',logo:rb.logo_url||'',cover:rb.cover_url||'',approved:!!rb.approved,active:rb.active!==false};
        if(b) Object.assign(b,obj); else db.businesses.push(obj);
      }
      for(const rp of (ps.data||[])){
        const b=db.businesses.find(x=>x._supabaseId===rp.business_id); if(!b)continue;
        let p=db.products.find(x=>x._supabaseId===rp.id);
        const cat=db.categories.find(c=>c._supabaseId===rp.category_id);
        const obj={id:p?.id||uid('product'),_supabaseId:rp.id,businessId:b.id,categoryId:cat?.id||b.categoryId||'',name:rp.name,price:Number(rp.price)||0,discountPrice:rp.discount_price==null?null:Number(rp.discount_price),stock:Number(rp.stock)||0,unit:rp.unit||'piece',description:rp.description||'',image:rp.image_url||'',available:rp.active!==false};
        if(p)Object.assign(p,obj);else db.products.push(obj);
      }
      for(const rs of (ss.data||[])){
        const b=db.businesses.find(x=>x._supabaseId===rs.business_id); if(!b)continue;
        let x=db.services.find(y=>y._supabaseId===rs.id);
        const cat=db.categories.find(c=>c._supabaseId===rs.category_id);
        const obj={id:x?.id||uid('service'),_supabaseId:rs.id,businessId:b.id,categoryId:cat?.id||'',category:cat?.name||'',providerName:b.name,name:rs.name,description:rs.description||'',startingPrice:rs.starting_price==null?'':Number(rs.starting_price),price:rs.starting_price==null?'':Number(rs.starting_price),serviceType:rs.service_type||'',duration:rs.duration||'',serviceArea:rs.service_area||'',available:rs.active!==false,image:rs.image_url||x?.image||'',images:(x?.images?.length?x.images:(rs.image_url?[rs.image_url]:[])),phone:b.phone||''};
        if(x)Object.assign(x,obj);else db.services.push(obj);
      }
      try{localStorage.setItem(KEY,JSON.stringify(db));}catch(e){}
      homeBusinesses();renderProfile();renderCart();renderOrders();
    }catch(e){console.warn('SORTED marketplace pull failed',e);}
  }

  function scheduleSync(){clearTimeout(syncTimer);syncTimer=setTimeout(()=>{syncCurrentUser();},700);}

  // After every existing local save, push the current user's cloud data.
  const originalSave=window.save;
  window.save=function(){
    const result=originalSave.apply(this,arguments);
    if(result!==false) scheduleSync();
    return result;
  };

  SB.auth.onAuthStateChange(async (event,session)=>{
    if(session?.user){
      await ensureLocalProfile(session);
      setTimeout(()=>{pullMarketplace();syncCurrentUser();},0);
    }else if(event==='SIGNED_OUT'){
      try{db.session=null;localStorage.setItem(KEY,JSON.stringify(db));}catch(e){}
    }
  });

  // Initial cloud session + marketplace load.
  (async function bootCloud(){
    try{
      const {data:{session}}=await SB.auth.getSession();
      if(session?.user){await ensureLocalProfile(session);}
      await pullMarketplace();
      if(session?.user) await syncCurrentUser();
      try{updateRoleUI?.();renderProfile();}catch(e){}
    }catch(e){console.warn('SORTED Supabase boot failed',e);}
  })();
})();



/* ===== legacy script 76 ===== */

(function(){
  'use strict';
  // Final service detail fix: use the actual local db variable, not window.db.
  function serviceById(id){ return (typeof db!=='undefined' ? (db.services||[]) : []).find(function(x){return String(x.id)===String(id);}); }
  function businessById(id){ return (typeof db!=='undefined' ? (db.businesses||[]) : []).find(function(x){return String(x.id)===String(id);}); }
  window.showServiceDetail=function(id){
    var s=serviceById(id), b=s&&businessById(s.businessId);
    if(!s||!b){ if(typeof toast==='function')toast('Service not found'); return; }
    var imgs=(Array.isArray(s.images)&&s.images.length?s.images:[]).filter(Boolean);
    if(!imgs.length && s.image) imgs=[s.image];
    var gallery=imgs.length ? '<div class="service-detail-gallery">'+imgs.map(function(x){return '<img src="'+esc(String(x))+'" alt="'+esc(s.name||'Service')+'" loading="lazy">';}).join('')+'</div>' : '<div class="service-detail-hero" style="display:grid;place-items:center;font-size:56px">🛠️</div>';
    var price=(s.price!=null&&s.price!=='')?'From ₹'+Number(s.price).toLocaleString('en-IN'):(s.startingPrice?'From ₹'+Number(s.startingPrice).toLocaleString('en-IN'):'Price on request');
    openModal('<button class="close" onclick="closeModal()">×</button><h2>'+esc(s.name||'Service')+'</h2><div class="muted">'+esc(b.name||'Provider')+'</div>'+gallery+'<div class="row" style="margin-top:10px;gap:8px;flex-wrap:wrap"><span class="status">'+esc(s.category||'Services')+'</span><span class="status">'+esc(s.serviceType||'Service')+'</span><span class="status">'+esc(price)+'</span>'+(s.duration?'<span class="status">'+esc(s.duration)+'</span>':'')+'</div>'+(s.description?'<p style="line-height:1.55">'+esc(s.description)+'</p>':'<p class="muted">No description provided.</p>')+(s.serviceArea?'<div class="muted" style="margin-top:8px">📍 '+esc(s.serviceArea)+'</div>':'')+'<button class="btn primary full" style="margin-top:16px" onclick="closeModal();bookService(\''+esc(s.id)+'\')">BOOK NOW</button>');
  };
  // Ensure service bookings always appear in buyer Orders and carry userId.
  window.renderOrders=window.renderOrders||function(){};
  document.addEventListener('DOMContentLoaded',function(){ try{ if(typeof renderOrders==='function')renderOrders(); }catch(e){} });
  // Accept/reject PENDING service requests in the seller Orders view.
  var oldSellerStatus=window.sellerStatus;
  window.sellerStatus=async function(id,status){
    if(typeof oldSellerStatus==='function') await oldSellerStatus.apply(this,arguments);
    try{ if(typeof renderSellerReservations==='function')renderSellerReservations(); }catch(e){}
  };
})();



/* ===== legacy script 77 ===== */

(function(){
  window.__sortedOriginalOpenOrderDetails=window.openOrderDetails;
  window.renderOrders=function(){
    var list=(db.reservations||[]).filter(function(r){return String(r.userId||r.customerId||'')===String(db.session);}).slice().reverse();
    var el=document.getElementById('ordersList'); if(!el)return;
    el.innerHTML=list.length?list.map(function(r){
      var b=(db.businesses||[]).find(function(x){return String(x.id)===String(r.businessId);});
      var isService=String(r.type||'')==='SERVICE_BOOKING';
      var title=isService?(r.serviceName||'Service booking'):(r.number||'Order');
      var details=isService?'<div style="margin-top:9px"><b>'+esc(title)+'</b></div><div class="muted" style="margin-top:6px">'+esc(r.date||'')+(r.time?' · '+esc(r.time):'')+'</div>':(r.items||[]).slice(0,3).map(function(i){return '<div style="margin-top:9px">'+esc(i.name)+' × '+Number(i.qty||0)+'</div>';}).join('');
      return '<button class="card" style="width:100%;text-align:left;display:block;cursor:pointer" onclick="openOrderDetails(\''+esc(r.id)+'\')"><div class="row"><b>'+esc(title)+'</b><span class="status">'+esc(r.status||'PENDING')+'</span></div><div class="muted" style="margin-top:5px">'+esc(b?.name||'Provider')+'</div>'+details+'<div class="muted" style="margin-top:7px">₹'+Number(r.total||r.price||0).toLocaleString('en-IN')+(isService?' · Service booking':' · '+(r.method==='delivery'?'Home Delivery':'Self Pickup'))+'</div><div class="muted" style="margin-top:8px;font-size:11px">TAP TO VIEW DETAILS</div></button>';
    }).join(''):'<div class="empty"><strong>No orders yet</strong>Your confirmed and previous orders will appear here.</div>';
  };
  window.openOrderDetails=function(id){
    var r=(db.reservations||[]).find(function(x){return String(x.id)===String(id)&&String(x.userId||x.customerId||'')===String(db.session);}); if(!r)return;
    if(String(r.type||'')==='SERVICE_BOOKING' && typeof window.openServiceBookingDetails==='function'){window.openServiceBookingDetails(r.id);return;}
    // Let the app's original product-order detail function handle normal orders.
    try{ if(typeof window.__sortedOriginalOpenOrderDetails==='function')return window.__sortedOriginalOpenOrderDetails(id); }catch(e){}
    if(typeof toast==='function')toast('Order details unavailable');
  };
})();



/* ===== legacy script 78 ===== */

(function(){
  try{
    db.services=db.services||[];
    const serviceBusinesses=(db.businesses||[]).filter(b=>b.businessType==='services');
    let changed=false;
    db.services.forEach(s=>{
      const current=(db.businesses||[]).find(b=>String(b.id)===String(s.businessId));
      const provider=String(s.providerName||'').trim().toLowerCase();
      if(provider){
        const exact=serviceBusinesses.find(b=>String(b.name||'').trim().toLowerCase()===provider);
        if(exact && (!current || current.businessType!=='services' || String(current.name||'').trim().toLowerCase()!==provider)){
          s.businessId=exact.id;
          s.ownerId=exact.ownerId;
          changed=true;
        }
      }
    });
    if(changed && typeof save==='function')save();

    // Ensure service profiles always use the business that was clicked.
    const oldShow=window.showBusinessProfile;
    if(oldShow && !window.__v101ShowPatched){
      window.__v101ShowPatched=true;
      window.showBusinessProfile=function(id,noHistory){
        currentBusiness=id;
        return oldShow(id,noHistory);
      };
    }
  }catch(e){ console.warn('v101 service repair:',e); }
})();



/* ===== legacy script 79 ===== */

(function(){
  // Repair legacy service records so services created before the service-specific
  // form still appear under Services -> Category -> Business -> Services.
  try{
    db.services=db.services||[]; db.categories=db.categories||[]; db.businesses=db.businesses||[];
    let changed=false;
    db.services.forEach(s=>{
      const b=db.businesses.find(x=>String(x.id)===String(s.businessId)) ||
              db.businesses.find(x=>x.businessType==='services' && String(x.name||'').trim().toLowerCase()===String(s.providerName||'').trim().toLowerCase());
      if(b){
        if(!s.businessId){s.businessId=b.id;changed=true;}
        if(!s.ownerId){s.ownerId=b.ownerId;changed=true;}
        if(!s.providerName){s.providerName=b.name;changed=true;}
        if(!s.categoryId){
          const wanted=String(s.category||'').trim().toLowerCase();
          const cat=(db.categories||[]).find(c=>c.type==='services' && String(c.name||'').trim().toLowerCase()===wanted)
                  ||(db.categories||[]).find(c=>c.type==='services' && String(c.id)===String(b.categoryId));
          if(cat){s.categoryId=cat.id;s.category=cat.name;changed=true;}
        }
        if(!s.category){
          const cat=(db.categories||[]).find(c=>c.type==='services' && String(c.id)===String(s.categoryId||b.categoryId));
          if(cat){s.category=cat.name;changed=true;}
        }
      }
    });
    if(changed && typeof save==='function')save();
  }catch(e){console.warn('service repair',e)}

  function seller(){return typeof user==='function'?user():null;}
  function selectedServiceBusiness(){
    const u=seller(); if(!u||u.role!=='seller')return null;
    const id=window.currentBusiness || window.sellerSelectedBusiness || null;
    return (db.businesses||[]).find(b=>String(b.id)===String(id)&&b.ownerId===u.id&&b.businessType==='services')
      || (db.businesses||[]).find(b=>b.ownerId===u.id&&b.businessType==='services') || null;
  }
  function serviceCats(){return (db.categories||[]).filter(c=>c.type==='services' && (c.scope==='marketplace'||!c.scope));}

  window.addService=function(){
    const u=seller(); if(!u||u.role!=='seller')return;
    const b=selectedServiceBusiness();
    if(!b)return toast('Open a service business first');
    const cats=serviceCats();
    if(!cats.length)return toast('Add a service category first');
    openModal(`<button class="close" onclick="closeModal()">×</button>
      <h2>Add Service</h2>
      <div class="notice"><b>${esc(b.name)}</b><br><span class="muted">Service business · ${esc(b.category||'Services')}</span></div>
      <div class="field"><label>SERVICE NAME</label><input id="sn" placeholder="e.g. Mathematics Tuition"></div>
      <div class="field"><label>SERVICE CATEGORY</label><select id="sc">${cats.map(c=>`<option value="${esc(c.id)}" ${String(c.id)===String(b.categoryId)?'selected':''}>${esc(c.name)}</option>`).join('')}</select></div>
      <div class="field"><label>SERVICE TYPE</label><select id="st"><option>Tutoring / Education</option><option>Consultation</option><option>Repair / Maintenance</option><option>Personal Service</option><option>Professional Service</option><option>Other</option></select></div>
      <div class="field"><label>STARTING PRICE (OPTIONAL)</label><input id="sp" type="number" min="0" placeholder="500"></div>
      <div class="field"><label>DURATION / SESSION</label><input id="sd" placeholder="e.g. 1 hour"></div>
      <div class="field"><label>DESCRIPTION</label><textarea id="sx" placeholder="Describe what the customer gets"></textarea></div>
      <div class="field"><label>SERVICE AREA</label><input id="sa" value="${esc(b.locality||'')}"></div>
      <button class="btn primary full" onclick="saveServiceForBusiness('${esc(b.id)}')">ADD SERVICE</button>`);
  };

  window.saveServiceForBusiness=function(bid){
    const u=seller(); if(!u||u.role!=='seller')return;
    const b=(db.businesses||[]).find(x=>String(x.id)===String(bid)&&x.ownerId===u.id&&x.businessType==='services');
    if(!b)return toast('Service business required');
    const name=document.getElementById('sn')?.value.trim();
    const categoryId=document.getElementById('sc')?.value;
    if(!name||!categoryId)return toast('Service name and category are required');
    const cat=(db.categories||[]).find(c=>String(c.id)===String(categoryId)&&c.type==='services');
    if(!cat)return toast('Please select a valid service category');
    db.services=db.services||[];
    db.services.push({
      id:uid('service'),businessId:b.id,ownerId:u.id,providerName:b.name,name,
      description:document.getElementById('sx')?.value.trim()||'',
      categoryId:cat.id,category:cat.name,
      serviceType:document.getElementById('st')?.value||'Other',
      duration:document.getElementById('sd')?.value.trim()||'',
      price:Number(document.getElementById('sp')?.value)||null,
      startingPrice:document.getElementById('sp')?.value||'',
      serviceArea:document.getElementById('sa')?.value.trim()||b.locality||'',
      available:true,phone:b.phone||''
    });
    if(typeof save==='function')save(); closeModal();
    if(typeof renderSeller==='function')renderSeller(); else if(typeof renderSellerTab==='function')renderSellerTab();
    toast('Service added successfully');
  };

  // Keep the seller's service-business screen service-only.
  const oldRenderSeller=window.renderSeller;
  window.renderSeller=function(){
    const u=seller();
    const b=selectedServiceBusiness();
    if(!u||u.role!=='seller'||!b){return oldRenderSeller?oldRenderSeller():undefined;}
    if(b.businessType!=='services')return oldRenderSeller?oldRenderSeller():undefined;
    document.body.classList.add('seller-mode');
    const services=(db.services||[]).filter(s=>String(s.businessId)===String(b.id));
    const reservations=(db.reservations||[]).filter(r=>String(r.businessId)===String(b.id));
    const content=document.getElementById('sellerContent'); if(!content)return;
    content.innerHTML=`
      <div class="page-head"><div class="page-title">SERVICE BUSINESS</div></div>
      <div class="service-manager-card">
        ${b.cover?`<div style="height:120px;border-radius:12px;overflow:hidden;margin-bottom:12px"><img src="${esc(b.cover)}" style="width:100%;height:100%;object-fit:cover"></div>`:''}
        <div class="row"><div style="display:flex;align-items:center;gap:10px">${b.logo?`<img src="${esc(b.logo)}" style="width:54px;height:54px;border-radius:14px;object-fit:cover">`:''}<div><h2 style="margin:0">${esc(b.name)}</h2><div class="muted">${esc(b.category||'Services')} · ${esc(b.locality||b.address||'')}</div></div></div></div>
      </div>
      <div class="dashboard-stats"><div class="stat-card"><b>${services.length}</b><span>SERVICES</span></div><div class="stat-card"><b>${reservations.length}</b><span>REQUESTS / ORDERS</span></div></div>
      <div class="dashboard-actions"><button class="btn primary" onclick="addService()">+ ADD SERVICE</button><button class="btn secondary" onclick="editBusiness('${esc(b.id)}')">EDIT BUSINESS</button></div>
      <div class="row" style="margin:14px 0 9px"><h3 style="margin:0">MY SERVICES</h3><span class="status">${services.length}</span></div>
      <div class="service-manager-card">${services.length?services.map(s=>`<div class="service-manager-item"><div class="row"><div style="min-width:0"><b>${esc(s.name)}</b><small class="muted" style="display:block;margin-top:4px">${esc(s.category||'Services')} · ${esc(s.serviceType||'Service')} · ${s.price?'From ₹'+Number(s.price).toLocaleString('en-IN'):'Price on request'}${s.duration?' · '+esc(s.duration):''}</small><small class="muted" style="display:block;margin-top:3px">${esc(s.description||'No description')}</small></div><button class="btn danger" onclick="deleteService('${esc(s.id)}')">REMOVE</button></div></div>`).join(''):'<div class="muted">No services yet. Tap + ADD SERVICE to create one.</div>'}</div>`;
  };

  window.editService=function(id){
    const u=seller(); if(!u||u.role!=='seller')return;
    const s=(db.services||[]).find(x=>String(x.id)===String(id)&&String(x.ownerId)===String(u.id));
    if(!s)return toast('Service not found');
    const b=(db.businesses||[]).find(x=>String(x.id)===String(s.businessId)&&String(x.ownerId)===String(u.id)&&x.businessType==='services');
    if(!b)return toast('Service business not found');
    const cats=serviceCats();
    openModal(`<button class="close" onclick="closeModal()">×</button><h2>Edit Service</h2>
      <div class="notice"><b>${esc(b.name)}</b><br><span class="muted">Service business · ${esc(b.category||'Services')}</span></div>
      <div class="field"><label>SERVICE NAME</label><input id="sn" value="${esc(s.name||'')}"></div>
      <div class="field"><label>SERVICE CATEGORY</label><select id="sc">${cats.map(c=>`<option value="${esc(c.id)}" ${String(c.id)===String(s.categoryId)?'selected':''}>${esc(c.name)}</option>`).join('')}</select></div>
      <div class="field"><label>SERVICE TYPE</label><select id="st"><option ${s.serviceType==='Tutoring / Education'?'selected':''}>Tutoring / Education</option><option ${s.serviceType==='Consultation'?'selected':''}>Consultation</option><option ${s.serviceType==='Repair / Maintenance'?'selected':''}>Repair / Maintenance</option><option ${s.serviceType==='Personal Service'?'selected':''}>Personal Service</option><option ${s.serviceType==='Professional Service'?'selected':''}>Professional Service</option><option ${s.serviceType==='Other'?'selected':''}>Other</option></select></div>
      <div class="field"><label>STARTING PRICE (OPTIONAL)</label><input id="sp" type="number" min="0" value="${esc(s.startingPrice||s.price||'')}"></div>
      <div class="field"><label>DURATION / SESSION</label><input id="sd" value="${esc(s.duration||'')}"></div>
      <div class="field"><label>DESCRIPTION</label><textarea id="sx">${esc(s.description||'')}</textarea></div>
      <div class="field"><label>SERVICE AREA</label><input id="sa" value="${esc(s.serviceArea||b.locality||'')}"></div>
      <button class="btn primary full" onclick="updateService('${esc(s.id)}')">SAVE SERVICE</button>`);
  };
  window.updateService=function(id){
    const u=seller(); if(!u||u.role!=='seller')return;
    const s=(db.services||[]).find(x=>String(x.id)===String(id)&&String(x.ownerId)===String(u.id)); if(!s)return toast('Service not found');
    const cat=(db.categories||[]).find(c=>String(c.id)===String(document.getElementById('sc')?.value)&&c.type==='services');
    const name=document.getElementById('sn')?.value.trim(); if(!name||!cat)return toast('Service name and category are required');
    s.name=name; s.categoryId=cat.id; s.category=cat.name; s.serviceType=document.getElementById('st')?.value||'Other'; s.startingPrice=document.getElementById('sp')?.value.trim()||''; s.price=Number(s.startingPrice)||null; s.duration=document.getElementById('sd')?.value.trim()||''; s.description=document.getElementById('sx')?.value.trim()||''; s.serviceArea=document.getElementById('sa')?.value.trim()||'';
    save(); closeModal(); if(window.__businessManagementSelected&&typeof window.__v129Detail==='function')window.__v129Detail(s.businessId); else renderSeller(); toast('Service updated');
  };
  window.deleteService=function(id){
    const u=seller(); const s=(db.services||[]).find(x=>String(x.id)===String(id));
    if(!u||!s||String(s.ownerId)!==String(u.id))return toast('Service not found');
    if(!confirm(`Remove "${s.name}"?`))return;
    db.services=db.services.filter(x=>String(x.id)!==String(id));
    if(typeof save==='function')save();
    renderSeller(); toast('Service removed');
  };
})();



/* ===== legacy script 80 ===== */

(function(){
  function sync(){
    var sel=document.getElementById('bc');
    if(sel && typeof state!=='undefined' && state.biz && sel.value) state.biz.bc=sel.value;
  }
  document.addEventListener('change',function(e){
    if(e.target && e.target.id==='bc') sync();
  },true);
})();



/* ===== legacy script 81 ===== */

(function(){
'use strict';
function seller(){try{var u=typeof user==='function'?user():null;return u&&String(u.role).toLowerCase()==='seller'?u:null}catch(e){return null}}
function businesses(){var u=seller();return u?(db.businesses||[]).filter(function(b){return String(b.ownerId)===String(u.id)}):[]}
function esc120(v){return typeof esc==='function'?esc(v):String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function counts(id){
 var rs=(db.reservations||[]).filter(function(r){return String(r.businessId)===String(id)});
 var fresh={'RESERVED':1,'AWAITING CUSTOMER OTP':1,'RESERVED — WAITING FOR SELLER CONFIRMATION':1,'ORDER CONFIRMED':1};
 var done={'COLLECTED':1,'DELIVERED':1,'REJECTED':1,'CANCELLED':1,'EXPIRED':1,'COMPLETED':1};
 var n=0,p=0;
 rs.forEach(function(r){var s=String(r.status||'RESERVED').toUpperCase();if(fresh[s])n++;else if(!done[s])p++});
 return {n:n,p:p}
}
function initials(name){return String(name||'Business').trim().split(/\s+/).slice(0,2).map(function(x){return x[0]}).join('').toUpperCase()||'B'}
window.selectSellerBusinessV120=function(id){
 var bs=businesses(),b=bs.find(function(x){return String(x.id)===String(id)});if(!b)return;
 currentBusiness=b.id;
 try{sellerSelectedBusiness=b.id}catch(e){}
 try{save()}catch(e){}
 if(typeof window.renderRichDashboard==='function')window.renderRichDashboard();
 else if(typeof window.renderSellerTab==='function')window.renderSellerTab();
 setTimeout(render,30);
};
function build(){
 var bs=businesses();if(!bs.length)return null;
 var selected=bs.find(function(b){return String(b.id)===String(currentBusiness)})||bs[0];
 currentBusiness=selected.id;
 var wrap=document.createElement('div');wrap.id='sortedV120BusinessSelector';
 wrap.innerHTML='<div class="v120-head"><b>YOUR BUSINESSES</b><span>Tap a business to switch</span></div>';
 var grid=document.createElement('div');grid.className='v120-business-grid';
 bs.forEach(function(b){
   var c=counts(b.id),card=document.createElement('button');card.type='button';
   card.className='v120-business-card'+(String(b.id)===String(selected.id)?' active':'');
   card.onclick=function(){window.selectSellerBusinessV120(b.id)};
   var logo=document.createElement('div');logo.className='v120-business-logo';
   if(b.logo){var img=document.createElement('img');img.src=b.logo;img.alt='';logo.appendChild(img)}else logo.textContent=initials(b.name);
   card.appendChild(logo);
   var name=document.createElement('div');name.className='v120-business-name';name.textContent=b.name||'Business';card.appendChild(name);
   var meta=document.createElement('div');meta.className='v120-business-meta';meta.textContent=(b.category||'Local Business')+' · '+(b.locality||b.address||'Local');card.appendChild(meta);
   var n=document.createElement('span');n.className='v120-badge v120-new';n.innerHTML=c.n+' <small>NEW</small>';card.appendChild(n);
   var p=document.createElement('span');p.className='v120-badge v120-pending';p.innerHTML=c.p+' <small>PENDING</small>';card.appendChild(p);
   if(String(b.id)===String(selected.id)){var s=document.createElement('span');s.className='v120-selected';s.textContent='SELECTED';card.appendChild(s)}
   grid.appendChild(card);
 });
  /* Homepage/Dashboard: business profiles only. Creation is handled from Businesses. */
  wrap.appendChild(grid);return wrap;
}
function render(){
 var root=document.getElementById('sellerContent');if(!root||!document.body.classList.contains('seller-mode'))return;
 var title=root.querySelector('.page-title');if(!title||String(title.textContent||'').trim().toUpperCase()!=='DASHBOARD')return;
 root.querySelectorAll('.field').forEach(function(f){
   var l=f.querySelector('label'),t=String(l&&l.textContent||'').trim().toUpperCase();
   if(t==='SELECT BUSINESS'||t==='BUSINESS')f.remove();
 });
 root.querySelectorAll('#sortedV120BusinessSelector').forEach(function(x){x.remove()});
 var selector=build();if(!selector)return;
 var head=title.closest('.page-head');if(head)head.insertAdjacentElement('afterend',selector);else root.insertBefore(selector,root.firstChild);
}
window.refreshSortedBusinessCardsV120=render;
function start(){
 var root=document.getElementById('sellerContent');
 if(root)new MutationObserver(function(){clearTimeout(window.__v120);window.__v120=setTimeout(render,10)}).observe(root,{childList:true,subtree:true});
 [50,200,500,1000].forEach(function(t){setTimeout(render,t)});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();



/* ===== legacy script 88 ===== */

(function(){
  function forceSellerNav(){
    var n=document.getElementById('sellerNav');
    if(!n) return;
    var light=document.documentElement.getAttribute('data-theme')==='light' || document.body.classList.contains('seller-mode');
    if(light){
      n.style.setProperty('background','#ffffff','important');
      n.style.setProperty('background-color','#ffffff','important');
      n.style.setProperty('border-top','1px solid #e2e7e4','important');
      n.style.setProperty('box-shadow','0 -8px 28px rgba(16,54,35,.08)','important');
      n.querySelectorAll('button').forEach(function(b){
        b.style.setProperty('background','transparent','important');
        b.style.setProperty('color',b.classList.contains('active')?'#08753c':'#727b76','important');
      });
    }
  }
  document.addEventListener('DOMContentLoaded',forceSellerNav);
  window.addEventListener('load',forceSellerNav);
  setInterval(forceSellerNav,250);
  new MutationObserver(forceSellerNav).observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});
  new MutationObserver(forceSellerNav).observe(document.body,{attributes:true,attributeFilter:['class']});
})();



/* ===== legacy script 89 ===== */

(function(){
'use strict';
var escFn=window.esc||function(v){return String(v??'').replace(/[&<>"']/g,function(c){return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])});};
function seller(){try{return typeof user==='function'?user():null}catch(e){return null}}
function servicesFor(bid){return (db.services||[]).filter(function(s){return String(s.businessId)===String(bid)});}
function serviceCats(){return (db.categories||[]).filter(function(c){return c.type==='services'&&(c.scope==='marketplace'||!c.scope)});}
function isEducation(s,b){var c=String(s.category||b.category||'').toLowerCase(), t=String(s.serviceType||'').toLowerCase(); return /education|tution|tuition|study|coaching|school|college|math|academic/.test(c+' '+t);}
function needsVehicle(s,b){var c=String(s.category||b.category||'').toLowerCase(), t=String(s.serviceType||'').toLowerCase(); return /vehicle|automobile|auto repair|car|bike|motor|transport|driving/.test(c+' '+t);}
function needsAddress(s,b){var c=String(s.category||b.category||'').toLowerCase(), t=String(s.serviceType||'').toLowerCase(); return /home|repair|maintenance|plumb|electric|clean|ac /.test(c+' '+t);}

/* ---------- SERVICE MANAGEMENT ---------- */
window.addService=function(){
  var u=seller(); if(!u||u.role!=='seller')return;
  var b=(db.businesses||[]).find(function(x){return String(x.id)===String(currentBusiness)&&x.ownerId===u.id&&x.businessType==='services'}) || (db.businesses||[]).find(function(x){return x.ownerId===u.id&&x.businessType==='services'});
  if(!b)return toast('Open a service business first');
  var cats=serviceCats(); if(!cats.length)return toast('Add a service category first');
  openModal('<button class="close" onclick="closeModal()">×</button><h2>Add Service</h2>'+
    '<div class="notice"><b>'+escFn(b.name)+'</b><br><span class="muted">Service business · '+escFn(b.category||'Services')+'</span></div>'+
    '<div class="field"><label>SERVICE PHOTOS</label><input id="svcPhotoFile" type="file" accept="image/*" multiple onchange="previewMultiUpload(this,\'svcPhotoPreview\')"><div id="svcPhotoPreview" class="multi-upload-preview"></div><small class="muted">Add up to 6 photos. The first photo is the main service photo.</small></div>'+
    '<div class="field"><label>SERVICE NAME</label><input id="sn" placeholder="e.g. Mathematics Tuition"></div>'+
    '<div class="field"><label>SERVICE CATEGORY</label><select id="sc">'+cats.map(function(c){return '<option value="'+escFn(c.id)+'" '+(String(c.id)===String(b.categoryId)?'selected':'')+'>'+escFn(c.name)+'</option>'}).join('')+'</select></div>'+
    '<div class="field"><label>SERVICE TYPE</label><select id="st"><option>Tutoring / Education</option><option>Consultation</option><option>Repair / Maintenance</option><option>Personal Service</option><option>Professional Service</option><option>Other</option></select></div>'+
    '<div class="field"><label>STARTING PRICE (OPTIONAL)</label><input id="sp" type="number" min="0" placeholder="500"></div>'+
    '<div class="field"><label>DURATION / SESSION</label><input id="sd" placeholder="e.g. 1 hour"></div>'+
    '<div class="field"><label>DESCRIPTION</label><textarea id="sx" placeholder="Describe what the customer gets"></textarea></div>'+
    '<div class="field"><label>SERVICE AREA</label><input id="sa" value="'+escFn(b.locality||'')+'"></div>'+
    '<button class="btn primary full" onclick="saveServiceForBusinessV138(\''+escFn(b.id)+'\')">ADD SERVICE</button>');
};
window.saveServiceForBusinessV138=async function(bid){
  var u=seller(); if(!u||u.role!=='seller')return;
  var b=(db.businesses||[]).find(function(x){return String(x.id)===String(bid)&&x.ownerId===u.id&&x.businessType==='services'}); if(!b)return toast('Service business required');
  var name=document.getElementById('sn')?.value.trim(), categoryId=document.getElementById('sc')?.value;
  if(!name||!categoryId)return toast('Service name and category are required');
  var cat=(db.categories||[]).find(function(c){return String(c.id)===String(categoryId)&&c.type==='services'}); if(!cat)return toast('Please select a valid service category');
  var images=[];
  try{if(document.getElementById('svcPhotoFile')?.files?.length)images=(await imageFromMany('svcPhotoFile')).slice(0,6);}catch(e){return toast(e.message||'Could not read service photos');}
  db.services=db.services||[];
  db.services.push({id:uid('service'),businessId:b.id,ownerId:u.id,providerName:b.name,name,description:document.getElementById('sx')?.value.trim()||'',categoryId:cat.id,category:cat.name,serviceType:document.getElementById('st')?.value||'Other',duration:document.getElementById('sd')?.value.trim()||'',price:Number(document.getElementById('sp')?.value)||null,startingPrice:document.getElementById('sp')?.value||'',serviceArea:document.getElementById('sa')?.value.trim()||b.locality||'',images:images,image:images[0]||'',available:true,phone:b.phone||''});
  try{save()}catch(e){return toast('Could not save service. Try fewer or smaller photos.');}
  closeModal(); renderV138BusinessDetail(b.id); toast('Service added successfully');
};
window.editServiceV138=function(id){
  var u=seller(); if(!u||u.role!=='seller')return;
  var s=(db.services||[]).find(function(x){return String(x.id)===String(id)&&String(x.ownerId)===String(u.id)}); if(!s)return toast('Service not found');
  var b=(db.businesses||[]).find(function(x){return String(x.id)===String(s.businessId)&&String(x.ownerId)===String(u.id)&&x.businessType==='services'}); if(!b)return toast('Service business not found');
  var cats=serviceCats(), imgs=Array.isArray(s.images)&&s.images.length?s.images:(s.image?[s.image]:[]);
  openModal('<button class="close" onclick="closeModal()">×</button><h2>Edit Service</h2>'+
    '<div class="notice"><b>'+escFn(b.name)+'</b><br><span class="muted">'+escFn(b.category||'Services')+'</span></div>'+
    '<div class="field"><label>SERVICE PHOTOS</label><input id="svcEditPhotoFile" type="file" accept="image/*" multiple onchange="previewMultiUpload(this,\'svcEditPhotoPreview\')"><div id="svcEditPhotoPreview" class="multi-upload-preview">'+imgs.map(function(x,i){return '<div><img src="'+escFn(x)+'" alt=""><small>Photo '+(i+1)+'</small></div>'}).join('')+'</div><div style="display:flex;gap:7px;margin-top:7px"><button type="button" class="btn secondary" onclick="removeServicePhotosV138(\''+escFn(s.id)+'\')">REMOVE PHOTOS</button></div><small class="muted">Selecting new photos replaces the current service gallery.</small></div>'+
    '<div class="field"><label>SERVICE NAME</label><input id="sn" value="'+escFn(s.name||'')+'"></div>'+
    '<div class="field"><label>SERVICE CATEGORY</label><select id="sc">'+cats.map(function(c){return '<option value="'+escFn(c.id)+'" '+(String(c.id)===String(s.categoryId)?'selected':'')+'>'+escFn(c.name)+'</option>'}).join('')+'</select></div>'+
    '<div class="field"><label>SERVICE TYPE</label><select id="st"><option '+(s.serviceType==='Tutoring / Education'?'selected':'')+'>Tutoring / Education</option><option '+(s.serviceType==='Consultation'?'selected':'')+'>Consultation</option><option '+(s.serviceType==='Repair / Maintenance'?'selected':'')+'>Repair / Maintenance</option><option '+(s.serviceType==='Personal Service'?'selected':'')+'>Personal Service</option><option '+(s.serviceType==='Professional Service'?'selected':'')+'>Professional Service</option><option '+(s.serviceType==='Other'?'selected':'')+'>Other</option></select></div>'+
    '<div class="field"><label>STARTING PRICE (OPTIONAL)</label><input id="sp" type="number" min="0" value="'+escFn(s.startingPrice||s.price||'')+'"></div>'+
    '<div class="field"><label>DURATION / SESSION</label><input id="sd" value="'+escFn(s.duration||'')+'"></div>'+
    '<div class="field"><label>DESCRIPTION</label><textarea id="sx">'+escFn(s.description||'')+'</textarea></div>'+
    '<div class="field"><label>SERVICE AREA</label><input id="sa" value="'+escFn(s.serviceArea||b.locality||'')+'"></div>'+
    '<button class="btn primary full" onclick="updateServiceV138(\''+escFn(s.id)+'\')">SAVE SERVICE</button>');
};
window.updateServiceV138=async function(id){
  var u=seller(),s=(db.services||[]).find(function(x){return String(x.id)===String(id)&&String(x.ownerId)===String(u?.id)}); if(!s)return toast('Service not found');
  var cat=(db.categories||[]).find(function(c){return String(c.id)===String(document.getElementById('sc')?.value)&&c.type==='services'}); var name=document.getElementById('sn')?.value.trim(); if(!name||!cat)return toast('Service name and category are required');
  try{var input=document.getElementById('svcEditPhotoFile');if(input?.files?.length){var ims=(await imageFromMany('svcEditPhotoFile')).slice(0,6);s.images=ims;s.image=ims[0]||'';}}catch(e){return toast(e.message||'Could not read service photos');}
  s.name=name;s.categoryId=cat.id;s.category=cat.name;s.serviceType=document.getElementById('st')?.value||'Other';s.startingPrice=document.getElementById('sp')?.value.trim()||'';s.price=Number(s.startingPrice)||null;s.duration=document.getElementById('sd')?.value.trim()||'';s.description=document.getElementById('sx')?.value.trim()||'';s.serviceArea=document.getElementById('sa')?.value.trim()||'';
  try{save()}catch(e){return toast('Could not save service');} closeModal();renderV138BusinessDetail(s.businessId);toast('Service updated');
};
window.removeServicePhotosV138=function(id){var s=(db.services||[]).find(function(x){return String(x.id)===String(id)});if(!s)return;s.images=[];s.image='';save();closeModal();renderV138BusinessDetail(s.businessId);toast('Service photos removed');};
window.deleteService=function(id){var u=seller(),s=(db.services||[]).find(function(x){return String(x.id)===String(id)});if(!u||!s||String(s.ownerId)!==String(u.id))return toast('Service not found');if(!confirm('Remove "'+s.name+'"?'))return;db.services=db.services.filter(function(x){return String(x.id)!==String(id)});save();renderV138BusinessDetail(s.businessId);toast('Service removed');};

function renderV138BusinessList(){
  var el=document.getElementById('sellerContent');if(!el)return;var u=seller();if(!u||u.role!=='seller')return;
  var bs=(db.businesses||[]).filter(function(b){return b.ownerId===u.id});
  el.innerHTML='<div class="page-head"><div class="page-title">BUSINESSES</div></div><div class="orders-business-heading"><b>YOUR BUSINESSES</b><span>Select a business to manage its details, photos, products or services</span></div>'+(bs.length?'<div class="business-profile-selector">'+bs.map(function(b){var svc=b.businessType==='services',items=svc?servicesFor(b.id):(db.products||[]).filter(function(p){return String(p.businessId)===String(b.id)}),cat=(db.categories||[]).find(function(c){return String(c.id)===String(b.categoryId)})?.name||b.category||'Local Business',img=b.logo||b.cover||'';return '<button type="button" class="business-profile-tile" onclick="openBusinessManagementV138(\''+escFn(b.id)+'\')"><div class="business-profile-avatar">'+(img?'<img src="'+escFn(img)+'" alt="" loading="lazy">':'🏪')+'</div><div class="business-profile-name">'+escFn(b.name)+'</div><div class="business-profile-meta">'+escFn(cat)+'</div><span class="business-profile-count">'+items.length+' '+(svc?'SERVICE':'PRODUCT')+(items.length===1?'':'S')+'</span></button>'}).join('')+'</div>':'<div class="empty"><strong>No businesses yet</strong></div>');
}
function renderV138BusinessDetail(id){
  var el=document.getElementById('sellerContent');if(!el)return;var u=seller(),b=(db.businesses||[]).find(function(x){return String(x.id)===String(id)&&x.ownerId===u?.id});if(!b)return renderV138BusinessList();
  currentBusiness=b.id;window.__businessManagementSelected=true;var svc=b.businessType==='services',cat=(db.categories||[]).find(function(c){return String(c.id)===String(b.categoryId)})?.name||b.category||(svc?'Services':'Local Business');
  var services=servicesFor(b.id),products=(db.products||[]).filter(function(p){return String(p.businessId)===String(b.id)}),items=svc?services:products;
  var rows=svc?(services.length?services.map(function(s){var imgs=Array.isArray(s.images)&&s.images.length?s.images:(s.image?[s.image]:[]);return '<div class="v138-service-row">'+(imgs[0]?'<img class="v138-service-photo" src="'+escFn(imgs[0])+'" loading="lazy">':'<div class="v138-service-photo-placeholder">🛠️</div>')+'<div class="v129-product-main"><b>'+escFn(s.name)+'</b><span class="muted" style="font-size:10px;display:block">'+escFn(s.category||'Services')+' · '+escFn(s.serviceType||'Service')+(s.price?' · From ₹'+Number(s.price).toLocaleString('en-IN'):'')+(s.duration?' · '+escFn(s.duration):'')+'</span><span class="muted" style="font-size:10px;display:block">'+escFn(s.description||'No description')+'</span></div><div class="v129-product-actions"><button class="btn secondary" onclick="editServiceV138(\''+escFn(s.id)+'\')">EDIT</button><button class="btn danger" onclick="deleteService(\''+escFn(s.id)+'\')">REMOVE</button></div></div>'}).join(''):'<div class="empty"><strong>No services yet</strong><br>Add your first service to this business.</div>'):(products.length?products.map(function(p){var imgs=typeof productImages==='function'?productImages(p):[];return '<div class="v138-service-row"><div class="v138-service-photo-placeholder">'+(imgs[0]?'<img class="v138-service-photo" src="'+escFn(imgs[0])+'">':'📦')+'</div><div class="v129-product-main"><b>'+escFn(p.name)+'</b><span class="muted" style="font-size:10px">₹'+Number(p.discountPrice??p.price??0).toLocaleString('en-IN')+' · '+Number(p.stock||0)+' in stock</span></div><div class="v129-product-actions"><button class="btn secondary" onclick="editProduct(\''+escFn(p.id)+'\')">EDIT</button><button class="btn secondary" onclick="editProduct(\''+escFn(p.id)+'\')">PHOTOS</button><button class="btn danger" onclick="deleteProduct(\''+escFn(p.id)+'\')">REMOVE</button></div></div>'}).join(''):'<div class="empty"><strong>No products yet</strong><br>Add your first product to this business.</div>');
  var cover=b.cover?'<img class="v129-cover" src="'+escFn(b.cover)+'" alt="" loading="lazy">':'';
  el.innerHTML='<div class="page-head"><button class="btn secondary" onclick="backToBusinessProfilesV138()">← BUSINESSES</button><div class="page-title">BUSINESS MANAGEMENT</div></div><div class="card" style="padding:0;overflow:hidden">'+cover+'<div style="padding:14px"><div class="v129-detail-head"><div class="v129-detail-avatar">'+(b.logo?'<img src="'+escFn(b.logo)+'" alt="" loading="lazy">':'🏪')+'</div><div class="grow"><h2 style="margin:0">'+escFn(b.name)+'</h2><div class="muted">'+escFn(cat)+'</div><div class="muted">'+escFn(b.locality||b.address||'')+'</div></div></div><div class="v129-actions"><button class="btn primary" onclick="editBusinessProfile(\''+escFn(b.id)+'\')">EDIT BUSINESS</button><label class="btn secondary" style="display:flex;align-items:center;justify-content:center;cursor:pointer">CHANGE LOGO<input type="file" accept="image/*" hidden onchange="editBusinessPhotoFixed(\''+escFn(b.id)+'\',\'logo\',this)"></label><label class="btn secondary" style="display:flex;align-items:center;justify-content:center;cursor:pointer">CHANGE COVER<input type="file" accept="image/*" hidden onchange="editBusinessPhotoFixed(\''+escFn(b.id)+'\',\'cover\',this)"></label><button class="btn danger" onclick="deleteSellerBusiness(\''+escFn(b.id)+'\')">DELETE BUSINESS</button></div></div></div><div class="row" style="margin-top:18px"><h3 style="margin:0">'+(svc?'SERVICES':'PRODUCTS')+'</h3><button class="btn primary" onclick="'+(svc?'addService()':'addProduct(\''+escFn(b.id)+'\')')+'">+ ADD '+(svc?'SERVICE':'PRODUCT')+'</button></div><div class="card" style="margin-top:8px">'+rows+'</div>';
}
window.openBusinessManagementV138=function(id){currentBusiness=id;window.__businessManagementSelected=true;try{history.pushState({screen:'sellerBusinessManagementV138',businessId:id},'',location.pathname+'#seller-business-'+encodeURIComponent(String(id)))}catch(e){}renderV138BusinessDetail(id);window.scrollTo({top:0,behavior:'auto'});};
window.renderV138BusinessDetail=renderV138BusinessDetail;
window.renderV138BusinessList=renderV138BusinessList;
window.backToBusinessProfilesV138=function(){window.__businessManagementSelected=false;try{history.back()}catch(e){renderV138BusinessList()}};
window.renderSellerBusinesses=renderV138BusinessList;
var prevSellerTabV138=window.sellerTab;
window.sellerTab=function(tab){
  if(tab==='businesses'){
    var u=seller(); if(!u||u.role!=='seller') return prevSellerTabV138.apply(this,arguments);
    document.body.classList.add('seller-mode');
    document.querySelectorAll('.screen').forEach(function(x){x.classList.remove('active')});
    document.getElementById('seller')?.classList.add('active');
    document.querySelectorAll('#sellerNav button').forEach(function(x){x.classList.toggle('active',x.dataset.sellerTab==='businesses')});
    try{history.replaceState({screen:'sellerBusinessesV138'},'',location.pathname+'#seller-businesses')}catch(e){}
    renderV138BusinessList(); return;
  }
  return prevSellerTabV138.apply(this,arguments);
};

/* ---------- SERVICE BOOKING: fields depend on the service ---------- */
window.bookService=function(serviceId){
  var s=(db.services||[]).find(function(x){return String(x.id)===String(serviceId)}),b=s&&(db.businesses||[]).find(function(x){return String(x.id)===String(s.businessId)}),u=typeof user==='function'?user():null;if(!u){go('auth');return}if(!s||!b){toast('Service not found');return}
  var dates=[];for(var i=0;i<14;i++){var d=new Date();d.setDate(d.getDate()+i);dates.push(d.toISOString().slice(0,10));}
  var times=[];for(var h=9;h<=19;h++){times.push(String(h).padStart(2,'0')+':00');if(h<19)times.push(String(h).padStart(2,'0')+':30');}
  var edu=isEducation(s,b),veh=needsVehicle(s,b),addr=needsAddress(s,b);
  var fields='';
  if(edu) fields+='<div class="field"><label>STUDENT NAME</label><input id="realSvcStudent" placeholder="Student name"></div><div class="field"><label>CLASS / GRADE</label><input id="realSvcClass" placeholder="e.g. Class 10"></div><div class="field"><label>LEARNING MODE</label><select id="realSvcMode"><option>Offline</option><option>Online</option><option>Either</option></select></div>';
  if(veh) fields+='<div class="field"><label>VEHICLE TYPE</label><select id="realSvcVehicle"><option>Hatchback</option><option>Sedan</option><option>SUV</option><option>MUV</option><option>Other</option></select></div><div class="field"><label>VEHICLE NUMBER</label><input id="realSvcVehicleNo" placeholder="OD 02 AB 1234"></div>';
  if(addr) fields+='<div class="field"><label>SERVICE ADDRESS</label><input id="realSvcAddress" value="" placeholder="Where should the service be provided?"></div>';
  openModal('<button class="close" onclick="closeModal()">×</button><h2>Book Service</h2><div class="notice"><b>'+escFn(s.name)+'</b><br>'+escFn(b.name)+'<br>'+(s.price?'Starting from ₹'+Number(s.price).toLocaleString('en-IN'):'Price on request')+'</div>'+fields+'<div class="field"><label>DATE</label><select id="realSvcDate">'+dates.map(function(d,i){return '<option value="'+d+'">'+(i===0?'Today':i===1?'Tomorrow':new Date(d).toLocaleDateString('en-IN',{day:'numeric',month:'short'}))+'</option>'}).join('')+'</select></div><div class="field"><label>TIME SLOT</label><div class="service-action-grid" id="realSvcTimes">'+times.map(function(t){return '<button type="button" class="service-slot" data-time="'+t+'" onclick="chooseRealServiceTime(this)">'+t+'</button>'}).join('')+'</div><input id="realSvcTime" type="hidden"></div><div class="field"><label>NOTES</label><textarea id="realSvcNotes" placeholder="Anything the service provider should know"></textarea></div><button class="btn primary full" onclick="confirmRealServiceBookingV138(\''+escFn(s.id)+'\')">CONFIRM BOOKING</button>');
};
window.confirmRealServiceBookingV138=function(serviceId){
  var s=(db.services||[]).find(function(x){return String(x.id)===String(serviceId)}),b=s&&(db.businesses||[]).find(function(x){return String(x.id)===String(s.businessId)}),u=typeof user==='function'?user():null;if(!u||!s||!b)return toast('Service not found');var time=document.getElementById('realSvcTime')?.value;if(!time)return toast('Please select a time slot');
  var booking={id:uid('booking'),type:'SERVICE_BOOKING',serviceId:s.id,businessId:b.id,customerId:u.id,customerName:u.name||u.email||'Customer',serviceName:s.name,studentName:document.getElementById('realSvcStudent')?.value.trim()||'',classGrade:document.getElementById('realSvcClass')?.value.trim()||'',learningMode:document.getElementById('realSvcMode')?.value||'',vehicleType:document.getElementById('realSvcVehicle')?.value||'',vehicleNumber:document.getElementById('realSvcVehicleNo')?.value.trim()||'',serviceAddress:document.getElementById('realSvcAddress')?.value.trim()||'',date:document.getElementById('realSvcDate').value,time:time,notes:document.getElementById('realSvcNotes').value.trim(),price:Number(s.price)||0,status:'PENDING',createdAt:Date.now()};
  db.serviceBookings=db.serviceBookings||[];db.serviceBookings.push(booking);db.reservations=db.reservations||[];db.reservations.push(Object.assign({},booking,{userId:u.id,number:'SERVICE-'+String(booking.id).replace(/[^a-z0-9]/gi,'').slice(-8).toUpperCase(),total:booking.price,method:'service'}));save();closeModal();renderOrders();toast('Service booking request sent');
};
})();



/* ===== legacy script 90 ===== */

(function(){
  'use strict';

  /*
    SORTED v139 — final upload/storage repair.
    Root causes in v138:
      - multiple upload readers overwrite each other;
      - some readers store the original 20 MB File as base64 before compression;
      - business logos/covers are stored in localStorage together with the whole DB;
      - localStorage has a small quota, so one large image can make every later save fail.
    This final layer is intentionally last so it becomes the single authoritative reader.
  */

  const MAX_FILE_MB = 15;
  const LIMITS = {
    product: { max: 720, quality: 0.62 },
    service: { max: 720, quality: 0.62 },
    logo:    { max: 640, quality: 0.66 },
    cover:   { max: 1200, quality: 0.68 }
  };

  function imageFile(file){
    if(!file) throw new Error('Please select an image.');
    const name=String(file.name||'').toLowerCase();
    const type=String(file.type||'').toLowerCase();
    const ok=type.indexOf('image/')===0 ||
      /\.(jpg|jpeg|png|webp|gif|bmp|heic|heif|avif)$/i.test(name);
    if(!ok) throw new Error('Please select an image file.');
    if(Number(file.size||0) > MAX_FILE_MB*1024*1024)
      throw new Error('Image is too large. Please choose a photo under 15 MB.');
    return file;
  }

  function blobToDataURL(blob){
    return new Promise(function(resolve,reject){
      const r=new FileReader();
      r.onload=function(){
        const s=String(r.result||'');
        if(s) resolve(s); else reject(new Error('Could not create image data.'));
      };
      r.onerror=function(){ reject(new Error('Could not create image data.')); };
      try{ r.readAsDataURL(blob); }catch(e){ reject(new Error('Could not create image data.')); }
    });
  }

  function decode(file){
    return new Promise(async function(resolve,reject){
      let bitmap=null, objectUrl='';
      try{
        if(typeof createImageBitmap==='function'){
          try{
            bitmap=await createImageBitmap(file);
            if(bitmap && bitmap.width && bitmap.height) return resolve({
              source:bitmap,width:bitmap.width,height:bitmap.height,
              close:function(){try{bitmap.close();}catch(e){}}
            });
          }catch(e){}
        }

        objectUrl=URL.createObjectURL(file);
        const img=new Image();
        img.onload=function(){
          const w=img.naturalWidth||img.width, h=img.naturalHeight||img.height;
          if(!w||!h){
            try{URL.revokeObjectURL(objectUrl);}catch(e){}
            return reject(new Error('Could not decode this image.'));
          }
          resolve({
            source:img,width:w,height:h,
            close:function(){try{URL.revokeObjectURL(objectUrl);}catch(e){}}
          });
        };
        img.onerror=function(){
          try{URL.revokeObjectURL(objectUrl);}catch(e){}
          reject(new Error('This photo format cannot be processed on this device. Please choose a JPG or PNG photo.'));
        };
        img.src=objectUrl;
      }catch(e){
        try{if(objectUrl)URL.revokeObjectURL(objectUrl);}catch(_){}
        reject(new Error('Could not process this photo. Please choose a JPG or PNG photo.'));
      }
    });
  }

  async function compressImage(file, kind){
    imageFile(file);
    const cfg=LIMITS[kind]||LIMITS.product;
    let decoded=null, canvas=null;
    try{
      decoded=await decode(file);
      const scale=Math.min(1,cfg.max/Math.max(decoded.width,decoded.height));
      const w=Math.max(1,Math.round(decoded.width*scale));
      const h=Math.max(1,Math.round(decoded.height*scale));

      canvas=document.createElement('canvas');
      canvas.width=w; canvas.height=h;
      const ctx=canvas.getContext('2d',{alpha:false});
      if(!ctx) throw new Error('Image processing is unavailable in this browser.');

      ctx.imageSmoothingEnabled=true;
      ctx.imageSmoothingQuality='high';
      ctx.drawImage(decoded.source,0,0,w,h);

      const blob=await new Promise(function(resolve,reject){
        canvas.toBlob(function(b){
          if(b && b.size) resolve(b);
          else reject(new Error('Could not compress this photo.'));
        },'image/jpeg',cfg.quality);
      });

      const data=await blobToDataURL(blob);
      if(!data || data.length<100) throw new Error('Could not create a usable photo.');
      return data;
    }finally{
      if(decoded) decoded.close();
      canvas=null;
    }
  }

  async function oneFromInput(id,kind){
    const input=document.getElementById(id);
    const file=input && input.files && input.files[0];
    if(!file) return '';
    return compressImage(file,kind);
  }

  async function manyFromInput(id,kind){
    const input=document.getElementById(id);
    const files=Array.from(input && input.files || []).slice(0,8);
    if(!files.length) return [];
    const out=[];
    for(let i=0;i<files.length;i++){
      try{
        out.push(await compressImage(files[i],kind));
      }catch(e){
        throw new Error('Photo '+(i+1)+': '+(e.message||'Could not process image.'));
      }
    }
    return out.filter(Boolean);
  }

  // Single authoritative image APIs used by business/product/service creation.
  window.imageFrom=async function(id){
    return oneFromInput(id,'product');
  };
  window.imageFromMany=async function(id){
    return manyFromInput(id,'product');
  };

  // Business editor photo API. Covers get a larger limit; logos stay compact.
  window.readBusinessPhoto=async function(input,maxSize,kind){
    const file=input && input.files && input.files[0];
    if(!file) return '';
    const actualKind=kind==='logo'?'logo':'cover';
    return compressImage(file,actualKind);
  };

  /*
    Storage hardening.
    Keep the existing application's data model and localStorage architecture,
    but if quota is reached, progressively reduce image arrays before giving up.
  */
  const originalSave=window.save;
  window.save=function(){
    if(typeof originalSave!=='function') return false;

    try{
      const result=originalSave.apply(this,arguments);
      if(result!==false) return result;
    }catch(e){}

    // Emergency compaction: only keep the main image for products/services.
    try{
      const slim=JSON.parse(JSON.stringify(db));
      (slim.products||[]).forEach(function(p){
        if(Array.isArray(p.images)){
          p.image=p.images[0]||p.image||'';
          p.images=p.image?[p.image]:[];
        }
      });
      (slim.services||[]).forEach(function(s){
        if(Array.isArray(s.images)){
          s.image=s.images[0]||s.image||'';
          s.images=s.image?[s.image]:[];
        }
      });
      db=slim;
      localStorage.setItem(typeof KEY!=='undefined'?KEY:'sortedDB',JSON.stringify(db));
      return true;
    }catch(e){}

    // Last-resort cleanup of duplicate/legacy image arrays. Never delete the
    // primary product image, business logo, or business cover.
    try{
      const slim=JSON.parse(JSON.stringify(db));
      (slim.products||[]).forEach(function(p){
        if(Array.isArray(p.images) && p.images.length>1) p.images=p.images.slice(0,1);
      });
      (slim.services||[]).forEach(function(s){
        if(Array.isArray(s.images) && s.images.length>1) s.images=s.images.slice(0,1);
      });
      localStorage.setItem(typeof KEY!=='undefined'?KEY:'sortedDB',JSON.stringify(slim));
      db=slim;
      return true;
    }catch(e){}

    try{
      if(typeof toast==='function') toast('Storage is full. Remove an old product photo and try again.');
    }catch(_){}
    return false;
  };

  // Do not allow stale preview object URLs to accumulate.
  window.previewUpload=function(input,targetId){
    const file=input && input.files && input.files[0];
    const target=document.getElementById(targetId);
    if(!file||!target)return;
    try{imageFile(file);}catch(e){
      target.textContent=e.message;
      if(input)input.value='';
      return;
    }
    const url=URL.createObjectURL(file);
    target.innerHTML='';
    const img=document.createElement('img');
    img.alt='Photo preview';
    img.src=url;
    img.onload=function(){try{URL.revokeObjectURL(url);}catch(e){}};
    img.onerror=function(){try{URL.revokeObjectURL(url);}catch(e){};target.textContent='Preview unavailable';};
    target.appendChild(img);
  };

  window.previewMultiUpload=function(input,targetId){
    const target=document.getElementById(targetId);
    if(!target)return;
    const files=Array.from(input && input.files || []).slice(0,8);
    target.innerHTML='';
    files.forEach(function(file,i){
      const box=document.createElement('div');
      box.className='multi-upload-item';
      const img=document.createElement('img');
      img.alt='Photo '+(i+1);
      const url=URL.createObjectURL(file);
      img.src=url;
      img.onload=function(){try{URL.revokeObjectURL(url);}catch(e){}};
      box.appendChild(img);
      const cap=document.createElement('small');
      cap.textContent=i===0?'Main photo':'Photo '+(i+1);
      box.appendChild(cap);
      target.appendChild(box);
    });
    if((input && input.files && input.files.length||0)>8 && typeof toast==='function')
      toast('Only the first 8 photos will be used.');
  };

})();



/* ===== legacy script 91 ===== */

(function(){
  'use strict';
  const sb = window.sortedSupabase;
  if(!sb) return;

  window.SORTED_CLOUD = {
    ready: true,
    auth: false,
    userId: null
  };

  function cloudToast(msg){ try{ if(typeof toast==='function') toast(msg); }catch(e){} }
  function emailFromContact(contact){
    const c=String(contact||'').trim();
    return c.includes('@') ? c.toLowerCase() : '';
  }

  // Upload a browser File to Supabase Storage and return its public URL.
  async function uploadFile(file,bucket,kind){
    if(!file) return '';
    const {data:{user:au},error:ae}=await sb.auth.getUser();
    if(ae || !au) throw new Error('Please log in with Supabase before uploading photos.');
    if(file.size > 15*1024*1024) throw new Error('Image must be under 15 MB.');
    const ext=(file.name||'jpg').split('.').pop().toLowerCase().replace(/[^a-z0-9]/g,'')||'jpg';
    const path=au.id+'/'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,8)+'.'+ext;
    const {error}=await sb.storage.from(bucket).upload(path,file,{upsert:false,contentType:file.type||'image/jpeg',cacheControl:'3600'});
    if(error) throw error;
    const {data}=sb.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  }

  // Override the app's image readers so new uploads go to Supabase Storage
  // instead of being embedded as base64 in localStorage.
  window.imageFrom=async function(id,kind){
    const input=document.getElementById(id);
    const file=input && input.files && input.files[0];
    if(!file) return '';
    return uploadFile(file,kind==='service'?'service-images':'product-images',kind);
  };

  window.imageFromMany=async function(id,kind){
    const input=document.getElementById(id);
    const files=Array.from(input && input.files || []).slice(0,8);
    if(!files.length) return [];
    const bucket=kind==='service'?'service-images':'product-images';
    const out=[];
    for(const file of files) out.push(await uploadFile(file,bucket,kind));
    return out;
  };

  window.readBusinessPhoto=async function(input,maxSize,kind){
    const file=input && input.files && input.files[0];
    if(!file) return '';
    return uploadFile(file,kind==='logo'||kind==='cover'?'business-images':'business-images',kind);
  };

  // Create/update the SORTED profile row after Supabase Auth changes.
  async function syncProfile(authUser, role, name, phone){
    if(!authUser) return;
    const payload={
      name:name || authUser.user_metadata?.name || '',
      email:authUser.email || '',
      phone:phone || authUser.user_metadata?.phone || '',
      role:role || authUser.user_metadata?.role || 'buyer'
    };
    // The signup trigger creates the profile row. Updating it avoids requiring
    // a client-side INSERT policy on profiles and reliably preserves seller role.
    const {data:updated,error:updateError}=await sb.from('profiles').update(payload).eq('id',authUser.id).select('*').maybeSingle();
    if(updateError || !updated){
      console.warn('SORTED profile sync:',updateError?.message||'profile row not found');
    }
    return updated || null;
  }

  // Expose a small diagnostic API for testing.
  window.sortedSupabaseStatus=async function(){
    const {data:{session}}=await sb.auth.getSession();
    return {connected:true,authenticated:!!session,userId:session?.user?.id||null};
  };

  // Supabase Auth login helper. The existing UI remains unchanged.
  window.sortedSupabaseLogin=async function(contact,password){
    const email=emailFromContact(contact);
    if(!email) throw new Error('For the first cloud-login version, please use an email address. Phone OTP can be added next.');
    const {data,error}=await sb.auth.signInWithPassword({email,password});
    if(error) throw error;
    window.SORTED_CLOUD.auth=true;
    window.SORTED_CLOUD.userId=data.user.id;
    return data.user;
  };

  window.sortedSupabaseSignup=async function(name,email,password,role,phone){
    if(!email || !email.includes('@')) throw new Error('Please enter a valid email address for cloud signup.');
    if(!password || password.length<6) throw new Error('Password must be at least 6 characters.');
    const {data,error}=await sb.auth.signUp({
      email,password,
      options:{data:{name:name||'SORTED User',role:role||'buyer',phone:phone||''},emailRedirectTo:'https://sortedadmin.github.io/SortedGPT/'}
    });
    if(error) throw error;
    if(data.user) await syncProfile(data.user,role,name,phone);
    if(data.session){ window.SORTED_CLOUD.auth=true; window.SORTED_CLOUD.userId=data.user.id; }
    return data;
  };

  window.sortedSupabaseLogout=async function(){
    const {error}=await sb.auth.signOut();
    if(error) throw error;
    window.SORTED_CLOUD.auth=false;
    window.SORTED_CLOUD.userId=null;
  };

  // Keep cloud auth state available to the existing app.
  sb.auth.getSession().then(async ({data})=>{
    const session=data.session;
    if(session){
      window.SORTED_CLOUD.auth=true;
      window.SORTED_CLOUD.userId=session.user.id;
      try{
        const {data:p}=await sb.from('profiles').select('*').eq('id',session.user.id).maybeSingle();
        if(p && typeof db!=='undefined'){
          // Keep a lightweight local compatibility user. No password is stored.
          db.users=db.users||[];
          let u=db.users.find(x=>x.supabaseUid===session.user.id);
          if(!u){
            const metaRole=session.user.user_metadata?.role;
            const resolvedRole=(metaRole==='seller'||metaRole==='admin') ? metaRole : (p.role||'buyer');
            u={id:'supabase-'+session.user.id,contact:p.email||'',name:p.name||session.user.email||'SORTED User',role:resolvedRole,supabaseUid:session.user.id};
            if((metaRole==='seller'||metaRole==='admin') && p.role!==metaRole){ try{ await sb.from('profiles').update({role:metaRole}).eq('id',session.user.id); }catch(e){} }
            db.users.push(u);
          }else{
            u.name=p.name||u.name; u.contact=p.email||u.contact; u.role=p.role||u.role;
          }
          db.session=u.id;
          try{localStorage.setItem(KEY,JSON.stringify(db));}catch(e){}
        }
      }catch(e){ console.warn('SORTED profile hydration:',e.message); }
    }
  });

  sb.auth.onAuthStateChange(function(event,session){
    window.SORTED_CLOUD.auth=!!session;
    window.SORTED_CLOUD.userId=session?.user?.id||null;
  });

  // Replace login/create/logout only when Supabase is available.
  // This keeps the old local flow as a fallback if the user has legacy data.
  const oldLogin=window.loginAccount;
  window.loginAccount=async function(){
    const contact=document.getElementById('loginContact')?.value.trim()||'';
    const password=document.getElementById('loginPassword')?.value||'';
    if(!contact)return toast('Enter your email');
    if(!password)return toast('Enter your password');
    try{
      const au=await window.sortedSupabaseLogin(contact,password);
      let p=null;
      try{p=(await sb.from('profiles').select('*').eq('id',au.id).maybeSingle()).data;}catch(e){}
      db.users=db.users||[];
      const metaRole=au.user_metadata?.role;
      const resolvedRole=(metaRole==='seller'||metaRole==='admin') ? metaRole : (p?.role||'buyer');
      if((metaRole==='seller'||metaRole==='admin') && p?.role!==metaRole){ try{ await sb.from('profiles').update({role:metaRole}).eq('id',au.id); }catch(e){} }
      let u=db.users.find(x=>x.supabaseUid===au.id);
      if(!u){u={id:'supabase-'+au.id, name:p?.name||au.user_metadata?.name||au.email||'SORTED User', contact:au.email||'', role:resolvedRole, supabaseUid:au.id};db.users.push(u);}
      else{u.name=p?.name||u.name;u.contact=au.email||u.contact;u.role=resolvedRole;}
      db.session=u.id;
      try{localStorage.setItem(KEY,JSON.stringify(db));}catch(e){}
      if(u.role==='seller'){
        const bs=(db.businesses||[]).filter(b=>b.ownerId===u.id); currentBusiness=bs[0]?.id||null;
        if(typeof sellerSelectedBusiness!=='undefined') sellerSelectedBusiness=currentBusiness;
        if(typeof setSellerNav==='function') setSellerNav();
        go('seller');
        if(typeof renderSellerShell==='function') renderSellerShell(); else if(typeof renderSeller==='function') renderSeller();
        toast('Logged in as seller');
      }else{renderProfile();go('home');toast('Logged in successfully');}
    }catch(e){
      // If this is an old local-only account, keep the original fallback.
      const legacy=(db.users||[]).find(x=>String(x.contact||'').toLowerCase()===contact.toLowerCase());
      if(legacy && typeof oldLogin==='function'){oldLogin();return;}
      toast(e.message||'Could not sign in');
    }
  };

  const oldCreate=window.createAccount;
  window.createAccount=async function(){
    const name=document.getElementById('authName')?.value.trim()||'SORTED User';
    const contact=document.getElementById('authContact')?.value.trim()||'';
    const password=document.getElementById('authPassword')?.value||'';
    const role=document.getElementById('authRole')?.value||'buyer';
    if(!contact)return toast('Enter your email');
    try{
      const result=await window.sortedSupabaseSignup(name,contact,password,role,contact.includes('@')?'':contact);
      if(result.user && !result.session){toast('Account created. Check your email to confirm, then log in.');return;}
      // Authenticated immediately: create the local compatibility user.
      const au=result.user;
      // Ensure the Supabase profile has the selected role before rendering the UI.
      await syncProfile(au,role,name,contact.includes('@')?'':contact);
      db.users=db.users||[];
      const u={id:'supabase-'+au.id,name,contact:au.email||contact,role,supabaseUid:au.id};
      db.users=db.users.filter(x=>x.supabaseUid!==au.id);
      db.users.push(u);db.session=u.id;
      try{localStorage.setItem(KEY,JSON.stringify(db));}catch(e){}
      if(role==='seller')createBusiness();else{renderProfile();go('home');toast('Account created');}
    }catch(e){
      const msg=String(e?.message||e||'Could not create account');
      if(/already registered|already exists|user already exists/i.test(msg)){
        toast('This email is already registered. Please use Log In instead.');
      }else{
        toast(msg);
      }
    }
  };

  const oldLogout=window.logout;
  window.logout=async function(){
    try{await window.sortedSupabaseLogout();}catch(e){console.warn(e.message||e);}
    try{db.session=null;localStorage.setItem(KEY,JSON.stringify(db));}catch(e){}
    currentBusiness=null;
    try{if(typeof closeModal==='function')closeModal();if(typeof updateRoleUI==='function')updateRoleUI();if(typeof go==='function')go('home');}catch(e){}
    toast('Signed out');
  };

  console.log('SORTED: Supabase connected');
})();

