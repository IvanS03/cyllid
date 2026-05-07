// src/components/LanguageSwitcher.tsx
// ─────────────────────────────────────────
// Selector de idioma: Español / English
// Usado en la pantalla de ajustes
// ─────────────────────────────────────────

import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../theme/useTheme';
import { COLORS, RADIUS, SPACING } from '../theme';
import { Text } from './ui/Text';
import { useTranslation } from '../i18n/useTranslation';
import { Language } from '../i18n';

const LANGUAGES: { code: Language; flag: string; labelKey: string }[] = [
  { code: 'es', flag: '🇪🇸', labelKey: 'settings.language_es' },
  { code: 'en', flag: '🇺🇸', labelKey: 'settings.language_en' },
];

export function LanguageSwitcher() {
  const { colors, isDark } = useTheme();
  const { t, language, setLanguage } = useTranslation();

  const handleSelect = (lang: Language) => {
    if (lang === language) return;
    Haptics.selectionAsync();
    setLanguage(lang);
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDark ? colors.surfaceAlt : colors.background,
          borderRadius: RADIUS.xl,
        },
      ]}
    >
      {LANGUAGES.map((lang) => {
        const isActive = language === lang.code;
        return (
          <LanguageOption
            key={lang.code}
            flag={lang.flag}
            label={t(lang.labelKey)}
            isActive={isActive}
            onPress={() => handleSelect(lang.code)}
          />
        );
      })}
    </View>
  );
}

function LanguageOption({
  flag,
  label,
  isActive,
  onPress,
}: {
  flag: string;
  label: string;
  isActive: boolean;
  onPress: () => void;
}) {
  const { colors } = useTheme();
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95, { damping: 10, stiffness: 300 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 10, stiffness: 300 });
  };

  return (
    <Animated.View style={[styles.optionWrapper, animStyle]}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.85}
        style={[
          styles.option,
          isActive && {
            backgroundColor: COLORS.primary,
            shadowColor: COLORS.primary,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.3,
            shadowRadius: 6,
            elevation: 4,
          },
          !isActive && { backgroundColor: 'transparent' },
        ]}
      >
        <Text style={styles.flag}>{flag}</Text>
        <Text
          variant="label"
          color={isActive ? COLORS.white : colors.textSecondary}
          weight={isActive ? 'bold' : 'regular'}
        >
          {label}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 4,
    gap: 4,
  },
  optionWrapper: {
    flex: 1,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm + 2,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.lg,
    gap: SPACING.sm,
  },
  flag: {
    fontSize: 18,
    lineHeight: 22,
  },
});
