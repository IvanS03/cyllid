// src/components/ui/Text.tsx
// ─────────────────────────────────────────
// Componente de texto base con variantes tipográficas
// Responsive: respeta densidad DPI y fontScale del sistema
// ─────────────────────────────────────────

import React from 'react';
import { Text as RNText, TextProps } from 'react-native';
import { useResponsive } from '../../hooks/useResponsive';
import { FONT_SIZE, FONT_WEIGHT } from '../../theme';
import { useTheme } from '../../theme/useTheme';

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

// Tamaños base de cada variante (los FONT_SIZE ya están escalados por responsive.ts)
const VARIANT_STYLES: Record<Variant, { fontSize: number; fontWeight: string; lineHeight: number }> = {
  display: { fontSize: FONT_SIZE.display, fontWeight: FONT_WEIGHT.extrabold, lineHeight: FONT_SIZE.display * 1.15 },
  h1: { fontSize: FONT_SIZE.xxxl, fontWeight: FONT_WEIGHT.bold, lineHeight: FONT_SIZE.xxxl * 1.2 },
  h2: { fontSize: FONT_SIZE.xxl, fontWeight: FONT_WEIGHT.bold, lineHeight: FONT_SIZE.xxl * 1.25 },
  h3: { fontSize: FONT_SIZE.xl, fontWeight: FONT_WEIGHT.semibold, lineHeight: FONT_SIZE.xl * 1.3 },
  body: { fontSize: FONT_SIZE.md, fontWeight: FONT_WEIGHT.regular, lineHeight: FONT_SIZE.md * 1.6 },
  bodySmall: { fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.regular, lineHeight: FONT_SIZE.sm * 1.5 },
  label: { fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.semibold, lineHeight: FONT_SIZE.sm * 1.4 },
  caption: { fontSize: FONT_SIZE.xs, fontWeight: FONT_WEIGHT.regular, lineHeight: FONT_SIZE.xs * 1.4 },
  mono: { fontSize: FONT_SIZE.md, fontWeight: FONT_WEIGHT.medium, lineHeight: FONT_SIZE.md * 1.5 },
};

function getFontFamily(fw: string, weight?: Weight, variant?: Variant): string {
  if (variant === 'mono') return 'monospace';
  const resolved = weight ? FONT_WEIGHT[weight] : fw;
  switch (resolved) {
    case FONT_WEIGHT.extrabold: return 'Nunito_800ExtraBold';
    case FONT_WEIGHT.bold: return 'Nunito_700Bold';
    case FONT_WEIGHT.semibold: return 'Nunito_600SemiBold';
    case FONT_WEIGHT.medium: return 'Nunito_500Medium';
    default: return 'Nunito_400Regular';
  }
}

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
  const { fontScale } = useResponsive();

  const variantStyle = VARIANT_STYLES[variant];
  const textColor = color ?? (muted ? colors.textMuted : secondary ? colors.textSecondary : colors.textPrimary);
  const fontFamily = getFontFamily(variantStyle.fontWeight, weight, variant);

  // Limitar el escalado de accesibilidad a 1.3× para no romper layouts
  // allowFontScaling=false lo desactivaría por completo; mejor limitarlo
  const cappedFontScale = Math.min(fontScale, 1.3);
  const safeFontSize = Math.round(variantStyle.fontSize / cappedFontScale);

  return (
    <RNText
      allowFontScaling
      maxFontSizeMultiplier={1.3}   // límite de accesibilidad en iOS/Android
      style={[
        {
          fontSize: variantStyle.fontSize,
          lineHeight: variantStyle.lineHeight,
          color: textColor,
          textAlign: align,
          fontFamily,
        },
        weight && { fontWeight: FONT_WEIGHT[weight] },
        style,
      ]}
      {...props}
    />
  );
}