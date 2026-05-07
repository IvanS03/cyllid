// app/(tabs)/stats.tsx
// ─────────────────────────────────────────
// Pantalla de Estadísticas
// ─────────────────────────────────────────

import { addMonths, format, subMonths } from 'date-fns';
import { enUS, es as esLocale } from 'date-fns/locale';
import { useMemo, useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ArrowUp, ChevronLeft, ChevronRight, Tag, TrendingUp } from 'lucide-react-native';
import { BannerAd } from '../../src/components/BannerAd';
import { EmptyState } from '../../src/components/EmptyState';
import { Card } from '../../src/components/ui/Card';
import { Text } from '../../src/components/ui/Text';
import { useTranslation } from '../../src/i18n/useTranslation';
import { AppState, useAppStore } from '../../src/store/useAppStore';
import { ExpenseState, useExpenseStore } from '../../src/store/useExpenseStore';
import { CATEGORY_CONFIG, CategoryKey, COLORS, RADIUS, SHADOWS, SPACING } from '../../src/theme';
import { useTheme } from '../../src/theme/useTheme';
import { MonthSummary } from '../../src/types';
import { formatCurrency } from '../../src/utils/helpers';

const SCREEN_WIDTH = Dimensions.get('window').width;
const BAR_MAX = SCREEN_WIDTH - SPACING.md * 4 - 80;

function MonthSelector({ month, onPrev, onNext, canGoNext }: {
  month: string; onPrev: () => void; onNext: () => void; canGoNext: boolean;
}) {
  const { colors, isDark } = useTheme();
  const { language } = useTranslation();
  const locale = language === 'es' ? esLocale : enUS;
  const label = format(new Date(month + '-15'), "MMMM yyyy", { locale })
    .replace(/^\w/, (c) => c.toUpperCase());
  return (
    <View style={styles.monthSelector}>
      <TouchableOpacity onPress={onPrev} hitSlop={16} style={styles.arrowBtn}>
        <ChevronLeft size={24} color={COLORS.primary} strokeWidth={2} />
      </TouchableOpacity>
      <Text variant="h3" weight="bold" align="center" style={{ flex: 1 }}>{label}</Text>
      <TouchableOpacity onPress={onNext} disabled={!canGoNext} hitSlop={16}
        style={[styles.arrowBtn, !canGoNext && { opacity: 0.25 }]}>
        <ChevronRight size={24} color={COLORS.primary} strokeWidth={2} />
      </TouchableOpacity>
    </View>
  );
}

// MetricCard recibe un ReactNode como icono para mayor flexibilidad
function MetricCard({ icon, label, value, index }: {
  icon: React.ReactNode; label: string; value: string; index: number;
}) {
  const { colors } = useTheme();
  return (
    <Animated.View entering={FadeInDown.delay(index * 60).springify().damping(14)}
      style={[styles.metricCard, { backgroundColor: colors.surface }, SHADOWS.sm]}>
      {icon}
      <Text variant="caption" secondary align="center">{label}</Text>
      <Text variant="label" weight="bold" align="center" numberOfLines={1} adjustsFontSizeToFit>{value}</Text>
    </Animated.View>
  );
}

function CatBar({ category, amount, maxAmount, total, currency, index, t }: {
  category: CategoryKey; amount: number; maxAmount: number;
  total: number; currency: string; index: number; t: (k: string) => string;
}) {
  const { colors } = useTheme();
  const config = CATEGORY_CONFIG[category];
  const pct = Math.round((amount / total) * 100);
  const barW = maxAmount > 0 ? (amount / maxAmount) * BAR_MAX : 0;
  return (
    <Animated.View entering={FadeInRight.delay(index * 55).springify().damping(14)} style={styles.barRow}>
      <View style={styles.barLabel}>
        <Text style={{ fontSize: 15 }}>{config.emoji}</Text>
        <Text variant="caption" weight="semibold" style={{ flex: 1 }} numberOfLines={1}>
          {t(`categories.${category}`)}
        </Text>
      </View>
      <View style={[styles.barTrack, { backgroundColor: colors.divider }]}>
        <View style={[styles.barFill, { width: barW, backgroundColor: config.color }]} />
      </View>
      <View style={styles.barValue}>
        <Text variant="label" weight="bold" color={config.color} numberOfLines={1}>
          {formatCurrency(amount, currency)}
        </Text>
        <Text variant="caption" muted>{pct}%</Text>
      </View>
    </Animated.View>
  );
}

