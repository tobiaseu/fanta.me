import { StyleSheet, View } from 'react-native';

import { Icon } from '@/components/icons/Icon';
import { AppText } from '@/components/ui/AppText';
import { Avatar } from '@/components/ui/Avatar';
import { PressableScale } from '@/components/ui/PressableScale';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ME } from '@/data/mock';
import { gameDay } from '@/store/useGameStore';
import { colors, layout, radius, shadow, space } from '@/theme/tokens';
import type { Game, Player } from '@/types/game';

interface Props {
  game: Game;
  standings: { player: Player; points: number }[];
  /** Chiamate che aspettano il mio voto */
  toVote: number;
  now: number;
  onPress: () => void;
}

/**
 * Card stanza alla Clubhouse: chi c'è dentro prima di tutto.
 * Stato in alto, titolo, i due in testa come avatar grandi sovrapposti accanto
 * alla lista dei nomi con i punti, e in fondo la mia posizione.
 */
export function RoomCard({ game, standings, toVote, now, onPress }: Props) {
  const day = gameDay(game, now);
  const meIndex = standings.findIndex((r) => r.player.id === ME.id);
  const gap = meIndex > 0 ? standings[0].points - standings[meIndex].points : 0;
  const started = game.status !== 'waiting';

  const context =
    game.status === 'waiting'
      ? `${game.mode === 'sprint' ? 'Sprint' : 'Maratona'}, parte tra ${Math.max(1, Math.ceil((new Date(game.startsAt ?? now).getTime() - now) / 86_400_000))}g`
      : game.status === 'ended'
        ? game.mode === 'sprint'
          ? 'Sprint di 48 ore'
          : `Maratona di ${game.week?.total ?? 4} settimane`
        : `${day.label} ${day.index} di ${day.total}`;

  const noPoints = standings.every((r) => r.points === 0);
  const mine =
    !started || meIndex < 0
      ? 'Ti aspettano'
      : noPoints
        ? 'Ancora nessun punto'
        : meIndex === 0
          ? game.status === 'ended'
            ? 'Hai vinto tu'
            : 'Sei in testa'
          : `Sei ${meIndex + 1}°, ${gap > 0 ? `${gap} punti dal primo` : 'pari con il primo'}`;

  const faces = standings.slice(0, 2);
  const names = standings.slice(0, 4);

  return (
    <PressableScale
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${game.name}. ${mine}${toVote ? `, ${toVote} da votare` : ''}`}
      style={[styles.card, game.status === 'ended' && styles.ended]}>
      <View style={styles.top}>
        <StatusBadge status={game.status} />
        <AppText variant="caption" color={colors.inkSoft} style={styles.regular} numberOfLines={1}>
          {context}
        </AppText>
        <View style={styles.flex} />
        {toVote > 0 && (
          <View style={styles.vote}>
            <AppText variant="micro">{toVote} da votare</AppText>
          </View>
        )}
      </View>

      <AppText variant="headline" numberOfLines={2}>
        {game.emoji} {game.name}
      </AppText>

      <View style={styles.people}>
        <View style={styles.faces}>
          {faces.map((r, i) => (
            <View key={r.player.id} style={[styles.face, i === 1 && styles.faceBack]}>
              <Avatar player={r.player} size={48} sticker />
            </View>
          ))}
        </View>
        <View style={styles.names}>
          {names.map((r) => (
            <View key={r.player.id} style={styles.nameRow}>
              <AppText variant="body" numberOfLines={1} style={styles.name}>
                {r.player.id === ME.id ? 'Tu' : r.player.name}
              </AppText>
              {started && (
                <AppText variant="caption" color={colors.inkSoft}>
                  {r.points}
                </AppText>
              )}
            </View>
          ))}
        </View>
      </View>

      <View style={styles.footer}>
        <Icon name="people" size={16} color={colors.inkSoft} strokeWidth={1.8} />
        <AppText variant="caption" color={colors.inkSoft}>
          {game.playerIds.length}
        </AppText>
        <View style={styles.sep} />
        <AppText
          variant="caption"
          color={meIndex === 0 && started && !noPoints ? colors.live : colors.ink}
          numberOfLines={1}>
          {mine}
        </AppText>
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: layout.card + 2,
    gap: space.sm,
    ...shadow.card,
  },
  ended: { backgroundColor: 'rgba(255,255,255,0.6)', shadowOpacity: 0 },
  top: { flexDirection: 'row', alignItems: 'center', gap: space.xs },
  flex: { flex: 1 },
  regular: { fontWeight: '400', flexShrink: 1 },
  vote: { backgroundColor: colors.cta, borderRadius: radius.pill, paddingHorizontal: space.xs, paddingVertical: 3 },
  people: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  faces: { width: 76, height: 72 },
  face: { position: 'absolute', left: 0, top: 0, zIndex: 2 },
  faceBack: { left: 28, top: 24, zIndex: 1 },
  names: { flex: 1, maxWidth: 200, gap: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', gap: space.xs },
  name: { flexShrink: 1 },
  footer: { flexDirection: 'row', alignItems: 'center', gap: space.xxs },
  sep: { width: 3, height: 3, borderRadius: 2, backgroundColor: colors.inkFaint, marginHorizontal: space.xxs },
});
