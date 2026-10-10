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
  hairline: 'rgba(0, 0, 0, 0.08)',
  /** Bordo dei bottoni secondari e delle carte: grigio scuro, sottile */
  line: '#3A3A3C',

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

/**
 * Serif delle carte: Fraunces, un "old style" morbido e un po' storto che parla
 * la stessa lingua delle mascotte rubber-hose (caricata in app/_layout.tsx).
 * Con un font custom il peso sta nel nome della famiglia, non in fontWeight.
 */
export const fonts = { serifBold: 'Fraunces_700Bold', serifSemi: 'Fraunces_600SemiBold' } as const;

/**
 * Scala tipografica unica (terzo giro di review):
 * 4 taglie per l'interfaccia (13 · 15 · 17 · 22), più il serif delle carte e i numeri grandi.
 * 3 pesi: 400 testi, 600 etichette e titoli, 800 numeri e titoli di schermata.
 */
export const type = {
  display: { fontSize: 34, lineHeight: 40, fontWeight: '800', letterSpacing: -0.8, fontVariant: ['tabular-nums'] },
  title: { fontSize: 22, lineHeight: 28, fontWeight: '800', letterSpacing: -0.4 },
  cardTitle: { fontSize: 17, lineHeight: 22, fontWeight: '600', letterSpacing: -0.2 },
  headline: { fontSize: 17, lineHeight: 22, fontWeight: '600', letterSpacing: -0.2 },
  name: { fontSize: 15, lineHeight: 20, fontWeight: '600' },
  body: { fontSize: 15, lineHeight: 21, fontWeight: '400' },
  caption: { fontSize: 13, lineHeight: 18, fontWeight: '600' },
  micro: { fontSize: 12, lineHeight: 16, fontWeight: '600' },
  number: { fontSize: 22, lineHeight: 26, fontWeight: '800', fontVariant: ['tabular-nums'] },
  serifTitle: { fontFamily: fonts.serifBold, fontSize: 32, lineHeight: 38, letterSpacing: -0.6 },
  serifHeading: { fontFamily: fonts.serifBold, fontSize: 26, lineHeight: 32, letterSpacing: -0.4 },
  serifCard: { fontFamily: fonts.serifSemi, fontSize: 18, lineHeight: 22, letterSpacing: -0.2 },
} as const;

/** Layout: margine laterale, spazio tra sezioni, padding delle card. */
export const layout = { gutter: 20, section: 32, card: 20 } as const;

/** Una sola ombra, solo per ciò che galleggia (navbar, toast, popup). */
export const shadow = {
  /** Niente ombre su card e bottoni: la gerarchia la fanno superfici e spazi. */
  card: {},
  avatar: {},
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
