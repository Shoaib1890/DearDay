import {
  daysBetween,
  formatCountdown,
  getCurrentAge,
  getLocalToday,
  getNextBirthday,
  isBirthdayToday,
  parseBirthday,
} from '@/lib/dates';
import type { BirthdayInfo, Person } from '@/types/person';

export function getBirthdayInfo(person: Person, today = getLocalToday()): BirthdayInfo | null {
  const birthday = parseBirthday(person.birthday);
  if (!birthday) return null;

  const nextBirthday = getNextBirthday(birthday, today);
  const daysUntil = daysBetween(today, nextBirthday);
  const todayBirthday = isBirthdayToday(birthday, today);
  const currentAge = Math.max(0, getCurrentAge(birthday, today));

  return {
    person,
    currentAge,
    nextAge: todayBirthday ? currentAge : currentAge + 1,
    nextBirthday,
    daysUntil,
    isToday: todayBirthday,
  };
}

export function getPeopleWithBirthdayInfo(people: Person[]): BirthdayInfo[] {
  return people
    .map((person) => getBirthdayInfo(person))
    .filter((info): info is BirthdayInfo => info !== null);
}

export function getTodaysBirthdays(people: Person[]): BirthdayInfo[] {
  return getPeopleWithBirthdayInfo(people)
    .filter((info) => info.isToday)
    .sort((a, b) => a.person.name.localeCompare(b.person.name));
}

export function getUpcomingBirthdays(people: Person[], limit = 8): BirthdayInfo[] {
  return getPeopleWithBirthdayInfo(people)
    .filter((info) => !info.isToday)
    .sort((a, b) => a.daysUntil - b.daysUntil || a.person.name.localeCompare(b.person.name))
    .slice(0, limit);
}

export function comparePeopleByName(a: Person, b: Person): number {
  return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
}

export function comparePeopleByUpcoming(a: Person, b: Person): number {
  const infoA = getBirthdayInfo(a);
  const infoB = getBirthdayInfo(b);
  if (!infoA && !infoB) return comparePeopleByName(a, b);
  if (!infoA) return 1;
  if (!infoB) return -1;
  return infoA.daysUntil - infoB.daysUntil || comparePeopleByName(a, b);
}

export function matchesSearch(person: Person, query: string): boolean {
  const needle = query.trim().toLowerCase();
  if (!needle) return true;
  const haystack = `${person.name} ${person.relationship ?? ''}`.toLowerCase();
  return haystack.includes(needle);
}

export function countdownLabel(info: BirthdayInfo): string {
  return formatCountdown(info.daysUntil);
}
