// src/hooks/useTransactionsFilter.ts
// ─────────────────────────────────────────
// Combina gastos e ingresos bajo el mismo filtro de fecha
// y los devuelve ordenados por fecha descendente
// ─────────────────────────────────────────

import {
    endOfMonth,
    endOfWeek,
    isWithinInterval,
    parseISO,
    startOfMonth,
    startOfWeek,
    subMonths
} from 'date-fns';
import { useMemo, useState } from 'react';
import { ExpenseState, useExpenseStore } from '../store/useExpenseStore';
import { IncomeState, useIncomeStore } from '../store/useIncomeStore';
import { Expense, Income } from '../types';
import { FilterOption } from './useExpenseFilter';

// ── Tipo unificado de transacción ─────────

export type Transaction =
    | { type: 'expense'; data: Expense; date: string }
    | { type: 'income'; data: Income; date: string };

// ── Rango de fechas según filtro ──────────

function getRange(filter: FilterOption): { from: Date; to: Date } | null {
    const now = new Date();
    switch (filter) {
        case 'this_week':
            return { from: startOfWeek(now, { weekStartsOn: 1 }), to: endOfWeek(now, { weekStartsOn: 1 }) };
        case 'this_month':
            return { from: startOfMonth(now), to: endOfMonth(now) };
        case 'last_month': {
            const last = subMonths(now, 1);
            return { from: startOfMonth(last), to: endOfMonth(last) };
        }
        default:
            return null;
    }
}

function inRange(dateStr: string, range: { from: Date; to: Date } | null): boolean {
    if (!range) return true;
    return isWithinInterval(parseISO(dateStr), { start: range.from, end: range.to });
}

// ── Hook ──────────────────────────────────

export function useTransactionsFilter() {
    // ✅ Arrays crudos para garantizar reactividad
    const expenses = useExpenseStore((s: ExpenseState) => s.expenses);
    const incomes = useIncomeStore((s: IncomeState) => s.incomes);

    const [activeFilter, setActiveFilter] = useState<FilterOption>('this_month');

    const { transactions, expenseCount, incomeCount } = useMemo(() => {
        const range = getRange(activeFilter);

        // Filtrar cada lista
        const filteredExpenses = expenses.filter((e) => inRange(e.date, range));
        const filteredIncomes = incomes.filter((i) => inRange(i.date, range));

        // Combinar en lista unificada con campo `date` normalizado
        const combined: Transaction[] = [
            ...filteredExpenses.map((e): Transaction => ({
                type: 'expense',
                data: e,
                date: e.date,
            })),
            ...filteredIncomes.map((i): Transaction => ({
                type: 'income',
                data: i,
                date: i.date,
            })),
        ];

        // Ordenar por fecha descendente (más reciente primero)
        combined.sort((a, b) =>
            parseISO(b.date).getTime() - parseISO(a.date).getTime()
        );

        return {
            transactions: combined,
            expenseCount: filteredExpenses.length,
            incomeCount: filteredIncomes.length,
        };
    }, [expenses, incomes, activeFilter]);

    return {
        activeFilter,
        setActiveFilter,
        transactions,
        totalCount: transactions.length,
        expenseCount,
        incomeCount,
    };
}

// ── Helper: agrupar por fecha ─────────────

export function groupTransactionsByDate(
    transactions: Transaction[]
): { label: string; date: string; items: Transaction[] }[] {
    const groups = new Map<string, Transaction[]>();

    for (const tx of transactions) {
        const key = tx.date.split('T')[0]; // 'YYYY-MM-DD'
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key)!.push(tx);
    }

    // Importar helper para el label de fecha
    const { formatDate } = require('../utils/helpers');

    return Array.from(groups.entries()).map(([date, items]) => ({
        date,
        label: formatDate(date + 'T12:00:00'),
        items,
    }));
}