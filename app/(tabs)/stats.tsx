// app/(tabs)/stats.tsx — Estadísticas: Gastos / Ingresos / Balance
import { format, parseISO, subMonths } from 'date-fns';
import { enUS, es as esLocale } from 'date-fns/locale';
import type { Href } from 'expo-router';
import { useRouter } from 'expo-router';
import { ArrowUp, ChevronLeft, ChevronRight, Tag, TrendingUp } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BannerAd } from '../../src/components/BannerAd';
import { EmptyState } from '../../src/components/EmptyState';
import { IncomeItem } from '../../src/components/IncomeItem';
import { Card } from '../../src/components/ui/Card';
import { Text } from '../../src/components/ui/Text';
import { useMonthBalance } from '../../src/hooks/useMonthBalance';
import { useResponsive } from '../../src/hooks/useResponsive';
import { useTranslation } from '../../src/i18n/useTranslation';
import { AppState, useAppStore } from '../../src/store/useAppStore';
import { ExpenseState, useExpenseStore } from '../../src/store/useExpenseStore';
import { IncomeState, useIncomeStore } from '../../src/store/useIncomeStore';
import { CATEGORY_CONFIG, CategoryKey, COLORS, INCOME_SOURCE_CONFIG, IncomeSourceKey, RADIUS, SHADOWS, SPACING } from '../../src/theme';
import { useTheme } from '../../src/theme/useTheme';
import { Income } from '../../src/types';
import { formatCurrency } from '../../src/utils/helpers';

const W = Dimensions.get('window').width;
const BAR_MAX = W - SPACING.md * 4 - 80;

type Tab = 'expenses' | 'income' | 'balance';