export default function StatsScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { currency } = useAppStore((s: AppState) => s);

  const getMonthSummary = useExpenseStore((s: ExpenseState) => s.getMonthSummary);
  const expenses = useExpenseStore((s: ExpenseState) => s.expenses);

  const currentMonth = format(new Date(), 'yyyy-MM');
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);

  const summary: MonthSummary = useMemo(
    () => getMonthSummary(selectedMonth), [selectedMonth, expenses]
  );

  const goToPrev = () => setSelectedMonth(
    format(subMonths(new Date(selectedMonth + '-15'), 1), 'yyyy-MM')
  );
  const goToNext = () => {
    const next = format(addMonths(new Date(selectedMonth + '-15'), 1), 'yyyy-MM');
    if (next <= currentMonth) setSelectedMonth(next);
  };

  const activeCats = useMemo(
    () => (Object.entries(summary.byCategory) as [CategoryKey, number][])
      .filter(([, v]) => v > 0).sort(([, a], [, b]) => b - a),
    [summary]
  );

  const maxCatAmt = activeCats[0]?.[1] ?? 0;
  const topCat = activeCats[0]?.[0];
  const daysInMonth = new Date(
    parseInt(selectedMonth.split('-')[0]),
    parseInt(selectedMonth.split('-')[1]), 0
  ).getDate();
  const dailyAvg = summary.count > 0 ? summary.total / daysInMonth : 0;
  const maxExpense = useMemo(() =>
    expenses
      .filter((e) => format(new Date(e.date), 'yyyy-MM') === selectedMonth)
      .reduce((m: number, e) => (e.amount > m ? e.amount : m), 0),
    [selectedMonth, expenses]
  );

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={[styles.scroll,
        { paddingTop: insets.top + SPACING.md, paddingBottom: 100 }]}
        showsVerticalScrollIndicator={false}>

        <Animated.View entering={FadeInDown.springify().damping(14)} style={styles.pageHeader}>
          <Text variant="h2" weight="extrabold">{t('stats.title')}</Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(40).springify().damping(14)}>
          <Card padding="lg">
            <MonthSelector month={selectedMonth} onPrev={goToPrev}
              onNext={goToNext} canGoNext={selectedMonth < currentMonth} />
            <View style={{ paddingTop: SPACING.md, gap: 4 }}>
              <Text variant="caption" secondary align="center">{t('stats.total_expenses')}</Text>
              <Text variant="display" weight="extrabold" color={COLORS.primary}
                align="center" adjustsFontSizeToFit numberOfLines={1}>
                {formatCurrency(summary.total, currency)}
              </Text>
              <Text variant="bodySmall" secondary align="center">
                {summary.count} {summary.count === 1 ? t('home.expenses_count_one').replace('{count}', '') : t('home.expenses_count_other').replace('{count}', '')}
              </Text>
            </View>
          </Card>
        </Animated.View>

        {activeCats.length === 0 ? (
          <EmptyState emoji="📊" title={t('stats.no_data')} subtitle={t('stats.no_data_sub')} />
        ) : (
          <>
            <View style={styles.metricsRow}>
              <MetricCard
                icon={<TrendingUp size={22} color={COLORS.primary} strokeWidth={2} />}
                label={t('stats.daily_average')}
                value={formatCurrency(dailyAvg, currency)} index={0} />
              <MetricCard
                icon={<ArrowUp size={22} color={COLORS.success} strokeWidth={2} />}
                label={t('stats.biggest_expense')}
                value={formatCurrency(maxExpense, currency)} index={1} />
              <MetricCard
                icon={<Tag size={22} color={topCat ? CATEGORY_CONFIG[topCat].color : COLORS.primary} strokeWidth={2} />}
                label={t('stats.most_used_category')}
                value={topCat ? t(`categories.${topCat}`) : '—'} index={2} />
            </View>

            <Animated.View entering={FadeInDown.delay(100).springify().damping(14)}>
              <Card padding="lg">
                <Text variant="h3" weight="bold" style={{ marginBottom: SPACING.md }}>
                  {t('stats.by_category')}
                </Text>
                <View style={{ gap: SPACING.md }}>
                  {activeCats.map(([cat, amt], i) => (
                    <CatBar key={cat} category={cat} amount={amt} maxAmount={maxCatAmt}
                      total={summary.total} currency={currency} index={i} t={t} />
                  ))}
                </View>
              </Card>
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(160).springify().damping(14)}>
              <Card padding="lg">
                <Text variant="h3" weight="bold" style={{ marginBottom: SPACING.md }}>
                  {t('stats.by_category')} —
                </Text>
                <View style={styles.bubblesRow}>
                  {activeCats.map(([cat, amt]) => {
                    const cfg = CATEGORY_CONFIG[cat];
                    const pct = (amt / summary.total) * 100;
                    const sz = Math.min(44 + pct * 1.1, 100);
                    return (
                      <View key={cat} style={{ alignItems: 'center', gap: 4 }}>
                        <View style={[styles.bubble, {
                          width: sz, height: sz, borderRadius: sz,
                          backgroundColor: cfg.color + '20', borderColor: cfg.color,
                        }]}>
                          <Text style={{ fontSize: Math.min(sz * 0.38, 34) }}>{cfg.emoji}</Text>
                        </View>
                        <Text variant="caption" align="center" weight="semibold">
                          {Math.round(pct)}%
                        </Text>
                      </View>
                    );
                  })}
                </View>
              </Card>
            </Animated.View>
          </>
        )}
      </ScrollView>

      <View style={[styles.adBar, { backgroundColor: colors.surface }]}>
        <BannerAd />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  scroll: { gap: SPACING.md, paddingHorizontal: SPACING.md },
  pageHeader: { paddingHorizontal: SPACING.xs, marginBottom: SPACING.xs },
  monthSelector: { flexDirection: 'row', alignItems: 'center' },
  arrowBtn: { padding: SPACING.sm },
  metricsRow: { flexDirection: 'row', gap: SPACING.sm },
  metricCard: { flex: 1, borderRadius: RADIUS.xl, padding: SPACING.md, alignItems: 'center', gap: SPACING.xs },
  barRow: { gap: 6 },
  barLabel: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  barTrack: { height: 10, borderRadius: RADIUS.full, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: RADIUS.full, minWidth: 4 },
  barValue: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  bubblesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.md, justifyContent: 'center' },
  bubble: { alignItems: 'center', justifyContent: 'center', borderWidth: 2 },
  adBar: { position: 'absolute', bottom: 0, left: 0, right: 0 },
});
