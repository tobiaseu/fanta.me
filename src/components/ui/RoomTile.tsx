import { type ReactNode } from 'react';
import { Platform, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, RadialGradient, Rect, Stop } from 'react-native-svg';

import { AppText } from './AppText';
import { PressableScale } from './PressableScale';

import { haptics } from '@/lib/haptics';
import { colors, isDark, radius, space } from '@/theme/tokens';

const EMOJI_FONT = Platform.select({
  web: '"Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif',
  default: undefined,
});

/**
 * Tono della card partita: il colore dice sempre una cosa sola.
 * live = verde (si gioca), waiting = giallo (si prepara), ended = grigio (archivio),
 * community = arancio (come le carte rare: l'ha creata qualcuno), official = bianco con bagliore (Fanta.me).
 */
export type TileTone = 'live' | 'waiting' | 'ended' | 'community' | 'official';

type Paint = { top: string; bottom: string; glow: string; glowOpacity: number; ink: string; soft: string };

const WHITE = { ink: '#FFFFFF', soft: 'rgba(255,255,255,0.78)' };
const INK = { ink: colors.ink, soft: colors.inkSoft };

const PAINT: Record<TileTone, Paint> = isDark
  ? {
      live: { top: '#173A23', bottom: '#0C1A11', glow: '#34C759', glowOpacity: 0.35, ...WHITE },
      waiting: { top: '#3A3014', bottom: '#1A160A', glow: colors.cta, glowOpacity: 0.35, ...WHITE },
      ended: { top: '#26262A', bottom: '#151517', glow: '#FFFFFF', glowOpacity: 0.08, ...WHITE },
      community: { top: '#FFB45C', bottom: '#F0662E', glow: '#FFFFFF', glowOpacity: 0.4, ...WHITE },
      official: { top: '#2A2A2E', bottom: '#151517', glow: colors.cta, glowOpacity: 0.4, ...WHITE },
    }
  : {
      live: { top: '#EEFAEB', bottom: '#CDEFC6', glow: '#FFFFFF', glowOpacity: 0.7, ...INK },
      waiting: { top: '#FFF8DE', bottom: '#FCE7A2', glow: '#FFFFFF', glowOpacity: 0.7, ...INK },
      ended: { top: '#FFFFFF', bottom: '#E9E9EE', glow: '#FFFFFF', glowOpacity: 0.6, ...INK },
      community: { top: '#FFB45C', bottom: '#F0662E', glow: '#FFFFFF', glowOpacity: 0.4, ...WHITE },
      official: { top: '#FFFFFF', bottom: '#F1F1F5', glow: colors.cta, glowOpacity: 0.85, ...INK },
    };

export const tilePaint = (tone: TileTone) => PAINT[tone];

/** Fondo condiviso da tile e banner: gradiente, alone dietro l'emoji, pulviscolo. */
export function TileArt({ tone, id, cx = 72, cy = 30 }: { tone: TileTone; id: string; cx?: number; cy?: number }) {
  const p = PAINT[tone];
  const light = p.ink === '#FFFFFF';
  return (
    <Svg style={StyleSheet.absoluteFill} viewBox="0 0 100 125" preserveAspectRatio="none" pointerEvents="none">
      <Defs>
        <LinearGradient id={`tg-${id}`} x1="0" y1="0" x2="0.4" y2="1">
          <Stop offset="0" stopColor={p.top} />
          <Stop offset="1" stopColor={p.bottom} />
        </LinearGradient>
        <RadialGradient id={`th-${id}`} cx={cx} cy={cy} r="42" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor={p.glow} stopOpacity={p.glowOpacity} />
          <Stop offset="1" stopColor={p.glow} stopOpacity={0} />
        </RadialGradient>
      </Defs>
      <Rect x="0" y="0" width="100" height="125" fill={`url(#tg-${id})`} />
      <Circle cx={cx} cy={cy} r="42" fill={`url(#th-${id})`} />
      {[
        [14, 18, 0.5],
        [40, 9, 0.35],
        [88, 64, 0.45],
        [20, 58, 0.35],
      ].map(([x, y, r], i) => (
        <Circle key={i} cx={x} cy={y} r={r} fill={light ? '#FFFFFF' : '#000000'} fillOpacity={light ? 0.5 : 0.12} />
      ))}
    </Svg>
  );
}

/**
 * Card partita in stile Apple Games: verticale, colore = stato, emoji grande in alto,
 * titolo, una riga, un'informazione in più (facoltativa) e una pillola d'azione.
 * Stessa card per le mie partite e per quelle consigliate: cambia solo quanto dice.
 */
export function RoomTile({
  id,
  emoji,
  title,
  subtitle,
  extra,
  rank,
  tone,
  cta,
  onPress,
  width = 168,
  accessibilityLabel,
  style,
}: {
  id: string;
  emoji: string;
  title: string;
  subtitle?: string;
  /** Riga in più per le mie partite (es. avatar, "2 da votare") */
  extra?: ReactNode;
  /** Numero grande in trasparenza, come le classifiche di Apple Games */
  rank?: number;
  tone: TileTone;
  cta: string;
  onPress: () => void;
  width?: number;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
}) {
  const p = PAINT[tone];
  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? `${title}${subtitle ? `, ${subtitle}` : ''}. ${cta}`}
      onPress={() => {
        haptics.tap();
        onPress();
      }}
      pressedScale={0.96}
      style={[styles.tile, { width }, tone === 'ended' || tone === 'official' ? styles.hair : null, style]}>
      <TileArt tone={tone} id={id} />
      {rank !== undefined && (
        <Text style={[styles.rank, { color: p.ink }]} allowFontScaling={false}>
          {rank}
        </Text>
      )}
      <View style={styles.top}>
        <Text style={styles.emoji} allowFontScaling={false}>
          {emoji}
        </Text>
      </View>
      <View style={styles.body}>
        <AppText variant="headline" color={p.ink} numberOfLines={2} style={styles.title}>
          {title}
        </AppText>
        {subtitle ? (
          <AppText variant="micro" color={p.soft} numberOfLines={1} style={styles.regular}>
            {subtitle}
          </AppText>
        ) : null}
        {extra}
      </View>
      <View
        style={[styles.cta, { backgroundColor: p.ink === '#FFFFFF' ? 'rgba(255,255,255,0.22)' : 'rgba(0,0,0,0.07)' }]}>
        <AppText variant="caption" color={p.ink} style={styles.bold}>
          {cta}
        </AppText>
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  tile: {
    aspectRatio: 4 / 5,
    borderRadius: radius.lg,
    overflow: 'hidden',
    padding: space.sm,
    justifyContent: 'space-between',
  },
  hair: { borderWidth: StyleSheet.hairlineWidth, borderColor: colors.hairline },
  rank: {
    position: 'absolute',
    top: -6,
    left: 6,
    fontSize: 84,
    lineHeight: 96,
    fontWeight: '800',
    opacity: 0.12,
    letterSpacing: -4,
  },
  top: { alignItems: 'flex-end' },
  emoji: { fontSize: 44, lineHeight: 52, fontFamily: EMOJI_FONT },
  body: { gap: 2, flex: 1, justifyContent: 'flex-end', paddingBottom: space.xs },
  title: { fontSize: 16, lineHeight: 19, fontWeight: '700' },
  regular: { fontWeight: '400' },
  bold: { fontWeight: '700' },
  cta: { alignSelf: 'flex-start', height: 30, paddingHorizontal: space.sm, borderRadius: 15, justifyContent: 'center' },
});
