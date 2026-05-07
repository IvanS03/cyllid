// src/components/MonthSummaryCard.tsx
// ─────────────────────────────────────────
// Tarjeta de resumen mensual — hero de la home
// Muestra total + barra de categorías
// ─────────────────────────────────────────

import React from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../theme/useTheme';
import { useAppStore } from '../store/useAppStore';
import { CATEGORY_CONFIG, CategoryKey, SPACING, RADIUS, COLORS } from '../theme';
import { Text } from './ui/Text';
import { MonthSummary } from '../types';
import { formatCurrency, formatMonth } from '../utils/helpers';
import { useTranslation } from '../i18n/useTranslation';

interface MonthSummaryCardProps {
  summary: MonthSummary;
}

export function MonthSummaryCard({ summary }: MonthSummaryCardProps) {
  const { isDark } = useTheme();
  const { currency } = useAppStore();
  const { t, tp } = useTranslation();

  const gradientColors: [string, string, string] = isDark
    ? ['#4a0d8f', '#7119c3', '#9b4de0']
    : ['#7119c3', '#9b4de0', '#b87cee'];

  // Categorías con gasto > 0, ordenadas de mayor a menor
  const activeCategories = (Object.entries(summary.byCategory) as [CategoryKey, number][])
    .filter(([, amount]) => amount > 0)
    .sort(([, a], [, b]) => b - a);

  return (
    <Animated.View entering={FadeInDown.springify().damping(14)}>
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        {/* Decoración de fondo */}
        <View style={styles.decorCircle1} />
        <View style={styles.decorCircle2} />

        {/* Mes */}
        <Text
          variant="label"
          color="rgba(255,255,255,0.75)"
          style={styles.monthLabel}
        >
          {formatMonth(summary.month).toUpperCase()}
        </Text>

        {/* Total */}
        <Text
          variant="display"
          color={COLORS.white}
          weight="extrabold"
          style={styles.total}
          numberOfLines={1}
          adjustsFontSizeToFit
        >
          {formatCurrency(summary.total, currency)}
        </Text>

        {/* Conteo */}
        <Text variant="bodySmall" color="rgba(255,255,255,0.75)">
          {tp('home.expenses_count', summary.count)}
        </Text>

        {/* Barra de categorías */}
        {summary.total > 0 && (
          <View style={styles.barSection}>
            <CategoryBar
              byCategory={summary.byCategory}
              total={summary.total}
            />

            {/* Leyenda de top categorías */}
            <View style={styles.legend}>
              {activeCategories.slice(0, 3).map(([cat, amount]) => (
                <LegendItem
                  key={cat}
                  category={cat}
                  amount={amount}
                  total={summary.total}
                  currency={currency}
                  label={t(`categories.${cat}`)}
                />
              ))}
            </View>
          </View>
        )}
      </LinearGradient>
    </Animated.View>
  );
}

// ── Barra de categorías ───────────────────

function CategoryBar({
  byCategory,
  total,
}: {
  byCategory: Record<CategoryKey, number>;
  total: number;
}) {
  const entries = (Object.entries(byCategory) as [CategoryKey, number][])
    .filter(([, v]) => v > 0)
    .sort(([, a], [, b]) => b - a);

  return (
    <View style={styles.barContainer}>
      {entries.map(([cat, amount], i) => {
        const width = (amount / total) * 100;
        const config = CATEGORY_CONFIG[cat];
        return (
          <View
            key={cat}
            style={[
              styles.barSegment,
              {
                width: `${width}%`,
                backgroundColor: config.color,
                borderRadius:
                  i === 0
                    ? 6
                    : i === entries.length - 1
                    ? 6
                    : 0,
              },
            ]}
          />
        );
      })}
    </View>
  );
}

// ── Item de leyenda ───────────────────────

function LegendItem({
  category,
  amount,
  total,
  currency,
  label,
}: {
  category: CategoryKey;
  amount: number;
  total: number;
  currency: string;
  label: string;
}) {
  const config = CATEGORY_CONFIG[category];
  const pct = Math.round((amount / total) * 100);

  return (
    <View style={styles.legendItem}>
      <Text style={{ fontSize: 14 }}>{config.emoji}</Text>
      <View style={{ flex: 1 }}>
        <Text variant="caption" color="rgba(255,255,255,0.9)" weight="semibold">
          {label}
        </Text>
      </View>
      <Text variant="caption" color="rgba(255,255,255,0.75)">
        {pct}%
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    overflow: 'hidden',
    marginHorizontal: SPACING.md,
  },
  decorCircle1: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(255,255,255,0.06)',
    top: -60,
    right: -40,
  },
  decorCircle2: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.04)',
    bottom: -20,
    left: 20,
  },
  monthLabel: {
    letterSpacing: 1.5,
    marginBottom: SPACING.xs,
  },
  total: {
    marginBottom: SPACING.xs,
    lineHeight: 52,
  },
  barSection: {
    marginTop: SPACING.md,
    gap: SPACING.sm,
  },
  barContainer: {
    flexDirection: 'row',
    height: 8,
    borderRadius: 6,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.15)',
    gap: 2,
  },
  barSegment: {
    height: '100%',
  },
  legend: {
    gap: 4,
    marginTop: SPACING.xs,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
});
