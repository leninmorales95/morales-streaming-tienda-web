/* Extracted conservatively from the original main.js. */
const paymentModal = document.getElementById("paymentModal");
const paymentModalTitle = document.getElementById("paymentModalTitle");
const paymentModalQr = document.getElementById("paymentModalQr");
let paymentContext = "generic";

let siteDialogResolver = null;

function closeSiteDialog(result = false) {
  const modal = document.getElementById('siteDialog');
  if (!modal) return;
  modal.classList.remove('active');
  modal.setAttribute('aria-hidden', 'true');
  const resolver = siteDialogResolver;
  siteDialogResolver = null;
  if (resolver) resolver(result);
}

function openSiteDialog({ title = 'Aviso', message = '', confirmText = 'Aceptar', cancelText = '', tone = 'info' } = {}) {
  const modal = document.getElementById('siteDialog');
  if (!modal) return Promise.resolve(window.confirm(message));
  if (siteDialogResolver) closeSiteDialog(false);
  document.getElementById('siteDialogTitle').textContent = title;
  document.getElementById('siteDialogMessage').textContent = message;
  document.getElementById('siteDialogAccept').textContent = confirmText;
  const cancel = document.getElementById('siteDialogCancel');
  cancel.textContent = cancelText || 'Cancelar';
  cancel.hidden = !cancelText;
  modal.dataset.tone = tone;
  modal.classList.add('active');
  modal.setAttribute('aria-hidden', 'false');
  document.getElementById('siteDialogAccept').focus();
  return new Promise(resolve => { siteDialogResolver = resolve; });
}

function showSiteMessage(title, message, tone = 'info') {
  return openSiteDialog({ title, message, confirmText: 'Entendido', tone });
}

function showSiteConfirm(title, message, confirmText = 'Continuar') {
  return openSiteDialog({ title, message, confirmText, cancelText: 'Cancelar', tone: 'warning' });
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('siteDialogAccept')?.addEventListener('click', () => closeSiteDialog(true));
  document.getElementById('siteDialogCancel')?.addEventListener('click', () => closeSiteDialog(false));
  document.getElementById('siteDialog')?.addEventListener('click', event => {
    if (event.target.id === 'siteDialog') closeSiteDialog(false);
  });
});

function openPaymentModal(type, context = "generic") {
  paymentContext = context;
  const button = document.querySelector(`.payment-choice[data-payment="${type}"]`) || document.querySelector('.payment-choice[data-payment="yape"]');
  selectPaymentOption(type || "yape", button);
  paymentModal.classList.add("active");
  document.body.style.overflow = "hidden";
}

function selectPaymentOption(type, button) {
  const qrBox = document.getElementById("paymentQrBox");
  const phoneBox = document.getElementById("paymentPhoneBox");
  const transferText = document.getElementById("paymentTransferText");
  const paymentWhatsapp = document.getElementById("paymentWhatsapp");
  const qrZoomButton = document.getElementById("paymentQrZoomButton");
  const productName = document.getElementById("paymentProductName");
  const productTotal = document.getElementById("paymentProductTotal");
  const instructionTotal = document.getElementById("paymentInstructionTotal");
  const instructions = document.querySelector(".payment-instructions");

  document.querySelectorAll(".payment-choice").forEach(item => item.classList.remove("active"));
  if (button) button.classList.add("active");

  const labels = { yape: "Yape", plin: "Plin", transferencia: "Transferencia bancaria" };
  selectedPayMethod = labels[type] || "Yape";

  if (type === "transferencia") {
    paymentModalTitle.textContent = "Pago por transferencia";
    qrBox.style.display = "none";
    phoneBox.style.display = "none";
    transferText.style.display = "block";
    qrZoomButton.style.display = "none";
    instructions.style.display = "none";
  } else {
    paymentModalTitle.textContent = `Pago con ${labels[type]}`;
    paymentModalQr.src = type === "plin" ? "assets/payments/plin-qr.jpg" : "assets/payments/yape-qr.jpg";
    paymentModalQr.alt = `QR de ${labels[type]}`;
    qrZoomButton.style.display = "inline-flex";
    instructions.style.display = "block";
    qrBox.style.display = "flex";
    phoneBox.style.display = "flex";
    transferText.style.display = "none";
  }

  let summaryName = "Servicio seleccionado";
  let summaryTotal = "Consultar";
  let whatsappMessage = `Hola, quiero consultar y pagar un servicio mediante ${selectedPayMethod}.`;

  if (paymentContext === "cart" && carrito.length > 0) {
    const totals = calcularTotalesCarrito();
    const unitCount = contarUnidadesCarrito();
    summaryName = `${unitCount} ${unitCount === 1 ? "servicio" : "servicios"} en el carrito`;
    summaryTotal = `S/${totals.finalTotal.toFixed(2)}`;
    const itemLines = carrito.map(item => `• ${item.name} x${item.quantity} (${formatCurrency(item.price * item.quantity)})`).join("\n");
    const discount = totals.automaticDiscount + totals.couponDiscount;
    const discountLine = discount > 0 ? `\n🎉 Ahorro aplicado: -S/${discount.toFixed(2)}` : "";
    const couponLine = appliedCoupon && totals.couponDiscount > 0 ? `\n🎟️ Cupón: ${appliedCoupon.codigo || appliedCoupon.cupon}` : "";
    whatsappMessage = `Hola Morales Streaming, quiero confirmar y pagar este pedido mediante ${selectedPayMethod}:\n\n${itemLines}${discountLine}${couponLine}\n\nTotal: ${summaryTotal}`;
  } else if (paymentContext === "product" && currentDetailProduct) {
    summaryName = currentDetailProduct.name;
    summaryTotal = formatCurrency(currentDetailProduct.price);
    whatsappMessage = `Hola, quiero confirmar disponibilidad y pagar ${currentDetailProduct.name} por ${summaryTotal} mediante ${selectedPayMethod}.`;
  }

  productName.textContent = summaryName;
  productTotal.textContent = summaryTotal;
  instructionTotal.textContent = summaryTotal;
  paymentWhatsapp.href = createWhatsappLink(whatsappMessage);
}

