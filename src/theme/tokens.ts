/**
 * Design tokens di Fanta.me, allineati al file Figma "Fanta.me"
 * (pagine Component master + Prototype).
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
  surfaceMuted: '#E9E9EE',
  placeholder: '#D9D9D9',
  hairline: 'rgba(0, 0, 0, 0.06)',

  // Testo
  ink: '#000000',
  inkSoft: '#6E6E6E',
  inkMuted: 'rgba(0, 0, 0, 0.5)',
  inkFaint: '#909090',
  inkInverse: '#FFFFFF',

  // Stato "in partita" (verde)
  live: '#0B8200',
  liveSoft: 'rgba(11, 130, 0, 0.2)', // card lega in corso
  liveStrip: 'rgba(11, 130, 0, 0.2)', // banda laterale sovrapposta
  liveInk: '#0B8200',

  // CTA primaria (giallo burro)
  cta: '#FFE382',
  ctaPressed: '#F7D45E',
  ctaSoft: 'rgba(255, 227, 130, 0.2)', // card lega in attesa
  ctaInk: '#000000',

  // Lega conclusa
  ended: 'rgba(135, 135, 135, 0.2)',

  // Punteggi e voto
  bonus: '#0B8200',
  bonusBright: '#1CB100',
  bonusSoft: 'rgba(121, 245, 96, 0.5)',
  bonusBorder: '#1BA700',
  malus: '#D92D20',
  malusSoft: 'rgba(255, 130, 130, 0.5)',
  malusBorder: '#FF0000',

  // Palette illustrazioni rubber-hose (come lo sticker "La Smurratona")
  toonBody: '#FFFDF5',
  toonBlue: '#2F7BEA',
  toonRed: '#F25C54',
  toonYellow: '#FFD84D',
  toonPurple: '#8B6CF6',
  toonGreen: '#3DBA5B',
  toonInk: '#111114',
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
  lg: 24, // card, CTA
  xl: 28, // navbar flottante
  bar: 36, // top bar
  pill: 999,
} as const;

/** Serif da "carta trofeo" (Apple Garamond nel Figma). */
const serif = Platform.select({ ios: 'Georgia', android: 'serif', default: 'Georgia, "Times New Roman", serif' });

export const type = {
  display: { fontSize: 28, lineHeight: 34, fontWeight: '600', letterSpacing: -0.4 },
  title: { fontSize: 24, lineHeight: 29, fontWeight: '600', letterSpacing: -0.2 },
  cardTitle: { fontSize: 20, lineHeight: 24, fontWeight: '600' },
  headline: { fontSize: 17, lineHeight: 22, fontWeight: '600' },
  name: { fontSize: 16, lineHeight: 19, fontWeight: '700' },
  body: { fontSize: 15, lineHeight: 20, fontWeight: '500' },
  caption: { fontSize: 14, lineHeight: 17, fontWeight: '600' },
  micro: { fontSize: 12, lineHeight: 14, fontWeight: '700' },
  number: { fontSize: 24, lineHeight: 28, fontWeight: '700', fontVariant: ['tabular-nums'] },
  watermark: { fontSize: 128, lineHeight: 136, fontWeight: '600', letterSpacing: -4 },
  serifTitle: { fontFamily: serif, fontSize: 32, lineHeight: 38, fontWeight: '700' },
  serifCard: { fontFamily: serif, fontSize: 17, lineHeight: 21, fontWeight: '700' },
} as const;

/** Ombra morbida unica: niente "muro di mattoni". */
export const shadow = {
  card: Platform.select({
    web: { boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)' },
    default: {
      shadowColor: '#000',
      shadowOpacity: 0.04,
      shadowRadius: 16,
      shadowOffset: { width: 0, height: 4 },
      elevation: 2,
    },
  }),
  avatar: Platform.select({
    web: { boxShadow: '0 6px 14px rgba(0, 0, 0, 0.18)' },
    default: {
      shadowColor: '#000',
      shadowOpacity: 0.18,
      shadowRadius: 14,
      shadowOffset: { width: 0, height: 6 },
      elevation: 6,
    },
  }),
  floating: Platform.select({
    web: { boxShadow: '0 10px 30px rgba(0, 0, 0, 0.08)' },
    default: {
      shadowColor: '#000',
      shadowOpacity: 0.08,
      shadowRadius: 30,
      shadowOffset: { width: 0, height: 10 },
      elevation: 8,
    },
  }),
};

/** Larghezza massima del "telefono" quando l'app gira sul web. */
export const MAX_APP_WIDTH = 440;
