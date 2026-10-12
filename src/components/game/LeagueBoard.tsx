import { StyleSheet, View } from 'react-native';

import { Icon } from '@/components/icons/Icon';
import { AppText } from '@/components/ui/AppText';
import { Avatar, AvatarStack } from '@/components/ui/Avatar';
import { Score } from '@/components/ui/Brand';
import { Button } from '@/components/ui/Button';
import { PressableScale } from '@/components/ui/PressableScale';
import { TeamAvatar } from '@/components/ui/TeamAvatar';
import { ME } from '@/data/mock';
import { useOpenPlayer } from '@/hooks/useOpenPlayer';
import { haptics } from '@/lib/haptics';
import { playerTeamLine, teamByline } from '@/lib/teams';
import {
  computeStandings,
  computeTeamStandings,
  gameDay,
  nameIn,
  standingsHidden,
  useGameStore,
} from '@/store/useGameStore';
import { useUiStore } from '@/store/useUiStore';
import { colors, layout, radius, space } from '@/theme/tokens';
import type { Game, Player } from '@/types/game';

const STATUS: Record<Game['status'], { label: string; dot: string }> = {
  waiting: { label: 'In attesa', dot: colors.cta },
  live: { label: 'In gioco', dot: colors.live },
  ended: { label: 'Conclusa', dot: colors.inkFaint },
};

/** In cima alla Dashboard: il nome della lega e quante persone ci sono, come l'intestazione di un gruppo. */
export function LeagueTitle({ game, now }: { game: Game; now: number }) {
  const players = useGameStore((s) => s.players);
  const people = players.filter((p) => game.playerIds.includes(p.id));
  const day = game.status === 'live' ? gameDay(game, now) : undefined;
  return (
    <View style={styles.title}>
      <View style={styles.flex}>
        <AppText variant="serifTitle" numberOfLines={1}>
          {game.name}
        </AppText>
        <AppText variant="caption" color={colors.inkSoft} style={styles.regular}>
          {people.length} persone
          {game.teams?.length ? ` · ${game.teams.length} squadre` : ''}
          {day ? ` · ${day.label} ${day.index}` : ''}
        </AppText>
      </View>
      <AvatarStack players={people} size={30} max={3} />
    </View>
  );
}

type StandRow = { id: string; name: string; sub?: string; points: number; place: number; team: boolean };

/**
 * La classifica in una sola card: i primi tre e, se non ci sei, la tua posizione.
 * Tutta la card porta alla classifica; il bottone secondario lo dice a parole.
 */
