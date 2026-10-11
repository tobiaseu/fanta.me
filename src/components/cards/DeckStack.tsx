import type { ReactNode } from 'react';
import { Platform, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { PressableScale } from '@/components/ui/PressableScale';
import { TileArt, tilePaint } from '@/components/ui/RoomArt';
import { haptics } from '@/lib/haptics';
import { colors, isDark, radius, space } from '@/theme/tokens';

const EMOJI_FONT = Platform.select({
  web: '"Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif',
  default: undefined,
});

/**
 * Un mazzo è una PILA di carte: verticale come una carta, ma con due carte che spuntano da dietro.
 * Corpo neutro (non ha rarità né segno), così non si scambia con una carta o con una stanza.
 */
export function DeckStack({
  id,
  emoji,
  title,
  subtitle,
  extra,
  rank,
  cta,
  onPress,
  width,
  style,
}: {
  id: string;
  emoji: string;
  title: string;
  subtitle: string;
  extra?: ReactNode;
  rank?: number;
  cta: string;
  onPress: () => void;
  width?: number | `${number}%`;
  style?: StyleProp<ViewStyle>;
}) {
  const p = tilePaint('official');
  const layer = isDark ? '#222226' : '#E3E3E9';
  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={`Mazzo ${title}, ${subtitle}. ${cta}`}
      onPress={() => {
        haptics.tap();
        onPress();
      }}
      pressedScale={0.96}
      style={[{ width: width ?? '47.5%' }, style]}>
      <View style={styles.pile}>
        <View style={[styles.layer, styles.layerBack, { backgroundColor: layer }]} />
        <View style={[styles.layer, styles.layerMid, { backgroundColor: layer }]} />
        <View style={styles.front}>
          <TileArt tone="official" id={`stack-${id}`} cx={50} cy={46} />
          {rank !== undefined && (
            <Text style={[styles.rank, { color: p.ink }]} allowFontScaling={false}>
              {rank}
            </Text>
          )}
          <View style={styles.kind}>
            <AppText variant="micro" color={p.ink} style={styles.kindText}>
              Mazzo · {subtitle}
            </AppText>
          </View>
          <View style={styles.art}>
            <Text style={styles.emoji} allowFontScaling={false}>
              {emoji}
            </Text>
          </View>
          <AppText variant="headline" color={p.ink} numberOfLines={2} style={styles.title}>
            {title}
          </AppText>
          {extra}
          <View style={styles.cta}>
            <AppText variant="micro" color={isDark ? '#0B0B0D' : '#FFFFFF'} style={styles.bold}>
              {cta}
            </AppText>
          </View>
        </View>
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  pile: { width: '100%', aspectRatio: 63 / 88 + 0.02, paddingTop: 12 },
  layer: { position: 'absolute', top: 0, borderRadius: radius.lg, height: 60 },
  layerBack: { left: 24, right: 24, top: 0 },
  layerMid: { left: 12, right: 12, top: 6 },
  front: {
    flex: 1,
    borderRadius: radius.lg,
    overflow: 'hidden',
    padding: space.sm,
    gap: 2,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.hairline,
  },
  rank: { position: 'absolute', right: 8, top: -4, fontSize: 64, lineHeight: 74, fontWeight: '800', opacity: 0.1 },
  kind: {
    alignSelf: 'flex-start',
    height: 20,
    paddingHorizontal: 7,
    borderRadius: 10,
    justifyContent: 'center',
    backgroundColor: isDark ? 'rgba(255,255,255,0.16)' : 'rgba(0,0,0,0.07)',
  },
  kindText: { fontSize: 11, lineHeight: 13, fontWeight: '700' },
  art: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emoji: { fontSize: 48, lineHeight: 58, fontFamily: EMOJI_FONT },
  title: { fontSize: 16, lineHeight: 19, fontWeight: '700' },
  cta: {
    marginTop: space.xxs,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: isDark ? '#FFFFFF' : '#0B0B0D',
  },
  bold: { fontWeight: '700' },
});
