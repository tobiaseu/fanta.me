import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

import { TAB_BAR_SPACE } from '@/components/game/GameTabBar';
import { PlayerCard } from '@/components/game/PlayerCard';
import { AppText } from '@/components/ui/AppText';
import { Avatar, AvatarStack } from '@/components/ui/Avatar';
import { CoinIcon, TrendArrow } from '@/components/ui/Brand';
import { PressableScale } from '@/components/ui/PressableScale';
import { ME } from '@/data/mock';
import { useCurrentGame } from '@/hooks/useCurrentGame';
import { haptics } from '@/lib/haptics';
import { computeStandings, useGameStore } from '@/store/useGameStore';
import { colors, MAX_APP_WIDTH, radius, space } from '@/theme/tokens';
import type { Player } from '@/types/game';

type View_ = 'teams' | 'players';

interface Row {
  id: string;
  name: string;
  points: number;
  /** Avatar principale (giocatore o capitano) */
  lead: Player;
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
  const [mode, setMode] = useState<View_>(game?.teams?.length ? 'teams' : 'players');
  const [selected, setSelected] = useState<Player>();

  const rows = useMemo<Row[]>(() => {
    if (!game) return [];
    const build = (evts: typeof events): Row[] => {
      const standings = computeStandings(game, evts, players);
      if (mode === 'players') {
        return standings.map((r) => ({ id: r.player.id, name: r.player.name, points: r.points, lead: r.player, members: [], trend: 0 }));
      }
      return (game.teams ?? [])
        .map((t) => {
          const members = standings.filter((r) => t.memberIds.includes(r.player.id));
          return {
            id: t.id,
            name: t.name,
            points: members.reduce((sum, m) => sum + m.points, 0),
            lead: members[0]?.player ?? players[0],
            members: members.map((m) => m.player),
            trend: 0,
          };
        })
        .sort((a, b) => b.points - a.points);
    };
    const now = build(events);
    const before = build(events.filter((e) => Date.now() - new Date(e.createdAt).getTime() > TREND_WINDOW_MS));
    return now.map((r, i) => ({ ...r, trend: before.findIndex((b) => b.id === r.id) - i }));
  }, [game, events, players, mode]);

  if (!game) return null;

  const podium = [rows[1], rows[0], rows[2]]; // 2° · 1° · 3°
  const rest = rows.slice(3);
  const open = (p: Player) => {
    haptics.tap();
    setSelected(p);
  };
  const myPoints = rows.find((r) => r.lead.id === selected?.id)?.points ?? 0;

  return (
    <>
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

        <View style={styles.podium}>
          {podium.map((row, i) => {
            if (!row) return <View key={i} style={styles.podiumCol} />;
            const place = i === 1 ? 1 : i === 0 ? 2 : 3;
            return (
              <Animated.View
                key={row.id}
                entering={FadeInUp.delay(place * 90).springify().damping(16)}
                style={styles.podiumCol}>
                <PressableScale onPress={() => open(row.lead)} style={styles.podiumHead}>
                  <Avatar player={row.lead} size={place === 1 ? 76 : 62} shape="square" sticker={false} />
                  <AppText variant="headline" numberOfLines={1} style={styles.center}>
                    {row.name}
                  </AppText>
                  {row.members.length > 0 && <AvatarStack players={row.members} size={22} />}
                  <View style={styles.coinPill}>
                    <CoinIcon />
                    <AppText variant="headline">{row.points}</AppText>
                  </View>
                </PressableScale>
                <View style={[styles.pedestal, { height: place === 1 ? 128 : place === 2 ? 100 : 76 }]}>
                  <AppText style={styles.pedestalNumber} color={colors.placeholder}>
                    {place}
                  </AppText>
                </View>
              </Animated.View>
            );
          })}
        </View>

        <View style={styles.list}>
          {rest.map((row, i) => {
            const isMe = row.lead.id === ME.id && mode === 'players';
            return (
              <PressableScale key={row.id} onPress={() => open(row.lead)} style={[styles.row, isMe && styles.rowMe]}>
                <AppText variant="cardTitle" color={colors.inkFaint} style={styles.rank}>
                  {i + 4}
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

      <PlayerCard
        player={selected}
        points={myPoints}
        games={selected?.id === ME.id ? ME.career.gamesPlayed : 1}
        role={selected?.id === ME.id ? 'admin' : 'member'}
        onClose={() => setSelected(undefined)}
      />
    </>
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
  segment: { flexDirection: 'row', backgroundColor: colors.surfaceMuted, borderRadius: radius.md + 4, padding: 4 },
  segmentItem: { flex: 1, alignItems: 'center', paddingVertical: space.sm, borderRadius: radius.md },
  segmentActive: { backgroundColor: colors.surface },
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
  rowMe: { borderWidth: 2, borderColor: colors.cta },
  rank: { width: 22 },
  flex: { flex: 1, gap: 4 },
  coinRow: { flexDirection: 'row', alignItems: 'center', gap: 4, minWidth: 56, justifyContent: 'flex-end' },
});
