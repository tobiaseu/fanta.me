import { useMemo } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { TAB_BAR_SPACE } from '@/components/game/GameTabBar';
import { AppText } from '@/components/ui/AppText';
import { Avatar } from '@/components/ui/Avatar';
import { CoinIcon } from '@/components/ui/Brand';
import { PressableScale } from '@/components/ui/PressableScale';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { ME } from '@/data/mock';
import { useCurrentGame } from '@/hooks/useCurrentGame';
import { useOpenPlayer } from '@/hooks/useOpenPlayer';
import { computeStandings, useGameStore } from '@/store/useGameStore';
import { colors, layout, MAX_APP_WIDTH, radius, shadow, space } from '@/theme/tokens';

/** Profilo in-game (frame "Home" del Figma): avatar grande, il tuo bilancio, chi c'è in questa lega. */
export function ProfileScreen() {
  const game = useCurrentGame();
  const events = useGameStore((s) => s.events);
  const players = useGameStore((s) => s.players);
  const openPlayer = useOpenPlayer();

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
        <AppText variant="title">{ME.name}</AppText>
        <AppText variant="caption" color={colors.inkSoft}>
          {myRank}° in classifica{team ? `, squadra ${team.name}` : ''}
        </AppText>
        <PressableScale accessibilityRole="button" onPress={() => openPlayer(ME.id)} hitSlop={8} style={styles.link}>
          <AppText variant="caption" color={colors.live}>
            Carriera e amici
          </AppText>
        </PressableScale>
      </View>

      <View style={styles.balance}>
        <Stat label="bonus" value={`+${bonus}`} color={colors.bonus} />
        <View style={styles.divider} />
        <Stat label="malus" value={`${malus}`} color={colors.malus} />
        <View style={styles.divider} />
        <Stat label="totale" value={`${bonus + malus}`} color={colors.ink} />
      </View>

      <SectionHeader title="In questa stanza" />
      <View style={styles.list}>
        {standings
          .filter((r) => r.player.id !== ME.id)
          .map((r, i) => (
            <PressableScale
              key={r.player.id}
              accessibilityRole="button"
              accessibilityLabel={`Profilo di ${r.player.name}`}
              onPress={() => openPlayer(r.player.id)}
              style={[styles.row, i > 0 && styles.rowDivider]}>
              <Avatar player={r.player} size={40} sticker={false} />
              <View style={styles.flex}>
                <AppText variant="name">{r.player.name}</AppText>
                <AppText variant="body" color={colors.inkMuted}>
                  @{r.player.handle}
                </AppText>
              </View>
              <CoinIcon />
              <AppText variant="name">{r.points}</AppText>
            </PressableScale>
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
    paddingHorizontal: layout.gutter,
    paddingTop: layout.section,
    paddingBottom: TAB_BAR_SPACE,
    gap: layout.section,
    width: '100%',
    maxWidth: MAX_APP_WIDTH,
    alignSelf: 'center',
  },
  avatarShadow: { borderRadius: 60 },
  link: { paddingVertical: 4 },
  hero: { alignItems: 'center', gap: space.xs },
  balance: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    paddingVertical: space.lg,
  },
  divider: { width: 1, backgroundColor: colors.hairline },
  stat: { flex: 1, alignItems: 'center', gap: 2 },
  // lista raggruppata stile iOS: una card, righe separate da un filo
  list: { backgroundColor: colors.surface, borderRadius: radius.lg, marginTop: -space.sm, overflow: 'hidden' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    paddingHorizontal: layout.card,
    paddingVertical: space.sm,
  },
  rowDivider: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.hairline },
  flex: { flex: 1, gap: 2 },
});
