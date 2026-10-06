export type Person = {
  id: string;
  name: string;
  /** Civil birthday as YYYY-MM-DD. Never treat this as a UTC timestamp. */
  birthday: string;
  relationship?: string;
  phoneNumber?: string;
  photoUri?: string;
  notes?: string;
  reminderEnabled: boolean;
  reminderHour: number;
  reminderMinute: number;
  createdAt: string;
  updatedAt: string;
};

export type PersonInput = Omit<Person, 'id' | 'createdAt' | 'updatedAt'> & {
  id?: string;
};

export type PeopleExport = {
  version: 1;
  exportedAt: string;
  people: Person[];
};

export type CalendarDate = {
  year: number;
  month: number;
  day: number;
};

export type BirthdayInfo = {
  person: Person;
  currentAge: number;
  nextAge: number;
  nextBirthday: CalendarDate;
  daysUntil: number;
  isToday: boolean;
};
