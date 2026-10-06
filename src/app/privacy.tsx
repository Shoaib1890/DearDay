import { ScrollView, StyleSheet, Text } from 'react-native';

import { Spacing } from '@/constants/theme';
import { useAppTheme } from '@/hooks/useTheme';

export default function PrivacyScreen() {
  const { colors } = useAppTheme();
  return (
    <ScrollView style={{ backgroundColor: colors.background }} contentContainerStyle={styles.content}>
      <Text style={[styles.title, { color: colors.text }]}>Your days stay yours.</Text>
      <Text style={[styles.body, { color: colors.textSecondary }]}>
        DearDay is an offline birthday reminder. Names, photos, notes, and phone numbers are stored only on this
        device. The app does not create an account, does not use a cloud database, and does not upload your birthdays
        anywhere.
      </Text>
      <Text style={[styles.body, { color: colors.textSecondary }]}>
        Local notifications are scheduled on your phone so reminders can appear even when DearDay is closed. Photos are
        copied into the app's private storage. Exporting birthdays is optional and happens through your device share
        sheet.
      </Text>
      <Text style={[styles.body, { color: colors.textSecondary }]}>
        DearDay does not request contacts, location, or camera access.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: Spacing.xl,
    gap: Spacing.lg,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
  },
});
