import Svg, { Circle, Ellipse, G, Path } from 'react-native-svg';

import { colors } from '@/theme/tokens';

type Pose = 'wave' | 'cheer' | 'shrug';

interface Props {
  size?: number;
  /** Colore d'accento (iridi, lingua, stelline): il corpo resta crema come negli sticker del Figma */
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

const sparkle = (cx: number, cy: number, r: number) =>
  `M${cx} ${cy - r} Q${cx + r * 0.18} ${cy - r * 0.18} ${cx + r} ${cy} Q${cx + r * 0.18} ${cy + r * 0.18} ${cx} ${cy + r} Q${cx - r * 0.18} ${cy + r * 0.18} ${cx - r} ${cy} Q${cx - r * 0.18} ${cy - r * 0.18} ${cx} ${cy - r} Z`;

/**
 * Mascotte "Retro Rubber-Hose" coerente con lo sticker "La Smurratona" del Figma:
 * corpo crema, tratto nero, un solo colore d'accento, occhi a torta e
 * bordo bianco spesso da sticker fustellato con ombra morbida.
 */
export function RubberHoseMascot({ size = 140, color = colors.toonBlue, pose = 'wave' }: Props) {
  const arms = ARMS[pose];
  const ink = colors.toonInk;

  const figure = (outline: boolean, cut: string = colors.sticker) => {
    const pad = outline ? 14 : 0; // spessore del bordo sticker
    const limb = { stroke: outline ? cut : ink, strokeWidth: 6 + pad, strokeLinecap: 'round' as const, fill: 'none' };
    const fill = (c: string) => (outline ? cut : c);
    const stroke = outline ? cut : ink;
    const sw = (w: number) => w + pad;

    return (
      <G>
        {/* stelline */}
        <Path d={sparkle(22, 30, 9)} fill={fill(color)} stroke={stroke} strokeWidth={sw(2.5)} strokeLinejoin="round" />
        <Path d={sparkle(142, 36, 7)} fill={fill(color)} stroke={stroke} strokeWidth={sw(2.5)} strokeLinejoin="round" />
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
        <Circle
          cx={arms.lg[0]}
          cy={arms.lg[1]}
          r={11}
          fill={fill(colors.sticker)}
          stroke={stroke}
          strokeWidth={sw(3)}
        />
        <Circle
          cx={arms.rg[0]}
          cy={arms.rg[1]}
          r={11}
          fill={fill(colors.sticker)}
          stroke={stroke}
          strokeWidth={sw(3)}
        />
        {/* corpo */}
        <Circle cx={80} cy={90} r={44} fill={fill(colors.toonBody)} stroke={stroke} strokeWidth={sw(3.5)} />
        {!outline && (
          <>
            {/* occhi a torta con iride colorata */}
            <Ellipse cx={67} cy={80} rx={9.5} ry={12} fill={colors.sticker} stroke={ink} strokeWidth={3} />
            <Ellipse cx={93} cy={80} rx={9.5} ry={12} fill={colors.sticker} stroke={ink} strokeWidth={3} />
            <Ellipse cx={68} cy={84} rx={6} ry={7} fill={color} stroke={ink} strokeWidth={2} />
            <Ellipse cx={94} cy={84} rx={6} ry={7} fill={color} stroke={ink} strokeWidth={2} />
            <Ellipse cx={68.5} cy={85} rx={2.6} ry={3.4} fill={ink} />
            <Ellipse cx={94.5} cy={85} rx={2.6} ry={3.4} fill={ink} />
            <Path fill={colors.sticker} d="M68.5 85 L72 80.5 L72.5 84 Z" />
            <Path fill={colors.sticker} d="M94.5 85 L98 80.5 L98.5 84 Z" />
            {/* palpebre pesanti stile anni '30 */}
            <Path d="M57.5 74 Q67 66 76.5 74" stroke={ink} strokeWidth={3} fill="none" strokeLinecap="round" />
            <Path d="M83.5 74 Q93 66 102.5 74" stroke={ink} strokeWidth={3} fill="none" strokeLinecap="round" />
            {/* bocca */}
            <Path
              fill={ink}
              d={
                pose === 'shrug' ? 'M68 108 Q80 102 92 108 Q80 113 68 108 Z' : 'M62 102 Q80 126 98 102 Q80 111 62 102 Z'
              }
            />
            {pose !== 'shrug' && <Path fill={color} d="M72 111 Q80 119 88 111 Q80 109 72 111 Z" />}
            {/* goccia di sudore / guance */}
            {pose === 'shrug' ? (
              <Path fill={color} stroke={ink} strokeWidth={2} d="M112 62 Q118 72 112 76 Q106 72 112 62 Z" />
            ) : (
              <>
                <Ellipse cx={56} cy={98} rx={5} ry={3} fill={color} opacity={0.35} />
                <Ellipse cx={104} cy={98} rx={5} ry={3} fill={color} opacity={0.35} />
              </>
            )}
          </>
        )}
      </G>
    );
  };

  return (
    <Svg width={size} height={(size * 168) / 172} viewBox="-6 12 172 168">
      {/* ombra morbida dello sticker */}
      <G opacity={0.12} transform="translate(2 5)">
        {figure(true, colors.toonInk)}
      </G>
      {figure(true)}
      {figure(false)}
    </Svg>
  );
}
