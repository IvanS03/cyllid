// src/components/SourcePicker.tsx
// ─────────────────────────────────────────
// Selector de fuente de ingreso
// Mismo patrón que CategoryPicker
// ─────────────────────────────────────────

import * as Haptics from 'expo-haptics';
import {
    Briefcase,
    Building2,
    CircleDot,
    Gift,
    Laptop,
    TrendingUp,
} from 'lucide-react-native';
import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { useTranslation } from '../i18n/useTranslation';
import { INCOME_SOURCE_CONFIG, IncomeSourceKey, RADIUS, SHADOWS, SPACING } from '../theme';
import { useTheme } from '../theme/useTheme';
import { IncomeSource } from '../types';
import { Text } from './ui/Text';

// ── Mapa de iconos Lucide por fuente ──────

const SOURCE_ICONS: Record<IncomeSourceKey, React.FC<{ size: number; color: string; strokeWidth: number }>> = {
    salary: Briefcase,
    freelance: Laptop,
    business: Building2,
    investment: TrendingUp,
    gift: Gift,
    other: CircleDot,
};

const SOURCES = Object.keys(INCOME_SOURCE_CONFIG) as IncomeSourceKey[];

// ── Chip individual ───────────────────────

function SourceChip({
    source, isSelected, onSelect,
}: {
    source: IncomeSourceKey; isSelected: boolean; onSelect: () => void;
}) {
    const { isDark } = useTheme();
    const { t } = useTranslation();
    const config = INCOME_SOURCE_CONFIG[source];
    const Icon = SOURCE_ICONS[source];
    const scale = useSharedValue(1);

    const animStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const handlePress = () => {
        scale.value = withSpring(0.90, { damping: 10, stiffness: 350 }, () => {
            scale.value = withSpring(1, { damping: 10, stiffness: 300 });
        });
        Haptics.selectionAsync();
        onSelect();
    };

    const bg = isSelected
        ? config.color
        : isDark ? config.darkBgColor : config.bgColor;

    return (
        <Animated.View style={animStyle}>
            <TouchableOpacity
                onPress={handlePress}
                activeOpacity={0.85}
                style={[
                    styles.chip,
                    { backgroundColor: bg },
                    isSelected && SHADOWS.sm,
                    !isSelected && { borderWidth: 1.5, borderColor: config.color + '40' },
                ]}
            >
                <Icon
                    size={15}
                    color={isSelected ? '#FFFFFF' : config.color}
                    strokeWidth={2}
                />
                <Text
                    variant="label"
                    style={{
                        color: isSelected ? '#FFFFFF' : config.color,
                        fontFamily: isSelected ? 'Nunito_700Bold' : 'Nunito_500Medium',
                    }}
                >
                    {t(`sources.${source}`)}
                </Text>
            </TouchableOpacity>
        </Animated.View>
    );
}

// ── Componente principal ──────────────────

export function SourcePicker({
    selected, onSelect,
}: {
    selected: IncomeSource; onSelect: (s: IncomeSource) => void;
}) {
    return (
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
        >
            {SOURCES.map((source) => (
                <SourceChip
                    key={source}
                    source={source}
                    isSelected={selected === source}
                    onSelect={() => onSelect(source)}
                />
            ))}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    scrollContent: {
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.xs,
        gap: SPACING.sm,
        flexDirection: 'row',
        alignItems: 'center',
    },
    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
        borderRadius: RADIUS.full,
        gap: 6,
    },
});