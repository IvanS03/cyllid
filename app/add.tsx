// app/add.tsx
// ─────────────────────────────────────────
// Modal: agregar gasto rápido (<3 segundos)
// Flujo: monto → categoría → nota → fecha → guardar
// ─────────────────────────────────────────

import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { format, isToday, isYesterday } from 'date-fns';
import { enUS, es as esLocale } from 'date-fns/locale';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { Calendar, Check, ChevronRight, X } from 'lucide-react-native';
import { useCallback, useState } from 'react';
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

import { useTranslation } from '../src/i18n/useTranslation';
import { AppState, useAppStore } from '../src/store/useAppStore';
import { ExpenseState, useExpenseStore } from '../src/store/useExpenseStore';
import { CategoryKey, COLORS, RADIUS, SHADOWS, SPACING } from '../src/theme';
import { useTheme } from '../src/theme/useTheme';
import { isValidAmount, parseAmount } from '../src/utils/helpers';

import { CategoryPicker } from '../src/components/CategoryPicker';
import { AmountInput } from '../src/components/ui/AmountInput';
import { Button } from '../src/components/ui/Button';
import { Text } from '../src/components/ui/Text';

// ── Helper: etiqueta de fecha legible ─────

function getDateLabel(date: Date, language: string, t: (k: string) => string): string {
    if (isToday(date)) return t('common.today');
    if (isYesterday(date)) return t('common.yesterday');
    const locale = language === 'es' ? esLocale : enUS;
    return format(date, "d 'de' MMMM, yyyy", { locale });
}

// ── Componente: fila de fecha ──────────────

function DateRow({
    date, onPress,
}: { date: Date; onPress: () => void }) {
    const { colors } = useTheme();
    const { t, language } = useTranslation();
    const label = getDateLabel(date, language, t);
    const isModified = !isToday(date);

    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.75}
            style={[
                styles.dateRow,
                {
                    backgroundColor: isModified
                        ? COLORS.primarySurface
                        : (colors.surface),
                    borderColor: isModified ? COLORS.primary + '40' : colors.border,
                },
            ]}
        >
            <Calendar
                size={18}
                color={isModified ? COLORS.primary : colors.textMuted}
                strokeWidth={2}
            />
            <Text
                variant="body"
                weight={isModified ? 'semibold' : 'regular'}
                color={isModified ? COLORS.primary : colors.textSecondary}
                style={{ flex: 1 }}
            >
                {label}
            </Text>
            <ChevronRight size={16} color={colors.textMuted} strokeWidth={1.8} />
        </TouchableOpacity>
    );
}

// ── Pantalla principal ────────────────────

