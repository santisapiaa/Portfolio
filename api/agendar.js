// POST /api/agendar { date, time, nombre, apellido, email, telefono, negocio?, website (anti-bots) }
const { config, availableDays, createEvent, sameOrigin } = require('./_agenda');

const clean = v => (typeof v === 'string' ? v.trim().replace(/\s+/g, ' ') : '');

function validate(body) {
  const data = {
    date: clean(body.date),
    time: clean(body.time),
    nombre: clean(body.nombre),
    apellido: clean(body.apellido),
    email: clean(body.email).toLowerCase(),
    telefono: clean(body.telefono),
    negocio: clean(body.negocio)
  };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data.date) || !/^\d{2}:\d{2}$/.test(data.time)) return { error: 'invalid_slot' };
  if (!data.nombre || data.nombre.length > 60) return { error: 'invalid_field', field: 'nombre' };
  if (!data.apellido || data.apellido.length > 60) return { error: 'invalid_field', field: 'apellido' };
  if (data.email.length > 120 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(data.email)) return { error: 'invalid_field', field: 'email' };
  const digits = data.telefono.replace(/\D/g, '');
  if (digits.length < 8 || digits.length > 15 || !/^[\d\s()+-]+$/.test(data.telefono)) return { error: 'invalid_field', field: 'telefono' };
  if (data.negocio.length > 100) return { error: 'invalid_field', field: 'negocio' };
  return { data };
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'method_not_allowed' });
  if (!sameOrigin(req)) return res.status(403).json({ error: 'forbidden' });

  const body = req.body && typeof req.body === 'object' ? req.body : {};
  // Campo oculto: una persona no lo completa, un bot sí. Se responde "ok" para no darle pistas.
  if (clean(body.website)) return res.status(200).json({ ok: true });

  const { data, error, field } = validate(body);
  if (error) return res.status(400).json({ error, field });

  const cfg = config();
  if (!cfg) return res.status(503).json({ error: 'not_configured' });

  try {
    // Se recalcula con el calendario actual: respeta las reglas y evita reservar un horario ya ocupado.
    const days = await availableDays(cfg);
    const free = days.some(d => d.date === data.date && d.slots.includes(data.time));
    if (!free) return res.status(409).json({ error: 'slot_taken' });

    const event = await createEvent(cfg, data);
    return res.status(200).json({ ok: true, meet: event.hangoutLink || null });
  } catch (err) {
    console.error('[agendar]', err);
    return res.status(502).json({ error: 'calendar_unavailable' });
  }
};
