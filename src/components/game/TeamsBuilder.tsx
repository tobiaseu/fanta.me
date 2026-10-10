import { ScrollView, StyleSheet, View } from 'react-native';

import { PlayerCard } from '@/components/cards/PlayerCard';
import { EmptySlot } from '@/components/cards/DeckCard';
import { AppText } from '@/components/ui/AppText';
import { EmptyNote } from '@/components/ui/EmptyNote';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { ME } from '@/data/mock';
import { useOpenPlayer } from '@/hooks/useOpenPlayer';
import { haptics } from '@/lib/haptics';
import { teamColor } from '@/lib/teams';
import { computeStandings, computeTeamStandings, nameIn, teamSize, useGameStore } from '@/store/useGameStore';
import { useUiStore } from '@/store/useUiStore';
import { colors, radius, space } from '@/theme/tokens';
import type { Game, Player } from '@/types/game';

/**
 * Giocatori e squadre, con la stessa struttura delle carte:
 * in alto le squadre (gruppi di carte giocatore da scorrere), poi la tua squadra con le caselle,
 * sotto i giocatori ancora liberi da prendere. In partita le carte mostrano i punti.
 */
export function TeamsBuilder({ game }: { game: Game }) {
  const players = useGameStore((s) => s.players);
  const events = useGameStore((s) => s.events);
  const captains = useGameStore((s) => s.captains);
  const toggleTeammate = useGameStore((s) => s.toggleTeammate);
  const showToast = useUiStore((s) => s.showToast);
  const openPlayer = useOpenPlayer();
  const pregame = game.status === 'waiting';
  const size = teamSize(game);
  const byId = (id: string) => players.find((p) => p.id === id);
  const points = new Map(computeStandings(game, events, players).map((r) => [r.player.id, r.points]));
  const teamStand = computeTeamStandings(game, events, players, captains, Date.now());
  const roomPlayers = game.playerIds.map(byId).filter((p): p is Player => !!p);

  if (!game.teams?.length)
    return (
      <View style={styles.section}>
        <SectionHeader title="Giocatori" caption="Questa stanza si gioca tutti contro tutti, senza squadre." />
        <View style={styles.grid}>
          {roomPlayers.map((p) => (
            <PlayerCard
              key={p.id}
              player={p}
              name={p.id === ME.id ? 'Tu' : nameIn(game, p)}
              points={pregame ? undefined : (points.get(p.id) ?? 0)}
              onPress={() => openPlayer(p.id)}
            />
          ))}
        </View>
      </View>
    );

  const mine = game.teams.find((t) => t.memberIds.includes(ME.id));
  const free = roomPlayers.filter((p) => !game.teams!.some((t) => t.memberIds.includes(p.id)));
  const toggle = (p: Player) => {
    if (!mine) return;
    const inMine = mine.memberIds.includes(p.id);
    if (!inMine && mine.memberIds.length >= size) {
      haptics.malus();
      return showToast({ text: `La squadra è piena: ${size} giocatori. Lasciane uno per cambiare.` });
    }
    haptics.tap();
    toggleTeammate(game.id, p.id);
  };

  return (
    <>
      <View style={styles.section}>
        <SectionHeader
          title="Squadre"
          caption={
            pregame ? `Squadre da ${size}. Scorri per vederle tutte.` : 'Tocca un giocatore per aprire il suo profilo.'
          }
        />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.scroll}
          contentContainerStyle={styles.row}>
          {game.teams.map((t) => {
            const stand = teamStand.find((x) => x.team.id === t.id);
            const place = teamStand.findIndex((x) => x.team.id === t.id) + 1;
            return (
              <View key={t.id} style={[styles.team, t.id === mine?.id && styles.teamMine]}>
                <View style={styles.teamHead}>
                  <View style={[styles.dot, { backgroundColor: teamColor(game, t.id) }]} />
                  <AppText variant="name" style={styles.flex} numberOfLines={1}>
                    {t.name}
                  </AppText>
                  <AppText variant="caption" color={colors.inkSoft}>
                    {pregame ? `${t.memberIds.length}/${size}` : `${place}ª · ${stand?.points ?? 0} pt`}
                  </AppText>
                </View>
                <View style={styles.teamCards}>
                  {t.memberIds.map((id) => {
                    const p = byId(id);
                    return p ? (
                      <PlayerCard
                        key={id}
                        player={p}
                        name={id === ME.id ? 'Tu' : nameIn(game, p)}
                        points={pregame ? undefined : (points.get(id) ?? 0)}
                        style={styles.mini}
                        onPress={() => openPlayer(id)}
                      />
                    ) : null;
                  })}
                  {pregame &&
                    Array.from({ length: Math.max(0, size - t.memberIds.length) }, (_, i) => (
                      <View key={i} style={[styles.mini, styles.ghost]} />
                    ))}
                </View>
              </View>
            );
          })}
        </ScrollView>
      </View>

      {pregame && mine && (
        <View style={styles.section}>
          <SectionHeader
            title={`La tua squadra: ${mine.name}`}
            caption={`${mine.memberIds.length} di ${size}. Tocca un compagno per lasciarlo.`}
          />
          <View style={styles.slots}>
            {mine.memberIds.map((id) => {
              const p = byId(id);
              return p ? (
                <PlayerCard
                  key={id}
                  player={p}
                  name={id === ME.id ? 'Tu' : nameIn(game, p)}
                  note={id === ME.id ? undefined : 'Lascia'}
                  onPress={() => (id === ME.id ? openPlayer(id) : toggle(p))}
                />
              ) : null;
            })}
            {Array.from({ length: Math.max(0, size - mine.memberIds.length) }, (_, i) => (
              <EmptySlot
                key={i}
                label="Scegli sotto"
                onPress={() => showToast({ text: 'Scegli un giocatore libero qui sotto' })}
              />
            ))}
          </View>
        </View>
      )}

      {pregame && (
        <View style={styles.section}>
          <SectionHeader title="Giocatori liberi" caption="Tocca una carta per prenderlo in squadra." />
          {free.length ? (
            <View style={styles.grid}>
              {free.map((p) => (
                <PlayerCard key={p.id} player={p} name={nameIn(game, p)} onPress={() => toggle(p)} />
              ))}
            </View>
          ) : (
            <EmptyNote emoji="🤝" title="Tutti hanno una squadra" body="Le squadre sono fatte. Si parte con queste." />
          )}
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  section: { gap: space.sm },
  grid: { flexDirection: 'row', flexWrap: 'wrap', columnGap: '5%', rowGap: space.md },
  slots: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: '5%',
    rowGap: space.md,
    padding: space.sm,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.line,
  },
  scroll: { marginHorizontal: -space.md, flexGrow: 0 },
  row: { gap: space.sm, paddingHorizontal: space.md },
  team: {
    width: 260,
    padding: space.sm,
    gap: space.sm,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
  },
  teamMine: { borderColor: colors.ink },
  teamHead: { flexDirection: 'row', alignItems: 'center', gap: space.xs },
  dot: { width: 10, height: 10, borderRadius: 5 },
  flex: { flex: 1 },
  teamCards: { flexDirection: 'row', gap: space.xs },
  mini: { width: 72 },
  ghost: {
    aspectRatio: 0.78,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.inkFaint,
  },
});
