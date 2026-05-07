// src/components/ui/Button.tsx
// ─────────────────────────────────────────
// Botón reutilizable con variantes y haptics
// ─────────────────────────────────────────

import React from 'react';
import {
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../theme/useTheme';
import { RADIUS, SPACING, SHADOWS, ANIMATION, FONT_SIZE, FONT_WEIGHT } from '../../theme';
import { Text } from './Text';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
type Size = 'sm' | 'md' | 'lg' | 'xl';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  style?: ViewStyle;
  haptic?: boolean;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

const SIZE_STYLES: Record<Size, { paddingVertical: number; paddingHorizontal: number; fontSize: number; borderRadius: number }> = {
  sm: { paddingVertical: 8,  paddingHorizontal: 16, fontSize: FONT_SIZE.sm, borderRadius: RADIUS.md },
  md: { paddingVertical: 12, paddingHorizontal: 20, fontSize: FONT_SIZE.md, borderRadius: RADIUS.lg },
  lg: { paddingVertical: 16, paddingHorizontal: 28, fontSize: FONT_SIZE.lg, borderRadius: RADIUS.lg },
  xl: { paddingVertical: 20, paddingHorizontal: 32, fontSize: FONT_SIZE.xl, borderRadius: RADIUS.xl },
};

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  style,
  haptic = true,
}: ButtonProps) {
  const { colors, isDark } = useTheme();
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const sizeStyle = SIZE_STYLES[size];

  const getVariantStyles = (): { bg: string; text: string; border?: string } => {
    switch (variant) {
      case 'primary':
        return { bg: colors.primary, text: colors.white };
      case 'secondary':
        return { bg: colors.primarySurface, text: colors.primary };
      case 'ghost':
        return { bg: 'transparent', text: colors.primary };
      case 'danger':
        return { bg: '#FEE2E2', text: '#DC2626' };
      case 'outline':
        return { bg: 'transparent', text: colors.primary, border: colors.primary };
      default:
        return { bg: colors.primary, text: colors.white };
    }
  };

  const variantStyle = getVariantStyles();

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.96, ANIMATION.spring);
    opacity.value = withTiming(0.9, { duration: ANIMATION.fast });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, ANIMATION.spring);
    opacity.value = withTiming(1, { duration: ANIMATION.fast });
  };

  const handlePress = () => {
    if (disabled || loading) return;
    if (haptic) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  const shadow = variant === 'primary' ? SHADOWS.md : {};

  return (
    <AnimatedTouchable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={1}
      disabled={disabled || loading}
      style={[
        styles.base,
        {
          backgroundColor: variantStyle.bg,
          borderRadius: sizeStyle.borderRadius,
          paddingVertical: sizeStyle.paddingVertical,
          paddingHorizontal: sizeStyle.paddingHorizontal,
          borderWidth: variantStyle.border ? 1.5 : 0,
          borderColor: variantStyle.border ?? 'transparent',
          alignSelf: fullWidth ? 'stretch' : 'center',
          opacity: disabled ? 0.5 : 1,
        },
        variant === 'primary' && shadow,
        animatedStyle,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variantStyle.text}
        />
      ) : (
        <View style={styles.content}>
          {icon && iconPosition === 'left' && (
            <View style={styles.iconLeft}>{icon}</View>
          )}
          <Text
            style={{
              fontSize: sizeStyle.fontSize,
              fontWeight: FONT_WEIGHT.semibold,
              color: variantStyle.text,
              fontFamily: 'Nunito_700Bold',
            }}
          >
            {label}
          </Text>
          {icon && iconPosition === 'right' && (
            <View style={styles.iconRight}>{icon}</View>
          )}
        </View>
      )}
    </AnimatedTouchable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 80,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconLeft: {
    marginRight: SPACING.sm,
  },
  iconRight: {
    marginLeft: SPACING.sm,
  },
});
