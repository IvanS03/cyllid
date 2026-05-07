// src/hooks/useExpenseFilter.ts
// ─────────────────────────────────────────
// Hook de filtro de gastos — lógica separada de la UI
// Maneja: todo, esta semana, este mes, mes pasado
// ─────────────────────────────────────────

import {
    endOfMonth,
    endOfWeek,
    format,
    isWithinInterval,
    parseISO,
    startOfMonth,
    startOfWeek,
    subMonths,
} from 'date-fns';
import { useMemo, useState } from 'react';
import { useExpenseStore } from '../store/useExpenseStore';
import { CATEGORY_CONFIG, CategoryKey } from '../theme';
import { Expense, MonthSummary } from '../types';

// ── Tipos ─────────────────────────────────

export type FilterOption = 'all' | 'this_week' | 'this_month' | 'last_month';

export interface FilterConfig {
  key: FilterOption;
  labelKey: string; // clave i18n
  emoji: string;
}

export const FILTER_OPTIONS: FilterConfig[] = [
  { key: 'all',        labelKey: 'filters.all_time',   emoji: '📋' },
  { key: 'this_week',  labelKey: 'filters.this_week',  emoji: '📅' },
  { key: 'this_month', labelKey: 'filters.this_month', emoji: '🗓️' },
  { key: 'last_month', labelKey: 'filters.last_month', emoji: '⏮️' },
];

// ── Lógica de filtrado ────────────────────

function getDateRange(filter: FilterOption): { from: Date; to: Date } | null {
  const now = new Date();
  switch (filter) {
    case 'this_week':
      return {
        from: startOfWeek(now, { weekStartsOn: 1 }), // lunes
        to:   endOfWeek(now,   { weekStartsOn: 1 }),
      };
    case 'this_month':
      return { from: startOfMonth(now), to: endOfMonth(now) };
    case 'last_month': {
      const last = subMonths(now, 1);
      return { from: startOfMonth(last), to: endOfMonth(last) };
    }
    case 'all':
    default:
      return null; // sin rango → mostrar todo
  }
}

function filterExpenses(expenses: Expense[], filter: FilterOption): Expense[] {
  const range = getDateRange(filter);
  if (!range) return expenses;
  return expenses.filter((e) =>
    isWithinInterval(parseISO(e.date), { start: range.from, end: range.to })
  );
}

function buildSummary(expenses: Expense[], filter: FilterOption): MonthSummary {
  const byCategory = {} as Record<CategoryKey, number>;
  (Object.keys(CATEGORY_CONFIG) as CategoryKey[]).forEach((k) => { byCategory[k] = 0; });

  let total = 0;
  for (const e of expenses) {
    total += e.amount;
    byCategory[e.category as CategoryKey] =
      (byCategory[e.category as CategoryKey] ?? 0) + e.amount;
  }

  // month se usa solo como label en MonthSummaryCard
  const month =
    filter === 'last_month'
      ? format(subMonths(new Date(), 1), 'yyyy-MM')
      : format(new Date(), 'yyyy-MM');

  return {
    total: Number(total.toFixed(2)),
    byCategory,
    count: expenses.length,
    month,
  };
}

// ── Hook principal ────────────────────────

export function useExpenseFilter() {
  const allExpenses = useExpenseStore((s) => s.expenses);
  const [activeFilter, setActiveFilter] = useState<FilterOption>('this_month');

  const filteredExpenses = useMemo(
    () => filterExpenses(allExpenses, activeFilter),
    [allExpenses, activeFilter]
  );

  const summary = useMemo(
    () => buildSummary(filteredExpenses, activeFilter),
    [filteredExpenses, activeFilter]
  );

  return {
    activeFilter,
    setActiveFilter,
    filteredExpenses,
    summary,
    totalCount: allExpenses.length,
  };
}