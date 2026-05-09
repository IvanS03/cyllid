// src/store/useIncomeStore.ts
// ─────────────────────────────────────────
// Store de ingresos con Zustand
// Persistencia automática + update optimista
// ─────────────────────────────────────────

import { format, parseISO } from 'date-fns';
import uuid from 'react-native-uuid';
import { create } from 'zustand';
import { INCOME_SOURCE_CONFIG } from '../theme';
import { Income, IncomeInput, IncomeSource } from '../types';
import {
    addIncomeToStorage,
    deleteIncomeFromStorage,
    loadIncomes,
    updateIncomeInStorage,
} from '../utils/storage';

export interface IncomeState {
    incomes: Income[];
    isLoading: boolean;
    isInitialized: boolean;

    // Acciones
    initialize: () => Promise<void>;
    addIncome: (input: IncomeInput) => Promise<Income>;
    updateIncome: (id: string, updates: Partial<Income>) => Promise<void>;
    deleteIncome: (id: string) => Promise<void>;

    // Selectores
    getRecentIncomes: (limit?: number) => Income[];
    getIncomesByMonth: (month: string) => Income[];
    getMonthlyTotal: (month: string) => number;
    getIncomeById: (id: string) => Income | undefined;
    getBySource: (month: string) => Record<IncomeSource, number>;
}

export const useIncomeStore = create<IncomeState>((set, get) => ({
    incomes: [],
    isLoading: false,
    isInitialized: false,

    // ── Inicialización ────────────────────────
    initialize: async () => {
        if (get().isInitialized) return;
        set({ isLoading: true });
        try {
            const incomes = await loadIncomes();
            set({ incomes, isInitialized: true });
        } catch (err) {
            console.error('[IncomeStore] Error:', err);
        } finally {
            set({ isLoading: false });
        }
    },

    // ── CRUD ──────────────────────────────────
    addIncome: async (input: IncomeInput) => {
        const now = new Date().toISOString();
        const income: Income = {
            id: uuid.v4() as string,
            amount: Number(input.amount.toFixed(2)),
            source: input.source,
            note: input.note?.trim() ?? '',
            date: input.date ?? now,
            createdAt: now,
            recurrent: input.recurrent ?? false,
        };

        // Optimistic update
        set((s) => ({ incomes: [income, ...s.incomes] }));

        try {
            await addIncomeToStorage(income);
        } catch (err) {
            // Revertir
            set((s) => ({ incomes: s.incomes.filter((i) => i.id !== income.id) }));
            throw err;
        }

        return income;
    },

    updateIncome: async (id, updates) => {
        const prev = get().incomes;
        set((s) => ({
            incomes: s.incomes.map((i) => (i.id === id ? { ...i, ...updates } : i)),
        }));
        try {
            await updateIncomeInStorage(id, updates);
        } catch (err) {
            set({ incomes: prev });
            throw err;
        }
    },

    deleteIncome: async (id) => {
        const prev = get().incomes;
        set((s) => ({ incomes: s.incomes.filter((i) => i.id !== id) }));
        try {
            await deleteIncomeFromStorage(id);
        } catch (err) {
            set({ incomes: prev });
            throw err;
        }
    },

    // ── Selectores ────────────────────────────
    getRecentIncomes: (limit = 20) => get().incomes.slice(0, limit),

    getIncomesByMonth: (month) =>
        get().incomes.filter(
            (i) => format(parseISO(i.date), 'yyyy-MM') === month
        ),

    getMonthlyTotal: (month) =>
        get()
            .getIncomesByMonth(month)
            .reduce((sum, i) => sum + i.amount, 0),

    getIncomeById: (id) => get().incomes.find((i) => i.id === id),

    getBySource: (month) => {
        const sources = Object.keys(INCOME_SOURCE_CONFIG) as IncomeSource[];
        const result = {} as Record<IncomeSource, number>;
        sources.forEach((s) => { result[s] = 0; });

        get().getIncomesByMonth(month).forEach((i) => {
            result[i.source] = (result[i.source] ?? 0) + i.amount;
        });

        return result;
    },
}));
