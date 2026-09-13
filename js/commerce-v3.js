/* V3 commerce flow: integrated checkout + combo builder. */
let checkoutV3Method = "yape";

function renderCheckoutSummary() {
  const itemsRoot = document.getElementById('checkoutItems');
  if (!itemsRoot) return;
  const totals = calcularTotalesCarrito();
  itemsRoot.innerHTML = carrito.map(item => `
    <div class="checkout-item">
      <div><strong>${escapeHtml(item.name)}</strong><small>${item.quantity} × ${formatCurrency(item.price)}</small></div>
      <span class="checkout-item-price">${formatCurrency(item.price * item.quantity)}</span>
    </div>`).join('');

  document.getElementById('checkoutSubtotal').textContent = formatCurrency(totals.rawTotal);
  document.getElementById('checkoutAutomatic').textContent = `- ${formatCurrency(totals.automaticDiscount)}`;
  document.getElementById('checkoutCoupon').textContent = `- ${formatCurrency(totals.couponDiscount)}`;
  document.getElementById('checkoutTotal').textContent = formatCurrency(totals.finalTotal);
  document.getElementById('checkoutPaymentTotal').textContent = formatCurrency(totals.finalTotal);
  document.getElementById('checkoutAutomaticRow').style.display = totals.automaticDiscount > 0 ? 'flex' : 'none';
  document.getElementById('checkoutCouponRow').style.display = totals.couponDiscount > 0 ? 'flex' : 'none';
  updateCheckoutV3Payment();
}

function checkoutV3Message() {
  const totals = calcularTotalesCarrito();
  const labels = {yape:'Yape',plin:'Plin',transferencia:'Transferencia bancaria'};
  const lines = carrito.map(item => `• ${item.name} x${item.quantity} — ${formatCurrency(item.price * item.quantity)}`).join('\n');
  const discount = totals.automaticDiscount + totals.couponDiscount;
  const discountLine = discount > 0 ? `\nAhorro aplicado: -${formatCurrency(discount)}` : '';
  const couponLine = appliedCoupon && totals.couponDiscount > 0 ? `\nCupón: ${appliedCoupon.codigo || appliedCoupon.cupon}` : '';
  return `Hola Morales Streaming, quiero confirmar disponibilidad y continuar con este pedido por ${labels[checkoutV3Method] || 'Yape'}:\n\n${lines}${discountLine}${couponLine}\n\nTotal: ${formatCurrency(totals.finalTotal)}`;
}

function updateCheckoutV3Payment() {
  const qr = document.getElementById('checkoutPaymentQr');
  const account = document.getElementById('checkoutPaymentAccount');
  const label = document.getElementById('checkoutPaymentLabel');
  const copy = document.getElementById('checkoutCopyPayment');
  const transfer = document.getElementById('checkoutTransferText');
  const main = document.querySelector('.checkout-payment-main-v3');
  const link = document.getElementById('checkoutConfirmWhatsapp');
  const confirmed = document.getElementById('checkoutConfirmAvailability')?.checked;
  if (!qr || !account || !label || !copy || !transfer || !main || !link) return;

  if (checkoutV3Method === 'transferencia') {
    main.hidden = true; transfer.hidden = false;
  } else {
    main.hidden = false; transfer.hidden = true;
    qr.src = checkoutV3Method === 'plin' ? 'assets/payments/plin-qr.jpg' : 'assets/payments/yape-qr.jpg';
    qr.alt = checkoutV3Method === 'plin' ? 'QR de Plin' : 'QR de Yape';
    qr.setAttribute('aria-label', `Ampliar ${qr.alt}`);
    label.textContent = checkoutV3Method === 'plin' ? 'Número Plin' : 'Número Yape';
    const phone = getWhatsappNumber().replace(/^51/, '');
    account.textContent = phone.replace(/(\d{3})(\d{3})(\d{3})/, '$1 $2 $3');
  }
  link.href = confirmed ? createWhatsappLink(checkoutV3Message()) : '#';
  link.classList.toggle('disabled', !confirmed);
  link.setAttribute('aria-disabled', String(!confirmed));
}

