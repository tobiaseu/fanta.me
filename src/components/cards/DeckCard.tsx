import { Platform, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/icons/Icon';
import { AppText } from '@/components/ui/AppText';
import { PressableScale } from '@/components/ui/PressableScale';
import { colors, radius, space } from '@/theme/tokens';
import type { Rule } from '@/types/game';

const EMOJI_FONT = Platform.select({
  web: '"Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif',
  default: undefined,
});

/** Colori "rarità" alla Clash Royale: verde bonus, rosso malus, viola carta personale. */
export function cardTone(rule: Rule) {
  if (rule.authorId) return { edge: colors.toonPurple, fill: 'rgba(139, 108, 246, 0.14)', gem: colors.toonPurple };
  return rule.points > 0
    ? { edge: '#7FD36B', fill: 'rgba(28, 177, 0, 0.10)', gem: colors.bonus }
    : { edge: '#FF9E96', fill: 'rgba(217, 45, 32, 0.08)', gem: colors.malus };
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
}

/**
 * Carta del mazzo in stile Clash Royale: verticale, bordo colorato per "rarità",
 * goccia con i punti in alto a sinistra (come l'elisir), emoji 3D al centro e nome sotto.
 */
export function DeckCard({ rule, dimmed, checked, note, onPress }: Props) {
  const tone = cardTone(rule);
  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={`${rule.label}, ${rule.points > 0 ? '+' : ''}${rule.points} punti${rule.authorId ? ', carta personale' : ''}${note ? `, ${note}` : ''}`}
      onPress={onPress}
      pressedScale={0.94}
      style={[styles.wrap, dimmed && styles.dimmed]}>
      <View style={[styles.card, { borderColor: tone.edge, backgroundColor: tone.fill }]}>
        <Text style={styles.emoji} allowFontScaling={false}>
          {rule.emoji}
        </Text>
        <View style={[styles.gem, { backgroundColor: tone.gem }]}>
          <AppText variant="micro" color={colors.inkInverse} style={styles.gemText}>
            {rule.points > 0 ? `+${rule.points}` : rule.points}
          </AppText>
        </View>
        {checked && (
          <View style={styles.check}>
            <Icon name="check" size={11} strokeWidth={3.2} />
          </View>
        )}
        {rule.authorId && <View style={[styles.ribbon, { backgroundColor: tone.edge }]} />}
      </View>
      <AppText variant="micro" numberOfLines={2} style={styles.name}>
        {rule.label}
      </AppText>
      {note ? (
        <AppText variant="micro" color={colors.inkSoft} style={styles.note} numberOfLines={1}>
          {note}
        </AppText>
      ) : null}
    </PressableScale>
  );
}

/** Slot vuoto: "+ Crea carta" (tratteggiato) oppure lucchetto Premium. */
export function EmptySlot({ locked, onPress }: { locked?: boolean; onPress: () => void }) {
  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={locked ? 'Sblocca altre carte personali' : 'Crea una nuova carta'}
      onPress={onPress}
      pressedScale={0.94}
      style={styles.wrap}>
      <View style={[styles.card, locked ? styles.locked : styles.empty]}>
        <View style={[styles.plus, locked && styles.plusLocked]}>
          <Icon name={locked ? 'lock' : 'plus'} size={18} strokeWidth={2.4} color={locked ? colors.cta : colors.ink} />
        </View>
      </View>
      <AppText variant="micro" color={colors.inkSoft} style={styles.name}>
        {locked ? 'Sblocca' : 'Crea carta'}
      </AppText>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  wrap: { width: '22.5%', alignItems: 'center', gap: space.xxs },
  dimmed: { opacity: 0.38 },
  card: {
    width: '100%',
    aspectRatio: 0.78,
    borderRadius: radius.sm,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  emoji: { fontSize: 34, lineHeight: 42, fontFamily: EMOJI_FONT },
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
  gemText: { fontSize: 11, lineHeight: 13, fontWeight: '800' },
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
  ribbon: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 5 },
  name: { textAlign: 'center', fontSize: 11, lineHeight: 13 },
  note: { fontSize: 10, lineHeight: 12, fontWeight: '500', marginTop: -2 },
  empty: { borderStyle: 'dashed', borderColor: colors.inkFaint, backgroundColor: 'transparent', borderWidth: 2 },
  locked: { borderColor: colors.ink, backgroundColor: colors.ink, borderWidth: 2 },
  plus: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  plusLocked: { backgroundColor: 'rgba(255,255,255,0.12)' },
});
