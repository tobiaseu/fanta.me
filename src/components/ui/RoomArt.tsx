import { StyleSheet } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, RadialGradient, Rect, Stop } from 'react-native-svg';

import { colors, isDark } from '@/theme/tokens';

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
export function TileArt({
  tone,
  id,
  cx: cxIn,
  cy: cyIn,
  wide,
}: {
  tone: TileTone;
  id: string;
  cx?: number;
  cy?: number;
  /** Per le stanze orizzontali: il disegno è largo il doppio, così il bagliore resta tondo */
  wide?: boolean;
}) {
  const p = PAINT[tone];
  const cx = cxIn ?? (wide ? 46 : 72);
  const cy = cyIn ?? (wide ? 50 : 30);
  const W = wide ? 230 : 100;
  const H = wide ? 100 : 125;
  const light = p.ink === '#FFFFFF';
  return (
    <Svg
      style={StyleSheet.absoluteFill}
      width="100%"
      height="100%"
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      pointerEvents="none">
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
      <Rect x="0" y="0" width={W} height={H} fill={`url(#tg-${id})`} />
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