function openCheckoutQr() {
  const qr = document.getElementById('checkoutPaymentQr');
  if (!qr || checkoutV3Method === 'transferencia') return;
  if (typeof openQrZoom === 'function') openQrZoom(qr.src, qr.alt);
}

function openCheckoutModal() {
  const modal = document.getElementById('checkoutModal');
  if (!modal || carrito.length === 0) return;
  checkoutV3Method = 'yape';
  document.querySelectorAll('.checkout-pay-choice-v3').forEach(btn => btn.classList.toggle('active', btn.dataset.checkoutPayment === 'yape'));
  const confirm = document.getElementById('checkoutConfirmAvailability');
  if (confirm) confirm.checked = false;
  renderCheckoutSummary();
  modal.classList.add('active');
  modal.setAttribute('aria-hidden','false');
  document.body.style.overflow='hidden';
}

function closeCheckoutModal() {
  const modal = document.getElementById('checkoutModal');
  if (!modal) return;
  modal.classList.remove('active');
  modal.setAttribute('aria-hidden','true');
  document.body.style.overflow='';
}

function generarComboItems() {
  const root = document.getElementById('comboOptions');
  if (!root) return;
  root.innerHTML = '';
  cards.forEach(card => {
    if (card.classList.contains('more-platforms-card') || card.classList.contains('sold-out')) return;
    const title = card.querySelector('.plan-title');
    const priceEl = card.querySelector('.current-price-val') || card.querySelector('.price-tag');
    const img = card.querySelector('.brand-logo-card img');
    if (!title || !priceEl || !img) return;
    const price = parseMoney(priceEl.textContent);
    if (!price) return;
    const platform = card.dataset.platform || title.textContent.trim().toLowerCase().replace(/\s+/g,'-');
    const duration = card.querySelector('.plan-duration')?.textContent.trim() || card.dataset.category || 'Servicio';
    const selected = selectedComboPlatforms.some(item => String(item.platform || item.name) === String(platform) || item.name === title.textContent.trim());
    root.insertAdjacentHTML('beforeend', `<label class="combo-option-v3${selected ? ' selected' : ''}" data-name="${escapeHtml(title.textContent.trim())}" data-price="${price}" data-platform="${escapeHtml(platform)}">
      <input type="checkbox" ${selected ? 'checked' : ''} tabindex="-1">
      <img src="${img.src}" alt="${escapeHtml(title.textContent.trim())}" loading="lazy">
      <span><strong>${escapeHtml(title.textContent.trim())}</strong><small><b class="combo-option-price">${formatCurrency(price)}</b><span class="combo-option-duration"> · ${escapeHtml(duration)}</span></small></span>
    </label>`);
  });
  updateComboSummary();
}

function toggleComboItem(element) {
  const name = element.dataset.name;
  const price = parseMoney(element.dataset.price);
  const platform = element.dataset.platform;
  const idx = selectedComboPlatforms.findIndex(item => String(item.platform || item.name) === String(platform) || item.name === name);
  if (idx >= 0) selectedComboPlatforms.splice(idx,1);
  else selectedComboPlatforms.push({name, price, platform});
  element.classList.toggle('selected', idx < 0);
  const check = element.querySelector('input'); if (check) check.checked = idx < 0;
  updateComboSummary();
}

