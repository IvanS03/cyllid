// src/components/BannerAd.tsx
// ─────────────────────────────────────────
// Componente de anuncio — placeholder listo para AdMob
// Se oculta automáticamente en versión Premium
// ─────────────────────────────────────────

import React from 'react';
import { View, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useTheme } from '../theme/useTheme';
import { useAppStore } from '../store/useAppStore';
import { Text } from './ui/Text';
import { SPACING, RADIUS, COLORS } from '../theme';
import { useTranslation } from '../i18n/useTranslation';

/*
 * INTEGRACIÓN REAL CON ADMOB:
 *
 * import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';
 * import { AD_UNIT_IDS } from '../utils/ads';
 *
 * const adUnitId = Platform.OS === 'ios'
 *   ? AD_UNIT_IDS.ios.banner
 *   : AD_UNIT_IDS.android.banner;
 *
 * return (
 *   <BannerAd
 *     unitId={__DEV__ ? TestIds.BANNER : adUnitId}
 *     size={BannerAdSize.BANNER}
 *     requestOptions={{ requestNonPersonalizedAdsOnly: true }}
 *   />
 * );
 */

interface BannerAdProps {
  onUpgrade?: () => void;
}

export function BannerAd({ onUpgrade }: BannerAdProps) {
  const { colors, isDark } = useTheme();
  const { isPremium } = useAppStore();
  const { t } = useTranslation();

  // No mostrar si es Premium
  if (isPremium) return null;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDark ? colors.surfaceAlt : colors.surface,
          borderColor: colors.border,
        },
      ]}
    >
      {/* Label "Anuncio" */}
      <Text
        variant="caption"
        muted
        style={styles.adLabel}
      >
        {t('ads.banner_label')}
      </Text>

      {/* Placeholder del banner (320x50 estándar AdMob) */}
      <View
        style={[
          styles.adPlaceholder,
          { backgroundColor: colors.divider },
        ]}
      >
        <Text variant="caption" muted align="center">
          📢 AdMob Banner 320×50
        </Text>
      </View>

      {/* Botón "Quitar anuncios" */}
      {onUpgrade && (
        <TouchableOpacity onPress={onUpgrade} style={styles.upgradeButton}>
          <Text
            variant="caption"
            color={COLORS.primary}
            weight="semibold"
          >
            ✨ {t('ads.remove_ads')}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderTopWidth: 1,
    gap: SPACING.xs,
  },
  adLabel: {
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontSize: 9,
  },
  adPlaceholder: {
    width: 320,
    height: 50,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  upgradeButton: {
    paddingVertical: 2,
    paddingHorizontal: SPACING.sm,
  },
});
