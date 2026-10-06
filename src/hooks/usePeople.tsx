import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { deletePersistedPhoto, persistPhoto } from '@/lib/files';
import { createId } from '@/lib/id';
import {
  cancelAllBirthdayNotifications,
  cancelBirthdayNotification,
  rescheduleAllBirthdayNotifications,
  rescheduleBirthdayNotification,
} from '@/lib/notifications';
import {
  clearPeople as clearPeopleStorage,
  deletePerson as deletePersonStorage,
  exportPeople as exportPeopleStorage,
  getPeople,
  importPeople as importPeopleStorage,
  savePerson as savePersonStorage,
} from '@/lib/storage';
import { formToPersonFields, type PersonFormValues } from '@/lib/validation';
import type { Person } from '@/types/person';

type PeopleContextValue = {
  people: Person[];
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;
  saveFromForm: (values: PersonFormValues, existing?: Person) => Promise<Person>;
  removePerson: (person: Person) => Promise<void>;
  clearAll: () => Promise<void>;
  exportAll: () => Promise<void>;
  importAll: () => Promise<number>;
};

const PeopleContext = createContext<PeopleContextValue | null>(null);

export function PeopleProvider({ children }: { children: ReactNode }) {
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    try {
      const next = await getPeople();
      setPeople(next);
      setError(null);
      await rescheduleAllBirthdayNotifications();
    } catch (err) {
      console.warn('[DearDay] reload failed', err);
      setError('We could not load your birthdays.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const saveFromForm = useCallback(async (values: PersonFormValues, existing?: Person) => {
    const now = new Date().toISOString();
    const id = existing?.id ?? createId();
    let photoUri = values.photoUri || undefined;

    if (photoUri && photoUri !== existing?.photoUri) {
      try {
        photoUri = await persistPhoto(photoUri, id);
      } catch (err) {
        console.warn('[DearDay] Photo persist failed', err);
        throw new Error('We could not save that photo. Try another image.');
      }
    }

    if (existing?.photoUri && existing.photoUri !== photoUri) {
      deletePersistedPhoto(existing.photoUri);
    }

    const person: Person = {
      id,
      ...formToPersonFields({ ...values, photoUri: photoUri ?? '' }),
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    };

    await savePersonStorage(person);
    await rescheduleBirthdayNotification(person);
    setPeople((current) => {
      const index = current.findIndex((item) => item.id === person.id);
      if (index === -1) return [...current, person];
      const next = [...current];
      next[index] = person;
      return next;
    });
    return person;
  }, []);

  const removePerson = useCallback(async (person: Person) => {
    await cancelBirthdayNotification(person.id);
    await deletePersonStorage(person.id);
    deletePersistedPhoto(person.photoUri);
    setPeople((current) => current.filter((item) => item.id !== person.id));
  }, []);

  const clearAll = useCallback(async () => {
    await cancelAllBirthdayNotifications();
    for (const person of people) {
      deletePersistedPhoto(person.photoUri);
    }
    await clearPeopleStorage();
    setPeople([]);
  }, [people]);

  const exportAll = useCallback(async () => {
    await exportPeopleStorage();
  }, []);

  const importAll = useCallback(async () => {
    const merged = await importPeopleStorage();
    setPeople(merged);
    await rescheduleAllBirthdayNotifications();
    return merged.length;
  }, []);

  const value = useMemo(
    () => ({
      people,
      loading,
      error,
      reload,
      saveFromForm,
      removePerson,
      clearAll,
      exportAll,
      importAll,
    }),
    [people, loading, error, reload, saveFromForm, removePerson, clearAll, exportAll, importAll],
  );

  return <PeopleContext.Provider value={value}>{children}</PeopleContext.Provider>;
}

export function usePeople(): PeopleContextValue {
  const value = useContext(PeopleContext);
  if (!value) {
    throw new Error('usePeople must be used within PeopleProvider');
  }
  return value;
}
