import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Avatar } from '@/components/ui/Avatar';
import { colors, radius, shadow, space } from '@/theme/tokens';
import type { User } from '@/types/game';

/** Header globale della Lobby: avatar + riepilogo "Carriera". */
export function CareerHeader({ user }: { user: User }) {
  const { career } = user;
  const stats = [
    { label: 'Trofei', value: career.trophies, emoji: '🏆' },
    { label: 'Partite', value: career.gamesPlayed, emoji: '🎲' },
    { label: 'Punti', value: career.totalPoints.toLocaleString('it-IT'), emoji: '⚡️' },
  ];

  return (
    <View style={styles.wrap}>
      <View style={styles.topRow}>
        <View style={styles.greeting}>
          <AppText variant="caption" color={colors.inkMuted}>
            Ciao fantallenatore,
          </AppText>
          <AppText variant="display">{user.name} 👋</AppText>
        </View>
        <Avatar player={user} size={52} />
      </View>

      <View style={styles.careerCard}>
        <AppText variant="micro" color={colors.inkMuted}>
          La tua carriera
        </AppText>
        <View style={styles.statsRow}>
          {stats.map((s, i) => (
            <View key={s.label} style={[styles.stat, i > 0 && styles.statDivider]}>
              <AppText variant="number" numberOfLines={1} adjustsFontSizeToFit>
                {s.value}
              </AppText>
              <AppText variant="caption" color={colors.inkMuted}>
                {s.emoji} {s.label}
              </AppText>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: space.lg },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  greeting: { gap: space.xxs, flexShrink: 1 },
  careerCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: space.md,
    gap: space.sm,
    ...shadow.card,
  },
  statsRow: { flexDirection: 'row' },
  stat: { flex: 1, gap: 2 },
  statDivider: {
    borderLeftWidth: StyleSheet.hairlineWidth * 2,
    borderLeftColor: colors.hairline,
    paddingLeft: space.md,
  },
});
