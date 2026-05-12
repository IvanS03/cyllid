// src/components/IncomeItem.tsx
// ─────────────────────────────────────────
// Fila de ingreso individual — espejo de ExpenseItem
// ─────────────────────────────────────────

import {
    Briefcase,
    Building2,
    ChevronRight,
    CircleDot,
    Gift,
    Laptop,
    RefreshCw,
    TrendingUp,
} from 'lucide-react-native';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import Animated, {
    FadeInRight,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated';

import { useTranslation } from '../i18n/useTranslation';
import { AppState, useAppStore } from '../store/useAppStore';
import { INCOME_SOURCE_CONFIG, IncomeSourceKey, RADIUS, SPACING } from '../theme';
import { useTheme } from '../theme/useTheme';
import { Income } from '../types';
import { formatCurrency, formatDateTime } from '../utils/helpers';
import { Text } from './ui/Text';

// ── Mapa icono por fuente ─────────────────
const SOURCE_ICONS: Record<IncomeSourceKey, React.FC<{ size: number; color: string; strokeWidth: number }>> = {
    salary: Briefcase,
    freelance: Laptop,
    business: Building2,
    investment: TrendingUp,
    gift: Gift,
    other: CircleDot,
};

const AnimatedTouch = Animated.createAnimatedComponent(TouchableOpacity);

interface IncomeItemProps {
    income: Income;
    onPress?: (income: Income) => void;
    index?: number;
}

export function IncomeItem({ income, onPress, index = 0 }: IncomeItemProps) {
    const { colors } = useTheme();
    const { currency } = useAppStore((s: AppState) => s);
    const { t } = useTranslation();

    const config = INCOME_SOURCE_CONFIG[income.source as IncomeSourceKey];
    const Icon = SOURCE_ICONS[income.source as IncomeSourceKey];
    const scale = useSharedValue(1);

    const animStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const handlePressIn = () => { scale.value = withSpring(0.98, { damping: 12, stiffness: 300 }); };
    const handlePressOut = () => { scale.value = withSpring(1, { damping: 12, stiffness: 300 }); };

    return (
        <AnimatedTouch
            entering={FadeInRight.delay(index * 40).springify().damping(14)}
            onPress={() => onPress?.(income)}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            activeOpacity={1}
            style={[styles.row, { backgroundColor: colors.surface }, animStyle]}
        >
            {/* Icono de fuente */}
            <View style={[styles.iconWrap, { backgroundColor: config.color + '18' }]}>
                <Icon size={20} color={config.color} strokeWidth={2} />
            </View>

            {/* Info */}
            <View style={styles.info}>
                <View style={styles.titleRow}>
                    <Text variant="label" weight="semibold" numberOfLines={1}>
                        {t(`sources.${income.source}`)}
                    </Text>
                    {income.recurrent && (
                        <RefreshCw size={11} color={config.color} strokeWidth={2} />
                    )}
                </View>
                <Text variant="caption" secondary numberOfLines={1}>
                    {income.note || formatDateTime(income.date)}
                </Text>
            </View>

            {/* Monto */}
            <Text variant="h3" weight="bold" color={config.color}>
                +{formatCurrency(income.amount, currency)}
            </Text>

            {onPress && (
                <ChevronRight size={16} color={colors.textMuted} strokeWidth={1.8} />
            )}
        </AnimatedTouch>
    );
}

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.md,
        borderRadius: RADIUS.lg,
        marginBottom: SPACING.xs,
        gap: SPACING.md,
    },
    iconWrap: {
        width: 44, height: 44,
        borderRadius: RADIUS.md,
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
    },
    info: { flex: 1, gap: 2 },
    titleRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs },
});