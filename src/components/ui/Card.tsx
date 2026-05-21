// src/components/ui/Card.tsx
// ─────────────────────────────────────────
// Contenedor tipo tarjeta con sombra y tema
// Centrado y con ancho máximo en tablet
// ─────────────────────────────────────────

import React from 'react';
import { View, ViewProps, ViewStyle } from 'react-native';
import { RADIUS, SHADOWS, SPACING } from '../../theme';
import { useTheme } from '../../theme/useTheme';
import { CONTENT_MAX_W, isTablet } from '../../utils/responsive';

type CardVariant = 'default' | 'elevated' | 'flat' | 'primary';

interface CardProps extends ViewProps {
  variant?: CardVariant;
  padding?: number | 'none' | 'sm' | 'md' | 'lg';
  radius?: number;
  style?: ViewStyle;
}

const PADDING_MAP = {
  none: 0,
  sm: SPACING.sm,
  md: SPACING.md,
  lg: SPACING.lg,
};

export function Card({
  variant = 'default',
  padding = 'md',
  radius = RADIUS.xl,
  style,
  children,
  ...props
}: CardProps) {
  const { colors } = useTheme();

  const bg = variant === 'primary' ? colors.primarySurface : colors.surface;
  const shadow = variant === 'elevated' ? SHADOWS.md : variant === 'flat' ? {} : SHADOWS.sm;

  const paddingValue =
    typeof padding === 'number'
      ? padding
      : PADDING_MAP[padding as keyof typeof PADDING_MAP] ?? SPACING.md;

  return (
    <View
      style={[
        {
          backgroundColor: bg,
          borderRadius: radius,
          padding: paddingValue,
          borderWidth: variant === 'flat' ? 1 : 0,
          borderColor: colors.border,
          // Tablet: ancho máximo centrado
          ...(isTablet && {
            maxWidth: CONTENT_MAX_W,
            alignSelf: 'center' as const,
            width: '100%',
          }),
        },
        shadow,
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
}

export function Divider({ style }: { style?: ViewStyle }) {
  const { colors } = useTheme();
  return (
    <View
      style={[
        { height: 1, backgroundColor: colors.divider, marginVertical: SPACING.sm },
        style,
      ]}
    />
  );
}