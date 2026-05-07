# 💸 Cyllid — React Native + Expo

App de control de gastos personales. Offline-first, minimalista, bilingüe.

## Stack
- **Expo SDK 51** + Expo Router (file-based routing)
- **Zustand** — estado global
- **AsyncStorage** — persistencia offline
- **Reanimated 3** — animaciones suaves
- **date-fns** — manejo de fechas (ES/EN)
- **Nunito** — tipografía (Google Fonts)

## Estructura de archivos (35 archivos)

```
gastos-app/
├── app/
│   ├── _layout.tsx              ✅ Root layout + fuentes + stores
│   ├── add.tsx                  ✅ Modal agregar gasto (<3 seg)
│   ├── edit/[id].tsx            ✅ Editar / eliminar gasto
│   └── (tabs)/
│       ├── _layout.tsx          ✅ Tab bar animada + haptics
│       ├── index.tsx            ✅ Home: resumen + lista agrupada
│       ├── stats.tsx            ✅ Estadísticas: barras + burbujas
│       └── settings.tsx         ✅ Ajustes: tema + idioma + moneda
│
├── src/
│   ├── i18n/
│   │   ├── es.ts                ✅ ~80 claves en español
│   │   ├── en.ts                ✅ Traducción completa al inglés
│   │   ├── index.ts             ✅ Motor i18n: t(), tp(), store
│   │   └── useTranslation.ts    ✅ Hook principal
│   ├── theme/
│   │   ├── index.ts             ✅ Colores, spacing, shadows, CATEGORY_CONFIG
│   │   └── useTheme.ts          ✅ Hook modo oscuro/claro
│   ├── store/
│   │   ├── useExpenseStore.ts   ✅ CRUD + selectores (Zustand)
│   │   └── useAppStore.ts       ✅ Tema, moneda, premium
│   ├── types/index.ts           ✅ Tipos TypeScript globales
│   ├── utils/
│   │   ├── storage.ts           ✅ AsyncStorage abstraction
│   │   ├── helpers.ts           ✅ Formateo, fechas, agrupación
│   │   └── ads.ts               ✅ Estructura AdMob lista
│   └── components/
│       ├── ui/
│       │   ├── Text.tsx         ✅ 9 variantes tipográficas
│       │   ├── Button.tsx       ✅ 5 variantes + haptics
│       │   ├── Card.tsx         ✅ Contenedor con sombra
│       │   └── AmountInput.tsx  ✅ Input gigante con autoFocus
│       ├── CategoryPicker.tsx   ✅ Scroll horizontal animado
│       ├── ExpenseItem.tsx      ✅ Fila con FadeInRight escalonado
│       ├── MonthSummaryCard.tsx ✅ Hero card con gradiente
│       ├── FAB.tsx              ✅ Botón flotante con pulso
│       ├── BannerAd.tsx         ✅ Placeholder AdMob
│       ├── LanguageSwitcher.tsx ✅ Toggle ES/EN animado
│       ├── EmptyState.tsx       ✅ Emoji flotante animado
│       └── index.ts             ✅ Barrel exports
│
├── package.json
├── app.json
└── babel.config.js
```

## Instalación y uso

```bash
# 1. Instalar dependencias
npm install

# 2. Iniciar Expo
npx expo start

# 3. Abrir en dispositivo (escanea el QR con Expo Go)
#    o presiona 'a' para Android, 'i' para iOS
```

## Funcionalidades MVP ✅

| Funcionalidad | Estado |
|---|---|
| Registrar gasto en <3 seg | ✅ |
| Monto + categoría + nota | ✅ |
| Guardado offline (AsyncStorage) | ✅ |
| Lista de gastos recientes | ✅ |
| Resumen mensual | ✅ |
| Editar / eliminar gastos | ✅ |
| Español / Inglés (i18n) | ✅ |
| Modo oscuro / claro / sistema | ✅ |
| Estadísticas por categoría | ✅ |
| Estructura AdMob lista | ✅ |
| Base versión Premium | ✅ |

## Color principal: `#7119c3`

## Monetización
- **Gratis**: Banner AdMob (placeholder listo — ver `src/utils/ads.ts`)
- **Premium**: Sin anuncios. Activar con `useAppStore().setPremium(true)`
- Para in-app purchase real: integrar `expo-in-app-purchases`