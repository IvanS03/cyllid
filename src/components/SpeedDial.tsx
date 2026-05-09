// src/components/SpeedDial.tsx
// ─────────────────────────────────────────
// FAB expandible: al tocar muestra dos opciones
//   💸 Agregar gasto   (púrpura)
//   💰 Agregar ingreso (verde)
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
    const translateY = useSharedValue(40);
    const opacity = useSharedValue(0);

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
            <View style={[styles.label, { backgroundColor: 'rgba(0,0,0,0.65)' }]}>
                <Text variant="caption" weight="bold" color="#FFF">{label}</Text>
            </View>

            {/* Botón circular */}
            <TouchableOpacity
                onPress={onPress}
                activeOpacity={0.85}
                style={[styles.actionBtn, { backgroundColor: color }, SHADOWS.md]}
            >
                {icon}
            </TouchableOpacity>
        </Animated.View>
    );
}

// ── Componente principal ──────────────────

export function SpeedDial({ onAddExpense, onAddIncome }: SpeedDialProps) {
    const { t } = useTranslation();
    const [open, setOpen] = useState(false);

    const mainScale = useSharedValue(1);
    const mainRotate = useSharedValue(0);
    const backdropOpacity = useSharedValue(0);

    const toggleOpen = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        const next = !open;
        setOpen(next);
        mainRotate.value = withSpring(next ? 1 : 0, { damping: 12, stiffness: 200 });
        backdropOpacity.value = withTiming(next ? 1 : 0, { duration: 200 });
    };

    const handleExpense = () => {
        setOpen(false);
        mainRotate.value = withSpring(0, { damping: 12, stiffness: 200 });
        backdropOpacity.value = withTiming(0, { duration: 150 });
        setTimeout(() => onAddExpense(), 100);
    };

    const handleIncome = () => {
        setOpen(false);
        mainRotate.value = withSpring(0, { damping: 12, stiffness: 200 });
        backdropOpacity.value = withTiming(0, { duration: 150 });
        setTimeout(() => onAddIncome(), 100);
    };

    const mainBtnStyle = useAnimatedStyle(() => ({
        transform: [
            { scale: mainScale.value },
            { rotate: `${mainRotate.value * 45}deg` },
        ],
    }));

    const backdropStyle = useAnimatedStyle(() => ({
        opacity: backdropOpacity.value,
    }));

    const handlePressIn = () => { mainScale.value = withSpring(0.92, { damping: 10, stiffness: 320 }); };
    const handlePressOut = () => { mainScale.value = withSpring(1, { damping: 8, stiffness: 260 }); };

    return (
        <>
            {/* Backdrop para cerrar al tocar fuera */}
            {open && (
                <Animated.View
                    entering={FadeIn.duration(150)}
                    exiting={FadeOut.duration(150)}
                    style={[styles.backdrop, backdropStyle]}
                >
                    <Pressable style={StyleSheet.absoluteFill} onPress={toggleOpen} />
                </Animated.View>
            )}

            <View style={styles.container}>
                {/* Opciones expandidas */}
                {open && (
                    <View style={styles.actions}>
                        <ActionButton
                            label={t('income.add_income')}
                            color={COLORS.success}
                            icon={<ArrowUpCircle size={22} color="#FFF" strokeWidth={2} />}
                            onPress={handleIncome}
                            delay={0}
                        />
                        <ActionButton
                            label={t('home.add_expense')}
                            color={COLORS.primary}
                            icon={<ArrowDownCircle size={22} color="#FFF" strokeWidth={2} />}
                            onPress={handleExpense}
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
                            styles.mainBtn,
                            { backgroundColor: open ? '#374151' : COLORS.primary },
                            SHADOWS.fab,
                        ]}
                    >
                        {open
                            ? <X size={26} color="#FFF" strokeWidth={2.5} />
                            : <Plus size={26} color="#FFF" strokeWidth={2.8} />
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
        bottom: SPACING.xl + 16,
        right: SPACING.lg,
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
    label: {
        paddingHorizontal: SPACING.md,
        paddingVertical: 6,
        borderRadius: RADIUS.md,
    },
    actionBtn: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    mainBtn: {
        width: 60,
        height: 60,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
    },
});