// Cliente mínimo de Google Calendar vía OAuth (refresh token de la cuenta de Santiago), sin dependencias.
// Los archivos con "_" no se publican como endpoints.

const OAUTH_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const CALENDAR_API_URL = 'https://www.googleapis.com/calendar/v3';
const TOKEN_REFRESH_MARGIN_MS = 60_000;
const DEFAULT_CALENDAR_ID = 'primary';

/** Credenciales desde las variables de entorno, o null si falta alguna. */
function readCalendarConfig() {
  const clientId = process.env.GOOGLE_CLIENT_ID?.trim();
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN?.trim();
  const calendarId = process.env.GOOGLE_CALENDAR_ID?.trim() || DEFAULT_CALENDAR_ID;
  if (!clientId || !clientSecret || !refreshToken) return null;
  return { clientId, clientSecret, refreshToken, calendarId };
}

let cachedToken = null; // { value, expiresAt } — se reutiliza mientras la función siga "caliente"

async function getAccessToken(cfg) {
  if (cachedToken && cachedToken.expiresAt > Date.now() + TOKEN_REFRESH_MARGIN_MS) return cachedToken.value;
  const res = await fetch(OAUTH_TOKEN_URL, {
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
  cachedToken = { value: data.access_token, expiresAt: Date.now() + data.expires_in * 1000 };
  return cachedToken.value;
}

async function calendarPost(cfg, path, body) {
  const res = await fetch(`${CALENDAR_API_URL}${path}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${await getAccessToken(cfg)}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`calendar ${res.status}: ${data.error?.message}`);
  return data;
}

/** Intervalos ocupados del calendario entre dos instantes, en ms: [{ start, end }] */
async function fetchBusyIntervals(cfg, { from, to, timeZone }) {
  const data = await calendarPost(cfg, '/freeBusy', {
    timeMin: new Date(from).toISOString(),
    timeMax: new Date(to).toISOString(),
    timeZone,
    items: [{ id: cfg.calendarId }]
  });
  const calendar = data.calendars[cfg.calendarId];
  if (calendar.errors?.length) throw new Error(`freeBusy: ${calendar.errors[0].reason}`);
  return calendar.busy.map(b => ({ start: Date.parse(b.start), end: Date.parse(b.end) }));
}

/** Crea el evento con link de Meet y le manda la invitación a los invitados. */
function insertEvent(cfg, event) {
  return calendarPost(cfg, `/calendars/${encodeURIComponent(cfg.calendarId)}/events?conferenceDataVersion=1&sendUpdates=all`, event);
}

module.exports = { readCalendarConfig, fetchBusyIntervals, insertEvent };
