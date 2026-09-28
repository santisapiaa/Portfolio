// Vercel Analytics custom events (window.va is queued in the page head until the script loads)
function track(name, data) {
  window.va?.('event', { name, data });
}

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

// Scroll-reveal
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (!reduceMotion && 'IntersectionObserver' in window) {
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

// Booking: free slots from Google Calendar (via /api) and the form that creates the Meet event
const booking = document.getElementById('booking');
if (booking) initBooking(booking);

function initBooking(root) {
  const $ = id => document.getElementById(id);
  const daysEl = $('bkDays'), slotsEl = $('bkSlots'), form = $('bkForm'), statusEl = $('bkStatus');
  const WA = 'https://wa.me/5491166429749?text=Hola%20Santiago%2C%20vi%20tu%20p%C3%A1gina%20y%20quiero%20consultar%20por%20una%20web%20para%20mi%20negocio';
  let days = [], selDate = null, selTime = null, loaded = false;

  // Dates come as YYYY-MM-DD; format them at noon UTC so the day never shifts
  const asDate = d => new Date(`${d}T12:00:00Z`);
  const fmt = opts => new Intl.DateTimeFormat('es-AR', { ...opts, timeZone: 'UTC' });
  const short = (d, opts) => fmt(opts).format(asDate(d)).replace('.', '');
  const longDate = d => { const s = fmt({ weekday: 'long', day: 'numeric', month: 'long' }).format(asDate(d)).replace(',', ''); return s[0].toUpperCase() + s.slice(1); };

  function setStatus(html, isError) {
    statusEl.innerHTML = html;
    statusEl.classList.toggle('error', Boolean(isError));
  }

  function fallback(msg) {
    setStatus(`${msg} Podés <a href="${root.dataset.fallback}" target="_blank" rel="noopener">agendar desde mi calendario de Google</a> o <a href="${WA}" target="_blank" rel="noopener" data-wa="agenda">escribirme por WhatsApp</a>.`, true);
  }

  async function load() {
    loaded = true;
    try {
      const res = await fetch('/api/disponibilidad');
      if (!res.ok) throw new Error(res.status);
      days = (await res.json()).days;
    } catch {
      $('bkPick').hidden = true;
      fallback('No pude cargar los horarios en este momento.');
      return;
    }
    if (!days.length) {
      $('bkPick').hidden = true;
      fallback('No me quedan horarios libres en los próximos días.');
      return;
    }
    setStatus('');
    $('bkPick').hidden = false;
    renderDays();
    selectDate(days.some(d => d.date === selDate) ? selDate : days[0].date);
  }

  function renderDays() {
    daysEl.innerHTML = days.map(d => `
      <button type="button" class="bk-day" data-date="${d.date}" aria-pressed="false" aria-label="${longDate(d.date)}">
        <span class="wd">${short(d.date, { weekday: 'short' })}</span>
        <span class="dn">${asDate(d.date).getUTCDate()}</span>
        <span class="mo">${short(d.date, { month: 'short' })}</span>
      </button>`).join('');
  }

  function selectDate(date) {
    selDate = date;
    selTime = null;
    form.hidden = true;
    daysEl.querySelectorAll('.bk-day').forEach(b => b.setAttribute('aria-pressed', b.dataset.date === date));
    const slots = days.find(d => d.date === date).slots;
    const group = (label, list) => list.length ? `
      <p class="bk-sub">${label}</p>
      <div class="bk-slots">${list.map(t => `<button type="button" class="bk-slot" data-time="${t}" aria-pressed="false">${t}</button>`).join('')}</div>` : '';
    slotsEl.innerHTML = group('Mañana', slots.filter(t => t < '13:00')) + group('Tarde', slots.filter(t => t >= '13:00'));
  }

  function selectTime(time) {
    selTime = time;
    slotsEl.querySelectorAll('.bk-slot').forEach(b => b.setAttribute('aria-pressed', b.dataset.time === time));
    $('bkSelected').innerHTML = `${longDate(selDate)} · <span>${time} hs</span>`;
    form.hidden = false;
    setStatus('');
    form.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'nearest' });
  }

  daysEl.addEventListener('click', e => { const b = e.target.closest('.bk-day'); if (b) selectDate(b.dataset.date); });
  slotsEl.addEventListener('click', e => { const b = e.target.closest('.bk-slot'); if (b) selectTime(b.dataset.time); });

  const FIELD_ERRORS = {
    nombre: 'Completá tu nombre.',
    apellido: 'Completá tu apellido.',
    email: 'Revisá el email, parece que no es válido.',
    telefono: 'Revisá el teléfono (con código de área, por ejemplo 11 1234-5678).',
    negocio: 'El nombre del negocio es demasiado largo.'
  };

  function markInvalid(name) {
    form.querySelectorAll('input').forEach(i => i.removeAttribute('aria-invalid'));
    if (!name) return;
    const input = form.elements[name];
    input.setAttribute('aria-invalid', 'true');
    input.focus();
    setStatus(FIELD_ERRORS[name], true);
  }

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const firstInvalid = [...form.querySelectorAll('input[required]')].find(i => !i.checkValidity());
    if (firstInvalid) return markInvalid(firstInvalid.name);
    markInvalid(null);

    const data = Object.fromEntries(new FormData(form));
    const btn = form.querySelector('.bk-submit');
    btn.disabled = true;
    btn.textContent = 'Agendando…';
    setStatus('');
    try {
      const res = await fetch('/api/agendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, date: selDate, time: selTime })
      });
      const body = await res.json().catch(() => ({}));
      if (res.ok) {
        $('bkPick').hidden = true;
        form.hidden = true;
        const done = $('bkDone');
        done.innerHTML = `<h3>¡Listo, ${escapeHtml(data.nombre)}!</h3>
          <p>Agendamos la charla para el <strong>${longDate(selDate).toLowerCase()} a las ${selTime} hs</strong>. Te mandé la invitación con el link de Meet a <strong>${escapeHtml(data.email)}</strong>. Si necesitás cambiar el horario, respondé ese mail o <a href="${WA}" target="_blank" rel="noopener" data-wa="agenda">escribime por WhatsApp</a>.</p>`;
        done.hidden = false;
        track('Booking', { date: selDate });
        return;
      }
      if (res.status === 409) {
        await load();
        if (!$('bkPick').hidden) setStatus('Ese horario se acaba de ocupar. Elegí otro, por favor.', true);
        return;
      }
      if (res.status === 400 && body.field) return markInvalid(body.field);
      fallback('No pude agendar la charla.');
    } catch {
      fallback('No pude agendar la charla.');
    } finally {
      btn.disabled = false;
      btn.textContent = 'Confirmar charla';
    }
  });

  // Only ask for availability when the section gets close, so every visit doesn't hit the calendar
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => {
      if (entries.some(en => en.isIntersecting) && !loaded) { io.disconnect(); load(); }
    }, { rootMargin: '600px 0px' });
    io.observe(root);
  } else {
    load();
  }
}

function escapeHtml(s) {
  return s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
