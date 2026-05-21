// src/hooks/useMonthBalance.ts
// ─────────────────────────────────────────
// Calcula balance mensual: ingresos - gastos
// IMPORTANTE: suscribirse a arrays crudos, NO a funciones
// del store — las funciones nunca cambian su referencia,
// así que Zustand no dispara re-renders.
// ─────────────────────────────────────────

import { format, parseISO, subMonths } from 'date-fns';
import { useMemo } from 'react';
import { ExpenseState, useExpenseStore } from '../store/useExpenseStore';
import { IncomeState, useIncomeStore } from '../store/useIncomeStore';
import { CATEGORY_CONFIG, CategoryKey, INCOME_SOURCE_CONFIG } from '../theme';
import { IncomeSource, MonthBalance } from '../types';

export function useMonthBalance(month?: string): MonthBalance {
    const targetMonth = month ?? format(new Date(), 'yyyy-MM');

    // ✅ Seleccionar DATOS crudos → Zustand re-renderiza cuando cambian
    const expenses = useExpenseStore((s: ExpenseState) => s.expenses);
    const incomes = useIncomeStore((s: IncomeState) => s.incomes);

    return useMemo(() => {
        // ── Gastos del mes ─────────────────────
        const monthExpenses = expenses.filter(
            (e) => format(parseISO(e.date), 'yyyy-MM') === targetMonth
        );
        const byCategory = {} as Record<CategoryKey, number>;
        (Object.keys(CATEGORY_CONFIG) as CategoryKey[]).forEach((k) => { byCategory[k] = 0; });
        let totalExpenses = 0;
        for (const e of monthExpenses) {
            totalExpenses += e.amount;
            byCategory[e.category as CategoryKey] = (byCategory[e.category as CategoryKey] ?? 0) + e.amount;
        }

        // ── Ingresos confirmados del mes ───────
        const monthIncomes = incomes.filter(
            (i) => format(parseISO(i.date), 'yyyy-MM') === targetMonth
        );
        const bySource = {} as Record<IncomeSource, number>;
        (Object.keys(INCOME_SOURCE_CONFIG) as IncomeSource[]).forEach((k) => { bySource[k] = 0; });
        let totalConfirmed = 0;
        for (const i of monthIncomes) {
            totalConfirmed += i.amount;
            bySource[i.source] = (bySource[i.source] ?? 0) + i.amount;
        }

        // ── Ingresos recurrentes proyectados ───
        // Si hay ingresos recurrentes del mes anterior que NO tienen
        // entrada propia en el mes actual, se proyectan automáticamente.
        const prevMonth = format(subMonths(new Date(targetMonth + '-15'), 1), 'yyyy-MM');
        const prevRecurrent = incomes.filter(
            (i) => i.recurrent && format(parseISO(i.date), 'yyyy-MM') === prevMonth
        );
        // Fuentes ya confirmadas este mes (no proyectar si ya se ingresó)
        const confirmedSources = new Set(monthIncomes.map((i) => i.source));

        let totalProjected = 0;
        for (const rec of prevRecurrent) {
            if (!confirmedSources.has(rec.source)) {
                totalProjected += rec.amount;
                bySource[rec.source] = (bySource[rec.source] ?? 0) + rec.amount;
            }
        }

        const totalIncome = Number((totalConfirmed + totalProjected).toFixed(2));
        totalExpenses = Number(totalExpenses.toFixed(2));

        return {
            month: targetMonth,
            totalIncome,
            totalExpenses,
            balance: Number((totalIncome - totalExpenses).toFixed(2)),
            incomeCount: monthIncomes.length,
            expenseCount: monthExpenses.length,
            bySource,
            // Extras para la UI
            totalConfirmed: Number(totalConfirmed.toFixed(2)),
            totalProjected: Number(totalProjected.toFixed(2)),
        } as MonthBalance & { totalConfirmed: number; totalProjected: number };
    }, [expenses, incomes, targetMonth]);
}