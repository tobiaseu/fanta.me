import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/icons/Icon';
import { AppText } from '@/components/ui/AppText';
import { PressableScale } from '@/components/ui/PressableScale';
import { haptics } from '@/lib/haptics';
import { colors, radius, shadow, space } from '@/theme/tokens';

/**
 * CTA primaria "Crea Nuova Stanza": pulsante largo fisso in basso
 * (scelto al posto del FAB tondo: più leggibile e raggiungibile col pollice).
 */
export function CreateRoomButton({ onPress }: { onPress: () => void }) {
  const insets = useSafeAreaInsets();
  return (
    <View pointerEvents="box-none" style={[styles.dock, { paddingBottom: Math.max(insets.bottom, space.md) }]}>
      <PressableScale
        accessibilityRole="button"
        accessibilityLabel="Crea nuova stanza"
        onPress={() => {
          haptics.press();
          onPress();
        }}
        style={styles.button}>
        <View style={styles.plus}>
          <Icon name="plus" size={18} color={colors.cta} strokeWidth={3} />
        </View>
        <AppText variant="headline" color={colors.ctaInk}>
          Crea Nuova Stanza
        </AppText>
      </PressableScale>
    </View>
  );
}

const styles = StyleSheet.create({
  dock: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: space.lg,
    paddingTop: space.lg,
    experimental_backgroundImage: `linear-gradient(to bottom, ${colors.background}00, ${colors.background} 45%)`,
  },
  button: {
    height: 58,
    borderRadius: radius.pill,
    backgroundColor: colors.cta,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.sm,
    ...shadow.floating,
  },
  plus: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.ctaInk,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
