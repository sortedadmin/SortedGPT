/* SORTED PERMANENT ROUTER v3 — single seller navigation authority */
(function(){
'use strict';
const state={name:'dashboard',businessId:null};
const originalGo=window.go;
function currentUser(){try{return typeof user==='function'?user():null}catch(e){return null}}
function seller(){const u=currentUser();return u&&String(u.role).toLowerCase()==='seller'?u:null}
function owned(id){const u=seller();return u?(db.businesses||[]).find(b=>String(b.id)===String(id)&&String(b.ownerId)===String(u.id)):null}
function shell(){document.body.classList.add('seller-mode');document.querySelectorAll('.screen').forEach(x=>x.classList.remove('active'));const s=document.getElementById('seller');if(s)s.classList.add('active');const n=document.getElementById('sellerNav');if(n)n.style.display='grid';const b=document.querySelector('.buyer-nav');if(b)b.style.display='none';}
function active(tab){document.querySelectorAll('#sellerNav button').forEach(x=>x.classList.toggle('active',x.dataset.sellerTab===tab));}
function urlFor(name,id){return name==='business'?'#seller-business-'+encodeURIComponent(String(id)):name==='orderBusiness'?'#seller-orders-'+encodeURIComponent(String(id)):'#seller-'+name;}
function render(){shell();
 if(state.name==='business'){active('businesses');window.__businessManagementSelected=true;window.__ordersBusinessSelected=false;if(typeof window.renderV138BusinessDetail==='function')window.renderV138BusinessDetail(state.businessId);else if(typeof window.openBusinessManagementV138==='function')window.openBusinessManagementV138(state.businessId);return;}
 window.__businessManagementSelected=false;
 if(state.name==='orderBusiness'){active('reservations');window.__ordersBusinessSelected=true;if(typeof window.renderSellerReservations==='function')window.renderSellerReservations();return;}
 window.__ordersBusinessSelected=false;
 if(state.name==='businesses'){active('businesses');if(typeof window.renderSellerBusinesses==='function')window.renderSellerBusinesses();else if(typeof window.renderV138BusinessList==='function')window.renderV138BusinessList();return;}
 if(state.name==='orders'){active('reservations');if(typeof window.renderSellerReservations==='function')window.renderSellerReservations();return;}
 if(state.name==='profile'){active('profile');if(typeof window.renderSellerProfile==='function')window.renderSellerProfile();else if(typeof window.renderSellerTab==='function')window.renderSellerTab('profile');return;}
 active('dashboard');if(typeof window.renderSellerDashboard==='function')window.renderSellerDashboard();else if(typeof window.renderSellerShell==='function')window.renderSellerShell();else if(typeof window.renderSeller==='function')window.renderSeller();
}
function nav(name,id,replace){if(!seller())return originalGo('auth');if(name==='business'&&!owned(id))return;state.name=name;state.businessId=id||null;const h=urlFor(name,id);try{(replace?history.replaceState:history.pushState).call(history,{screen:'seller',sellerView:name,businessId:id||null},location.pathname+h)}catch(e){}render();}
window.SORTED_ROUTER={go:(n,id)=>nav(n,id,false),replace:(n,id)=>nav(n,id,true),current:()=>({...state})};
window.sellerTab=function(tab){nav(tab==='businesses'?'businesses':(tab==='reservations'||tab==='orders'?'orders':tab==='profile'?'profile':'dashboard'),null,false)};
window.openSeller=function(id){nav('business',id,false)};
window.openBusinessManagement=function(id){nav('business',id,false)};
window.openBusinessManagementV138=function(id){nav('business',id,false)};
window.openOrdersForBusiness=function(id){if(!owned(id))return;nav('orderBusiness',id,false)};
window.openSellerOrders=function(id){if(!owned(id))return;nav('orderBusiness',id,false)};
window.backToOrdersBusinesses=function(){nav('orders',null,false)};
window.backToBusinessProfiles=function(){nav('businesses',null,false)};
window.backToBusinessProfilesV138=function(){nav('businesses',null,false)};
window.renderSellerTab=function(){render()};
const oldOpenBusinessManagement=window.openBusinessManagement;
// Any generic go('seller') from legacy code means dashboard, never Orders.
window.go=function(id,push){if(id==='seller'&&seller()){nav('dashboard',null,!!push);return}return originalGo.apply(this,arguments)};
window.addEventListener('popstate',function(e){const s=e.state||{};if(s.screen!=='seller')return;state.name=s.sellerView||'dashboard';state.businessId=s.businessId||null;render()},false);
// Initial seller URL restoration.
window.addEventListener('load',function(){setTimeout(function(){const h=location.hash||'';if(!seller())return;let m;if((m=h.match(/^#seller-business-(.+)$/))){nav('business',decodeURIComponent(m[1]),true)}else if((m=h.match(/^#seller-orders-(.+)$/))){nav('orderBusiness',decodeURIComponent(m[1]),true)}else if(h==='#seller-orders'||h==='#seller-reservations'){nav('orders',null,true)}else if(h==='#seller-businesses'){nav('businesses',null,true)}else if(h==='#seller-profile'){nav('profile',null,true)}else if(h==='#seller'){nav('dashboard',null,true)}},150)});
})();
