// app/edit/[id].tsx
// ─────────────────────────────────────────
// Modal: editar o eliminar un gasto existente
// ─────────────────────────────────────────

import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Check, Trash2, X } from 'lucide-react-native';
import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput, TouchableOpacity,
  View,
} from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTranslation } from '../../src/i18n/useTranslation';
import { AppState, useAppStore } from '../../src/store/useAppStore';
import { ExpenseState, useExpenseStore } from '../../src/store/useExpenseStore';
import { CATEGORY_CONFIG, CategoryKey, COLORS, RADIUS, SHADOWS, SPACING } from '../../src/theme';
import { useTheme } from '../../src/theme/useTheme';
import { isValidAmount, parseAmount } from '../../src/utils/helpers';

import { CategoryPicker } from '../../src/components/CategoryPicker';
import { AmountInput } from '../../src/components/ui/AmountInput';
import { Button } from '../../src/components/ui/Button';
import { Text } from '../../src/components/ui/Text';

export default function EditExpenseModal() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const { t } = useTranslation();
  const { currency } = useAppStore((s: AppState) => s);

  const getExpenseById = useExpenseStore((s: ExpenseState) => s.getExpenseById);
  const updateExpense = useExpenseStore((s: ExpenseState) => s.updateExpense);
  const deleteExpense = useExpenseStore((s: ExpenseState) => s.deleteExpense);

  const expense = getExpenseById(id);

  const [amount, setAmount] = useState(expense?.amount.toFixed(2) ?? '');
  const [category, setCategory] = useState<CategoryKey>(expense?.category ?? 'food');
  const [note, setNote] = useState(expense?.note ?? '');
  const [hasError, setHasError] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Si el gasto no existe (fue borrado externamente), cerrar
  useEffect(() => {
    if (!expense) router.back();
  }, [expense]);

  // ── Guardar cambios ───────────────────────
  const handleSave = useCallback(async () => {
    if (!isValidAmount(amount)) {
      setHasError(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    setIsSaving(true);
    try {
      await updateExpense(id, {
        amount: parseAmount(amount),
        category,
        note: note.trim(),
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    } catch {
      Alert.alert(t('common.error'));
    } finally {
      setIsSaving(false);
    }
  }, [amount, category, note, id, updateExpense, router, t]);

  // ── Eliminar (confirmado desde modal custom) ──
  const handleDelete = useCallback(() => {
    setShowDeleteModal(true);
  }, []);

  const confirmDelete = useCallback(async () => {
    setShowDeleteModal(false);
    await deleteExpense(id);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    router.back();
  }, [id, deleteExpense, router]);

  if (!expense) return null;

  const catConfig = CATEGORY_CONFIG[category];

  return (
    <KeyboardAvoidingView
      style={[styles.root, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Handle de arrastre */}
      <View style={styles.handleWrap}>
        <View style={[styles.handle, { backgroundColor: colors.border }]} />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: insets.bottom + SPACING.xl },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ── */}
        <Animated.View
          entering={FadeInDown.springify().damping(14)}
          style={styles.header}
        >
          <View style={{ flex: 1, gap: 2 }}>
            <Text variant="h2" weight="extrabold">
              {t('editExpense.title')}
            </Text>
            {/* Badge de categoría con icono Lucide en lugar de emoji */}
            <View style={[styles.catBadge, { backgroundColor: catConfig.color + '18' }]}>
              <Text style={styles.catEmoji}>{catConfig.emoji}</Text>
              <Text variant="caption" weight="semibold" color={catConfig.color}>
                {t(`categories.${category}`)}
              </Text>
            </View>
          </View>

          <View style={styles.headerActions}>
            {/* Cerrar */}
            <TouchableOpacity
              onPress={() => router.back()}
              hitSlop={8}
              style={[styles.iconBtn, { backgroundColor: colors.surfaceAlt }]}
            >
              <X size={18} color={colors.textSecondary} strokeWidth={2} />
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* ── Monto ── */}
        <Animated.View entering={FadeInDown.delay(40).springify().damping(14)}>
          <AmountInput
            value={amount}
            onChange={(v) => { setAmount(v); if (hasError) setHasError(false); }}
            hasError={hasError}
            autoFocus={false}
          />
        </Animated.View>

        {/* ── Categoría ── */}
        <Animated.View entering={FadeInDown.delay(80).springify().damping(14)}>
          <Text variant="label" secondary style={styles.sectionLabel}>
            {t('addExpense.category_label')}
          </Text>
          <CategoryPicker selected={category} onSelect={setCategory} />
        </Animated.View>

        {/* ── Nota ── */}
        <Animated.View
          entering={FadeInDown.delay(120).springify().damping(14)}
          style={{ gap: SPACING.xs }}
        >
          <Text variant="label" secondary style={styles.sectionLabel}>
            {t('addExpense.note_label')}{' '}
            <Text variant="caption" muted>({t('common.optional')})</Text>
          </Text>
          <TextInput
            value={note}
            onChangeText={setNote}
            placeholder={t('addExpense.note_placeholder')}
            placeholderTextColor={colors.textMuted}
            maxLength={80}
            returnKeyType="done"
            onSubmitEditing={handleSave}
            style={[
              styles.noteInput,
              {
                backgroundColor: isDark ? colors.surfaceAlt : colors.surface,
                color: colors.textPrimary,
                borderColor: colors.border,
                fontFamily: 'Nunito_400Regular',
              },
            ]}
            selectionColor={COLORS.primary}
          />
        </Animated.View>

        {/* ── Botones: Guardar + Eliminar ── */}
        <Animated.View entering={FadeInUp.delay(160).springify().damping(14)} style={styles.actionsRow}>
          {/* Guardar — ocupa la mayor parte */}
          <View style={styles.saveBtn}>
            <Button
              label={t('editExpense.save_button')}
              onPress={handleSave}
              loading={isSaving}
              size="lg"
              fullWidth
              icon={<Check size={18} color={COLORS.white} strokeWidth={2.5} />}
              style={{
                backgroundColor: catConfig.color,
                ...SHADOWS.fab,
                shadowColor: catConfig.color,
              }}
            />
          </View>

          {/* Eliminar — compacto, solo icono */}
          <TouchableOpacity
            onPress={handleDelete}
            style={[styles.deleteBtn, { backgroundColor: '#FEE2E2' }]}
            activeOpacity={0.75}
          >
            <Trash2 size={20} color={COLORS.error} strokeWidth={2} />
          </TouchableOpacity>
        </Animated.View>

        {/* ── Modal confirmación eliminar ── */}
        <Modal
          visible={showDeleteModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowDeleteModal(false)}
        >
          <Pressable
            style={styles.modalOverlay}
            onPress={() => setShowDeleteModal(false)}
          >
            <Pressable onPress={() => { }}>
              <Animated.View
                entering={FadeInUp.springify().damping(16)}
                style={[styles.modalCard, { backgroundColor: colors.surface }]}
              >
                {/* Icono */}
                <View style={styles.modalIconWrap}>
                  <Trash2 size={28} color={COLORS.error} strokeWidth={2} />
                </View>

                {/* Textos */}
                <Text variant="h3" weight="bold" align="center">
                  {t('editExpense.delete_confirm_title')}
                </Text>
                <Text variant="body" secondary align="center" style={styles.modalMsg}>
                  {t('editExpense.delete_confirm_message')}
                </Text>

                {/* Botones */}
                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    onPress={() => setShowDeleteModal(false)}
                    style={[styles.modalBtn, { backgroundColor: colors.surfaceAlt, flex: 1 }]}
                    activeOpacity={0.75}
                  >
                    <Text variant="label" weight="semibold" color={colors.textSecondary}>
                      {t('common.cancel')}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={confirmDelete}
                    style={[styles.modalBtn, { backgroundColor: COLORS.error, flex: 1 }]}
                    activeOpacity={0.8}
                  >
                    <Trash2 size={14} color={COLORS.white} strokeWidth={2.5} />
                    <Text variant="label" weight="bold" color={COLORS.white}>
                      {t('editExpense.delete_button')}
                    </Text>
                  </TouchableOpacity>
                </View>
              </Animated.View>
            </Pressable>
          </Pressable>
        </Modal>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },

  handleWrap: {
    alignItems: 'center',
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  handle: { width: 40, height: 4, borderRadius: 2 },

  scroll: {
    paddingHorizontal: SPACING.md,
    gap: SPACING.lg,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingTop: SPACING.xs,
  },
  headerActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
    alignItems: 'center',
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Badge categoría
  catBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
    gap: 4,
    marginTop: 4,
  },
  catEmoji: { fontSize: 13, lineHeight: 17 },

  // Labels de sección
  sectionLabel: {
    paddingHorizontal: SPACING.sm,
    marginBottom: SPACING.xs,
  },

  // Nota
  noteInput: {
    borderRadius: RADIUS.lg,
    borderWidth: 1.5,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    fontSize: 15,
    lineHeight: 22,
  },

  // Botones de acción horizontales
  actionsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    alignItems: 'center',
  },
  saveBtn: {
    flex: 1,
  },
  deleteBtn: {
    width: 52,
    height: 52,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Modal de confirmación
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  modalCard: {
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    alignItems: 'center',
    gap: SPACING.sm,
    width: '100%',
    maxWidth: 340,
    ...SHADOWS.lg,
  },
  modalIconWrap: {
    width: 56,
    height: 56,
    borderRadius: RADIUS.full,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xs,
  },
  modalMsg: {
    lineHeight: 22,
    marginBottom: SPACING.sm,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: SPACING.sm,
    width: '100%',
  },
  modalBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.lg,
    gap: SPACING.xs,
  },
});
