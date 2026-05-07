// src/components/EmptyState.tsx
// ─────────────────────────────────────────
// Estado vacío — se muestra cuando no hay gastos
// ─────────────────────────────────────────

import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  FadeIn,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { useTheme } from '../theme/useTheme';
import { SPACING } from '../theme';
import { Text } from './ui/Text';

interface EmptyStateProps {
  title: string;
  subtitle?: string;
  emoji?: string;
}

export function EmptyState({
  title,
  subtitle,
  emoji = '💸',
}: EmptyStateProps) {
  const { colors } = useTheme();
  const floatAnim = useSharedValue(0);

  useEffect(() => {
    floatAnim.value = withRepeat(
      withSequence(
        withTiming(-8, { duration: 1800, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 1800, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      false
    );
  }, []);

  const emojiStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: floatAnim.value }],
  }));

  return (
    <Animated.View
      entering={FadeIn.delay(200).duration(400)}
      style={styles.container}
    >
      <Animated.Text style={[styles.emoji, emojiStyle]}>
        {emoji}
      </Animated.Text>

      <Text
        variant="h3"
        weight="bold"
        align="center"
        style={styles.title}
      >
        {title}
      </Text>

      {subtitle && (
        <Text
          variant="body"
          secondary
          align="center"
          style={styles.subtitle}
        >
          {subtitle}
        </Text>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xxxl,
    paddingHorizontal: SPACING.xl,
    gap: SPACING.sm,
  },
  emoji: {
    fontSize: 64,
    lineHeight: 80,
    marginBottom: SPACING.md,
  },
  title: {
    marginBottom: SPACING.xs,
  },
  subtitle: {
    maxWidth: 260,
    lineHeight: 22,
  },
});
