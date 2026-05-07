// src/components/FAB.tsx
import * as Haptics from 'expo-haptics';
import { Plus } from 'lucide-react-native';
import React, { useEffect } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { useTranslation } from '../i18n/useTranslation';
import { COLORS, SHADOWS, SPACING } from '../theme';
import { Text } from './ui/Text';

interface FABProps {
  onPress: () => void;
  visible?: boolean;
}

export function FAB({ onPress, visible = true }: FABProps) {
  const { t } = useTranslation();
  const scale = useSharedValue(0);
  const pressScale = useSharedValue(1);

  useEffect(() => {
    scale.value = visible
      ? withDelay(200, withSpring(1, { damping: 12, stiffness: 200 }))
      : withTiming(0, { duration: 180 });
  }, [visible]);

  // Pulso suave de atención cada 6 s (si el usuario no ha interactuado)
  useEffect(() => {
    const id = setInterval(() => {
      pressScale.value = withSequence(
        withTiming(1.07, { duration: 160, easing: Easing.out(Easing.quad) }),
        withSpring(1, { damping: 8, stiffness: 200 })
      );
    }, 6000);
    return () => clearInterval(id);
  }, []);

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value * pressScale.value }],
  }));

  const handlePressIn = () => { pressScale.value = withSpring(0.93, { damping: 10, stiffness: 320 }); };
  const handlePressOut = () => { pressScale.value = withSpring(1, { damping: 8, stiffness: 260 }); };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  };

  return (
    <Animated.View style={[styles.container, containerStyle]}>
      <TouchableOpacity
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
        style={[styles.button, SHADOWS.fab]}
      >
        <Plus size={22} color={COLORS.white} strokeWidth={2.8} />
        <Text style={styles.label}>{t('home.add_expense')}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: SPACING.xl + 16,
    alignSelf: 'center',
    zIndex: 100,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    paddingVertical: 16,
    borderRadius: 100,
    backgroundColor: COLORS.primary,
    gap: SPACING.sm,
  },
  label: {
    fontSize: 17,
    fontFamily: 'Nunito_700Bold',
    color: COLORS.white,
  },
});
