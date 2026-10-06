import type { CalendarDate } from '@/types/person';

const DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const;

const MONTH_SHORT = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
] as const;

export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

export function daysInMonth(year: number, month: number): number {
  if (month === 2) return isLeapYear(year) ? 29 : 28;
  if ([4, 6, 9, 11].includes(month)) return 30;
  return 31;
}

export function getLocalToday(): CalendarDate {
  const now = new Date();
  return {
    year: now.getFullYear(),
    month: now.getMonth() + 1,
    day: now.getDate(),
  };
}

export function parseBirthday(value: string): CalendarDate | null {
  const match = DATE_PATTERN.exec(value);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (month < 1 || month > 12) return null;
  if (day < 1 || day > daysInMonth(year, month)) return null;
  return { year, month, day };
}

export function formatBirthday(date: CalendarDate): string {
  const month = String(date.month).padStart(2, '0');
  const day = String(date.day).padStart(2, '0');
  return `${date.year}-${month}-${day}`;
}

export function calendarFromJsDate(date: Date): CalendarDate {
  return {
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    day: date.getDate(),
  };
}

export function jsDateFromCalendar(date: CalendarDate, hour = 0, minute = 0): Date {
  return new Date(date.year, date.month - 1, date.day, hour, minute, 0, 0);
}

/**
 * February 29 birthdays are observed on February 28 in non-leap years.
 * This keeps the celebration on the last day of February instead of jumping to March 1.
 */
export function observedBirthdayInYear(birthday: CalendarDate, year: number): CalendarDate {
  if (birthday.month === 2 && birthday.day === 29 && !isLeapYear(year)) {
    return { year, month: 2, day: 28 };
  }
  return { year, month: birthday.month, day: birthday.day };
}

export function compareCalendarDates(a: CalendarDate, b: CalendarDate): number {
  if (a.year !== b.year) return a.year - b.year;
  if (a.month !== b.month) return a.month - b.month;
  return a.day - b.day;
}

export function daysBetween(from: CalendarDate, to: CalendarDate): number {
  const fromUtc = Date.UTC(from.year, from.month - 1, from.day);
  const toUtc = Date.UTC(to.year, to.month - 1, to.day);
  return Math.round((toUtc - fromUtc) / 86_400_000);
}

export function getNextBirthday(birthday: CalendarDate, today = getLocalToday()): CalendarDate {
  const thisYear = observedBirthdayInYear(birthday, today.year);
  if (compareCalendarDates(thisYear, today) >= 0) {
    return thisYear;
  }
  return observedBirthdayInYear(birthday, today.year + 1);
}

export function getCurrentAge(birthday: CalendarDate, today = getLocalToday()): number {
  const observedThisYear = observedBirthdayInYear(birthday, today.year);
  const hasHadBirthday = compareCalendarDates(today, observedThisYear) >= 0;
  return today.year - birthday.year - (hasHadBirthday ? 0 : 1);
}

export function isBirthdayToday(birthday: CalendarDate, today = getLocalToday()): boolean {
  const observed = observedBirthdayInYear(birthday, today.year);
  return observed.month === today.month && observed.day === today.day;
}

export function formatMonthDay(date: CalendarDate, short = false): string {
  const months = short ? MONTH_SHORT : MONTH_NAMES;
  return `${months[date.month - 1]} ${date.day}`;
}

export function formatCountdown(daysUntil: number): string {
  if (daysUntil === 0) return 'Today 🎉';
  if (daysUntil === 1) return 'Tomorrow';
  return `In ${daysUntil} days`;
}

export function greetingForHour(hour = new Date().getHours()): string {
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export function formatTime(hour: number, minute: number): string {
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  return `${displayHour}:${String(minute).padStart(2, '0')} ${period}`;
}
