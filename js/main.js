/* Extracted conservatively from the original main.js. */

// Selector de tema con preferencia persistente.
document.addEventListener('DOMContentLoaded', () => {
  const themeToggles = [...document.querySelectorAll('#theme-toggle, [data-theme-toggle]')];
  if (!themeToggles.length) return;

  const root = document.documentElement;

  const updateThemeControl = () => {
    const isLight = root.classList.contains('light-mode');
    themeToggles.forEach(themeToggle => {
      const icon = themeToggle.querySelector('i');
      const label = themeToggle.querySelector('.theme-toggle-label');
      themeToggle.setAttribute('aria-label', isLight ? 'Activar modo oscuro' : 'Activar modo claro');
      themeToggle.setAttribute('title', isLight ? 'Activar modo oscuro' : 'Activar modo claro');
      if (label) label.textContent = isLight ? 'Oscuro' : 'Claro';
      const mobileText = themeToggle.querySelector('strong');
      if (mobileText) mobileText.textContent = isLight ? 'Modo oscuro' : 'Modo claro';
      if (icon) icon.className = isLight ? 'fa-solid fa-moon' : 'fa-solid fa-sun';
    });
  };

  updateThemeControl();
  themeToggles.forEach(themeToggle => themeToggle.addEventListener('click', () => {
    const isLight = root.classList.toggle('light-mode');
    try { localStorage.setItem('morales-theme', isLight ? 'light' : 'dark'); } catch (error) {}
    updateThemeControl();
    // En celular el selector vive dentro del menú "Más": al elegir un tema,
    // se cierra para dejar visible el catálogo actualizado.
    if (window.innerWidth <= 650 && themeToggle.matches('[data-theme-toggle]')) {
      const menu = document.getElementById('moreMenu');
      const mobileMoreBtn = document.getElementById('mobileMoreBtn');
      menu?.classList.remove('active');
      menu?.setAttribute('aria-hidden', 'true');
      mobileMoreBtn?.setAttribute('aria-expanded', 'false');
    }
  }));
});

// Actualización breve de catálogo desde el logo o el nombre de la marca.
document.addEventListener('DOMContentLoaded', () => {
  const progress = document.getElementById('siteRefreshProgress');
  document.querySelectorAll('.logo-link, .brand-refresh-link').forEach(link => {
    link.addEventListener('click', event => {
      event.preventDefault();
      if (progress) progress.classList.add('is-loading');
      window.setTimeout(() => { window.location.href = link.href; }, 260);
    });
  });
});

// ======================================================
// BUSCADOR EXPANDIBLE EN CELULAR
// ======================================================
document.addEventListener('DOMContentLoaded', () => {
  const topBar = document.querySelector('.top-bar');
  const mobileSearchBtn = document.getElementById('mobileSearchBtn');
  const searchInputMobile = document.getElementById('searchInput');
  const clearSearchBtnMobile = document.getElementById('clearSearchBtn');

  if (!topBar || !mobileSearchBtn || !searchInputMobile) return;

  mobileSearchBtn.addEventListener('click', () => {
    topBar.classList.add('search-open');
    setTimeout(() => searchInputMobile.focus(), 220);
  });

  if (clearSearchBtnMobile) {
    clearSearchBtnMobile.addEventListener('click', (e) => {
      if (window.innerWidth > 650) return;
      e.preventDefault();
      e.stopPropagation();

      if (searchInputMobile.value.trim() !== '') {
        searchInputMobile.value = '';
        searchInputMobile.dispatchEvent(new Event('input', { bubbles: true }));
        searchInputMobile.focus();
        return;
      }

      topBar.classList.remove('search-open');
      searchInputMobile.blur();
    });
    document.addEventListener('click', (e) => {
  if (window.innerWidth > 650) return;

  const searchBox = document.getElementById('searchBox');
  const buscadorAbierto = topBar.classList.contains('search-open');

  if (!buscadorAbierto) return;

  const clickDentroBuscador = searchBox && searchBox.contains(e.target);
  const clickEnLupa = mobileSearchBtn && mobileSearchBtn.contains(e.target);

  if (clickDentroBuscador || clickEnLupa) return;

  // Si está vacío, tocar fuera lo cierra
  if (searchInputMobile.value.trim() === '') {
    topBar.classList.remove('search-open');
    searchInputMobile.blur();
  }
});
  }

  searchInputMobile.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && window.innerWidth <= 650) {
      searchInputMobile.value = '';
      searchInputMobile.dispatchEvent(new Event('input', { bubbles: true }));
      topBar.classList.remove('search-open');
      searchInputMobile.blur();
    }
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 650) topBar.classList.remove('search-open');
  });
});
// ======================================================
// TOAST DE ACTIVIDAD — NÚMERO VARIABLE
// ======================================================
document.addEventListener('DOMContentLoaded', () => {
  const toast = document.getElementById('liveViewersToast');
  const text = document.getElementById('liveViewersText');

  if (!toast || !text) return;

  let ultimoNumero = null;
  let hideTimer = null;
  let nextTimer = null;

  function numeroAleatorio() {
    // Rango visual/promocional: 6 a 18
    let numero;
    do {
      numero = Math.floor(Math.random() * 13) + 6;
    } while (numero === ultimoNumero);

    ultimoNumero = numero;
    return numero;
  }

  function mostrarLiveViewers() {
    const numero = numeroAleatorio();

    text.textContent = `${numero} personas viendo ahora`;
    toast.classList.add('show');

    clearTimeout(hideTimer);
    hideTimer = setTimeout(() => {
      toast.classList.remove('show');

      // La próxima aparición varía entre 14 y 24 segundos.
      const espera = Math.floor(Math.random() * 10000) + 14000;
      clearTimeout(nextTimer);
      nextTimer = setTimeout(mostrarLiveViewers, espera);
    }, 7000);
  }

  // Primera aparición, sin molestar apenas abre la página.
  setTimeout(mostrarLiveViewers, 6500);
});


