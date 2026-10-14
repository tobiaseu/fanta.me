import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Avatar } from '@/components/ui/Avatar';
import { MoreLink } from '@/components/ui/MoreLink';
import { PressableScale } from '@/components/ui/PressableScale';
import { useOpenPlayer } from '@/hooks/useOpenPlayer';
import { openDeckPage, openTeamPage } from '@/lib/links';
import { teamByline } from '@/lib/teams';
import { Score } from '@/components/ui/Brand';
import { TeamAvatar } from '@/components/ui/TeamAvatar';
import { nameIn, useGameStore } from '@/store/useGameStore';
import { useUiStore } from '@/store/useUiStore';
import { colors, layout, radius, space } from '@/theme/tokens';
import type { Game, Team } from '@/types/game';

/** Punti confermati di ogni membro della squadra, con le carte prese (più recenti prima). */
function useTeamBreakdown(game: Game, team: Team) {
  const players = useGameStore((s) => s.players);
  const events = useGameStore((s) => s.events);
  const members = team.memberIds
    .map((id) => {
      const player = players.find((p) => p.id === id);
      const mine = events
        .filter((e) => e.gameId === game.id && e.playerId === id && e.status === 'confirmed')
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      return player ? { player, points: mine.reduce((s, e) => s + e.points, 0), events: mine } : undefined;
    })
    .filter((m): m is NonNullable<typeof m> => !!m)
    .sort((a, b) => b.points - a.points);
  return { members, total: members.reduce((s, m) => s + m.points, 0) };
}

/**
 * Riassunto di una squadra (sempre uguale): stemma, nome, totale, i membri in fila
 * e una piccola call to action che apre la pagina squadra.
 */
export function TeamSummary({ game, team, place }: { game: Game; team: Team; place?: number; onOpen?: () => void }) {
  const { members, total } = useTeamBreakdown(game, team);
  const players = useGameStore((s) => s.players);
  const cards = members.reduce((s, m) => s + m.events.length, 0);
  return (
    <View style={styles.card}>
      <TeamHead game={game} team={team} total={total} byline={teamByline(game, team, players)} place={place} />
      <View style={styles.faces}>
        {members.map((m) => (
          <Avatar key={m.player.id} player={m.player} size={28} sticker={false} />
        ))}
        <AppText variant="caption" color={colors.inkSoft} style={styles.regular}>
          {members.length} {members.length === 1 ? 'persona' : 'persone'} · {cards} {cards === 1 ? 'carta' : 'carte'}
        </AppText>
      </View>
      <MoreLink label="Guarda la squadra" onPress={() => openTeamPage(game.id, team.id)} />
    </View>
  );
}

function TeamHead({
  game,
  team,
  total,
  byline,
  place,
}: {
  game: Game;
  team: Team;
  total: number;
  byline: string;
  place?: number;
}) {
  return (
    <View style={styles.head}>
      <TeamAvatar game={game} teamId={team.id} size={44} />
      <View style={styles.flex}>
        <AppText variant="headline">{team.name}</AppText>
        <AppText variant="caption" color={colors.inkSoft} style={styles.regular} numberOfLines={1}>
          {byline}
          {place ? ` · ${place}ª` : ''}
        </AppText>
      </View>
      <Score value={total} size="lg" />
    </View>
  );
}

/**
 * Pagina squadra: l'unica vista di una squadra in tutta l'app. Cambia solo con
 * quante persone e quante carte ci sono; le carte si guardano nella scheda Mazzo.
 */
export function TeamDetail({ game, team }: { game: Game; team: Team }) {
  const { members, total } = useTeamBreakdown(game, team);
  const players = useGameStore((s) => s.players);
  const openPlayer = useOpenPlayer();
  const allCards = members.flatMap((m) => m.events.map((e) => e.ruleId));
  return (
    <View style={styles.page}>
      <View style={styles.card}>
        <TeamHead game={game} team={team} total={total} byline={teamByline(game, team, players)} />
        <AppText variant="caption" color={colors.inkSoft} style={styles.regular}>
          {members.length} {members.length === 1 ? 'persona' : 'persone'} · {allCards.length}{' '}
          {allCards.length === 1 ? 'carta presa' : 'carte prese'}
        </AppText>
        {allCards.length > 0 && (
          <MoreLink
            label="Guarda il mazzo della squadra"
            onPress={() => openDeckPage({ title: team.name, subtitle: 'Carte prese dalla squadra', ids: allCards })}
          />
        )}
      </View>

      <View style={styles.card}>
        <AppText variant="name">Le persone</AppText>
        {members.map((m) => (
          <View key={m.player.id} style={styles.member}>
            <PressableScale
              accessibilityRole="button"
              accessibilityLabel={`Profilo di ${m.player.name}, ${m.points} punti`}
              onPress={() => openPlayer(m.player.id)}
              style={styles.memberHead}>
              <Avatar player={m.player} size={32} sticker={false} />
              <View style={styles.flex}>
                <AppText variant="name">{nameIn(game, m.player)}</AppText>
                <AppText variant="micro" color={colors.inkSoft}>
                  {m.events.length
                    ? `${m.events.length} ${m.events.length === 1 ? 'carta presa' : 'carte prese'}`
                    : 'Ancora nessuna carta presa'}
                </AppText>
              </View>
              <Score value={m.points} signed size="sm" />
            </PressableScale>
            {m.events.length > 0 && (
              <MoreLink
                label="Guarda il mazzo"
                onPress={() =>
                  openDeckPage({
                    title: nameIn(game, m.player),
                    subtitle: `Carte prese in ${team.name}`,
                    ids: m.events.map((e) => e.ruleId),
                  })
                }
              />
            )}
          </View>
        ))}
      </View>
    </View>
  );
}

/** "Guarda squadra" da qualsiasi punto della partita (openTeam): apre sempre la pagina squadra. */
export function TeamSheet({ game }: { game: Game }) {
  const teamId = useUiStore((s) => s.teamSheetId);
  const openTeam = useUiStore((s) => s.openTeam);
  useEffect(() => {
    if (!teamId) return;
    openTeam(undefined);
    openTeamPage(game.id, teamId);
  }, [teamId, game.id, openTeam]);
  return null;
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  regular: { fontWeight: '400' },
  page: { gap: space.md },
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: layout.card, gap: space.md },
  head: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  faces: { flexDirection: 'row', alignItems: 'center', gap: space.xxs, flexWrap: 'wrap' },
  member: {
    gap: space.xxs,
    paddingTop: space.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.hairline,
  },
  memberHead: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
});
