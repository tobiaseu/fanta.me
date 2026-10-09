import Svg, { Circle, Path } from 'react-native-svg';

import { colors } from '@/theme/tokens';

export type IconName =
  | 'home'
  | 'book'
  | 'play'
  | 'people'
  | 'bell'
  | 'plus'
  | 'chevron-left'
  | 'chevron-right'
  | 'clock'
  | 'calendar'
  | 'lock'
  | 'close'
  | 'check'
  | 'trophy'
  | 'grid'
  | 'send';

interface Props {
  name: IconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
}

/** Icone a tratto lineare 24×24, nello stile Vuesax usato nel Figma. */
export function Icon({ name, size = 24, color = colors.ink, strokeWidth = 1.4 }: Props) {
  // Tratto sottile e uniforme in tutta l'app (massimo 1,6)
  const p = {
    stroke: color,
    strokeWidth: Math.min(strokeWidth, 1.6),
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    fill: 'none',
  };
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {name === 'home' && (
        <Path
          {...p}
          d="M9.02 2.84 3.63 7.04C2.73 7.74 2 9.23 2 10.36v7.41C2 20.09 3.89 22 6.21 22h11.58C20.11 22 22 20.09 22 17.78V10.5c0-1.21-.81-2.76-1.8-3.45l-6.18-4.33c-1.4-.98-3.65-.93-5 .12ZM12 17.99v-3"
        />
      )}
      {name === 'book' && (
        <>
          <Path {...p} d="M21 7v10c0 3-1.5 5-5 5H8c-3.5 0-5-2-5-5V7c0-3 1.5-5 5-5h8c3.5 0 5 2 5 5Z" />
          <Path
            {...p}
            d="M15.5 2v7.86c0 .44-.52.66-.84.37l-2.32-2.14a.5.5 0 0 0-.68 0l-2.32 2.14c-.32.29-.84.07-.84-.37V2M13.25 14H17.5M9 18h8.5"
          />
        </>
      )}
      {name === 'play' && (
        <Path
          fill={color}
          d="M6 5.6c0-2.1 2.3-3.4 4.1-2.3l9.6 5.9c1.7 1.05 1.7 3.55 0 4.6l-9.6 5.9C8.3 20.8 6 19.5 6 17.4V5.6Z"
        />
      )}
      {name === 'people' && (
        <>
          <Circle {...p} cx={12} cy={6.5} r={3} />
          <Circle {...p} cx={5.5} cy={9} r={2.2} />
          <Circle {...p} cx={18.5} cy={9} r={2.2} />
          <Path
            {...p}
            d="M7.5 19.5c0-2.8 2-4.5 4.5-4.5s4.5 1.7 4.5 4.5c0 1-.6 1.5-1.5 1.5h-6c-.9 0-1.5-.5-1.5-1.5ZM2 18c0-2 1.3-3.3 3.3-3.4M22 18c0-2-1.3-3.3-3.3-3.4"
          />
        </>
      )}
      {name === 'bell' && (
        <>
          <Path
            {...p}
            d="M12 3.5c-3.3 0-6 2.7-6 6v2.9c0 .6-.26 1.53-.57 2.05l-1.14 1.9c-.71 1.18-.22 2.48 1.08 2.92 4.3 1.43 8.96 1.43 13.26 0 1.21-.4 1.74-1.82 1.08-2.92l-1.14-1.9c-.3-.52-.57-1.45-.57-2.05V9.5c0-3.3-2.7-6-6-6Z"
          />
          <Path {...p} d="M15 19c0 1.65-1.35 3-3 3-.82 0-1.58-.34-2.12-.88A3 3 0 0 1 9 19" />
        </>
      )}
      {name === 'plus' && <Path {...p} d="M12 5v14M5 12h14" />}
      {name === 'chevron-left' && <Path {...p} d="M15 19.92 8.48 13.4c-.77-.77-.77-2.03 0-2.8L15 4.08" />}
      {name === 'chevron-right' && <Path {...p} d="m8.91 19.92 6.52-6.52c.77-.77.77-2.03 0-2.8L8.91 4.08" />}
      {name === 'clock' && (
        <>
          <Circle {...p} cx={12} cy={12} r={9} />
          <Path {...p} d="M12 7.5V12l3 2" />
        </>
      )}
      {name === 'calendar' && (
        <Path
          {...p}
          d="M8 2v3M16 2v3M3.5 9.09h17M21 8.5V17c0 3-1.5 5-5 5H8c-3.5 0-5-2-5-5V8.5c0-3 1.5-5 5-5h8c3.5 0 5 2 5 5Z"
        />
      )}
      {name === 'lock' && (
        <Path
          {...p}
          d="M6 10V8c0-3.31 1-6 6-6s6 2.69 6 6v2M17 22H7c-4 0-5-1-5-5v-2c0-4 1-5 5-5h10c4 0 5 1 5 5v2c0 4-1 5-5 5Z"
        />
      )}
      {name === 'close' && <Path {...p} d="M18 6 6 18M6 6l12 12" />}
      {name === 'check' && <Path {...p} d="m5 12.5 4.5 4.5L19 7.5" />}
      {name === 'trophy' && (
        <Path
          {...p}
          d="M12.15 16.5v2.1M7.15 22h10v-1c0-1.1-.9-2-2-2h-6c-1.1 0-2 .9-2 2v1ZM6.15 22h12M12 16c-3.87 0-7-3.13-7-7V6c0-2.21 1.79-4 4-4h6c2.21 0 4 1.79 4 4v3c0 3.87-3.13 7-7 7ZM5.47 11.65c-.75-.24-1.41-.68-1.93-1.2-.9-1-1.5-2.2-1.5-3.6s1.1-2.5 2.5-2.5h.65M18.53 11.65c.75-.24 1.41-.68 1.93-1.2.9-1 1.5-2.2 1.5-3.6s-1.1-2.5-2.5-2.5h-.65"
        />
      )}
      {name === 'send' && <Path {...p} d="M21.5 2.5 10.5 13.5M21.5 2.5l-7 19-4-8-8-4 19-7Z" />}
      {name === 'grid' &&
        [6, 12, 18].flatMap((y) =>
          [6, 12, 18].map((x) => <Circle key={`${x}-${y}`} cx={x} cy={y} r={1.9} fill={color} />),
        )}
    </Svg>
  );
}