function closePaymentModal() {
  paymentModal.classList.remove("active");
  document.body.style.overflow = "";
}

const qrZoomModal = document.getElementById("qrZoomModal");
const qrZoomImage = document.getElementById("qrZoomImage");
const qrZoomClose = document.getElementById("qrZoomClose");
const qrZoomButton = document.getElementById("paymentQrZoomButton");

function closeQrZoom() {
  qrZoomModal.classList.remove("active");
}

if (qrZoomButton) {
  qrZoomButton.addEventListener("click", () => {
    qrZoomImage.src = paymentModalQr.src;
    qrZoomModal.classList.add("active");
  });
}
if (qrZoomClose) qrZoomClose.addEventListener("click", closeQrZoom);
if (qrZoomModal) qrZoomModal.addEventListener("click", event => { if (event.target === qrZoomModal) closeQrZoom(); });

function copyNumber() {
  const phone = getWhatsappNumber().replace(/^51/, "");
  navigator.clipboard.writeText(phone);
  mostrarToast("¡Número copiado al portapapeles!");
}

paymentModal.addEventListener("click", e => { if (e.target === paymentModal) closePaymentModal(); });
document.addEventListener("keydown", e => {
  if (e.key === "Escape") { if (siteDialogResolver) return closeSiteDialog(false); closeDetail(); closePaymentModal(); closeQrZoom(); if (typeof closeCheckoutModal === "function") closeCheckoutModal(); }
});

