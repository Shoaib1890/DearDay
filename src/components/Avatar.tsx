import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '@/hooks/useTheme';

type AvatarProps = {
  name: string;
  uri?: string;
  size?: number;
};

function initialsFor(name: string): string {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((part) => part[0]?.toUpperCase() ?? '').join('') || '?';
}

export function Avatar({ name, uri, size = 52 }: AvatarProps) {
  const { colors } = useAppTheme();
  const radius = size / 2;

  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={{ width: size, height: size, borderRadius: radius }}
        accessibilityLabel={`${name} photo`}
      />
    );
  }

  return (
    <View
      accessible
      accessibilityLabel={`${name} avatar`}
      style={[
        styles.fallback,
        {
          width: size,
          height: size,
          borderRadius: radius,
          backgroundColor: colors.primarySoft,
        },
      ]}>
      <Text style={[styles.initials, { color: colors.primary, fontSize: size * 0.34 }]}>
        {initialsFor(name)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  fallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    fontWeight: '700',
  },
});
