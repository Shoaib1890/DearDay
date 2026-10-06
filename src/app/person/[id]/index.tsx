import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo } from 'react';
import { Alert, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Avatar } from '@/components/Avatar';
import { BirthdayCountdown } from '@/components/BirthdayCountdown';
import { CelebrationBurst } from '@/components/CelebrationBurst';
import { PrimaryButton } from '@/components/PrimaryButton';
import { Radius, Spacing } from '@/constants/theme';
import { usePeople } from '@/hooks/usePeople';
import { useAppTheme } from '@/hooks/useTheme';
import { getBirthdayInfo } from '@/lib/birthdays';
import { formatMonthDay, parseBirthday } from '@/lib/dates';
import { digitsOnlyPhone } from '@/lib/id';

export default function PersonDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors } = useAppTheme();
  const { people, removePerson } = usePeople();
  const person = useMemo(() => people.find((item) => item.id === id), [people, id]);
  const info = person ? getBirthdayInfo(person) : null;

  if (!person) {
    return (
      <View style={[styles.missing, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.textSecondary }}>This person is no longer in DearDay.</Text>
      </View>
    );
  }

  const confirmDelete = () => {
    Alert.alert(`Delete ${person.name}?`, `This will remove ${person.name} and their birthday reminder.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await removePerson(person);
          router.replace('/(tabs)/people');
        },
      },
    ]);
  };

  const call = () => {
    if (!person.phoneNumber) return;
    Linking.openURL(`tel:${digitsOnlyPhone(person.phoneNumber)}`).catch((error) => {
      console.warn('[DearDay] Call failed', error);
    });
  };

  const message = () => {
    if (!person.phoneNumber) return;
    Linking.openURL(`sms:${digitsOnlyPhone(person.phoneNumber)}`).catch((error) => {
      console.warn('[DearDay] Message failed', error);
    });
  };

  return (
    <ScrollView style={{ backgroundColor: colors.background }} contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <Avatar name={person.name} uri={person.photoUri} size={128} />
        <Text style={[styles.name, { color: colors.text }]}>{person.name}</Text>
        {person.relationship ? (
          <Text style={[styles.relationship, { color: colors.textSecondary }]}>{person.relationship}</Text>
        ) : null}
      </View>

      {info ? (
        <View style={[styles.card, { backgroundColor: info.isToday ? colors.todayTint : colors.surface, borderColor: colors.border }]}>
          <CelebrationBurst visible={info.isToday} />
          {info.isToday ? <Text style={styles.happy}>Happy Birthday!</Text> : null}
          <Text style={[styles.meta, { color: colors.text }]}>
            🎂 {formatMonthDay(parseBirthday(person.birthday) ?? info.nextBirthday)}
          </Text>
          <Text style={[styles.meta, { color: colors.textSecondary }]}>
            {info.isToday ? `Turns ${info.nextAge} today` : `${info.currentAge} years old · Turns ${info.nextAge}`}
          </Text>
          <BirthdayCountdown info={info} size="large" />
        </View>
      ) : null}

      {person.notes ? (
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.section, { color: colors.text }]}>Notes</Text>
          <Text style={{ color: colors.textSecondary, lineHeight: 22 }}>{person.notes}</Text>
        </View>
      ) : null}

      <View style={styles.actions}>
        <PrimaryButton label="Edit" onPress={() => router.push(`/person/${person.id}/edit`)} />
        {person.phoneNumber ? (
          <>
            <PrimaryButton label="Call" variant="secondary" onPress={call} />
            <PrimaryButton label="Message" variant="secondary" onPress={message} />
          </>
        ) : null}
        <Pressable onPress={confirmDelete} accessibilityRole="button" accessibilityLabel={`Delete ${person.name}`}>
          <Text style={[styles.delete, { color: colors.danger }]}>Delete</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  missing: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { padding: Spacing.lg, gap: Spacing.lg, paddingBottom: 48 },
  hero: { alignItems: 'center', gap: 8, paddingTop: 8 },
  name: { fontSize: 32, fontWeight: '800' },
  relationship: { fontSize: 16 },
  card: {
    borderWidth: 1,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    gap: 8,
  },
  happy: { fontSize: 18, fontWeight: '800' },
  meta: { fontSize: 16 },
  section: { fontSize: 16, fontWeight: '700' },
  actions: { gap: 12 },
  delete: { textAlign: 'center', fontWeight: '700', paddingVertical: 12, fontSize: 16 },
});