document.addEventListener("DOMContentLoaded", () => {
  const bannerEl = document.getElementById("globalBanner");
  if (bannerEl) {
    bannerEl.textContent = "🔥 ¡Atención rápida hoy por WhatsApp con entrega inmediata! 🚀";
    bannerEl.style.display = "inline-block";
  }

  generarComboItems();
  aplicarFiltros();

  // Fondo del catálogo: cinta horizontal continua y sin reinicios visibles.
  if (document.body) {
    const catalogSlides = [
      "assets/posters/slide-01.jpg",
      "assets/posters/slide-05.jpg",
      "assets/posters/slide-11.jpg",
      "assets/posters/slide-03.jpg",
      "assets/posters/muerte-robin-hood.webp",
      "assets/posters/toy-story-5.webp",
      "assets/posters/la-odisea.webp",
      "assets/posters/en-mar-abierto.webp",
      "assets/posters/robot-salvaje.webp",
      "assets/posters/capitan-america-nuevo-mundo.webp"
    ];
    for (let index = catalogSlides.length - 1; index > 0; index -= 1) {
      const randomIndex = Math.floor(Math.random() * (index + 1));
      [catalogSlides[index], catalogSlides[randomIndex]] = [catalogSlides[randomIndex], catalogSlides[index]];
    }
    const catalogBg = document.createElement("div");
    const catalogTrack = document.createElement("div");
    catalogBg.className = "catalog-bg-layer";
    catalogTrack.className = "catalog-bg-track";
    const buildGroup = () => {
      const group = document.createElement("div");
      group.className = "catalog-bg-group";
      catalogSlides.forEach((slide, index) => {
        const image = document.createElement("img");
        image.src = slide;
        image.alt = "";
        image.setAttribute("aria-hidden", "true");
        image.loading = index < 5 ? "eager" : "lazy";
        group.appendChild(image);
      });
      return group;
    };
    catalogTrack.append(buildGroup(), buildGroup());
    catalogBg.appendChild(catalogTrack);
    document.body.appendChild(catalogBg);
  }

  const loader = document.getElementById("loader");
  const hero = document.querySelector(".hero-modern");
  const loaderBox = loader?.querySelector(".promo-loader-box");
  if (loader && hero && loaderBox) {
    const heroPreview = hero.cloneNode(true);
    heroPreview.classList.add("loader-hero-preview");
    const heroTag = heroPreview.querySelector(".promo-loader-tag");
    const heroTitle = heroPreview.querySelector("h1");
    const heroSubtitle = heroPreview.querySelector(".hero-sub");
    const heroCopy = document.createElement("div");
    heroCopy.className = "loader-hero-copy";
    if (heroTag) heroCopy.appendChild(heroTag);
    if (heroTitle) {
      heroTitle.innerHTML = 'MORALES <span class="gradient-text" data-text="STREAMING">STREAMING</span>';
      heroCopy.appendChild(heroTitle);
    }
    if (heroSubtitle) {
      heroSubtitle.textContent = "Tus plataformas favoritas, con activación rápida y soporte garantizado.";
      heroCopy.appendChild(heroSubtitle);
    }
    heroPreview.appendChild(heroCopy);
    const exploreButton = document.createElement("a");
    exploreButton.className = "loader-explore-cta";
    exploreButton.href = "#planes";
    exploreButton.innerHTML = 'Explorar página <i class="fa-solid fa-arrow-down"></i>';
    exploreButton.addEventListener("click", () => loader.classList.add("hide"));
    heroPreview.appendChild(exploreButton);
    loaderBox.replaceWith(heroPreview);
  }

  // La bienvenida permanece visible hasta que el usuario pulsa “Explorar página”.

  cargarCatalogoDesdeSheets()
    .then(() => {
      generarComboItems();
      aplicarFiltros();
    })
    .catch(e => console.error("Error al cargar:", e));

});

function closeFlashOffer() {
  const flash1 = document.getElementById("flashOffer");
  if (flash1) flash1.style.display = "none";
}

const clearSearchBtn = document.getElementById("clearSearchBtn");
if (searchInput && clearSearchBtn) {
  searchInput.addEventListener("input", () => {
    if (searchInput.value.trim() !== "") {
      clearSearchBtn.style.display = "block";
    } else {
      clearSearchBtn.style.display = "none";
    }
  });

  clearSearchBtn.addEventListener("click", () => {
    searchInput.value = "";
    clearSearchBtn.style.display = "none";
    aplicarFiltros();
    searchInput.focus();
  });
}

function toggleFaq(button) {
  const item = button.parentElement;
  const isActive = item.classList.contains("active");
  document.querySelectorAll(".faq-item").forEach(el => el.classList.remove("active"));
  if (!isActive) {
    item.classList.add("active");
  }
}

let selectedPayMethod = "Yape";
function verTodasLasPlataformas() {
  const btnTodo = document.querySelector('.category-chip[data-category-filter="all"]');
  if (btnTodo) {
    btnTodo.click();
    document.getElementById("planes").scrollIntoView({ behavior: 'smooth' });
  }
}

// 🚀 Lógica de aparición y acción del botón Scroll To Top
const scrollTopBtn = document.getElementById("scrollTopBtn");

window.addEventListener("scroll", () => {
  if (!scrollTopBtn) return;
  const scrollTotal = document.documentElement.scrollHeight - document.documentElement.clientHeight;
  const currentScroll = window.scrollY;

  if (scrollTotal > 0 && (currentScroll / scrollTotal) >= 0.35) {
    scrollTopBtn.classList.add("show");
  } else {
    scrollTopBtn.classList.remove("show");
  }
});

function scrollToTop() {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
}

// ==========================================================
// 🎉 TOAST GENÉRICO REUTILIZABLE
// ==========================================================
function mostrarToast(texto) {
  const toast = document.getElementById("toastNotification");
  const toastText = document.getElementById("toastText");
  if (!toast) return;
  if (toastText) toastText.textContent = texto;
  toast.style.transform = "translateX(-50%) translateY(0)";
  toast.style.opacity = "1";
  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(() => {
    toast.style.transform = "translateX(-50%) translateY(100px)";
    toast.style.opacity = "0";
  }, 2200);
}
