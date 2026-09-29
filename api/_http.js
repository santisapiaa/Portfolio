// Utilidades HTTP compartidas por los endpoints de /api (los archivos con "_" no se publican como endpoints).

/** Rechaza pedidos que vienen de otro sitio (el navegador siempre manda Origin en un POST). */
function isSameOrigin(req) {
  const origin = req.headers.origin;
  if (!origin) return true;
  try { return new URL(origin).host === req.headers.host; } catch { return false; }
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

module.exports = { isSameOrigin, sendError, calendarEndpoint };
