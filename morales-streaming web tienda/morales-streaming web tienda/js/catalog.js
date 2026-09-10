/* Extracted conservatively from the original main.js. */
let rawProductosData = [];
const searchInput = document.getElementById("searchInput");
let cards = document.querySelectorAll(".card");
const categoryChips = document.querySelectorAll(".category-chip");
const noResultsMsg = document.getElementById("noResultsMsg");

let currentCategory = "top";

function searchEditDistance(source, target) {
  const a = String(source || "");
  const b = String(target || "");
  const row = Array.from({ length: b.length + 1 }, (_, index) => index);
  for (let i = 1; i <= a.length; i++) {
    let previous = row[0];
    row[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const saved = row[j];
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, previous + cost);
      previous = saved;
    }
  }
  return row[b.length];
}

function fuzzySearchMatch(query, searchableText) {
  const queryWords = String(query || "").split(/\s+/).filter(word => word.length >= 3);
  if (!queryWords.length) return false;
  const targetWords = String(searchableText || "").split(/[^a-z0-9+]+/).filter(Boolean);
  return queryWords.every(queryWord => targetWords.some(targetWord => {
    if (targetWord.includes(queryWord) || queryWord.includes(targetWord)) return true;
    if (queryWord.length < 4 || targetWord.length < 4) return false;
    const tolerance = Math.max(queryWord.length, targetWord.length) >= 8 ? 2 : 1;
    return Math.abs(queryWord.length - targetWord.length) <= tolerance && searchEditDistance(queryWord, targetWord) <= tolerance;
  }));
}

