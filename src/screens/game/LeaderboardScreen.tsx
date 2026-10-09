import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

import { TAB_BAR_SPACE } from '@/components/game/GameTabBar';
import { AppText } from '@/components/ui/AppText';
import { Avatar, AvatarStack } from '@/components/ui/Avatar';
import { CoinIcon, TrendArrow } from '@/components/ui/Brand';
import { PressableScale } from '@/components/ui/PressableScale';
import { ME } from '@/data/mock';
import { useCurrentGame } from '@/hooks/useCurrentGame';
import { useOpenPlayer } from '@/hooks/useOpenPlayer';
import { haptics } from '@/lib/haptics';
import { computeStandings, computeTeamStandings, gameDay, useGameStore } from '@/store/useGameStore';
import { teamColor } from '@/lib/teams';
import { colors, layout, MAX_APP_WIDTH, radius, space } from '@/theme/tokens';
import type { Player } from '@/types/game';

type View_ = 'teams' | 'players';
type Period = 'all' | 'today';

interface Row {
  id: string;
  name: string;
  points: number;
  /** Avatar principale: il giocatore, o lo stemma della squadra */
  lead: Player;
  isTeam: boolean;
  /** Posizione con i pari merito (due squadre a 0 sono entrambe 2ª) */
  place: number;
  members: Player[];
  /** Posizioni guadagnate (+) o perse (−) nelle ultime 2 ore */
  trend: number;
}

const TREND_WINDOW_MS = 2 * 3_600_000;

