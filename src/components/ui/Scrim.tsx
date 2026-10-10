import { StyleSheet } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

/** Sfumatura scura dal basso (opaca) verso l'alto (trasparente), sotto il testo bianco delle storie. */
export function Scrim({ height = '70%', strength = 0.9 }: { height?: `${number}%`; strength?: number }) {
  return (
    <Svg style={[styles.fill, { height }]} pointerEvents="none" preserveAspectRatio="none">
      <Defs>
        <LinearGradient id="scrim" x1="0" y1="1" x2="0" y2="0">
          <Stop offset="0" stopColor="#000" stopOpacity={strength} />
          <Stop offset="0.55" stopColor="#000" stopOpacity={strength * 0.55} />
          <Stop offset="1" stopColor="#000" stopOpacity={0} />
        </LinearGradient>
      </Defs>
      <Rect width="100%" height="100%" fill="url(#scrim)" />
    </Svg>
  );
}

const styles = StyleSheet.create({
  fill: { position: 'absolute', left: 0, right: 0, bottom: 0, width: '100%' },
});