const platformDetails = {
  netflix: { name: "Netflix", description: "Películas, series y estrenos en máxima resolución 4K.", price: "S/16.00", note: "Garantía completa del mes. Entrega al instante.", features: ["Calidad 4K Ultra HD + HDR", "Descargas ilimitadas offline", "Sin anuncios ni interrupciones", "Audio espacial inmersivo Dolby", "Garantía y soporte Morales Streaming"] },
  disney: { name: "Disney+ Premium", description: "Contenido familiar, Marvel, Star Wars y ESPN.", price: "S/12.00", note: "Amantes del fútbol y eventos en vivo.", features: ["Todos los canales de ESPN en vivo", "Eventos deportivos PPV exclusivos", "Series de Marvel y Star Wars", "Resolución 4K UHD con Dolby Vision", "Descargas permitidas para viajes"] },
  movistar: { name: "Movistar TV", description: "Señal de televisión digital de cable con canales locales.", price: "S/20.00", note: "Televisión en vivo estable.", features: ["Más de 130 canales digitales HD", "Transmisiones en vivo sin retrasos", "Sección de noticias y TV nacional", "Acceso multidispositivo en Smart TV", "Servicio fluido 100% garantizado"] },
  directvgo: { name: "DIRECTV GO", description: "La mejor señal deportiva, canales premium en vivo.", price: "S/30.00", note: "Señal HD para ligas extranjeras.", features: ["Liga 1 Max para fútbol peruano", "Canales de cable premium en vivo", "Contenido exclusivo de DIRECTV Sports", "Resolución de alta definición estable", "Soporte dedicado 24/7"] },
  youtube: { name: "YouTube Premium", description: "Navegación libre de comerciales con música offline.", price: "S/8.00", note: "Activación en tu cuenta personal.", features: ["Videos ilimitados sin publicidad", "YouTube Music Premium incluido", "Reproducción en segundo plano nativa", "Descargas de videos en alta calidad", "Activación directa con tu correo"] },
  max: { name: "HBO Max", description: "Blockbusters de Warner Bros y series exclusivas.", price: "S/8.00", note: "Resolución premium garantizada.", features: ["Series originales galardonadas de HBO", "Películas de estreno tras cartelera", "Resolución 4K Ultra HD estable", "Universo completo de DC y Warner", "Cuentas estables con perfil propio"] },
  iptv: { name: "IPTV Premium", description: "Miles de canales internacionales en vivo.", price: "S/10.00", note: "Requiere conexión estable a internet.", features: ["Canales de todo el mundo en vivo", "Parrilla de deportes internacionales", "Biblioteca gigante de películas y series", "Compatible con Smart TV y celulares", "Servidores estables sin caídas"] },
  paramount: { name: "Paramount+", description: "Series exclusivas, estrenos y contenido infantil.", price: "S/15.00", note: "Catálogo completo mensual.", features: ["Series icónicas y estrenos de cine", "Contenido infantil con Nickelodeon", "Eventos en vivo seleccionados", "Transmisión en Full HD nítida", "Entrega inmediata de credenciales"] },
  crunchyroll: { name: "Crunchyroll", description: "Anime, temporadas populares y simulcasts.", price: "S/7.00", note: "Contenido oficial sin publicidad.", features: ["Simulcasts una hora después de Japón", "Todo el catálogo sin publicidad", "Calidad de video en Full HD", "Acceso a mangas digitales", "Uso ilimitado durante el mes"] },
  universal: { name: "Universal+", description: "Producciones de Universal, series y canales.", price: "S/7.00", note: "Variedad de cine para casa.", features: ["Canales premium de Universal en vivo", "Series exclusivas americanas", "Catálogo variado de cine familiar", "Resolución de alta definición", "Activación veloz y garantizada"] },
  prime: { name: "Prime Video", description: "Películas, series y Amazon Originals.", price: "S/7.00", note: "Resolución de alta fidelidad.", features: ["Contenido original exclusivo de Amazon", "Películas y series en alta definición", "Soporte multidispositivo integrado", "Descarga de capítulos para llevar", "Garantía completa de Morales Streaming"] },
  chatgpt: { name: "ChatGPT AI", description: "Herramientas de IA para estudio y trabajo.", price: "S/12.00", note: "Productividad y redacción pro.", features: ["Modelos avanzados IA", "Ideal para trabajo/estudio", "Respuestas rápidas", "Asistente ideal para tareas y oficina", "Soporte garantizado del servicio"] },
  vix: { name: "Vix Premium", description: "Novelas, series y fútbol latino.", price: "S/5.00", note: "Entretenimiento 100% en español.", features: ["La colección más grande de novelas", "Partidos seleccionados de fútbol latino", "Películas y series en español", "Acceso económico mensual", "Atención rápida por WhatsApp"] },
  spotify: { name: "Spotify Premium", description: "Música sin anuncios y saltos ilimitados.", price: "S/10.00", note: "Audio de alta fidelidad.", features: ["Música ilimitada sin comerciales", "Descargas de canciones y playlists", "Saltos de canción ilimitados", "Calidad de audio extrema y nítida", "Soporte Morales Streaming"] },
  appletv: { name: "Apple TV", description: "Producciones originales de Apple.", price: "S/6.00", note: "Calidad de video cinematográfica.", features: ["Series y películas galardonadas exclusivas", "Máxima fidelidad 4K HDR de la industria", "Interfaz limpia y de carga rápida", "Audio espacial inmersivo Dolby Atmos", "Atención inmediata para activar"] },
  viki: { name: "Viki Rakuten", description: "Doramas coreanos y series asiáticas.", price: "S/7.00", note: "Ideal para fanáticos de Asia.", features: ["Gran catálogo de doramas y k-dramas", "Traducciones y subtítulos oficiales", "Resolución HD sin comerciales", "Estrenos populares exclusivos", "Acceso premium garantizado"] },
  mubi: { name: "Mubi", description: "Cine seleccionado de autor e independiente.", price: "S/7.00", note: "Perfecto para cinéfilos exigentes.", features: ["Catálogo curado por expertos en cine", "Películas independientes e internacionales", "Transmisiones estables en alta fidelidad", "Sin anuncios ni interrupciones comerciales", "Entrega veloz y soporte rápido"] },
  office: { name: "Microsoft Office", description: "Ofimática completa Word, Excel, PowerPoint.", price: "S/30.00", note: "Productividad comercial y escolar.", features: ["Aplicaciones oficiales completas de Office", "Acceso a Word, Excel y PowerPoint", "Herramientas esenciales de productividad", "Soporte Morales Streaming continuo", "Activación coordinada y segura"] },
  canva: { name: "Canva Pro", description: "Diseño gráfico premium y kits de marca.", price: "S/5.00", note: "Kit completo para creadores.", features: ["Acceso ilimitado a plantillas premium", "Herramienta pro de remoción de fondos", "Elementos gráficos y tipografías exclusivas", "Kit de marca para organizar diseños", "Atención fluida y rápida"] },
  onedrive: { name: "OneDrive", description: "Almacenamiento en la nube seguro.", price: "S/5.00", note: "Copia de seguridad multidispositivo.", features: ["Espacio de almacenamiento seguro en la nube", "Respaldos automáticos de fotos y archivos", "Acceso seguro multidispositivo", "Soporte dedicado Morales Streaming", "Renovación sencilla mes a mes"] }
};