// Menú "Más": información secundaria fuera del cuerpo principal.
document.addEventListener('DOMContentLoaded', () => {
  const menu = document.getElementById('moreMenu');
  const mobileBtn = document.getElementById('mobileMoreBtn');
  const desktopBtn = document.getElementById('desktopMoreBtn');
  const modal = document.getElementById('infoHubModal');
  const content = document.getElementById('infoHubContent');
  const close = document.getElementById('infoHubClose');
  const panels = {
    referrals: `<span class="info-hub-eyebrow">🎁 PROGRAMA DE REFERIDOS</span><h2 id="infoHubTitle">Refiere y gana descuentos</h2><p>Recomienda Morales Streaming a tus amigos y obtén beneficios para una próxima compra o renovación.</p><div class="referral-steps"><article><span>1</span><div><strong>Comparte la tienda</strong><small>Invita a un amigo a conocer nuestros servicios y planes disponibles.</small></div></article><article><span>2</span><div><strong>Que indique tu nombre</strong><small>Tu referido debe mencionarte al momento de realizar su pedido por WhatsApp.</small></div></article><article><span>3</span><div><strong>Recibe tu beneficio</strong><small>Cuando su servicio sea confirmado, registraremos el beneficio correspondiente a tu favor.</small></div></article></div><p class="referral-note"><i class="fa-solid fa-circle-info"></i><span>El beneficio y las condiciones vigentes se confirman por WhatsApp antes de aplicarse. No es acumulable automáticamente.</span></p><a class="info-hub-primary" target="_blank" rel="noopener" href="https://api.whatsapp.com/send?phone=51935111590&text=Hola%20quiero%20información%20sobre%20el%20programa%20de%20referidos"><i class="fa-brands fa-whatsapp"></i> Consultar y participar</a>`,
    howto: `<span class="info-hub-eyebrow">🛡️ COMPRA CON INFORMACIÓN CLARA</span><h2 id="infoHubTitle">Antes de realizar tu pedido</h2><p>Así funciona la activación, renovación y atención.</p><div class="info-hub-grid"><article><i class="fa-solid fa-clock"></i><div><strong>Duración informada</strong><small>La vigencia y modalidad se muestran en cada producto.</small></div></article><article><i class="fa-solid fa-comment-dots"></i><div><strong>Confirma disponibilidad</strong><small>Antes de pagar, confirma por WhatsApp que el servicio continúa disponible.</small></div></article><article><i class="fa-solid fa-shield-halved"></i><div><strong>Soporte durante la vigencia</strong><small>Si tienes un inconveniente, escríbenos para revisar tu caso.</small></div></article><article><i class="fa-solid fa-arrows-rotate"></i><div><strong>Renovación opcional</strong><small>No es automática: tú decides si deseas continuar.</small></div></article></div>`,
    faq: `<span class="info-hub-eyebrow">❓ RESOLVEMOS TUS DUDAS</span><h2 id="infoHubTitle">Preguntas frecuentes</h2><div class="info-hub-faq"><details><summary>¿Cómo es el proceso de entrega?</summary><p>Una vez confirmado el pago, los accesos y las indicaciones se coordinan directamente por WhatsApp.</p></details><details><summary>¿Los servicios tienen soporte?</summary><p>Sí. Durante la vigencia puedes escribirnos si tienes algún inconveniente con el acceso.</p></details><details><summary>¿Puedo renovar el siguiente mes?</summary><p>Sí. La renovación es opcional y se coordina contigo.</p></details></div>`
  };
  const legalPanels = {
    terms: `<span class="info-hub-eyebrow">INFORMACIÓN LEGAL</span><h2 id="infoHubTitle">Términos y condiciones</h2><div class="info-hub-faq"><details open><summary>Uso de la tienda</summary><p>Los precios, disponibilidad, duración y modalidad se muestran antes de confirmar el pedido. La compra se coordina por los canales oficiales de Morales Streaming.</p></details><details><summary>Activación y entrega</summary><p>La activación se realiza después de confirmar disponibilidad y validar el pago. Los tiempos pueden variar según el servicio elegido.</p></details><details><summary>Uso de accesos</summary><p>El cliente debe respetar las condiciones indicadas para cada producto y evitar cambios no autorizados.</p></details></div>`,
    warranty: `<span class="info-hub-eyebrow">SOPORTE DURANTE TU PLAN</span><h2 id="infoHubTitle">Garantía y soporte</h2><div class="info-hub-faq"><details open><summary>Cobertura</summary><p>El soporte aplica durante la vigencia informada del servicio, según las condiciones entregadas al comprar.</p></details><details><summary>Cómo solicitar ayuda</summary><p>Escríbenos por WhatsApp indicando el servicio adquirido y el inconveniente para revisar tu caso.</p></details><details><summary>Limitaciones</summary><p>La garantía puede no aplicar cuando el acceso ha sido modificado, compartido o utilizado fuera de las condiciones comunicadas.</p></details></div>`,
    privacy: `<span class="info-hub-eyebrow">TU INFORMACIÓN</span><h2 id="infoHubTitle">Privacidad</h2><div class="info-hub-faq"><details open><summary>Datos necesarios</summary><p>Solo solicitamos la información necesaria para coordinar tu pedido, confirmar el pago y brindarte soporte.</p></details><details><summary>Canales oficiales</summary><p>Evita compartir contraseñas o información sensible. Coordina únicamente mediante los canales oficiales mostrados en esta tienda.</p></details></div>`,
    contact: `<span class="info-hub-eyebrow">ATENCIÓN DIRECTA</span><h2 id="infoHubTitle">Contacto</h2><p>Consulta disponibilidad, pagos, activaciones o soporte directamente con Morales Streaming.</p><a class="info-hub-primary" target="_blank" rel="noopener" href="https://api.whatsapp.com/send?phone=51935111590&text=Hola%20Morales%20Streaming%2C%20tengo%20una%20consulta"><i class="fa-brands fa-whatsapp"></i> Escribir por WhatsApp</a>`
  };
  const setMenu = open => { if(!menu) return; menu.classList.toggle('active',open); menu.setAttribute('aria-hidden',String(!open)); mobileBtn?.setAttribute('aria-expanded',String(open)); desktopBtn?.setAttribute('aria-expanded',String(open)); };
  const toggle = e => { e?.stopPropagation(); setMenu(!menu?.classList.contains('active')); };
  mobileBtn?.addEventListener('click',toggle); desktopBtn?.addEventListener('click',toggle);
  document.addEventListener('click',e=>{ const btn=e.target.closest('[data-info-panel]'); if(!btn) return; const html=panels[btn.dataset.infoPanel]; if(!html) return; content.innerHTML=html; modal.classList.add('active'); modal.setAttribute('aria-hidden','false'); document.body.style.overflow='hidden'; setMenu(false); });
  document.querySelectorAll('[data-legal-panel]').forEach(link => link.addEventListener('click', event => {
    event.preventDefault();
    const html = legalPanels[link.dataset.legalPanel];
    if (!html || !content || !modal) return;
    content.innerHTML = html;
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }));
  document.addEventListener('click',e=>{ if(menu?.classList.contains('active') && !menu.contains(e.target) && !mobileBtn?.contains(e.target) && !desktopBtn?.contains(e.target)) setMenu(false); });
  const closeModal=()=>{ modal?.classList.remove('active'); modal?.setAttribute('aria-hidden','true'); document.body.style.overflow=''; };
  close?.addEventListener('click',closeModal); modal?.addEventListener('click',e=>{if(e.target===modal) closeModal();});
});
