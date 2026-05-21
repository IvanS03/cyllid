// src/components/SpeedDial.tsx
// ─────────────────────────────────────────
// FAB expandible — Gasto (púrpura) + Ingreso (verde)
// Responsive: posición y tamaño adaptativos en tablet
// ─────────────────────────────────────────

import * as Haptics from 'expo-haptics';
import { ArrowDownCircle, ArrowUpCircle, Plus, X } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, TouchableOpacity, View } from 'react-native';
import Animated, {
    FadeIn, FadeOut,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withSpring, withTiming,
} from 'react-native-reanimated';

import { useResponsive } from '../hooks/useResponsive';
import { useTranslation } from '../i18n/useTranslation';
import { COLORS, RADIUS, SHADOWS, SPACING } from '../theme';
import { Text } from './ui/Text';

interface SpeedDialProps {
    onAddExpense: () => void;
    onAddIncome: () => void;
}

// ── Botón de acción secundaria ────────────

function ActionButton({
    label, color, icon, onPress, delay,
}: {
    label: string; color: string;
    icon: React.ReactNode; onPress: () => void; delay: number;
}) {
    const { isTablet } = useResponsive();
    const translateY = useSharedValue(40);
    const opacity = useSharedValue(0);
    const btnSize = isTablet ? 56 : 48;

    useEffect(() => {
        translateY.value = withDelay(delay, withSpring(0, { damping: 14, stiffness: 200 }));
        opacity.value = withDelay(delay, withTiming(1, { duration: 180 }));
    }, []);

    const animStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: translateY.value }],
        opacity: opacity.value,
    }));

    return (
        <Animated.View style={[styles.actionRow, animStyle]}>
            {/* Label */}
            <View style={[styles.labelPill, { backgroundColor: 'rgba(0,0,0,0.65)' }]}>
                <Text variant="caption" weight="bold" color="#FFF">{label}</Text>
            </View>

            {/* Botón circular */}
            <TouchableOpacity
                onPress={onPress}
                activeOpacity={0.85}
                style={[
                    {
                        width: btnSize, height: btnSize, borderRadius: btnSize / 2,
                        backgroundColor: color, alignItems: 'center', justifyContent: 'center'
                    },
                    SHADOWS.md,
                ]}
            >
                {icon}
            </TouchableOpacity>
        </Animated.View>
    );
}

// ── Componente principal ──────────────────

export function SpeedDial({ onAddExpense, onAddIncome }: SpeedDialProps) {
    const { t } = useTranslation();
    const {
        isTablet, isLargeTablet,
        contentPaddingH, W,
    } = useResponsive();

    const [open, setOpen] = useState(false);

    // Tamaños adaptativos
    const mainSize = isTablet ? 68 : 60;
    const iconSize = isTablet ? 28 : 26;
    const iconSizeSm = isTablet ? 24 : 22;

    // Posición: en tablet, el FAB se alinea con el borde derecho del contenido centrado
    const rightOffset = contentPaddingH + SPACING.lg;
    const bottomOffset = SPACING.xl + 16;

    const mainScale = useSharedValue(1);
    const mainRotate = useSharedValue(0);
    const backdropOpac = useSharedValue(0);

    const toggleOpen = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        const next = !open;
        setOpen(next);
        mainRotate.value = withSpring(next ? 1 : 0, { damping: 12, stiffness: 200 });
        backdropOpac.value = withTiming(next ? 1 : 0, { duration: 200 });
    };

    const close = (cb?: () => void) => {
        setOpen(false);
        mainRotate.value = withSpring(0, { damping: 12, stiffness: 200 });
        backdropOpac.value = withTiming(0, { duration: 150 });
        if (cb) setTimeout(cb, 100);
    };

    const mainBtnStyle = useAnimatedStyle(() => ({
        transform: [
            { scale: mainScale.value },
            { rotate: `${mainRotate.value * 45}deg` },
        ],
    }));

    const backdropStyle = useAnimatedStyle(() => ({
        opacity: backdropOpac.value,
    }));

    const handlePressIn = () => { mainScale.value = withSpring(0.92, { damping: 10, stiffness: 320 }); };
    const handlePressOut = () => { mainScale.value = withSpring(1, { damping: 8, stiffness: 260 }); };

    return (
        <>
            {/* Backdrop */}
            {open && (
                <Animated.View
                    entering={FadeIn.duration(150)}
                    exiting={FadeOut.duration(150)}
                    style={[styles.backdrop, backdropStyle]}
                >
                    <Pressable style={StyleSheet.absoluteFill} onPress={() => close()} />
                </Animated.View>
            )}

            <View style={[styles.container, { bottom: bottomOffset, right: rightOffset }]}>

                {/* Opciones expandidas */}
                {open && (
                    <View style={styles.actions}>
                        <ActionButton
                            label={t('income.add_income')}
                            color={COLORS.success}
                            icon={<ArrowUpCircle size={iconSizeSm} color="#FFF" strokeWidth={2} />}
                            onPress={() => close(onAddIncome)}
                            delay={0}
                        />
                        <ActionButton
                            label={t('home.add_expense')}
                            color={COLORS.primary}
                            icon={<ArrowDownCircle size={iconSizeSm} color="#FFF" strokeWidth={2} />}
                            onPress={() => close(onAddExpense)}
                            delay={60}
                        />
                    </View>
                )}

                {/* Botón principal */}
                <Animated.View style={mainBtnStyle}>
                    <TouchableOpacity
                        onPress={toggleOpen}
                        onPressIn={handlePressIn}
                        onPressOut={handlePressOut}
                        activeOpacity={1}
                        style={[
                            {
                                width: mainSize, height: mainSize,
                                borderRadius: mainSize / 2,
                                backgroundColor: open ? '#374151' : COLORS.primary,
                                alignItems: 'center', justifyContent: 'center',
                            },
                            SHADOWS.fab,
                        ]}
                    >
                        {open
                            ? <X size={iconSize} color="#FFF" strokeWidth={2.5} />
                            : <Plus size={iconSize} color="#FFF" strokeWidth={2.8} />
                        }
                    </TouchableOpacity>
                </Animated.View>
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.35)',
        zIndex: 90,
    },
    container: {
        position: 'absolute',
        alignItems: 'flex-end',
        zIndex: 100,
        gap: SPACING.md,
    },
    actions: {
        alignItems: 'flex-end',
        gap: SPACING.md,
    },
    actionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.sm,
    },
    labelPill: {
        paddingHorizontal: SPACING.md,
        paddingVertical: 6,
        borderRadius: RADIUS.md,
    },
});