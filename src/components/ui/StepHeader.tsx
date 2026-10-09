import { StyleSheet, View } from 'react-native';

import { AppText } from './AppText';

import { colors, space } from '@/theme/tokens';

/** Avanzamento dell'onboarding: segmenti + "Passo 1 di 2". */
export function StepHeader({ step, total }: { step: number; total: number }) {
  return (
    <View style={styles.wrap} accessibilityLabel={`Passo ${step} di ${total}`}>
      <View style={styles.bars}>
        {Array.from({ length: total }, (_, i) => (
          <View key={i} style={[styles.bar, i < step && styles.done]} />
        ))}
      </View>
      <AppText variant="micro" color={colors.inkSoft}>
        Passo {step} di {total}
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
