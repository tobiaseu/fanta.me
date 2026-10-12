import { useRouter } from 'expo-router';
import { Fragment } from 'react';
import { StyleSheet, View } from 'react-native';

import { Icon } from '@/components/icons/Icon';
import { RuleSticker } from '@/components/illustrations/RuleSticker';
import { AppText } from '@/components/ui/AppText';
import { Avatar } from '@/components/ui/Avatar';
import { Score } from '@/components/ui/Brand';
import { PressableScale } from '@/components/ui/PressableScale';
import { ruleById } from '@/data/rules';
import { playerTeamLine } from '@/lib/teams';
import { nameIn, useGameStore, votesNeeded } from '@/store/useGameStore';
import { colors, radius, space } from '@/theme/tokens';
import type { FeedEvent, Game } from '@/types/game';

/** "Sab 12 apr · 14:32": giorno e ora di ogni punto, come in un diario. */
export const pointTime = (iso: string) => {
  const d = new Date(iso);
  const day = d.toLocaleDateString('it-IT', { weekday: 'short', day: 'numeric', month: 'short' });
  const hm = d.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
  return `${day.charAt(0).toUpperCase()}${day.slice(1)} · ${hm}`;
};

/**
 * Diario dei punti: una riga per punto, con giorno e ora sopra.
 * Ogni riga è la carta in miniatura + chi l'ha preso (e la sua squadra) + i punti con la moneta.
 * Niente foto in anteprima: la foto si vede aprendo il punto.
 * Stesso disegno nel Live (tutti) e nel profilo in partita (uno solo, con il totale progressivo).
 */
export function PointLog({
  game,
  events,
  showPlayer = true,
  running,
}: {
  game: Game;
  /** Già ordinati come vanno mostrati */
  events: FeedEvent[];
  showPlayer?: boolean;
  /** Totale progressivo sotto ogni punto (profilo di un giocatore, in ordine cronologico) */
  running?: boolean;
}) {
  const router = useRouter();
  const players = useGameStore((s) => s.players);
  const need = votesNeeded(game);
  let total = 0;
  return (
    <View style={styles.timeline}>
      <View style={styles.rail} />
      {events.map((e) => {
        if (e.status === 'confirmed') total += e.points;
        const rule = ruleById(e.ruleId);
        const player = players.find((p) => p.id === e.playerId);
        const author = players.find((p) => p.id === e.authorId);
        const team = player ? playerTeamLine(game, player.id) : undefined;
        const pending = e.status === 'pending';
        const rejected = e.status === 'rejected';
        const who = player ? nameIn(game, player) : '';
        return (
          <Fragment key={e.id}>
            <View style={styles.when}>
              <View style={[styles.dot, pending && styles.dotPending]} />
              <AppText variant="micro" color={colors.inkSoft}>
                {pointTime(e.createdAt)}
              </AppText>
            </View>
            <PressableScale
              accessibilityRole="button"
              accessibilityLabel={`${showPlayer ? `${who}, ` : ''}${rule?.label ?? 'Punto'}, ${e.points} punti. Apri il punto${e.photo ? ' e la foto' : ''}`}
              onPress={() => router.push({ pathname: '/call/[eventId]', params: { eventId: e.id } })}
              pressedScale={0.98}
              style={[styles.entry, rejected && styles.rejected]}>
              <View style={styles.head}>
                {rule && <RuleSticker rule={rule} size={56} />}
                <View style={styles.flex}>
                  <AppText variant="headline" numberOfLines={1}>
                    {rule?.label ?? 'Carta'}
                    {e.double ? ' · ×2' : ''}
                  </AppText>
                  {showPlayer && player ? (
                    <View style={styles.who}>
                      <Avatar player={player} size={18} sticker={false} />
                      <AppText variant="caption" numberOfLines={1} style={styles.flexText}>
                        {who}
                        {team ? (
                          <AppText variant="caption" color={colors.inkSoft} style={styles.regular}>
                            {'  '}
                            {team}
                          </AppText>
                        ) : null}
                      </AppText>
                    </View>
                  ) : null}
                  <AppText variant="micro" color={pending ? colors.ink : colors.inkSoft} style={styles.regular}>
                    {pending
                      ? `In votazione · ${e.votes.confirm}/${need} sì`
                      : rejected
                        ? 'Respinto dal gruppo'
                        : running
                          ? `Totale ${total}`
                          : author
                            ? `Chiamato da ${nameIn(game, author)}`
                            : 'Confermato'}
                  </AppText>
                </View>
                <View style={styles.side}>
                  <Score value={e.points} signed />
                  {e.photo ? <Icon name="camera" size={14} color={colors.inkFaint} /> : null}
                </View>
              </View>
              {e.review ? (
                <AppText variant="caption" color={colors.inkSoft} style={styles.review} numberOfLines={2}>
                  “{e.review}”
                </AppText>
              ) : null}
            </PressableScale>
          </Fragment>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  timeline: { gap: space.xs, paddingLeft: space.md },
  rail: { position: 'absolute', left: 4, top: 8, bottom: 8, width: 2, backgroundColor: colors.surfaceMuted },
  when: { flexDirection: 'row', alignItems: 'center', gap: space.xs, marginLeft: -space.md, marginTop: space.sm },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.ink,
    borderWidth: 1,
    borderColor: colors.background,
  },
  dotPending: { backgroundColor: colors.cta },
  entry: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: space.sm, gap: space.xs },
  rejected: { opacity: 0.5 },
  head: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  flex: { flex: 1, gap: 3 },
  flexText: { flex: 1 },
  who: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  regular: { fontWeight: '400' },
  side: { alignItems: 'flex-end', gap: 6 },
  review: { fontStyle: 'italic', fontWeight: '400', paddingHorizontal: space.xxs },
});
