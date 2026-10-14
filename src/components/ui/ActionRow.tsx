import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';

import { Button } from './Button';

import type { IconName } from '@/components/icons/Icon';
import { colors, space } from '@/theme/tokens';

export type RowAction = { label: string; onPress: () => void; icon?: IconName };

/**
 * Regola dei bottoni in tutta l'app: primaria (arancio) sempre a destra, secondaria (bordata) a sinistra.
 * Se c'è solo la secondaria va a tutta larghezza.
 */
export function ActionRow({
  primary,
  secondary,
  onDark,
  style,
}: {
  primary?: RowAction;
  secondary?: RowAction;
  onDark?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[styles.row, style]}>
      {secondary && (
        <Button
          label={secondary.label}
          icon={secondary.icon}
          variant="secondary"
          onDark={onDark}
          onPress={secondary.onPress}
          style={styles.flex}
        />
      )}
      {primary && <Button label={primary.label} icon={primary.icon} onPress={primary.onPress} style={styles.flex} />}
    </View>
  );
}

/** Bagliore arancio Fanta.me dietro il soggetto delle carte normali (stesso disegno delle carte del mazzo). */
export function CardGlow({ cy = 52, id }: { cy?: number; id: string }) {
  return (
    <Svg style={StyleSheet.absoluteFill} viewBox="0 0 100 140" preserveAspectRatio="none" pointerEvents="none">
      <Defs>
        <RadialGradient id={`glow-${id}`} cx="50" cy={cy} r="40" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor={colors.cta} stopOpacity={0.85} />
          <Stop offset="1" stopColor={colors.cta} stopOpacity={0} />
        </RadialGradient>
      </Defs>
      <Circle cx="50" cy={cy} r="40" fill={`url(#glow-${id})`} />
      <Circle cx="50" cy={cy} r="28" stroke="#000000" strokeOpacity="0.08" strokeWidth="0.4" fill="none" />
    </Svg>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: space.xs },
  flex: { flex: 1 },
});
