// src/hooks/useResponsive.ts
// ─────────────────────────────────────────
// Hook reactivo de responsive — se actualiza al rotar
// la pantalla o en multitarea en iPad
// ─────────────────────────────────────────

import { useMemo } from 'react';
import { useWindowDimensions } from 'react-native';

const BASE_W = 393;

export function useResponsive() {
    const { width: W, height: H, fontScale } = useWindowDimensions();

    return useMemo(() => {
        const isTablet = W >= 600;
        const isLargeTablet = W >= 900;
        const isLandscape = W > H;
        const ratio = W / BASE_W;

        // Escala moderada para espacios
        const ms = (size: number, factor = 0.45) => {
            if (isTablet) return Math.round(size * (1 + factor * (ratio - 1)));
            const scaled = ratio * size;
            return Math.round(size + (scaled - size) * factor);
        };

        // Escala conservadora para fuentes
        const fs = (size: number) => {
            if (isTablet) return Math.round(Math.min(size * 1.15, size + 4));
            return ms(size, 0.3);
        };

        // Porcentajes
        const wp = (pct: number) => Math.round(W * (pct / 100));
        const hp = (pct: number) => Math.round(H * (pct / 100));

        // Ancho máximo del contenido (tablet: centrado)
        const contentMaxW = isTablet ? Math.min(W, 680) : W;
        const contentPaddingH = isTablet ? Math.round((W - contentMaxW) / 2) : 0;

        // Número de columnas para grids
        const metricCols = isLargeTablet ? 4 : isTablet ? 3 : 3;
        const categoryRows = isTablet ? 2 : 1; // filas en CategoryPicker

        return {
            W, H,
            isTablet, isLargeTablet, isLandscape,
            ms, fs, wp, hp,
            contentMaxW, contentPaddingH,
            metricCols, categoryRows,
            fontScale: Math.min(fontScale, 1.3), // limitar accesibilidad para no romper layout
        };
    }, [W, H, fontScale]);
}