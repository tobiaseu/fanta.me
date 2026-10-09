import { Platform, StyleSheet, Text, View } from 'react-native';

import type { Rule } from '@/types/game';

/** Font emoji di sistema: Apple Color Emoji su iPhone/Mac, l'equivalente altrove. */
const EMOJI_FONT = Platform.select({
  web: '"Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif',
  default: undefined,
});

/**
 * Illustrazione di una "carta trofeo": l'emoji di sistema in grande, con
 * un'ombra morbida sotto che la fa "posare" sulla carta come un oggetto 3D.
 */
export function RuleSticker({ rule, size }: { rule: Rule; size: number }) {
  const glyph = Math.round(size * 0.62);
  return (
    <View
      style={[styles.wrap, { width: size, height: size * 0.82 }]}
      accessibilityElementsHidden
      importantForAccessibility="no">
      <View
        style={[styles.shadow, { width: glyph * 0.7, height: glyph * 0.12, borderRadius: glyph, bottom: size * 0.06 }]}
      />
      <Text style={{ fontSize: glyph, lineHeight: glyph * 1.15, fontFamily: EMOJI_FONT }} allowFontScaling={false}>
        {rule.emoji}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center' },
  shadow: {
    position: 'absolute',
    backgroundColor: 'rgba(0, 0, 0, 0.12)',
    ...Platform.select({ web: { filter: 'blur(6px)' } as object, default: {} }),
  },
});
