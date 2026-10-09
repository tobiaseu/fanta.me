import { StyleSheet, View } from 'react-native';

import { Icon } from '@/components/icons/Icon';
import { AppText } from '@/components/ui/AppText';
import { PressableScale } from '@/components/ui/PressableScale';
import { formatHoursLeft } from '@/lib/time';
import { colors, radius, space, type as typeScale } from '@/theme/tokens';
import type { Game } from '@/types/game';

interface Props {
  game: Game;
  playerCount: number;
  /** Posizione dell'utente (0 = non ancora in classifica) */
  myRank: number;
  now: number;
  onPress: () => void;
}

const TINT = { live: colors.liveSoft, waiting: colors.ctaSoft, ended: colors.ended } as const;

/**
 * Card lega del Figma: fondo tinto per stato (verde in partita, giallo in attesa,
 * grigio conclusa), posizione gigante in filigrana e banda laterale con freccia
 * quando la partita è in corso.
 */
export function LeagueCard({ game, playerCount, myRank, now, onPress }: Props) {
  const isLive = game.status === 'live';
  const isSprint = game.mode === 'sprint';
  const msLeft = new Date(game.endsAt ?? now).getTime() - now;

  const statusLine =
    game.status === 'live'
      ? { text: 'in partita', color: colors.live }
      : game.status === 'waiting'
        ? { text: `inizia tra ${Math.ceil((msLeft - 48 * 3_600_000) / 86_400_000)}g`, color: '#777777' }
        : { text: 'Conclusa', color: colors.inkFaint };

  const modeLine = isSprint
    ? isLive
      ? `Sprint · ${formatHoursLeft(msLeft)} alla fine`
      : 'Sprint · 48 ore'
    : `Maratona · settimana ${game.week?.current}/${game.week?.total}`;

  return (
    <PressableScale
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Apri ${game.name}`}
      style={[styles.card, { backgroundColor: TINT[game.status] }]}>
      {myRank > 0 && game.status !== 'waiting' && (
        <AppText style={styles.watermark} color="rgba(255, 255, 255, 0.45)" numberOfLines={1}>
          {myRank}°
        </AppText>
      )}
      {isLive && (
        <View style={styles.strip}>
          <Icon name="chevron-right" size={20} color={colors.inkInverse} strokeWidth={2} />
        </View>
      )}

      <View style={styles.top}>
        <AppText variant="cardTitle" numberOfLines={1}>
          {game.emoji} {game.name}
        </AppText>
        <AppText variant="headline" color={statusLine.color}>
          {statusLine.text}
        </AppText>
      </View>

      <View style={styles.bottom}>
        <AppText variant="caption" color={colors.inkSoft}>
          {modeLine}
        </AppText>
        <AppText variant="headline" color={colors.inkSoft}>
          {playerCount} giocatori
        </AppText>
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  card: {
    height: 186,
    borderRadius: radius.lg,
    paddingVertical: space.md + 4,
    paddingLeft: space.lg,
    paddingRight: space.xxl,
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  watermark: {
    ...typeScale.watermark,
    position: 'absolute',
    right: space.xl,
    bottom: -space.lg,
  },
  strip: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    width: 24,
    backgroundColor: colors.liveStrip,
    alignItems: 'center',
    justifyContent: 'center',
  },
  top: { gap: space.xxs },
  bottom: { gap: 2 },
});
