// src/components/BalanceCard.tsx
// ─────────────────────────────────────────
// Tarjeta de balance mensual
// Ingresos ↑  |  Gastos ↓  |  Balance =
// ─────────────────────────────────────────

import { Plus, TrendingDown, TrendingUp, Wallet } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { useTranslation } from '../i18n/useTranslation';
import { AppState, useAppStore } from '../store/useAppStore';
import { COLORS, RADIUS, SHADOWS, SPACING } from '../theme';
import { useTheme } from '../theme/useTheme';
import { MonthBalance } from '../types';
import { formatCurrency } from '../utils/helpers';
import { Text } from './ui/Text';

interface BalanceCardProps {
    balance: MonthBalance & { totalConfirmed?: number; totalProjected?: number };
    onAddIncome: () => void;
}

// ── Columna de métrica ────────────────────

function MetricCol({
    icon, label, value, valueColor,
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
    valueColor: string;
}) {
    const { colors } = useTheme();
    return (
        <View style={styles.metricCol}>
            <View style={styles.metricIcon}>{icon}</View>
            <Text variant="caption" secondary align="center" numberOfLines={1}>
                {label}
            </Text>
            <Text
                variant="label"
                weight="bold"
                align="center"
                color={valueColor}
                numberOfLines={1}
                adjustsFontSizeToFit
            >
                {value}
            </Text>
        </View>
    );
}

// ── Componente principal ──────────────────

export function BalanceCard({ balance, onAddIncome }: BalanceCardProps) {
    const { colors, isDark } = useTheme();
    const { currency } = useAppStore((s: AppState) => s);
    const { t } = useTranslation();

    const isPositive = balance.balance > 0;
    const isNegative = balance.balance < 0;
    const hasProjected = (balance.totalProjected ?? 0) > 0;

    const balanceColor = isPositive
        ? COLORS.success
        : isNegative
            ? COLORS.error
            : colors.textSecondary;

    const balanceLabel = isPositive
        ? t('balance.positive')
        : isNegative
            ? t('balance.negative')
            : t('balance.neutral');

    // Porcentaje de ahorro (solo si hay ingresos)
    const savingsRate =
        balance.totalIncome > 0
            ? Math.round((balance.balance / balance.totalIncome) * 100)
            : null;

    return (
        <Animated.View entering={FadeInDown.delay(60).springify().damping(14)}>
            <View
                style={[
                    styles.card,
                    {
                        backgroundColor: colors.surface,
                        borderColor: isPositive
                            ? COLORS.success + '30'
                            : isNegative
                                ? COLORS.error + '30'
                                : colors.border,
                    },
                    SHADOWS.md,
                ]}
            >
                {/* ── Cabecera ── */}
                <View style={styles.header}>
                    <View style={styles.headerLeft}>
                        <Wallet size={16} color={COLORS.primary} strokeWidth={2} />
                        <Text variant="label" weight="bold" color={COLORS.primary}>
                            {t('balance.title')}
                        </Text>
                    </View>

                    {/* Botón agregar ingreso */}
                    <TouchableOpacity
                        onPress={onAddIncome}
                        activeOpacity={0.8}
                        style={[styles.addIncomeBtn, { backgroundColor: COLORS.success + '18' }]}
                    >
                        <Plus size={13} color={COLORS.success} strokeWidth={2.5} />
                        <Text variant="caption" weight="bold" color={COLORS.success}>
                            {t('income.add_income')}
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* ── Balance principal ── */}
                <View style={styles.balanceRow}>
                    <Text
                        variant="h1"
                        weight="extrabold"
                        color={balanceColor}
                        adjustsFontSizeToFit
                        numberOfLines={1}
                    >
                        {isPositive ? '+' : ''}{formatCurrency(balance.balance, currency)}
                    </Text>
                    <View style={{ gap: 4 }}>
                        <View style={[styles.badge, { backgroundColor: balanceColor + '18' }]}>
                            <Text variant="caption" weight="bold" color={balanceColor}>
                                {balanceLabel}
                            </Text>
                        </View>
                        {/* Badge de proyectado si hay recurrentes */}
                        {hasProjected && (
                            <View style={[styles.badge, { backgroundColor: COLORS.warning + '20' }]}>
                                <Text variant="caption" weight="semibold" color={COLORS.warning}>
                                    +{formatCurrency(balance.totalProjected ?? 0, currency)} proyectado
                                </Text>
                            </View>
                        )}
                    </View>
                </View>

                {/* ── Divisor ── */}
                <View style={[styles.divider, { backgroundColor: colors.divider }]} />

                {/* ── Métricas: Ingresos / Gastos ── */}
                <View style={styles.metricsRow}>
                    <MetricCol
                        icon={<TrendingUp size={18} color={COLORS.success} strokeWidth={2} />}
                        label={t('income.total_income')}
                        value={formatCurrency(balance.totalIncome, currency)}
                        valueColor={COLORS.success}
                    />

                    <View style={[styles.metricSep, { backgroundColor: colors.divider }]} />

                    <MetricCol
                        icon={<TrendingDown size={18} color={COLORS.error} strokeWidth={2} />}
                        label={t('home.spent_this_month')}
                        value={formatCurrency(balance.totalExpenses, currency)}
                        valueColor={COLORS.error}
                    />

                    {/* Tasa de ahorro (solo si hay ingresos) */}
                    {savingsRate !== null && (
                        <>
                            <View style={[styles.metricSep, { backgroundColor: colors.divider }]} />
                            <MetricCol
                                icon={
                                    <Text style={{ fontSize: 16, lineHeight: 20 }}>
                                        {savingsRate >= 0 ? '🏦' : '⚠️'}
                                    </Text>
                                }
                                label={t('balance.savings_rate')}
                                value={`${savingsRate}%`}
                                valueColor={savingsRate >= 20 ? COLORS.success : savingsRate >= 0 ? COLORS.warning : COLORS.error}
                            />
                        </>
                    )}
                </View>
            </View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    card: {
        borderRadius: RADIUS.xl,
        padding: SPACING.lg,
        marginHorizontal: SPACING.md,
        borderWidth: 1.5,
        gap: SPACING.md,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.xs,
    },
    addIncomeBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SPACING.sm,
        paddingVertical: 5,
        borderRadius: RADIUS.full,
        gap: 4,
    },
    balanceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.sm,
        flexWrap: 'wrap',
    },
    badge: {
        paddingHorizontal: SPACING.sm,
        paddingVertical: 3,
        borderRadius: RADIUS.full,
    },
    divider: {
        height: 1,
        marginVertical: -SPACING.xs,
    },
    metricsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
    },
    metricCol: {
        flex: 1,
        alignItems: 'center',
        gap: 3,
    },
    metricIcon: {
        marginBottom: 2,
    },
    metricSep: {
        width: 1,
        height: 40,
        marginHorizontal: SPACING.xs,
    },
});