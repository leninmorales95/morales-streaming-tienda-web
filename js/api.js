/* Extracted conservatively from the original main.js. */
const LOCAL_PRODUCT_IMAGES = {
  netflix: 'assets/products/netflix.png', disney: 'assets/products/disney.png', movistar: 'assets/products/movistar-tv.jpg',
  directvgo: 'assets/products/directv-go.png', youtube: 'assets/products/youtube.png', max: 'assets/products/hbo-max.png',
  iptv: 'assets/products/iptv.jpg', paramount: 'assets/products/paramount.png', crunchyroll: 'assets/products/crunchyroll.png',
  universal: 'assets/products/universal-plus.jpg', prime: 'assets/products/prime-video.png', chatgpt: 'assets/products/chatgpt.png',
  vix: 'assets/products/vix.png', spotify: 'assets/products/spotify.jpg', appletv: 'assets/products/apple-tv.png',
  viki: 'assets/products/viki-rakuten.png', mubi: 'assets/products/mubi.jpg', office: 'assets/products/microsoft-office.png',
  canva: 'assets/products/canva.png', onedrive: 'assets/products/google-one.webp', windows: 'assets/products/windows-11.webp'
};
const LOCAL_PRODUCT_BACKGROUNDS = {
  netflix: 'assets/product-backgrounds/netflix.jpg', disney: 'assets/product-backgrounds/disney.jpg', movistar: 'assets/product-backgrounds/movistar-tv.jpg'
};
const LOCAL_COMBO_BACKGROUNDS = { 'combo familiar': 'assets/combos/combo-familiar.jpg' };
function normalizeStockBadge(product) {
  const hasExplicitStock = product.stock !== undefined && product.stock !== null && String(product.stock).trim() !== "";
  const raw = String(hasExplicitStock ? product.stock : (product.badge_mini ?? "")).trim();
  const explicitStock = Number(product.stock);
  const numberMatch = raw.match(/\d+/);
  const amount = Number.isFinite(explicitStock) && hasExplicitStock
    ? Math.max(0, Math.floor(explicitStock))
    : (numberMatch ? Math.max(0, Number(numberMatch[0])) : null);

  if (/agotado|sin stock/i.test(raw) || amount === 0) return { text: "Agotado", tone: "red", amount: 0 };
  if (amount === 1) return { text: "Último 1", tone: "red", amount };
  if (amount === 2 || amount === 3) return { text: `Últimos ${amount}`, tone: "yellow", amount };
  if (amount >= 4) return { text: `${amount} disponibles`, tone: "green", amount };
  return { text: raw, tone: "yellow", amount: null };
}

