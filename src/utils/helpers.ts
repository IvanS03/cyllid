// src/utils/helpers.ts
// ─────────────────────────────────────────
// Funciones utilitarias
// ─────────────────────────────────────────

import { format, formatDistanceToNow, isToday, isYesterday, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

// ── Formato de moneda ─────────────────────

export function formatCurrency(amount: number, currency = '$'): string {
  const formatted = new Intl.NumberFormat('es-PA', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
  return `${currency}${formatted}`;
}

export function formatAmount(value: string): string {
  // Eliminar caracteres no numéricos excepto punto
  const cleaned = value.replace(/[^0-9.]/g, '');
  // Evitar múltiples puntos
  const parts = cleaned.split('.');
  if (parts.length > 2) return parts[0] + '.' + parts.slice(1).join('');
  // Limitar decimales a 2
  if (parts[1] && parts[1].length > 2) {
    return parts[0] + '.' + parts[1].slice(0, 2);
  }
  return cleaned;
}

export function parseAmount(value: string): number {
  const parsed = parseFloat(value.replace(',', '.'));
  return isNaN(parsed) ? 0 : parsed;
}

// ── Formato de fechas ─────────────────────

export function formatDate(dateString: string): string {
  const date = parseISO(dateString);

  if (isToday(date)) return 'Hoy';
  if (isYesterday(date)) return 'Ayer';

  return format(date, "d 'de' MMMM", { locale: es });
}

export function formatDateTime(dateString: string): string {
  const date = parseISO(dateString);
  return format(date, "d MMM, HH:mm", { locale: es });
}

export function formatRelative(dateString: string): string {
  return formatDistanceToNow(parseISO(dateString), {
    addSuffix: true,
    locale: es,
  });
}

export function formatMonth(month: string): string {
  // month = 'YYYY-MM'
  const date = parseISO(month + '-01');
  return format(date, "MMMM yyyy", { locale: es });
}

export function getCurrentMonth(): string {
  return format(new Date(), 'yyyy-MM');
}

export function getMonthLabel(date: Date): string {
  return format(date, 'yyyy-MM');
}

// ── Agrupación de gastos ──────────────────

export function groupExpensesByDate<T extends { date: string }>(
  expenses: T[]
): { label: string; date: string; items: T[] }[] {
  const groups = new Map<string, T[]>();

  for (const expense of expenses) {
    const dateKey = expense.date.split('T')[0]; // 'YYYY-MM-DD'
    if (!groups.has(dateKey)) groups.set(dateKey, []);
    groups.get(dateKey)!.push(expense);
  }

  return Array.from(groups.entries()).map(([date, items]) => ({
    date,
    label: formatDate(date + 'T12:00:00'),
    items,
  }));
}

// ── Validación ────────────────────────────

export function isValidAmount(value: string): boolean {
  const num = parseFloat(value);
  return !isNaN(num) && num > 0 && num <= 999999;
}

// ── Números ───────────────────────────────

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