export function StandingsCard({ game, now, onOpen }: { game: Game; now: number; onOpen: () => void }) {
  const events = useGameStore((s) => s.events);
  const players = useGameStore((s) => s.players);
  const captains = useGameStore((s) => s.captains);
  const teams = !!game.teams?.length;
  const hidden = standingsHidden(game, now);
  const waiting = game.status === 'waiting';

  const rows: StandRow[] = teams
    ? computeTeamStandings(game, events, players, captains, now).map((t) => ({
        id: t.team.id,
        name: t.team.name,
        sub: teamByline(game, t.team, players),
        points: t.points,
        place: 0,
        team: true,
      }))
    : computeStandings(game, events, players).map((r) => ({
        id: r.player.id,
        name: nameIn(game, r.player),
        points: r.points,
        place: 0,
        team: false,
      }));
  rows.forEach((r) => (r.place = rows.findIndex((x) => x.points === r.points) + 1));
  const top = rows.slice(0, 3);
  const mine = teams
    ? rows.find((r) => game.teams?.find((t) => t.id === r.id)?.ownerId === ME.id)
    : rows.find((r) => r.id === ME.id);

  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel="Apri la classifica"
      onPress={() => {
        haptics.tap();
        onOpen();
      }}
      pressedScale={0.98}
      style={styles.card}>
      <View style={styles.cardHead}>
        <Icon name="trophy" size={18} color={colors.ink} />
        <AppText variant="headline" style={styles.flex}>
          {teams ? 'Classifica squadre' : 'Classifica'}
        </AppText>
        {!waiting && !hidden && mine ? (
          <AppText variant="caption" color={colors.inkSoft}>
            {teams ? 'La tua squadra' : 'Tu'} · {mine.place}°
          </AppText>
        ) : null}
      </View>

      {hidden ? (
        <AppText variant="body" color={colors.inkSoft}>
          🤫 Finale a sorpresa: la classifica si svela con i risultati.
        </AppText>
      ) : (
        <View style={styles.rows}>
          {(waiting ? rows : top).map((r, i) => (
            <View key={r.id} style={[styles.row, i > 0 && styles.divider]}>
              {!waiting && (
                <AppText variant="headline" color={colors.inkFaint} style={styles.rank}>
                  {r.place}
                </AppText>
              )}
              {r.team ? (
                <TeamAvatar game={game} teamId={r.id} size={40} />
              ) : (
                <Avatar player={players.find((p) => p.id === r.id) as Player} size={40} sticker={false} />
              )}
              <View style={styles.flex}>
                <AppText variant="name" numberOfLines={1}>
                  {r.name}
                </AppText>
                <AppText variant="micro" color={colors.inkSoft} numberOfLines={1} style={styles.regular}>
                  {r.team ? r.sub : playerTeamLine(game, r.id)}
                </AppText>
              </View>
              {!waiting && <Score value={r.points} />}
            </View>
          ))}
        </View>
      )}
      {waiting ? (
        <AppText variant="caption" color={colors.inkSoft} style={styles.regular}>
          I punti partono al via.
        </AppText>
      ) : null}
      <Button label="Vedi la classifica" variant="secondary" onPress={onOpen} />
    </PressableScale>
  );
}

/**
 * La base della lega, come le info di un gruppo WhatsApp:
 * tre numeri (persone, partite insieme, stato), le squadre con chi le allena
 * e tutti i partecipanti uno per uno, con la loro squadra e i loro punti.
 */
