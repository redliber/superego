// lib/utils.ts
import { DateTime, Interval, Duration } from "luxon";

// Parse TIMESTAMP WITH TIME ZONE
export function formatTimestamp(timestamp: string): string {
  timestamp = JSON.stringify(timestamp)
  const dtSpliced = timestamp.split('').splice(1, timestamp.length-7).join('')
  const dt = DateTime.fromISO(dtSpliced);
  return dt.toLocaleString(DateTime.DATETIME_MED)
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
export function addInterval(timestamp: string, interval: string): string | null {
  const dt = DateTime.fromISO(timestamp);
  const dur = Duration.fromISO(interval.startsWith('PT') ? interval : `PT${interval.replace(/\s*minutes?/i, 'M')}`);
  return dt.plus(dur).toISO(); // e.g., "2025-04-19T14:55:00Z"
}
