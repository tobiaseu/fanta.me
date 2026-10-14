import { ScrollView, StyleSheet, View } from 'react-native';

import { Score } from '@/components/ui/Brand';
import { TeamAvatar } from '@/components/ui/TeamAvatar';
import { PlayerCard } from '@/components/cards/PlayerCard';
import { PlayerSheet } from '@/components/cards/PlayerSheet';
import { useState } from 'react';
import { useRouter } from 'expo-router';
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
  const router = useRouter();
  const players = useGameStore((s) => s.players);
  const events = useGameStore((s) => s.events);
  const captains = useGameStore((s) => s.captains);
  const toggleTeammate = useGameStore((s) => s.toggleTeammate);
  const showToast = useUiStore((s) => s.showToast);
  const openPlayer = useOpenPlayer();
  const pregame = game.status === 'waiting';
  const [open, setOpen] = useState<Player>();
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

  const mine = game.teams.find((t) => t.ownerId === ME.id);
  const others = roomPlayers.filter((p) => p.id !== ME.id);
  const inTeams = (id: string) => game.teams!.filter((t) => t.memberIds.includes(id)).length;
  const toggle = (p: Player) => {
    if (!mine || p.id === ME.id) return;
    const inMine = mine.memberIds.includes(p.id);
    if (!inMine && mine.memberIds.length >= size) {
      haptics.malus();
      return showToast({ text: `La squadra è piena: ${size} giocatori. Lasciane uno per cambiare.` });
    }
    haptics.tap();
    toggleTeammate(game.id, p.id);
    showToast({
      text: inMine ? `${nameIn(game, p)} lascia ${mine.name}` : `${nameIn(game, p)} entra in ${mine.name}`,
      action: { label: 'Annulla', onPress: () => toggleTeammate(game.id, p.id) },
    });
  };

  // Stessa grammatica delle carte: tocco = apri, pressione lunga = prendi/lascia
  const sheetOf = (p: Player) => {
    if (p.id === ME.id) return { state: { text: 'Sei tu: non puoi stare nella tua squadra', tone: 'locked' as const } };
    const n = inTeams(p.id);
    const elsewhere = n > 0 ? ` · scelto in ${n} ${n === 1 ? 'squadra' : 'squadre'}` : '';
    if (!pregame) return { state: { text: `${points.get(p.id) ?? 0} punti${elsewhere}` } };
    if (mine?.memberIds.includes(p.id))
      return {
        state: { text: `Nella tua squadra · ${mine.memberIds.length} di ${size}`, tone: 'ok' as const },
        secondary: { label: 'Togli dalla squadra', onPress: () => toggle(p) },
      };
    if (mine && mine.memberIds.length >= size)
      return {
        state: { text: `Squadra piena (${size} di ${size}): togline uno per fare posto`, tone: 'locked' as const },
      };
    return {
      state: { text: `Ti restano ${size - (mine?.memberIds.length ?? 0)} posti su ${size}${elsewhere}` },
      primary: { label: 'Metti in squadra', onPress: () => toggle(p) },
    };
  };
  const quick = (p: Player) => (pregame && p.id !== ME.id ? () => toggle(p) : undefined);

  return (
    <>
      <PlayerSheet
        player={open}
        name={open ? (open.id === ME.id ? 'Tu' : nameIn(game, open)) : ''}
        handle={open?.handle}
        {...(open ? sheetOf(open) : {})}
        onProfile={open ? () => openPlayer(open.id) : undefined}
        onClose={() => setOpen(undefined)}
      />

      {/* 1. Vista d'insieme, come "Mazzo della partita" */}
      <View style={styles.section}>
        <SectionHeader
          title="Squadre della partita"
          caption={`${game.teams.length} squadre. Ognuno sceglie ${size} giocatori, mai se stesso.`}
        />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.scroll}
          contentContainerStyle={styles.row}>
          {game.teams.map((t) => {
            const stand = teamStand.find((x) => x.team.id === t.id);
            const place = teamStand.findIndex((x) => x.team.id === t.id) + 1;
            const owner = byId(t.ownerId);
            return (
              <View key={t.id} style={[styles.team, t.id === mine?.id && styles.teamMine]}>
                <View style={styles.teamHead}>
                  <TeamAvatar game={game} teamId={t.id} size={32} />
                  <AppText variant="name" style={styles.flex} numberOfLines={1}>
                    {t.name}
                  </AppText>
                  {pregame ? (
                    <AppText variant="caption" color={colors.inkSoft}>
                      {t.memberIds.length < size
                        ? `${t.memberIds.length}/${size} · sta scegliendo`
                        : `${size}/${size} · pronta`}
                    </AppText>
                  ) : (
                    <Score value={stand?.points ?? 0} size="sm" />
                  )}
                </View>
                <AppText variant="caption" color={colors.inkSoft} style={styles.regular}>
                  {t.ownerId === ME.id
                    ? 'Creata e allenata da te'
                    : `Creata e allenata da ${owner ? nameIn(game, owner) : '?'}`}
                  {!pregame && place ? ` · ${place}ª` : ''}
                </AppText>
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
                        onPress={() => setOpen(p)}
                      />
                    ) : null;
                  })}
                  {Array.from({ length: Math.max(0, size - t.memberIds.length) }, (_, i) => (
                    <View key={i} style={[styles.mini, styles.ghost]} />
                  ))}
                </View>
              </View>
            );
          })}
        </ScrollView>
      </View>

      {/* 2. Le tue caselle, come "Le tue carte nel mazzo" */}
      {mine && (
        <View style={styles.section}>
          <SectionHeader
            title="La tua squadra"
            caption={`${mine.name}: ${mine.memberIds.length} di ${size}. ${pregame ? `Scegline ${size} dai giocatori qui sotto.` : 'Squadra chiusa: si gioca con questi.'}`}
          />
          <View style={styles.slots}>
            {mine.memberIds.map((id) => {
              const p = byId(id);
              return p ? (
                <PlayerCard
                  key={id}
                  player={p}
                  name={nameIn(game, p)}
                  points={pregame ? undefined : (points.get(id) ?? 0)}
                  style={styles.slot}
                  onPress={() => setOpen(p)}
                  onLongPress={quick(p)}
                />
              ) : null;
            })}
            {Array.from({ length: Math.max(0, size - mine.memberIds.length) }, (_, i) => (
              <EmptySlot
                key={i}
                label={`Posto ${mine.memberIds.length + i + 1}`}
                style={styles.slot}
                onPress={() => showToast({ text: 'Scegli un giocatore qui sotto' })}
              />
            ))}
          </View>
        </View>
      )}

      {/* 3. Da dove si sceglie, come "La tua collezione" */}
      {pregame && (
        <View style={styles.section}>
          <SectionHeader title="I giocatori" caption="Tocca per leggere, tieni premuto per metterlo in squadra." />
          {others.length ? (
            <View style={styles.grid}>
              {others.map((p) => (
                <PlayerCard
                  key={p.id}
                  player={p}
                  name={nameIn(game, p)}
                  checked={mine?.memberIds.includes(p.id)}
                  onPress={() => setOpen(p)}
                  onLongPress={quick(p)}
                />
              ))}
            </View>
          ) : (
            <EmptyNote
              emoji="🤝"
              title="Sei solo in stanza"
              body="Invita qualcuno: in squadra puoi mettere tutti tranne te."
              action={{
                label: 'Invita amici',
                onPress: () => router.push({ pathname: '/onboarding/invite', params: { gameId: game.id } }),
              }}
            />
          )}
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  section: { gap: space.sm },
  grid: { flexDirection: 'row', flexWrap: 'wrap', columnGap: '5%', rowGap: space.md },
  regular: { fontWeight: '400' },
  slot: { width: '22%' },
  slots: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: '4%',
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
