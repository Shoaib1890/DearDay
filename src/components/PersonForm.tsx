import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import { useState, type ReactNode } from 'react';
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';

import { Avatar } from '@/components/Avatar';
import { PrimaryButton } from '@/components/PrimaryButton';
import { RELATIONSHIP_SUGGESTIONS, REMINDER_PRESETS, Radius, Spacing } from '@/constants/theme';
import { useAppTheme } from '@/hooks/useTheme';
import { calendarFromJsDate, formatBirthday, formatTime, jsDateFromCalendar, parseBirthday } from '@/lib/dates';
import type { PersonFormErrors, PersonFormValues } from '@/lib/validation';

type Props = {
  values: PersonFormValues;
  errors: PersonFormErrors;
  submitLabel: string;
  onChange: (values: PersonFormValues) => void;
  onSubmit: () => void;
};

export function PersonForm({ values, errors, submitLabel, onChange, onSubmit }: Props) {
  const { colors } = useAppTheme();
  const [showDate, setShowDate] = useState(false);
  const [showTime, setShowTime] = useState(false);

  const birthdayDate = parseBirthday(values.birthday);
  const pickerDate = birthdayDate
    ? jsDateFromCalendar(birthdayDate)
    : new Date(2000, 0, 1);

  const onPickDate = (event: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS === 'android') setShowDate(false);
    if (event.type === 'dismissed' || !date) return;
    onChange({ ...values, birthday: formatBirthday(calendarFromJsDate(date)) });
  };

  const onPickTime = (event: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS === 'android') setShowTime(false);
    if (event.type === 'dismissed' || !date) return;
    onChange({ ...values, reminderHour: date.getHours(), reminderMinute: date.getMinutes() });
  };

  const pickPhoto = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      if (!result.canceled && result.assets[0]?.uri) {
        onChange({ ...values, photoUri: result.assets[0].uri });
      }
    } catch (error) {
      console.warn('[DearDay] Image picker failed', error);
      Alert.alert('Could not add photo', 'Please try another image from your gallery.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Pressable onPress={pickPhoto} accessibilityRole="button" accessibilityLabel="Choose photo" style={styles.photo}>
        <Avatar name={values.name || 'Photo'} uri={values.photoUri || undefined} size={96} />
        <Text style={[styles.photoLabel, { color: colors.primary }]}>
          {values.photoUri ? 'Change photo' : 'Add photo'}
        </Text>
      </Pressable>

      <Field label="Name" error={errors.name} colors={colors}>
        <TextInput
          value={values.name}
          onChangeText={(name) => onChange({ ...values, name })}
          placeholder="Rahul"
          placeholderTextColor={colors.textMuted}
          accessibilityLabel="Name"
          style={[styles.input, { color: colors.text, borderColor: errors.name ? colors.danger : colors.border, backgroundColor: colors.surface }]}
        />
      </Field>

      <Field label="Birthday" error={errors.birthday} colors={colors}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Choose birthday"
          onPress={() => setShowDate(true)}
          style={[styles.input, styles.pickerButton, { borderColor: errors.birthday ? colors.danger : colors.border, backgroundColor: colors.surface }]}>
          <Text style={{ color: values.birthday ? colors.text : colors.textMuted, fontSize: 16 }}>
            {birthdayDate
              ? birthdayDate.day + ' ' + ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][birthdayDate.month - 1] + ' ' + birthdayDate.year
              : 'Select a date'}
          </Text>
        </Pressable>
        {showDate ? (
          <DateTimePicker
            value={pickerDate}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            maximumDate={new Date()}
            onChange={onPickDate}
          />
        ) : null}
        {Platform.OS === 'ios' && showDate ? (
          <PrimaryButton label="Done" variant="secondary" onPress={() => setShowDate(false)} />
        ) : null}
      </Field>

      <Field label="Relationship" error={errors.relationship} colors={colors}>
        <View style={styles.chips}>
          {RELATIONSHIP_SUGGESTIONS.map((item) => {
            const selected = values.relationship === item;
            return (
              <Pressable
                key={item}
                onPress={() => onChange({ ...values, relationship: selected ? '' : item })}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                style={[
                  styles.chip,
                  {
                    backgroundColor: selected ? colors.primarySoft : colors.surface,
                    borderColor: selected ? colors.primary : colors.border,
                  },
                ]}>
                <Text style={{ color: selected ? colors.primary : colors.text, fontWeight: '600' }}>{item}</Text>
              </Pressable>
            );
          })}
        </View>
        <TextInput
          value={values.relationship}
          onChangeText={(relationship) => onChange({ ...values, relationship })}
          placeholder="Or type a custom relationship"
          placeholderTextColor={colors.textMuted}
          accessibilityLabel="Custom relationship"
          style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface }]}
        />
      </Field>

      <Field label="Phone number" error={errors.phoneNumber} colors={colors}>
        <TextInput
          value={values.phoneNumber}
          onChangeText={(phoneNumber) => onChange({ ...values, phoneNumber })}
          placeholder="Optional"
          placeholderTextColor={colors.textMuted}
          keyboardType="phone-pad"
          accessibilityLabel="Phone number"
          style={[styles.input, { color: colors.text, borderColor: errors.phoneNumber ? colors.danger : colors.border, backgroundColor: colors.surface }]}
        />
      </Field>

      <Field label="Notes" error={errors.notes} colors={colors}>
        <TextInput
          value={values.notes}
          onChangeText={(notes) => onChange({ ...values, notes })}
          placeholder="Favorite cake: Chocolate"
          placeholderTextColor={colors.textMuted}
          multiline
          accessibilityLabel="Notes"
          style={[styles.input, styles.notes, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface }]}
        />
      </Field>

      <View style={[styles.reminderCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.reminderRow}>
          <View>
            <Text style={[styles.reminderTitle, { color: colors.text }]}>Reminder</Text>
            <Text style={{ color: colors.textSecondary }}>
              {values.reminderEnabled ? formatTime(values.reminderHour, values.reminderMinute) : 'Off'}
            </Text>
          </View>
          <Switch
            value={values.reminderEnabled}
            onValueChange={(reminderEnabled) => onChange({ ...values, reminderEnabled })}
            accessibilityLabel="Enable birthday reminder"
            trackColor={{ true: colors.primary }}
          />
        </View>
        {values.reminderEnabled ? (
          <>
            <View style={styles.chips}>
              {REMINDER_PRESETS.map((preset) => {
                const selected = values.reminderHour === preset.hour && values.reminderMinute === preset.minute;
                return (
                  <Pressable
                    key={preset.label}
                    onPress={() => onChange({ ...values, reminderHour: preset.hour, reminderMinute: preset.minute })}
                    style={[
                      styles.chip,
                      {
                        backgroundColor: selected ? colors.primarySoft : colors.surfaceMuted,
                        borderColor: selected ? colors.primary : colors.border,
                      },
                    ]}>
                    <Text style={{ color: selected ? colors.primary : colors.text, fontWeight: '600' }}>{preset.label}</Text>
                  </Pressable>
                );
              })}
              <Pressable
                onPress={() => setShowTime(true)}
                style={[styles.chip, { backgroundColor: colors.surfaceMuted, borderColor: colors.border }]}>
                <Text style={{ color: colors.text, fontWeight: '600' }}>Custom</Text>
              </Pressable>
            </View>
            {showTime ? (
              <DateTimePicker
                value={new Date(2020, 0, 1, values.reminderHour, values.reminderMinute)}
                mode="time"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={onPickTime}
              />
            ) : null}
            {Platform.OS === 'ios' && showTime ? (
              <PrimaryButton label="Done" variant="secondary" onPress={() => setShowTime(false)} />
            ) : null}
          </>
        ) : null}
      </View>

      <PrimaryButton label={submitLabel} onPress={onSubmit} />
    </ScrollView>
  );
}

function Field({
  label,
  error,
  colors,
  children,
}: {
  label: string;
  error?: string;
  colors: { text: string; danger: string };
  children: ReactNode;
}) {
  return (
    <View style={styles.field}>
      <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
      {children}
      {error ? <Text style={[styles.error, { color: colors.danger }]}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: Spacing.lg,
    gap: Spacing.lg,
    paddingBottom: 48,
  },
  photo: {
    alignItems: 'center',
    gap: Spacing.sm,
  },
  photoLabel: {
    fontWeight: '700',
  },
  field: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
  },
  input: {
    minHeight: 52,
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.lg,
    fontSize: 16,
  },
  pickerButton: {
    justifyContent: 'center',
  },
  notes: {
    minHeight: 110,
    textAlignVertical: 'top',
    paddingTop: Spacing.md,
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
  reminderCard: {
    borderWidth: 1,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  reminderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reminderTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  error: {
    fontSize: 13,
  },
});
