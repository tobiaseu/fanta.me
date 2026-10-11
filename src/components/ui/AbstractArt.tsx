import { StyleSheet } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, RadialGradient, Rect, Stop } from 'react-native-svg';

/**
 * Grafica astratta delle card "azione": fondo quasi nero, due aloni di luce e un anello sottile.
 * Ogni tipo di azione ha il suo colore, così si riconosce prima di leggere.
 */
export type ArtMood = 'deck' | 'vote' | 'finale' | 'rematch' | 'neutral';

const MOODS: Record<ArtMood, [string, string]> = {
  deck: ['#FFD84D', '#F2994A'],
  vote: ['#1CB100', '#2F7BEA'],
  finale: ['#8B6CF6', '#F25C54'],
  rematch: ['#F2994A', '#F25C54'],
  neutral: ['#6E6E73', '#2F7BEA'],
};

export function AbstractArt({ mood }: { mood: ArtMood }) {
  const [a, b] = MOODS[mood];
  return (
    <Svg style={StyleSheet.absoluteFill} viewBox="0 0 400 260" preserveAspectRatio="xMidYMid slice">
      <Defs>
        <RadialGradient id={`ga-${mood}`} cx="85%" cy="10%" r="70%">
          <Stop offset="0" stopColor={a} stopOpacity="0.75" />
          <Stop offset="1" stopColor={a} stopOpacity="0" />
        </RadialGradient>
        <RadialGradient id={`gb-${mood}`} cx="10%" cy="110%" r="65%">
          <Stop offset="0" stopColor={b} stopOpacity="0.5" />
          <Stop offset="1" stopColor={b} stopOpacity="0" />
        </RadialGradient>
        <LinearGradient id="veil" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#0E0E11" stopOpacity="0" />
          <Stop offset="1" stopColor="#0E0E11" stopOpacity="0.55" />
        </LinearGradient>
      </Defs>
      <Rect width="400" height="260" fill="#0E0E11" />
      <Rect width="400" height="260" fill={`url(#ga-${mood})`} />
      <Rect width="400" height="260" fill={`url(#gb-${mood})`} />
      <Circle cx="330" cy="40" r="120" stroke="#FFFFFF" strokeOpacity="0.08" strokeWidth="1" fill="none" />
      <Circle cx="330" cy="40" r="70" stroke="#FFFFFF" strokeOpacity="0.06" strokeWidth="1" fill="none" />
      <Rect width="400" height="260" fill="url(#veil)" />
    </Svg>
  );
}
