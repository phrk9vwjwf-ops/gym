// YYYY-MM-DD in the device's time zone (toISOString() is UTC and gives yesterday after midnight in UTC+N)
export const localDate = (d = new Date()) => {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};
