import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Linking, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BirthdayCard } from '@/components/BirthdayCard';
import { CelebrationBurst } from '@/components/CelebrationBurst';
import { EmptyState } from '@/components/EmptyState';
import { PersonCard } from '@/components/PersonCard';
import { PrimaryButton } from '@/components/PrimaryButton';
import { SectionHeader } from '@/components/SectionHeader';
import { Spacing, UPCOMING_LIMIT } from '@/constants/theme';
import { usePeople } from '@/hooks/usePeople';
import { useAppTheme } from '@/hooks/useTheme';
import { getTodaysBirthdays, getUpcomingBirthdays } from '@/lib/birthdays';
import { greetingForHour } from '@/lib/dates';
import { digitsOnlyPhone } from '@/lib/id';

export default function HomeScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const { people, loading } = usePeople();
  const today = getTodaysBirthdays(people);
  const upcoming = getUpcomingBirthdays(people, UPCOMING_LIMIT);
  const greeting = greetingForHour();

  const wish = async (phoneNumber?: string, name?: string) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (phoneNumber) {
      const url = `sms:${digitsOnlyPhone(phoneNumber)}?body=${encodeURIComponent(`Happy Birthday ${name ?? ''}! 🎂`)}`;
      await Linking.openURL(url).catch((error) => console.warn('[DearDay] SMS failed', error));
      return;
    }
    router.push('/people');
  };

  if (loading) {
    return <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} />;
  }

  if (people.length === 0) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
        <ScrollView contentContainerStyle={styles.welcome}>
          <Text style={styles.heroEmoji}>🎂</Text>
          <Text style={[styles.brand, { color: colors.text }]}>DearDay</Text>
          <Text style={[styles.tagline, { color: colors.textSecondary }]}>
            Never forget someone's special day.
          </Text>
          <PrimaryButton label="Add Your First Birthday" onPress={() => router.push('/add')} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View>
          <Text style={[styles.greeting, { color: colors.text }]}>{greeting} 👋</Text>
          <Text style={[styles.kicker, { color: colors.textSecondary }]}>Your special days</Text>
        </View>

        <View style={[styles.summary, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={styles.summaryEmoji}>🎂</Text>
          <Text style={[styles.summaryText, { color: colors.text }]}>
            {people.length === 1
              ? '1 birthday saved'
              : `${people.length} birthdays saved`}
          </Text>
        </View>

        <SectionHeader title="TODAY" />
        <CelebrationBurst visible={today.length > 0} />
        {today.length === 0 ? (
          <EmptyState emoji="🎈" title="No birthdays today" message="Enjoy a quiet day — we’ll highlight the next one below." />
        ) : (
          today.map((info) => (
            <BirthdayCard
              key={info.person.id}
              info={info}
              celebrate
              onPress={() => router.push(`/person/${info.person.id}`)}
              onWish={() => wish(info.person.phoneNumber, info.person.name)}
            />
          ))
        )}

        <SectionHeader title="Upcoming" />
        {upcoming.length === 0 ? (
          <EmptyState
            emoji="📅"
            title="Nothing coming up"
            message="Add more people to see their next birthdays here."
            actionLabel="Add Birthday"
            onAction={() => router.push('/add')}
          />
        ) : (
          upcoming.map((info, index) => (
            <PersonCard
              key={info.person.id}
              person={info.person}
              index={index}
              onPress={() => router.push(`/person/${info.person.id}`)}
            />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: {
    padding: Spacing.lg,
    gap: Spacing.lg,
    paddingBottom: 40,
  },
  welcome: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: Spacing.xl,
    gap: Spacing.lg,
    alignItems: 'center',
  },
  heroEmoji: { fontSize: 56 },
  brand: { fontSize: 36, fontWeight: '800' },
  tagline: { fontSize: 16, textAlign: 'center', marginBottom: 8 },
  greeting: { fontSize: 28, fontWeight: '800' },
  kicker: { fontSize: 16, marginTop: 4 },
  summary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
  },
  summaryEmoji: { fontSize: 28 },
  summaryText: { fontSize: 16, fontWeight: '700', flex: 1 },
});
