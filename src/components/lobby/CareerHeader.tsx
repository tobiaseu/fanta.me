import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { colors, radius, space } from '@/theme/tokens';
import type { User } from '@/types/game';

/** Riepilogo "Carriera" del fantallenatore, in cima alla Lobby. */
export function CareerHeader({ user }: { user: User }) {
  const { career } = user;
  const stats = [
    { label: 'trofei', value: career.trophies, emoji: '🏆' },
    { label: 'partite', value: career.gamesPlayed, emoji: '🎲' },
    { label: 'punti totali', value: career.totalPoints.toLocaleString('it-IT'), emoji: '⚡️' },
  ];

  return (
    <View style={styles.card}>
      <AppText variant="caption" color={colors.inkMuted}>
        Ciao {user.name}, la tua carriera da fantallenatore:
      </AppText>
      <View style={styles.row}>
        {stats.map((s, i) => (
          <View key={s.label} style={[styles.stat, i > 0 && styles.divider]}>
            <AppText variant="number" numberOfLines={1} adjustsFontSizeToFit>
              {s.value}
            </AppText>
            <AppText variant="caption" color={colors.inkSoft} numberOfLines={1}>
              {s.emoji} {s.label}
            </AppText>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: space.md,
    gap: space.sm,
  },
  row: { flexDirection: 'row' },
  stat: { flex: 1, gap: 2 },
  divider: {
    borderLeftWidth: 1,
    borderLeftColor: colors.hairline,
    paddingLeft: space.md,
  },
});
