// Reglas de la agenda de /servicios: qué horarios se ofrecen y cómo se registra una charla.
// Los archivos con "_" no se publican como endpoints.
const { readCalendarConfig, fetchBusyIntervals, insertEvent, listEvents, inviteAttendees, deleteEvent } = require('./_google-calendar');

const TZ = 'America/Argentina/Buenos_Aires';
const TZ_OFFSET = '-03:00'; // Argentina no tiene horario de verano
const TZ_OFFSET_MS = -3 * 60 * 60 * 1000;
const MINUTE_MS = 60_000;
const DAY_MS = 24 * 60 * MINUTE_MS;
const SLOT_MINUTES = 30;
const SLOT_MS = SLOT_MINUTES * MINUTE_MS;
const MIN_NOTICE_MS = DAY_MS;
const MAX_AHEAD_MS = 7 * DAY_MS;
const LAST_DAY_TO_SCAN = 8; // días desde hoy que se revisan; cubren toda la ventana de MAX_AHEAD_MS
const BOOKING_SOURCE = 'santiagosapia.dev/servicios';

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

const toMinutes = hhmm => Number(hhmm.slice(0, 2)) * 60 + Number(hhmm.slice(3));
const toHHMM = m => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
const slotStart = (date, time) => Date.parse(`${date}T${time}:00${TZ_OFFSET}`);
// Las fechas YYYY-MM-DD se manejan al mediodía UTC para que el día nunca se corra
const atNoonUtc = date => new Date(`${date}T12:00:00Z`);
const localDate = instant => new Date(instant + TZ_OFFSET_MS).toISOString().slice(0, 10);

function addDays(date, n) {
  const d = atNoonUtc(date);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

const isBookable = (start, now) => start >= now + MIN_NOTICE_MS && start <= now + MAX_AHEAD_MS;
const overlapsBusy = (start, end, busy) => busy.some(b => b.start < end && b.end > start);

/** Horarios libres de un día ('10:00', …) según los rangos de atención y lo ocupado. */
function freeSlotsOn(date, ranges, busy, now) {
  const slots = [];
  for (const [from, to] of ranges) {
    for (let m = toMinutes(from); m + SLOT_MINUTES <= toMinutes(to); m += SLOT_MINUTES) {
      const time = toHHMM(m);
      const start = slotStart(date, time);
      if (isBookable(start, now) && !overlapsBusy(start, start + SLOT_MS, busy)) slots.push(time);
    }
  }
  return slots;
}

/** Días con horarios libres, desde 24 h hasta 7 días adelante: [{ date, slots: ['10:00', …] }] */
function computeDays(busy, now) {
  const today = localDate(now);
  const days = [];
  for (let i = 0; i <= LAST_DAY_TO_SCAN; i++) {
    const date = addDays(today, i);
    const ranges = HOURS[atNoonUtc(date).getUTCDay()];
    if (!ranges || HOLIDAYS.has(date)) continue;
    const slots = freeSlotsOn(date, ranges, busy, now);
    if (slots.length) days.push({ date, slots });
  }
  return days;
}

async function availableDays(cfg) {
  const now = Date.now();
  const busy = await fetchBusyIntervals(cfg, {
    from: now + MIN_NOTICE_MS,
    to: now + MAX_AHEAD_MS + SLOT_MS,
    timeZone: TZ
  });
  return computeDays(busy, now);
}

async function isSlotAvailable(cfg, date, time) {
  const days = await availableDays(cfg);
  return days.some(d => d.date === date && d.slots.includes(time));
}

/** Evento de Google Calendar para una charla ya validada. El invitado se suma después, en createBooking. */
function buildBookingEvent({ date, time, nombre, apellido, email, telefono, negocio }) {
  const start = slotStart(date, time);
  const end = start + SLOT_MS;
  const fullName = `${nombre} ${apellido}`;
  return {
    summary: `Charla web · ${negocio || fullName}`,
    description: [
      `Charla sin cargo agendada desde ${BOOKING_SOURCE}`,
      '',
      `Nombre: ${fullName}`,
      `Email: ${email}`,
      `Teléfono: ${telefono}`,
      negocio ? `Negocio: ${negocio}` : null
    ].filter(line => line !== null).join('\n'),
    start: { dateTime: new Date(start).toISOString(), timeZone: TZ },
    end: { dateTime: new Date(end).toISOString(), timeZone: TZ },
    conferenceData: {
      createRequest: { requestId: `svc-${start}-${Math.random().toString(36).slice(2, 10)}`, conferenceSolutionKey: { type: 'hangoutsMeet' } }
    },
    reminders: { useDefault: true },
    extendedProperties: { private: { source: BOOKING_SOURCE } }
  };
}

// La charla más antigua del horario es la que vale; a igual fecha de creación desempata el id
const byCreation = (a, b) => a.created.localeCompare(b.created) || a.id.localeCompare(b.id);

/**
 * Reserva el horario y devuelve el evento, o null si otro pedido simultáneo lo reservó antes.
 * Primero crea el evento sin invitados, después confirma que es el único del horario y recién ahí
 * manda la invitación: así dos pedidos a la vez no generan dos charlas ni dos mails.
 * Una charla cancelada o borrada no cuenta, así que su horario se puede volver a reservar.
 */
async function createBooking(cfg, booking) {
  const start = slotStart(booking.date, booking.time);
  const event = await insertEvent(cfg, buildBookingEvent(booking));
  try {
    const sameSlot = await listEvents(cfg, { from: start, to: start + SLOT_MS, privateProperty: `source=${BOOKING_SOURCE}` });
    const [first] = sameSlot.sort(byCreation);
    if (first && first.id !== event.id) {
      await deleteEvent(cfg, event.id);
      return null;
    }
    await inviteAttendees(cfg, event.id, [{ email: booking.email, displayName: `${booking.nombre} ${booking.apellido}` }]);
    return event;
  } catch (err) {
    // No dejar un evento a medias ocupando el horario
    await deleteEvent(cfg, event.id).catch(() => {});
    throw err;
  }
}

module.exports = { readCalendarConfig, availableDays, isSlotAvailable, createBooking, computeDays, buildBookingEvent };
