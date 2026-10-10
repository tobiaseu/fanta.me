import { StyleSheet, View } from 'react-native';

import { AppText } from './AppText';

import { colors, space } from '@/theme/tokens';

/**
 * Avanzamento dell'onboarding: segmenti + etichetta.
 * L'etichetta è ciò che si è già deciso (es. "Weekend al mare · Sprint"), così la stanza si compone passo dopo passo.
 */
export function StepHeader({ step, total, label }: { step: number; total: number; label?: string }) {
  return (
    <View style={styles.wrap} accessibilityLabel={`Passo ${step} di ${total}`}>
      <View style={styles.bars}>
        {Array.from({ length: total }, (_, i) => (
          <View key={i} style={[styles.bar, i < step && styles.done]} />
        ))}
      </View>
      <AppText variant="caption" color={colors.inkSoft} numberOfLines={1}>
        {label ?? `Passo ${step} di ${total}`}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: space.xs },
  bars: { flexDirection: 'row', gap: space.xxs },
  bar: { flex: 1, height: 4, borderRadius: 2, backgroundColor: colors.surfaceMuted },
  done: { backgroundColor: colors.ink },
});