// ── Selector de mes ───────────────────────
function MonthSelector({ month, onPrev, onNext, canGoNext }: {
  month: string; onPrev: () => void; onNext: () => void; canGoNext: boolean;
}) {
  const { language } = useTranslation();
  const locale = language === 'es' ? esLocale : enUS;
  const label = format(new Date(month + '-15'), "MMMM yyyy", { locale })
    .replace(/^\w/, (c) => c.toUpperCase());
  return (
    <View style={styles.monthSel}>
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

// ── Pestaña de segmento ───────────────────
function SegmentTab({ label, active, color, onPress }: {
  label: string; active: boolean; color: string; onPress: () => void;
}) {
  const { colors } = useTheme();
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={[
      styles.segTab,
      active ? { backgroundColor: color, ...SHADOWS.sm } : { backgroundColor: 'transparent' },
    ]}>
      <Text variant="label" weight={active ? 'bold' : 'regular'}
        color={active ? '#FFF' : colors.textSecondary}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

// ── Barra horizontal genérica ─────────────
function HorizBar({ label, amount, maxAmount, total, currency, color, index, t, keyStr }: {
  label: string; amount: number; maxAmount: number; total: number;
  currency: string; color: string; index: number; t: (k: string) => string; keyStr: string;
}) {
  const { colors } = useTheme();
  const pct = total > 0 ? Math.round((amount / total) * 100) : 0;
  const barW = maxAmount > 0 ? (amount / maxAmount) * BAR_MAX : 0;
  return (
    <Animated.View entering={FadeInRight.delay(index * 55).springify().damping(14)} style={{ gap: 6 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.sm }}>
        <Text variant="caption" weight="semibold" style={{ flex: 1 }}>{label}</Text>
      </View>
      <View style={[styles.barTrack, { backgroundColor: colors.divider }]}>
        <View style={[styles.barFill, { width: barW, backgroundColor: color }]} />
      </View>
      <View style={styles.barValue}>
        <Text variant="label" weight="bold" color={color}>{formatCurrency(amount, currency)}</Text>
        <Text variant="caption" muted>{pct}%</Text>
      </View>
    </Animated.View>
  );
}

// ── Gráfica de tendencia 6 meses ──────────
function TrendChart({ selectedMonth, currency }: { selectedMonth: string; currency: string }) {
  const { colors } = useTheme();
  const { t, language } = useTranslation();

  // ✅ Suscribir a DATOS crudos — garantiza re-render al agregar ingresos/gastos
  const expenses = useExpenseStore((s: ExpenseState) => s.expenses);
  const incomes = useIncomeStore((s: IncomeState) => s.incomes);

  const months = useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => {
      const d = subMonths(new Date(selectedMonth + '-15'), 5 - i);
      return format(d, 'yyyy-MM');
    });
  }, [selectedMonth]);

  const data = useMemo(() => months.map((m) => {
    const monthIncome = incomes
      .filter((i) => format(parseISO(i.date), 'yyyy-MM') === m)
      .reduce((sum, i) => sum + i.amount, 0);
    const monthExpenses = expenses
      .filter((e) => format(parseISO(e.date), 'yyyy-MM') === m)
      .reduce((sum, e) => sum + e.amount, 0);
    return {
      month: m,
      income: monthIncome,
      expenses: monthExpenses,
      label: format(new Date(m + '-15'), 'MMM', { locale: language === 'es' ? esLocale : enUS }),
    };
  }), [months, incomes, expenses, language]); // ✅ deps son datos, no funciones

  const maxVal = Math.max(...data.flatMap((d) => [d.income, d.expenses]), 1);
  const BAR_H = 100;

  return (
    <Animated.View entering={FadeInDown.delay(120).springify().damping(14)}>
      <Card padding="lg">
        <Text variant="h3" weight="bold" style={{ marginBottom: SPACING.lg }}>
          {t('balance.income_vs_expenses')}
        </Text>

        {/* Barras verticales */}
        <View style={styles.trendContainer}>
          {data.map((d, i) => {
            const incH = (d.income / maxVal) * BAR_H;
            const expH = (d.expenses / maxVal) * BAR_H;
            return (
              <View key={d.month} style={styles.trendCol}>
                {/* Barras apiladas lado a lado */}
                <View style={[styles.trendBars, { height: BAR_H }]}>
                  {/* Ingreso */}
                  <View style={{ justifyContent: 'flex-end', flex: 1 }}>
                    <View style={{
                      height: incH, backgroundColor: COLORS.success + 'CC',
                      borderRadius: 4, minHeight: d.income > 0 ? 4 : 0,
                    }} />
                  </View>
                  {/* Gasto */}
                  <View style={{ justifyContent: 'flex-end', flex: 1 }}>
                    <View style={{
                      height: expH, backgroundColor: COLORS.primary + 'CC',
                      borderRadius: 4, minHeight: d.expenses > 0 ? 4 : 0,
                    }} />
                  </View>
                </View>
                {/* Etiqueta del mes */}
                <Text variant="caption" muted align="center" style={styles.trendLabel}>
                  {d.label}
                </Text>
              </View>
            );
          })}
        </View>

        {/* Leyenda */}
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: COLORS.success }]} />
            <Text variant="caption" secondary>{t('income.title')}</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: COLORS.primary }]} />
            <Text variant="caption" secondary>{t('home.monthly_summary')}</Text>
          </View>
        </View>
      </Card>
    </Animated.View>
  );
}

