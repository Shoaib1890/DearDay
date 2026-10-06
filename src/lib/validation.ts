import {
  DEFAULT_REMINDER_HOUR,
  DEFAULT_REMINDER_MINUTE,
  MAX_NAME_LENGTH,
  MAX_NOTES_LENGTH,
  MAX_RELATIONSHIP_LENGTH,
} from '@/constants/theme';
import { parseBirthday } from '@/lib/dates';
import type { Person } from '@/types/person';

export type PersonFormValues = {
  name: string;
  birthday: string;
  relationship: string;
  phoneNumber: string;
  photoUri: string;
  notes: string;
  reminderEnabled: boolean;
  reminderHour: number;
  reminderMinute: number;
};

export type PersonFormErrors = Partial<Record<'name' | 'birthday' | 'phoneNumber' | 'notes' | 'relationship', string>>;

export const emptyPersonForm = (): PersonFormValues => ({
  name: '',
  birthday: '',
  relationship: '',
  phoneNumber: '',
  photoUri: '',
  notes: '',
  reminderEnabled: true,
  reminderHour: DEFAULT_REMINDER_HOUR,
  reminderMinute: DEFAULT_REMINDER_MINUTE,
});

export function personToForm(person: Person): PersonFormValues {
  return {
    name: person.name,
    birthday: person.birthday,
    relationship: person.relationship ?? '',
    phoneNumber: person.phoneNumber ?? '',
    photoUri: person.photoUri ?? '',
    notes: person.notes ?? '',
    reminderEnabled: person.reminderEnabled,
    reminderHour: person.reminderHour,
    reminderMinute: person.reminderMinute,
  };
}

function optional(value: string): string | undefined {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export function validatePhoneNumber(value: string): string | undefined {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  const digits = trimmed.replace(/\D/g, '');
  if (digits.length < 7 || digits.length > 15) {
    return 'Enter a valid phone number.';
  }
  if (!/^[+]?[\d\s()-]+$/.test(trimmed)) {
    return 'Phone numbers can only include digits and + ( ) -';
  }
  return undefined;
}

export function validatePersonForm(values: PersonFormValues): PersonFormErrors {
  const errors: PersonFormErrors = {};
  const name = values.name.trim();

  if (!name) {
    errors.name = 'Please enter a name.';
  } else if (name.length > MAX_NAME_LENGTH) {
    errors.name = `Keep names under ${MAX_NAME_LENGTH} characters.`;
  }

  if (!values.birthday) {
    errors.birthday = 'Please choose a birthday.';
  } else if (!parseBirthday(values.birthday)) {
    errors.birthday = 'That birthday does not look valid.';
  }

  const phoneError = validatePhoneNumber(values.phoneNumber);
  if (phoneError) errors.phoneNumber = phoneError;

  if (values.notes.trim().length > MAX_NOTES_LENGTH) {
    errors.notes = `Notes must be under ${MAX_NOTES_LENGTH} characters.`;
  }

  if (values.relationship.trim().length > MAX_RELATIONSHIP_LENGTH) {
    errors.relationship = `Keep this under ${MAX_RELATIONSHIP_LENGTH} characters.`;
  }

  return errors;
}

export function hasFormErrors(errors: PersonFormErrors): boolean {
  return Object.keys(errors).length > 0;
}

export function formToPersonFields(values: PersonFormValues): Omit<Person, 'id' | 'createdAt' | 'updatedAt'> {
  return {
    name: values.name.trim(),
    birthday: values.birthday,
    relationship: optional(values.relationship),
    phoneNumber: optional(values.phoneNumber),
    photoUri: optional(values.photoUri),
    notes: optional(values.notes),
    reminderEnabled: values.reminderEnabled,
    reminderHour: values.reminderHour,
    reminderMinute: values.reminderMinute,
  };
}

export function isPersonRecord(value: unknown): value is Person {
  if (!value || typeof value !== 'object') return false;
  const person = value as Record<string, unknown>;
  return (
    typeof person.id === 'string' &&
    typeof person.name === 'string' &&
    typeof person.birthday === 'string' &&
    parseBirthday(person.birthday) !== null &&
    typeof person.reminderEnabled === 'boolean' &&
    typeof person.reminderHour === 'number' &&
    typeof person.reminderMinute === 'number' &&
    person.reminderHour >= 0 &&
    person.reminderHour <= 23 &&
    person.reminderMinute >= 0 &&
    person.reminderMinute <= 59
  );
}
