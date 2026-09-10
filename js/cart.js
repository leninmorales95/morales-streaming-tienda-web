/* Extracted conservatively from the original main.js. */
// ==========================================================
// 🛒 CARRITO DE COMPRAS — con persistencia, anti-duplicados,
//    descuento automático y aviso de siguiente nivel
// ==========================================================
let carrito = [];
try {
  carrito = JSON.parse(localStorage.getItem('morales_carrito') || '[]');
  carrito = Array.isArray(carrito) ? carrito.map(item => ({
    id: item.id || String(item.name || "").toLowerCase().replace(/\s+/g, "-"),
    name: String(item.name || "Producto"),
    price: parseMoney(item.price),
    quantity: Math.max(1, Math.floor(Number(item.quantity) || 1)),
    maxStock: item.maxStock !== null && item.maxStock !== undefined && item.maxStock !== "" && Number.isFinite(Number(item.maxStock))
      ? Math.max(0, Math.floor(Number(item.maxStock)))
      : null,
    type: item.type === "combo" ? "combo" : "product",
    components: Array.isArray(item.components) ? item.components : []
  })) : [];
} catch (e) {
  carrito = [];
}

function contarUnidadesCarrito() {
  return carrito.reduce((sum, item) => sum + item.quantity, 0);
}

function sincronizarCarritoConCatalogo() {
  if (!Array.isArray(rawProductosData) || rawProductosData.length === 0) return;
  carrito = carrito.map(item => {
    if ((item.type || 'product') === 'combo') return item;
    const product = rawProductosData.find(p => String(p.id) === String(item.id) || String(p.nombre).trim().toLowerCase() === item.name.trim().toLowerCase());
    if (!product) return item;
    const stock = normalizeStockBadge(product).amount;
    return {
      ...item,
      id: product.id || item.id,
      name: product.nombre || item.name,
      price: parseMoney(product.precio_oferta) || item.price,
      maxStock: stock,
      quantity: stock === null ? item.quantity : Math.min(item.quantity, Math.max(0, stock))
    };
  }).filter(item => item.quantity > 0 && item.maxStock !== 0);
  guardarCarrito();
  renderizarCarrito();
}

function guardarCarrito() {
  try {
    localStorage.setItem('morales_carrito', JSON.stringify(carrito));
  } catch (e) {
    console.warn("No se pudo guardar el carrito:", e);
  }
}

function animarContadorCarrito() {
  const contadores = [document.getElementById('cart-count'), document.getElementById('mobile-cart-count')].filter(Boolean);
  if (!contadores.length) return;
  contadores.forEach(contador => {
    contador.style.transition = 'transform 0.25s ease';
    contador.style.transform = 'scale(1.5)';
  });
  setTimeout(() => contadores.forEach(contador => { contador.style.transform = 'scale(1)'; }), 250);
}

function abrirCarrito() {
  const modal = document.getElementById('cart-modal');
  const overlay = document.getElementById('cart-overlay');
  if (modal) modal.style.right = '0';
  if (overlay) { overlay.classList.add('active'); overlay.setAttribute('aria-hidden','false'); }
}
function cerrarCarrito() {
  const modal = document.getElementById('cart-modal');
  const overlay = document.getElementById('cart-overlay');
  if (modal) modal.style.right = '-400px';
  if (overlay) { overlay.classList.remove('active'); overlay.setAttribute('aria-hidden','true'); }
}
function cartHasType(type) { return carrito.some(item => (item.type || 'product') === type); }
function clearCartForMode() { carrito = []; appliedCoupon = null; guardarCarrito(); renderizarCarrito(); }

