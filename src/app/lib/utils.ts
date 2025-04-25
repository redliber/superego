// lib/utils.ts
import { DateTime, Interval, Duration } from "luxon";

// Parse TIMESTAMP WITH TIME ZONE
export function formatTimestamp(timestamp: string): string {
  timestamp = JSON.stringify(timestamp)
  const dtSpliced = timestamp.split('').splice(1, timestamp.length-7).join('')
  const dt = DateTime.fromISO(dtSpliced);
  return dt.toLocaleString(DateTime.DATETIME_MED)
}

export function parseTimeZoneBeforePOST(timestamp:string): Date {
  const dateObject = new Date(timestamp)

  return new Date(Date.UTC(dateObject.getFullYear(), dateObject.getMonth(), dateObject.getDate(), dateObject.getHours(), dateObject.getMinutes(), dateObject.getSeconds()))
}

// Display in user's time zone
export function formatTimestampInZone(timestamp: string, timeZone: string): string {
  const dt = DateTime.fromISO(timestamp).setZone(timeZone); // e.g., "America/New_York"
  return dt.toLocaleString(DateTime.DATETIME_FULL); // e.g., "April 19, 2025, 10:30 AM EDT"
}

// Parse INTERVAL
export function formatInterval(interval: string): string {
  const dur = Duration.fromISO(interval);
  return dur.toHuman(); // e.g., "25 minutes"
}

// Add INTERVAL to TIMESTAMP
export function addInterval(timestamp: string, interval: string): string {
  const dt = DateTime.fromISO(timestamp);
  const dur = Duration.fromISO(interval.startsWith('PT') ? interval : `PT${interval.replace(/\s*minutes?/i, 'M')}`);
  return String(dt.plus(dur).toISO());
}

export function subInterval(timestamp: string, interval: string): string {
  const dt = DateTime.fromISO(timestamp);
  const dur = Duration.fromISO(interval.startsWith('PT') ? interval : `PT${interval.replace(/\s*minutes?/i, 'M')}`);
  return String(dt.minus(dur).toISO());
}

export function subTime(timestamp1: string, timestamp2: string) : number {
  const dt = DateTime.fromISO(timestamp1)
  const min = DateTime.fromISO(timestamp2)
  const differenceString = String(dt.diff(min, 'minutes').toISO())

  // Remove the * 60 when finished with debugging
  const differenceTime = Math.ceil(Number(differenceString.split('').splice(2).splice(0, differenceString.split('').length - 3 ).join('')) * 60)

  return differenceTime
}
