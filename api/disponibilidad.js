// GET /api/disponibilidad → { days: [{ date: 'YYYY-MM-DD', slots: ['10:00', …] }] }
const { readCalendarConfig, availableDays } = require('./_agenda');
const { sendError, calendarEndpoint } = require('./_http');

// Un minuto de caché en el CDN; /api/agendar vuelve a chequear el horario antes de reservar.
const CACHE_CONTROL = 'public, s-maxage=60, stale-while-revalidate=60';

module.exports = calendarEndpoint('GET', 'disponibilidad', async (req, res) => {
  const cfg = readCalendarConfig();
  if (!cfg) return sendError(res, 503, 'not_configured');

  const days = await availableDays(cfg);
  res.setHeader('Cache-Control', CACHE_CONTROL);
  return res.status(200).json({ days });
});
