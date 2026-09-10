/* Extracted conservatively from the original main.js. */
const SHEET_API_URL = "https://script.google.com/macros/s/AKfycbwAQ0A4yEQtve0BlVAF7GK-FErxOCa3hb4ZhEajlfJ5y6YrMCktVVc4CUDb7AxMpMXfdA/exec";
const CATALOG_CACHE_KEY = "morales_streaming_cache_v2";
const CATALOG_CACHE_TTL = 5 * 60 * 1000;

try {
  const currentPageUrl = new URL(window.location.href);
  if (currentPageUrl.searchParams.get("sync") === "1") {
    document.documentElement.classList.add("skip-welcome");
    currentPageUrl.searchParams.delete("sync");
    window.history.replaceState(null, "", currentPageUrl.toString());
  }
} catch (error) {
  console.warn("No se pudo aplicar la recarga rápida:", error);
}

let siteConfig = {
  whatsapp_numero: "51935111590",
  whatsapp_general: "Hola Morales Streaming, deseo más información."
};
let availableCoupons = [];
let appliedCoupon = null;
let flashOfferEnabled = false;
let flashOffer2Enabled = false;
let flashOfferTimer = null;

function isSettingEnabled(value, fallback = true) {
  if (value === undefined || value === null || String(value).trim() === "") return fallback;
  return ["activo", "activa", "si", "sí", "true", "1", "mostrar"].includes(String(value).trim().toLowerCase());
}

function scheduleFlashOffer(delaySeconds = 35) {
  clearTimeout(flashOfferTimer);
  const flashCard = document.getElementById("flashOffer");
  if (!flashCard || !flashOfferEnabled) return;

  const safeDelay = Math.max(0, Number(delaySeconds) || 0) * 1000;
  flashOfferTimer = setTimeout(() => {
    if (flashOfferEnabled) flashCard.style.setProperty("display", "block", "important");
  }, safeDelay);
}

function getWhatsappNumber() {
  return String(siteConfig.whatsapp_numero || "51935111590").replace(/\D/g, "");
}

function createWhatsappLink(message) {
  return `https://api.whatsapp.com/send?phone=${getWhatsappNumber()}&text=${encodeURIComponent(message)}`;
}

function parseMoney(value) {
  const normalized = String(value ?? "").replace(",", ".").replace(/[^0-9.-]/g, "");
  const amount = Number(normalized);
  return Number.isFinite(amount) ? Math.max(0, amount) : 0;
}

function formatCurrency(value) {
  return `S/${parseMoney(value).toFixed(2)}`;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function updateWhatsappNumbers() {
  document.querySelectorAll('a[href*="api.whatsapp.com/send"]').forEach(link => {
    try {
      const url = new URL(link.href);
      url.searchParams.set("phone", getWhatsappNumber());
      link.href = url.toString();
    } catch (error) {
      console.warn("No se pudo actualizar un enlace de WhatsApp:", error);
    }
  });
}

