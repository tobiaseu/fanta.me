/**
 * Design tokens di Fanta.me.
 *
 * Ogni valore qui è l'equivalente di una variabile Figma: colori, spaziature
 * (gap dell'Auto Layout), raggi e tipografia. I componenti non usano mai valori
 * "magici", così il passaggio Figma → codice resta 1:1.
 */
import { Platform } from 'react-native';

export const colors = {
  // Superfici
  background: '#F2F2F7', // off-white di sistema iOS
  surface: '#FFFFFF',
  surfaceMuted: '#E9E9F0',
  hairline: 'rgba(28, 28, 30, 0.08)',

  // Testo
  ink: '#1C1C1E',
  inkSoft: '#3A3A3F',
  inkMuted: '#8A8A95',
  inkInverse: '#FFFFFF',

  // Stato "in gioco" (verde pastello)
  live: '#34C759',
  liveSoft: '#D6F5DE',
  liveInk: '#1E7A3A',

  // CTA primaria (giallo/arancio vibrante)
  cta: '#FF9F1C',
  ctaPressed: '#F08700',
  ctaSoft: '#FFE8C2',
  ctaInk: '#1C1C1E',

  // Punteggi
  bonus: '#1E9E4A',
  bonusSoft: '#DDF6E4',
  malus: '#E5484D',
  malusSoft: '#FDE3E4',

  // Palette illustrazioni rubber-hose (sempre 2 colori + bordo bianco sticker)
  toonRed: '#FF4B3E',
  toonBlue: '#2E6BFF',
  toonYellow: '#FFC531',
  toonPurple: '#8B5CF6',
  toonInk: '#17171A',
  sticker: '#FFFFFF',
} as const;

/** Scala di spaziatura: 16/24 sono i gap "di respiro" delle linee guida. */
export const space = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const radius = {
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  pill: 999,
} as const;

const rounded = Platform.select({ ios: 'ui-rounded', default: undefined });

export const type = {
  display: { fontFamily: rounded, fontSize: 32, lineHeight: 36, fontWeight: '800', letterSpacing: -0.6 },
  title: { fontFamily: rounded, fontSize: 22, lineHeight: 28, fontWeight: '800', letterSpacing: -0.3 },
  headline: { fontSize: 17, lineHeight: 22, fontWeight: '700' },
  body: { fontSize: 15, lineHeight: 21, fontWeight: '500' },
  caption: { fontSize: 13, lineHeight: 17, fontWeight: '600' },
  micro: { fontSize: 11, lineHeight: 14, fontWeight: '700', letterSpacing: 0.4, textTransform: 'uppercase' },
  number: { fontFamily: rounded, fontSize: 28, lineHeight: 32, fontWeight: '800', fontVariant: ['tabular-nums'] },
} as const;

/** Ombra morbida unica per le card: niente "muro di mattoni". */
export const shadow = {
  card: Platform.select({
    web: { boxShadow: '0 6px 20px rgba(28, 28, 30, 0.06)' },
    default: {
      shadowColor: '#1C1C1E',
      shadowOpacity: 0.06,
      shadowRadius: 20,
      shadowOffset: { width: 0, height: 6 },
      elevation: 3,
    },
  }),
  floating: Platform.select({
    web: { boxShadow: '0 10px 28px rgba(240, 135, 0, 0.35)' },
    default: {
      shadowColor: '#F08700',
      shadowOpacity: 0.35,
      shadowRadius: 18,
      shadowOffset: { width: 0, height: 10 },
      elevation: 8,
    },
  }),
};

/** Larghezza massima del "telefono" quando l'app gira sul web. */
export const MAX_APP_WIDTH = 440;
