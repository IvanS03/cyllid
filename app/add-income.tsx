// app/add-income.tsx
// ─────────────────────────────────────────
// Modal: agregar ingreso rápido
// Fuente → Monto → Nota → Recurrente → Fecha
// ─────────────────────────────────────────

import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { format, isToday, isYesterday } from 'date-fns';
import { enUS, es as esLocale } from 'date-fns/locale';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { Calendar, Check, ChevronRight, RefreshCw, X } from 'lucide-react-native';
import { useCallback, useState } from 'react';
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

import { useTranslation } from '../src/i18n/useTranslation';
import { AppState, useAppStore } from '../src/store/useAppStore';
import { IncomeState, useIncomeStore } from '../src/store/useIncomeStore';
import { INCOME_SOURCE_CONFIG, RADIUS, SHADOWS, SPACING } from '../src/theme';
import { useTheme } from '../src/theme/useTheme';
import { IncomeSource } from '../src/types';
import { isValidAmount, parseAmount } from '../src/utils/helpers';

import { SourcePicker } from '../src/components/SourcePicker';
import { AmountInput } from '../src/components/ui/AmountInput';
import { Button } from '../src/components/ui/Button';
import { Text } from '../src/components/ui/Text';

function getDateLabel(date: Date, language: string, t: (k: string) => string) {
    if (isToday(date)) return t('common.today');
    if (isYesterday(date)) return t('common.yesterday');
    const locale = language === 'es' ? esLocale : enUS;
    return format(date, "d 'de' MMMM, yyyy", { locale });
}