const modalThemes = {
  netflix: { color: "#e50914" }, disney: { color: "#7fdcff" }, movistar: { color: "#2aa7f4" },
  directvgo: { color: "#ff8a00" }, youtube: { color: "#ff0000" }, max: { color: "#b95cff" },
  iptv: { color: "#7b2cff" }, paramount: { color: "#3c82ff" }, crunchyroll: { color: "#ff640a" },
  universal: { color: "#8ecbff" }, prime: { color: "#00a8e1" }, chatgpt: { color: "#20c997" },
  vix: { color: "#ff2d75" }, spotify: { color: "#1db954" }, appletv: { color: "#ffffff" },
  viki: { color: "#00b4d8" }, mubi: { color: "#fff200" }, office: { color: "#f97316" },
  canva: { color: "#00c4cc" }, onedrive: { color: "#0078d4" }
};

async function cargarCatalogoDesdeSheets() {
  const datosGuardados = localStorage.getItem(CATALOG_CACHE_KEY);
  let cacheValida = false;
  if (datosGuardados) {
    try {
      const cache = JSON.parse(datosGuardados);
      if (cache && cache.data) {
        procesarDatosDeLaWeb(cache.data);
        cacheValida = Date.now() - Number(cache.savedAt || 0) < CATALOG_CACHE_TTL;
      }
    } catch (e) { console.error("Error leyendo caché:", e); }
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);
    const response = await fetch(SHEET_API_URL, { cache: "no-store", signal: controller.signal });
    clearTimeout(timeoutId);
    if (!response.ok) throw new Error(`Apps Script respondió ${response.status}`);
    const data = await response.json();
    if (data && !data.error) {
      localStorage.setItem(CATALOG_CACHE_KEY, JSON.stringify({ savedAt: Date.now(), data }));
      procesarDatosDeLaWeb(data);
    } else if (data && data.error) {
      throw new Error(data.error);
    }
  } catch (error) {
    console.warn(cacheValida ? "Usando caché reciente:" : "No se pudo actualizar el catálogo:", error);
  }
}

function inferCardCategories(card) {
  const key = String(card.dataset.platform || "").toLowerCase();
  const detail = platformDetails[key] || {};
  const text = `${card.dataset.category || ""} ${card.dataset.name || ""} ${card.dataset.platform || ""} ${card.querySelector(".plan-title")?.textContent || ""} ${card.querySelector(".plan-duration")?.textContent || ""} ${detail.description || ""} ${(detail.features || []).join(" ")}`.toLowerCase();
  const set = new Set();
  const has = (...terms) => terms.some(term => text.includes(term));

  if (has("streaming", "netflix", "disney", "max", "hbo", "prime", "paramount", "vix", "apple tv", "mubi", "universal")) set.add("streaming");
  if (has("tv", "iptv", "directv", "dgo", "movistar", "canal", "cable")) set.add("tv");
  if (has("deporte", "sports", "futbol", "fútbol", "liga", "espn")) set.add("sports");
  if (has("music", "música", "musica", "spotify", "youtube")) set.add("music");
  if (has("anime", "crunchyroll")) set.add("anime");
  if (has("pelicula", "película", "cine", "series", "netflix", "disney", "max", "hbo", "prime", "paramount", "vix", "mubi", "universal", "apple tv")) set.add("movies");
  if (has("productividad", "chatgpt", "office", "onedrive", "ia", "inteligencia artificial")) set.add("productivity");
  if (has("diseño", "diseno", "canva")) set.add("design");
  if (has("software", "office", "onedrive", "canva", "chatgpt")) set.add("software");
  return set;
}

function getCardPrice(card) {
  return parseMoney(card.querySelector(".current-price-val")?.textContent || card.querySelector(".price-tag")?.textContent || 0);
}

