import { Platform, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { Icon } from '@/components/icons/Icon';
import { CardArt, cardPaint, cardShadow } from '@/components/cards/PlayCard';
import { AppText } from '@/components/ui/AppText';
import { PressableScale } from '@/components/ui/PressableScale';
import { colors, radius, space } from '@/theme/tokens';
import type { Rule } from '@/types/game';

const EMOJI_FONT = Platform.select({
  web: '"Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif',
  default: undefined,
});

/** Bordo oro delle carte trofeo: una sola volta per partita, al primo che ci arriva. */
export const TROPHY_GOLD = '#D4A017';

/** Toni della carta: goccia verde bonus, rossa malus, viola per le carte personali. */
/** Lunghezza della parola più lunga: oltre 9 lettere il nome si rimpicciolisce invece di spezzarsi. */
const longestWord = (label: string) => Math.max(...label.split(/\s+/).map((w) => w.length));

export function cardTone(rule: Rule) {
  // Carte pulite: fondo bianco, bordo sottile grigio scuro; il colore sta solo nella goccia dei punti
  const gem = rule.authorId ? colors.toonPurple : rule.points > 0 ? colors.bonus : colors.malus;
  return { edge: '#3A3A3C', fill: colors.background, gem };
}

interface Props {
  rule: Rule;
  /** Fuori dal mazzo: carta spenta */
  dimmed?: boolean;
  /** Spunta in alto a destra (nel mazzo) */
  checked?: boolean;
  /** Etichetta sotto il nome (es. "proposta") */
  note?: string;
  onPress?: () => void;
  onLongPress?: () => void;
  style?: StyleProp<ViewStyle>;
  /** Si può aggiungere al mazzo: "+" arancio in alto a destra */
  addable?: boolean;
  /** Senza nome sotto (pila del mazzo) */
  bare?: boolean;
}

/**
 * Carta del mazzo in stile Clash Royale: verticale, bordo sottile grigio scuro,
 * goccia con i punti in alto a sinistra (come l'elisir), emoji 3D al centro e nome sotto.
 */
export function DeckCard({ rule, dimmed, checked, addable, note, onPress, onLongPress, style, bare }: Props) {
  const paint = cardPaint(rule);
  const light = !paint.inverse;
  const bonus = rule.points > 0;
  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={`${rule.label}, ${bonus ? '+' : ''}${rule.points} punti${note ? `, ${note}` : ''}`}
      onPress={onPress}
      onLongPress={onLongPress}
      pressedScale={0.94}
      style={[styles.wrap, dimmed && styles.dimmed, style]}>
      <View style={[styles.shell, !bare && cardShadow('sm')]}>
        <View style={[styles.cardFill, light && styles.cardLight, rule.trophy && styles.trophyEdge]}>
          <CardArt rule={rule} id={`d-${rule.id}`} />
          <Text style={[styles.emoji, !bare && styles.emojiWithName]} allowFontScaling={false}>
            {rule.emoji}
          </Text>
          {!bare && (
            <AppText
              variant="micro"
              color={paint.ink}
              numberOfLines={2}
              style={[styles.inName, longestWord(rule.label) > 9 && styles.inNameSmall]}>
              {rule.label}
            </AppText>
          )}
          <View style={[styles.gem, { backgroundColor: bonus ? colors.bonus : colors.malus }]}>
            <AppText variant="micro" color="#FFFFFF" style={styles.gemText}>
              {bonus ? `+${rule.points}` : rule.points}
            </AppText>
          </View>
          {checked && (
            <View style={styles.check}>
              <Icon name="check" size={11} strokeWidth={3.2} color={colors.ctaInk} />
            </View>
          )}
          {addable && (
            <View style={styles.add}>
              <Icon name="plus" size={13} strokeWidth={2.4} color={colors.ctaInk} />
            </View>
          )}
        </View>
      </View>
      {note ? (
        <AppText variant="micro" color={colors.inkSoft} style={styles.note} numberOfLines={1}>
          {note}
        </AppText>
      ) : null}
    </PressableScale>
  );
}

/** Slot vuoto: "+ Crea carta" (tratteggiato) oppure lucchetto Premium. */
export function EmptySlot({
  locked,
  onPress,
  label,
  style,
}: {
  locked?: boolean;
  onPress: () => void;
  label?: string;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={locked ? 'Sblocca altre carte personali' : 'Crea una nuova carta'}
      onPress={onPress}
      pressedScale={0.94}
      style={[styles.wrap, style]}>
      <View style={[styles.card, locked ? styles.locked : styles.empty]}>
        <View style={[styles.plus, locked && styles.plusLocked]}>
          <Icon
            name={locked ? 'lock' : 'plus'}
            size={18}
            strokeWidth={2.4}
            color={locked ? colors.accent : colors.ink}
          />
        </View>
      </View>
      <AppText variant="micro" color={colors.inkSoft} style={styles.name}>
        {label ?? (locked ? 'Sblocca' : 'Crea carta')}
      </AppText>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  shell: { width: '100%', aspectRatio: 63 / 88, borderRadius: radius.sm },
  cardFill: { flex: 1, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  wrap: { width: '30%', alignItems: 'center', gap: space.xxs },
  dimmed: { opacity: 0.38 },
  card: {
    width: '100%',
    aspectRatio: 63 / 88,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  /** Carta trofeo (unica): filo d'oro sul bordo */
  trophyEdge: { borderWidth: 2, borderColor: '#E8B53A' },
  cardLight: { borderWidth: StyleSheet.hairlineWidth, borderColor: 'rgba(0,0,0,0.08)' },
  emoji: { fontSize: 44, lineHeight: 54, fontFamily: EMOJI_FONT },
  emojiWithName: { marginBottom: space.md },
  // Il nome è attaccato al fondo della carta, come l'etichetta delle carte da collezione
  inName: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 7,
    fontSize: 12,
    lineHeight: 14,
    fontWeight: '700',
    textAlign: 'center',
    paddingHorizontal: 6,
  },
  trophyCard: { borderWidth: 1.5, backgroundColor: '#FFFBEA' },
  trophyBadge: { position: 'absolute', top: 3, right: 4 },
  trophyEmoji: { fontSize: 14, lineHeight: 18, fontFamily: EMOJI_FONT },
  gem: {
    position: 'absolute',
    top: 3,
    left: 3,
    minWidth: 26,
    height: 20,
    paddingHorizontal: 4,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gemText: { fontSize: 11, lineHeight: 13, fontWeight: '700' },
  inNameSmall: { fontSize: 10.5, lineHeight: 13, paddingHorizontal: 3 },
  check: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.cta,
    alignItems: 'center',
    justifyContent: 'center',
  },
  add: {
    position: 'absolute',
    top: 3,
    right: 3,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.cta,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ribbon: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 5 },
  name: { textAlign: 'center', fontSize: 11, lineHeight: 13 },
  note: { fontSize: 10, lineHeight: 12, fontWeight: '500', marginTop: -2 },
  empty: { borderStyle: 'dashed', borderColor: colors.inkFaint, backgroundColor: 'transparent', borderWidth: 1 },
  locked: { borderColor: colors.accent, backgroundColor: colors.ctaSoft, borderWidth: 1 },
  plus: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  plusLocked: { backgroundColor: colors.surface },
});
