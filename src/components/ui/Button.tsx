import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

import { AppText } from './AppText';
import { PressableScale } from './PressableScale';

import { Icon, type IconName } from '@/components/icons/Icon';
import { haptics } from '@/lib/haptics';
import { colors, radius, space } from '@/theme/tokens';

/** Uno solo `primary` per schermata; secondari e terziari hanno lo stesso colore d'inchiostro. */
type Variant = 'primary' | 'secondary' | 'tertiary';

interface Props {
  label: string;
  onPress: () => void;
  variant?: Variant;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  /** Icona a sinistra del testo */
  icon?: IconName;
}

/**
 * Tre livelli, sempre gli stessi:
 * primary = giallo pieno (al massimo uno per schermata),
 * secondary = trasparente con bordo grigio scuro sottile,
 * tertiary = solo testo, stesso colore del secondario.
 */
export function Button({ label, onPress, variant = 'primary', disabled, style, icon }: Props) {
  const tint = disabled ? colors.inkMuted : colors.ink;
  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={() => {
        haptics.press();
        onPress();
      }}
      style={[styles.base, styles[variant], disabled && styles.disabled, style]}>
      {icon && <Icon name={icon} size={20} color={tint} />}
      <AppText variant="headline" color={tint}>
        {label}
      </AppText>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 52,
    borderRadius: radius.pill,
    flexDirection: 'row',
    gap: space.xs,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: space.md,
  },
  primary: { backgroundColor: colors.cta },
  secondary: { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.line },
  tertiary: { backgroundColor: 'transparent', height: 44 },
  disabled: { backgroundColor: colors.surfaceMuted, borderColor: colors.surfaceMuted },
});
