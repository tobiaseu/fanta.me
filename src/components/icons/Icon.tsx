import Svg, { Circle, Path } from 'react-native-svg';

import { colors } from '@/theme/tokens';

export type IconName =
  | 'feed'
  | 'rules'
  | 'bolt'
  | 'trophy'
  | 'user'
  | 'plus'
  | 'chevron-left'
  | 'chevron-right'
  | 'clock'
  | 'calendar'
  | 'lock'
  | 'close'
  | 'play';

interface Props {
  name: IconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
}

/** Set di icone a tratto arrotondato (24×24), disegnato a mano per coerenza. */
export function Icon({ name, size = 24, color = colors.ink, strokeWidth = 2.2 }: Props) {
  const p = {
    stroke: color,
    strokeWidth,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    fill: 'none',
  };
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {name === 'feed' && (
        <>
          <Path {...p} d="M4 11.5 12 4l8 7.5V19a1 1 0 0 1-1 1h-4.5v-5.5h-5V20H5a1 1 0 0 1-1-1z" />
        </>
      )}
      {name === 'rules' && (
        <>
          <Path {...p} d="M5 4.5A1.5 1.5 0 0 1 6.5 3H19v15H6.5A1.5 1.5 0 0 0 5 19.5z" />
          <Path {...p} d="M5 19.5A1.5 1.5 0 0 0 6.5 21H19v-3M9 7.5h6M9 11h4" />
        </>
      )}
      {name === 'bolt' && <Path {...p} fill={color} d="M13.5 2.5 5 13.5h6l-1 8 8.5-11h-6z" />}
      {name === 'trophy' && (
        <>
          <Path {...p} d="M7 4h10v5a5 5 0 0 1-10 0zM7 6H4v1.5A3.5 3.5 0 0 0 7.5 11M17 6h3v1.5a3.5 3.5 0 0 1-3.5 3.5" />
          <Path {...p} d="M12 14v3.5M8.5 20.5h7M9.5 20.5c0-1.7 1-3 2.5-3s2.5 1.3 2.5 3" />
        </>
      )}
      {name === 'user' && (
        <>
          <Circle {...p} cx={12} cy={8.5} r={4} />
          <Path {...p} d="M4.5 20.5c1-3.8 4-5.5 7.5-5.5s6.5 1.7 7.5 5.5" />
        </>
      )}
      {name === 'plus' && <Path {...p} d="M12 5v14M5 12h14" />}
      {name === 'chevron-left' && <Path {...p} d="M15 5l-7 7 7 7" />}
      {name === 'chevron-right' && <Path {...p} d="M9 5l7 7-7 7" />}
      {name === 'clock' && (
        <>
          <Circle {...p} cx={12} cy={12} r={8.5} />
          <Path {...p} d="M12 7.5V12l3 2" />
        </>
      )}
      {name === 'calendar' && (
        <>
          <Path {...p} d="M4.5 6.5a1.5 1.5 0 0 1 1.5-1.5h12a1.5 1.5 0 0 1 1.5 1.5V19a1.5 1.5 0 0 1-1.5 1.5H6A1.5 1.5 0 0 1 4.5 19z" />
          <Path {...p} d="M4.5 10h15M8.5 3v4M15.5 3v4" />
        </>
      )}
      {name === 'lock' && (
        <>
          <Path {...p} d="M6 11h12v9H6zM8.5 11V8a3.5 3.5 0 0 1 7 0v3" />
        </>
      )}
      {name === 'close' && <Path {...p} d="M6 6l12 12M18 6 6 18" />}
      {name === 'play' && <Path {...p} fill={color} d="M8 5.5v13l10-6.5z" />}
    </Svg>
  );
}