// ── Pantalla principal ────────────────────
export default function StatsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { currency } = useAppStore((s: AppState) => s);
  const { contentPaddingH, metricCols, isTablet } = useResponsive();

  // ✅ Suscribir SOLO a datos crudos — funciones del store no disparan re-renders
  const expenses = useExpenseStore((s: ExpenseState) => s.expenses);
  const incomes = useIncomeStore((s: IncomeState) => s.incomes);

  const currentMonth = format(new Date(), 'yyyy-MM');
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [activeTab, setActiveTab] = useState<Tab>('expenses');

  const balance = useMonthBalance(selectedMonth);

  // ── Gastos del mes ──
  const monthExpenses = useMemo(() =>
    expenses.filter((e) => format(parseISO(e.date), 'yyyy-MM') === selectedMonth),
    [expenses, selectedMonth]);

  const summary = useMemo(() => {
    const byCategory = {} as Record<CategoryKey, number>;
    (Object.keys(CATEGORY_CONFIG) as CategoryKey[]).forEach((k) => { byCategory[k] = 0; });
    let total = 0;
    for (const e of monthExpenses) { total += e.amount; byCategory[e.category as CategoryKey] += e.amount; }
    return { total: Number(total.toFixed(2)), byCategory, count: monthExpenses.length, month: selectedMonth };
  }, [monthExpenses, selectedMonth]);

  const goToPrev = () => setSelectedMonth(format(subMonths(new Date(selectedMonth + '-15'), 1), 'yyyy-MM'));
  const goToNext = () => {
    const next = format(new Date(new Date(selectedMonth + '-15').setMonth(new Date(selectedMonth + '-15').getMonth() + 1)), 'yyyy-MM');
    if (next <= currentMonth) setSelectedMonth(next);
  };

  // Gastos derivados
  const activeCats = useMemo(() =>
    (Object.entries(summary.byCategory) as [CategoryKey, number][])
      .filter(([, v]) => v > 0).sort(([, a], [, b]) => b - a),
    [summary]);
  const maxCatAmt = activeCats[0]?.[1] ?? 0;
  const topCat = activeCats[0]?.[0];
  const daysInMonth = new Date(parseInt(selectedMonth.split('-')[0]), parseInt(selectedMonth.split('-')[1]), 0).getDate();
  const dailyAvg = summary.count > 0 ? summary.total / daysInMonth : 0;
  const maxExpense = useMemo(() =>
    monthExpenses.reduce((m: number, e) => e.amount > m ? e.amount : m, 0),
    [monthExpenses]);

  // ── Ingresos del mes (reactivo por raw array) ──
  const monthIncomes = useMemo(() =>
    incomes.filter((i) => format(parseISO(i.date), 'yyyy-MM') === selectedMonth),
    [incomes, selectedMonth]);

  const bySource = useMemo(() => {
    const result = {} as Record<IncomeSourceKey, number>;
    (Object.keys(INCOME_SOURCE_CONFIG) as IncomeSourceKey[]).forEach((k) => { result[k] = 0; });
    monthIncomes.forEach((i) => { result[i.source as IncomeSourceKey] += i.amount; });
    return result;
  }, [monthIncomes]);

  const activeSources = useMemo(() =>
    (Object.entries(bySource) as [IncomeSourceKey, number][])
      .filter(([, v]) => v > 0).sort(([, a], [, b]) => b - a),
    [bySource]);
  const maxSrcAmt = activeSources[0]?.[1] ?? 0;
  const totalIncomeMo = balance.totalIncome;

  const TAB_COLOR: Record<Tab, string> = {
    expenses: COLORS.primary,
    income: COLORS.success,
    balance: COLORS.info,
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={[styles.scroll,
      { paddingTop: insets.top + SPACING.md, paddingBottom: 100, paddingHorizontal: contentPaddingH }]}
        showsVerticalScrollIndicator={false}>

        {/* Título */}
        <Animated.View entering={FadeInDown.springify().damping(14)} style={styles.pageHeader}>
          <Text variant="h2" weight="extrabold">{t('stats.title')}</Text>
        </Animated.View>

        {/* Selector de mes */}
        <Animated.View entering={FadeInDown.delay(40).springify().damping(14)}>
          <Card padding="lg">
            <MonthSelector month={selectedMonth} onPrev={goToPrev}
              onNext={goToNext} canGoNext={selectedMonth < currentMonth} />
          </Card>
        </Animated.View>

        {/* Pestañas */}
        <Animated.View entering={FadeInDown.delay(60).springify().damping(14)}>
          <View style={[styles.segControl, { backgroundColor: colors.surfaceAlt }]}>
            <SegmentTab label={t('home.monthly_summary')} active={activeTab === 'expenses'}
              color={COLORS.primary} onPress={() => setActiveTab('expenses')} />
            <SegmentTab label={t('income.title')} active={activeTab === 'income'}
              color={COLORS.success} onPress={() => setActiveTab('income')} />
            <SegmentTab label={t('balance.title')} active={activeTab === 'balance'}
              color={COLORS.info} onPress={() => setActiveTab('balance')} />
          </View>
        </Animated.View>

        {/* ══════════ TAB: GASTOS ══════════ */}
        {activeTab === 'expenses' && (
          <>
            <Animated.View entering={FadeInDown.delay(80).springify().damping(14)}>
              <Card padding="lg">
                <Text variant="caption" secondary align="center">{t('stats.total_expenses')}</Text>
                <Text variant="display" weight="extrabold" color={COLORS.primary}
                  align="center" adjustsFontSizeToFit numberOfLines={1}>
                  {formatCurrency(summary.total, currency)}
                </Text>
                <Text variant="bodySmall" secondary align="center">{summary.count} {summary.count === 1 ? 'gasto' : 'gastos'}</Text>
              </Card>
            </Animated.View>

            {activeCats.length === 0 ? (
              <EmptyState emoji="📊" title={t('stats.no_data')} subtitle={t('stats.no_data_sub')} />
            ) : (
              <>
                {/* Métricas */}
                <View style={styles.metricsRow}>
                  {[
                    { icon: <TrendingUp size={22} color={COLORS.primary} strokeWidth={2} />, label: t('stats.daily_average'), value: formatCurrency(dailyAvg, currency) },
                    { icon: <ArrowUp size={22} color={COLORS.success} strokeWidth={2} />, label: t('stats.biggest_expense'), value: formatCurrency(maxExpense, currency) },
                    { icon: <Tag size={22} color={topCat ? CATEGORY_CONFIG[topCat].color : COLORS.primary} strokeWidth={2} />, label: t('stats.most_used_category'), value: topCat ? t(`categories.${topCat}`) : '—' },
                  ].map((m, i) => (
                    <Animated.View key={i} entering={FadeInDown.delay(i * 60).springify().damping(14)}
                      style={[styles.metricCard, { backgroundColor: colors.surface }, SHADOWS.sm]}>
                      {m.icon}
                      <Text variant="caption" secondary align="center">{m.label}</Text>
                      <Text variant="label" weight="bold" align="center" numberOfLines={1} adjustsFontSizeToFit>{m.value}</Text>
                    </Animated.View>
                  ))}
                </View>

                {/* Barras por categoría */}
                <Animated.View entering={FadeInDown.delay(100).springify().damping(14)}>
                  <Card padding="lg">
                    <Text variant="h3" weight="bold" style={{ marginBottom: SPACING.md }}>{t('stats.by_category')}</Text>
                    <View style={{ gap: SPACING.md }}>
                      {activeCats.map(([cat, amt], i) => (
                        <HorizBar key={cat} label={t(`categories.${cat}`)} amount={amt}
                          maxAmount={maxCatAmt} total={summary.total} currency={currency}
                          color={CATEGORY_CONFIG[cat].color} index={i} t={t} keyStr={cat} />
                      ))}
                    </View>
                  </Card>
                </Animated.View>
              </>
            )}
          </>
        )}

        {/* ══════════ TAB: INGRESOS ══════════ */}
        {activeTab === 'income' && (
          <>
            <Animated.View entering={FadeInDown.delay(80).springify().damping(14)}>
              <Card padding="lg">
                <Text variant="caption" secondary align="center">{t('income.total_income')}</Text>
                <Text variant="display" weight="extrabold" color={COLORS.success}
                  align="center" adjustsFontSizeToFit numberOfLines={1}>
                  {formatCurrency(totalIncomeMo, currency)}
                </Text>
                <Text variant="bodySmall" secondary align="center">
                  {monthIncomes.length} {monthIncomes.length === 1 ? 'ingreso' : 'ingresos'}
                </Text>
              </Card>
            </Animated.View>

            {activeSources.length === 0 ? (
              <EmptyState emoji="💰" title={t('income.no_incomes')} subtitle={t('income.no_incomes_sub')} />
            ) : (
              <>
                {/* Barras por fuente */}
                <Animated.View entering={FadeInDown.delay(100).springify().damping(14)}>
                  <Card padding="lg">
                    <Text variant="h3" weight="bold" style={{ marginBottom: SPACING.md }}>{t('income.source_label')}</Text>
                    <View style={{ gap: SPACING.md }}>
                      {activeSources.map(([src, amt], i) => (
                        <HorizBar key={src} label={t(`sources.${src}`)} amount={amt}
                          maxAmount={maxSrcAmt} total={totalIncomeMo} currency={currency}
                          color={INCOME_SOURCE_CONFIG[src].color} index={i} t={t} keyStr={src} />
                      ))}
                    </View>
                  </Card>
                </Animated.View>

                {/* Lista de ingresos del mes */}
                <Animated.View entering={FadeInDown.delay(140).springify().damping(14)}>
                  <Card padding="md">
                    <Text variant="h3" weight="bold" style={{ marginBottom: SPACING.sm }}>
                      {t('income.recent_incomes')}
                    </Text>
                    {monthIncomes.slice(0, 10).map((inc: Income, i) => (
                      <IncomeItem key={inc.id} income={inc} index={i}
                        onPress={(item) => router.push(`/edit-income/${item.id}` as Href)} />
                    ))}
                  </Card>
                </Animated.View>
              </>
            )}
          </>
        )}

        {/* ══════════ TAB: BALANCE ══════════ */}
        {activeTab === 'balance' && (
          <>
            {/* Resumen balance */}
            <Animated.View entering={FadeInDown.delay(80).springify().damping(14)}>
              <Card padding="lg" style={{ gap: SPACING.md }}>
                <Text variant="caption" secondary align="center">{t('balance.available')}</Text>
                <Text variant="display" weight="extrabold" align="center" adjustsFontSizeToFit numberOfLines={1}
                  color={balance.balance > 0 ? COLORS.success : balance.balance < 0 ? COLORS.error : colors.textSecondary}>
                  {balance.balance >= 0 ? '+' : ''}{formatCurrency(balance.balance, currency)}
                </Text>

                {/* Fila ingresos vs gastos */}
                <View style={styles.balanceRow}>
                  <View style={styles.balanceCol}>
                    <Text variant="caption" secondary align="center">{t('income.total_income')}</Text>
                    <Text variant="h3" weight="bold" color={COLORS.success} align="center">
                      {formatCurrency(balance.totalIncome, currency)}
                    </Text>
                  </View>
                  <View style={[styles.balanceSep, { backgroundColor: colors.divider }]} />
                  <View style={styles.balanceCol}>
                    <Text variant="caption" secondary align="center">{t('home.spent_this_month')}</Text>
                    <Text variant="h3" weight="bold" color={COLORS.error} align="center">
                      {formatCurrency(balance.totalExpenses, currency)}
                    </Text>
                  </View>
                </View>

                {/* Tasa de ahorro */}
                {balance.totalIncome > 0 && (
                  <View style={[styles.savingsRow, { backgroundColor: colors.surfaceAlt }]}>
                    <Text variant="label" secondary>{t('balance.savings_rate')}</Text>
                    <Text variant="label" weight="bold"
                      color={balance.balance >= 0 ? COLORS.success : COLORS.error}>
                      {Math.round((balance.balance / balance.totalIncome) * 100)}%
                    </Text>
                  </View>
                )}
              </Card>
            </Animated.View>

            {/* Gráfica de tendencia 6 meses */}
            <TrendChart selectedMonth={selectedMonth} currency={currency} />

            {(balance.totalIncome === 0 && balance.totalExpenses === 0) && (
              <EmptyState emoji="⚖️" title={t('balance.title')} subtitle={t('income.no_incomes_sub')} />
            )}
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
  monthSel: { flexDirection: 'row', alignItems: 'center' },
  arrowBtn: { padding: SPACING.sm },

  // Segmentos
  segControl: { flexDirection: 'row', borderRadius: RADIUS.xl, padding: 4, gap: 4 },
  segTab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: RADIUS.lg },

  // Métricas
  metricsRow: { flexDirection: 'row', gap: SPACING.sm },
  metricCard: { flex: 1, borderRadius: RADIUS.xl, padding: SPACING.md, alignItems: 'center', gap: SPACING.xs },

  // Barras
  barTrack: { height: 10, borderRadius: RADIUS.full, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: RADIUS.full, minWidth: 4 },
  barValue: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },

  // Balance
  balanceRow: { flexDirection: 'row', alignItems: 'center' },
  balanceCol: { flex: 1, gap: 4 },
  balanceSep: { width: 1, height: 40, marginHorizontal: SPACING.md },
  savingsRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: SPACING.md, borderRadius: RADIUS.lg
  },

  // Tendencia
  trendContainer: { flexDirection: 'row', alignItems: 'flex-end', gap: 4 },
  trendCol: { flex: 1, alignItems: 'center', gap: 4 },
  trendBars: { flexDirection: 'row', gap: 2, width: '100%' },
  trendLabel: { fontSize: 9 },
  legend: { flexDirection: 'row', gap: SPACING.lg, marginTop: SPACING.md, justifyContent: 'center' },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs },
  legendDot: { width: 10, height: 10, borderRadius: 5 },

  adBar: { position: 'absolute', bottom: 0, left: 0, right: 0 },
});