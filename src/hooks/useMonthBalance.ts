// src/hooks/useMonthBalance.ts
// ─────────────────────────────────────────
// Calcula el balance mensual: ingresos - gastos
// Combina ambos stores en un solo resultado
// ─────────────────────────────────────────

import { format } from 'date-fns';
import { useMemo } from 'react';
import { ExpenseState, useExpenseStore } from '../store/useExpenseStore';
import { IncomeState, useIncomeStore } from '../store/useIncomeStore';
import { MonthBalance } from '../types';

export function useMonthBalance(month?: string): MonthBalance {
    const targetMonth = month ?? format(new Date(), 'yyyy-MM');

    const getMonthSummary = useExpenseStore((s: ExpenseState) => s.getMonthSummary);
    const getMonthlyTotal = useIncomeStore((s: IncomeState) => s.getMonthlyTotal);
    const getBySource = useIncomeStore((s: IncomeState) => s.getBySource);
    const getIncomesByMonth = useIncomeStore((s: IncomeState) => s.getIncomesByMonth);

    return useMemo(() => {
        const expSummary = getMonthSummary(targetMonth);
        const totalIncome = getMonthlyTotal(targetMonth);
        const bySource = getBySource(targetMonth);
        const incomeCount = getIncomesByMonth(targetMonth).length;

        return {
            month: targetMonth,
            totalIncome: Number(totalIncome.toFixed(2)),
            totalExpenses: expSummary.total,
            balance: Number((totalIncome - expSummary.total).toFixed(2)),
            incomeCount,
            expenseCount: expSummary.count,
            bySource,
        };
    }, [targetMonth, getMonthSummary, getMonthlyTotal, getBySource, getIncomesByMonth]);
}
