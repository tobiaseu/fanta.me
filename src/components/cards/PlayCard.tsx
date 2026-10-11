import { useRef } from 'react';
import { Platform, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, RadialGradient, Rect, Stop } from 'react-native-svg';

import { Icon, type IconName } from '@/components/icons/Icon';
import { AppText } from '@/components/ui/AppText';
import { PressableScale } from '@/components/ui/PressableScale';
import { RULE_CATEGORIES } from '@/data/rules';
import { haptics } from '@/lib/haptics';
import { colors, isDark, radius, space } from '@/theme/tokens';
import type { Rule } from '@/types/game';

const EMOJI_FONT = Platform.select({
  web: '"Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif',
  default: undefined,
});

/** Proporzione di una carta da gioco vera (63 × 88 mm): la stessa in griglia e aperta. */
export const PLAY_RATIO = 63 / 88;

/** Rettangolo della carta sullo schermo: da qui parte l'animazione di apertura. */
export type CardRect = { x: number; y: number; width: number; height: number };

export type Tier = 'normal' | 'rare' | 'epic';

/** Rarità: base = normale, creata da qualcuno = rara, vinta = epica. */
export function tierOf(rule: Rule): Tier {
  if (rule.epic) return 'epic';
  if (rule.authorId) return 'rare';
  return 'normal';
}

export const TIER_LABEL: Record<Tier, string> = { normal: 'Normale', rare: 'Rara', epic: 'Epica' };

/**
 * Il colore dice solo la rarità:
 * normale = bianco con un bagliore giallo Fanta.me, rara = arancio pieno, epica = notte con aura viola e oro.
 */
type Paint = {
  top: string;
  bottom: string;
  glow: string;
  glowOpacity: number;
  ring: string;
  ink: string;
  soft: string;
  /** Testo chiaro sopra (fondo scuro o pieno) */
  inverse: boolean;
};

const WHITE_INK = { ink: '#FFFFFF', soft: 'rgba(255,255,255,0.8)', inverse: true };

/**
 * Normale: verde tenue se è un bonus, rosso tenue se è un malus, con il bagliore giallo Fanta.me.
 * In tema scuro gli stessi toni diventano notturni. Rara e epica sono uguali nei due temi.
 */
const NORMAL: Record<'bonus' | 'malus', Paint> = isDark
  ? {
      bonus: { top: '#16301F', bottom: '#0D1A12', glow: colors.cta, glowOpacity: 0.32, ring: '#FFFFFF', ...WHITE_INK },
      malus: { top: '#33191A', bottom: '#1C0E0F', glow: colors.cta, glowOpacity: 0.32, ring: '#FFFFFF', ...WHITE_INK },
    }
  : {
      bonus: {
        top: '#F2FBEF',
        bottom: '#D9F2D2',
        glow: colors.cta,
        glowOpacity: 0.8,
        ring: '#0B8200',
        ink: '#0F1A10',
        soft: 'rgba(15,26,16,0.6)',
        inverse: false,
      },
      malus: {
        top: '#FFF3F2',
        bottom: '#FBDCD9',
        glow: colors.cta,
        glowOpacity: 0.8,
        ring: '#D92D20',
        ink: '#1F0F0E',
        soft: 'rgba(31,15,14,0.6)',
        inverse: false,
      },
    };

const RARE: Paint = {
  top: '#FFB45C',
  bottom: '#F0662E',
  glow: '#FFFFFF',
  glowOpacity: 0.45,
  ring: '#FFFFFF',
  ...WHITE_INK,
};
const EPIC: Paint = {
  top: '#2A1F4E',
  bottom: '#0E0E11',
  glow: '#B48CFF',
  glowOpacity: 0.7,
  ring: '#FFD27A',
  ...WHITE_INK,
};

export function cardPaint(rule: Rule): Paint {
  const tier = tierOf(rule);
  if (tier === 'epic') return EPIC;
  if (tier === 'rare') return RARE;
  return NORMAL[rule.points > 0 ? 'bonus' : 'malus'];
}

const DAY = new Intl.DateTimeFormat('it-IT', { day: 'numeric', month: 'short', year: 'numeric' });

export function cardSubtitle(rule: Rule, authorName?: string) {
  if (rule.epic) return rule.prize ?? 'Carta vinta';
  if (rule.authorId === 'community') return 'Creata dalla community';
  if (rule.authorId) return `Creata da ${authorName ?? 'un amico'}`;
  return RULE_CATEGORIES.find((c) => c.id === rule.categoryId)?.label ?? 'Carta base';
}

