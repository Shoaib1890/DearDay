import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { Avatar } from '@/components/Avatar';
import { BirthdayCountdown } from '@/components/BirthdayCountdown';
import { Radius, Spacing } from '@/constants/theme';
import { useAppTheme } from '@/hooks/useTheme';
import { formatMonthDay } from '@/lib/dates';
import { getBirthdayInfo } from '@/lib/birthdays';
import type { Person } from '@/types/person';

type Props = {
  person: Person;
  onPress: () => void;
  index?: number;
};

export function PersonCard({ person, onPress, index = 0 }: Props) {
  const { colors } = useAppTheme();
  const info = getBirthdayInfo(person);

  return (
    <Animated.View entering={FadeInDown.delay(Math.min(index, 8) * 40).duration(280)}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${person.name}${person.relationship ? `, ${person.relationship}` : ''}`}
        onPress={onPress}
        style={({ pressed }) => [
          styles.card,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            opacity: pressed ? 0.92 : 1,
          },
        ]}>
        <Avatar name={person.name} uri={person.photoUri} />
        <View style={styles.body}>
          <Text style={[styles.name, { color: colors.text }]}>{person.name}</Text>
          {person.relationship ? (
            <Text style={[styles.meta, { color: colors.textSecondary }]}>{person.relationship}</Text>
          ) : null}
          {info ? (
            <Text style={[styles.meta, { color: colors.textMuted }]}>🎂 {formatMonthDay(info.nextBirthday, true)}</Text>
          ) : null}
        </View>
        {info ? <BirthdayCountdown info={info} /> : null}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    borderWidth: 1,
    minHeight: 84,
    elevation: 2,
    shadowColor: '#2C2925',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  body: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontSize: 17,
    fontWeight: '700',
  },
  meta: {
    fontSize: 13,
  },
});
