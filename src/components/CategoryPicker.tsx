// src/components/CategoryPicker.tsx
// ─────────────────────────────────────────
// Selector de categoría — scroll horizontal
// Rápido de usar con una sola mano
// ─────────────────────────────────────────

import React from 'react';
import {
  ScrollView,
  TouchableOpacity,
  View,
  StyleSheet,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../theme/useTheme';
import { CATEGORY_CONFIG, CategoryKey, SPACING, RADIUS, SHADOWS } from '../theme';
import { Text } from './ui/Text';
import { useTranslation } from '../i18n/useTranslation';

interface CategoryPickerProps {
  selected: CategoryKey;
  onSelect: (category: CategoryKey) => void;
}

const CATEGORIES = Object.keys(CATEGORY_CONFIG) as CategoryKey[];

function CategoryChip({
  category,
  isSelected,
  onSelect,
}: {
  category: CategoryKey;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const { isDark } = useTheme();
  const { t } = useTranslation();
  const config = CATEGORY_CONFIG[category];
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    scale.value = withSpring(0.92, { damping: 10, stiffness: 300 });
    setTimeout(() => {
      scale.value = withSpring(1, { damping: 10, stiffness: 300 });
    }, 100);
    Haptics.selectionAsync();
    onSelect();
  };

  const bg = isSelected
    ? config.color
    : isDark
    ? config.darkBgColor
    : config.bgColor;

  const textColor = isSelected ? '#FFFFFF' : config.color;

  return (
    <Animated.View style={animStyle}>
      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={0.85}
        style={[
          styles.chip,
          {
            backgroundColor: bg,
            borderWidth: isSelected ? 0 : 1.5,
            borderColor: config.color + '40',
          },
          isSelected && SHADOWS.sm,
        ]}
      >
        <Text style={styles.emoji}>{config.emoji}</Text>
        <Text
          variant="label"
          style={{ color: textColor, fontFamily: 'Nunito_600SemiBold' }}
        >
          {t(`categories.${category}`)}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

export function CategoryPicker({ selected, onSelect }: CategoryPickerProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
      decelerationRate="fast"
      snapToAlignment="start"
    >
      {CATEGORIES.map((category) => (
        <CategoryChip
          key={category}
          category={category}
          isSelected={selected === category}
          onSelect={() => onSelect(category)}
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
  emoji: {
    fontSize: 16,
    lineHeight: 20,
  },
});
