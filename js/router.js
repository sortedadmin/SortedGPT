/* SORTED PERMANENT NAVIGATION CONTROLLER
   One seller router. Business Management and Orders are separate routes.
*/
(function(){
  'use strict';

  const ROUTE_PREFIX = 'seller';

  let route = {
    name: 'dashboard',
    businessId: null
  };

  const originalGo = window.go;

  function seller(){
    try {
      return typeof user === 'function' ? user() : null;
    } catch(e) {
      return null;
    }
  }

  function isSeller(){
    const u = seller();
    return !!(u && String(u.role).toLowerCase() === 'seller');
  }

  function setSellerShell(){
    document.body.classList.add('seller-mode');

    document.querySelectorAll('.buyer-nav').forEach(n => {
      n.style.display = 'none';
    });

    const nav = document.getElementById('sellerNav');
    if(nav) nav.style.display = 'grid';

    const dash = document.getElementById('sellerDashNav');
    if(dash) dash.style.display = 'grid';

    document.querySelectorAll('.screen').forEach(x => {
      x.classList.remove('active');
    });

    const screen = document.getElementById('seller');
    if(screen) screen.classList.add('active');
  }

  function setActive(tab){
    document.querySelectorAll('#sellerNav button').forEach(b => {
      b.classList.toggle(
        'active',
        b.dataset.sellerTab === tab
      );
    });
  }

  function activate(name, businessId, replace){
    if(!isSeller()){
      if(name !== 'dashboard'){
        if(typeof setAuthMode === 'function'){
          setAuthMode('login');
        }

        return originalGo('auth');
      }
    }

    route = {
      name: name,
      businessId: businessId || null
    };

    setSellerShell();

    const tab =
      name === 'businesses' || name === 'business'
        ? 'businesses'
        : name === 'orders' || name === 'orderBusiness'
          ? 'reservations'
          : name === 'profile'
            ? 'profile'
            : 'dashboard';

    setActive(tab);

    const state = {
      screen: 'seller',
      sellerView: name,
      businessId: businessId || null
    };

    const hash =
      name === 'business'
        ? '#seller-business-' +
          encodeURIComponent(String(businessId))
        : name === 'orderBusiness'
          ? '#seller-orders-' +
            encodeURIComponent(String(businessId))
          : '#seller-' +
            (name === 'orders' ? 'orders' : name);

    try{
      if(replace){
        history.replaceState(
          state,
          '',
          location.pathname + hash
        );
      }else{
        history.pushState(
          state,
          '',
          location.pathname + hash
        );
      }
    }catch(e){}

    renderRoute();

    window.scrollTo({
      top: 0,
      behavior: 'auto'
    });
  }

  function renderRoute(){
    setSellerShell();

    if(route.name === 'business'){
      if(typeof window.renderSellerBusinesses === 'function'){
        window.renderSellerBusinesses();
      }else if(typeof window.renderSellerTab === 'function'){
        window.renderSellerTab('businesses');
      }

      return;
    }

    if(route.name === 'orderBusiness'){
      if(typeof window.renderSellerReservations === 'function'){
        window.renderSellerReservations();
      }

      return;
    }

    if(route.name === 'businesses'){
      if(typeof window.renderSellerBusinesses === 'function'){
        window.renderSellerBusinesses();
      }else if(typeof window.renderSellerTab === 'function'){
        window.renderSellerTab('businesses');
      }

      return;
    }

    if(route.name === 'orders'){
      if(typeof window.renderSellerReservations === 'function'){
        window.renderSellerReservations();
      }

      return;
    }

    if(route.name === 'profile'){
      if(typeof window.renderSellerProfile === 'function'){
        window.renderSellerProfile();
      }else if(typeof window.renderSellerTab === 'function'){
        window.renderSellerTab('profile');
      }

      return;
    }

    if(typeof window.renderSellerDashboard === 'function'){
      window.renderSellerDashboard();
    }else if(typeof window.renderSeller === 'function'){
      window.renderSeller();
    }else if(typeof window.renderSellerTab === 'function'){
      window.renderSellerTab('dashboard');
    }
  }

  /* Public navigation API */

  window.SORTED_ROUTER = {
    go: function(name, businessId){
      activate(name, businessId, false);
    },

    replace: function(name, businessId){
      activate(name, businessId, true);
    },

    current: function(){
      return {
        name: route.name,
        businessId: route.businessId
      };
    }
  };

  window.openSellerBusiness = function(id){
    if(!isSeller()) return;

    activate(
      'business',
      id,
      false
    );
  };

  window.openSellerOrders = function(id){
    if(!isSeller()) return;

    activate(
      'orderBusiness',
      id,
      false
    );
  };

  window.sellerTab = function(tab){
    if(!isSeller()) return;

    if(tab === 'businesses'){
      activate('businesses', null, false);
      return;
    }

    if(
      tab === 'reservations' ||
      tab === 'orders'
    ){
      activate('orders', null, false);
      return;
    }

    if(tab === 'profile'){
      activate('profile', null, false);
      return;
    }

    activate('dashboard', null, false);
  };

  window.openOrdersForBusiness = function(id){
    if(!isSeller()) return;

    activate(
      'orderBusiness',
      id,
      false
    );
  };

  window.backToOrdersBusinesses = function(){
    activate(
      'orders',
      null,
      false
    );
  };

  window.openSeller = function(id){
    activate(
      'business',
      id,
      false
    );
  };

  /* Browser / Android back */

  window.addEventListener(
    'popstate',
    function(event){
      const state = event.state || {};

      if(state.screen !== 'seller'){
        return;
      }

      route = {
        name: state.sellerView || 'dashboard',
        businessId: state.businessId || null
      };

      renderRoute();
    },
    false
  );

  /* Initial route */

  function initialize(){
    if(!isSeller()) return;

    const state = history.state || {};

    if(state.screen === 'seller'){
      route = {
        name: state.sellerView || 'dashboard',
        businessId: state.businessId || null
      };

      renderRoute();
      return;
    }

    activate(
      'dashboard',
      null,
      true
    );
  }

  window.addEventListener(
    'load',
    function(){
      setTimeout(initialize, 100);
    }
  );

})();