/** Firma in fondo alla carta aperta: chi l'ha creata e quando. */
export function cardSignature(rule: Rule, authorName?: string) {
  const when = rule.createdAt ? DAY.format(new Date(rule.createdAt)) : undefined;
  const who = rule.epic
    ? (rule.prize ?? 'Vinta')
    : rule.authorId === 'community'
      ? 'Creata dalla community'
      : rule.authorId
        ? `Creata da ${authorName ?? 'un amico'}`
        : 'Carta base di Fanta.me';
  return when ? `${who} · ${when}` : who;
}

/** Pulviscolo di luce, sempre negli stessi punti: dà atmosfera senza aggiungere informazioni. */
const STARS: [number, number, number][] = [
  [18, 22, 0.6],
  [82, 30, 0.45],
  [74, 78, 0.7],
  [24, 70, 0.4],
  [60, 14, 0.35],
  [88, 60, 0.3],
];

/** Fondo della carta: gradiente della rarità, bagliore dietro l'immagine e due anelli sottili. */
export function CardArt({ rule, id }: { rule: Rule; id: string }) {
  const p = cardPaint(rule);
  return (
    <Svg style={StyleSheet.absoluteFill} viewBox="0 0 100 140" preserveAspectRatio="none">
      <Defs>
        <LinearGradient id={`g-${id}`} x1="0" y1="0" x2="0.3" y2="1">
          <Stop offset="0" stopColor={p.top} />
          <Stop offset="1" stopColor={p.bottom} />
        </LinearGradient>
        <RadialGradient id={`h-${id}`} cx="50" cy="50" r="40" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor={p.glow} stopOpacity={p.glowOpacity} />
          <Stop offset="1" stopColor={p.glow} stopOpacity="0" />
        </RadialGradient>
      </Defs>
      <Rect x="0" y="0" width="100" height="140" fill={`url(#g-${id})`} />
      <Circle cx="50" cy="50" r="40" fill={`url(#h-${id})`} />
      <Circle cx="50" cy="50" r="28" stroke={p.ring} strokeOpacity="0.12" strokeWidth="0.4" fill="none" />
      <Circle cx="50" cy="50" r="42" stroke={p.ring} strokeOpacity="0.08" strokeWidth="0.4" fill="none" />
      {STARS.map(([x, y, r], i) => (
        <Circle
          key={i}
          cx={x}
          cy={y}
          r={r}
          fill={p.inverse ? '#FFFFFF' : p.ring}
          fillOpacity={p.inverse ? 0.5 : 0.18}
        />
      ))}
    </Svg>
  );
}

/** Tag Bonus/Malus: unico punto di verde e rosso sulle carte. */
export function PointsTag({ points, large }: { points: number; large?: boolean }) {
  const bonus = points > 0;
  return (
    <View
      style={[styles.points, large && styles.pointsLarge, { backgroundColor: bonus ? colors.bonus : colors.malus }]}>
      <AppText variant={large ? 'caption' : 'micro'} color="#FFFFFF" style={styles.pointsText}>
        {bonus ? `Bonus +${points}` : `Malus ${points}`}
      </AppText>
    </View>
  );
}

export function TierTag({ rule, onDark, large }: { rule: Rule; onDark?: boolean; large?: boolean }) {
  const tier = tierOf(rule);
  return (
    <View
      style={[
        styles.tag,
        large && styles.tagLarge,
        { backgroundColor: onDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.06)' },
      ]}>
      <AppText
        variant="micro"
        color={onDark ? '#FFFFFF' : colors.inkSoft}
        style={[styles.tagText, large && styles.tagTextLarge]}>
        {TIER_LABEL[tier]}
        {rule.trophy ? ' · 🏆 Unica' : ''}
      </AppText>
    </View>
  );
}

export type CardCta = { label: string; icon?: IconName; onPress: () => void; done?: boolean };

