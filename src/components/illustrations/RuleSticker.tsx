import { Platform, StyleSheet, Text, View } from 'react-native';

import { CardArt, PLAY_RATIO, PointsTag, cardPaint, cardShadow } from '@/components/cards/PlayCard';
import { colors } from '@/theme/tokens';
import type { Rule } from '@/types/game';

/** Font emoji di sistema: Apple Color Emoji su iPhone/Mac, l'equivalente altrove. */
const EMOJI_FONT = Platform.select({
  web: '"Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif',
  default: undefined,
});

/**
 * La carta in miniatura: ogni volta che una carta compare dentro una riga o una scheda
 * (chiamate, profilo, anteprima) è sempre questa, verticale, con il colore della rarità
 * e il segno (Bonus/Malus) nel tag o, se piccolissima, in un punto verde o rosso. `size` è l'altezza.
 */
export function RuleSticker({ rule, size }: { rule: Rule; size: number }) {
  const w = size * PLAY_RATIO;
  const glyph = Math.round(w * 0.58);
  const p = cardPaint(rule);
  return (
    <View
      style={[styles.shell, { width: w, height: size, borderRadius: Math.max(6, size * 0.1) }, cardShadow('sm')]}
      accessibilityElementsHidden
      importantForAccessibility="no">
      <View style={[styles.card, { borderRadius: Math.max(6, size * 0.1) }, !p.inverse && styles.hair]}>
        <CardArt rule={rule} id={`rs-${rule.id}-${Math.round(size)}`} />
        {size >= 90 ? (
          <View style={styles.tag}>
            <PointsTag points={rule.points} />
          </View>
        ) : (
          <View style={[styles.dot, { backgroundColor: rule.points > 0 ? colors.bonus : colors.malus }]} />
        )}
        <Text style={{ fontSize: glyph, lineHeight: glyph * 1.15, fontFamily: EMOJI_FONT }} allowFontScaling={false}>
          {rule.emoji}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {},
  card: { flex: 1, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  hair: { borderWidth: StyleSheet.hairlineWidth, borderColor: 'rgba(0,0,0,0.08)' },
  tag: { position: 'absolute', top: 6, left: 6 },
  dot: {
    position: 'absolute',
    top: 4,
    left: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
});
