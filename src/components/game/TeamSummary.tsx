import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { SlideInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { RuleSticker } from '@/components/illustrations/RuleSticker';
import { Icon } from '@/components/icons/Icon';
import { AppText } from '@/components/ui/AppText';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { PressableScale } from '@/components/ui/PressableScale';
import { ruleById } from '@/data/rules';
import { useOpenPlayer } from '@/hooks/useOpenPlayer';
import { haptics } from '@/lib/haptics';
import { teamColor } from '@/lib/teams';
import { nameIn, useGameStore } from '@/store/useGameStore';
import { useUiStore } from '@/store/useUiStore';
import { colors, layout, MAX_APP_WIDTH, radius, space } from '@/theme/tokens';
import type { FeedEvent, Game, Rule, Team } from '@/types/game';

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
 * Riassunto di una squadra: totale, poi ogni giocatore con i suoi punti
 * e le carte prese in fila orizzontale. Stesso blocco in Mazzo e nel pop-up.
 */
export function TeamSummary({
  game,
  team,
  place,
  onOpen,
}: {
  game: Game;
  team: Team;
  place?: number;
  onOpen?: () => void;
}) {
  const { members, total } = useTeamBreakdown(game, team);
  const openPlayer = useOpenPlayer();
  return (
    <View style={styles.card}>
      <View style={styles.head}>
        <View style={[styles.dot, { backgroundColor: teamColor(game, team.id) }]} />
        <View style={styles.flex}>
          <AppText variant="headline">{team.name}</AppText>
          {place ? (
            <AppText variant="caption" color={colors.inkSoft} style={styles.regular}>
              {place}° in classifica
            </AppText>
          ) : null}
        </View>
        <AppText variant="number">{total}</AppText>
        <AppText variant="caption" color={colors.inkSoft}>
          pt
        </AppText>
      </View>

      {members.map((m) => (
        <View key={m.player.id} style={styles.member}>
          <PressableScale
            accessibilityRole="button"
            accessibilityLabel={`Profilo di ${m.player.name}, ${m.points} punti`}
            onPress={() => openPlayer(m.player.id)}
            style={styles.memberHead}>
            <Avatar player={m.player} size={32} sticker={false} />
            <AppText variant="name" style={styles.flex}>
              {nameIn(game, m.player)}
            </AppText>
            <AppText variant="name" color={m.points >= 0 ? colors.bonus : colors.malus}>
              {m.points > 0 ? `+${m.points}` : m.points}
            </AppText>
          </PressableScale>
          {m.events.length ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.cardsScroll}
              contentContainerStyle={styles.cards}>
              {m.events.map((e) => (
                <TakenCard key={e.id} event={e} />
              ))}
            </ScrollView>
          ) : (
            <AppText variant="caption" color={colors.inkFaint} style={styles.regular}>
              Ancora nessuna carta presa
            </AppText>
          )}
        </View>
      ))}

      {onOpen && <Button label="Guarda squadra" variant="secondary" onPress={onOpen} />}
    </View>
  );
}

function TakenCard({ event }: { event: FeedEvent }) {
  const rule = ruleById(event.ruleId) as Rule | undefined;
  if (!rule) return null;
  return (
    <View style={styles.taken} accessibilityLabel={`${rule.label}, ${event.points} punti`}>
      <RuleSticker rule={rule} size={40} />
      <AppText variant="micro" numberOfLines={1} style={styles.takenLabel}>
        {rule.label}
      </AppText>
      <AppText variant="micro" color={event.points >= 0 ? colors.bonus : colors.malus}>
        {event.points > 0 ? `+${event.points}` : event.points}
      </AppText>
    </View>
  );
}

/** Pop-up "Guarda squadra": si apre da qualsiasi punto della partita con openTeam(teamId). */
export function TeamSheet({ game }: { game: Game }) {
  const teamId = useUiStore((s) => s.teamSheetId);
  const openTeam = useUiStore((s) => s.openTeam);
  const insets = useSafeAreaInsets();
  const team = game.teams?.find((t) => t.id === teamId);
  const close = () => openTeam(undefined);
  return (
    <Modal visible={!!team} transparent animationType="fade" onRequestClose={close} statusBarTranslucent>
      <Pressable style={styles.backdrop} onPress={close} accessibilityLabel="Chiudi" />
      {team && (
        <View style={styles.anchor} pointerEvents="box-none">
          <Animated.View
            entering={SlideInDown.springify().damping(20).stiffness(180)}
            style={[styles.sheet, { paddingBottom: insets.bottom + space.md }]}>
            <View style={styles.grabber} />
            <View style={styles.sheetHead}>
              <AppText variant="title">La squadra</AppText>
              <PressableScale
                accessibilityRole="button"
                accessibilityLabel="Chiudi"
                hitSlop={12}
                onPress={() => {
                  haptics.tap();
                  close();
                }}
                style={styles.close}>
                <Icon name="close" size={18} color={colors.inkSoft} strokeWidth={2} />
              </PressableScale>
            </View>
            <ScrollView contentContainerStyle={styles.sheetBody}>
              <TeamSummary game={game} team={team} />
            </ScrollView>
          </Animated.View>
        </View>
      )}
    </Modal>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  regular: { fontWeight: '400' },
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: layout.card, gap: space.md },
  head: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  dot: { width: 16, height: 16, borderRadius: 8 },
  member: {
    gap: space.xs,
    paddingTop: space.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.hairline,
  },
  memberHead: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  cardsScroll: { marginHorizontal: -layout.card, flexGrow: 0 },
  cards: { gap: space.xs, paddingHorizontal: layout.card },
  taken: {
    width: 84,
    alignItems: 'center',
    gap: 2,
    paddingVertical: space.xs,
    borderRadius: radius.md,
    backgroundColor: colors.background,
  },
  takenLabel: { textAlign: 'center', paddingHorizontal: 4 },
  backdrop: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(10, 10, 12, 0.86)' },
  anchor: { flex: 1, justifyContent: 'flex-end', alignItems: 'center' },
  sheet: {
    width: '100%',
    maxWidth: MAX_APP_WIDTH,
    maxHeight: '88%',
    backgroundColor: colors.background,
    borderTopLeftRadius: radius.bar,
    borderTopRightRadius: radius.bar,
    paddingTop: space.sm,
  },
  grabber: {
    alignSelf: 'center',
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.placeholder,
    marginBottom: space.xs,
  },
  sheetHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: layout.gutter,
    paddingBottom: space.sm,
  },
  close: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetBody: { paddingHorizontal: layout.gutter, paddingBottom: space.lg },
});
