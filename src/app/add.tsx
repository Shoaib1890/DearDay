import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, View } from 'react-native';

import { PersonForm } from '@/components/PersonForm';
import { usePeople } from '@/hooks/usePeople';
import { useAppTheme } from '@/hooks/useTheme';
import {
  emptyPersonForm,
  hasFormErrors,
  validatePersonForm,
  type PersonFormErrors,
  type PersonFormValues,
} from '@/lib/validation';
import { requestNotificationPermission } from '@/lib/notifications';

export default function AddPersonScreen() {
  const router = useRouter();
  const { colors, settings } = useAppTheme();
  const { saveFromForm } = usePeople();
  const [values, setValues] = useState<PersonFormValues>({
    ...emptyPersonForm(),
    reminderHour: settings.defaultReminderHour,
    reminderMinute: settings.defaultReminderMinute,
  });
  const [errors, setErrors] = useState<PersonFormErrors>({});

  const onSubmit = async () => {
    const nextErrors = validatePersonForm(values);
    setErrors(nextErrors);
    if (hasFormErrors(nextErrors)) return;

    if (values.reminderEnabled) {
      const granted = await requestNotificationPermission();
      if (!granted) {
        Alert.alert(
          'Notifications are disabled.',
          'The birthday will be saved. You can enable reminders later in Settings.',
        );
      }
    }

    try {
      const person = await saveFromForm(values);
      router.replace(`/person/${person.id}`);
    } catch (error) {
      console.warn('[DearDay] Save failed', error);
      Alert.alert('Could not save', error instanceof Error ? error.message : 'Please try again.');
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <PersonForm values={values} errors={errors} submitLabel="Save Birthday" onChange={setValues} onSubmit={onSubmit} />
    </View>
  );
}
