import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CardSheet } from '@/components/cards/CardSheet';
import { DeckCard } from '@/components/cards/DeckCard';
import { AppText } from '@/components/ui/AppText';
import { EmptyNote } from '@/components/ui/EmptyNote';
import { SubpageHeader } from '@/components/ui/SubpageHeader';
import { COMMUNITY_CARDS } from '@/data/community';
import { RULES, ruleById } from '@/data/rules';
import { deckAuthor, nameIn, useGame, useGameStore } from '@/store/useGameStore';
import { colors, layout, MAX_APP_WIDTH, space } from '@/theme/tokens';
import type { Rule } from '@/types/game';

/**
 * Scheda secondaria "Mazzo": tutte le carte di un mazzo, nell'unica visualizzazione delle carte
 * dell'app (la stessa della scelta delle carte). Si apre da ogni "Guarda il mazzo ›".
 */
export function DeckViewScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ title?: string; subtitle?: string; gameId?: string; ids?: string }>();
  const game = useGame(params.gameId);
  const customRules = useGameStore((s) => s.customRules);
  const proposals = useGameStore((s) => s.proposals);
  const players = useGameStore((s) => s.players);
  const [preview, setPreview] = useState<Rule>();

  const find = (id: string) =>
    customRules.find((r) => r.id === id) ?? ruleById(id) ?? COMMUNITY_CARDS.find((c) => c.rule.id === id)?.rule;
  const ids = params.ids ? params.ids.split(',').filter(Boolean) : game ? game.ruleIds : RULES.map((r) => r.id);
  const deck = ids.map(find).filter((r): r is Rule => !!r);
  const by = (rule: Rule) => {
    if (!game) return undefined;
    const p = players.find((x) => x.id === deckAuthor(proposals, game.id, rule.id));
    return p ? `messa da ${nameIn(game, p)}` : undefined;
  };

  return (
    <View style={styles.screen}>
      <SubpageHeader title={params.title ?? 'Il mazzo'} subtitle={params.subtitle ?? `${deck.length} carte`} />
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + space.xxl }]}>
        {deck.length ? (
          <>
            <AppText variant="caption" color={colors.inkSoft} style={styles.hint}>
              Tocca una carta per vederla da vicino.
            </AppText>
            <View style={styles.grid}>
              {deck.map((r) => (
                <DeckCard key={r.id} rule={r} note={by(r)} onPress={() => setPreview(r)} />
              ))}
            </View>
          </>
        ) : (
          <EmptyNote emoji="🃏" title="Mazzo vuoto" body="Ancora nessuna carta qui." />
        )}
      </ScrollView>
      <CardSheet
        rule={preview}
        author={players.find((p) => p.id === preview?.authorId)}
        onClose={() => setPreview(undefined)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: {
    paddingHorizontal: layout.gutter,
    paddingTop: layout.section,
    gap: space.md,
    width: '100%',
    maxWidth: MAX_APP_WIDTH,
    alignSelf: 'center',
  },
  hint: { fontWeight: '400', textAlign: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', columnGap: '5%', rowGap: space.md },
});
