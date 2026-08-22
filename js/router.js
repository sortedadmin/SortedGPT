/* SORTED PERMANENT NAVIGATION CONTROLLER
   One seller router. Business Management and Orders are separate routes.
*/
(function(){
  'use strict';
  const ROUTE_PREFIX='seller';
  let route={name:'dashboard',businessId:null};
  let originalGo=window.go;

  function seller(){try{return typeof user==='function'?user():null}catch(e){return null}}
  function isSeller(){const u=seller();return !!(u&&String(u.role).toLowerCase()==='seller')}
  function setSellerShell(){
    document.body.classList.add('seller-mode');
    document.querySelectorAll('.buyer-nav').forEach(n=>n.style.display='none');
    const nav=document.getElementById('sellerNav'); if(nav)nav.style.display='grid';
    const dash=document.getElementById('sellerDashNav'); if(dash)dash.style.display='grid';
    document.querySelectorAll('.screen').forEach(x=>x.classList.remove('active'));
    const screen=document.getElementById('seller'); if(screen)screen.classList.add('active');
  }
  function setActive(tab){
    document.querySelectorAll('#sellerNav button').forEach(b=>b.classList.toggle('active',b.dataset.sellerTab===tab));
  }
  function activate(name,businessId,replace){
    if(!isSeller()){ if(name!=='dashboard') { if(typeof setAuthMode==='function')setAuthMode('login'); return originalGo('auth'); } }
    route={name:name,businessId:businessId||null};
    setSellerShell();
    const tab=name==='businesses'||name==='business'?'businesses':name==='orders'||name==='orderBusiness'?'reservations':name==='profile'?'profile':'dashboard';
    setActive(tab);
    const state={screen:'seller',sellerView:name,businessId:businessId||null};
    const hash=name==='business' ? '#seller-business-'+encodeURIComponent(String(businessId)) : name==='orderBusiness' ? '#seller-orders-'+encodeURIComponent(String(businessId)) : '#seller-'+(name==='orders'?'orders':name);
    try{
      if(replace)history.replaceState(state,'',location.pathname+hash);
      else history.pushState(state,'',location.pathname+hash);
    }catch(e){}
    renderRoute();
    window.scrollTo({top:0,behavior:'auto'});
  }
  function renderRoute(){
    setSellerShell();
    if(route.name==='business'){
      window.__businessManagementSelected=true;
      if(typeof window.renderV138BusinessDetail==='function')window.renderV138BusinessDetail(route.businessId);
      else if(typeof window.renderSelectedBusinessScreen==='function')window.renderSelectedBusinessScreen();
      return;
    }
    window.__businessManagementSelected=false;
    if(route.name==='businesses'){
      if(typeof window.renderV138BusinessList==='function')window.renderV138BusinessList();
      else if(typeof window.renderSellerBusinesses==='function')window.renderSellerBusinesses();
      else if(typeof window.renderSellerTab==='function')window.renderSellerTab();
      return;
    }
    if(route.name==='orders' || route.name==='orderBusiness'){
      window.__ordersBusinessSelected=route.name==='orderBusiness';
      currentBusiness=route.name==='orderBusiness'?route.businessId:null;
      if(typeof window.renderSellerReservations==='function')window.renderSellerReservations();
      return;
    }
    if(route.name==='profile'){
      if(typeof window.renderSellerProfile==='function')window.renderSellerProfile();
      else if(typeof window.renderSellerTab==='function')window.renderSellerTab();
      return;
    }
    if(typeof window.renderSellerDashboard==='function')window.renderSellerDashboard();
    else if(typeof window.renderSellerTab==='function')window.renderSellerTab();
  }
  function goRoute(tab){
    tab=String(tab||'dashboard');
    if(tab==='businesses')return activate('businesses',null,false);
    if(tab==='reservations'||tab==='orders')return activate('orders',null,false);
    if(tab==='profile')return activate('profile',null,false);
    return activate('dashboard',null,false);
  }

  // Public navigation API. All seller navigation now comes through these functions.
  window.sellerTab=goRoute;
  window.sellerGo=goRoute;
  window.renderSellerTab=renderRoute;
  window.openSeller=function(id){currentBusiness=id||null;activate('dashboard',id||null,false)};
  window.openOrdersForBusiness=function(id){
    const u=seller();
    const b=(db.businesses||[]).find(x=>String(x.id)===String(id)&&x.ownerId===u?.id);
    if(!b)return toast('Business not found');
    activate('orderBusiness',b.id,false);
  };
  window.openBusinessManagementV138=function(id){
    const u=seller();
    const b=(db.businesses||[]).find(x=>String(x.id)===String(id)&&x.ownerId===u?.id);
    if(!b)return toast('Business not found');
    currentBusiness=b.id;
    activate('business',b.id,false);
  };
  window.backToBusinessProfilesV138=function(){activate('businesses',null,false)};
  window.backToOrdersBusinesses=function(){activate('orders',null,false)};

  // Keep generic go() for buyer routes. Seller route is handled here, not by legacy wrappers.
  window.go=function(id,push){
    if(isSeller() && (id==='seller' || id==='seller-businesses' || id==='seller-orders' || id==='seller-profile')){
      if(id==='seller-businesses')return activate('businesses',null,!!push);
      if(id==='seller-orders')return activate('orders',null,!!push);
      if(id==='seller-profile')return activate('profile',null,!!push);
      return activate('dashboard',null,!!push);
    }
    return originalGo.apply(this,arguments);
  };

  // Browser/Android back: one handler, one route state.
  window.addEventListener('popstate',function(e){
    const s=e.state||{};
    if(s.screen!=='seller')return;
    if(!isSeller())return;
    route={name:s.sellerView||'dashboard',businessId:s.businessId||null};
    renderRoute();
  },false);

  // Remove any stale navigation flags when a seller explicitly changes tabs.
  document.addEventListener('click',function(e){
    const btn=e.target.closest&&e.target.closest('#sellerNav button[data-seller-tab]');
    if(!btn)return;
    e.preventDefault();e.stopImmediatePropagation();
    goRoute(btn.dataset.sellerTab);
  },true);

  // Initial route restoration.
  function boot(){
    if(!isSeller())return;
    const hash=String(location.hash||'');
    let m;
    if((m=hash.match(/^#seller-business-(.+)$/))) route={name:'business',businessId:decodeURIComponent(m[1])};
    else if((m=hash.match(/^#seller-orders-(.+)$/))) route={name:'orderBusiness',businessId:decodeURIComponent(m[1])};
    else if(hash==='#seller-businesses')route={name:'businesses',businessId:null};
    else if(hash==='#seller-orders')route={name:'orders',businessId:null};
    else if(hash==='#seller-profile')route={name:'profile',businessId:null};
    else if(hash==='#seller')route={name:'dashboard',businessId:null};
    else return;
    renderRoute();
  }
  setTimeout(boot,0);
})();
