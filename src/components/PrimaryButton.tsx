import { Pressable, StyleSheet, Text } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import { useAppTheme } from '@/hooks/useTheme';

type Props = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
  accessibilityHint?: string;
};

export function PrimaryButton({
  label,
  onPress,
  disabled,
  variant = 'primary',
  accessibilityHint,
}: Props) {
  const { colors } = useAppTheme();
  const background =
    variant === 'danger' ? colors.danger : variant === 'secondary' ? colors.surfaceMuted : colors.primary;
  const textColor = variant === 'secondary' ? colors.text : '#FFFFFF';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: background, opacity: disabled ? 0.5 : pressed ? 0.85 : 1 },
      ]}>
      <Text style={[styles.label, { color: textColor }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 52,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
  },
});
