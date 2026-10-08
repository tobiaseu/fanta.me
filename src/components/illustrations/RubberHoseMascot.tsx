import Svg, { Circle, Ellipse, G, Path } from 'react-native-svg';

import { colors } from '@/theme/tokens';

type Pose = 'wave' | 'cheer' | 'shrug';

interface Props {
  size?: number;
  /** Colore principale: la seconda tinta è sempre l'inchiostro nero */
  color?: string;
  pose?: Pose;
}

const ARMS: Record<Pose, { left: string; right: string; lg: [number, number]; rg: [number, number] }> = {
  wave: {
    left: 'M44 90 C26 84 22 62 30 46',
    right: 'M116 96 C134 102 140 116 136 128',
    lg: [30, 42],
    rg: [136, 132],
  },
  cheer: {
    left: 'M44 86 C30 76 24 56 30 40',
    right: 'M116 86 C130 76 136 56 130 40',
    lg: [30, 36],
    rg: [130, 36],
  },
  shrug: {
    left: 'M42 98 C28 98 18 90 16 76',
    right: 'M118 98 C132 98 142 90 144 76',
    lg: [16, 72],
    rg: [144, 72],
  },
};

/**
 * Mascotte "Retro Rubber-Hose" (cartoon anni '30): 2 colori vibranti,
 * occhi a torta, braccia a tubo di gomma e bordo bianco spesso da sticker fustellato.
 * Disegnata in SVG così scala nitida e si ricolora per ogni stanza.
 */
export function RubberHoseMascot({ size = 140, color = colors.toonRed, pose = 'wave' }: Props) {
  const arms = ARMS[pose];
  const ink = colors.toonInk;

  const figure = (outline: boolean, cut: string = colors.sticker) => {
    const pad = outline ? 14 : 0; // spessore del bordo sticker
    const limb = { stroke: outline ? cut : ink, strokeWidth: 7 + pad, strokeLinecap: 'round' as const, fill: 'none' };
    const fill = (c: string) => (outline ? cut : c);
    const stroke = outline ? cut : ink;
    const sw = (w: number) => w + pad;

    return (
      <G>
        {/* gambe a tubo */}
        <Path {...limb} d="M68 128 C66 144 58 152 50 158" />
        <Path {...limb} d="M92 128 C94 144 102 152 110 158" />
        {/* braccia a tubo */}
        <Path {...limb} d={arms.left} />
        <Path {...limb} d={arms.right} />
        {/* scarpe */}
        <Ellipse cx={44} cy={161} rx={17} ry={9} fill={fill(ink)} stroke={stroke} strokeWidth={sw(0)} />
        <Ellipse cx={116} cy={161} rx={17} ry={9} fill={fill(ink)} stroke={stroke} strokeWidth={sw(0)} />
        {/* guanti */}
        <Circle cx={arms.lg[0]} cy={arms.lg[1]} r={11} fill={fill(colors.sticker)} stroke={stroke} strokeWidth={sw(3.5)} />
        <Circle cx={arms.rg[0]} cy={arms.rg[1]} r={11} fill={fill(colors.sticker)} stroke={stroke} strokeWidth={sw(3.5)} />
        {/* corpo */}
        <Circle cx={80} cy={90} r={44} fill={fill(color)} stroke={stroke} strokeWidth={sw(4)} />
        {!outline && (
          <>
            {/* occhi a torta */}
            <Ellipse cx={67} cy={78} rx={9} ry={13} fill={colors.sticker} stroke={ink} strokeWidth={3} />
            <Ellipse cx={93} cy={78} rx={9} ry={13} fill={colors.sticker} stroke={ink} strokeWidth={3} />
            <Ellipse cx={69} cy={80} rx={5} ry={7.5} fill={ink} />
            <Ellipse cx={95} cy={80} rx={5} ry={7.5} fill={ink} />
            <Path fill={color} d="M69 80 L74.5 74 L74.5 79 Z" />
            <Path fill={color} d="M95 80 L100.5 74 L100.5 79 Z" />
            {/* sorriso */}
            <Path
              fill={ink}
              d={pose === 'shrug' ? 'M66 106 Q80 100 94 106 Q80 112 66 106 Z' : 'M60 100 Q80 126 100 100 Q80 110 60 100 Z'}
            />
            {pose !== 'shrug' && <Path fill={color} d="M72 110 Q80 118 88 110 Q80 108 72 110 Z" />}
            {/* lucentezza cartoon */}
            <Path fill={colors.sticker} opacity={0.55} d="M50 70 Q54 56 66 52 Q58 60 56 72 Z" />
          </>
        )}
      </G>
    );
  };

  return (
    <Svg width={size} height={(size * 162) / 168} viewBox="-4 18 168 162">
      {/* ombra morbida dello sticker */}
      <G opacity={0.1} transform="translate(2 5)">
        {figure(true, ink)}
      </G>
      {figure(true)}
      {figure(false)}
    </Svg>
  );
}