async function agregarAlCarrito(nombre, precio, abrirDespues = true, id = null, maxStock = null, type = 'product', components = []) {
  if (type === 'product' && cartHasType('combo')) {
    const continuar = await showSiteConfirm('Cambiar el tipo de pedido', 'Ya tienes un combo en tu carrito. Si continúas, el combo se reemplazará por productos individuales.', 'Agregar producto');
    if (!continuar) return false;
    clearCartForMode();
  }
  const productId = id || String(nombre).toLowerCase().replace(/\s+/g, "-");
  const limite = maxStock !== null && maxStock !== undefined && maxStock !== "" && Number.isFinite(Number(maxStock))
    ? Math.max(0, Math.floor(Number(maxStock)))
    : null;
  const existente = carrito.find(item => String(item.id) === String(productId) || item.name === nombre);
  if (limite === 0) return mostrarToast(`⚠️ ${nombre} está agotado`);

  let mensaje;
  if (existente) {
    if (existente.maxStock !== null && existente.quantity >= existente.maxStock) {
      mostrarToast(`⚠️ Alcanzaste el stock disponible de ${nombre}`);
      if (abrirDespues) abrirCarrito();
      return;
    }
    existente.quantity += 1;
    existente.maxStock = limite;
    mensaje = type === 'combo'
      ? `🛒 Combo actualizado · ahora tienes ${existente.quantity}`
      : `🛒 Se sumó 1 unidad de ${nombre} · ahora tienes ${existente.quantity}`;
  } else {
    carrito.push({ id: productId, name: nombre, price: parseMoney(precio), quantity: 1, maxStock: limite, type, components });
    mensaje = type === 'combo'
      ? '✅ Combo agregado al carrito'
      : `✅ ${nombre} se agregó al carrito`;
  }
  guardarCarrito();
  renderizarCarrito();
  mostrarToast(mensaje);
  animarContadorCarrito();

  if (abrirDespues) abrirCarrito();
  return true;
}

function removerDelCarrito(index) {
  carrito.splice(index, 1);
  guardarCarrito();
  renderizarCarrito();
}

function cambiarCantidadCarrito(index, delta) {
  const item = carrito[index];
  if (!item) return;
  const next = item.quantity + delta;
  if (next <= 0) return removerDelCarrito(index);
  if (item.maxStock !== null && next > item.maxStock) {
    return mostrarToast(`⚠️ Solo hay ${item.maxStock} disponibles de ${item.name}`);
  }
  item.quantity = next;
  guardarCarrito();
  renderizarCarrito();
}

function calcularDescuento(count) {
  return count === 2 ? 3 : count === 3 ? 6 : count === 4 ? 9 : count >= 5 ? 12 : 0;
}

function calcularTotalesCarrito() {
  const rawTotal = carrito.reduce((sum, item) => sum + parseMoney(item.price) * item.quantity, 0);
  const automaticDiscount = cartHasType('combo') ? 0 : calcularDescuento(contarUnidadesCarrito());
  const afterAutomatic = Math.max(0, rawTotal - automaticDiscount);
  let couponDiscount = 0;

  if (appliedCoupon) {
    const minimum = Number(appliedCoupon.compra_minima || appliedCoupon.minimo || 0);
    const value = Number(appliedCoupon.descuento || appliedCoupon.valor || 0);
    const type = String(appliedCoupon.tipo || "fijo").toLowerCase();
    if (afterAutomatic >= minimum) {
      couponDiscount = type.includes("porcent") ? afterAutomatic * (value / 100) : value;
      couponDiscount = Math.min(afterAutomatic, Math.max(0, couponDiscount));
    }
  }

  return {
    rawTotal,
    automaticDiscount,
    couponDiscount,
    finalTotal: Math.max(0, afterAutomatic - couponDiscount)
  };
}

