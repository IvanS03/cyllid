// src/components/FAB.tsx
// ─────────────────────────────────────────
// Botón flotante de acción único
// Responsive: tamaño y posición adaptativos
// ─────────────────────────────────────────

import * as Haptics from 'expo-haptics';
import { Plus } from 'lucide-react-native';
import React, { useEffect } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay, withSequence,
  withSpring, withTiming,
} from 'react-native-reanimated';

import { useResponsive } from '../hooks/useResponsive';
import { useTranslation } from '../i18n/useTranslation';
import { COLORS, SHADOWS, SPACING } from '../theme';
import { Text } from './ui/Text';

interface FABProps {
  onPress: () => void;
  visible?: boolean;
}

export function FAB({ onPress, visible = true }: FABProps) {
  const { t } = useTranslation();
  const { isTablet, contentPaddingH } = useResponsive();

  // Tamaños adaptativos
  const iconSize = isTablet ? 24 : 22;
  const fontSize = isTablet ? 19 : 17;
  const paddingH = isTablet ? 36 : 28;
  const paddingV = isTablet ? 18 : 16;
  const bottomOffset = SPACING.xl + 16;

  const scale = useSharedValue(0);
  const pressScale = useSharedValue(1);

  // Entrada
  useEffect(() => {
    scale.value = visible
      ? withDelay(200, withSpring(1, { damping: 12, stiffness: 200 }))
      : withTiming(0, { duration: 180 });
  }, [visible]);

  // Pulso de atención
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
    <Animated.View
      style={[
        styles.container,
        { bottom: bottomOffset },
        containerStyle,
      ]}
    >
      <TouchableOpacity
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
        style={[
          styles.button,
          {
            paddingHorizontal: paddingH,
            paddingVertical: paddingV,
          },
          SHADOWS.fab,
        ]}
      >
        <Plus size={iconSize} color={COLORS.white} strokeWidth={2.8} />
        <Text
          style={{
            fontSize,
            fontFamily: 'Nunito_700Bold',
            color: COLORS.white,
          }}
        >
          {t('home.add_expense')}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    alignSelf: 'center',
    zIndex: 100,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 100,
    backgroundColor: COLORS.primary,
    gap: SPACING.sm,
  },
});