function updateComboSummary() {
  const summary = document.getElementById('comboSummaryV3');
  const hint = document.getElementById('comboHintV3');
  const buy = document.getElementById('buyComboV3');
  if (!summary || !hint || !buy) return;
  const count = selectedComboPlatforms.length;
  const raw = selectedComboPlatforms.reduce((sum,item)=>sum+parseMoney(item.price),0);
  const discount = count === 2 ? 3 : count === 3 ? 6 : count === 4 ? 9 : count >= 5 ? 12 : 0;
  const total = Math.max(0,raw-discount);
  summary.hidden = count === 0;
  summary.innerHTML = count ? `<div class="combo-summary-lines"><span>${count} servicios</span><span>Subtotal <b>${formatCurrency(raw)}</b></span>${discount ? `<span class="combo-summary-saving">Ahorro <b>-${formatCurrency(discount)}</b></span>` : ''}</div><strong class="combo-summary-total">${formatCurrency(total)}</strong>` : '';
  hint.textContent = count < 2 ? 'Selecciona 2 o más servicios para calcular tu precio.' : 'Tu combo está listo. Puedes revisarlo en el checkout antes de confirmar.';
  buy.disabled = count < 2;
}

function openCustomComboModal() {
  const modal = document.getElementById('customComboModal');
  if (!modal) return;
  modal.classList.add('active');
  modal.setAttribute('aria-hidden','false');
  document.body.style.overflow='hidden';
  generarComboItems();
}
function closeCustomComboModal() {
  const modal = document.getElementById('customComboModal');
  if (!modal) return;
  modal.classList.remove('active');
  modal.setAttribute('aria-hidden','true');
  document.body.style.overflow='';
}

async function addSelectedComboToCart() {
  if (selectedComboPlatforms.length < 2) return;
  if (carrito.length && !cartHasType('combo')) {
    const ok = await showSiteConfirm('Usar solo el combo', 'Tienes productos individuales en tu carrito. Para continuar, esos productos se reemplazarán por el combo seleccionado.', 'Usar este combo');
    if (!ok) return;
    clearCartForMode();
  } else if (cartHasType('combo')) {
    const ok = await showSiteConfirm('Reemplazar combo', 'Ya tienes un combo en tu carrito. ¿Deseas sustituirlo por esta nueva selección?', 'Reemplazar combo');
    if (!ok) return;
    clearCartForMode();
  }
  const raw = selectedComboPlatforms.reduce((sum,item)=>sum+parseMoney(item.price),0);
  const count = selectedComboPlatforms.length;
  const discount = count === 2 ? 3 : count === 3 ? 6 : count === 4 ? 9 : count >= 5 ? 12 : 0;
  const total = Math.max(0, raw - discount);
  const names = selectedComboPlatforms.map(item => item.name);
  agregarAlCarrito(`Combo personalizado (${count} servicios)`, total, false, `combo-${Date.now()}`, 1, 'combo', names);
  selectedComboPlatforms = [];
  closeCustomComboModal();
  openCheckoutModal();
}

document.addEventListener('DOMContentLoaded', () => {
  const checkoutQr = document.getElementById('checkoutPaymentQr');
  if (checkoutQr) {
    checkoutQr.addEventListener('click', openCheckoutQr);
    checkoutQr.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        openCheckoutQr();
      }
    });
  }
  document.getElementById('checkoutPaymentMethods')?.addEventListener('click', e => {
    const btn = e.target.closest('[data-checkout-payment]'); if (!btn) return;
    checkoutV3Method = btn.dataset.checkoutPayment;
    document.querySelectorAll('.checkout-pay-choice-v3').forEach(x => x.classList.toggle('active', x === btn));
    updateCheckoutV3Payment();
  });
  document.getElementById('checkoutConfirmAvailability')?.addEventListener('change', updateCheckoutV3Payment);
  document.getElementById('checkoutCopyPayment')?.addEventListener('click', () => {
    const phone = getWhatsappNumber().replace(/^51/,'');
    navigator.clipboard?.writeText(phone);
    mostrarToast('Número copiado');
  });
  document.getElementById('checkoutConfirmWhatsapp')?.addEventListener('click', e => {
    if (!document.getElementById('checkoutConfirmAvailability')?.checked) e.preventDefault();
  });
  document.getElementById('comboOptions')?.addEventListener('click', e => {
    const option = e.target.closest('.combo-option-v3'); if (!option) return;
    e.preventDefault(); toggleComboItem(option);
  });
  document.getElementById('buyComboV3')?.addEventListener('click', addSelectedComboToCart);
});
