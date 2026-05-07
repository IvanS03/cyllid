// app/(tabs)/_layout.tsx
import * as Haptics from 'expo-haptics';
import { Tabs } from 'expo-router';
import { BarChart2, Home, Settings } from 'lucide-react-native';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from '../../src/components/ui/Text';
import { useTranslation } from '../../src/i18n/useTranslation';
import { COLORS, RADIUS, SHADOWS, SPACING } from '../../src/theme';
import { useTheme } from '../../src/theme/useTheme';

// ── Tab item animado ──────────────────────

function TabBarItem({
  label,
  focused,
  icon,
  onPress,
}: {
  label: string;
  focused: boolean;
  icon: React.ReactNode;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);

  const scaleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const indicatorStyle = useAnimatedStyle(() => ({
    opacity: withTiming(focused ? 1 : 0, { duration: 180 }),
    transform: [
      { scaleX: withSpring(focused ? 1 : 0, { damping: 12, stiffness: 200 }) },
    ],
  }));

  const handlePress = () => {
    scale.value = withSpring(0.85, { damping: 10, stiffness: 300 }, () => {
      scale.value = withSpring(1, { damping: 10, stiffness: 280 });
    });
    Haptics.selectionAsync();
    onPress();
  };

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={1} style={styles.tabItem}>
      <Animated.View style={[styles.tabItemInner, scaleStyle]}>
        <Animated.View style={[styles.indicator, { backgroundColor: COLORS.primary }, indicatorStyle]} />
        {icon}
        <Text
          variant="caption"
          weight={focused ? 'bold' : 'regular'}
          color={focused ? COLORS.primary : undefined}
          secondary={!focused}
          style={styles.tabLabel}
        >
          {label}
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );
}

// ── Barra de tabs personalizada ───────────

function CustomTabBar({ state, navigation }: any) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  const TABS = [
    {
      name: 'index',
      label: t('tabs.home'),
      Icon: Home,
    },
    {
      name: 'stats',
      label: t('tabs.stats'),
      Icon: BarChart2,
    },
    {
      name: 'settings',
      label: t('tabs.settings'),
      Icon: Settings,
    },
  ];

  return (
    <View
      style={[
        styles.tabBar,
        {
          backgroundColor: colors.surface,
          paddingBottom: insets.bottom || SPACING.sm,
          borderTopColor: colors.border,
        },
        SHADOWS.md,
      ]}
    >
      {state.routes.map((route: any, index: number) => {
        const focused = state.index === index;
        const tab = TABS.find((t) => t.name === route.name);
        if (!tab) return null;

        const iconColor = focused ? COLORS.primary : colors.textMuted;

        return (
          <TabBarItem
            key={route.key}
            label={tab.label}
            focused={focused}
            icon={
              <tab.Icon
                size={22}
                color={iconColor}
                strokeWidth={focused ? 2.2 : 1.8}
              />
            }
            onPress={() => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });
              if (!focused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            }}
          />
        );
      })}
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="stats" />
      <Tabs.Screen name="settings" />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
  },
  tabItemInner: {
    alignItems: 'center',
    gap: 3,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
    position: 'relative',
  },
  indicator: {
    position: 'absolute',
    top: -8,
    width: 32,
    height: 3,
    borderRadius: RADIUS.full,
  },
  tabLabel: {
    fontSize: 10,
    marginTop: 1,
  },
});
