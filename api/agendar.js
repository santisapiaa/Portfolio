// POST /api/agendar { date, time, nombre, apellido, email, telefono, negocio?, website (anti-bots) }
const { readCalendarConfig, isSlotAvailable, createBooking } = require('./_agenda');
const { isSameOrigin, sendError, calendarEndpoint } = require('./_http');

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const TIME_PATTERN = /^\d{2}:\d{2}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_CHARS_PATTERN = /^[\d\s()+-]+$/;
const MAX_NAME_LENGTH = 60;
const MAX_EMAIL_LENGTH = 120;
const MAX_BUSINESS_LENGTH = 100;
const MIN_PHONE_DIGITS = 8;
const MAX_PHONE_DIGITS = 15;

const clean = v => (typeof v === 'string' ? v.trim().replace(/\s+/g, ' ') : '');

const isValidName = name => Boolean(name) && name.length <= MAX_NAME_LENGTH;
const isValidEmail = email => email.length <= MAX_EMAIL_LENGTH && EMAIL_PATTERN.test(email);
function isValidPhone(phone) {
  const digits = phone.replace(/\D/g, '').length;
  return digits >= MIN_PHONE_DIGITS && digits <= MAX_PHONE_DIGITS && PHONE_CHARS_PATTERN.test(phone);
}

// Se revisan en este orden; el primero que falla es el que se informa
const FIELD_RULES = [
  ['nombre', isValidName],
  ['apellido', isValidName],
  ['email', isValidEmail],
  ['telefono', isValidPhone],
  ['negocio', negocio => negocio.length <= MAX_BUSINESS_LENGTH]
];

function parseBooking(body) {
  return {
    date: clean(body.date),
    time: clean(body.time),
    nombre: clean(body.nombre),
    apellido: clean(body.apellido),
    email: clean(body.email).toLowerCase(),
    telefono: clean(body.telefono),
    negocio: clean(body.negocio)
  };
}

/** { data } si el pedido es válido; si no, { error, field? } */
function validate(body) {
  const data = parseBooking(body);
  if (!DATE_PATTERN.test(data.date) || !TIME_PATTERN.test(data.time)) return { error: 'invalid_slot' };
  const invalid = FIELD_RULES.find(([field, isValid]) => !isValid(data[field]));
  if (invalid) return { error: 'invalid_field', field: invalid[0] };
  return { data };
}

module.exports = calendarEndpoint('POST', 'agendar', async (req, res) => {
  if (!isSameOrigin(req)) return sendError(res, 403, 'forbidden');

  const body = req.body && typeof req.body === 'object' ? req.body : {};
  // Campo oculto: una persona no lo completa, un bot sí. Se responde "ok" para no darle pistas.
  if (clean(body.website)) return res.status(200).json({ ok: true });

  const { data, error, field } = validate(body);
  if (error) return sendError(res, 400, error, { field });

  const cfg = readCalendarConfig();
  if (!cfg) return sendError(res, 503, 'not_configured');

  // Se recalcula con el calendario actual: respeta las reglas y evita reservar un horario ya ocupado.
  if (!(await isSlotAvailable(cfg, data.date, data.time))) return sendError(res, 409, 'slot_taken');

  const event = await createBooking(cfg, data);
  return res.status(200).json({ ok: true, meet: event.hangoutLink || null });
});
