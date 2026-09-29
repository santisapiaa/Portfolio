// Vercel Analytics custom events (window.va is queued in the page head until the script loads)
function track(name, data) {
  window.va?.('event', { name, data });
}

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const scrollBehavior = () => (reduceMotion ? 'auto' : 'smooth');

// WhatsApp and case-study clicks, tagged with where on the page they happened
document.addEventListener('click', e => {
  const a = e.target.closest('a[href]');
  if (!a) return;
  if (a.dataset.wa) {
    track('WhatsApp Click', { location: a.dataset.wa });
    return;
  }
  const card = a.closest('.case-card');
  if (card) track('Case Click', { project: card.querySelector('h3').textContent.trim() });
});

// Footer year
document.getElementById('year').textContent = new Date().getFullYear();

initScrollReveal();
initNavbar();
initMobileMenu();
initHeroScrollProgress();
initHeroRotator();

// Scroll-reveal
function initScrollReveal() {
  if (reduceMotion || !('IntersectionObserver' in window)) return;
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.reveal').forEach(el => {
    el.classList.add('reveal-init');
    observer.observe(el);
  });
}

function initNavbar() {
  // Transparent at the top, floating pill once the page scrolls
  const navbar = document.getElementById('navbar');
  new IntersectionObserver(([entry]) => {
    navbar.classList.toggle('is-scrolled', !entry.isIntersecting);
  }).observe(document.getElementById('navSentinel'));

  // Highlight the menu link of the section on screen (only the ones that are in the menu)
  const navLinks = [...document.querySelectorAll('.svc-nav .nav-links a, .m-link')];
  const menuIds = new Set(navLinks.map(a => a.hash.slice(1)));
  function setCurrent(id) {
    navLinks.forEach(a => {
      if (a.hash === `#${id}`) a.setAttribute('aria-current', 'true');
      else a.removeAttribute('aria-current');
    });
  }
  const sectionObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) setCurrent(menuIds.has(entry.target.id) ? entry.target.id : null);
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  document.querySelectorAll('main > [id]').forEach(el => sectionObserver.observe(el));
}

// Mobile menu: full-screen panel
function initMobileMenu() {
  const DESKTOP_QUERY = '(min-width: 861px)';
  const FOCUS_DELAY_MS = 50;
  const menuBtn = document.getElementById('menuBtn');
  const mobileMenu = document.getElementById('mobileMenu');

  function setMenu(open, returnFocus) {
    mobileMenu.classList.toggle('is-open', open);
    mobileMenu.inert = !open;
    document.body.classList.toggle('menu-open', open);
    menuBtn.setAttribute('aria-expanded', open);
    menuBtn.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    if (open) setTimeout(() => mobileMenu.querySelector('a').focus({ preventScroll: true }), FOCUS_DELAY_MS);
    else if (returnFocus) menuBtn.focus();
  }
  const menuIsOpen = () => mobileMenu.classList.contains('is-open');

  // Keep keyboard focus inside the open menu (the close button plus the panel links)
  function trapFocus(e) {
    const items = [menuBtn, ...mobileMenu.querySelectorAll('a')];
    const i = items.indexOf(document.activeElement);
    const last = items.length - 1;
    const next = e.shiftKey ? (i <= 0 ? last : i - 1) : (i === last ? 0 : i + 1);
    e.preventDefault();
    items[next].focus();
  }

  menuBtn.addEventListener('click', () => setMenu(!menuIsOpen(), true));
  mobileMenu.addEventListener('click', e => { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', e => {
    if (!menuIsOpen()) return;
    if (e.key === 'Escape') setMenu(false, true);
    if (e.key === 'Tab') trapFocus(e);
  });
  window.matchMedia(DESKTOP_QUERY).addEventListener('change', e => { if (e.matches && menuIsOpen()) setMenu(false); });
}

// Hero: as the page scrolls, the text fades and the agenda card rises faster (CSS reads --hp, desktop only)
function initHeroScrollProgress() {
  const hero = document.getElementById('inicio');
  if (!hero || reduceMotion) return;
  let ticking = false;
  const update = () => {
    ticking = false;
    const progress = Math.min(1, Math.max(0, window.scrollY / hero.offsetHeight));
    hero.style.setProperty('--hp', progress.toFixed(3));
  };
  window.addEventListener('scroll', () => {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }, { passive: true });
  update();
}

