// app/(tabs)/index.tsx
// ─────────────────────────────────────────
// Pantalla principal
// • BalanceCard (ingresos - gastos)
// • FilterBar
// • Transacciones recientes (gastos + ingresos mezclados por fecha)
// ─────────────────────────────────────────

import { format } from 'date-fns';
import type { Href } from 'expo-router';
import { useRouter } from 'expo-router';
import { useCallback, useMemo } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useMonthBalance } from '../../src/hooks/useMonthBalance';
import { useResponsive } from '../../src/hooks/useResponsive';
import {
  groupTransactionsByDate,
  Transaction,
  useTransactionsFilter,
} from '../../src/hooks/useTransactionsFilter';
import { useTranslation } from '../../src/i18n/useTranslation';
import { ExpenseState, useExpenseStore } from '../../src/store/useExpenseStore';
import { COLORS, SPACING } from '../../src/theme';
import { useTheme } from '../../src/theme/useTheme';
import { Expense, Income } from '../../src/types';

import { BalanceCard } from '../../src/components/BalanceCard';
import { BannerAd } from '../../src/components/BannerAd';
import { EmptyState } from '../../src/components/EmptyState';
import { DateSeparator, ExpenseItem } from '../../src/components/ExpenseItem';
import { FilterBar } from '../../src/components/FilterBar';
import { IncomeItem } from '../../src/components/IncomeItem';
import { SpeedDial } from '../../src/components/SpeedDial';
import { Text } from '../../src/components/ui/Text';

// ── Saludo contextual ─────────────────────

function getGreeting(t: (k: string) => string): string {
  const h = new Date().getHours();
  if (h < 12) return t('home.greeting_morning');
  if (h < 19) return t('home.greeting_afternoon');
  return t('home.greeting_evening');
}

// ── Pantalla ──────────────────────────────

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { contentPaddingH } = useResponsive();

  const isLoading = useExpenseStore((s: ExpenseState) => s.isLoading);
  const initialize = useExpenseStore((s: ExpenseState) => s.initialize);

  // Balance del mes actual
  const currentMonth = format(new Date(), 'yyyy-MM');
  const monthBalance = useMonthBalance(currentMonth);

  // Transacciones combinadas con filtro de fecha
  const {
    activeFilter,
    setActiveFilter,
    transactions,
    totalCount,
  } = useTransactionsFilter();

  // Agrupar por fecha (máx 60 items)
  const grouped = useMemo(
    () => groupTransactionsByDate(transactions.slice(0, 60)),
    [transactions]
  );

  // Handlers de navegación
  const handleExpensePress = useCallback((expense: Expense) => {
    router.push(`/edit/${expense.id}` as Href);
  }, [router]);

  const handleIncomePress = useCallback((income: Income) => {
    router.push(`/edit-income/${income.id}` as Href);
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
          <RefreshControl
            refreshing={isLoading}
            onRefresh={initialize}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        }
      >
        {/* ── Saludo ── */}
        <Animated.View
          entering={FadeInDown.springify().damping(14)}
          style={styles.header}
        >
          <Text variant="bodySmall" secondary>{getGreeting(t)}</Text>
          <Text variant="h2" weight="extrabold">{t('balance.title')}</Text>
        </Animated.View>

        {/* ── BalanceCard — sin botón de agregar ingreso ── */}
        <BalanceCard balance={monthBalance} />

        {/* ── Filtro de fecha ── */}
        <FilterBar
          active={activeFilter}
          onChange={setActiveFilter}
          resultCount={totalCount}
        />

        {/* ── Cabecera de transacciones ── */}
        <Animated.View
          entering={FadeInDown.delay(80).springify().damping(14)}
          style={styles.sectionHeader}
        >
          <Text variant="h3" weight="bold">
            {t('home.recent_transactions')}
          </Text>
        </Animated.View>

        {/* ── Estado vacío ── */}
        {transactions.length === 0 && (
          <EmptyState
            emoji="💫"
            title={t('home.no_transactions')}
            subtitle={t('home.no_transactions_sub')}
          />
        )}

        {/* ── Lista combinada agrupada por fecha ── */}
        {grouped.map(({ label, date, items }) => (
          <View key={date} style={styles.group}>
            <DateSeparator label={label} />

            {items.map((tx: Transaction, i) =>
              tx.type === 'expense' ? (
                <ExpenseItem
                  key={tx.data.id}
                  expense={tx.data as Expense}
                  index={i}
                  onPress={handleExpensePress}
                />
              ) : (
                <IncomeItem
                  key={tx.data.id}
                  income={tx.data as Income}
                  index={i}
                  onPress={handleIncomePress}
                />
              )
            )}
          </View>
        ))}
      </ScrollView>

      {/* ── Banner Ad ── */}
      <View style={[styles.adBar, { backgroundColor: colors.surface }]}>
        <BannerAd onUpgrade={() => router.push('/(tabs)/settings' as Href)} />
      </View>

      {/* ── SpeedDial ── */}
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