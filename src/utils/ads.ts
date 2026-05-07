// src/utils/ads.ts
// ─────────────────────────────────────────
// Estructura para AdMob / Monetización
// Preparada para integrar expo-ads-admob o
// react-native-google-mobile-ads
// ─────────────────────────────────────────

// IDs de prueba de AdMob (reemplazar con IDs reales en producción)
export const AD_UNIT_IDS = {
  // Android
  android: {
    banner: 'ca-app-pub-3940256099942544/6300978111', // TEST
    interstitial: 'ca-app-pub-3940256099942544/1033173712', // TEST
    rewarded: 'ca-app-pub-3940256099942544/5224354917', // TEST
  },
  // iOS
  ios: {
    banner: 'ca-app-pub-3940256099942544/2934735716', // TEST
    interstitial: 'ca-app-pub-3940256099942544/4411468910', // TEST
    rewarded: 'ca-app-pub-3940256099942544/1712485313', // TEST
  },
};

// Frecuencia de anuncios (cada N acciones)
export const AD_FREQUENCY = {
  afterAddExpenses: 5,    // Mostrar banner cada 5 gastos agregados
  interstitialOnStats: 3, // Interstitial cada 3 veces que abre stats
};

// Mock del servicio de anuncios
// En producción, usar: import { BannerAd, InterstitialAd } from 'react-native-google-mobile-ads'
export class AdsService {
  private static instance: AdsService;
  private addCount = 0;
  private statsOpenCount = 0;

  static getInstance(): AdsService {
    if (!AdsService.instance) {
      AdsService.instance = new AdsService();
    }
    return AdsService.instance;
  }

  onExpenseAdded(): boolean {
    this.addCount++;
    return this.addCount % AD_FREQUENCY.afterAddExpenses === 0;
  }

  onStatsOpened(): boolean {
    this.statsOpenCount++;
    return this.statsOpenCount % AD_FREQUENCY.interstitialOnStats === 0;
  }

  reset() {
    this.addCount = 0;
    this.statsOpenCount = 0;
  }
}

/*
 * INSTRUCCIONES DE INTEGRACIÓN REAL:
 * 
 * 1. Instalar: npx expo install react-native-google-mobile-ads
 * 2. Añadir a app.json:
 *    "react-native-google-mobile-ads": {
 *      "android_app_id": "ca-app-pub-XXXXX~YYYYY",
 *      "ios_app_id": "ca-app-pub-XXXXX~YYYYY"
 *    }
 * 3. Reemplazar IDs de prueba con IDs reales de AdMob
 * 4. En BannerAdComponent: usar <BannerAd unitId={...} size={BannerAdSize.BANNER} />
 * 
 * VERSIÓN PREMIUM:
 * - useAppStore().isPremium === true → no mostrar anuncios
 * - Implementar compra in-app con expo-in-app-purchases
 */
