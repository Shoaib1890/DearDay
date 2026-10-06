import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Alert, View } from 'react-native';

import { PersonForm } from '@/components/PersonForm';
import { usePeople } from '@/hooks/usePeople';
import { useAppTheme } from '@/hooks/useTheme';
import { requestNotificationPermission } from '@/lib/notifications';
import {
  hasFormErrors,
  personToForm,
  validatePersonForm,
  type PersonFormErrors,
} from '@/lib/validation';

export default function EditPersonScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors } = useAppTheme();
  const { people, saveFromForm } = usePeople();
  const person = useMemo(() => people.find((item) => item.id === id), [people, id]);
  const [values, setValues] = useState(() => (person ? personToForm(person) : null));
  const [errors, setErrors] = useState<PersonFormErrors>({});

  useEffect(() => {
    if (person) {
      setValues(personToForm(person));
    }
  }, [person]);

  if (!person || !values) {
    return <View style={{ flex: 1, backgroundColor: colors.background }} />;
  }

  const onSubmit = async () => {
    const nextErrors = validatePersonForm(values);
    setErrors(nextErrors);
    if (hasFormErrors(nextErrors)) return;
    if (values.reminderEnabled) {
      await requestNotificationPermission();
    }
    try {
      await saveFromForm(values, person);
      router.back();
    } catch (error) {
      console.warn('[DearDay] Update failed', error);
      Alert.alert('Could not save', error instanceof Error ? error.message : 'Please try again.');
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <PersonForm values={values} errors={errors} submitLabel="Save changes" onChange={setValues} onSubmit={onSubmit} />
    </View>
  );
}
