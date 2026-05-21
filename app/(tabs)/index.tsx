// app/(tabs)/index.tsx
// ─────────────────────────────────────────
// Pantalla principal
// ─────────────────────────────────────────

import { format } from 'date-fns';
import type { Href } from 'expo-router';
import { useRouter } from 'expo-router';
import { useCallback, useMemo } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useExpenseFilter } from '../../src/hooks/useExpenseFilter';
import { useMonthBalance } from '../../src/hooks/useMonthBalance';
import { useResponsive } from '../../src/hooks/useResponsive';
import { useTranslation } from '../../src/i18n/useTranslation';
import { ExpenseState, useExpenseStore } from '../../src/store/useExpenseStore';
import { COLORS, SPACING } from '../../src/theme';
import { useTheme } from '../../src/theme/useTheme';
import { Expense } from '../../src/types';
import { groupExpensesByDate } from '../../src/utils/helpers';

import { BalanceCard } from '../../src/components/BalanceCard';
import { BannerAd } from '../../src/components/BannerAd';
import { EmptyState } from '../../src/components/EmptyState';
import { DateSeparator, ExpenseItem } from '../../src/components/ExpenseItem';
import { FilterBar } from '../../src/components/FilterBar';
import { MonthSummaryCard } from '../../src/components/MonthSummaryCard';
import { SpeedDial } from '../../src/components/SpeedDial';
import { Text } from '../../src/components/ui/Text';

function getGreeting(t: (k: string) => string): string {
  const h = new Date().getHours();
  if (h < 12) return t('home.greeting_morning');
  if (h < 19) return t('home.greeting_afternoon');
  return t('home.greeting_evening');
}

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { contentPaddingH, isTablet } = useResponsive();

  const isLoading = useExpenseStore((s: ExpenseState) => s.isLoading);
  const initialize = useExpenseStore((s: ExpenseState) => s.initialize);

  const {
    activeFilter, setActiveFilter,
    filteredExpenses, summary,
  } = useExpenseFilter();

  // Balance del mes actual (independiente del filtro)
  const currentMonth = format(new Date(), 'yyyy-MM');
  const monthBalance = useMonthBalance(currentMonth);

  const grouped = useMemo(
    () => groupExpensesByDate(filteredExpenses.slice(0, 50)),
    [filteredExpenses]
  );

  const handleExpensePress = useCallback((expense: Expense) => {
    router.push(`/edit/${expense.id}` as Href);
  }, [router]);

  const handleAddExpense = useCallback(() => router.push('/add' as Href), [router]);
  const handleAddIncome = useCallback(() => router.push('/add-income' as Href), [router]);

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          {
            paddingTop: insets.top + SPACING.md,
            paddingBottom: 130,
            paddingHorizontal: contentPaddingH,
          },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={() => initialize()}
            tintColor={COLORS.primary} colors={[COLORS.primary]} />
        }
      >
        {/* ── Saludo ── */}
        <Animated.View
          entering={FadeInDown.springify().damping(14)}
          style={styles.header}
        >
          <Text variant="bodySmall" secondary>{getGreeting(t)}</Text>
          <Text variant="h2" weight="extrabold">{t('home.monthly_summary')}</Text>
        </Animated.View>

        {/* ── Balance mensual (ingresos - gastos) ── */}
        <BalanceCard
          balance={monthBalance}
          onAddIncome={handleAddIncome}
        />

        {/* ── Resumen de gastos del mes (responde al filtro) ── */}
        <Animated.View entering={FadeInDown.delay(50).springify().damping(14)}>
          <MonthSummaryCard summary={summary} />
        </Animated.View>

        {/* ── Filtros ── */}
        <FilterBar
          active={activeFilter}
          onChange={setActiveFilter}
          resultCount={filteredExpenses.length}
        />

        {/* ── Cabecera de sección ── */}
        <Animated.View
          entering={FadeInDown.delay(100).springify().damping(14)}
          style={styles.sectionHeader}
        >
          <Text variant="h3" weight="bold">{t('home.recent_expenses')}</Text>
        </Animated.View>

        {/* ── Estado vacío ── */}
        {filteredExpenses.length === 0 && (
          <EmptyState
            emoji="💸"
            title={t('home.no_expenses')}
            subtitle={t('home.no_expenses_sub')}
          />
        )}

        {/* ── Lista de gastos ── */}
        {grouped.map(({ label, date, items }) => (
          <View key={date} style={styles.group}>
            <DateSeparator label={label} />
            {items.map((expense, i) => (
              <ExpenseItem
                key={expense.id}
                expense={expense}
                index={i}
                onPress={handleExpensePress}
              />
            ))}
          </View>
        ))}
      </ScrollView>

      {/* ── Banner Ad ── */}
      <View style={[styles.adBar, { backgroundColor: colors.surface }]}>
        <BannerAd onUpgrade={() => router.push('/(tabs)/settings' as Href)} />
      </View>

      {/* ── SpeedDial: Gasto + Ingreso ── */}
      <SpeedDial
        onAddExpense={handleAddExpense}
        onAddIncome={handleAddIncome}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  scroll: { gap: SPACING.md },
  header: {
    paddingHorizontal: SPACING.md + SPACING.sm,
    gap: 2,
  },
  sectionHeader: {
    paddingHorizontal: SPACING.md + SPACING.sm,
    marginTop: SPACING.xs,
  },
  group: { paddingHorizontal: SPACING.md },
  adBar: { position: 'absolute', bottom: 0, left: 0, right: 0 },
});