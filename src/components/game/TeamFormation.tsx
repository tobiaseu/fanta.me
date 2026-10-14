import { StyleSheet, View } from 'react-native';

import { teamByline } from '@/lib/teams';
import { Score } from '@/components/ui/Brand';
import { TeamAvatar } from '@/components/ui/TeamAvatar';
import { MoreLink } from '@/components/ui/MoreLink';
import { AppText } from '@/components/ui/AppText';
import { Avatar } from '@/components/ui/Avatar';
import { PressableScale } from '@/components/ui/PressableScale';
import { ruleById } from '@/data/rules';
import { useOpenPlayer } from '@/hooks/useOpenPlayer';
import { teamColor } from '@/lib/teams';
import { nameIn, useGameStore } from '@/store/useGameStore';
import { useUiStore } from '@/store/useUiStore';
import { haptics } from '@/lib/haptics';
import { openDeckPage, openTeamPage } from '@/lib/links';
import { colors, radius, space } from '@/theme/tokens';
import type { Game, Rule, Team } from '@/types/game';

/**
 * Formazione di una squadra: per ogni giocatore il nickname di stanza (la @ sotto, in piccolo)
 * e quante carte ha schierato; le carte si guardano nella scheda Mazzo.
 */
export function TeamFormation({
  game,
  team,
  points,
  place,
  mine,
}: {
  game: Game;
  team: Team;
  points?: number;
  place?: number;
  /** La mia squadra: si sceglie il capitano del giorno */
  mine?: boolean;
}) {
  const players = useGameStore((s) => s.players);
  const proposals = useGameStore((s) => s.proposals);
  const captains = useGameStore((s) => s.captains);
  const setCaptain = useGameStore((s) => s.setCaptain);
  const showToast = useUiStore((s) => s.showToast);
  const openPlayer = useOpenPlayer();

  return (
    <View style={styles.wrap}>
      <View style={styles.head}>
        <TeamAvatar game={game} teamId={team.id} size={44} />
        <View style={styles.flex}>
          <AppText variant="title" numberOfLines={1}>
            {team.name}
          </AppText>
          <AppText variant="caption" color={colors.inkSoft} style={styles.regular} numberOfLines={1}>
            {teamByline(game, team, players)}
            {place ? ` · ${place}ª` : ''}
          </AppText>
        </View>
        {place ? <Score value={points ?? 0} /> : null}
      </View>
      {mine && (
        <AppText variant="caption" color={colors.inkSoft} style={styles.regular}>
          Il capitano © fa contare doppio i suoi punti di oggi. Tocca «Capitano» per sceglierlo.
        </AppText>
      )}
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
              {mine && captains[team.id] !== id && (
                <PressableScale
                  accessibilityRole="button"
                  accessibilityLabel={`Fai capitano ${nameIn(game, p)}`}
                  hitSlop={8}
                  onPress={() => {
                    haptics.press();
                    setCaptain(team.id, id);
                    showToast({ text: `${nameIn(game, p)} è il capitano di oggi` });
                  }}
                  style={styles.capBtn}>
                  <AppText variant="micro" style={styles.bold}>
                    Capitano
                  </AppText>
                </PressableScale>
              )}
              <AppText variant="caption" color={colors.inkSoft}>
                {cards.length === 1 ? '1 carta' : `${cards.length} carte`}
              </AppText>
            </PressableScale>
            {cards.length > 0 && (
              <MoreLink
                label="Guarda il mazzo"
                onPress={() =>
                  openDeckPage({
                    title: nameIn(game, p),
                    subtitle: `Carte schierate in ${team.name}`,
                    ids: cards.map((r) => r.id),
                  })
                }
              />
            )}
          </View>
        );
      })}
      <MoreLink label="Guarda la squadra" onPress={() => openTeamPage(game.id, team.id)} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: space.md, gap: space.md },
  head: { flexDirection: 'row', alignItems: 'center', gap: space.xs },
  dot: { width: 12, height: 12, borderRadius: 6 },
  flex: { flex: 1 },
  regular: { fontWeight: '400' },
  bold: { fontWeight: '600' },
  capBtn: {
    paddingHorizontal: space.sm,
    height: 28,
    justifyContent: 'center',
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.line,
  },
  member: { gap: space.xxs },
  who: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
});