export default function AddIncomeScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { colors, isDark } = useTheme();
    const { t, language } = useTranslation();
    const { currency } = useAppStore((s: AppState) => s);
    const addIncome = useIncomeStore((s: IncomeState) => s.addIncome);

    const [amount, setAmount] = useState('');
    const [source, setSource] = useState<IncomeSource>('salary');
    const [note, setNote] = useState('');
    const [recurrent, setRecurrent] = useState(false);
    const [date, setDate] = useState(new Date());
    const [showPicker, setShowPicker] = useState(false);
    const [saving, setSaving] = useState(false);
    const [hasError, setHasError] = useState(false);

    const srcConfig = INCOME_SOURCE_CONFIG[source];

    const handleSave = useCallback(async () => {
        if (!isValidAmount(amount)) {
            setHasError(true);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            return;
        }
        setHasError(false);
        setSaving(true);
        try {
            await addIncome({ amount: parseAmount(amount), source, note, date: date.toISOString(), recurrent });
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            router.back();
        } catch {
            Alert.alert(t('common.error'));
            setSaving(false);
        }
    }, [amount, source, note, date, recurrent, addIncome, router, t]);

    const handleDateChange = useCallback((event: DateTimePickerEvent, selected?: Date) => {
        if (Platform.OS === 'android') setShowPicker(false);
        if (event.type === 'set' && selected) { setDate(selected); Haptics.selectionAsync(); }
    }, []);

    const isModified = !isToday(date);

    return (
        <KeyboardAvoidingView
            style={[styles.root, { backgroundColor: colors.background }]}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            {/* Handle */}
            <View style={styles.handleWrap}>
                <View style={[styles.handle, { backgroundColor: colors.border }]} />
            </View>

            <ScrollView
                contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + SPACING.xl }]}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                {/* ── Header ── */}
                <Animated.View entering={FadeInDown.springify().damping(14)} style={styles.header}>
                    <View style={styles.headerLeft}>
                        <Text variant="h2" weight="extrabold">{t('income.title')}</Text>
                        {/* Badge de fuente seleccionada */}
                        <View style={[styles.srcBadge, { backgroundColor: srcConfig.color + '18' }]}>
                            <Text variant="caption" weight="bold" color={srcConfig.color}>
                                {t(`sources.${source}`)}
                            </Text>
                        </View>
                    </View>
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

                {/* ── Fuente ── */}
                <Animated.View entering={FadeInDown.delay(80).springify().damping(14)}>
                    <Text variant="label" secondary style={styles.sectionLabel}>
                        {t('income.source_label')}
                    </Text>
                    <SourcePicker selected={source} onSelect={setSource} />
                </Animated.View>

                {/* ── Nota ── */}
                <Animated.View entering={FadeInDown.delay(110).springify().damping(14)} style={{ gap: 4 }}>
                    <Text variant="label" secondary style={styles.sectionLabel}>
                        {t('addExpense.note_label')}{' '}
                        <Text variant="caption" muted>({t('common.optional')})</Text>
                    </Text>
                    <TextInput
                        value={note}
                        onChangeText={setNote}
                        placeholder={`Ej. ${t(`sources.${source}`)}`}
                        placeholderTextColor={colors.textMuted}
                        returnKeyType="done"
                        maxLength={80}
                        style={[styles.noteInput, {
                            color: colors.textPrimary,
                            backgroundColor: isDark ? colors.surfaceAlt : colors.surface,
                            fontFamily: 'Nunito_400Regular',
                        }]}
                        selectionColor={srcConfig.color}
                    />
                </Animated.View>

                {/* ── Recurrente ── */}
                <Animated.View entering={FadeInDown.delay(130).springify().damping(14)}>
                    <TouchableOpacity
                        onPress={() => { setRecurrent(!recurrent); Haptics.selectionAsync(); }}
                        activeOpacity={0.8}
                        style={[styles.recurrentRow, {
                            backgroundColor: recurrent ? srcConfig.color + '12' : (isDark ? colors.surfaceAlt : colors.surface),
                            borderColor: recurrent ? srcConfig.color + '40' : colors.border,
                        }]}
                    >
                        <RefreshCw
                            size={18}
                            color={recurrent ? srcConfig.color : colors.textMuted}
                            strokeWidth={2}
                        />
                        <View style={{ flex: 1 }}>
                            <Text variant="label" weight="medium" color={recurrent ? srcConfig.color : colors.textPrimary}>
                                {t('income.recurrent_label')}
                            </Text>
                            <Text variant="caption" secondary>{t('income.recurrent_hint')}</Text>
                        </View>
                        <Switch
                            value={recurrent}
                            onValueChange={(v) => { setRecurrent(v); Haptics.selectionAsync(); }}
                            trackColor={{ false: colors.border, true: srcConfig.color + '80' }}
                            thumbColor={recurrent ? srcConfig.color : colors.textMuted}
                        />
                    </TouchableOpacity>
                </Animated.View>

                {/* ── Fecha ── */}
                <Animated.View entering={FadeInDown.delay(150).springify().damping(14)}>
                    <Text variant="label" secondary style={styles.sectionLabel}>
                        {t('addExpense.date_label')}
                    </Text>
                    <TouchableOpacity
                        onPress={() => setShowPicker(true)}
                        activeOpacity={0.75}
                        style={[styles.dateRow, {
                            backgroundColor: isModified ? srcConfig.color + '10' : (isDark ? colors.surfaceAlt : colors.surface),
                            borderColor: isModified ? srcConfig.color + '50' : colors.border,
                        }]}
                    >
                        <Calendar size={18} color={isModified ? srcConfig.color : colors.textMuted} strokeWidth={2} />
                        <Text variant="body" weight={isModified ? 'semibold' : 'regular'}
                            color={isModified ? srcConfig.color : colors.textSecondary} style={{ flex: 1 }}>
                            {getDateLabel(date, language, t)}
                        </Text>
                        <ChevronRight size={16} color={colors.textMuted} strokeWidth={1.8} />
                    </TouchableOpacity>
                </Animated.View>

                {/* ── Botones ── */}
                <Animated.View entering={FadeInUp.delay(170).springify().damping(14)} style={styles.actionsRow}>
                    <TouchableOpacity
                        onPress={() => router.back()}
                        activeOpacity={0.75}
                        style={[styles.cancelBtn, { backgroundColor: colors.surfaceAlt }]}
                    >
                        <Text variant="label" weight="semibold" color={colors.textSecondary}>
                            {t('common.cancel')}
                        </Text>
                    </TouchableOpacity>
                    <View style={styles.saveBtn}>
                        <Button
                            label={t('income.save_button')}
                            onPress={handleSave}
                            loading={saving}
                            size="lg"
                            fullWidth
                            icon={<Check size={18} color="#FFF" strokeWidth={2.5} />}
                            style={{ backgroundColor: srcConfig.color, ...SHADOWS.md, shadowColor: srcConfig.color }}
                        />
                    </View>
                </Animated.View>
            </ScrollView>

            {/* Android date picker */}
            {showPicker && Platform.OS === 'android' && (
                <DateTimePicker value={date} mode="date" display="default"
                    maximumDate={new Date()} onChange={handleDateChange} />
            )}

            {/* iOS date picker sheet */}
            {Platform.OS === 'ios' && (
                <Modal visible={showPicker} transparent animationType="slide" onRequestClose={() => setShowPicker(false)}>
                    <Pressable style={styles.pickerOverlay} onPress={() => setShowPicker(false)}>
                        <Pressable onPress={() => { }}>
                            <View style={[styles.pickerSheet, { backgroundColor: colors.surface }]}>
                                <View style={styles.pickerHeader}>
                                    <TouchableOpacity onPress={() => setShowPicker(false)}>
                                        <Text variant="label" color={colors.textSecondary} weight="semibold">{t('common.cancel')}</Text>
                                    </TouchableOpacity>
                                    <Text variant="label" weight="bold">{t('addExpense.date_label')}</Text>
                                    <TouchableOpacity onPress={() => setShowPicker(false)}>
                                        <Text variant="label" color={srcConfig.color} weight="bold">{t('common.ok')}</Text>
                                    </TouchableOpacity>
                                </View>
                                <DateTimePicker value={date} mode="date" display="spinner"
                                    maximumDate={new Date()} onChange={handleDateChange}
                                    locale={language === 'es' ? 'es-ES' : 'en-US'}
                                    style={{ height: 200 }}
                                    themeVariant={isDark ? 'dark' : 'light'} />
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
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    headerLeft: { flex: 1, gap: SPACING.xs },
    srcBadge: { flexDirection: 'row', alignSelf: 'flex-start', paddingHorizontal: SPACING.sm, paddingVertical: 3, borderRadius: RADIUS.full },
    closeBtn: { width: 36, height: 36, borderRadius: RADIUS.full, alignItems: 'center', justifyContent: 'center' },
    sectionLabel: { paddingHorizontal: SPACING.sm, marginBottom: SPACING.xs },
    noteInput: { borderRadius: RADIUS.lg, padding: SPACING.md, fontSize: 15, minHeight: 52 },
    recurrentRow: {
        flexDirection: 'row', alignItems: 'center', gap: SPACING.md,
        padding: SPACING.md, borderRadius: RADIUS.lg, borderWidth: 1.5,
    },
    dateRow: {
        flexDirection: 'row', alignItems: 'center', gap: SPACING.sm,
        paddingHorizontal: SPACING.md, paddingVertical: SPACING.md,
        borderRadius: RADIUS.lg, borderWidth: 1.5,
    },
    actionsRow: { flexDirection: 'row', gap: SPACING.sm, alignItems: 'center', marginTop: SPACING.xs },
    cancelBtn: { paddingHorizontal: SPACING.lg, paddingVertical: 14, borderRadius: RADIUS.lg, alignItems: 'center', justifyContent: 'center' },
    saveBtn: { flex: 1 },
    pickerOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
    pickerSheet: { borderTopLeftRadius: RADIUS.xl * 1.5, borderTopRightRadius: RADIUS.xl * 1.5, paddingBottom: SPACING.xl, ...SHADOWS.lg },
    pickerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.08)' },
});