export function GroupInfo({ game, onInvite }: { game: Game; onInvite: () => void }) {
  const players = useGameStore((s) => s.players);
  const games = useGameStore((s) => s.games);
  const events = useGameStore((s) => s.events);
  const openTeam = useUiStore((s) => s.openTeam);
  const openPlayer = useOpenPlayer();
  const people = players.filter((p) => game.playerIds.includes(p.id));
  // Partite giocate da questo gruppo: quelle con almeno metà delle stesse persone
  const together = games.filter(
    (g) => g.playerIds.filter((id) => game.playerIds.includes(id)).length >= Math.ceil(game.playerIds.length / 2),
  ).length;
  const totals = new Map(computeStandings(game, events, players).map((r) => [r.player.id, r.points]));
  const status = STATUS[game.status];
  const sorted = [...people].sort((a, b) => Number(b.id === ME.id) - Number(a.id === ME.id));

  return (
    <View style={styles.section}>
      <AppText variant="title">Il gruppo</AppText>
      <View style={styles.stats}>
        <Stat value={String(people.length)} label="Partecipanti" />
        <Stat value={String(together)} label={together === 1 ? 'Partita' : 'Partite insieme'} />
        <View style={styles.stat}>
          <View style={styles.statusRow}>
            <View style={[styles.statusDot, { backgroundColor: status.dot }]} />
            <AppText variant="headline">{status.label}</AppText>
          </View>
          <AppText variant="micro" color={colors.inkSoft}>
            Stato
          </AppText>
        </View>
      </View>

      {game.teams?.length ? (
        <View style={styles.list}>
          <AppText variant="caption" color={colors.inkSoft} style={styles.listHead}>
            {game.teams.length} squadre
          </AppText>
          {game.teams.map((t, i) => (
            <PressableScale
              key={t.id}
              accessibilityRole="button"
              accessibilityLabel={`Squadra ${t.name}, ${teamByline(game, t, players)}`}
              onPress={() => openTeam(t.id)}
              style={[styles.member, i > 0 && styles.divider]}>
              <TeamAvatar game={game} teamId={t.id} size={44} />
              <View style={styles.flex}>
                <AppText variant="name" numberOfLines={1}>
                  {t.name}
                </AppText>
                <AppText variant="micro" color={colors.inkSoft} numberOfLines={1} style={styles.regular}>
                  {teamByline(game, t, players)}
                </AppText>
              </View>
              <AvatarStack
                players={t.memberIds.map((id) => players.find((p) => p.id === id)).filter((p): p is Player => !!p)}
                size={24}
              />
            </PressableScale>
          ))}
        </View>
      ) : null}

      <View style={styles.list}>
        <AppText variant="caption" color={colors.inkSoft} style={styles.listHead}>
          {people.length} partecipanti
        </AppText>
        {game.status !== 'ended' && (
          <PressableScale accessibilityRole="button" onPress={onInvite} style={styles.member}>
            <View style={styles.invite}>
              <Icon name="plus" size={20} strokeWidth={2.4} color={colors.ctaInk} />
            </View>
            <AppText variant="name" style={styles.flex}>
              Invita amici
            </AppText>
          </PressableScale>
        )}
        {sorted.map((p) => {
          const me = p.id === ME.id;
          return (
            <PressableScale
              key={p.id}
              accessibilityRole="button"
              accessibilityLabel={`Profilo di ${nameIn(game, p)}`}
              onPress={() => openPlayer(p.id)}
              style={[styles.member, styles.divider]}>
              <Avatar player={p} size={44} sticker={false} />
              <View style={styles.flex}>
                <AppText variant="name" numberOfLines={1}>
                  {me ? 'Tu' : nameIn(game, p)}
                </AppText>
                <AppText variant="micro" color={colors.inkSoft} numberOfLines={1} style={styles.regular}>
                  {playerTeamLine(game, p.id) ?? `@${p.handle}`}
                </AppText>
              </View>
              {game.ownerId === p.id && (
                <View style={styles.host}>
                  <AppText variant="micro" color={colors.inkSoft}>
                    Host
                  </AppText>
                </View>
              )}
              {game.status !== 'waiting' && <Score value={totals.get(p.id) ?? 0} size="sm" />}
            </PressableScale>
          );
        })}
      </View>
    </View>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.stat}>
      <AppText variant="number">{value}</AppText>
      <AppText variant="micro" color={colors.inkSoft}>
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  title: { flexDirection: 'row', alignItems: 'center', gap: space.sm, marginBottom: -space.sm },
  flex: { flex: 1, gap: 2 },
  regular: { fontWeight: '400' },
  card: { backgroundColor: colors.surface, borderRadius: radius.xl, padding: layout.card, gap: space.sm },
  cardHead: { flexDirection: 'row', alignItems: 'center', gap: space.xs },
  rows: {},
  row: { flexDirection: 'row', alignItems: 'center', gap: space.sm, paddingVertical: space.sm },
  divider: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.hairline },
  rank: { width: 16, textAlign: 'center' },
  section: { gap: space.sm },
  stats: { flexDirection: 'row', backgroundColor: colors.surface, borderRadius: radius.lg, paddingVertical: space.md },
  stat: { flex: 1, alignItems: 'center', gap: 2 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 6, height: 26 },
  statusDot: { width: 9, height: 9, borderRadius: 5 },
  list: { backgroundColor: colors.surface, borderRadius: radius.lg, paddingHorizontal: space.md },
  listHead: { paddingTop: space.sm, paddingBottom: space.xxs },
  member: { flexDirection: 'row', alignItems: 'center', gap: space.sm, paddingVertical: space.sm },
  invite: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.cta,
    alignItems: 'center',
    justifyContent: 'center',
  },
  host: {
    paddingHorizontal: 8,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
});
