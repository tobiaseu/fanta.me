import { ScrollView, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Avatar } from '@/components/ui/Avatar';
import { POWER_UPS } from '@/data/rules';
import { formatHoursLeft } from '@/lib/time';
import { activeActivations, nameIn, useGameStore } from '@/store/useGameStore';
import { colors, radius, space } from '@/theme/tokens';
import type { Game } from '@/types/game';

/** I fantapoteri attivi adesso nella stanza, di chiunque: chi, quale e quanto manca. */
export function ActivePowers({ game, now }: { game: Game; now: number }) {
  const activations = useGameStore((s) => s.activations);
  const players = useGameStore((s) => s.players);
  const live = activeActivations(activations, game.id, now);

  if (!live.length)
    return (
      <AppText variant="caption" color={colors.inkSoft} style={styles.regular}>
        Nessun fantapotere attivo adesso.
      </AppText>
    );
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.scroll}
      contentContainerStyle={styles.row}>
      {live.map((a) => {
        const power = POWER_UPS.find((p) => p.id === a.powerId);
        const player = players.find((p) => p.id === a.playerId);
        if (!power || !player) return null;
        return (
          <View
            key={`${a.playerId}-${a.powerId}`}
            style={styles.chip}
            accessibilityLabel={`${power.label} di ${nameIn(game, player)}, finisce tra ${formatHoursLeft(new Date(a.until).getTime() - now)}`}>
            <AppText style={styles.emoji}>{power.emoji}</AppText>
            <View>
              <AppText variant="name">{power.label}</AppText>
              <View style={styles.by}>
                <Avatar player={player} size={16} sticker={false} />
                <AppText variant="micro" color={colors.inkSoft}>
                  {nameIn(game, player)}, ancora {formatHoursLeft(new Date(a.until).getTime() - now)}
                </AppText>
              </View>
            </View>
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xs,
    paddingVertical: space.xs,
    paddingHorizontal: space.sm,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
  },
  emoji: { fontSize: 24, lineHeight: 30 },
  by: { flexDirection: 'row', alignItems: 'center', gap: 4 },
});