// Hero title: the last words rotate (static for people who prefer reduced motion)
function initHeroRotator() {
  const ROTATE_EVERY_MS = 2600;
  const LEAVE_ANIMATION_MS = 450;
  const rotator = document.getElementById('heroRotator');
  if (!rotator || reduceMotion) return;
  const words = [...rotator.children];
  let current = 0;
  setInterval(() => {
    const prev = words[current];
    current = (current + 1) % words.length;
    prev.classList.replace('is-active', 'is-leaving');
    words[current].classList.add('is-active');
    setTimeout(() => prev.classList.remove('is-leaving'), LEAVE_ANIMATION_MS);
  }, ROTATE_EVERY_MS);
}

// Booking: free slots from Google Calendar (via /api), shown in the hero and in the #agendar section
const WA_LINK = 'https://wa.me/5491166429749?text=Hola%20Santiago%2C%20vi%20tu%20p%C3%A1gina%20y%20quiero%20consultar%20por%20una%20web%20para%20mi%20negocio';
const AVAILABILITY_URL = '/api/disponibilidad';
const BOOKING_URL = '/api/agendar';
const HERO_MAX_DAYS = 3;
const HERO_MAX_SLOTS_PER_DAY = 4;
const AFTERNOON_START = '13:00';

// Dates come as YYYY-MM-DD; format them at noon UTC so the day never shifts
const asDate = d => new Date(`${d}T12:00:00Z`);
const fmtDate = opts => new Intl.DateTimeFormat('es-AR', { ...opts, timeZone: 'UTC' });
const shortDate = (d, opts) => fmtDate(opts).format(asDate(d)).replace('.', '');
const capitalize = s => s[0].toUpperCase() + s.slice(1);
const longDate = d => capitalize(fmtDate({ weekday: 'long', day: 'numeric', month: 'long' }).format(asDate(d)).replace(',', ''));

