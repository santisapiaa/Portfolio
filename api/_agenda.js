// Lógica compartida de la agenda de /servicios (los archivos con "_" no se publican como endpoints).
// Habla con Google Calendar vía OAuth (refresh token de la cuenta de Santiago), sin dependencias.

const TZ = 'America/Argentina/Buenos_Aires';
const TZ_OFFSET = '-03:00'; // Argentina no tiene horario de verano
const SLOT_MINUTES = 30;
const MIN_NOTICE_MS = 24 * 60 * 60 * 1000;
const MAX_AHEAD_MS = 7 * 24 * 60 * 60 * 1000;

// Horarios de atención por día de la semana (0 = domingo)
const HOURS = {
  1: [['10:00', '17:00']],
  2: [['14:00', '17:00']],
  3: [['10:00', '17:00']],
  4: [['10:00', '17:00']],
  5: [['10:00', '17:00']]
};

// Feriados nacionales: no se ofrecen turnos. Revisar una vez por año.
// Fuente: https://api.argentinadatos.com/v1/feriados/AÑO
const HOLIDAYS = new Set([
  '2026-10-12', '2026-11-23', '2026-12-07', '2026-12-08', '2026-12-25',
  '2027-01-01', '2027-02-08', '2027-02-09', '2027-03-24', '2027-03-26',
  '2027-04-02', '2027-05-01', '2027-05-25', '2027-06-17', '2027-06-20',
  '2027-07-09', '2027-08-17', '2027-10-12', '2027-11-20', '2027-12-08', '2027-12-25'
]);

function config() {
  const clientId = process.env.GOOGLE_CLIENT_ID?.trim();
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN?.trim();
  const calendarId = process.env.GOOGLE_CALENDAR_ID?.trim() || 'primary';
  if (!clientId || !clientSecret || !refreshToken) return null;
  return { clientId, clientSecret, refreshToken, calendarId };
}

let token = null; // { value, expiresAt } — se reutiliza mientras la función siga "caliente"

async function accessToken(cfg) {
  if (token && token.expiresAt > Date.now() + 60_000) return token.value;
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: cfg.clientId,
      client_secret: cfg.clientSecret,
      refresh_token: cfg.refreshToken,
      grant_type: 'refresh_token'
    })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`token ${res.status}: ${data.error} ${data.error_description || ''}`);
  token = { value: data.access_token, expiresAt: Date.now() + data.expires_in * 1000 };
  return token.value;
}

async function google(cfg, path, body) {
  const res = await fetch(`https://www.googleapis.com/calendar/v3${path}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${await accessToken(cfg)}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`calendar ${res.status}: ${data.error?.message}`);
  return data;
}

/** Intervalos ocupados del calendario entre dos instantes, en ms. */
async function fetchBusy(cfg, from, to) {
  const data = await google(cfg, '/freeBusy', {
    timeMin: new Date(from).toISOString(),
    timeMax: new Date(to).toISOString(),
    timeZone: TZ,
    items: [{ id: cfg.calendarId }]
  });
  const cal = data.calendars[cfg.calendarId];
  if (cal.errors?.length) throw new Error(`freeBusy: ${cal.errors[0].reason}`);
  return cal.busy.map(b => ({ start: Date.parse(b.start), end: Date.parse(b.end) }));
}

const toMinutes = hhmm => Number(hhmm.slice(0, 2)) * 60 + Number(hhmm.slice(3));
const toHHMM = m => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
const slotStart = (date, time) => Date.parse(`${date}T${time}:00${TZ_OFFSET}`);

function addDays(date, n) {
  const d = new Date(`${date}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

/** Días con horarios libres, desde 24 h hasta 7 días adelante: [{ date, slots: ['10:00', …] }] */
function computeDays(busy, now) {
  const today = new Date(now - 3 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const days = [];
  for (let i = 0; i <= 8; i++) {
    const date = addDays(today, i);
    const ranges = HOURS[new Date(`${date}T12:00:00Z`).getUTCDay()];
    if (!ranges || HOLIDAYS.has(date)) continue;
    const slots = [];
    for (const [from, to] of ranges) {
      for (let m = toMinutes(from); m + SLOT_MINUTES <= toMinutes(to); m += SLOT_MINUTES) {
        const start = slotStart(date, toHHMM(m));
        const end = start + SLOT_MINUTES * 60_000;
        if (start < now + MIN_NOTICE_MS || start > now + MAX_AHEAD_MS) continue;
        if (busy.some(b => b.start < end && b.end > start)) continue;
        slots.push(toHHMM(m));
      }
    }
    if (slots.length) days.push({ date, slots });
  }
  return days;
}

async function availableDays(cfg) {
  const now = Date.now();
  const busy = await fetchBusy(cfg, now + MIN_NOTICE_MS, now + MAX_AHEAD_MS + SLOT_MINUTES * 60_000);
  return computeDays(busy, now);
}

async function createEvent(cfg, { date, time, nombre, apellido, email, telefono, negocio }) {
  const start = slotStart(date, time);
  const end = start + SLOT_MINUTES * 60_000;
  const quien = `${nombre} ${apellido}`;
  return google(cfg, `/calendars/${encodeURIComponent(cfg.calendarId)}/events?conferenceDataVersion=1&sendUpdates=all`, {
    summary: `Charla web · ${negocio || quien}`,
    description: [
      'Charla sin cargo agendada desde santiagosapia.dev/servicios',
      '',
      `Nombre: ${quien}`,
      `Email: ${email}`,
      `Teléfono: ${telefono}`,
      negocio ? `Negocio: ${negocio}` : null
    ].filter(l => l !== null).join('\n'),
    start: { dateTime: new Date(start).toISOString(), timeZone: TZ },
    end: { dateTime: new Date(end).toISOString(), timeZone: TZ },
    attendees: [{ email, displayName: quien }],
    conferenceData: {
      createRequest: { requestId: `svc-${start}-${Math.random().toString(36).slice(2, 10)}`, conferenceSolutionKey: { type: 'hangoutsMeet' } }
    },
    reminders: { useDefault: true },
    extendedProperties: { private: { source: 'santiagosapia.dev/servicios' } }
  });
}

/** Rechaza pedidos que vienen de otro sitio (el navegador siempre manda Origin en un POST). */
function sameOrigin(req) {
  const origin = req.headers.origin;
  if (!origin) return true;
  try { return new URL(origin).host === req.headers.host; } catch { return false; }
}

module.exports = { config, availableDays, createEvent, sameOrigin, SLOT_MINUTES };
