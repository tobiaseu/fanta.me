import { useRef, type ReactNode } from 'react';
import { Platform, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import type { CardRect } from '@/components/cards/PlayCard';
import { Icon } from '@/components/icons/Icon';
import { AppText } from '@/components/ui/AppText';
import { PressableScale } from '@/components/ui/PressableScale';
import { TileArt, tilePaint, type TileTone } from '@/components/ui/RoomArt';
import { haptics } from '@/lib/haptics';
import { colors, radius, space } from '@/theme/tokens';

const EMOJI_FONT = Platform.select({
  web: '"Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif',
  default: undefined,
});

/** Una stanza è SEMPRE orizzontale: emoji a sinistra, testo a destra. Così non si confonde con una carta (verticale). */
export const ROOM_W = 296;
export const ROOM_H = 132;

/** Tag che dice "questa è una stanza", con lo stato accanto. Uguale su card e pop up. */
export function RoomKind({ tone, status, onDark }: { tone: TileTone; status?: string; onDark: boolean }) {
  const p = tilePaint(tone);
  return (
    <View style={styles.kindRow}>
      <View style={[styles.kind, { backgroundColor: onDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.07)' }]}>
        <Icon name="people" size={12} strokeWidth={2} color={p.ink} />
        <AppText variant="micro" color={p.ink} style={styles.kindText}>
          Stanza
        </AppText>
      </View>
      {status ? (
        <AppText variant="micro" color={p.soft} numberOfLines={1} style={styles.status}>
          {status}
        </AppText>
      ) : null}
    </View>
  );
}

/**
 * Card stanza orizzontale. Tocco sulla card = apri il pop up (se c'è `onOpen`);
 * la pillola in basso a destra è l'azione diretta. Senza `onOpen` tutta la card fa l'azione.
 */
export function RoomCard({
  id,
  emoji,
  title,
  subtitle,
  status,
  tone,
  extra,
  cta,
  onCta,
  onOpen,
  width = ROOM_W,
  style,
}: {
  id: string;
  emoji: string;
  title: string;
  subtitle?: string;
  /** Testo di stato accanto al tag "Stanza" (es. "In corso") */
  status?: string;
  tone: TileTone;
  /** Riga in più: avatar, chiamate di oggi */
  extra?: ReactNode;
  cta: string;
  onCta: () => void;
  onOpen?: (from?: CardRect) => void;
  width?: number | `${number}%`;
  style?: StyleProp<ViewStyle>;
}) {
  const ref = useRef<View>(null);
  const p = tilePaint(tone);
  const dark = p.ink === '#FFFFFF';
  const open = () => {
    haptics.tap();
    if (!onOpen) return onCta();
    const node = ref.current;
    if (!node?.measureInWindow) return onOpen();
    node.measureInWindow((x, y, w, h) => onOpen(w ? { x, y, width: w, height: h } : undefined));
  };
  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={`Stanza ${title}${status ? `, ${status}` : ''}${subtitle ? `, ${subtitle}` : ''}`}
      onPress={open}
      pressedScale={0.97}
      style={[{ width }, style]}>
      <View
        ref={ref}
        collapsable={false}
        style={[styles.card, (tone === 'ended' || tone === 'official') && styles.hair]}>
        <TileArt tone={tone} id={id} wide />
        <View style={[styles.emojiBox, { backgroundColor: dark ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,0.7)' }]}>
          <Text style={styles.emoji} allowFontScaling={false}>
            {emoji}
          </Text>
        </View>
        <View style={styles.text}>
          <RoomKind tone={tone} status={status} onDark={dark} />
          <AppText variant="headline" color={p.ink} numberOfLines={1} style={styles.title}>
            {title}
          </AppText>
          {subtitle ? (
            <AppText variant="micro" color={p.soft} numberOfLines={1}>
              {subtitle}
            </AppText>
          ) : null}
          <View style={styles.foot}>
            <View style={styles.extra}>{extra}</View>
            <PressableScale
              accessibilityRole="button"
              accessibilityLabel={`${cta}: ${title}`}
              hitSlop={6}
              onPress={() => {
                haptics.tap();
                onCta();
              }}
              style={[styles.cta, { backgroundColor: dark ? 'rgba(255,255,255,0.24)' : 'rgba(0,0,0,0.08)' }]}>
              <AppText variant="caption" color={p.ink} style={styles.bold}>
                {cta}
              </AppText>
            </PressableScale>
          </View>
        </View>
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: ROOM_H,
    borderRadius: radius.lg,
    overflow: 'hidden',
    padding: space.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
  },
  hair: { borderWidth: StyleSheet.hairlineWidth, borderColor: colors.hairline },
  emojiBox: { width: 72, height: 72, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  emoji: { fontSize: 40, lineHeight: 48, fontFamily: EMOJI_FONT },
  text: { flex: 1, minWidth: 0, gap: 2 },
  kindRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  kind: { height: 20, paddingHorizontal: 7, borderRadius: 10, flexDirection: 'row', alignItems: 'center', gap: 4 },
  kindText: { fontSize: 11, lineHeight: 13, fontWeight: '700' },
  status: { flexShrink: 1, fontSize: 11, lineHeight: 14 },
  title: { fontSize: 17, lineHeight: 21, fontWeight: '700', marginTop: 2 },
  foot: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 6, marginTop: 4 },
  extra: { flexShrink: 1 },
  cta: { height: 30, paddingHorizontal: space.sm, borderRadius: 15, justifyContent: 'center' },
  bold: { fontWeight: '700' },
});
