import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { CardSheet } from '@/components/cards/CardSheet';
import { DeckCard } from '@/components/cards/DeckCard';
import { Icon } from '@/components/icons/Icon';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { EmptyNote } from '@/components/ui/EmptyNote';
import { PressableScale } from '@/components/ui/PressableScale';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Segmented } from '@/components/ui/Segmented';
import { TopBar } from '@/components/ui/TopBar';
import { COMMUNITY_CARDS, COMMUNITY_DECKS, OCCASIONS, type CommunityDeck } from '@/data/community';
import { ME } from '@/data/mock';
import { ruleById } from '@/data/rules';
import { haptics } from '@/lib/haptics';
import { useGameStore } from '@/store/useGameStore';
import { useUiStore } from '@/store/useUiStore';
import { colors, layout, MAX_APP_WIDTH, radius, space } from '@/theme/tokens';
import type { Rule } from '@/types/game';

const fmt = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(1).replace('.0', '')}k` : String(n));

/**
 * ESPLORA: la parte social. Mazzi pronti e carte pubblicate dagli altri,
 * da salvare nella collezione o da usare per aprire subito una stanza. Qui pubblichi anche le tue carte.
 */
export function ExploreScreen() {
  const router = useRouter();
  const [tab, setTab] = useState<'decks' | 'cards'>('decks');
  const [occasion, setOccasion] = useState<(typeof OCCASIONS)[number]>('Tutte');
  const [selected, setSelected] = useState<Rule>();
  const liked = useGameStore((s) => s.likedCommunity);
  const toggleLike = useGameStore((s) => s.toggleCommunityLike);
  const customRules = useGameStore((s) => s.customRules);
  const published = useGameStore((s) => s.publishedRuleIds);
  const togglePublish = useGameStore((s) => s.togglePublish);
  const createGame = useGameStore((s) => s.createGame);
  const showToast = useUiStore((s) => s.showToast);
  const mine = customRules.filter((r) => r.authorId === ME.id);

  const decks = COMMUNITY_DECKS.filter((d) => occasion === 'Tutte' || d.occasion === occasion);
  const cards = COMMUNITY_CARDS.filter((c) => occasion === 'Tutte' || c.tags.includes(occasion));
  const community = selected && COMMUNITY_CARDS.find((c) => c.rule.id === selected.id);
  const isMine = selected && mine.some((r) => r.id === selected.id);

  const play = (d: CommunityDeck) => {
    haptics.press();
    const game = createGame({ name: d.name, mode: 'sprint', startsInHours: 24, emoji: d.emoji, ruleIds: d.ruleIds });
    showToast({ text: `Stanza creata con il mazzo ${d.name}` });
    router.replace({ pathname: '/onboarding/invite', params: { gameId: game.id } });
  };

  return (
    <View style={styles.screen}>
      <TopBar
        title="Esplora"
        left={
          <PressableScale
            accessibilityRole="button"
            accessibilityLabel="Indietro"
            hitSlop={12}
            onPress={() => router.back()}>
            <Icon name="chevron-left" size={22} strokeWidth={2.2} />
          </PressableScale>
        }
      />
      <ScrollView contentContainerStyle={styles.content}>
        <Segmented
          value={tab}
          options={[
            { id: 'decks', label: 'Mazzi pronti' },
            { id: 'cards', label: 'Carte' },
          ]}
          onChange={setTab}
        />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.chipsScroll}
          contentContainerStyle={styles.chips}>
          {OCCASIONS.map((o) => (
            <PressableScale
              key={o}
              accessibilityRole="radio"
              accessibilityState={{ selected: occasion === o }}
              onPress={() => {
                haptics.tap();
                setOccasion(o);
              }}
              style={[styles.chip, occasion === o && styles.chipOn]}>
              <AppText variant="caption" color={occasion === o ? colors.inkInverse : colors.ink}>
                {o}
              </AppText>
            </PressableScale>
          ))}
        </ScrollView>

        {tab === 'decks' ? (
          <View style={styles.section}>
            <SectionHeader title="Mazzi pronti" caption="Creati dalla community. Uno tocco e hai la stanza pronta." />
            {decks.length ? (
              decks.map((d) => {
                const rules = d.ruleIds.map(ruleById).filter((r): r is Rule => !!r);
                const on = liked.includes(d.id);
                return (
                  <View key={d.id} style={styles.deck}>
                    <View style={styles.deckHead}>
                      <AppText style={styles.deckEmoji}>{d.emoji}</AppText>
                      <View style={styles.flex}>
                        <AppText variant="name">
                          {d.name}
                          {d.official ? '  ✓' : ''}
                        </AppText>
                        <AppText variant="caption" color={colors.inkSoft}>
                          {d.occasion} · di @{d.author.handle} · {fmt(d.plays)} partite
                        </AppText>
                      </View>
                      <Like on={on} count={d.likes + (on ? 1 : 0)} onPress={() => toggleLike(d.id)} />
                    </View>
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={styles.deckCards}>
                      {rules.map((r) => (
                        <DeckCard key={r.id} rule={r} style={styles.mini} onPress={() => setSelected(r)} />
                      ))}
                    </ScrollView>
                    <Button label="Gioca con questo mazzo" variant="secondary" onPress={() => play(d)} />
                  </View>
                );
              })
            ) : (
              <EmptyNote
                emoji="🔎"
                title="Nessun mazzo per questa occasione"
                body="Prova un'altra occasione, oppure crea il tuo."
              />
            )}
          </View>
        ) : (
          <>
            <View style={styles.section}>
              <SectionHeader
                title="Carte della community"
                caption="Tocca una carta per leggerla e salvarla nella tua collezione."
              />
              <View style={styles.grid}>
                {cards.map((c) => (
                  <DeckCard
                    key={c.rule.id}
                    rule={c.rule}
                    note={`@${c.author.handle} · ♥ ${fmt(c.likes + (liked.includes(c.rule.id) ? 1 : 0))}`}
                    onPress={() => setSelected(c.rule)}
                  />
                ))}
              </View>
            </View>
            <View style={styles.section}>
              <SectionHeader
                title="Le tue carte"
                caption="Pubblicale e falle giocare a tutti. Prima di uscire passano un controllo."
                action={{ label: 'Crea carta', onPress: () => router.push('/card/new') }}
              />
              {mine.length ? (
                <View style={styles.grid}>
                  {mine.map((r) => (
                    <DeckCard
                      key={r.id}
                      rule={r}
                      checked={published.includes(r.id)}
                      note={published.includes(r.id) ? 'Pubblicata' : 'Solo tua'}
                      onPress={() => setSelected(r)}
                    />
                  ))}
                </View>
              ) : (
                <EmptyNote
                  emoji="✍️"
                  title="Nessuna carta tua"
                  body="Crea una carta con le regole del tuo gruppo e pubblicala qui."
                />
              )}
            </View>
          </>
        )}
      </ScrollView>

      <CardSheet
        rule={selected}
        status={
          community
            ? `di @${community.author.handle} · giocata in ${fmt(community.plays)} stanze`
            : isMine
              ? published.includes(selected!.id)
                ? 'Pubblicata nella community'
                : 'Visibile solo a te e alle tue stanze'
              : undefined
        }
        action={
          community
            ? {
                label: liked.includes(community.rule.id) ? 'Ti piace' : 'Mi piace',
                variant: liked.includes(community.rule.id) ? 'secondary' : 'primary',
                onPress: () => toggleLike(community.rule.id),
              }
            : isMine && selected
              ? {
                  label: published.includes(selected.id) ? 'Ritira dalla community' : 'Pubblica nella community',
                  variant: published.includes(selected.id) ? 'secondary' : 'primary',
                  onPress: () => {
                    const on = togglePublish(selected.id);
                    showToast({ text: on ? `${selected.label} è nella community` : 'Carta ritirata' });
                  },
                }
              : undefined
        }
        onClose={() => setSelected(undefined)}
      />
    </View>
  );
}

function Like({ on, count, onPress }: { on: boolean; count: number; onPress: () => void }) {
  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityState={{ selected: on }}
      accessibilityLabel={`${on ? 'Ti piace' : 'Mi piace'}, ${count}`}
      hitSlop={8}
      onPress={() => {
        haptics.tap();
        onPress();
      }}
      style={styles.like}>
      <AppText variant="caption">{on ? '♥' : '♡'}</AppText>
      <AppText variant="caption" color={colors.inkSoft}>
        {fmt(count)}
      </AppText>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: {
    paddingHorizontal: layout.gutter,
    paddingTop: space.md,
    paddingBottom: space.xxl * 2,
    gap: layout.section,
    width: '100%',
    maxWidth: MAX_APP_WIDTH,
    alignSelf: 'center',
  },
  chipsScroll: { marginHorizontal: -layout.gutter, marginTop: -space.md, flexGrow: 0 },
  chips: { gap: space.xs, paddingHorizontal: layout.gutter },
  chip: {
    paddingHorizontal: space.sm,
    paddingVertical: 6,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.line,
  },
  chipOn: { backgroundColor: colors.ink, borderColor: colors.ink },
  section: { gap: space.sm },
  deck: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: layout.card, gap: space.sm },
  deckHead: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  deckEmoji: { fontSize: 32, lineHeight: 40 },
  flex: { flex: 1 },
  deckCards: { gap: space.xs },
  mini: { width: 84 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', columnGap: '5%', rowGap: space.md },
  like: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: space.xs,
    paddingVertical: 4,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.line,
  },
});