function aplicarCupon() {
  const input = document.getElementById("cart-coupon-input");
  const message = document.getElementById("cart-coupon-message");
  const code = String(input?.value || "").trim().toUpperCase();
  if (!code) return;

  const coupon = availableCoupons.find(item => String(item.codigo || item.cupon || "").trim().toUpperCase() === code);
  const status = String(coupon?.estado || "activo").toLowerCase();
  const isActive = coupon && !["inactivo", "agotado", "no"].includes(status);

  if (!isActive) {
    appliedCoupon = null;
    message.textContent = "Cupón no válido o inactivo.";
    message.className = "coupon-message error";
    renderizarCarrito();
    return;
  }

  const subtotal = calcularTotalesCarrito().rawTotal - (cartHasType('combo') ? 0 : calcularDescuento(contarUnidadesCarrito()));
  const minimum = Number(coupon.compra_minima || coupon.minimo || 0);
  if (subtotal < minimum) {
    appliedCoupon = null;
    message.textContent = `Este cupón requiere una compra mínima de S/${minimum.toFixed(2)}.`;
    message.className = "coupon-message error";
    renderizarCarrito();
    return;
  }

  appliedCoupon = coupon;
  renderizarCarrito();
  message.textContent = `Cupón ${code} aplicado correctamente.`;
  message.className = "coupon-message success";
  mostrarToast(`🎟️ Cupón ${code} aplicado`);
}

