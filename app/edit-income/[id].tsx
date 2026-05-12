// app/edit-income/[id].tsx
// Modal: editar o eliminar un ingreso existente

import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Check, RefreshCw, Trash2, X } from 'lucide-react-native';
import { useCallback, useEffect, useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Switch,
    TextInput, TouchableOpacity,
    View,
} from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTranslation } from '../../src/i18n/useTranslation';
import { AppState, useAppStore } from '../../src/store/useAppStore';
import { IncomeState, useIncomeStore } from '../../src/store/useIncomeStore';
import { COLORS, INCOME_SOURCE_CONFIG, RADIUS, SHADOWS, SPACING } from '../../src/theme';
import { useTheme } from '../../src/theme/useTheme';
import { IncomeSource } from '../../src/types';
import { isValidAmount, parseAmount } from '../../src/utils/helpers';

import { SourcePicker } from '../../src/components/SourcePicker';
import { AmountInput } from '../../src/components/ui/AmountInput';
import { Button } from '../../src/components/ui/Button';
import { Text } from '../../src/components/ui/Text';

export default function EditIncomeModal() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { colors, isDark } = useTheme();
    const { t } = useTranslation();
    const { currency } = useAppStore((s: AppState) => s);

    const getIncomeById = useIncomeStore((s: IncomeState) => s.getIncomeById);
    const updateIncome = useIncomeStore((s: IncomeState) => s.updateIncome);
    const deleteIncome = useIncomeStore((s: IncomeState) => s.deleteIncome);

    const income = getIncomeById(id);

    const [amount, setAmount] = useState(income?.amount.toFixed(2) ?? '');
    const [source, setSource] = useState<IncomeSource>(income?.source ?? 'salary');
    const [note, setNote] = useState(income?.note ?? '');
    const [recurrent, setRecurrent] = useState(income?.recurrent ?? false);
    const [hasError, setHasError] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    useEffect(() => { if (!income) router.back(); }, [income]);

    const srcConfig = INCOME_SOURCE_CONFIG[source];

    const handleSave = useCallback(async () => {
        if (!isValidAmount(amount)) { setHasError(true); Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error); return; }
        setIsSaving(true);
        try {
            await updateIncome(id, { amount: parseAmount(amount), source, note: note.trim(), recurrent });
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            router.back();
        } catch { Alert.alert(t('common.error')); }
        finally { setIsSaving(false); }
    }, [amount, source, note, recurrent, id, updateIncome, router, t]);

    const confirmDelete = useCallback(async () => {
        setShowDeleteModal(false);
        await deleteIncome(id);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        router.back();
    }, [id, deleteIncome, router]);

    if (!income) return null;

    return (
        <KeyboardAvoidingView
            style={[styles.root, { backgroundColor: colors.background }]}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <View style={styles.handleWrap}>
                <View style={[styles.handle, { backgroundColor: colors.border }]} />
            </View>

            <ScrollView
                contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + SPACING.xl }]}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <Animated.View entering={FadeInDown.springify().damping(14)} style={styles.header}>
                    <View style={{ flex: 1, gap: 2 }}>
                        <Text variant="h2" weight="extrabold">{t('income.edit_title')}</Text>
                        <View style={[styles.srcBadge, { backgroundColor: srcConfig.color + '18' }]}>
                            <Text variant="caption" weight="bold" color={srcConfig.color}>
                                {t(`sources.${source}`)}
                            </Text>
                        </View>
                    </View>
                    <TouchableOpacity onPress={() => router.back()} hitSlop={8}
                        style={[styles.iconBtn, { backgroundColor: colors.surfaceAlt }]}>
                        <X size={18} color={colors.textSecondary} strokeWidth={2} />
                    </TouchableOpacity>
                </Animated.View>

                {/* Monto */}
                <Animated.View entering={FadeInDown.delay(40).springify().damping(14)}>
                    <AmountInput value={amount} onChange={(v) => { setAmount(v); setHasError(false); }}
                        hasError={hasError} autoFocus={false} />
                </Animated.View>

                {/* Fuente */}
                <Animated.View entering={FadeInDown.delay(80).springify().damping(14)}>
                    <Text variant="label" secondary style={styles.sectionLabel}>{t('income.source_label')}</Text>
                    <SourcePicker selected={source} onSelect={setSource} />
                </Animated.View>

                {/* Nota */}
                <Animated.View entering={FadeInDown.delay(110).springify().damping(14)} style={{ gap: 4 }}>
                    <Text variant="label" secondary style={styles.sectionLabel}>
                        {t('addExpense.note_label')} <Text variant="caption" muted>({t('common.optional')})</Text>
                    </Text>
                    <TextInput value={note} onChangeText={setNote} maxLength={80} returnKeyType="done"
                        placeholderTextColor={colors.textMuted}
                        style={[styles.noteInput, {
                            color: colors.textPrimary,
                            backgroundColor: isDark ? colors.surfaceAlt : colors.surface,
                            borderColor: colors.border, fontFamily: 'Nunito_400Regular'
                        }]}
                        selectionColor={srcConfig.color} />
                </Animated.View>

                {/* Recurrente */}
                <Animated.View entering={FadeInDown.delay(130).springify().damping(14)}>
                    <TouchableOpacity onPress={() => { setRecurrent(!recurrent); Haptics.selectionAsync(); }}
                        activeOpacity={0.8}
                        style={[styles.recurrentRow, {
                            backgroundColor: recurrent ? srcConfig.color + '12' : (isDark ? colors.surfaceAlt : colors.surface),
                            borderColor: recurrent ? srcConfig.color + '40' : colors.border,
                        }]}>
                        <RefreshCw size={18} color={recurrent ? srcConfig.color : colors.textMuted} strokeWidth={2} />
                        <View style={{ flex: 1 }}>
                            <Text variant="label" weight="medium" color={recurrent ? srcConfig.color : colors.textPrimary}>
                                {t('income.recurrent_label')}
                            </Text>
                            <Text variant="caption" secondary>{t('income.recurrent_hint')}</Text>
                        </View>
                        <Switch value={recurrent}
                            onValueChange={(v) => { setRecurrent(v); Haptics.selectionAsync(); }}
                            trackColor={{ false: colors.border, true: srcConfig.color + '80' }}
                            thumbColor={recurrent ? srcConfig.color : colors.textMuted} />
                    </TouchableOpacity>
                </Animated.View>

                {/* Botones */}
                <Animated.View entering={FadeInUp.delay(160).springify().damping(14)} style={styles.actionsRow}>
                    <View style={styles.saveBtn}>
                        <Button label={t('editExpense.save_button')} onPress={handleSave} loading={isSaving}
                            size="lg" fullWidth icon={<Check size={18} color="#FFF" strokeWidth={2.5} />}
                            style={{ backgroundColor: srcConfig.color, ...SHADOWS.md, shadowColor: srcConfig.color }} />
                    </View>
                    <TouchableOpacity onPress={() => setShowDeleteModal(true)} activeOpacity={0.75}
                        style={[styles.deleteBtn, { backgroundColor: '#FEE2E2' }]}>
                        <Trash2 size={20} color={COLORS.error} strokeWidth={2} />
                    </TouchableOpacity>
                </Animated.View>
            </ScrollView>

            {/* Modal confirmar eliminar */}
            <Modal visible={showDeleteModal} transparent animationType="fade"
                onRequestClose={() => setShowDeleteModal(false)}>
                <Pressable style={styles.modalOverlay} onPress={() => setShowDeleteModal(false)}>
                    <Pressable onPress={() => { }}>
                        <Animated.View entering={FadeInUp.springify().damping(16)}
                            style={[styles.modalCard, { backgroundColor: colors.surface }]}>
                            <View style={styles.modalIconWrap}>
                                <Trash2 size={28} color={COLORS.error} strokeWidth={2} />
                            </View>
                            <Text variant="h3" weight="bold" align="center">{t('income.delete_confirm_title')}</Text>
                            <Text variant="body" secondary align="center" style={{ lineHeight: 22 }}>
                                {t('income.delete_confirm_message')}
                            </Text>
                            <View style={styles.modalBtns}>
                                <TouchableOpacity onPress={() => setShowDeleteModal(false)}
                                    style={[styles.modalBtn, { backgroundColor: colors.surfaceAlt, flex: 1 }]}>
                                    <Text variant="label" weight="semibold" color={colors.textSecondary}>{t('common.cancel')}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={confirmDelete}
                                    style={[styles.modalBtn, { backgroundColor: COLORS.error, flex: 1 }]}>
                                    <Trash2 size={14} color="#FFF" strokeWidth={2.5} />
                                    <Text variant="label" weight="bold" color="#FFF">{t('income.delete_button')}</Text>
                                </TouchableOpacity>
                            </View>
                        </Animated.View>
                    </Pressable>
                </Pressable>
            </Modal>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    root: { flex: 1 },
    handleWrap: { alignItems: 'center', paddingTop: SPACING.md, paddingBottom: SPACING.sm },
    handle: { width: 40, height: 4, borderRadius: 2 },
    scroll: { paddingHorizontal: SPACING.md, gap: SPACING.lg },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    srcBadge: { flexDirection: 'row', alignSelf: 'flex-start', paddingHorizontal: SPACING.sm, paddingVertical: 3, borderRadius: RADIUS.full },
    iconBtn: { width: 36, height: 36, borderRadius: RADIUS.md, alignItems: 'center', justifyContent: 'center' },
    sectionLabel: { paddingHorizontal: SPACING.sm, marginBottom: SPACING.xs },
    noteInput: { borderRadius: RADIUS.lg, borderWidth: 1.5, paddingHorizontal: SPACING.md, paddingVertical: SPACING.md, fontSize: 15, lineHeight: 22 },
    recurrentRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, padding: SPACING.md, borderRadius: RADIUS.lg, borderWidth: 1.5 },
    actionsRow: { flexDirection: 'row', gap: SPACING.sm, alignItems: 'center' },
    saveBtn: { flex: 1 },
    deleteBtn: { width: 52, height: 52, borderRadius: RADIUS.lg, alignItems: 'center', justifyContent: 'center' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: SPACING.xl },
    modalCard: { borderRadius: RADIUS.xl, padding: SPACING.xl, alignItems: 'center', gap: SPACING.sm, width: '100%', maxWidth: 340, ...SHADOWS.lg },
    modalIconWrap: { width: 56, height: 56, borderRadius: 999, backgroundColor: '#FEE2E2', alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.xs },
    modalBtns: { flexDirection: 'row', gap: SPACING.sm, width: '100%' },
    modalBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: SPACING.md, borderRadius: RADIUS.lg, gap: SPACING.xs },
});