import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { colors, space } from '@/theme/tokens';
import type { GameStatus } from '@/types/game';

export const PHASES = [
  { id: 'setup', label: 'Preparazione' },
  { id: 'waiting', label: 'Pre-partita' },
  { id: 'live', label: 'In partita' },
  { id: 'ended', label: 'Risultati' },
] as const;

/** Le quattro fasi di una stanza, con quella attuale in evidenza. */
export function PhaseTrack({
  status,
  thick,
  bare,
}: {
  status: GameStatus | 'setup';
  thick?: boolean;
  /** Solo i segmenti, senza etichette (barra compatta) */
  bare?: boolean;
}) {
  const current = PHASES.findIndex((p) => p.id === status);
  return (
    <View
      style={styles.row}
      accessibilityRole="progressbar"
      accessibilityLabel={`Fase ${current + 1} di 4: ${PHASES[current]?.label}`}>
      {PHASES.map((p, i) => {
        const done = i < current;
        const now = i === current;
        return (
          <View key={p.id} style={styles.step}>
            <View style={[styles.bar, thick && styles.thick, (done || now) && styles.barOn, now && styles.barNow]} />
            {!bare && (
              <AppText variant="micro" color={now ? colors.ink : done ? colors.inkSoft : colors.inkFaint}>
                {p.label}
              </AppText>
            )}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: space.xxs },
  step: { flex: 1, gap: space.xxs },
  bar: { height: 4, borderRadius: 2, backgroundColor: colors.surfaceMuted },
  thick: { height: 6, borderRadius: 3 },
  barOn: { backgroundColor: colors.inkFaint },
  barNow: { backgroundColor: colors.ink },
});
