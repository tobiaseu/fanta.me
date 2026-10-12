import { ScrollView, StyleSheet, View, type ViewStyle } from 'react-native';

import { EmptyNote } from '@/components/ui/EmptyNote';
import { Shine } from '@/components/ui/Shine';
import { AppText } from '@/components/ui/AppText';
import { Avatar } from '@/components/ui/Avatar';
import { PowerArt, PowerFrame, PowerKind, finishOf, powerGlow } from '@/components/powers/PowerCard';
import { PLAY_RATIO } from '@/components/cards/PlayCard';
import { POWER_UPS } from '@/data/rules';
import { formatHoursLeft } from '@/lib/time';
import { activeActivations, nameIn, useGameStore } from '@/store/useGameStore';
import { radius, space } from '@/theme/tokens';
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
            style={[styles.shell, { boxShadow: powerGlow(power) } as ViewStyle]}
            accessibilityLabel={`${power.label} di ${nameIn(game, player)}, finisce tra ${formatHoursLeft(new Date(a.until).getTime() - now)}`}>
            <View style={styles.frame}>
              <PowerFrame id={`apf-${a.playerId}-${a.powerId}`} power={power} />
              <View style={styles.chip}>
                <PowerArt id={`ap-${a.playerId}-${a.powerId}`} vertical glow={finishOf(power).glow} />
                <Shine width={CARD_W} delay={i * 700} />
                <PowerKind power={power} />
                <View style={styles.art}>
                  <AppText style={styles.emoji}>{power.emoji}</AppText>
                </View>
                <AppText variant="headline" color="#FFFFFF" numberOfLines={1} style={styles.bold}>
                  {power.label}
                </AppText>
                <View style={styles.by}>
                  <Avatar player={player} size={16} sticker={false} />
                  <AppText variant="micro" color="rgba(255,255,255,0.8)" numberOfLines={1} style={styles.flex}>
                    {nameIn(game, player)} · ancora {formatHoursLeft(new Date(a.until).getTime() - now)}
                  </AppText>
                </View>
              </View>
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { marginHorizontal: -space.md, flexGrow: 0 },
  row: { gap: space.sm, paddingHorizontal: space.md, paddingVertical: space.xs },
  shell: { width: CARD_W, height: CARD_W / PLAY_RATIO, borderRadius: radius.lg },
  frame: { flex: 1, borderRadius: radius.lg, overflow: 'hidden', padding: 5 },
  chip: { flex: 1, gap: 2, padding: space.sm, overflow: 'hidden', borderRadius: radius.lg - 5 },
  art: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emoji: { fontSize: 40, lineHeight: 48 },
  bold: { fontWeight: '700' },
  flex: { flex: 1 },
  by: { flexDirection: 'row', alignItems: 'center', gap: 4 },
});
