// app/(tabs)/settings.tsx
// ─────────────────────────────────────────
// Pantalla de Ajustes
// • Tema: claro / oscuro / sistema
// • Idioma: español / inglés
// • Moneda
// • Premium (sin anuncios)
// • Borrar datos
// ─────────────────────────────────────────

import * as Haptics from 'expo-haptics';
import {
  BarChart2,
  ChevronRight,
  DollarSign,
  Globe,
  Info,
  Monitor,
  Moon,
  Smartphone, Sparkles,
  Star,
  Sun,
  Trash2,
} from 'lucide-react-native';
import { useState } from 'react';
import {
  Alert, Modal,
  ScrollView, StyleSheet, TouchableOpacity,
  View,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LanguageSwitcher } from '../../src/components/LanguageSwitcher';
import { Card } from '../../src/components/ui/Card';
import { Text } from '../../src/components/ui/Text';
import { useTranslation } from '../../src/i18n/useTranslation';
import { useAppStore } from '../../src/store/useAppStore';
import { useExpenseStore } from '../../src/store/useExpenseStore';
import { COLORS, RADIUS, SHADOWS, SPACING } from '../../src/theme';
import { useTheme } from '../../src/theme/useTheme';
import { ThemeMode } from '../../src/types';
import { clearAllData } from '../../src/utils/storage';

// ── Constantes ────────────────────────────

const APP_VERSION = '1.0.0';

const CURRENCIES = ['$', '€', '£', '¥', '₡', 'Q', 'B/.', 'S/', 'Bs'];

// Iconos de tema definidos como componentes para que reciban el color activo
const THEME_OPTIONS: { value: ThemeMode; Icon: React.FC<{ color: string }>; key: string }[] = [
  { value: 'light', Icon: ({ color }) => <Sun size={15} color={color} strokeWidth={2} />, key: 'settings.theme_light' },
  { value: 'dark', Icon: ({ color }) => <Moon size={15} color={color} strokeWidth={2} />, key: 'settings.theme_dark' },
  { value: 'system', Icon: ({ color }) => <Monitor size={15} color={color} strokeWidth={2} />, key: 'settings.theme_system' },
];

// ── Componentes auxiliares ────────────────

/** Fila de ajuste genérica */
function SettingRow({
  icon, label, sublabel, right, onPress, showChevron = false,
}: {
  icon: React.ReactNode; label: string; sublabel?: string;
  right?: React.ReactNode; onPress?: () => void; showChevron?: boolean;
}) {
  const { colors } = useTheme();
  const Wrapper = onPress ? TouchableOpacity : View;
  return (
    <Wrapper
      onPress={onPress}
      activeOpacity={0.7}
      style={[styles.settingRow, { borderBottomColor: colors.divider }]}
    >
      <View style={styles.settingIconWrap}>{icon}</View>
      <View style={styles.settingInfo}>
        <Text variant="body" weight="medium">{label}</Text>
        {sublabel && <Text variant="caption" secondary>{sublabel}</Text>}
      </View>
      {right && <View style={styles.settingRight}>{right}</View>}
      {showChevron && (
        <ChevronRight size={16} color={colors.textMuted} strokeWidth={1.8} style={{ marginLeft: 2 }} />
      )}
    </Wrapper>
  );
}

/** Encabezado de sección */
function SectionHeader({ label }: { label: string }) {
  const { colors } = useTheme();
  return (
    <Text
      variant="caption"
      weight="bold"
      secondary
      style={[styles.sectionHeader, { color: colors.textMuted }]}
    >
      {label.toUpperCase()}
    </Text>
  );
}

