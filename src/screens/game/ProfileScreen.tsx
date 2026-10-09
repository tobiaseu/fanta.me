import { useMemo } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { TAB_BAR_SPACE } from '@/components/game/GameTabBar';
import { AppText } from '@/components/ui/AppText';
import { Avatar } from '@/components/ui/Avatar';
import { CoinIcon } from '@/components/ui/Brand';
import { ME } from '@/data/mock';
import { useCurrentGame } from '@/hooks/useCurrentGame';
import { computeStandings, useGameStore } from '@/store/useGameStore';
import { colors, MAX_APP_WIDTH, radius, shadow, space } from '@/theme/tokens';

/** Profilo in-game (frame "Home" del Figma): avatar grande, il tuo bilancio, chi c'è in questa lega. */
export function ProfileScreen() {
  const game = useCurrentGame();
  const events = useGameStore((s) => s.events);
  const players = useGameStore((s) => s.players);

  const { bonus, malus, standings, team } = useMemo(() => {
    const mine = events.filter((e) => e.gameId === game?.id && e.playerId === ME.id && e.status === 'confirmed');
    return {
      bonus: mine.filter((e) => e.points > 0).reduce((s, e) => s + e.points, 0),
      malus: mine.filter((e) => e.points < 0).reduce((s, e) => s + e.points, 0),
      standings: game ? computeStandings(game, events, players) : [],
      team: game?.teams?.find((t) => t.memberIds.includes(ME.id)),
    };
  }, [events, players, game]);
  if (!game) return null;

  const myRank = standings.findIndex((r) => r.player.id === ME.id) + 1;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <View style={[shadow.avatar, styles.avatarShadow]}>
          <Avatar player={ME} size={120} sticker={false} />
        </View>
        <AppText variant="title">{team?.name ?? ME.name}</AppText>
        <AppText variant="caption" color={colors.inkFaint}>
          {ME.name} · {myRank}° in {game.name}
        </AppText>
      </View>

      <View style={styles.balance}>
        <Stat label="bonus" value={`+${bonus}`} color={colors.bonus} />
        <View style={styles.divider} />
        <Stat label="malus" value={`${malus}`} color={colors.malus} />
        <View style={styles.divider} />
        <Stat label="totale" value={`${bonus + malus}`} color={colors.ink} />
      </View>

      <AppText variant="headline">In questa lega</AppText>
      <View style={styles.list}>
        {standings
          .filter((r) => r.player.id !== ME.id)
          .map((r) => (
            <View key={r.player.id} style={styles.row}>
              <Avatar player={r.player} size={40} sticker={false} />
              <View style={styles.flex}>
                <AppText variant="name">{r.player.name}</AppText>
                <AppText variant="body" color={colors.inkMuted}>
                  {r.player.handle}
                </AppText>
              </View>
              <CoinIcon />
              <AppText variant="name" color="#D9A400">
                {r.points}
              </AppText>
            </View>
          ))}
      </View>
    </ScrollView>
  );
}

function Stat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <View style={styles.stat}>
      <AppText variant="number" color={color}>
        {value}
      </AppText>
      <AppText variant="caption" color={colors.inkSoft}>
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: {
    padding: space.md,
    paddingBottom: TAB_BAR_SPACE,
    gap: space.lg,
    width: '100%',
    maxWidth: MAX_APP_WIDTH,
    alignSelf: 'center',
  },
  avatarShadow: { borderRadius: 60 },
  hero: { alignItems: 'center', gap: space.xs, paddingTop: space.md },
  balance: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    paddingVertical: space.lg,
  },
  divider: { width: 1, backgroundColor: colors.hairline },
  stat: { flex: 1, alignItems: 'center', gap: 2 },
  list: { gap: space.md, marginTop: -space.sm },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: space.md,
  },
  flex: { flex: 1, gap: 2 },
});
