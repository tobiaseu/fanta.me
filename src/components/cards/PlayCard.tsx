import { useRef } from 'react';
import { Platform, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, RadialGradient, Rect, Stop } from 'react-native-svg';

import { Icon, type IconName } from '@/components/icons/Icon';
import { AppText } from '@/components/ui/AppText';
import { PressableScale } from '@/components/ui/PressableScale';
import { RULE_CATEGORIES } from '@/data/rules';
import { haptics } from '@/lib/haptics';
import { colors, radius, space } from '@/theme/tokens';
import type { Rule } from '@/types/game';

const EMOJI_FONT = Platform.select({
  web: '"Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif',
  default: undefined,
});

/** Proporzione di una carta da gioco vera (63 × 88 mm): la stessa in griglia e aperta. */
export const PLAY_RATIO = 63 / 88;

/** Rettangolo della carta sullo schermo: da qui parte l'animazione di apertura. */
export type CardRect = { x: number; y: number; width: number; height: number };

/**
 * Identità delle carte: ogni categoria ha il suo colore pieno (come le cover dei giochi),
 * più scuro in basso così il testo bianco resta leggibile.
 */
const PALETTE: Record<string, [string, string]> = {
  social: ['#FF8A80', '#E0435A'],
  food: ['#FFC25C', '#F0782E'],
  chaos: ['#A58BFF', '#5B3FD9'],
  sport: ['#4FD1E8', '#1F6FD6'],
  mine: ['#7BE08E', '#1E9A4E'],
  community: ['#8FA8FF', '#3B4FC4'],
  trophy: ['#FFE08A', '#C98A12'],
};

export function cardPaint(rule: Rule) {
  const key = rule.trophy
    ? 'trophy'
    : rule.authorId === 'community'
      ? 'community'
      : rule.authorId
        ? 'mine'
        : rule.categoryId;
  const [top, bottom] = PALETTE[key] ?? PALETTE.chaos;
  return { top, bottom, key };
}

export function cardSubtitle(rule: Rule, authorName?: string) {
  if (rule.authorId === 'community') return 'Carta della community';
  if (rule.authorId) return `Carta di ${authorName ?? 'un amico'}`;
  return RULE_CATEGORIES.find((c) => c.id === rule.categoryId)?.label ?? 'Carta base';
}

/** Fondo della carta: gradiente pieno, alone chiaro dietro l'immagine e due anelli sottili. */
export function CardArt({ rule, id }: { rule: Rule; id: string }) {
  const { top, bottom } = cardPaint(rule);
  return (
    <Svg style={StyleSheet.absoluteFill} viewBox="0 0 100 140" preserveAspectRatio="none">
      <Defs>
        <LinearGradient id={`g-${id}`} x1="0" y1="0" x2="0.3" y2="1">
          <Stop offset="0" stopColor={top} />
          <Stop offset="1" stopColor={bottom} />
        </LinearGradient>
        <RadialGradient id={`h-${id}`} cx="50" cy="52" r="42" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#FFFFFF" stopOpacity="0.45" />
          <Stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
        </RadialGradient>
      </Defs>
      <Rect x="0" y="0" width="100" height="140" fill={`url(#g-${id})`} />
      <Circle cx="50" cy="52" r="42" fill={`url(#h-${id})`} />
      <Circle cx="50" cy="52" r="30" stroke="#FFFFFF" strokeOpacity="0.22" strokeWidth="0.5" fill="none" />
      <Circle cx="50" cy="52" r="44" stroke="#FFFFFF" strokeOpacity="0.12" strokeWidth="0.5" fill="none" />
    </Svg>
  );
}

export type CardCta = { label: string; icon?: IconName; onPress: () => void; done?: boolean };

