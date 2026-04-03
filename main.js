/* ============================================
   VIDA ANIMAL - VETERINARIA
   Main JavaScript + Tienda
   ============================================ */

document.addEventListener('DOMContentLoaded', function () {

  /* ---- Navbar scroll effect ---- */
  var navbar = document.getElementById('navbar');
  window.addEventListener('scroll', function () {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
  });

  /* ---- Mobile menu toggle ---- */
  var hamburger = document.querySelector('.hamburger');
  var mobileMenu = document.getElementById('mobileMenu');
  window.toggleMenu = function () {
    hamburger.classList.toggle('active');
    mobileMenu.classList.toggle('active');
    document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
  };
  mobileMenu.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', function () {
      if (mobileMenu.classList.contains('active')) toggleMenu();
    });
  });

  /* ---- Smooth scroll ---- */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var target = document.querySelector(this.getAttribute('href'));
      if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
    });
  });

  /* ---- Scroll reveal ---- */
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('.reveal').forEach(function (el, i) {
    el.style.transitionDelay = (i % 4) * 0.1 + 's';
    observer.observe(el);
  });

  /* ---- Active nav link ---- */
  var sections = document.querySelectorAll('section[id]');
  window.addEventListener('scroll', function () {
    var scrollY = window.pageYOffset;
    sections.forEach(function (section) {
      var top = section.offsetTop - 100;
      var h = section.offsetHeight;
      var id = section.getAttribute('id');
      var link = document.querySelector('.nav-links a[href="#' + id + '"]');
      if (link) { link.style.color = (scrollY >= top && scrollY < top + h) ? '#fff' : ''; }
    });
  });


  /* ============================================
     TIENDA - PET SHOP
     ============================================ */

  var ADMIN_PW = 'vidaanimal2026';
  var WA_NUMBER = '573164457700';
  var STORAGE_KEY = 'vida_animal_productos';
  var cart = [];
  var products = [];
  var selectedCat = 'Todos';
  var editingId = null;

  function loadProducts() {
    try { var d = localStorage.getItem(STORAGE_KEY); return d ? JSON.parse(d) : []; } catch(e) { return []; }
  }
  function saveProductsToStorage() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(products)); } catch(e) {}
  }
  function formatPrice(n) {
    return '$' + Number(n).toLocaleString('es-CO');
  }

  function renderProducts() {
    var grid = document.getElementById('tiendaGrid');
    if (!grid) return;
    var filtered = selectedCat === 'Todos' ? products : products.filter(function(p) { return p.category === selectedCat; });
    if (filtered.length === 0) {
      grid.innerHTML = '<div class="tienda-empty"><div style="font-size:48px;margin-bottom:16px;">🐾</div><p>No hay productos en esta categoría</p><p style="font-size:13px;margin-top:8px;">Haz clic en ⚙️ Administrar para agregar productos</p></div>';
      return;
    }
    grid.innerHTML = filtered.map(function(p) {
      return '<div class="product-card">' +
        '<div class="product-img">' +
          (p.image ? '<img src="' + p.image + '" alt="' + p.name + '" onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'flex\'">' : '') +
          '<div class="placeholder" style="' + (p.image ? 'display:none' : 'display:flex') + '">🐾</div>' +
        '</div>' +
        '<div class="product-body">' +
          '<span class="product-cat">' + p.category + '</span>' +
          '<h3 class="product-name">' + p.name + '</h3>' +
          (p.description ? '<p class="product-desc">' + p.description + '</p>' : '') +
          '<div class="product-footer">' +
            '<span class="product-price">' + formatPrice(p.price) + '</span>' +
            '<button class="btn-add" onclick="addToCart(\'' + p.id + '\')">Agregar</button>' +
          '</div>' +
        '</div>' +
      '</div>';
    }).join('');
  }

  function renderCategories() {
    var cats = ['Todos'];
    products.forEach(function(p) { if (cats.indexOf(p.category) === -1) cats.push(p.category); });
    var c = document.getElementById('tiendaCats');
    if (!c) return;
    c.innerHTML = cats.map(function(cat) {
      return '<button class="tienda-cat-btn' + (selectedCat === cat ? ' active' : '') + '" onclick="filterCategory(\'' + cat + '\')">' + cat + '</button>';
    }).join('');
  }

  window.filterCategory = function(cat) { selectedCat = cat; renderCategories(); renderProducts(); };

  window.addToCart = function(id) {
    var p = products.find(function(x) { return x.id === id; });
    if (!p) return;
    var ex = cart.find(function(x) { return x.id === id; });
    if (ex) ex.qty++; else cart.push({ id: p.id, name: p.name, price: p.price, image: p.image, qty: 1 });
    updateCartUI();
    document.querySelectorAll('.btn-add').forEach(function(b) {
      if (b.getAttribute('onclick').indexOf(id) > -1) {
        b.textContent = '✓ Agregado'; b.classList.add('added');
        setTimeout(function() { b.textContent = 'Agregar'; b.classList.remove('added'); }, 1200);
      }
    });
  };

  function updateCartUI() {
    var count = cart.reduce(function(s, i) { return s + i.qty; }, 0);
    document.getElementById('cartCount').textContent = count;
    document.getElementById('cartFloat').style.display = count > 0 ? 'block' : 'none';
    renderCartItems();
  }

  function renderCartItems() {
    var c = document.getElementById('cartItems');
    var f = document.getElementById('cartFooter');
    if (cart.length === 0) {
      c.innerHTML = '<div class="cart-empty"><div style="font-size:48px;margin-bottom:16px;">🐾</div><p>Tu carrito está vacío</p></div>';
      f.style.display = 'none'; return;
    }
    f.style.display = 'block';
    var total = 0;
    c.innerHTML = cart.map(function(i) {
      total += i.price * i.qty;
      return '<div class="cart-item">' +
        '<div class="cart-item-img">' + (i.image ? '<img src="' + i.image + '">' : '<span>🐾</span>') + '</div>' +
        '<div class="cart-item-info"><p class="cart-item-name">' + i.name + '</p><p class="cart-item-price">' + formatPrice(i.price) + '</p></div>' +
        '<div class="cart-qty"><button class="minus" onclick="updateQty(\'' + i.id + '\',-1)">−</button><span>' + i.qty + '</span><button class="plus" onclick="updateQty(\'' + i.id + '\',1)">+</button></div>' +
        '<button class="cart-remove" onclick="removeFromCart(\'' + i.id + '\')">🗑</button>' +
      '</div>';
    }).join('');
    document.getElementById('cartTotal').textContent = formatPrice(total);
  }

  window.toggleCart = function() {
    var o = document.getElementById('cartOverlay');
    var show = o.style.display === 'none';
    o.style.display = show ? 'flex' : 'none';
    document.body.style.overflow = show ? 'hidden' : '';
    if (show) renderCartItems();
  };

  window.updateQty = function(id, d) {
    var i = cart.find(function(x) { return x.id === id; });
    if (i) { i.qty = Math.max(0, i.qty + d); if (i.qty === 0) cart = cart.filter(function(x) { return x.id !== id; }); }
    updateCartUI();
  };
  window.removeFromCart = function(id) { cart = cart.filter(function(x) { return x.id !== id; }); updateCartUI(); };

  window.sendWhatsApp = function() {
    var total = cart.reduce(function(s, i) { return s + i.price * i.qty; }, 0);
    var msg = '🐾 *Pedido Vida Animal* 🐾\n\n';
    cart.forEach(function(i) { msg += '▪️ ' + i.name + ' x' + i.qty + ' - ' + formatPrice(i.price * i.qty) + '\n'; });
    msg += '\n💰 *Total: ' + formatPrice(total) + '*\n\n¡Gracias! 🐶';
    window.open('https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(msg), '_blank');
    cart = []; updateCartUI(); toggleCart();
  };

  // --- Admin ---
  window.showAdminLogin = function() {
    document.getElementById('adminLoginModal').style.display = 'flex';
    document.getElementById('adminPw').value = '';
    document.getElementById('adminError').style.display = 'none';
    setTimeout(function() { document.getElementById('adminPw').focus(); }, 100);
  };
  window.closeAdminLogin = function() { document.getElementById('adminLoginModal').style.display = 'none'; };
  window.adminLogin = function() {
    if (document.getElementById('adminPw').value === ADMIN_PW) {
      closeAdminLogin();
      document.getElementById('adminPanel').style.display = 'flex';
      renderAdminList();
    } else {
      document.getElementById('adminError').style.display = 'block';
      setTimeout(function() { document.getElementById('adminError').style.display = 'none'; }, 2000);
    }
  };
  window.closeAdmin = function() { document.getElementById('adminPanel').style.display = 'none'; cancelEdit(); };

  function clearForm() {
    ['pName','pPrice','pImage','pDesc'].forEach(function(id) { document.getElementById(id).value = ''; });
    document.getElementById('pCategory').selectedIndex = 0;
  }

  window.addProduct = function() {
    var name = document.getElementById('pName').value.trim();
    var price = document.getElementById('pPrice').value.trim();
    if (!name || !price) return;
    var p = { name: name, price: Number(price), category: document.getElementById('pCategory').value, image: document.getElementById('pImage').value.trim(), description: document.getElementById('pDesc').value.trim() };
    if (editingId) {
      products = products.map(function(x) { return x.id === editingId ? Object.assign(x, p) : x; });
      editingId = null;
      document.getElementById('formTitle').textContent = '➕ Nuevo Producto';
      document.getElementById('btnAddProduct').textContent = 'Agregar';
      document.getElementById('btnCancelEdit').style.display = 'none';
    } else { p.id = Date.now().toString(); products.push(p); }
    clearForm(); renderAdminList();
  };

  window.editProduct = function(id) {
    var p = products.find(function(x) { return x.id === id; });
    if (!p) return;
    editingId = id;
    document.getElementById('pName').value = p.name;
    document.getElementById('pPrice').value = p.price;
    document.getElementById('pCategory').value = p.category;
    document.getElementById('pImage').value = p.image || '';
    document.getElementById('pDesc').value = p.description || '';
    document.getElementById('formTitle').textContent = '✏️ Editar Producto';
    document.getElementById('btnAddProduct').textContent = 'Actualizar';
    document.getElementById('btnCancelEdit').style.display = 'inline-block';
    document.getElementById('pName').focus();
  };

  window.cancelEdit = function() {
    editingId = null; clearForm();
    document.getElementById('formTitle').textContent = '➕ Nuevo Producto';
    document.getElementById('btnAddProduct').textContent = 'Agregar';
    document.getElementById('btnCancelEdit').style.display = 'none';
  };

  window.deleteProduct = function(id) { products = products.filter(function(p) { return p.id !== id; }); renderAdminList(); };

  window.saveAllProducts = function() {
    saveProductsToStorage(); renderCategories(); renderProducts();
    alert('✅ Productos guardados correctamente');
  };

  function renderAdminList() {
    var c = document.getElementById('adminProductList');
    document.getElementById('productCount').textContent = '(' + products.length + ')';
    if (products.length === 0) { c.innerHTML = '<p style="text-align:center;color:#7FA8AE;padding:30px;">No hay productos. Agrega uno arriba.</p>'; return; }
    c.innerHTML = products.map(function(p) {
      return '<div class="admin-item">' +
        '<div class="admin-item-img">' + (p.image ? '<img src="' + p.image + '">' : '<span>🐾</span>') + '</div>' +
        '<div class="admin-item-info"><div class="admin-item-name">' + p.name + '</div><div class="admin-item-meta">' + p.category + ' · ' + formatPrice(p.price) + '</div></div>' +
        '<button class="admin-btn-edit" onclick="editProduct(\'' + p.id + '\')">✏️</button>' +
        '<button class="admin-btn-del" onclick="deleteProduct(\'' + p.id + '\')">🗑</button>' +
      '</div>';
    }).join('');
  }

  // Init tienda
  products = loadProducts();
  renderCategories();
  renderProducts();

});
