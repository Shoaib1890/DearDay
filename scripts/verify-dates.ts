import {
  formatCountdown,
  getCurrentAge,
  getNextBirthday,
  isBirthdayToday,
  isLeapYear,
  observedBirthdayInYear,
} from '@/lib/dates';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(message);
  }
}

const today = { year: 2026, month: 10, day: 5 };
const rahul = { year: 2002, month: 10, day: 8 };

assert(getCurrentAge(rahul, today) === 23, 'Rahul should be 23 on Oct 5 2026');
assert(getNextBirthday(rahul, today).day === 8, 'Next birthday should stay Oct 8');
assert(formatCountdown(3) === 'In 3 days', 'Countdown copy');
assert(isBirthdayToday(rahul, { year: 2026, month: 10, day: 8 }), 'Oct 8 is birthday');
assert(!isLeapYear(2026), '2026 is not leap');
assert(observedBirthdayInYear({ year: 2000, month: 2, day: 29 }, 2026).day === 28, 'Feb 29 observes on Feb 28');
assert(observedBirthdayInYear({ year: 2000, month: 2, day: 29 }, 2028).day === 29, 'Leap year keeps Feb 29');
assert(getNextBirthday({ year: 1999, month: 1, day: 1 }, { year: 2026, month: 12, day: 31 }).year === 2027, 'Year boundary');

console.log('DearDay date checks passed');
