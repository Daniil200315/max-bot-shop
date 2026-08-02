// Источник истины для дат и тайм-слотов доставки. Раньше список считался на
// клиенте по времени устройства — при другом часовом поясе клиент видел другой
// набор дат, а сервер не мог провалидировать выбор. Теперь только сервер решает,
// какие даты/слоты доступны; `now` передаётся параметром, чтобы тесты могли
// подставлять любое время без подмены системных часов.
export const SLOT_DEFS = [
  { start: 8, end: 10 },
  { start: 10, end: 12 },
  { start: 12, end: 14 },
  { start: 14, end: 16 },
  { start: 16, end: 18 },
  { start: 18, end: 20 },
];

function pad(n) {
  return String(n).padStart(2, '0');
}

// Локальные getFullYear/getMonth/getDate, а не toISOString() — тот всегда в UTC
// и в вечерние часы даёт дату следующего дня.
function formatDateISO(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function slotValue(s) {
  return `${pad(s.start)}:00-${pad(s.end)}:00`;
}

function slotLabel(s) {
  return `${pad(s.start)}:00–${pad(s.end)}:00`;
}

function makeDateOption(now, offset, slotDefs) {
  const date = new Date(now);
  date.setDate(date.getDate() + offset);

  const label = offset === 0
    ? 'Сегодня'
    : offset === 1
      ? 'Завтра'
      : date.toLocaleDateString('ru-RU', { weekday: 'short' }).replace(/^./, (c) => c.toUpperCase());

  return {
    offset,
    dateISO: formatDateISO(date),
    label,
    sublabel: date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' }),
    slots: slotDefs.map((s) => ({ value: slotValue(s), label: slotLabel(s) })),
  };
}

// Правило (время местное): 08:00–19:00 — сегодня доступен, но только слоты,
// начинающиеся не раньше чем через 2 часа от текущего момента; 19:00–00:00 —
// сегодня недоступен вовсе, ближайшая дата — завтра; 00:00–08:00 — сегодня
// доступен, все слоты. Дальше список дополняется днями вперёд до 3 дат.
export function buildDateOptions(now = new Date()) {
  const options = [];
  const hour = now.getHours();

  if (hour < 19) {
    const todaySlots = hour >= 8
      ? SLOT_DEFS.filter((s) => {
          const cutoff = new Date(now.getTime() + 2 * 60 * 60 * 1000);
          const slotStart = new Date(now);
          slotStart.setHours(s.start, 0, 0, 0);
          return slotStart >= cutoff;
        })
      : SLOT_DEFS.slice();
    if (todaySlots.length > 0) options.push(makeDateOption(now, 0, todaySlots));
  }

  for (let offset = 1; options.length < 3; offset++) {
    options.push(makeDateOption(now, offset, SLOT_DEFS.slice()));
  }

  return options;
}

export function isDeliverySelectionValid(dateISO, timeSlot, now = new Date()) {
  return buildDateOptions(now).some(
    (opt) => opt.dateISO === dateISO && opt.slots.some((s) => s.value === timeSlot)
  );
}