/** Selector de tema con 3 opciones pill */
function ThemePicker() {
  const { colors } = useTheme();
  const { themeMode, setThemeMode } = useAppStore();
  const { t } = useTranslation();

  return (
    <View style={[styles.themePicker, { backgroundColor: colors.background, borderRadius: RADIUS.xl }]}>
      {THEME_OPTIONS.map((opt) => {
        const active = themeMode === opt.value;
        return (
          <TouchableOpacity
            key={opt.value}
            onPress={() => { Haptics.selectionAsync(); setThemeMode(opt.value); }}
            style={[
              styles.themeOption,
              active && { backgroundColor: COLORS.primary, ...SHADOWS.sm },
            ]}
          >
            <opt.Icon color={active ? COLORS.white : colors.textSecondary} />
            <Text
              variant="caption"
              weight={active ? 'bold' : 'regular'}
              color={active ? COLORS.white : colors.textSecondary}
            >
              {t(opt.key)}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

/** Modal para seleccionar moneda */
function CurrencyModal({
  visible, onClose, selected, onSelect,
}: {
  visible: boolean; onClose: () => void; selected: string; onSelect: (c: string) => void;
}) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalSheet, { backgroundColor: colors.surface }]}>
          <View style={styles.modalHandle} />
          <Text variant="h3" weight="bold" style={{ marginBottom: SPACING.lg }}>
            {t('settings.currency')}
          </Text>
          <View style={styles.currencyGrid}>
            {CURRENCIES.map((c) => {
              const active = c === selected;
              return (
                <TouchableOpacity
                  key={c}
                  onPress={() => { Haptics.selectionAsync(); onSelect(c); onClose(); }}
                  style={[
                    styles.currencyChip,
                    { borderColor: active ? COLORS.primary : colors.border },
                    active && { backgroundColor: COLORS.primarySurface },
                  ]}
                >
                  <Text
                    variant="body"
                    weight={active ? 'bold' : 'regular'}
                    color={active ? COLORS.primary : colors.textPrimary}
                  >
                    {c}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <TouchableOpacity onPress={onClose} style={styles.modalClose}>
            <Text variant="body" color={COLORS.primary} weight="semibold">{t('common.close')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// ── Pantalla principal ────────────────────

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { t } = useTranslation();

  const { currency, setCurrency, isPremium, setPremium } = useAppStore();
  const { expenses } = useExpenseStore();

  const [showCurrencyModal, setShowCurrencyModal] = useState(false);

  const totalExpenses = expenses.length;

  // ── Borrar todos los datos ────────────────
  const handleClearData = () => {
    Alert.alert(
      t('settings.clear_confirm_title'),
      t('settings.clear_confirm_message'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('settings.clear_data'),
          style: 'destructive',
          onPress: async () => {
            await clearAllData();
            useExpenseStore.setState({ expenses: [] });
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            Alert.alert('✅', t('settings.clear_success'));
          },
        },
      ]
    );
  };

  // ── Premium mock ──────────────────────────
  const handlePremium = () => {
    if (isPremium) return;
    Alert.alert(
      t('settings.premium_title'),
      t('settings.premium_desc') + '\n\n(In-app purchase — próximamente)',
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('settings.premium_button'),
          onPress: () => {
            setPremium(true);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            Alert.alert('🎉', '¡Bienvenido a Premium!');
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: insets.top + SPACING.md, paddingBottom: insets.bottom + 40 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Título */}
        <Animated.View entering={FadeInDown.springify().damping(14)} style={styles.pageHeader}>
          <Text variant="h2" weight="extrabold">{t('settings.title')}</Text>
        </Animated.View>

        {/* ── APARIENCIA ── */}
        <Animated.View entering={FadeInDown.delay(40).springify().damping(14)}>
          <SectionHeader label={t('settings.appearance')} />
          <Card padding="md" style={styles.card}>
            <View style={styles.themeRow}>
              <Sun size={18} color={COLORS.primary} strokeWidth={2} />
              <Text variant="body" weight="medium" style={{ flex: 1 }}>{t('settings.theme')}</Text>
            </View>
            <ThemePicker />
          </Card>
        </Animated.View>

        {/* ── IDIOMA ── */}
        <Animated.View entering={FadeInDown.delay(80).springify().damping(14)}>
          <SectionHeader label={t('settings.language')} />
          <Card padding="md" style={styles.card}>
            <View style={styles.themeRow}>
              <Globe size={18} color={COLORS.primary} strokeWidth={2} />
              <Text variant="body" weight="medium" style={{ flex: 1 }}>{t('settings.language')}</Text>
            </View>
            <LanguageSwitcher />
          </Card>
        </Animated.View>

        {/* ── MONEDA ── */}
        <Animated.View entering={FadeInDown.delay(120).springify().damping(14)}>
          <SectionHeader label={t('settings.currency')} />
          <Card padding="none" style={styles.card}>
            <SettingRow
              icon={<DollarSign size={18} color={COLORS.primary} strokeWidth={2} />}
              label={t('settings.currency')}
              sublabel={currency}
              onPress={() => setShowCurrencyModal(true)}
              showChevron
              right={
                <View style={[styles.currencyBadge, { backgroundColor: colors.primarySurface }]}>
                  <Text variant="label" weight="bold" color={COLORS.primary}>{currency}</Text>
                </View>
              }
            />
          </Card>
        </Animated.View>

        {/* ── PREMIUM ── */}
        <Animated.View entering={FadeInDown.delay(160).springify().damping(14)}>
          <SectionHeader label={t('settings.premium')} />
          <TouchableOpacity
            onPress={handlePremium}
            activeOpacity={isPremium ? 1 : 0.8}
            style={[
              styles.premiumCard,
              isPremium
                ? { backgroundColor: '#1a1a2e', borderColor: COLORS.primary }
                : { backgroundColor: COLORS.primary },
              SHADOWS.lg,
            ]}
          >
            <View style={styles.premiumDecor1} />
            <View style={styles.premiumDecor2} />
            <View style={styles.premiumContent}>
              {isPremium
                ? <Star size={32} color="#FFD700" fill="#FFD700" strokeWidth={1.5} />
                : <Sparkles size={32} color={COLORS.white} strokeWidth={1.5} />
              }
              <View style={{ flex: 1, gap: 2 }}>
                <Text variant="h3" weight="extrabold" color={COLORS.white}>
                  {isPremium ? '¡Ya eres Premium!' : t('settings.premium_title')}
                </Text>
                <Text variant="bodySmall" color="rgba(255,255,255,0.8)">
                  {isPremium ? 'Sin anuncios · Todas las funciones' : t('settings.premium_desc')}
                </Text>
              </View>
              {!isPremium && (
                <View style={styles.premiumBadge}>
                  <Text variant="label" weight="bold" color={COLORS.primary}>
                    {t('settings.premium_button')}
                  </Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        </Animated.View>

        {/* ── DATOS ── */}
        <Animated.View entering={FadeInDown.delay(200).springify().damping(14)}>
          <SectionHeader label={t('settings.data')} />
          <Card padding="none" style={styles.card}>
            <SettingRow
              icon={<BarChart2 size={18} color={COLORS.primary} strokeWidth={2} />}
              label={t('stats.total_expenses')}
              sublabel={`${totalExpenses} registros guardados`}
            />
            <SettingRow
              icon={<Trash2 size={18} color={COLORS.error} strokeWidth={2} />}
              label={t('settings.clear_data')}
              onPress={handleClearData}
              showChevron
              right={
                <Text variant="caption" color={COLORS.error} weight="semibold">
                  {t('common.delete')}
                </Text>
              }
            />
          </Card>
        </Animated.View>

        {/* ── ACERCA DE ── */}
        <Animated.View entering={FadeInDown.delay(240).springify().damping(14)}>
          <SectionHeader label={t('settings.about')} />
          <Card padding="none" style={styles.card}>
            <SettingRow
              icon={<Smartphone size={18} color={COLORS.primary} strokeWidth={2} />}
              label="Gastos App"
              sublabel={`${t('settings.version')} ${APP_VERSION}`}
            />
            <SettingRow
              icon={<Info size={18} color={colors.textMuted} strokeWidth={2} />}
              label="Hecho con React Native + Expo"
              sublabel="Offline · Rápido · Minimalista"
            />
          </Card>
        </Animated.View>

        {/* Firma */}
        <Animated.View
          entering={FadeInDown.delay(280).springify().damping(14)}
          style={styles.footer}
        >
          <Text variant="caption" muted align="center">
            💸 Gastos App v{APP_VERSION}
          </Text>
          <Text variant="caption" muted align="center">
            Hecho con 💜 en React Native
          </Text>
        </Animated.View>
      </ScrollView>

      {/* Modal de moneda */}
      <CurrencyModal
        visible={showCurrencyModal}
        onClose={() => setShowCurrencyModal(false)}
        selected={currency}
        onSelect={setCurrency}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  scroll: { gap: SPACING.sm, paddingHorizontal: SPACING.md },
  pageHeader: { paddingHorizontal: SPACING.xs, marginBottom: SPACING.xs },
  sectionHeader: {
    paddingHorizontal: SPACING.xs,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.xs,
    letterSpacing: 1,
  },
  card: { overflow: 'hidden' },

  // Fila de ajuste
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    gap: SPACING.md,
  },
  settingIconWrap: { width: 28, alignItems: 'center' },
  settingInfo: { flex: 1, gap: 1 },
  settingRight: { alignItems: 'flex-end' },

  // Tema
  themeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    marginBottom: SPACING.sm,
  },
  themePicker: {
    flexDirection: 'row',
    padding: 4,
    gap: 4,
  },
  themeOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm + 2,
    paddingHorizontal: SPACING.sm,
    borderRadius: RADIUS.lg,
    gap: 6,
  },

  // Moneda
  currencyBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.md,
  },

  // Premium card
  premiumCard: {
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'transparent',
    ...SHADOWS.lg,
  },
  premiumDecor1: {
    position: 'absolute', width: 160, height: 160, borderRadius: 80,
    backgroundColor: 'rgba(255,255,255,0.06)', top: -60, right: -40,
  },
  premiumDecor2: {
    position: 'absolute', width: 80, height: 80, borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.04)', bottom: -20, left: 20,
  },
  premiumContent: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.md,
  },
  premiumBadge: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
  },

  // Modal moneda
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    borderTopLeftRadius: RADIUS.xl * 1.5,
    borderTopRightRadius: RADIUS.xl * 1.5,
    padding: SPACING.xl,
    paddingTop: SPACING.lg,
    gap: SPACING.sm,
  },
  modalHandle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: '#ccc', alignSelf: 'center', marginBottom: SPACING.md,
  },
  currencyGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm,
  },
  currencyChip: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.xl,
    borderWidth: 1.5,
    minWidth: 64,
    alignItems: 'center',
  },
  modalClose: {
    alignItems: 'center',
    paddingVertical: SPACING.md,
    marginTop: SPACING.sm,
  },

  // Footer
  footer: {
    paddingVertical: SPACING.xl,
    gap: SPACING.xs,
  },
});
