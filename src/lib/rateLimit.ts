export function startOfDayBD() {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const bd = new Date(utc + 6 * 60 * 60 * 1000);
  bd.setHours(0, 0, 0, 0);
  return new Date(bd.getTime() - 6 * 60 * 60 * 1000);
}
