import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { TAB_BAR_SPACE } from '@/components/game/GameTabBar';
import { Icon } from '@/components/icons/Icon';
import { TeamFormation } from '@/components/game/TeamFormation';
import { PlayerGameSection } from '@/components/game/PlayerGameSection';
import { AppText } from '@/components/ui/AppText';
import { Avatar } from '@/components/ui/Avatar';
import { CoinIcon } from '@/components/ui/Brand';
import { PressableScale } from '@/components/ui/PressableScale';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { ME } from '@/data/mock';
import { useCurrentGame } from '@/hooks/useCurrentGame';
import { useOpenPlayer } from '@/hooks/useOpenPlayer';
import { computeStandings, computeTeamStandings, nameIn, useGameStore } from '@/store/useGameStore';
import { colors, layout, MAX_APP_WIDTH, radius, space } from '@/theme/tokens';

/** Profilo in partita: nickname di stanza, posizione della squadra e individuale, formazione della squadra, fantapoteri e diario. */
export function ProfileScreen() {
  const game = useCurrentGame();
  const events = useGameStore((s) => s.events);
  const players = useGameStore((s) => s.players);
  const openPlayer = useOpenPlayer();

  const captains = useGameStore((s) => s.captains);
  const setNickname = useGameStore((s) => s.setNickname);
  const [nick, setNick] = useState<string>();
  const { bonus, malus, standings, team, teamRows } = useMemo(() => {
    const mine = events.filter((e) => e.gameId === game?.id && e.playerId === ME.id && e.status === 'confirmed');
    return {
      bonus: mine.filter((e) => e.points > 0).reduce((s, e) => s + e.points, 0),
      malus: mine.filter((e) => e.points < 0).reduce((s, e) => s + e.points, 0),
      standings: game ? computeStandings(game, events, players) : [],
      team: game?.teams?.find((t) => t.memberIds.includes(ME.id)),
      teamRows: game?.teams?.length ? computeTeamStandings(game, events, players, captains, Date.now()) : [],
    };
  }, [events, players, game, captains]);
  if (!game) return null;

  const myRank = standings.findIndex((r) => r.player.id === ME.id) + 1;
  // Il focus è la squadra: prima la sua posizione, poi quella individuale
  const teamPlace = team ? teamRows.findIndex((t) => t.team.id === team.id) + 1 : 0;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <Avatar player={ME} size={88} sticker={false} />
        <View style={styles.nickRow}>
          <TextInput
            accessibilityLabel="Il tuo nickname in questa stanza, tocca per cambiarlo"
            value={nick ?? nameIn(game, ME)}
            onChangeText={setNick}
            onBlur={() => nick !== undefined && setNickname(game.id, nick)}
            onSubmitEditing={() => nick !== undefined && setNickname(game.id, nick)}
            style={styles.nick}
            maxLength={20}
          />
          <Icon name="edit" size={18} color={colors.inkSoft} />
        </View>
        <AppText variant="caption" color={colors.inkFaint}>
          @{ME.handle}. Il nickname vale solo in questa stanza
        </AppText>
      </View>

      <View style={styles.rankCard} accessibilityLabel={`${myRank}° posto individuale su ${standings.length}`}>
        <AppText style={styles.rankNumber}>{myRank}°</AppText>
        <AppText variant="caption" color={colors.inkSoft} style={[styles.regular, styles.flex1]}>
          posto individuale su {standings.length}
          {team ? '. La classifica che conta è quella di squadra, qui sotto.' : ''}
        </AppText>
      </View>

      {team && (
        <TeamFormation
          game={game}
          team={team}
          place={teamPlace}
          points={teamRows.find((t) => t.team.id === team.id)?.points}
          mine
        />
      )}

      <View style={styles.balance}>
        <Stat label="bonus" value={`+${bonus}`} color={colors.bonus} />
        <View style={styles.divider} />
        <Stat label="malus" value={`${malus}`} color={colors.malus} />
        <View style={styles.divider} />
        <Stat label="totale" value={`${bonus + malus}`} color={colors.ink} />
      </View>

      <PlayerGameSection game={game} player={ME} hideCards={!!team} />

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
                <AppText variant="name">{nameIn(game, r.player)}</AppText>
                <AppText variant="body" color={colors.inkMuted}>
                  @{r.player.handle}
                </AppText>
              </View>
              <CoinIcon />
              <AppText variant="name">{r.points}</AppText>
            </PressableScale>
          ))}
      </View>
      <PressableScale accessibilityRole="button" onPress={() => openPlayer(ME.id)} hitSlop={8} style={styles.link}>
        <AppText variant="caption">Carriera, bacheca e amici</AppText>
      </PressableScale>
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
  flex1: { flex: 1 },
  nickRow: { flexDirection: 'row', alignItems: 'center', gap: space.xs },
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
  link: { paddingVertical: space.sm, alignSelf: 'center' },
  regular: { fontWeight: '400' },
  nick: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '800',
    textAlign: 'center',
    color: colors.ink,
    paddingVertical: 2,
    minWidth: 80,
  },
  rankCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: layout.card,
  },
  rankNumber: { fontSize: 44, lineHeight: 50, fontWeight: '800', letterSpacing: -1 },
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