/** Classifica: podio per i primi tre, lista per gli altri. Squadre o individuale. */
export function LeaderboardScreen() {
  const game = useCurrentGame();
  const events = useGameStore((s) => s.events);
  const players = useGameStore((s) => s.players);
  const captains = useGameStore((s) => s.captains);
  const [mode, setMode] = useState<View_>(game?.teams?.length ? 'teams' : 'players');
  const [period, setPeriod] = useState<Period>('all');
  const openPlayer = useOpenPlayer();

  const rows = useMemo<Row[]>(() => {
    if (!game) return [];
    const build = (evts: typeof events): Row[] => {
      const standings = computeStandings(game, evts, players);
      if (mode === 'players') {
        return standings.map((r) => ({
          id: r.player.id,
          name: r.player.name,
          points: r.points,
          lead: r.player,
          isTeam: false,
          place: 0,
          members: [],
          trend: 0,
        }));
      }
      return computeTeamStandings(game, evts, players, captains, Date.now()).map((t) => ({
        id: t.team.id,
        name: t.team.name,
        points: t.points,
        lead: { id: t.team.id, name: t.team.name, handle: '', color: teamColor(game, t.team.id) },
        isTeam: true,
        place: 0,
        members: t.members.map((m) => m.player),
        trend: 0,
      }));
    };
    // "Oggi": solo i punti della giornata in corso, si riparte da zero ogni giorno
    const { start, end } = gameDay(game, Date.now());
    const inPeriod =
      period === 'all'
        ? events
        : events.filter((e) => {
            const t = new Date(e.createdAt).getTime();
            return t >= start && t < end;
          });
    const now = build(inPeriod);
    const before = build(inPeriod.filter((e) => Date.now() - new Date(e.createdAt).getTime() > TREND_WINDOW_MS));
    return now.map((r, i) => ({
      ...r,
      place: now.findIndex((x) => x.points === r.points) + 1,
      trend: before.findIndex((b) => b.id === r.id) - i,
    }));
  }, [game, events, players, mode, captains, period]);

  if (!game) return null;

  const podium = [rows[1], rows[0], rows[2]]; // 2° · 1° · 3°
  const rest = rows.slice(3);
  /** Giocatore → profilo; squadra → classifica individuale, per vedere chi ha portato i punti. */
  const open = (row: Row) => {
    if (!row.isTeam) return openPlayer(row.lead.id);
    haptics.tap();
    setMode('players');
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      {game.teams?.length ? (
        <View style={styles.segment} accessibilityRole="tablist">
          {(
            [
              ['teams', 'Squadre'],
              ['players', 'Individuale'],
            ] as const
          ).map(([id, label]) => (
            <Pressable
              key={id}
              accessibilityRole="tab"
              accessibilityState={{ selected: mode === id }}
              onPress={() => {
                haptics.tap();
                setMode(id);
              }}
              style={[styles.segmentItem, mode === id && styles.segmentActive]}>
              <AppText variant="headline" color={mode === id ? colors.ink : colors.inkFaint}>
                {label}
              </AppText>
            </Pressable>
          ))}
        </View>
      ) : null}

      <View style={styles.periods} accessibilityRole="tablist">
        {(
          [
            ['all', 'Tutta la partita'],
            ['today', `Oggi · ${gameDay(game, Date.now()).label} ${gameDay(game, Date.now()).index}`],
          ] as const
        ).map(([id, label]) => (
          <Pressable
            key={id}
            accessibilityRole="tab"
            accessibilityState={{ selected: period === id }}
            onPress={() => {
              haptics.tap();
              setPeriod(id);
            }}
            style={[styles.period, period === id && styles.periodActive]}>
            <AppText variant="caption" color={period === id ? colors.inkInverse : colors.inkSoft}>
              {label}
            </AppText>
          </Pressable>
        ))}
      </View>

      <View style={styles.podium}>
        {podium.map((row, i) => {
          if (!row) return <View key={i} style={styles.podiumCol} />;
          const slot = i === 1 ? 1 : i === 0 ? 2 : 3;
          const tie = rows.filter((r) => r.place === row.place).length > 1;
          return (
            <Animated.View
              key={row.id}
              entering={FadeInUp.delay(slot * 90)
                .springify()
                .damping(16)}
              style={styles.podiumCol}>
              <PressableScale
                onPress={() => open(row)}
                accessibilityRole="button"
                accessibilityLabel={row.isTeam ? `${row.name}: vedi i singoli giocatori` : `Profilo di ${row.name}`}
                style={styles.podiumHead}>
                <Avatar player={row.lead} size={slot === 1 ? 76 : 62} shape="square" sticker={false} />
                <AppText variant="headline" numberOfLines={1} style={styles.center}>
                  {row.name}
                </AppText>
                {row.members.length > 0 && <AvatarStack players={row.members} size={22} />}
                <View style={styles.coinPill}>
                  <CoinIcon />
                  <AppText variant="headline">{row.points}</AppText>
                </View>
              </PressableScale>
              <View style={[styles.pedestal, { height: slot === 1 ? 128 : slot === 2 ? 100 : 76 }]}>
                <AppText style={styles.pedestalNumber} color={colors.placeholder}>
                  {row.place}
                </AppText>
                {tie && (
                  <AppText variant="micro" color={colors.inkFaint}>
                    pari merito
                  </AppText>
                )}
              </View>
            </Animated.View>
          );
        })}
      </View>

      <View style={styles.list}>
        {rest.map((row) => {
          const isMe = row.lead.id === ME.id && mode === 'players';
          return (
            <PressableScale
              key={row.id}
              onPress={() => open(row)}
              accessibilityRole="button"
              accessibilityLabel={row.isTeam ? row.name : `Profilo di ${row.name}`}
              style={[styles.row, isMe && styles.rowMe]}>
              <AppText variant="cardTitle" color={colors.inkFaint} style={styles.rank}>
                {row.place}
              </AppText>
              <Avatar player={row.lead} size={48} shape="square" sticker={false} />
              <View style={styles.flex}>
                <AppText variant="headline" numberOfLines={1}>
                  {row.name}
                  {isMe ? ' (tu)' : ''}
                </AppText>
                {row.members.length > 0 && <AvatarStack players={row.members} size={20} />}
              </View>
              {row.trend !== 0 && <TrendArrow up={row.trend > 0} />}
              <View style={styles.coinRow}>
                <CoinIcon />
                <AppText variant="headline">{row.points}</AppText>
              </View>
            </PressableScale>
          );
        })}
      </View>
    </ScrollView>
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
  segment: { flexDirection: 'row', backgroundColor: colors.surfaceMuted, borderRadius: radius.md + 4, padding: 4 },
  segmentItem: { flex: 1, alignItems: 'center', paddingVertical: space.sm, borderRadius: radius.md },
  segmentActive: { backgroundColor: colors.surface },
  periods: { flexDirection: 'row', gap: space.xs, marginTop: -space.sm },
  period: {
    paddingHorizontal: space.sm,
    paddingVertical: 6,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.inkFaint,
  },
  periodActive: { backgroundColor: colors.ink, borderColor: colors.ink },
  podium: { flexDirection: 'row', alignItems: 'flex-end', gap: space.xs },
  podiumCol: { flex: 1, alignItems: 'center', gap: space.sm },
  podiumHead: { alignItems: 'center', gap: space.xs },
  center: { textAlign: 'center' },
  coinPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    paddingHorizontal: space.sm,
    paddingVertical: 4,
  },
  pedestal: {
    alignSelf: 'stretch',
    backgroundColor: colors.surfaceMuted,
    borderTopLeftRadius: radius.md,
    borderTopRightRadius: radius.md,
    alignItems: 'center',
    paddingTop: space.xs,
  },
  pedestalNumber: { fontSize: 36, lineHeight: 42, fontWeight: '700' },
  list: { gap: space.sm, marginTop: -space.lg },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: space.sm,
    paddingLeft: space.md,
  },
  rowMe: { borderWidth: 1, borderColor: colors.cta },
  rank: { width: 22 },
  flex: { flex: 1, gap: 4 },
  coinRow: { flexDirection: 'row', alignItems: 'center', gap: 4, minWidth: 56, justifyContent: 'flex-end' },
});
