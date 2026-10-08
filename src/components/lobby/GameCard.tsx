import { StyleSheet, View } from 'react-native';

import { Icon } from '@/components/icons/Icon';
import { AppText } from '@/components/ui/AppText';
import { AvatarStack } from '@/components/ui/Avatar';
import { PressableScale } from '@/components/ui/PressableScale';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { formatHoursLeft } from '@/lib/time';
import { colors, radius, shadow, space } from '@/theme/tokens';
import type { Game, Player } from '@/types/game';

interface Props {
  game: Game;
  players: Player[];
  /** Punti e posizione dell'utente in questa partita */
  myPoints: number;
  myRank: number;
  now: number;
  onPress: () => void;
}

/** Card "Partita Attiva" della Lobby (Sprint o Maratona). */
export function GameCard({ game, players, myPoints, myRank, now, onPress }: Props) {
  const isSprint = game.mode === 'sprint';
  const timing = isSprint
    ? `${formatHoursLeft(new Date(game.endsAt ?? now).getTime() - now)} alla fine`
    : `Settimana ${game.week?.current}/${game.week?.total}`;
  const progress = isSprint ? undefined : (game.week?.current ?? 0) / (game.week?.total ?? 1);

  return (
    <PressableScale
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Apri ${game.name}`}
      style={styles.card}>
      <View style={styles.header}>
        <View style={[styles.emoji, { backgroundColor: `${game.accent}1F` }]}>
          <AppText style={styles.emojiText}>{game.emoji}</AppText>
        </View>
        <View style={styles.titleBlock}>
          <AppText variant="headline" numberOfLines={1}>
            {game.name}
          </AppText>
          <View style={styles.metaRow}>
            <View style={[styles.modeChip, isSprint ? styles.sprint : styles.marathon]}>
              <AppText variant="micro" color={isSprint ? '#8A4B00' : colors.toonBlue}>
                {isSprint ? 'Sprint' : 'Maratona'}
              </AppText>
            </View>
            <Icon name={isSprint ? 'clock' : 'calendar'} size={14} color={colors.inkMuted} strokeWidth={2.4} />
            <AppText variant="caption" color={colors.inkMuted}>
              {timing}
            </AppText>
          </View>
        </View>
        <Icon name="chevron-right" size={20} color={colors.inkMuted} />
      </View>

      {progress !== undefined && (
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${progress * 100}%`, backgroundColor: game.accent }]} />
        </View>
      )}

      <View style={styles.footer}>
        <AvatarStack players={players} />
        <View style={styles.footerRight}>
          <StatusBadge status={game.status} />
          <AppText variant="caption" color={colors.inkSoft}>
            {myRank}° · {myPoints} pt
          </AppText>
        </View>
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: space.md,
    gap: space.md,
    ...shadow.card,
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  emoji: {
    width: 52,
    height: 52,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiText: { fontSize: 26, lineHeight: 32 },
  titleBlock: { flex: 1, gap: space.xxs },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: space.xs - 2 },
  modeChip: { paddingHorizontal: space.xs, paddingVertical: 2, borderRadius: radius.pill },
  sprint: { backgroundColor: colors.ctaSoft },
  marathon: { backgroundColor: '#E3EBFF' },
  track: { height: 6, borderRadius: 3, backgroundColor: colors.surfaceMuted, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 3 },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  footerRight: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
});