function sortCatalogCards() {
  const container = document.getElementById("cardsContainer");
  if (!container) return;
  const sort = document.getElementById("catalogSort")?.value || "featured";
  const productCards = Array.from(container.querySelectorAll(".card:not(.more-platforms-card)"));
  productCards.forEach((card, index) => {
    if (!card.dataset.originalOrder) card.dataset.originalOrder = String(index + 1);
  });
  productCards.sort((a,b) => {
    if (sort === "price-asc") return getCardPrice(a) - getCardPrice(b);
    if (sort === "price-desc") return getCardPrice(b) - getCardPrice(a);
    if (sort === "name") return (a.querySelector(".plan-title")?.textContent || "").localeCompare(b.querySelector(".plan-title")?.textContent || "", "es");
    return Number(a.dataset.originalOrder || 0) - Number(b.dataset.originalOrder || 0);
  });
  const more = container.querySelector(".more-platforms-card");
  productCards.forEach(card => container.appendChild(card));
  if (more) container.appendChild(more);
  cards = document.querySelectorAll(".card");
}

function aplicarFiltros() {
  sortCatalogCards();
  const normalizeSearch = value => String(value || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
  const searchVal = normalizeSearch(searchInput.value);
  const isSearching = searchVal !== "";
  const semanticGroups = {
    movies: ["pelicula","peliculas","peli","pelis","cine","serie","series","estreno","estrenos","movie","movies","film"],
    sports: ["deporte","deportes","futbol","partido","partidos","liga","liga 1","sports","espn"],
    music: ["musica","cancion","canciones","audio","spotify","music"],
    tv: ["tv","television","canales","canal","en vivo","cable","iptv"],
    anime: ["anime","animes","manga","crunchyroll","japon"],
    productivity: ["productividad","oficina","trabajo","estudio","ia","inteligencia artificial","chatgpt","office"],
    design: ["diseno","diseñar","crear diseños","canva"],
    software: ["software","programa","programas","office","onedrive","canva","chatgpt"],
    family: ["familia","familiar","ninos","niños","infantil","marvel","disney"],
    budget: ["barato","barata","economico","economica","económico","económica","ahorro","oferta"]
  };
  const semanticCategory = Object.entries(semanticGroups).find(([, words]) => words.some(word => searchVal.includes(normalizeSearch(word)) || fuzzySearchMatch(searchVal, normalizeSearch(word))))?.[0] || null;
  const availableOnly = document.getElementById("availableOnly")?.checked || false;
  const offersOnly = document.getElementById("offersOnly")?.checked || false;

  document.body.classList.toggle("search-active", isSearching);
  let matchCount = 0;

  cards.forEach(card => {
    if (card.classList.contains("more-platforms-card")) {
      card.classList.toggle("hide-card", !(currentCategory === "top" && !isSearching && !availableOnly && !offersOnly));
      return;
    }

    const platformKey = String(card.dataset.platform || "").toLowerCase();
    const detailSearch = platformDetails[platformKey] || {};
    const searchable = normalizeSearch(`${card.dataset.name || ""} ${card.dataset.category || ""} ${card.dataset.platform || ""} ${card.querySelector(".plan-title")?.textContent || ""} ${card.querySelector(".plan-duration")?.textContent || ""} ${detailSearch.description || ""} ${(detailSearch.features || []).join(" ")}`);
    const categories = inferCardCategories(card);
    const semanticProductMatch = semanticCategory === "family"
      ? categories.has("movies")
      : semanticCategory === "budget"
        ? getCardPrice(card) <= 10
        : semanticCategory && categories.has(semanticCategory);
    const pasaBusqueda = !isSearching || searchable.includes(searchVal) || fuzzySearchMatch(searchVal, searchable) || semanticProductMatch;
    const pasaCategoria = ["all","top"].includes(currentCategory) || categories.has(currentCategory);
    const pasaDisponible = !availableOnly || !card.classList.contains("sold-out");
    const pasaOferta = !offersOnly || Boolean(card.querySelector(".old-price-card"));
    const matches = pasaBusqueda && pasaCategoria && pasaDisponible && pasaOferta;

    if (matches) {
      matchCount++;
      const visibleTop = currentCategory === "top" && !isSearching ? matchCount <= 5 : true;
      card.classList.toggle("hide-card", !visibleTop);
    } else {
      card.classList.add("hide-card");
    }
  });

  const comboSection = document.querySelector(".combo-premium-section");
  const comboCards = Array.from(document.querySelectorAll(".combo-premium-card"));
  let comboMatchCount = 0;
  const wantsAllCombos = ["combo", "combos"].some(term => searchVal === term || fuzzySearchMatch(searchVal, term));
  const semanticComboWords = semanticCategory ? semanticGroups[semanticCategory].map(normalizeSearch) : [];

  comboCards.forEach(comboCard => {
    const comboText = normalizeSearch(comboCard.textContent);
    const comboSemanticMatch = semanticComboWords.some(word => comboText.includes(word));
    const comboMatches = !isSearching || wantsAllCombos || comboText.includes(searchVal) || fuzzySearchMatch(searchVal, comboText) || comboSemanticMatch;
    comboCard.classList.toggle("search-hidden", !comboMatches);
    if (isSearching && comboMatches) comboMatchCount++;
  });

  if (comboSection) {
    comboSection.classList.toggle("search-hidden", isSearching && comboMatchCount === 0);
  }

  const totalMatches = matchCount + comboMatchCount;
  if (noResultsMsg) noResultsMsg.style.setProperty("display", totalMatches === 0 ? "block" : "none", "important");

  const suggestionBox = document.getElementById("searchSuggestion");
  if (suggestionBox) {
    const candidates = ["combos", ...Object.values(platformDetails).map(item => normalizeSearch(item.name)), ...Object.values(semanticGroups).flat().map(normalizeSearch)];
    const suggestion = isSearching && !candidates.includes(searchVal)
      ? candidates
          .map(term => ({ term, distance: searchEditDistance(searchVal, term) }))
          .filter(item => item.distance <= (searchVal.length >= 8 ? 2 : 1))
          .sort((a, b) => a.distance - b.distance)[0]?.term
      : null;
    suggestionBox.hidden = !suggestion || totalMatches === 0;
    suggestionBox.textContent = suggestion ? `Mostrando resultados relacionados con “${suggestion}”` : "";
  }
}

categoryChips.forEach(chip => {
  chip.addEventListener("click", () => {
    categoryChips.forEach(c => c.classList.remove("active"));
    chip.classList.add("active");
    currentCategory = chip.dataset.categoryFilter || "top";
    aplicarFiltros();
  });
});

const categoryMoreToggle = document.querySelector(".category-more-toggle");
categoryMoreToggle?.addEventListener("click", () => {
  const categoryFilter = categoryMoreToggle.closest(".category-filter");
  const expanded = categoryFilter?.classList.toggle("is-expanded") || false;
  categoryMoreToggle.setAttribute("aria-expanded", String(expanded));
  categoryMoreToggle.innerHTML = expanded
    ? 'Menos <i class="fa-solid fa-chevron-up"></i>'
    : 'Más categorías <i class="fa-solid fa-chevron-down"></i>';
});

["catalogSort", "availableOnly", "offersOnly"].forEach(id => {
  document.getElementById(id)?.addEventListener("change", aplicarFiltros);
});

// 🚀 Debounce en el buscador para mejor rendimiento
let searchDebounceTimer;
searchInput.addEventListener("input", () => {
  clearTimeout(searchDebounceTimer);
  searchDebounceTimer = setTimeout(aplicarFiltros, 150);
});

const detailView = document.getElementById("detailView");
const detailPanel = document.getElementById("detailPanel");
const detailClose = document.getElementById("detailClose");
const detailName = document.getElementById("detailName");
const detailDescription = document.getElementById("detailDescription");
const detailFeatures = document.getElementById("detailFeatures");
const detailPrice = document.getElementById("detailPrice");
const detailNote = document.getElementById("detailNote");
const detailAddCart = document.getElementById("detailAddCart");
const detailGoCart = document.getElementById("detailGoCart");
const detailLogo = document.getElementById("detailLogo");
const detailStock = document.getElementById("detailStock");
const detailDuration = document.getElementById("detailDuration");
const detailCategory = document.getElementById("detailCategory");
const detailOldPrice = document.getElementById("detailOldPrice");
const detailPriceDuration = document.getElementById("detailPriceDuration");
const detailConditions = document.getElementById("detailConditions");
const detailDelivery = document.getElementById("detailDelivery");
const detailSupport = document.getElementById("detailSupport");
const detailQtyMinus = document.getElementById("detailQtyMinus");
const detailQtyPlus = document.getElementById("detailQtyPlus");
const detailQtyValue = document.getElementById("detailQtyValue");
const detailBuyNow = document.getElementById("detailBuyNow");
let detailQuantity = 1;
let currentDetailProduct = null;

function openDetail(platformKey) {
  const cardElement = document.querySelector(`.card[data-platform="${platformKey}"]`);
  if (cardElement && cardElement.classList.contains("sold-out")) return;

  const sheetData = rawProductosData.find(p => p.id === platformKey);
  const staticData = platformDetails[platformKey] || {};

  const name = sheetData ? sheetData.nombre : staticData.name;
  const description = (sheetData && sheetData.descripcion) ? sheetData.descripcion : staticData.description;
  const priceVal = sheetData ? sheetData.precio_oferta : (staticData.price ? staticData.price.replace("S/", "").replace(".00", "") : "");
  const oldPriceVal = sheetData ? sheetData.precio_tachado : null;
  const note = (sheetData && sheetData.nota) ? sheetData.nota : staticData.note;
  const numericPrice = parseMoney(priceVal);
  const normalizedStock = sheetData ? normalizeStockBadge(sheetData) : { amount: null };
  currentDetailProduct = { id: platformKey, name, price: numericPrice, maxStock: normalizedStock.amount, data: sheetData };
  detailQuantity = 1;

  let featuresArray = sheetData && sheetData.caracteristicas ? String(sheetData.caracteristicas).split(",").map(f => f.trim()).filter(f => f !== "") : (staticData.features || []);
  const originalImgElement = cardElement ? cardElement.querySelector('.brand-logo-card img') : null;

  let brandColor = sheetData && sheetData.color_tema ? sheetData.color_tema : (modalThemes[platformKey]?.color || "#00d4ff");

  detailPanel.style.setProperty("--modal-glow", `color-mix(in srgb, ${brandColor} 25%, transparent)`);
  detailPanel.style.setProperty("--modal-glow-2", `color-mix(in srgb, ${brandColor} 12%, transparent)`);
  detailPanel.style.setProperty("--modal-mark", brandColor);

  const customBgContainer = document.getElementById("detailCustomBg");
  let customBgUrl = "";
  if (sheetData && sheetData.imagen_fondo && sheetData.imagen_fondo.trim() !== "") {
    customBgUrl = sheetData.imagen_fondo.trim();
  } else if (originalImgElement) {
    customBgUrl = originalImgElement.src;
  }

  if (customBgContainer && customBgUrl) {
    customBgContainer.innerHTML = `<img src="${customBgUrl}" alt="Background Custom">`;
  } else if (customBgContainer) {
    customBgContainer.innerHTML = "";
  }

  detailName.textContent = name;
  detailDescription.textContent = description;

  if (detailLogo) {
    detailLogo.src = originalImgElement ? originalImgElement.src : "";
    detailLogo.alt = name || "Producto";
  }
  const durationText = sheetData?.duracion || "Plan mensual";
  const categoryText = sheetData?.categoria || "Streaming";
  if (detailStock) {
    const stockText = normalizedStock.amount === null ? "Disponible" : (normalizedStock.amount === 1 ? "Último 1" : (normalizedStock.amount <= 3 ? `Últimos ${normalizedStock.amount}` : `${normalizedStock.amount} disponibles`));
    detailStock.textContent = stockText;
    detailStock.classList.toggle("unavailable", normalizedStock.amount === 0);
  }
  if (detailDuration) detailDuration.textContent = durationText;
  if (detailCategory) detailCategory.textContent = categoryText;
  if (detailPriceDuration) detailPriceDuration.textContent = durationText;
  if (detailDelivery) detailDelivery.textContent = sheetData?.tiempo_entrega || sheetData?.entrega || "Inmediata";
  if (detailSupport) detailSupport.textContent = sheetData?.garantia || "Garantizado";
  if (detailConditions) detailConditions.textContent = sheetData?.condiciones || "La activación y el acceso dependen de las condiciones indicadas para cada servicio.";

  const parsedOldPrice = parseMoney(oldPriceVal);
  if (detailOldPrice) {
    detailOldPrice.hidden = !(parsedOldPrice > numericPrice);
    detailOldPrice.textContent = parsedOldPrice > numericPrice ? formatCurrency(parsedOldPrice) : "";
  }
  detailPrice.textContent = formatCurrency(numericPrice);
  detailNote.textContent = note || "Garantía y soporte de Morales Streaming durante la vigencia del servicio.";

  updateDetailQuantity();

  detailFeatures.innerHTML = featuresArray.map(item => `<li><i class="fa-solid fa-circle-check" style="color:${brandColor};"></i> ${item}</li>`).join("");

  detailView.classList.add("active");
  detailView.scrollTop = 0;
  detailPanel.scrollTop = 0;
  document.body.style.overflow = "hidden";
  document.body.classList.add("detail-open");
}

function closeDetail() {
  detailView.classList.remove("active");
  document.body.style.overflow = "";
  document.body.classList.remove("detail-open");
}

function prepararTarjetasInteractivas() {
  document.querySelectorAll("#cardsContainer .card:not(.more-platforms-card)").forEach(card => {
    card.setAttribute("role", "button");
    card.setAttribute("tabindex", card.classList.contains("sold-out") ? "-1" : "0");
    card.setAttribute("aria-label", `Ver detalles de ${card.querySelector(".plan-title")?.textContent || "producto"}`);

    const cartButton = card.querySelector(".add-to-cart-btn");
    if (cartButton && !cartButton.querySelector(".cart-button-label")) {
      cartButton.insertAdjacentHTML("beforeend", '<span class="cart-button-label">Agregar al carrito</span>');
      cartButton.setAttribute("aria-label", `Agregar ${card.querySelector(".plan-title")?.textContent || "producto"} al carrito`);
    }
  });
}

// Toda la tarjeta abre sus detalles; los productos agotados quedan desactivados.
document.getElementById("cardsContainer").addEventListener("click", (e) => {
  const card = e.target.closest(".card");
  if (!card || card.classList.contains("more-platforms-card") || card.classList.contains("sold-out")) return;

  const cartButton = e.target.closest(".add-to-cart-btn");
  if (cartButton) {
    e.stopPropagation();
    const name = card.querySelector(".plan-title")?.textContent.trim() || "Producto";
    const priceText = card.querySelector(".current-price-val")?.textContent || "0";
    const price = Number((priceText.match(/\d+(\.\d+)?/) || [0])[0]);
    const product = rawProductosData.find(item => String(item.id) === String(card.dataset.platform));
    const stock = product ? normalizeStockBadge(product).amount : null;
    agregarAlCarrito(name, price, true, card.dataset.platform, stock);
    return;
  }

  openDetail(card.dataset.platform);
});

document.getElementById("cardsContainer").addEventListener("keydown", e => {
  if (e.key !== "Enter" && e.key !== " ") return;
  const card = e.target.closest(".card");
  if (!card || card.classList.contains("more-platforms-card") || card.classList.contains("sold-out")) return;
  e.preventDefault();
  openDetail(card.dataset.platform);
});

function updateDetailQuantity() {
  if (!detailQtyValue) return;
  const max = currentDetailProduct?.maxStock == null ? 99 : Math.max(0, Number(currentDetailProduct.maxStock));
  if (max === 0) detailQuantity = 1;
  else detailQuantity = Math.max(1, Math.min(detailQuantity, max));
  detailQtyValue.textContent = detailQuantity;
  if (detailQtyMinus) detailQtyMinus.disabled = detailQuantity <= 1 || max === 0;
  if (detailQtyPlus) detailQtyPlus.disabled = max === 0 || detailQuantity >= max;
  if (detailAddCart) detailAddCart.disabled = max === 0;
  if (detailBuyNow) detailBuyNow.disabled = max === 0;
}

if (detailQtyMinus) detailQtyMinus.addEventListener("click", () => {
  detailQuantity = Math.max(1, detailQuantity - 1);
  updateDetailQuantity();
});

if (detailQtyPlus) detailQtyPlus.addEventListener("click", () => {
  const max = currentDetailProduct?.maxStock == null ? 99 : Number(currentDetailProduct.maxStock);
  detailQuantity = Math.min(max || 1, detailQuantity + 1);
  updateDetailQuantity();
});

function addCurrentDetailQuantity(openCartAfter = false) {
  if (!currentDetailProduct) return;
  for (let i = 0; i < detailQuantity; i++) {
    agregarAlCarrito(currentDetailProduct.name, currentDetailProduct.price, false, currentDetailProduct.id, currentDetailProduct.maxStock);
  }
  if (openCartAfter) abrirCarrito();
}

if (detailAddCart) {
  detailAddCart.addEventListener("click", () => addCurrentDetailQuantity(false));
}

if (detailBuyNow) {
  detailBuyNow.addEventListener("click", () => {
    addCurrentDetailQuantity(false);
    closeDetail();
    if (typeof openCheckoutModal === "function") openCheckoutModal();
    else abrirCarrito();
  });
}

detailClose.addEventListener("click", closeDetail);
detailView.addEventListener("click", e => { if (e.target === detailView) closeDetail(); });
