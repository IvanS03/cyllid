// src/components/ui/Text.tsx
// ─────────────────────────────────────────
// Componente de texto base con variantes tipográficas
// ─────────────────────────────────────────

import React from 'react';
import { Text as RNText, TextProps, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/useTheme';
import { FONT_SIZE, FONT_WEIGHT } from '../../theme';

type Variant =
  | 'display'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'body'
  | 'bodySmall'
  | 'label'
  | 'caption'
  | 'mono';

type Weight = 'regular' | 'medium' | 'semibold' | 'bold' | 'extrabold';
type Align = 'left' | 'center' | 'right';

interface ThemedTextProps extends TextProps {
  variant?: Variant;
  weight?: Weight;
  color?: string;
  align?: Align;
  muted?: boolean;
  secondary?: boolean;
}

const VARIANT_STYLES: Record<Variant, { fontSize: number; fontWeight: string; lineHeight: number }> = {
  display: { fontSize: FONT_SIZE.display, fontWeight: FONT_WEIGHT.extrabold, lineHeight: 56 },
  h1:      { fontSize: FONT_SIZE.xxxl,   fontWeight: FONT_WEIGHT.bold,      lineHeight: 44 },
  h2:      { fontSize: FONT_SIZE.xxl,    fontWeight: FONT_WEIGHT.bold,      lineHeight: 34 },
  h3:      { fontSize: FONT_SIZE.xl,     fontWeight: FONT_WEIGHT.semibold,  lineHeight: 28 },
  body:    { fontSize: FONT_SIZE.md,     fontWeight: FONT_WEIGHT.regular,   lineHeight: 24 },
  bodySmall: { fontSize: FONT_SIZE.sm,   fontWeight: FONT_WEIGHT.regular,   lineHeight: 20 },
  label:   { fontSize: FONT_SIZE.sm,     fontWeight: FONT_WEIGHT.semibold,  lineHeight: 18 },
  caption: { fontSize: FONT_SIZE.xs,     fontWeight: FONT_WEIGHT.regular,   lineHeight: 16 },
  mono:    { fontSize: FONT_SIZE.md,     fontWeight: FONT_WEIGHT.medium,    lineHeight: 24 },
};

export function Text({
  variant = 'body',
  weight,
  color,
  align,
  muted = false,
  secondary = false,
  style,
  ...props
}: ThemedTextProps) {
  const { colors } = useTheme();

  const variantStyle = VARIANT_STYLES[variant];

  const textColor = color
    ?? (muted ? colors.textMuted : secondary ? colors.textSecondary : colors.textPrimary);

  return (
    <RNText
      style={[
        variantStyle,
        {
          color: textColor,
          textAlign: align,
          fontFamily:
            variant === 'mono'
              ? 'monospace'
              : weight === 'extrabold' || variantStyle.fontWeight === FONT_WEIGHT.extrabold
              ? 'Nunito_800ExtraBold'
              : weight === 'bold' || variantStyle.fontWeight === FONT_WEIGHT.bold
              ? 'Nunito_700Bold'
              : weight === 'semibold' || variantStyle.fontWeight === FONT_WEIGHT.semibold
              ? 'Nunito_600SemiBold'
              : weight === 'medium' || variantStyle.fontWeight === FONT_WEIGHT.medium
              ? 'Nunito_500Medium'
              : 'Nunito_400Regular',
        },
        weight && { fontWeight: FONT_WEIGHT[weight] },
        style,
      ]}
      {...props}
    />
  );
}