interface Props {
  rule: Rule;
  authorName?: string;
  /** Azione diretta sulla carta, senza aprirla */
  cta?: CardCta;
  /** Etichetta di stato sotto il titolo quando non c'è un'azione (es. "Nel mazzo") */
  status?: string;
  dimmed?: boolean;
  /** Apri la carta: riceve il rettangolo da cui far partire l'animazione */
  onOpen: (from?: CardRect) => void;
  /** Pulsante "i": apre il retro con statistiche, salva e altre azioni */
  onInfo: (from?: CardRect) => void;
  onLongPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

/**
 * Carta da gioco verticale: colore della categoria, punti e "i" in alto,
 * immagine al centro, tag, titolo, sottotitolo e un'azione diretta in basso.
 */
export function PlayCard({ rule, authorName, cta, status, dimmed, onOpen, onInfo, onLongPress, style }: Props) {
  const ref = useRef<View>(null);
  const measure = (then: (r?: CardRect) => void) => {
    const node = ref.current;
    if (!node?.measureInWindow) return then();
    node.measureInWindow((x, y, width, height) => then(width ? { x, y, width, height } : undefined));
  };
  const bonus = rule.points > 0;
  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={`${rule.label}, ${bonus ? '+' : ''}${rule.points} punti. Apri la carta`}
      onPress={() => measure(onOpen)}
      onLongPress={onLongPress}
      delayLongPress={350}
      pressedScale={0.96}
      style={[styles.wrap, dimmed && styles.dimmed, style]}>
      <View ref={ref} style={styles.card} collapsable={false}>
        <CardArt rule={rule} id={`c-${rule.id}`} />
        <View style={styles.top}>
          <View style={styles.points}>
            <AppText variant="micro" color={colors.ink} style={styles.pointsText}>
              {bonus ? `+${rule.points}` : rule.points}
            </AppText>
          </View>
          <PressableScale
            accessibilityRole="button"
            accessibilityLabel={`Informazioni su ${rule.label}`}
            hitSlop={10}
            onPress={() => measure(onInfo)}
            style={styles.info}>
            <AppText variant="micro" color="#FFFFFF" style={styles.infoText}>
              i
            </AppText>
          </PressableScale>
        </View>
        <View style={styles.art}>
          <Text style={styles.emoji} allowFontScaling={false}>
            {rule.emoji}
          </Text>
        </View>
        <View style={styles.body}>
          <View style={styles.tags}>
            <View style={styles.tag}>
              <AppText variant="micro" color="#FFFFFF" style={styles.tagText}>
                {bonus ? 'Bonus' : 'Malus'}
              </AppText>
            </View>
            {rule.trophy && (
              <View style={styles.tag}>
                <AppText variant="micro" color="#FFFFFF" style={styles.tagText}>
                  🏆 Unica
                </AppText>
              </View>
            )}
          </View>
          <AppText variant="headline" color="#FFFFFF" numberOfLines={2} style={styles.title}>
            {rule.label}
          </AppText>
          <AppText variant="micro" color="rgba(255,255,255,0.82)" numberOfLines={1} style={styles.subtitle}>
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
              style={[styles.cta, cta.done && styles.ctaDone]}>
              {cta.icon && (
                <Icon name={cta.icon} size={13} strokeWidth={2.6} color={cta.done ? '#FFFFFF' : colors.ink} />
              )}
              <AppText variant="micro" color={cta.done ? '#FFFFFF' : colors.ink} style={styles.ctaText}>
                {cta.label}
              </AppText>
            </PressableScale>
          ) : status ? (
            <View style={[styles.cta, styles.ctaDone]}>
              <AppText variant="micro" color="#FFFFFF" style={styles.ctaText} numberOfLines={1}>
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
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  points: {
    minWidth: 34,
    height: 24,
    paddingHorizontal: space.xs,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pointsText: { fontSize: 12, lineHeight: 14, fontWeight: '700' },
  info: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoText: { fontSize: 12, lineHeight: 14, fontWeight: '700' },
  art: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emoji: { fontSize: 56, lineHeight: 66, fontFamily: EMOJI_FONT },
  body: { gap: 2 },
  tags: { flexDirection: 'row', gap: 4, marginBottom: 2 },
  tag: {
    paddingHorizontal: 6,
    height: 18,
    borderRadius: 9,
    backgroundColor: 'rgba(255,255,255,0.22)',
    justifyContent: 'center',
  },
  tagText: { fontSize: 10, lineHeight: 12, fontWeight: '600' },
  title: { fontSize: 16, lineHeight: 19, fontWeight: '700' },
  subtitle: { fontSize: 11, lineHeight: 13 },
  cta: {
    marginTop: space.xs,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    gap: 4,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: space.xs,
  },
  ctaDone: { backgroundColor: 'rgba(0,0,0,0.22)' },
  ctaText: { fontSize: 12, lineHeight: 14, fontWeight: '700' },
});
