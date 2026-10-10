import { StyleSheet, View } from 'react-native';

import { DeckCard } from '@/components/cards/DeckCard';
import { AppText } from '@/components/ui/AppText';
import { Avatar } from '@/components/ui/Avatar';
import { PressableScale } from '@/components/ui/PressableScale';
import { ruleById } from '@/data/rules';
import { useOpenPlayer } from '@/hooks/useOpenPlayer';
import { teamColor } from '@/lib/teams';
import { nameIn, useGameStore } from '@/store/useGameStore';
import { colors, radius, space } from '@/theme/tokens';
import type { Game, Rule, Team } from '@/types/game';

/**
 * Formazione di una squadra: per ogni giocatore il nickname di stanza (la @ sotto, in piccolo)
 * e le carte che ha schierato nel mazzo, ben in vista come carte vere.
 */
export function TeamFormation({
  game,
  team,
  points,
  place,
}: {
  game: Game;
  team: Team;
  points?: number;
  place?: number;
}) {
  const players = useGameStore((s) => s.players);
  const proposals = useGameStore((s) => s.proposals);
  const captains = useGameStore((s) => s.captains);
  const openPlayer = useOpenPlayer();

  return (
    <View style={styles.wrap}>
      <View style={styles.head}>
        <View style={[styles.dot, { backgroundColor: teamColor(game, team.id) }]} />
        <AppText variant="title" style={styles.flex}>
          {team.name}
        </AppText>
        {place ? (
          <AppText variant="headline" color={colors.inkSoft}>
            {place}ª · {points ?? 0} pt
          </AppText>
        ) : null}
      </View>
      {team.memberIds.map((id) => {
        const p = players.find((x) => x.id === id);
        if (!p) return null;
        const cards = proposals
          .filter((q) => q.gameId === game.id && q.authorId === id)
          .map((q) => ruleById(q.ruleId))
          .filter((r): r is Rule => !!r);
        return (
          <View key={id} style={styles.member}>
            <PressableScale
              accessibilityRole="button"
              accessibilityLabel={`${nameIn(game, p)}, @${p.handle}`}
              onPress={() => openPlayer(id)}
              style={styles.who}>
              <Avatar player={p} size={40} sticker={false} />
              <View style={styles.flex}>
                <AppText variant="headline">
                  {nameIn(game, p)}
                  {captains[team.id] === id ? '  ©' : ''}
                </AppText>
                <AppText variant="micro" color={colors.inkFaint}>
                  @{p.handle}
                </AppText>
              </View>
              <AppText variant="caption" color={colors.inkSoft}>
                {cards.length} carte
              </AppText>
            </PressableScale>
            {cards.length > 0 && (
              <View style={styles.grid}>
                {cards.map((r) => (
                  <DeckCard key={r.id} rule={r} />
                ))}
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: space.md, gap: space.md },
  head: { flexDirection: 'row', alignItems: 'center', gap: space.xs },
  dot: { width: 12, height: 12, borderRadius: 6 },
  flex: { flex: 1 },
  member: { gap: space.sm },
  who: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  grid: { flexDirection: 'row', flexWrap: 'wrap', columnGap: '5%', rowGap: space.sm },
});
