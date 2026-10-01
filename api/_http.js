// Utilidades HTTP compartidas por los endpoints de /api (los archivos con "_" no se publican como endpoints).

/**
 * Solo acepta pedidos hechos desde el propio sitio: el navegador siempre manda Origin en un POST,
 * así que si falta o es de otro host se rechaza. Sec-Fetch-Site, cuando viene, tiene que coincidir.
 */
function isSameOrigin(req) {
  const { origin, host } = req.headers;
  const fetchSite = req.headers['sec-fetch-site'];
  if (!origin || (fetchSite && fetchSite !== 'same-origin')) return false;
  try { return new URL(origin).host === host; } catch { return false; }
}

/** Cuerpo JSON del pedido como objeto, o null si no es JSON, está mal formado o no es un objeto. */
function readJsonBody(req) {
  if (!String(req.headers['content-type'] || '').toLowerCase().startsWith('application/json')) return null;
  try {
    const body = req.body; // Vercel lo parsea al leerlo y tira error si el JSON es inválido
    return body && typeof body === 'object' && !Array.isArray(body) ? body : null;
  } catch {
    return null;
  }
}

const sendError = (res, status, error, extra) => res.status(status).json({ error, ...extra });

/** Handler que solo acepta `method` y responde 502 si Google Calendar falla. */
function calendarEndpoint(method, tag, handle) {
  return async (req, res) => {
    if (req.method !== method) return sendError(res, 405, 'method_not_allowed');
    try {
      return await handle(req, res);
    } catch (err) {
      console.error(`[${tag}]`, err);
      return sendError(res, 502, 'calendar_unavailable');
    }
  };
}

module.exports = { isSameOrigin, readJsonBody, sendError, calendarEndpoint };
