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
  | 'send'
  | 'settings'
  | 'ticket'
  | 'edit'
  | 'camera'
  | 'list'
  | 'compass';

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
      {name === 'settings' && (
        <>
          <Path {...p} d="M4 7h10M18 7h2M4 17h2M10 17h10" />
          <Circle {...p} cx={16} cy={7} r={2} />
          <Circle {...p} cx={8} cy={17} r={2} />
        </>
      )}
      {name === 'grid' &&
        [6, 12, 18].flatMap((y) =>
          [6, 12, 18].map((x) => <Circle key={`${x}-${y}`} cx={x} cy={y} r={1.9} fill={color} />),
        )}
      {name === 'compass' && (
        <>
          <Circle {...p} cx={12} cy={12} r={9.5} />
          <Path {...p} d="M15.5 8.5l-2 5-5 2 2-5 5-2Z" />
        </>
      )}
      {name === 'list' && <Path {...p} d="M4 6h16M4 12h16M4 18h16" />}
      {name === 'ticket' && (
        <Path
          {...p}
          d="M19.5 12.5c0-1.38 1.12-2.5 2.5-2.5V9c0-4-1-5-5-5H7C3 4 2 5 2 9v.5c1.38 0 2.5 1.12 2.5 2.5S3.38 14.5 2 14.5v.5c0 4 1 5 5 5h10c4 0 5-1 5-5-1.38 0-2.5-1.12-2.5-2.5ZM10 4v16"
        />
      )}
      {name === 'edit' && (
        <Path
          {...p}
          d="M13.26 3.6 5.05 12.29c-.31.33-.61.98-.67 1.43l-.37 3.24c-.13 1.17.71 1.97 1.87 1.77l3.22-.55c.45-.08 1.08-.41 1.39-.75l8.21-8.69c1.42-1.5 2.06-3.21-.15-5.3-2.2-2.07-3.87-1.34-5.29.16ZM11.89 5.05a6.13 6.13 0 0 0 5.45 5.15M3 22h18"
        />
      )}
      {name === 'camera' && (
        <>
          <Path
            {...p}
            d="M6.76 22h10.48c2.76 0 3.86-1.69 3.99-3.75l.52-8.26A3.753 3.753 0 0 0 18 6c-.61 0-1.17-.35-1.45-.89l-.72-1.45C15.37 2.75 14.17 2 13.15 2h-2.29c-1.03 0-2.23.75-2.69 1.66l-.72 1.45C7.17 5.65 6.61 6 6 6c-2.17 0-3.89 1.83-3.75 3.99l.52 8.26C2.89 20.31 4 22 6.76 22Z"
          />
          <Circle {...p} cx={12} cy={14} r={3.25} />
        </>
      )}
    </Svg>
  );
}
