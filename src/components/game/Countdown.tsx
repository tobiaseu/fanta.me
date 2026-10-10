import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { useNow } from '@/hooks/useNow';
import { colors, radius, space } from '@/theme/tokens';

const pad = (n: number) => String(n).padStart(2, '0');

/** Countdown essenziale a tessere: giorni/ore/minuti oltre i due giorni, sotto ore/minuti/secondi. */
export function Countdown({ target, label }: { target: number; label: string }) {
  const now = useNow();
  const left = Math.max(0, Math.floor((target - now) / 1000));
  const tiles =
    left >= 172_800
      ? [
          { v: Math.floor(left / 86_400), u: 'giorni' },
          { v: Math.floor((left % 86_400) / 3600), u: 'ore' },
          { v: Math.floor((left % 3600) / 60), u: 'minuti' },
        ]
      : [
          { v: Math.floor(left / 3600), u: 'ore' },
          { v: Math.floor((left % 3600) / 60), u: 'minuti' },
          { v: left % 60, u: 'secondi' },
        ];
  return (
    <View style={styles.wrap} accessibilityLabel={`${label} ${tiles.map((t) => `${t.v} ${t.u}`).join(', ')}`}>
      <AppText variant="caption" color={colors.inkSoft}>
        {label}
      </AppText>
      <View style={styles.row}>
        {tiles.map((t) => (
          <View key={t.u} style={styles.tile}>
            <AppText variant="display" style={styles.digits}>
              {pad(t.v)}
            </AppText>
            <AppText variant="micro" color={colors.inkSoft}>
              {t.u}
            </AppText>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', gap: space.xs },
  row: { flexDirection: 'row', gap: space.xs },
  tile: {
    width: 76,
    alignItems: 'center',
    paddingVertical: space.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
  },
  digits: { fontSize: 30, lineHeight: 36, fontVariant: ['tabular-nums'] },
});
