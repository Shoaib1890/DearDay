import AsyncStorage from '@react-native-async-storage/async-storage';
import * as DocumentPicker from 'expo-document-picker';
import { Directory, File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';

import { writeJsonFile } from '@/lib/files';
import { isPersonRecord } from '@/lib/validation';
import type { PeopleExport, Person } from '@/types/person';

const PEOPLE_KEY = '@dearday/people';

async function readPeople(): Promise<Person[]> {
  const raw = await AsyncStorage.getItem(PEOPLE_KEY);
  if (!raw) return [];
  const parsed: unknown = JSON.parse(raw);
  if (!Array.isArray(parsed)) return [];
  return parsed.filter(isPersonRecord);
}

async function writePeople(people: Person[]): Promise<void> {
  await AsyncStorage.setItem(PEOPLE_KEY, JSON.stringify(people));
}

export async function getPeople(): Promise<Person[]> {
  try {
    return await readPeople();
  } catch (error) {
    console.warn('[DearDay] Failed to load people', error);
    throw new Error('We could not load your birthdays.');
  }
}

export async function getPerson(id: string): Promise<Person | null> {
  const people = await getPeople();
  return people.find((person) => person.id === id) ?? null;
}

export async function savePerson(person: Person): Promise<Person> {
  const people = await getPeople();
  const index = people.findIndex((item) => item.id === person.id);
  if (index >= 0) {
    people[index] = person;
  } else {
    people.push(person);
  }
  await writePeople(people);
  return person;
}

export async function updatePerson(person: Person): Promise<Person> {
  return savePerson(person);
}

export async function deletePerson(id: string): Promise<void> {
  const people = await getPeople();
  await writePeople(people.filter((person) => person.id !== id));
}

export async function clearPeople(): Promise<void> {
  await writePeople([]);
}

export async function replacePeople(people: Person[]): Promise<void> {
  await writePeople(people);
}

export async function exportPeople(): Promise<void> {
  const people = await getPeople();
  const payload: PeopleExport = {
    version: 1,
    exportedAt: new Date().toISOString(),
    people,
  };
  const file = writeJsonFile(
    new Directory(Paths.cache, 'exports'),
    `dearday-birthdays.json`,
    JSON.stringify(payload, null, 2),
  );

  const canShare = await Sharing.isAvailableAsync();
  if (!canShare) {
    throw new Error('Sharing is not available on this device.');
  }
  await Sharing.shareAsync(file.uri, {
    mimeType: 'application/json',
    dialogTitle: 'Export DearDay birthdays',
    UTI: 'public.json',
  });
}

export async function importPeople(): Promise<Person[]> {
  const result = await DocumentPicker.getDocumentAsync({
    type: ['application/json', 'text/json', '*/*'],
    copyToCacheDirectory: true,
  });
  if (result.canceled) {
    return [];
  }

  const asset = result.assets[0];
  if (!asset?.uri) {
    throw new Error('That file could not be opened.');
  }

  const file = new File(asset.uri);
  const text = await file.text();
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error('That file is not valid JSON.');
  }

  const importedPeople = extractPeople(parsed);
  if (importedPeople.length === 0) {
    throw new Error('No valid birthdays were found in that file.');
  }

  const existing = await getPeople();
  const merged = mergePeople(existing, importedPeople);
  await writePeople(merged);
  return merged;
}

function extractPeople(parsed: unknown): Person[] {
  if (Array.isArray(parsed)) {
    return parsed.filter(isPersonRecord);
  }
  if (parsed && typeof parsed === 'object' && 'people' in parsed) {
    const people = (parsed as { people: unknown }).people;
    if (Array.isArray(people)) {
      return people.filter(isPersonRecord);
    }
  }
  return [];
}

function mergePeople(existing: Person[], incoming: Person[]): Person[] {
  const byId = new Map(existing.map((person) => [person.id, person]));
  for (const person of incoming) {
    byId.set(person.id, person);
  }
  return [...byId.values()];
}