const HTML_ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
function escapeHtml(s) {
  return s.replace(/[&<>"']/g, c => HTML_ESCAPES[c]);
}

const waLink = (label, location) => `<a href="${WA_LINK}" target="_blank" rel="noopener" data-wa="${location}">${label}</a>`;

// One request shared by the hero and the booking section; `fresh` skips it after a conflict
let daysRequest = null;
function getDays(fresh) {
  if (!daysRequest || fresh) {
    daysRequest = fetch(AVAILABILITY_URL, fresh ? { cache: 'no-store' } : undefined)
      .then(res => { if (!res.ok) throw new Error(res.status); return res.json(); })
      .then(body => body.days);
    daysRequest.catch(() => { daysRequest = null; });
  }
  return daysRequest;
}

const bookingRoot = document.getElementById('booking');
const booking = bookingRoot && initBooking(bookingRoot);
initHeroAgenda();

function initHeroAgenda() {
  const box = document.getElementById('heroDays');
  if (!box) return;
  const cta = document.getElementById('heroCta');

  const renderDay = d => `
      <div class="demo-pro">
        <span class="demo-name">${longDate(d.date)}</span>
        <div class="demo-slots">${d.slots.slice(0, HERO_MAX_SLOTS_PER_DAY).map(t =>
          `<button type="button" data-date="${d.date}" data-time="${t}" aria-label="${longDate(d.date)}, ${t} hs">${t}</button>`).join('')}</div>
      </div>`;

  // Without slots the card offers WhatsApp instead
  function showWhatsAppFallback() {
    document.getElementById('heroTitle').textContent = 'Coordinemos una charla';
    box.innerHTML = '<p class="demo-text">Escribime y buscamos un horario que te quede cómodo.</p>';
    cta.href = WA_LINK;
    cta.target = '_blank';
    cta.rel = 'noopener';
    cta.dataset.wa = 'hero-agenda';
    cta.innerHTML = '<svg aria-hidden="true" viewBox="0 0 24 24"><use href="#wa-icon"/></svg>Escribime por WhatsApp';
  }

  getDays().then(days => {
    if (!days.length) throw new Error('empty');
    box.innerHTML = days.slice(0, HERO_MAX_DAYS).map(renderDay).join('');
  }).catch(showWhatsAppFallback);

  box.addEventListener('click', e => {
    const b = e.target.closest('button[data-time]');
    if (!b || !booking) return;
    track('Hero Slot Click', { date: b.dataset.date });
    booking.pick(b.dataset.date, b.dataset.time);
  });
}

function initBooking(root) {
  const LOAD_AHEAD_MARGIN = '600px 0px';
  const NAME_FOCUS_DELAY_MS = 500;
  const FIELD_ERRORS = {
    nombre: 'Completá tu nombre.',
    apellido: 'Completá tu apellido.',
    email: 'Revisá el email, parece que no es válido.',
    telefono: 'Revisá el teléfono (con código de área, por ejemplo 11 1234-5678).',
    negocio: 'El nombre del negocio es demasiado largo.'
  };

  const $ = id => document.getElementById(id);
  const pickEl = $('bkPick'), daysEl = $('bkDays'), slotsEl = $('bkSlots'), form = $('bkForm'), statusEl = $('bkStatus');
  let days = [], selDate = null, selTime = null, loaded = null;

  function setStatus(html, isError) {
    statusEl.innerHTML = html;
    statusEl.classList.toggle('error', Boolean(isError));
  }

  function fallback(msg) {
    setStatus(`${msg} Podés <a href="${root.dataset.fallback}" target="_blank" rel="noopener">agendar desde mi calendario de Google</a> o ${waLink('escribirme por WhatsApp', 'agenda')}.`, true);
  }

  function showUnavailable(msg) {
    pickEl.hidden = true;
    fallback(msg);
  }

  async function load(fresh) {
    try {
      days = await getDays(fresh);
    } catch {
      showUnavailable('No pude cargar los horarios en este momento.');
      return;
    }
    if (!days.length) {
      showUnavailable('No me quedan horarios libres en los próximos días.');
      return;
    }
    setStatus('');
    pickEl.hidden = false;
    renderDays();
    selectDate(days.some(d => d.date === selDate) ? selDate : days[0].date);
  }

  const ensureLoaded = () => (loaded ||= load());
  const isAvailable = (date, time) => days.some(d => d.date === date && d.slots.includes(time));

  function renderDays() {
    daysEl.innerHTML = days.map(d => `
      <button type="button" class="bk-day" data-date="${d.date}" aria-pressed="false" aria-label="${longDate(d.date)}">
        <span class="wd">${shortDate(d.date, { weekday: 'short' })}</span>
        <span class="dn">${asDate(d.date).getUTCDate()}</span>
        <span class="mo">${shortDate(d.date, { month: 'short' })}</span>
      </button>`).join('');
  }

  const renderSlotGroup = (label, list) => list.length ? `
      <p class="bk-sub">${label}</p>
      <div class="bk-slots">${list.map(t => `<button type="button" class="bk-slot" data-time="${t}" aria-pressed="false">${t}</button>`).join('')}</div>` : '';

  function selectDate(date) {
    selDate = date;
    selTime = null;
    form.hidden = true;
    daysEl.querySelectorAll('.bk-day').forEach(b => b.setAttribute('aria-pressed', b.dataset.date === date));
    const slots = days.find(d => d.date === date).slots;
    slotsEl.innerHTML = renderSlotGroup('Mañana', slots.filter(t => t < AFTERNOON_START))
      + renderSlotGroup('Tarde', slots.filter(t => t >= AFTERNOON_START));
  }

  function selectTime(time, block = 'nearest') {
    selTime = time;
    slotsEl.querySelectorAll('.bk-slot').forEach(b => b.setAttribute('aria-pressed', b.dataset.time === time));
    $('bkSelected').innerHTML = `${longDate(selDate)} · <span>${time} hs</span>`;
    form.hidden = false;
    setStatus('');
    form.scrollIntoView({ behavior: scrollBehavior(), block });
  }

  daysEl.addEventListener('click', e => { const b = e.target.closest('.bk-day'); if (b) selectDate(b.dataset.date); });
  slotsEl.addEventListener('click', e => { const b = e.target.closest('.bk-slot'); if (b) selectTime(b.dataset.time); });

  function markInvalid(name) {
    form.querySelectorAll('input').forEach(i => i.removeAttribute('aria-invalid'));
    if (!name) return;
    const input = form.elements[name];
    input.setAttribute('aria-invalid', 'true');
    input.focus();
    setStatus(FIELD_ERRORS[name], true);
  }

  // Confirmation popup
  const dialog = $('bkDialog');
  $('bkDialogClose').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', e => { if (e.target === dialog) dialog.close(); }); // click on the backdrop

  function confirmBooking(data, meet) {
    const when = `${longDate(selDate).toLowerCase()} a las ${selTime} hs`;
    const email = escapeHtml(data.email);

    pickEl.hidden = true;
    form.hidden = true;
    const done = $('bkDone');
    done.innerHTML = `<h3>¡Listo, ${escapeHtml(data.nombre)}!</h3>
      <p>Agendamos la charla para el <strong>${when}</strong>. Te mandé la invitación con el link de Meet a <strong>${email}</strong>. Si necesitás cambiar el horario, respondé ese mail o ${waLink('escribime por WhatsApp', 'agenda')}.</p>`;
    done.hidden = false;

    $('bkDialogText').innerHTML = `Nos vemos el <strong>${when}</strong>. Te llegó la invitación a <strong>${email}</strong> con el link de Google Meet (si no la ves, revisá spam).`;
    const meetBtn = $('bkDialogMeet');
    meetBtn.hidden = !meet;
    if (meet) meetBtn.href = meet;
    if (typeof dialog.showModal === 'function') dialog.showModal();
    else done.scrollIntoView({ block: 'center' });
  }

  async function postBooking(data) {
    const res = await fetch(BOOKING_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, date: selDate, time: selTime })
    });
    const body = await res.json().catch(() => ({}));
    return { res, body };
  }

  // Acts on the API answer: confirmation, a taken slot, an invalid field or a generic failure
  async function handleBookingResponse(data, { res, body }) {
    if (res.ok) {
      confirmBooking(data, body.meet);
      track('Booking', { date: selDate });
      return;
    }
    if (res.status === 409) {
      await load(true);
      if (!pickEl.hidden) setStatus('Ese horario se acaba de ocupar. Elegí otro, por favor.', true);
      return;
    }
    if (res.status === 400 && body.field) return markInvalid(body.field);
    fallback('No pude agendar la charla.');
  }

  function setSubmitting(btn, submitting) {
    btn.disabled = submitting;
    btn.textContent = submitting ? 'Agendando…' : 'Confirmar charla';
  }

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const firstInvalid = [...form.querySelectorAll('input[required]')].find(i => !i.checkValidity());
    if (firstInvalid) return markInvalid(firstInvalid.name);
    markInvalid(null);

    const data = Object.fromEntries(new FormData(form));
    const btn = form.querySelector('.bk-submit');
    setSubmitting(btn, true);
    setStatus('');
    try {
      await handleBookingResponse(data, await postBooking(data));
    } catch {
      fallback('No pude agendar la charla.');
    } finally {
      setSubmitting(btn, false);
    }
  });

  // The hero already asked for the slots, so this usually resolves right away
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => {
      if (entries.some(en => en.isIntersecting)) { io.disconnect(); ensureLoaded(); }
    }, { rootMargin: LOAD_AHEAD_MARGIN });
    io.observe(root);
  } else {
    ensureLoaded();
  }

  return {
    // Called from the hero: open that day and time, ready to fill in the form
    async pick(date, time) {
      await ensureLoaded();
      if (!isAvailable(date, time)) {
        root.scrollIntoView({ behavior: scrollBehavior() });
        return;
      }
      selectDate(date);
      selectTime(time, 'center');
      setTimeout(() => form.elements.nombre.focus({ preventScroll: true }), reduceMotion ? 0 : NAME_FOCUS_DELAY_MS);
    }
  };
}
