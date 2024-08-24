import { toZonedTime } from 'date-fns-tz';

export function getNowDateInUtc(timeZone = 'America/Sao_Paulo') {
  const now = new Date();
  const timeZoneDate = toZonedTime(now, timeZone);

  return JSON.stringify(timeZoneDate).replaceAll('"', '');
}