interface Props {
  rule: Rule;
  authorName?: string;
  /** Azione diretta sulla carta, senza aprirla */
  cta?: CardCta;
  /** Etichetta di stato quando non c'è un'azione (es. "Nel mazzo") */
  status?: string;
  dimmed?: boolean;
  /** Apri la carta: riceve il rettangolo da cui far partire l'animazione */
  onOpen: (from?: CardRect) => void;
  onLongPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

/**
 * Carta da gioco verticale: rarità nel colore, Bonus/Malus in alto,
 * immagine al centro, tag, titolo, sottotitolo e un'azione diretta in basso.
 * Tocco sulla carta = apri.
 */
export function PlayCard({ rule, authorName, cta, status, dimmed, onOpen, onLongPress, style }: Props) {
  const ref = useRef<View>(null);
  const p = cardPaint(rule);
  const dark = p.inverse;
  const open = () => {
    const node = ref.current;
    if (!node?.measureInWindow) return onOpen();
    node.measureInWindow((x, y, width, height) => onOpen(width ? { x, y, width, height } : undefined));
  };
  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={`${rule.label}, ${TIER_LABEL[tierOf(rule)]}, ${rule.points > 0 ? '+' : ''}${rule.points} punti. Apri la carta`}
      onPress={open}
      onLongPress={onLongPress}
      delayLongPress={350}
      pressedScale={0.96}
      style={[styles.wrap, dimmed && styles.dimmed, style]}>
      <View ref={ref} style={[styles.card, !dark && styles.cardLight]} collapsable={false}>
        <CardArt rule={rule} id={`c-${rule.id}`} />
        <View style={styles.top}>
          <PointsTag points={rule.points} />
        </View>
        <View style={styles.art}>
          <Text style={styles.emoji} allowFontScaling={false}>
            {rule.emoji}
          </Text>
        </View>
        <View style={styles.body}>
          <TierTag rule={rule} onDark={dark} />
          <AppText variant="headline" color={p.ink} numberOfLines={2} style={styles.title}>
            {rule.label}
          </AppText>
          <AppText variant="micro" color={p.soft} numberOfLines={1} style={styles.subtitle}>
            {cardSubtitle(rule, authorName)}
          </AppText>
          {cta ? (
            <PressableScale
              accessibilityRole="button"
              accessibilityLabel={cta.label}
              hitSlop={6}
              onPress={() => {
                haptics.tap();
                cta.onPress();
              }}
              style={[styles.cta, dark ? styles.ctaOnDark : styles.ctaOnLight, cta.done && styles.ctaDone]}>
              {cta.icon && (
                <Icon
                  name={cta.icon}
                  size={13}
                  strokeWidth={2.6}
                  color={cta.done ? p.ink : dark ? '#0B0B0D' : '#FFFFFF'}
                />
              )}
              <AppText variant="micro" color={cta.done ? p.ink : dark ? '#0B0B0D' : '#FFFFFF'} style={styles.ctaText}>
                {cta.label}
              </AppText>
            </PressableScale>
          ) : status ? (
            <View style={[styles.cta, styles.ctaDone]}>
              <AppText
                variant="micro"
                color={dark ? '#FFFFFF' : colors.inkSoft}
                style={styles.ctaText}
                numberOfLines={1}>
                {status}
              </AppText>
            </View>
          ) : null}
        </View>
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  wrap: { width: '47.5%' },
  dimmed: { opacity: 0.4 },
  card: { width: '100%', aspectRatio: PLAY_RATIO, borderRadius: radius.lg, overflow: 'hidden', padding: space.sm },
  cardLight: { borderWidth: StyleSheet.hairlineWidth, borderColor: colors.hairline },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  points: { alignSelf: 'flex-start', height: 22, paddingHorizontal: 8, borderRadius: 11, justifyContent: 'center' },
  pointsLarge: { height: 30, paddingHorizontal: space.sm, borderRadius: 15 },
  pointsText: { fontWeight: '700' },
  art: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emoji: { fontSize: 56, lineHeight: 66, fontFamily: EMOJI_FONT },
  body: { gap: 2 },
  tag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    marginBottom: 2,
  },
  tagText: { fontSize: 10, lineHeight: 12, fontWeight: '600' },
  tagLarge: { height: 28, paddingHorizontal: 12, borderRadius: 14 },
  tagTextLarge: { fontSize: 14, lineHeight: 17, fontWeight: '700' },
  title: { fontSize: 16, lineHeight: 19, fontWeight: '700' },
  subtitle: { fontSize: 11, lineHeight: 13 },
  cta: {
    marginTop: space.xs,
    height: 32,
    borderRadius: 16,
    flexDirection: 'row',
    gap: 4,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: space.xs,
  },
  ctaOnLight: { backgroundColor: '#0B0B0D' },
  ctaOnDark: { backgroundColor: '#FFFFFF' },
  ctaDone: { backgroundColor: 'rgba(127,127,127,0.18)' },
  ctaText: { fontSize: 12, lineHeight: 14, fontWeight: '700' },
});
