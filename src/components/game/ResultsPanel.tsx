import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Avatar } from '@/components/ui/Avatar';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { ME } from '@/data/mock';
import { computeStandings, useGameStore } from '@/store/useGameStore';
import { colors, layout, radius, shadow, space } from '@/theme/tokens';
import type { Game, Player } from '@/types/game';

/** Partita conclusa: vincitore, podio finale e trofei assegnati in automatico. */
export function ResultsPanel({ game }: { game: Game }) {
  const events = useGameStore((s) => s.events);
  const players = useGameStore((s) => s.players);

  const { standings, trophies } = useMemo(() => {
    const standings = computeStandings(game, events, players);
    const mine = events.filter((e) => e.gameId === game.id && e.status === 'confirmed');
    const sum = (filter: (p: number) => boolean) => {
      const m = new Map<string, number>();
      for (const e of mine) if (filter(e.points)) m.set(e.playerId, (m.get(e.playerId) ?? 0) + e.points);
      return [...m.entries()].sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))[0];
    };
    const calls = new Map<string, number>();
    for (const e of mine) calls.set(e.authorId, (calls.get(e.authorId) ?? 0) + 1);
    const caller = [...calls.entries()].sort((a, b) => b[1] - a[1])[0];
    const find = (id?: string) => players.find((p) => p.id === id);
    const list: { emoji: string; title: string; player?: Player; detail: string }[] = [
      { emoji: '🏆', title: 'Campione', player: standings[0]?.player, detail: `${standings[0]?.points ?? 0} punti` },
    ];
    const best = sum((p) => p > 0);
    if (best) list.push({ emoji: '😇', title: 'Re dei bonus', player: find(best[0]), detail: `+${best[1]} in bonus` });
    const worst = sum((p) => p < 0);
    if (worst)
      list.push({ emoji: '😈', title: 'Re dei malus', player: find(worst[0]), detail: `${worst[1]} in malus` });
    if (caller)
      list.push({
        emoji: '📣',
        title: 'Il Cronista',
        player: find(caller[0]),
        detail: `${caller[1]} ${caller[1] === 1 ? 'chiamata confermata' : 'chiamate confermate'}`,
      });
    return { standings, trophies: list };
  }, [game, events, players]);

  const winner = standings[0];
  return (
    <>
      {winner && (
        <View style={styles.hero}>
          <AppText style={styles.confetti}>🎉</AppText>
          <Avatar player={winner.player} size={88} />
          <AppText variant="serifTitle" style={styles.center}>
            {winner.player.id === ME.id ? 'Hai vinto tu' : `Ha vinto ${winner.player.name}`}
          </AppText>
          <AppText variant="body" color={colors.inkSoft} style={styles.center}>
            {[
              `${winner.points} punti`,
              ...standings.slice(1, 3).map((r, i) => `${i + 2}° ${r.player.id === ME.id ? 'tu' : r.player.name}`),
            ].join(', ')}
          </AppText>
        </View>
      )}
      <View style={styles.section}>
        <SectionHeader title="Trofei" caption="Assegnati in automatico a fine partita." />
        <View style={styles.list}>
          {trophies.map((t, i) =>
            t.player ? (
              <View key={t.title} style={[styles.row, i > 0 && styles.divider]}>
                <AppText style={styles.emoji}>{t.emoji}</AppText>
                <View style={styles.flex}>
                  <AppText variant="name">{t.title}</AppText>
                  <AppText variant="caption" color={colors.inkSoft} style={styles.regular}>
                    {t.detail}
                  </AppText>
                </View>
                <AppText variant="name">{t.player.id === ME.id ? 'Tu' : t.player.name}</AppText>
                <Avatar player={t.player} size={32} sticker={false} />
              </View>
            ) : null,
          )}
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  hero: {
    alignItems: 'center',
    gap: space.xs,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: space.lg,
    ...shadow.card,
  },
  confetti: { fontSize: 36, lineHeight: 44 },
  center: { textAlign: 'center' },
  section: { gap: space.sm },
  list: { backgroundColor: colors.surface, borderRadius: radius.lg, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.sm, padding: layout.card },
  divider: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.hairline },
  emoji: { fontSize: 26, lineHeight: 32 },
  flex: { flex: 1, gap: 2 },
  regular: { fontWeight: '400' },
});
