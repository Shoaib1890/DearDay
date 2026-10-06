import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/components/PrimaryButton';
import { SectionHeader } from '@/components/SectionHeader';
import { REMINDER_PRESETS, Radius, Spacing } from '@/constants/theme';
import { usePeople } from '@/hooks/usePeople';
import { useAppTheme } from '@/hooks/useTheme';
import { formatTime } from '@/lib/dates';
import {
  getNotificationPermissionStatus,
  isExpoGo,
  openNotificationSettings,
  requestNotificationPermission,
  scheduleTestNotification,
} from '@/lib/notifications';

export default function SettingsScreen() {
  const router = useRouter();
  const { colors, preference, setPreference, settings, setDefaultReminder } = useAppTheme();
  const { people, exportAll, importAll, clearAll } = usePeople();
  const [permissionLabel, setPermissionLabel] = useState('Checking…');
  const [showTime, setShowTime] = useState(false);

  const refreshPermission = async () => {
    if (isExpoGo()) {
      setPermissionLabel('Not available in Expo Go on Android. Use a development build for birthday reminders.');
      return;
    }
    const status = await getNotificationPermissionStatus();
    setPermissionLabel(status.granted ? 'Enabled' : 'Notifications are disabled.');
  };

  useEffect(() => {
    refreshPermission().catch((error) => console.warn('[DearDay] Permission check failed', error));
  }, []);

  const enableNotifications = async () => {
    const granted = await requestNotificationPermission();
    if (!granted) {
      await openNotificationSettings();
    }
    await refreshPermission();
  };

  const onPickTime = (_event: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS === 'android') setShowTime(false);
    if (!date) return;
    setDefaultReminder(date.getHours(), date.getMinutes());
  };

  const confirmClear = () => {
    Alert.alert('Clear all birthdays?', 'This removes everyone and their reminders from this device.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear',
        style: 'destructive',
        onPress: async () => {
          try {
            await clearAll();
          } catch (error) {
            console.warn('[DearDay] Clear failed', error);
            Alert.alert('Something went wrong', 'We could not clear your birthdays.');
          }
        },
      },
    ]);
  };

  const runExport = async () => {
    try {
      await exportAll();
    } catch (error) {
      console.warn('[DearDay] Export failed', error);
      Alert.alert('Export failed', error instanceof Error ? error.message : 'Please try again.');
    }
  };

  const runImport = async () => {
    try {
      const count = await importAll();
      if (count > 0) {
        Alert.alert('Imported', `Saved ${count} ${count === 1 ? 'person' : 'people'}.`);
      }
    } catch (error) {
      console.warn('[DearDay] Import failed', error);
      Alert.alert('Import failed', error instanceof Error ? error.message : 'That file could not be used.');
    }
  };

  const runTest = async () => {
    const person = people[0];
    if (!person) {
      Alert.alert('Add someone first', 'Create a birthday, then you can send a test reminder.');
      return;
    }
    try {
      await scheduleTestNotification(person, 10);
      Alert.alert('Test scheduled', `A reminder for ${person.name} will appear in about 10 seconds.`);
    } catch (error) {
      Alert.alert('Could not schedule', error instanceof Error ? error.message : 'Please enable notifications.');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['bottom']}>
    <ScrollView style={{ backgroundColor: colors.background }} contentContainerStyle={styles.content}>
      <SectionHeader title="Notifications" subtitle="Birthday reminders stay on this phone." />
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.rowTitle, { color: colors.text }]}>Birthday reminders</Text>
        <Text style={{ color: colors.textSecondary, marginBottom: 12 }}>{permissionLabel}</Text>
        {isExpoGo() ? null : permissionLabel !== 'Enabled' ? (
          <PrimaryButton label="Enable Notifications" onPress={enableNotifications} />
        ) : (
          <Text style={{ color: colors.primary, fontWeight: '700' }}>Reminders can run while the app is closed.</Text>
        )}
        <Text style={[styles.rowTitle, { color: colors.text, marginTop: 18 }]}>Default reminder time</Text>
        <Text style={{ color: colors.textSecondary, marginBottom: 8 }}>
          {formatTime(settings.defaultReminderHour, settings.defaultReminderMinute)}
        </Text>
        <View style={styles.chips}>
          {REMINDER_PRESETS.map((preset) => {
            const selected =
              settings.defaultReminderHour === preset.hour && settings.defaultReminderMinute === preset.minute;
            return (
              <Pressable
                key={preset.label}
                onPress={() => setDefaultReminder(preset.hour, preset.minute)}
                style={[
                  styles.chip,
                  {
                    backgroundColor: selected ? colors.primarySoft : colors.surfaceMuted,
                    borderColor: selected ? colors.primary : colors.border,
                  },
                ]}>
                <Text style={{ color: selected ? colors.primary : colors.text, fontWeight: '700' }}>{preset.label}</Text>
              </Pressable>
            );
          })}
          <Pressable
            onPress={() => setShowTime(true)}
            style={[styles.chip, { backgroundColor: colors.surfaceMuted, borderColor: colors.border }]}>
            <Text style={{ color: colors.text, fontWeight: '700' }}>Custom</Text>
          </Pressable>
        </View>
        {showTime ? (
          <DateTimePicker
            value={new Date(2020, 0, 1, settings.defaultReminderHour, settings.defaultReminderMinute)}
            mode="time"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={onPickTime}
          />
        ) : null}
        <View style={{ height: 12 }} />
        <PrimaryButton label="Send test reminder" variant="secondary" onPress={runTest} />
      </View>

      <SectionHeader title="Appearance" />
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        {(['system', 'light', 'dark'] as const).map((item) => {
          const selected = preference === item;
          return (
            <Pressable
              key={item}
              onPress={() => setPreference(item)}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              style={styles.option}>
              <Text style={[styles.rowTitle, { color: colors.text }]}>
                {item === 'system' ? 'System' : item === 'light' ? 'Light' : 'Dark'}
              </Text>
              <View
                style={[
                  styles.radio,
                  { borderColor: selected ? colors.primary : colors.border, backgroundColor: selected ? colors.primary : 'transparent' },
                ]}
              />
            </Pressable>
          );
        })}
      </View>

      <SectionHeader title="Data" subtitle="Everything stays on your device." />
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border, gap: 12 }]}>
        <PrimaryButton label="Export birthdays" variant="secondary" onPress={runExport} />
        <PrimaryButton label="Import birthdays" variant="secondary" onPress={runImport} />
        <PrimaryButton label="Clear all birthdays" variant="danger" onPress={confirmClear} />
      </View>

      <SectionHeader title="About" />
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border, gap: 8 }]}>
        <Text style={[styles.rowTitle, { color: colors.text }]}>DearDay</Text>
        <Text style={{ color: colors.textSecondary }}>Version {Constants.expoConfig?.version ?? '1.0.0'}</Text>
        <Pressable onPress={() => router.push('/privacy')} accessibilityRole="link">
          <Text style={{ color: colors.primary, fontWeight: '700', marginTop: 8 }}>Privacy Policy</Text>
        </Pressable>
      </View>
    </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: Spacing.lg,
    gap: Spacing.lg,
    paddingBottom: 48,
  },
  card: {
    borderWidth: 1,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
  },
  rowTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    borderWidth: 1,
    borderRadius: Radius.full,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minHeight: 40,
    justifyContent: 'center',
  },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 48,
  },
  radio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
  },
});
