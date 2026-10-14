import { ActivityIndicator, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

import { AppText } from './AppText';
import { PressableScale } from './PressableScale';

import { Icon, type IconName } from '@/components/icons/Icon';
import { haptics } from '@/lib/haptics';
import { colors, radius, space } from '@/theme/tokens';

/** Uno solo `primary` per schermata; secondari e terziari hanno lo stesso colore d'inchiostro. */
type Variant = 'primary' | 'secondary' | 'tertiary' | 'destructive';

interface Props {
  label: string;
  onPress: () => void;
  variant?: Variant;
  disabled?: boolean;
  /** In attesa: mostra la rotellina e non accetta tocchi */
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  /** Icona a sinistra del testo */
  icon?: IconName;
  /** Su foto o fondo scuro: secondario e terziario in bianco */
  onDark?: boolean;
  /** Sopra una superficie sempre bianca (le carte), in qualsiasi tema */
  onLight?: boolean;
}

/**
 * Tre livelli, sempre gli stessi:
 * primary = giallo pieno (al massimo uno per schermata),
 * secondary = trasparente con bordo grigio scuro sottile,
 * tertiary = solo testo, stesso colore del secondario;
 * destructive = come il secondario, ma in rosso (azioni irreversibili).
 */
export function Button({
  label,
  onPress,
  variant = 'primary',
  disabled,
  loading,
  style,
  icon,
  onDark,
  onLight,
}: Props) {
  const tint = disabled
    ? colors.inkMuted
    : variant === 'destructive'
      ? colors.destructive
      : variant === 'primary'
        ? colors.ctaInk
        : onDark
          ? '#FFFFFF'
          : onLight
            ? '#0B0B0D'
            : colors.ink;
  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityState={{ disabled, busy: loading }}
      disabled={disabled || loading}
      onPress={() => {
        haptics.press();
        onPress();
      }}
      style={[
        styles.base,
        styles[variant],
        onDark && variant === 'secondary' && styles.secondaryDark,
        onLight && variant === 'secondary' && styles.secondaryLight,
        disabled && styles.disabled,
        style,
      ]}>
      {loading ? <ActivityIndicator size="small" color={tint} /> : icon && <Icon name={icon} size={20} color={tint} />}
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
  secondaryDark: { borderColor: 'rgba(255, 255, 255, 0.45)' },
  secondaryLight: { borderColor: 'rgba(0, 0, 0, 0.18)' },
  destructive: { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.destructive },
  tertiary: { backgroundColor: 'transparent', height: 44 },
  disabled: { backgroundColor: colors.surfaceMuted, borderColor: colors.surfaceMuted },
});
