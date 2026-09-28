// GET /api/disponibilidad → { days: [{ date: 'YYYY-MM-DD', slots: ['10:00', …] }] }
const { config, availableDays } = require('./_agenda');

module.exports = async (req, res) => {
  if (req.method !== 'GET') return res.status(405).json({ error: 'method_not_allowed' });

  const cfg = config();
  if (!cfg) return res.status(503).json({ error: 'not_configured' });

  try {
    const days = await availableDays(cfg);
    // Un minuto de caché en el CDN; /api/agendar vuelve a chequear el horario antes de reservar.
    res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=60');
    return res.status(200).json({ days });
  } catch (err) {
    console.error('[disponibilidad]', err);
    return res.status(502).json({ error: 'calendar_unavailable' });
  }
};
