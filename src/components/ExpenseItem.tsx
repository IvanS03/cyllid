// src/components/ExpenseItem.tsx
// ─────────────────────────────────────────
// Fila de gasto individual — animada al entrar
// ─────────────────────────────────────────

import { ChevronRight } from 'lucide-react-native';
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
import { CATEGORY_CONFIG, CategoryKey, RADIUS, SPACING } from '../theme';
import { useTheme } from '../theme/useTheme';
import { Expense } from '../types';
import { formatCurrency, formatDateTime } from '../utils/helpers';
import { Text } from './ui/Text';

interface ExpenseItemProps {
  expense: Expense;
  onPress?: (expense: Expense) => void;
  index?: number;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export function ExpenseItem({
  expense,
  onPress,
  index = 0,
}: ExpenseItemProps) {
  const { colors } = useTheme();
  const { currency } = useAppStore((s: AppState) => s);
  const { t } = useTranslation();

  const config = CATEGORY_CONFIG[expense.category as CategoryKey];

  // ── Animación press scale ──
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98, {
      damping: 12,
      stiffness: 300,
    });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, {
      damping: 12,
      stiffness: 300,
    });
  };

  return (
    <Animated.View
      entering={FadeInRight.delay(index * 40)
        .springify()
        .damping(14)}
    >
      <AnimatedTouchable
        onPress={() => onPress?.(expense)}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
        style={[
          styles.container,
          { backgroundColor: colors.surface },
          animStyle,
        ]}
      >
        {/* ── Icono categoría ── */}
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: config.color + '18' },
          ]}
        >
          <Text style={styles.emoji}>{config.emoji}</Text>
        </View>

        {/* ── Información ── */}
        <View style={styles.info}>
          <Text
            variant="label"
            weight="semibold"
            numberOfLines={1}
          >
            {t(`categories.${expense.category}`)}
          </Text>

          {expense.note ? (
            <Text
              variant="caption"
              secondary
              numberOfLines={1}
              style={styles.note}
            >
              {expense.note}
            </Text>
          ) : (
            <Text variant="caption" muted>
              {formatDateTime(expense.date)}
            </Text>
          )}
        </View>

        {/* ── Monto ── */}
        <Text
          variant="h3"
          weight="bold"
          color={config.color}
          style={styles.amount}
        >
          {formatCurrency(expense.amount, currency)}
        </Text>

        {/* ── Chevron ── */}
        {onPress && (
          <ChevronRight
            size={16}
            color={colors.textMuted}
            strokeWidth={1.8}
          />
        )}
      </AnimatedTouchable>
    </Animated.View>
  );
}

// ─────────────────────────────────────────
// Separador de fecha
// ─────────────────────────────────────────

export function DateSeparator({ label }: { label: string }) {
  const { colors } = useTheme();

  return (
    <View style={styles.separator}>
      <View
        style={[
          styles.line,
          { backgroundColor: colors.divider },
        ]}
      />

      <Text
        variant="caption"
        weight="semibold"
        secondary
        style={styles.separatorText}
      >
        {label}
      </Text>

      <View
        style={[
          styles.line,
          { backgroundColor: colors.divider },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.xs,
    gap: SPACING.md,
  },

  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  emoji: {
    fontSize: 20,
    lineHeight: 24,
  },

  info: {
    flex: 1,
    gap: 2,
  },

  note: {
    marginTop: 1,
  },

  amount: {
    flexShrink: 0,
  },

  separator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.xs,
    gap: SPACING.sm,
  },

  line: {
    flex: 1,
    height: 1,
  },

  separatorText: {
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});