function procesarDatosDeLaWeb(data) {
  if (!data || typeof data !== "object") return;
  siteConfig = { ...siteConfig, ...(data.config || {}) };
  availableCoupons = Array.isArray(data.cupones) ? data.cupones : [];
  updateWhatsappNumbers();
  const listaProductos = data.productos || (Array.isArray(data) ? data : []);

  if (listaProductos.length > 0) {
    rawProductosData = listaProductos.map(product => ({
      ...product,
      logo_url: LOCAL_PRODUCT_IMAGES[String(product.id || '').toLowerCase()] || product.logo_url,
      imagen_fondo: LOCAL_PRODUCT_BACKGROUNDS[String(product.id || '').toLowerCase()] || product.imagen_fondo
    }));
    if (typeof sincronizarCarritoConCatalogo === "function") sincronizarCarritoConCatalogo();
    const container = document.getElementById("cardsContainer");
    container.innerHTML = "";

    const productCards = rawProductosData.map(p => {
      const normalizedStock = normalizeStockBadge(p);
      const isSoldOut = String(p.estado).toLowerCase() === "agotado" || normalizedStock.amount === 0;
      const cardClass = isSoldOut ? "card product-card-v3 sold-out" : "card product-card-v3";
      const offerPrice = parseMoney(p.precio_oferta);
      const regularPrice = parseMoney(p.precio_tachado);
      const hasOffer = regularPrice > offerPrice && offerPrice > 0;
      const saving = hasOffer ? regularPrice - offerPrice : 0;
      const features = String(p.caracteristicas || "")
        .split(",")
        .map(item => item.trim())
        .filter(Boolean)
        .slice(0, 2);
      const categoryLabel = String(p.categoria || "Streaming").replace(/^[.\s]+/, "").trim();
      const durationLabel = String(p.duracion || "Plan mensual").replace(/^[.\s]+/, "").trim();
      const stockText = isSoldOut ? "Agotado" : (normalizedStock.text || "Disponible");

      return `
        <article class="${cardClass}" data-name="${String(p.nombre).toLowerCase()} ${String(p.categoria || "").toLowerCase()}" data-platform="${p.id}" data-category="${p.categoria}">
          <button class="product-visual-v3 detail-hit" type="button" aria-label="Ver detalles de ${p.nombre}">
            <span class="product-image-stage-v3 brand-logo-card">
              <img src="${p.logo_url}" alt="${p.nombre}" loading="lazy">
            </span>
            <span class="card-badges-v3">
              <span class="stock-badge-v3 ${isSoldOut ? "off" : `stock-${normalizedStock.tone}`}">
                <i class="fa-solid ${isSoldOut ? "fa-circle-xmark" : "fa-circle-check"}"></i> ${stockText}
              </span>
            </span>
          </button>

          <div class="product-body-v3">
            <div class="product-heading-v3"><h3 class="plan-title">${p.nombre}</h3></div>

            <div class="meta-chips-v3">
              <span class="meta-chip-v3">${categoryLabel}</span>
              <span class="meta-chip-v3 plan-duration">${durationLabel}</span>
            </div>

            ${features.length ? `<div class="card-features-v3">${features.map(f => `<div class="card-feature-v3"><i class="fa-solid fa-check"></i>${f}</div>`).join("")}</div>` : ""}

            <div class="price-row-v3">
              <div class="product-price-v3 price-container-card">
                ${hasOffer ? `<span class="old-price-card">${formatCurrency(regularPrice)}</span>` : ""}
                <strong class="current-price-val">${formatCurrency(offerPrice)}</strong>
              </div>
            </div>

            <div class="card-actions-v3 card-buttons-wrapper">
              <button class="card-detail-button-v3 btn-buy" type="button" ${isSoldOut ? "disabled" : ""}>
                <i class="fa-regular fa-eye"></i> Ver detalles
              </button>
              <button class="card-cart-button-v3 add-to-cart-btn" type="button" ${isSoldOut ? "disabled" : ""} title="Añadir al carrito" aria-label="Agregar ${p.nombre} al carrito">
                <i class="fa-solid fa-cart-plus"></i>
              </button>
            </div>
          </div>
        </article>
      `;
    });

    // 🚀 Tarjeta del "+" al final del catálogo (una sola vez)
    const moreCardHtml = `
      <article class="card more-platforms-card" onclick="verTodasLasPlataformas()" data-category="top">
        <div class="card-inner" style="justify-content: center; align-items: center; text-align: center; background: radial-gradient(circle at center, rgba(0,212,255,0.15), rgba(18,22,45,0.98));">
          <div style="width: 65px; height: 65px; border-radius: 50%; background: linear-gradient(135deg, #6a11cb, #2575fc, #00d4ff); display: grid; place-items: center; margin-bottom: 14px; box-shadow: 0 0 20px rgba(0,212,255,0.4);">
            <i class="fa-solid fa-plus" style="font-size: 1.8rem; color: #ffffff;"></i>
          </div>
          <h3 class="plan-title" style="font-size: 1.1rem !important; margin-bottom: 4px;">Ver más plataformas</h3>
          <p class="plan-duration" style="color: var(--text-gray) !important;">Explora todo el catálogo</p>
        </div>
      </article>
    `;
    container.innerHTML = productCards.join("") + moreCardHtml;

    cards = document.querySelectorAll(".card");
    prepararTarjetasInteractivas();

    generarComboItems();
    aplicarFiltros();
  }

  if (data.combos && Array.isArray(data.combos) && data.combos.length > 0) {
    const comboGrid = document.querySelector(".combo-premium-grid");
    if (comboGrid) {
      comboGrid.innerHTML = "";
      const comboCards = data.combos.map(c => {
        c = { ...c, imagen_fondo: LOCAL_COMBO_BACKGROUNDS[String(c.titulo || '').toLowerCase()] || c.imagen_fondo };
        const waLink = createWhatsappLink(`🐱‍👤 ¡Hola! Vengo de la página web 🌐\n\n${c.whatsapp_text}\n\n💳 ¿Me compartes los métodos de pago por favor?`);

        let comboBgStyle = "";
        if (c.imagen_fondo && c.imagen_fondo.trim() !== "") {
          comboBgStyle = `background-image: linear-gradient(145deg, rgba(22, 27, 51, 0.88), rgba(9, 12, 34, 0.94)), url("${c.imagen_fondo.trim()}"); background-size: cover; background-position: center;`;
        }

        const comboHtml = `
          <article class="combo-premium-card" style="${comboBgStyle}">
            <span class="combo-label">${c.etiqueta}</span>
            <h3>${c.titulo}</h3>
            <p><strong class="combo-platforms">${c.descripcion.split(/(?= para | para |\. )/i)[0].trim()}</strong><span class="combo-description">${c.descripcion.split(/(?= para | para |\. )/i).slice(1).join('').replace(/^[.\s]+/, '').trim()}</span></p>
            <div class="combo-price-mini">${formatCurrency(c.precio)}</div>
            <a class="combo-action" href="${waLink}" target="_blank">Solicitar combo <i class="fab fa-whatsapp"></i></a>
          </article>
        `;
        return comboHtml;
      });

      // 🚀 Tarjeta "Arma tu Combo" al final
      const customComboCardHtml = `
        <article class="combo-premium-card" onclick="openCustomComboModal()" style="cursor: pointer; display: flex; flex-direction: column; justify-content: space-between; align-items: center; text-align: center; background: radial-gradient(circle at center, rgba(0,212,255,0.15), rgba(18,22,45,0.98));">
          <div style="width: 45px; height: 45px; border-radius: 50%; background: linear-gradient(135deg, #6a11cb, #2575fc, #00d4ff); display: grid; place-items: center; margin-top: 5px; box-shadow: 0 0 15px rgba(0,212,255,0.4);">
            <i class="fa-solid fa-plus" style="font-size: 1.3rem; color: #ffffff;"></i>
          </div>
          <div>
            <h3 style="font-size: 1.05rem !important; margin-bottom: 4px;">Arma tu Combo</h3>
            <p style="font-size: 0.75rem !important; color: var(--text-gray) !important; margin: 0 !important;">Elige las plataformas que quieras y ahorra más.</p>
          </div>
          <span class="custom-card-btn">
            Personalizar <i class="fa-solid fa-wand-magic-sparkles"></i>
          </span>
        </article>
        `;
      comboGrid.innerHTML = comboCards.join("") + customComboCardHtml;
    }
  }

  if (data.config) {
    const cfg = data.config;
    const phone = getWhatsappNumber();
    flashOfferEnabled = isSettingEnabled(cfg.flash_activo, true);
    flashOffer2Enabled = isSettingEnabled(cfg.flash_activo2, true);

    const bannerEl = document.getElementById("globalBanner");
    if (bannerEl && cfg.anuncio_banner) {
      bannerEl.textContent = cfg.anuncio_banner;
      bannerEl.style.display = "inline-block";
    }

    const floatBtn = document.querySelector(".whatsapp-float");
    if (floatBtn && cfg.whatsapp_general) {
      floatBtn.href = `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(cfg.whatsapp_general)}`;
    }

    const titularEl = document.querySelector("#paymentModal p strong");
    if (titularEl && cfg.titular_pago) {
      titularEl.textContent = cfg.titular_pago;
    }

    const flashCard1 = document.getElementById("flashOffer");
    const flashPrice1 = parseMoney(cfg.flash_precio_nuevo);
    if (flashOfferEnabled && flashPrice1 > 0 && cfg.flash_titulo && cfg.flash_titulo.toLowerCase() !== "no" && cfg.flash_titulo.trim() !== "") {
      document.getElementById("flashTitle").textContent = cfg.flash_titulo;
      document.getElementById("flashSub").textContent = cfg.flash_subtitulo || "¡Solo por hoy!";
      document.getElementById("flashOldPrice").textContent = formatCurrency(cfg.flash_precio_viejo);
      document.getElementById("flashNewPrice").textContent = formatCurrency(flashPrice1);

      const flashMsg = cfg.flash_whatsapp || `¡Hola! Quiero aprovechar la Oferta Flash de ${cfg.flash_titulo} a S/${cfg.flash_precio_nuevo}`;
      document.getElementById("flashWhatsappBtn").href = `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(flashMsg)}`;
      scheduleFlashOffer(cfg.flash_retraso_segundos || 35);
    } else if (flashCard1) {
      clearTimeout(flashOfferTimer);
      flashCard1.style.setProperty("display", "none", "important");
    }

    const titulo2 = cfg.flash_titulo2 || cfg.flash_tituloo2;
    const flashCard2 = document.getElementById("flashOffer2");
    const flashPrice2 = parseMoney(cfg.flash_precio_nuevo2);
    if (flashCard2 && flashOffer2Enabled && flashPrice2 > 0 && titulo2 && titulo2.toLowerCase() !== "no" && titulo2.trim() !== "") {
      document.getElementById("flashTitle2").textContent = titulo2;
      document.getElementById("flashSub2").textContent = cfg.flash_subtituloo2 || cfg.flash_subtitulo2 || "¡Promoción por tiempo limitado!";
      document.getElementById("flashOldPrice2").textContent = formatCurrency(cfg.flash_precio_viejo2);
      document.getElementById("flashNewPrice2").textContent = formatCurrency(flashPrice2);

      const flashMsg2 = cfg.flash_whatsapp2 || `¡Hola! Quiero aprovechar la Oferta Flash de ${titulo2} a S/${cfg.flash_precio_nuevo2}`;
      const btnFlash2 = document.getElementById("flashWhatsappBtn2");
      if (btnFlash2) {
        btnFlash2.href = `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(flashMsg2)}`;
      }
    } else if (flashCard2) {
      flashCard2.style.setProperty("display", "none", "important");
    }
  }
}