function renderizarCarrito() {
  const contador = document.getElementById('cart-count');
  const contadorMovil = document.getElementById('mobile-cart-count');
  const contenedor = document.getElementById('cart-items-container');
  const totalSpan = document.getElementById('cart-total');
  const oldTotalSpan = document.getElementById('cart-old-total');
  const discountBadge = document.getElementById('cart-discount-badge');
  const discountText = document.getElementById('cart-discount-text');
  const nextTierBox = document.getElementById('cart-next-tier');

  const unitCount = contarUnidadesCarrito();
  if (contador) contador.textContent = unitCount;
  if (contadorMovil) contadorMovil.textContent = unitCount;

  if (carrito.length === 0) {
    if (contenedor) contenedor.innerHTML = '<p style="color: var(--text-gray); text-align: center; margin-top: 50px;">Tu carrito está vacío</p>';
    if (totalSpan) totalSpan.textContent = 'Total: —';
    if (oldTotalSpan) oldTotalSpan.style.display = 'none';
    if (discountBadge) discountBadge.style.display = 'none';
    if (nextTierBox) nextTierBox.style.display = 'none';
    return;
  }

  let html = '';
  let rawTotal = 0;

  carrito.forEach((item, index) => {
    rawTotal += item.price * item.quantity;
    const maxReached = item.maxStock !== null && item.quantity >= item.maxStock;
    html += `
      <div class="cart-line-item">
        <div class="cart-line-info">
          <h4>${escapeHtml(item.name)}</h4>
          <span>${formatCurrency(item.price * item.quantity)}</span>
          ${item.maxStock !== null ? `<small>Stock: ${item.maxStock}</small>` : ""}
        </div>
        <div class="cart-line-actions">
          <div class="cart-quantity" aria-label="Cantidad de ${escapeHtml(item.name)}">
            <button type="button" onclick="cambiarCantidadCarrito(${index}, -1)" aria-label="Restar uno">−</button>
            <strong>${item.quantity}</strong>
            <button type="button" onclick="cambiarCantidadCarrito(${index}, 1)" aria-label="Sumar uno" ${maxReached ? "disabled" : ""}>+</button>
          </div>
          <button class="cart-remove" onclick="removerDelCarrito(${index})" aria-label="Eliminar ${escapeHtml(item.name)}"><i class="fa-solid fa-trash"></i></button>
        </div>
      </div>
    `;
  });

  if (contenedor) contenedor.innerHTML = html;

  const count = unitCount;
  const totals = calcularTotalesCarrito();
  const discount = totals.automaticDiscount + totals.couponDiscount;
  const finalTotal = totals.finalTotal;

  if (discount > 0) {
    if (oldTotalSpan) {
      oldTotalSpan.style.display = 'inline';
      oldTotalSpan.textContent = `S/${rawTotal.toFixed(2)}`;
    }
    if (discountBadge) discountBadge.style.display = 'block';
    if (discountText) discountText.textContent = `🔥 ¡Ahorras S/${discount.toFixed(2)}!`;
    if (totalSpan) totalSpan.textContent = `Total: S/${finalTotal.toFixed(2)}`;
  } else {
    if (oldTotalSpan) oldTotalSpan.style.display = 'none';
    if (discountBadge) discountBadge.style.display = 'none';
    if (totalSpan) totalSpan.textContent = `Total: S/${finalTotal.toFixed(2)}`;
  }

  // 🎯 Aviso de siguiente nivel de descuento
  if (nextTierBox) {
    let mensaje = '';
    if (cartHasType('combo')) { nextTierBox.style.display = 'none'; return; }
    if (count === 1) mensaje = '➕ Añade 1 más y ahorra S/3';
    else if (count === 2) mensaje = '➕ Añade 1 más y ahorra S/6 (en vez de S/3)';
    else if (count === 3) mensaje = '➕ Añade 1 más y ahorra S/9 (en vez de S/6)';
    else if (count === 4) mensaje = '➕ Añade 1 más y ahorra S/12 (en vez de S/9)';

    if (mensaje) {
      nextTierBox.style.display = 'block';
      nextTierBox.textContent = mensaje;
    } else {
      nextTierBox.style.display = 'none';
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  prepararTarjetasInteractivas();
  const btnAbrir = document.getElementById('cart-btn');
  const btnAbrirMovil = document.getElementById('mobile-cart-btn');
  const btnCerrar = document.getElementById('close-cart');
  const modal = document.getElementById('cart-modal');
  const btnClearCart = document.getElementById('clear-cart');
  const btnApplyCoupon = document.getElementById('apply-coupon');
  const couponInput = document.getElementById('cart-coupon-input');
  const cartOverlay = document.getElementById('cart-overlay');

  if (btnAbrir && modal) {
    btnAbrir.addEventListener('click', (e) => {
      e.preventDefault();
      abrirCarrito();
    });
  }

  if (btnAbrirMovil && modal) {
    btnAbrirMovil.addEventListener('click', (e) => {
      e.preventDefault();
      abrirCarrito();
    });
  }

  document.querySelectorAll('.mobile-nav-item[href]').forEach(item => {
    item.addEventListener('click', () => {
      document.querySelectorAll('.mobile-nav-item').forEach(el => el.classList.remove('active'));
      item.classList.add('active');
    });
  });

  if (btnCerrar && modal) {
    btnCerrar.addEventListener('click', () => {
      cerrarCarrito();
    });
  }

  if (cartOverlay) cartOverlay.addEventListener('click', cerrarCarrito);

  if (btnClearCart) {
    btnClearCart.addEventListener('click', async () => {
      if (carrito.length === 0) return;
      if (await showSiteConfirm('Vaciar carrito', 'Se eliminarán todos los productos de tu pedido.', 'Sí, vaciar')) {
        carrito = [];
        appliedCoupon = null;
        guardarCarrito();
        renderizarCarrito();
      }
    });
  }

  if (btnApplyCoupon) btnApplyCoupon.addEventListener('click', aplicarCupon);
  if (couponInput) {
    couponInput.addEventListener('keydown', event => {
      if (event.key === 'Enter') aplicarCupon();
    });
  }

  const btnCheckout = document.getElementById('checkout-whatsapp');
  if (btnCheckout) {
    btnCheckout.addEventListener('click', () => {
      if (carrito.length === 0) return showSiteMessage('Tu carrito está vacío', 'Agrega al menos un servicio antes de revisar el pedido.', 'cart');
      cerrarCarrito();
      openCheckoutModal();
    });
  }

  const checkoutClose = document.getElementById('checkoutClose');
  const checkoutBack = document.getElementById('checkoutBack');
  const checkoutNext = document.getElementById('checkoutNext');
  const checkoutModal = document.getElementById('checkoutModal');

  if (checkoutClose) checkoutClose.addEventListener('click', closeCheckoutModal);
  if (checkoutBack) checkoutBack.addEventListener('click', () => {
    closeCheckoutModal();
    abrirCarrito();
  });
  if (checkoutNext) checkoutNext.addEventListener('click', () => {
    closeCheckoutModal();
    openPaymentModal('yape', 'cart');
  });
  if (checkoutModal) checkoutModal.addEventListener('click', e => {
    if (e.target === checkoutModal) closeCheckoutModal();
  });

  renderizarCarrito();
});
