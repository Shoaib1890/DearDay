import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { Avatar } from '@/components/Avatar';
import { BirthdayCountdown } from '@/components/BirthdayCountdown';
import { PrimaryButton } from '@/components/PrimaryButton';
import { Radius, Spacing } from '@/constants/theme';
import { useAppTheme } from '@/hooks/useTheme';
import type { BirthdayInfo } from '@/types/person';

type Props = {
  info: BirthdayInfo;
  onPress: () => void;
  onWish?: () => void;
  celebrate?: boolean;
};

export function BirthdayCard({ info, onPress, onWish, celebrate }: Props) {
  const { colors } = useAppTheme();
  const { person } = info;

  return (
    <Animated.View entering={FadeInDown.duration(320)}>
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`${person.name}'s birthday`}
        style={({ pressed }) => [
          styles.card,
          {
            backgroundColor: celebrate ? colors.todayTint : colors.surface,
            borderColor: colors.border,
            opacity: pressed ? 0.94 : 1,
          },
        ]}>
        {celebrate ? <Text style={styles.banner}>🎉 Today's Birthday</Text> : null}
        <View style={styles.row}>
          <Avatar name={person.name} uri={person.photoUri} size={64} />
          <View style={styles.body}>
            <Text style={[styles.name, { color: colors.text }]}>{person.name}</Text>
            <Text style={[styles.meta, { color: colors.textSecondary }]}>
              {celebrate ? `Turns ${info.nextAge} today` : `Birthday · Turns ${info.nextAge}`}
            </Text>
            <BirthdayCountdown info={info} />
          </View>
        </View>
        {celebrate && onWish ? <PrimaryButton label={`Wish ${person.name}`} onPress={onWish} /> : null}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: Spacing.lg,
    gap: Spacing.md,
    elevation: 2,
    shadowColor: '#2C2925',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  banner: {
    fontSize: 13,
    fontWeight: '700',
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.md,
    alignItems: 'center',
  },
  body: {
    flex: 1,
    gap: 6,
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
  },
  meta: {
    fontSize: 14,
  },
});
