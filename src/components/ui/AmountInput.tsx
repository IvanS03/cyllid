// src/components/ui/AmountInput.tsx
// ─────────────────────────────────────────
// Input de monto — grande, numérico, rápido
// Se activa automáticamente al abrir el form
// ─────────────────────────────────────────

import React, { useRef, useEffect } from 'react';
import {
  TextInput,
  View,
  StyleSheet,
  TextInputProps,
  TouchableOpacity,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useTheme } from '../../theme/useTheme';
import { useAppStore } from '../../store/useAppStore';
import { FONT_SIZE, FONT_WEIGHT, SPACING, RADIUS, COLORS } from '../../theme';
import { Text } from './Text';
import { formatAmount } from '../../utils/helpers';

interface AmountInputProps {
  value: string;
  onChange: (value: string) => void;
  hasError?: boolean;
  autoFocus?: boolean;
  placeholder?: string;
}

export function AmountInput({
  value,
  onChange,
  hasError = false,
  autoFocus = true,
  placeholder = '0.00',
}: AmountInputProps) {
  const { colors, isDark } = useTheme();
  const { currency } = useAppStore();
  const inputRef = useRef<TextInput>(null);
  const scale = useSharedValue(1);
  const borderOpacity = useSharedValue(0);

  useEffect(() => {
    if (autoFocus) {
      const timer = setTimeout(() => inputRef.current?.focus(), 100);
      return () => clearTimeout(timer);
    }
  }, [autoFocus]);

  const handleFocus = () => {
    scale.value = withSpring(1.02, { damping: 12, stiffness: 200 });
    borderOpacity.value = withTiming(1, { duration: 200 });
  };

  const handleBlur = () => {
    scale.value = withSpring(1, { damping: 12, stiffness: 200 });
    borderOpacity.value = withTiming(0, { duration: 200 });
  };

  const handleChange = (text: string) => {
    onChange(formatAmount(text));
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const borderStyle = useAnimatedStyle(() => ({
    opacity: borderOpacity.value,
  }));

  return (
    <View style={styles.wrapper}>
      <Animated.View
        style={[
          styles.container,
          {
            backgroundColor: isDark ? colors.surfaceAlt : colors.background,
            borderRadius: RADIUS.xl,
          },
          animatedStyle,
        ]}
      >
        {/* Borde animado del foco */}
        <Animated.View
          style={[
            styles.focusBorder,
            {
              borderColor: hasError ? COLORS.error : COLORS.primary,
              borderRadius: RADIUS.xl,
            },
            borderStyle,
          ]}
        />

        <View style={styles.row}>
          {/* Símbolo de moneda */}
          <Text
            style={[
              styles.currency,
              { color: value ? colors.primary : colors.textMuted },
            ]}
            weight="bold"
          >
            {currency}
          </Text>

          {/* Input numérico */}
          <TextInput
            ref={inputRef}
            value={value}
            onChangeText={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={placeholder}
            placeholderTextColor={colors.textMuted}
            keyboardType="decimal-pad"
            returnKeyType="done"
            maxLength={10}
            selectionColor={COLORS.primary}
            style={[
              styles.input,
              {
                color: hasError ? COLORS.error : colors.textPrimary,
                fontFamily: 'Nunito_800ExtraBold',
              },
            ]}
          />
        </View>
      </Animated.View>

      {/* Indicador de error */}
      {hasError && (
        <Text
          variant="caption"
          color={COLORS.error}
          style={styles.errorText}
          align="center"
        >
          ⚠️ Ingresa un monto válido
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
  },
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.xl,
    width: '100%',
    position: 'relative',
  },
  focusBorder: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 2,
    pointerEvents: 'none',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
  },
  currency: {
    fontSize: FONT_SIZE.xxl,
    lineHeight: FONT_SIZE.display,
    paddingBottom: 4,
  },
  input: {
    fontSize: FONT_SIZE.display,
    minWidth: 120,
    maxWidth: 240,
    textAlign: 'left',
    padding: 0,
    margin: 0,
  },
  errorText: {
    marginTop: SPACING.sm,
  },
});
