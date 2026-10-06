import { StyleSheet, Text, View } from 'react-native';

import { Radius } from '@/constants/theme';
import { useAppTheme } from '@/hooks/useTheme';
import { countdownLabel } from '@/lib/birthdays';
import type { BirthdayInfo } from '@/types/person';

type Props = {
  info: BirthdayInfo;
  size?: 'small' | 'large';
};

export function BirthdayCountdown({ info, size = 'small' }: Props) {
  const { colors } = useAppTheme();
  const label = countdownLabel(info);
  return (
    <View
      style={[
        styles.pill,
        {
          backgroundColor: info.isToday ? colors.todayTint : colors.primarySoft,
        },
      ]}>
      <Text
        style={[
          size === 'large' ? styles.large : styles.small,
          { color: info.isToday ? colors.text : colors.primary },
        ]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    borderRadius: Radius.full,
    paddingHorizontal: 10,
    paddingVertical: 6,
    alignSelf: 'flex-start',
  },
  small: {
    fontSize: 13,
    fontWeight: '700',
  },
  large: {
    fontSize: 16,
    fontWeight: '700',
  },
});