export default function AddExpenseScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { colors, isDark } = useTheme();
    const { t, language } = useTranslation();
    const { currency } = useAppStore((s: AppState) => s);
    const addExpense = useExpenseStore((s: ExpenseState) => s.addExpense);

    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState<CategoryKey>('food');
    const [note, setNote] = useState('');
    const [date, setDate] = useState(new Date());
    const [showPicker, setShowPicker] = useState(false);
    const [saving, setSaving] = useState(false);
    const [hasError, setHasError] = useState(false);

    // ── Guardar ────────────────────────────
    const handleSave = useCallback(async () => {
        if (!isValidAmount(amount)) {
            setHasError(true);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            return;
        }
        setHasError(false);
        setSaving(true);
        try {
            await addExpense({
                amount: parseAmount(amount),
                category,
                note,
                date: date.toISOString(),
            });
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            router.back();
        } catch {
            Alert.alert(t('common.error'));
            setSaving(false);
        }
    }, [amount, category, note, date, addExpense, router, t]);

    // ── Cambio de fecha ────────────────────
    const handleDateChange = useCallback(
        (event: DateTimePickerEvent, selected?: Date) => {
            // En Android el picker se cierra solo al confirmar/cancelar
            if (Platform.OS === 'android') setShowPicker(false);
            if (event.type === 'set' && selected) {
                setDate(selected);
                Haptics.selectionAsync();
            }
        },
        []
    );

    // ── Render ────────────────────────────
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
                <Animated.View entering={FadeInDown.springify().damping(14)} style={styles.header}>
                    <Text variant="h2" weight="extrabold">{t('addExpense.title')}</Text>
                    <TouchableOpacity
                        onPress={() => router.back()}
                        hitSlop={12}
                        style={[styles.closeBtn, { backgroundColor: colors.surfaceAlt }]}
                    >
                        <X size={20} color={colors.textMuted} strokeWidth={2} />
                    </TouchableOpacity>
                </Animated.View>

                {/* ── Monto ── */}
                <Animated.View entering={FadeInDown.delay(40).springify().damping(14)}>
                    <AmountInput
                        value={amount}
                        onChange={(v) => { setAmount(v); setHasError(false); }}
                        hasError={hasError}
                        autoFocus
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
                <Animated.View entering={FadeInDown.delay(120).springify().damping(14)} style={styles.noteWrap}>
                    <Text variant="label" secondary style={styles.sectionLabel}>
                        {t('addExpense.note_label')}{' '}
                        <Text variant="caption" muted>({t('common.optional')})</Text>
                    </Text>
                    <TextInput
                        value={note}
                        onChangeText={setNote}
                        placeholder={t('addExpense.note_placeholder')}
                        placeholderTextColor={colors.textMuted}
                        returnKeyType="done"
                        onSubmitEditing={handleSave}
                        maxLength={80}
                        style={[
                            styles.noteInput,
                            {
                                color: colors.textPrimary,
                                backgroundColor: isDark ? colors.surfaceAlt : colors.surface,
                                fontFamily: 'Nunito_400Regular',
                            },
                        ]}
                        selectionColor={COLORS.primary}
                    />
                </Animated.View>

                {/* ── Fecha ── */}
                <Animated.View entering={FadeInDown.delay(150).springify().damping(14)}>
                    <Text variant="label" secondary style={styles.sectionLabel}>
                        {t('addExpense.date_label')}
                    </Text>
                    <DateRow date={date} onPress={() => setShowPicker(true)} />
                </Animated.View>

                {/* ── Botones: Guardar + Cancelar ── */}
                <Animated.View entering={FadeInUp.delay(180).springify().damping(14)} style={styles.actionsRow}>
                    {/* Cancelar — compacto */}
                    <TouchableOpacity
                        onPress={() => router.back()}
                        activeOpacity={0.75}
                        style={[styles.cancelBtn, { backgroundColor: colors.surfaceAlt }]}
                    >
                        <Text variant="label" weight="semibold" color={colors.textSecondary}>
                            {t('common.cancel')}
                        </Text>
                    </TouchableOpacity>

                    {/* Guardar — ocupa el resto */}
                    <View style={styles.saveBtn}>
                        <Button
                            label={t('addExpense.save_button')}
                            onPress={handleSave}
                            loading={saving}
                            size="lg"
                            fullWidth
                            icon={<Check size={18} color={COLORS.white} strokeWidth={2.5} />}
                        />
                    </View>
                </Animated.View>
            </ScrollView>

            {/* ── Date Picker ────────────────────────────────
          Android: el picker nativo se muestra como diálogo del sistema
          iOS:     lo mostramos en un Modal propio con el picker inline        */}

            {/* Android: aparece directamente sin modal */}
            {showPicker && Platform.OS === 'android' && (
                <DateTimePicker
                    value={date}
                    mode="date"
                    display="default"
                    maximumDate={new Date()}
                    onChange={handleDateChange}
                />
            )}

            {/* iOS: Modal con picker inline y botón confirmar */}
            {Platform.OS === 'ios' && (
                <Modal
                    visible={showPicker}
                    transparent
                    animationType="slide"
                    onRequestClose={() => setShowPicker(false)}
                >
                    <Pressable style={styles.pickerOverlay} onPress={() => setShowPicker(false)}>
                        <Pressable onPress={() => { }}>
                            <View style={[styles.pickerSheet, { backgroundColor: colors.surface }]}>
                                {/* Cabecera del sheet */}
                                <View style={styles.pickerHeader}>
                                    <TouchableOpacity onPress={() => setShowPicker(false)}>
                                        <Text variant="label" color={colors.textSecondary} weight="semibold">
                                            {t('common.cancel')}
                                        </Text>
                                    </TouchableOpacity>
                                    <Text variant="label" weight="bold">
                                        {t('addExpense.date_label')}
                                    </Text>
                                    <TouchableOpacity onPress={() => setShowPicker(false)}>
                                        <Text variant="label" color={COLORS.primary} weight="bold">
                                            {t('common.ok')}
                                        </Text>
                                    </TouchableOpacity>
                                </View>

                                {/* Picker */}
                                <DateTimePicker
                                    value={date}
                                    mode="date"
                                    display="spinner"
                                    maximumDate={new Date()}
                                    onChange={handleDateChange}
                                    locale={language === 'es' ? 'es-ES' : 'en-US'}
                                    style={styles.picker}
                                    themeVariant={isDark ? 'dark' : 'light'}
                                />
                            </View>
                        </Pressable>
                    </Pressable>
                </Modal>
            )}
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    root: { flex: 1 },
    handleWrap: { alignItems: 'center', paddingTop: SPACING.md, paddingBottom: SPACING.sm },
    handle: { width: 40, height: 4, borderRadius: 2 },
    scroll: { paddingHorizontal: SPACING.md, gap: SPACING.lg },

    // Header
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    closeBtn: {
        width: 36, height: 36,
        borderRadius: RADIUS.full,
        alignItems: 'center',
        justifyContent: 'center',
    },

    // Secciones
    sectionLabel: {
        paddingHorizontal: SPACING.sm,
        marginBottom: SPACING.xs,
    },
    noteWrap: { gap: 4 },
    noteInput: {
        borderRadius: RADIUS.lg,
        padding: SPACING.md,
        fontSize: 15,
        minHeight: 52,
    },

    // Fecha
    dateRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.md,
        borderRadius: RADIUS.lg,
        borderWidth: 1.5,
        gap: SPACING.sm,
    },

    // Botones de acción
    actionsRow: {
        flexDirection: 'row',
        gap: SPACING.sm,
        alignItems: 'center',
        marginTop: SPACING.xs,
    },
    cancelBtn: {
        paddingHorizontal: SPACING.lg,
        paddingVertical: 14,
        borderRadius: RADIUS.lg,
        alignItems: 'center',
        justifyContent: 'center',
    },
    saveBtn: { flex: 1 },

    // Date picker iOS sheet
    pickerOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'flex-end',
    },
    pickerSheet: {
        borderTopLeftRadius: RADIUS.xl * 1.5,
        borderTopRightRadius: RADIUS.xl * 1.5,
        paddingBottom: SPACING.xl,
        ...SHADOWS.lg,
    },
    pickerHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.md,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.08)',
    },
    picker: {
        height: 200,
    },
});
