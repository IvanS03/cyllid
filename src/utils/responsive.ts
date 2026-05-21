// src/utils/responsive.ts
// ─────────────────────────────────────────
// Sistema de escalado responsive
// Funciona con distintas densidades DPI y tablets
// ─────────────────────────────────────────

import { Dimensions, PixelRatio } from 'react-native';

const { width: W, height: H } = Dimensions.get('window');

// ── Referencia base (iPhone 14 Pro = 393 dp) ──
const BASE_W = 393;

// ── Breakpoints ───────────────────────────────
export const SCREEN = { W, H };

/** >= 600dp → tablet */
export const isTablet = W >= 600;
/** >= 900dp → tablet grande / iPad Pro */
export const isLargeTablet = W >= 900;
/** Ratio de escala bruta pantalla vs base */
export const scaleRatio = W / BASE_W;

// ── Funciones de escala ───────────────────────

/**
 * Escala moderada — usa un factor para no escalar demasiado agresivo.
 * factor=0  → siempre el tamaño base (sin escalar)
 * factor=1  → escala lineal completa con la pantalla
 * factor=0.45 → punto medio (recomendado para espacios)
 */
export function ms(size: number, factor = 0.45): number {
    const scaled = scaleRatio * size;
    return Math.round(size + (scaled - size) * factor);
}

/**
 * Escala de fuentes — más conservadora que ms().
 * Evita que en tablets el texto se vea enorme.
 */
export function fs(size: number): number {
    // Tablets: escalar ligeramente pero limitar el máximo
    if (isTablet) return Math.round(Math.min(size * 1.15, size + 4));
    return ms(size, 0.3);
}

/**
 * Escala de espacios — más agresiva que fuentes.
 */
export function ss(size: number): number {
    if (isTablet) return Math.round(size * 1.35);
    return ms(size, 0.5);
}

/**
 * Porcentaje del ancho de pantalla.
 * wp(100) === SCREEN.W
 */
export function wp(pct: number): number {
    return Math.round(W * (pct / 100));
}

/**
 * Porcentaje del alto de pantalla.
 */
export function hp(pct: number): number {
    return Math.round(H * (pct / 100));
}

// ── Ancho máximo de contenido ─────────────────

/**
 * En teléfonos: usa todo el ancho.
 * En tablets:   centra el contenido en un max de 680dp.
 */
export const CONTENT_MAX_W = isTablet ? Math.min(W, 680) : W;

/**
 * Padding horizontal base para centrar el contenido en tablet.
 */
export const CONTENT_PADDING_H = isTablet
    ? Math.round((W - CONTENT_MAX_W) / 2)
    : 0;

// ── Grid helpers ──────────────────────────────

/** Número de columnas recomendado por tipo de contenido */
export const GRID = {
    /** Tarjetas de métricas (3 en phone, 4 en tablet) */
    metricCols: isTablet ? 4 : 3,
    /** Columnas de categorías en picker */
    categoryCols: isTablet ? 4 : 2,
};

// ── Tamaño de hit area para accesibilidad ─────
/** Tamaño mínimo recomendado para botones táctiles (44dp) */
export const MIN_HIT = 44;

// ── Pixel ratio ───────────────────────────────
export const PIXEL_RATIO = PixelRatio.get();
export const FONT_SCALE = PixelRatio.getFontScale();

/**
 * Normaliza tamaño de fuente respetando la configuración
 * de accesibilidad del sistema (fontSize del usuario).
 * Limita a 1.3× para no romper layouts.
 */
export function normalizeFontSize(size: number): number {
    const capped = Math.min(FONT_SCALE, 1.3);
    return Math.round(fs(size) / capped);
}