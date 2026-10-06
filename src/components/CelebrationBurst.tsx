import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeOut, useAnimatedStyle, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';

type Props = {
  visible: boolean;
};

const PIECES = ['🎉', '🎂', '✨', '🎈', '💛'];

export function CelebrationBurst({ visible }: Props) {
  if (!visible) return null;
  return (
    <View pointerEvents="none" style={styles.wrap} accessibilityElementsHidden>
      {PIECES.map((piece, index) => (
        <FloatingPiece key={piece + index} emoji={piece} index={index} />
      ))}
    </View>
  );
}

function FloatingPiece({ emoji, index }: { emoji: string; index: number }) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(12);

  useEffect(() => {
    opacity.value = withDelay(index * 80, withTiming(1, { duration: 280 }));
    translateY.value = withDelay(index * 80, withTiming(-8, { duration: 900 }));
    const hide = setTimeout(() => {
      opacity.value = withTiming(0, { duration: 400 });
    }, 2200);
    return () => clearTimeout(hide);
  }, [index, opacity, translateY]);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View exiting={FadeOut} style={[styles.piece, { left: 18 + index * 58 }, style]}>
      <Text style={styles.emoji}>{emoji}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    height: 36,
    marginBottom: 8,
  },
  piece: {
    position: 'absolute',
    top: 0,
  },
  emoji: {
    fontSize: 22,
  },
});
