export function startOfWeek(d: Date) {
  const date = new Date(d);
  const day = date.getDay(); // 0 = domingo … 6 = sábado
  const diff = (day === 0 ? -6 : 1) - day; // retrocede hasta el lunes
  date.setDate(date.getDate() + diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

export function addDays(d: Date, n: number) {
  const date = new Date(d);
  date.setDate(date.getDate() + n);
  return date;
}

export function toDateParam(d: Date) {
  return d.toISOString().slice(0, 10);
}

export function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}
