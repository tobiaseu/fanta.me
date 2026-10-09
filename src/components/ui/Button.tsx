import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

import { AppText } from './AppText';
import { PressableScale } from './PressableScale';

import { Icon, type IconName } from '@/components/icons/Icon';
import { haptics } from '@/lib/haptics';
import { colors, radius, space } from '@/theme/tokens';

type Variant = 'primary' | 'secondary' | 'dark' | 'confirm' | 'reject';

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
 * Bottoni a pillola (come Clubhouse), alti 56.
 * CTA del Figma: "CTA 1" (giallo pieno), "CTA 2" (bianco con bordo giallo),
 * più le varianti Conferma/Rifiuta della schermata di voto.
 */
export function Button({ label, onPress, variant = 'primary', disabled, style, icon }: Props) {
  const tint = disabled ? colors.inkMuted : variant === 'dark' ? colors.inkInverse : colors.ink;
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
      {icon && <Icon name={icon} size={20} color={tint} strokeWidth={2} />}
      <AppText variant="headline" color={tint}>
        {label}
      </AppText>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 56,
    borderRadius: radius.pill,
    flexDirection: 'row',
    gap: space.xs,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: space.md,
  },
  primary: { backgroundColor: colors.cta },
  secondary: { backgroundColor: colors.surface, borderWidth: 2, borderColor: colors.cta },
  dark: { backgroundColor: colors.ink },
  confirm: { backgroundColor: colors.bonusSoft, borderWidth: 1, borderColor: colors.bonusBorder },
  reject: { backgroundColor: colors.malusSoft, borderWidth: 1, borderColor: colors.malusBorder },
  disabled: { backgroundColor: colors.surfaceMuted, borderColor: colors.surfaceMuted },
});
