import { ScrollView, StyleSheet, View } from 'react-native';

import { EmptyNote } from '@/components/ui/EmptyNote';
import { Shine } from '@/components/ui/Shine';
import { AppText } from '@/components/ui/AppText';
import { Avatar } from '@/components/ui/Avatar';
import { POWER_UPS } from '@/data/rules';
import { formatHoursLeft } from '@/lib/time';
import { activeActivations, nameIn, useGameStore } from '@/store/useGameStore';
import { colors, radius, space } from '@/theme/tokens';
import type { Game } from '@/types/game';

const CARD_W = 150;

/** I fantapoteri attivi adesso nella stanza, di chiunque: chi, quale e quanto manca. */
export function ActivePowers({ game, now }: { game: Game; now: number }) {
  const activations = useGameStore((s) => s.activations);
  const players = useGameStore((s) => s.players);
  const live = activeActivations(activations, game.id, now);

  if (!live.length)
    return (
      <EmptyNote
        emoji="🪄"
        title="Nessun fantapotere in gioco"
        body="Quando qualcuno ne attiva uno, lo vedi qui con il tempo che resta."
      />
    );
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.scroll}
      contentContainerStyle={styles.row}>
      {live.map((a, i) => {
        const power = POWER_UPS.find((p) => p.id === a.powerId);
        const player = players.find((p) => p.id === a.playerId);
        if (!power || !player) return null;
        return (
          <View
            key={`${a.playerId}-${a.powerId}`}
            style={styles.chip}
            accessibilityLabel={`${power.label} di ${nameIn(game, player)}, finisce tra ${formatHoursLeft(new Date(a.until).getTime() - now)}`}>
            <Shine width={CARD_W} delay={i * 700} />
            <AppText style={styles.emoji}>{power.emoji}</AppText>
            <AppText variant="serifCard" numberOfLines={1}>
              {power.label}
            </AppText>
            <View style={styles.by}>
              <Avatar player={player} size={16} sticker={false} />
              <AppText variant="micro" color={colors.inkSoft} numberOfLines={1} style={styles.flex}>
                {nameIn(game, player)}
              </AppText>
            </View>
            <AppText variant="micro" color={colors.inkSoft}>
              ancora {formatHoursLeft(new Date(a.until).getTime() - now)}
            </AppText>
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  regular: { fontWeight: '400' },
  scroll: { marginHorizontal: -space.md, flexGrow: 0 },
  row: { gap: space.xs, paddingHorizontal: space.md },
  chip: {
    width: CARD_W,
    minHeight: 150,
    gap: 4,
    padding: space.sm,
    overflow: 'hidden',
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
  },
  emoji: { fontSize: 40, lineHeight: 48, marginBottom: space.xxs },
  flex: { flex: 1 },
  by: { flexDirection: 'row', alignItems: 'center', gap: 4 },
});
