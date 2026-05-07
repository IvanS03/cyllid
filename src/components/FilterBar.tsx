// src/components/FilterBar.tsx
// ─────────────────────────────────────────
// Barra de filtros — pills horizontales animadas
// Todo / Esta semana / Este mes / Mes pasado
// ─────────────────────────────────────────

import React from 'react';
import { ScrollView, TouchableOpacity, View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  FadeInDown,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../theme/useTheme';
import { COLORS, RADIUS, SPACING, SHADOWS } from '../theme';
import { Text } from './ui/Text';
import { useTranslation } from '../i18n/useTranslation';
import { FilterOption, FILTER_OPTIONS } from '../hooks/useExpenseFilter';

interface FilterBarProps {
  active: FilterOption;
  onChange: (filter: FilterOption) => void;
  /** Conteo de resultados del filtro activo */
  resultCount?: number;
}

// ── Pill individual ───────────────────────

function FilterPill({
  config,
  isActive,
  onPress,
}: {
  config: (typeof FILTER_OPTIONS)[number];
  isActive: boolean;
  onPress: () => void;
}) {
  const { colors, isDark } = useTheme();
  const { t } = useTranslation();
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    scale.value = withSpring(0.90, { damping: 10, stiffness: 350 }, () => {
      scale.value = withSpring(1, { damping: 10, stiffness: 300 });
    });
    Haptics.selectionAsync();
    onPress();
  };

  const activeBg   = COLORS.primary;
  const inactiveBg = isDark ? colors.surfaceAlt : colors.surface;

  return (
    <Animated.View style={animStyle}>
      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={0.85}
        style={[
          styles.pill,
          { backgroundColor: isActive ? activeBg : inactiveBg },
          isActive && SHADOWS.sm,
          !isActive && { borderWidth: 1, borderColor: colors.border },
        ]}
      >
        <Text style={styles.pillEmoji}>{config.emoji}</Text>
        <Text
          variant="label"
          style={{
            color: isActive ? COLORS.white : colors.textSecondary,
            fontFamily: isActive ? 'Nunito_700Bold' : 'Nunito_500Medium',
          }}
        >
          {t(config.labelKey)}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

// ── Componente principal ──────────────────

export function FilterBar({ active, onChange, resultCount }: FilterBarProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();

  return (
    <Animated.View
      entering={FadeInDown.delay(80).springify().damping(14)}
      style={styles.wrapper}
    >
      {/* Pills de filtro */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {FILTER_OPTIONS.map((opt) => (
          <FilterPill
            key={opt.key}
            config={opt}
            isActive={active === opt.key}
            onPress={() => onChange(opt.key)}
          />
        ))}
      </ScrollView>

      {/* Contador de resultados */}
      {resultCount !== undefined && (
        <View style={styles.countRow}>
          <View style={[styles.dot, { backgroundColor: COLORS.primary }]} />
          <Text variant="caption" secondary>
            {t('filters.showing')}{' '}
            <Text variant="caption" weight="bold" color={COLORS.primary}>
              {resultCount}
            </Text>{' '}
            {resultCount === 1
              ? t('home.expenses_count_one').replace('{count}', '')
              : t('home.expenses_count_other').replace('{count}', '')}
          </Text>
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: SPACING.xs,
  },
  scrollContent: {
    paddingHorizontal: SPACING.md,
    gap: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    gap: 5,
  },
  pillEmoji: {
    fontSize: 13,
    lineHeight: 17,
  },
  countRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    gap: SPACING.xs,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
});
