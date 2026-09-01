/**
 * Opening Hours & Indian Standard Time (IST, UTC+05:30) Evaluation Utilities.
 * Strictly adheres to the No-Hallucination Policy:
 * Never infers "Open now" from business category alone.
 */

export interface OpeningStatusResult {
  status: 'open' | 'closed' | 'unknown';
  badgeText: string;
  detailText: string;
  is24x7: boolean;
}

/**
 * Get current date & time components in Indian Standard Time (Asia/Kolkata).
 */
export function getCurrentISTTime(): { day: number; hour: number; minute: number; timeNumber: number } {
  const now = new Date();
  // Format into Asia/Kolkata timezone with explicit 24-hour cycle (0-23)
  const istFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Kolkata',
    hourCycle: 'h23',
    weekday: 'short',
    hour: 'numeric',
    minute: 'numeric',
  });

  const parts = istFormatter.formatToParts(now);
  let hour = 0;
  let minute = 0;
  let weekdayStr = 'Mon';

  for (const p of parts) {
    if (p.type === 'hour') hour = parseInt(p.value, 10);
    if (p.type === 'minute') minute = parseInt(p.value, 10);
    if (p.type === 'weekday') weekdayStr = p.value;
  }

  // Normalize midnight representation: ensure hour is strictly 0..23
  hour = ((hour % 24) + 24) % 24;

  const daysMap: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  const day = daysMap[weekdayStr] ?? now.getDay();
  const timeNumber = hour * 60 + minute;

  return { day, hour, minute, timeNumber };
}

/**
 * Parse time string like "09:30 AM", "10:30 PM", "22:00", "09:00" to minutes from midnight.
 */
export function parseTimeToMinutes(timeStr: string): number | null {
  if (!timeStr) return null;
  const clean = timeStr.trim().toUpperCase();

  // Handle 12-hour AM/PM format (e.g. "09:30 AM", "10:00 PM")
  const match12 = clean.match(/^(\d{1,2}):?(\d{2})?\s*(AM|PM)$/);
  if (match12) {
    let hrs = parseInt(match12[1], 10);
    const mins = match12[2] ? parseInt(match12[2], 10) : 0;
    const ampm = match12[3];

    if (ampm === 'PM' && hrs < 12) hrs += 12;
    if (ampm === 'AM' && hrs === 12) hrs = 0;
    return hrs * 60 + mins;
  }

  // Handle 24-hour format (e.g. "22:30", "09:00")
  const match24 = clean.match(/^(\d{1,2}):(\d{2})$/);
  if (match24) {
    const hrs = parseInt(match24[1], 10);
    const mins = parseInt(match24[2], 10);
    if (hrs >= 0 && hrs < 24 && mins >= 0 && mins < 60) {
      return hrs * 60 + mins;
    }
  }

  return null;
}

/**
 * Evaluates opening status for a place against verified hours or 24/7 status.
 * Returns honest 'unknown' / 'Hours unavailable' when hours are not verified.
 */
export function evaluateOpeningStatus(
  openingHoursOrObj?: string | Record<string, string> | { openingHours?: string | Record<string, string> | null; is24x7?: boolean } | null,
  is24x7Param?: boolean
): OpeningStatusResult {
  let openingHours: string | Record<string, string> | null | undefined = undefined;
  let is24x7: boolean = false;

  if (typeof openingHoursOrObj === 'object' && openingHoursOrObj !== null && ('is24x7' in openingHoursOrObj || 'openingHours' in openingHoursOrObj)) {
    is24x7 = Boolean(openingHoursOrObj.is24x7);
    openingHours = openingHoursOrObj.openingHours;
  } else {
    openingHours = openingHoursOrObj as string | Record<string, string> | null | undefined;
    is24x7 = Boolean(is24x7Param);
  }

  if (is24x7) {
    return {
      status: 'open',
      badgeText: 'Open 24/7',
      detailText: 'Verified 24/7 Emergency / Continuous Service',
      is24x7: true,
    };
  }

  if (!openingHours) {
    return {
      status: 'unknown',
      badgeText: 'Hours unavailable',
      detailText: 'Hours not verified by source',
      is24x7: false,
    };
  }

  // If openingHours is a simple string like "10:00 AM - 10:30 PM"
  let scheduleStr = typeof openingHours === 'string' ? openingHours : '';
  if (typeof openingHours === 'object' && openingHours !== null) {
    const { day } = getCurrentISTTime();
    const dayKeys = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const todayKey = dayKeys[day];
    scheduleStr = openingHours[todayKey] || openingHours['default'] || '';
  }

  if (!scheduleStr) {
    return {
      status: 'unknown',
      badgeText: 'Hours unavailable',
      detailText: 'Hours not verified by source',
      is24x7: false,
    };
  }

  if (scheduleStr.toLowerCase().includes('24 hours') || scheduleStr.toLowerCase().includes('24x7') || scheduleStr.toLowerCase().includes('24/7')) {
    return {
      status: 'open',
      badgeText: 'Open 24 Hours',
      detailText: 'Continuous 24-hour service',
      is24x7: true,
    };
  }

  if (scheduleStr.toLowerCase() === 'closed') {
    return {
      status: 'closed',
      badgeText: 'Closed Today',
      detailText: 'Closed on this day',
      is24x7: false,
    };
  }

  // Parse time window e.g. "09:00 AM - 09:30 PM" or "10:00 - 22:00"
  const rangeMatch = scheduleStr.match(/([0-9:APM\s]+)\s*[-–to]+\s*([0-9:APM\s]+)/i);
  if (!rangeMatch) {
    return {
      status: 'unknown',
      badgeText: scheduleStr,
      detailText: scheduleStr,
      is24x7: false,
    };
  }

  const openMins = parseTimeToMinutes(rangeMatch[1]);
  const closeMins = parseTimeToMinutes(rangeMatch[2]);

  if (openMins === null || closeMins === null) {
    return {
      status: 'unknown',
      badgeText: scheduleStr,
      detailText: scheduleStr,
      is24x7: false,
    };
  }

  const { timeNumber } = getCurrentISTTime();

  // Same-day window (e.g. 09:00 to 22:00)
  if (openMins < closeMins) {
    if (timeNumber >= openMins && timeNumber < closeMins) {
      return {
        status: 'open',
        badgeText: 'Open now',
        detailText: `Closes at ${rangeMatch[2].trim()}`,
        is24x7: false,
      };
    } else {
      return {
        status: 'closed',
        badgeText: 'Closed',
        detailText: `Opens at ${rangeMatch[1].trim()}`,
        is24x7: false,
      };
    }
  } else {
    // Overnight window (e.g. 18:00 to 02:00)
    if (timeNumber >= openMins || timeNumber < closeMins) {
      return {
        status: 'open',
        badgeText: 'Open now',
        detailText: `Closes at ${rangeMatch[2].trim()}`,
        is24x7: false,
      };
    } else {
      return {
        status: 'closed',
        badgeText: 'Closed',
        detailText: `Opens at ${rangeMatch[1].trim()}`,
        is24x7: false,
      };
    }
  }
}
