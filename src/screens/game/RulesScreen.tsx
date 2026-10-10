import { DeckExplorer } from '@/components/cards/DeckExplorer';
import { DeckPile } from '@/components/cards/DeckPile';
import { useLiveDeck } from '@/hooks/useLiveDeck';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { CardSheet } from '@/components/cards/CardSheet';
import { DeckCard, EmptySlot } from '@/components/cards/DeckCard';
import { TAB_BAR_SPACE } from '@/components/game/GameTabBar';
import { AppText } from '@/components/ui/AppText';
import { Avatar } from '@/components/ui/Avatar';
import { PressableScale } from '@/components/ui/PressableScale';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { ME } from '@/data/mock';
import { powerById, RULES, ruleById } from '@/data/rules';
import { useCurrentGame } from '@/hooks/useCurrentGame';
import { haptics } from '@/lib/haptics';
import { customSlots, nameIn, proposalsNeeded, useGameStore, votesNeeded } from '@/store/useGameStore';
import { colors, layout, MAX_APP_WIDTH, radius, space } from '@/theme/tokens';
import type { Rule } from '@/types/game';

type Tab = 'base' | 'mine';

const DATE = new Intl.DateTimeFormat('it-IT', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  hour: '2-digit',
  minute: '2-digit',
});

/**
 * Regolamento come un mazzo di Clash Royale:
 * il mazzo della partita, le proposte del pre-partita, la tua collezione
 * (20 carte base + 5 personali) e i fantapoteri in gioco.
 */
export function RulesScreen() {
  const game = useCurrentGame();
  const router = useRouter();
  const players = useGameStore((s) => s.players);
  const customRules = useGameStore((s) => s.customRules);
  const allProposals = useGameStore((s) => s.proposals);
  const extraSlots = useGameStore((s) => s.extraSlots);
  const powers = useGameStore((s) => s.powers);
  const toggleLike = useGameStore((s) => s.toggleLike);
  const [tab, setTab] = useState<Tab>('base');
  const [selected, setSelected] = useState<Rule>();
  const [explore, setExplore] = useState(false);
  const updateSettings = useGameStore((s) => s.updateSettings);
  useLiveDeck(game);

  const proposals = useMemo(() => allProposals.filter((p) => p.gameId === game?.id), [allProposals, game?.id]);
  const mine = useMemo(() => customRules.filter((r) => r.authorId === ME.id), [customRules]);
  if (!game) return null;

  const pregame = game.status === 'waiting';
  const deck = game.ruleIds.map(ruleById).filter((r): r is Rule => !!r);
  const avg = deck.length ? Math.round(deck.reduce((s, r) => s + r.points, 0) / deck.length) : 0;
  const open = proposals.filter((p) => p.status === 'open');
  const needed = proposalsNeeded(game);
  const slots = customSlots(extraSlots, game);
  const roomPlayers = players.filter((p) => game.playerIds.includes(p.id));

  const openPremium = () => router.push({ pathname: '/premium', params: { gameId: game.id } });
  const createCard = () => {
    haptics.tap();
    if (mine.length >= slots) openPremium();
    else router.push({ pathname: '/card/new', params: { gameId: game.id } });
  };

  // Cosa dice e cosa permette la carta aperta, in base alla fase
  const sheet = (() => {
    if (!selected) return {};
    const inDeck = game.ruleIds.includes(selected.id);
    const proposal = proposals.find((p) => p.ruleId === selected.id);
    if (inDeck) return { status: proposal ? 'Entrata nel mazzo con i voti della stanza' : 'Nel mazzo della partita' };
    if (!pregame)
      return { status: game.status === 'live' ? 'Il mazzo è chiuso: la partita è già iniziata.' : 'Partita conclusa.' };
    if (proposal) {
      const liked = proposal.likes.includes(ME.id);
      return {
        status: `${proposal.likes.length} su ${needed} la vogliono nel mazzo`,
        action: {
          label: liked ? 'Togli il mi piace' : 'La voglio nel mazzo',
          variant: liked ? ('secondary' as const) : ('primary' as const),
          onPress: () => {
            haptics.tap();
            toggleLike(proposal.id);
          },
        },
      };
    }
    return {
      status: 'Non è nel mazzo. Mettila in una delle tue caselle.',
      action: {
        label: 'Apri il mazzo',
        onPress: () => router.push({ pathname: '/deck/[gameId]', params: { gameId: game.id } }),
      },
    };
  })();

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.phase}>
        <AppText variant="body" color={colors.inkSoft}>
          {pregame
            ? `Pre-partita: fino a ${DATE.format(new Date(game.startsAt ?? Date.now()))} tutti possono proporre carte. Entrano con la maggioranza.`
            : game.status === 'live'
              ? 'Il mazzo è chiuso: si gioca con queste carte fino alla fine.'
              : 'Partita conclusa. Ecco il mazzo con cui avete giocato.'}
        </AppText>
      </View>

      <View style={styles.section}>
        <SectionHeader
          title="Mazzo della partita"
          caption={`${deck.length} carte, valore medio ${avg > 0 ? '+' : ''}${avg}${game.premium ? ', stanza Premium' : ''}`}
        />
        <DeckPile deck={deck} onOpen={() => setExplore(true)} />
        <View style={styles.grid}>
          {deck.map((r) => (
            <DeckCard key={r.id} rule={r} onPress={() => setSelected(r)} />
          ))}
        </View>
      </View>

      {game.playerIds[0] === ME.id && game.status !== 'ended' && (
        <View style={styles.section}>
          <SectionHeader
            title="Conferme per un punto"
            caption="Lo decidi tu da host: quanti sì servono perché una chiamata valga."
          />
          <View style={styles.voteChips}>
            {[2, 3, 4, 5].map((v) => {
              const on = votesNeeded(game) === v;
              return (
                <PressableScale
                  key={v}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: on }}
                  onPress={() => {
                    haptics.tap();
                    updateSettings(game.id, { votesToConfirm: v });
                  }}
                  style={[styles.voteChip, on && styles.voteChipOn]}>
                  <AppText variant="headline" color={on ? colors.inkInverse : colors.ink}>
                    {v}
                  </AppText>
                </PressableScale>
              );
            })}
          </View>
        </View>
      )}

      {pregame && (
        <View style={styles.section}>
          <SectionHeader
            title="Proposte"
            caption={
              open.length
                ? `Servono ${needed} mi piace su ${game.playerIds.length} per entrare nel mazzo.`
                : 'Nessuna proposta aperta. Proponi una carta dalla tua collezione.'
            }
          />
          {open.length > 0 && (
            <View style={styles.grid}>
              {open.map((p) => {
                const r = ruleById(p.ruleId);
                return r ? (
                  <DeckCard
                    key={p.id}
                    rule={r}
                    checked={p.likes.includes(ME.id)}
                    note={`${p.likes.length}/${needed} 👍`}
                    onPress={() => setSelected(r)}
                  />
                ) : null;
              })}
            </View>
          )}
        </View>
      )}

      <View style={styles.section}>
        <SectionHeader
          title="La tua collezione"
          caption={
            tab === 'base'
              ? pregame
                ? 'Le 20 carte del gioco. Tocca quelle spente per proporle.'
                : 'Le 20 carte del gioco. Quelle accese sono nel mazzo.'
              : `${mine.length} di ${slots} carte personali. Inventale tu, con le vostre regole.`
          }
        />
        <View style={styles.segment} accessibilityRole="tablist">
          {(
            [
              ['base', `Base ${RULES.length}`],
              ['mine', `Personali ${mine.length}/${slots}`],
            ] as const
          ).map(([id, label]) => (
            <Pressable
              key={id}
              accessibilityRole="tab"
              accessibilityState={{ selected: tab === id }}
              onPress={() => {
                haptics.tap();
                setTab(id);
              }}
              style={[styles.segmentItem, tab === id && styles.segmentActive]}>
              <AppText variant="caption" color={tab === id ? colors.ink : colors.inkSoft}>
                {label}
              </AppText>
            </Pressable>
          ))}
        </View>
        <View style={styles.grid}>
          {tab === 'base'
            ? RULES.map((r) => (
                <DeckCard
                  key={r.id}
                  rule={r}
                  checked={game.ruleIds.includes(r.id)}
                  dimmed={!game.ruleIds.includes(r.id)}
                  onPress={() => setSelected(r)}
                />
              ))
            : [
                ...mine.map((r) => (
                  <DeckCard
                    key={r.id}
                    rule={r}
                    checked={game.ruleIds.includes(r.id)}
                    note={proposals.some((p) => p.ruleId === r.id && p.status === 'open') ? 'proposta' : undefined}
                    onPress={() => setSelected(r)}
                  />
                )),
                ...Array.from({ length: Math.max(0, slots - mine.length) }, (_, i) => (
                  <EmptySlot key={`empty-${i}`} onPress={createCard} />
                )),
                <EmptySlot key="locked" locked onPress={openPremium} />,
              ]}
        </View>
      </View>

      <View style={styles.section}>
        <SectionHeader
          title="Fantapoteri in gioco"
          caption="Ognuno porta un potere principale e uno secondario. Si usano una volta a partita."
          action={{ label: 'Scegli i tuoi', onPress: () => router.push('/powers') }}
        />
        <View style={styles.list}>
          {roomPlayers.map((p, i) => {
            const pw = powers[p.id];
            const main = powerById(pw?.main);
            const second = powerById(pw?.secondary);
            return (
              <View key={p.id} style={[styles.row, i > 0 && styles.rowDivider]}>
                <Avatar player={p} size={36} sticker={false} />
                <AppText variant="name" style={styles.flex}>
                  {p.id === ME.id ? 'Tu' : nameIn(game, p)}
                </AppText>
                {[main, second].map((pp, k) =>
                  pp ? (
                    <View key={k} style={[styles.power, k === 0 && styles.powerMain]}>
                      <AppText variant="micro">
                        {pp.emoji} {pp.label}
                      </AppText>
                    </View>
                  ) : null,
                )}
              </View>
            );
          })}
        </View>
        {!game.premium && (
          <PressableScale accessibilityRole="button" onPress={openPremium} style={styles.premium}>
            <AppText style={styles.premiumEmoji}>👑</AppText>
            <View style={styles.flex}>
              <AppText variant="name" color={colors.inkInverse}>
                Rendi la stanza Premium
              </AppText>
              <AppText variant="caption" color="rgba(255,255,255,0.7)" style={styles.regular}>
                10 carte personali a testa e i poteri speciali Ladro e Jolly.
              </AppText>
            </View>
          </PressableScale>
        )}
      </View>

      <CardSheet
        rule={selected}
        author={players.find((p) => p.id === selected?.authorId)}
        status={sheet.status}
        action={sheet.action}
        onClose={() => setSelected(undefined)}
      />
      <DeckExplorer game={game} deck={deck} open={explore} onClose={() => setExplore(false)} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  voteChips: { flexDirection: 'row', gap: space.xs },
  voteChip: {
    width: 52,
    height: 40,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  voteChipOn: { backgroundColor: colors.ink, borderColor: colors.ink },
  screen: { flex: 1, backgroundColor: colors.background },
  content: {
    paddingHorizontal: layout.gutter,
    paddingTop: layout.section,
    paddingBottom: TAB_BAR_SPACE,
    gap: layout.section + space.xs,
    width: '100%',
    maxWidth: MAX_APP_WIDTH,
    alignSelf: 'center',
  },
  phase: { gap: space.sm },
  section: { gap: space.sm },
  grid: { flexDirection: 'row', flexWrap: 'wrap', columnGap: '5%', rowGap: space.md },
  segment: { flexDirection: 'row', backgroundColor: colors.surfaceMuted, borderRadius: radius.pill, padding: 4 },
  segmentItem: { flex: 1, alignItems: 'center', paddingVertical: space.xs, borderRadius: radius.pill },
  segmentActive: { backgroundColor: colors.surface },
  list: { backgroundColor: colors.surface, borderRadius: radius.lg, overflow: 'hidden' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xs,
    paddingHorizontal: layout.card,
    paddingVertical: space.sm,
  },
  rowDivider: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.hairline },
  flex: { flex: 1, gap: 2 },
  power: {
    backgroundColor: colors.background,
    borderRadius: radius.pill,
    paddingHorizontal: space.xs,
    paddingVertical: 4,
  },
  powerMain: { backgroundColor: colors.ctaSoft },
  premium: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    backgroundColor: colors.ink,
    borderRadius: radius.lg,
    padding: layout.card,
  },
  premiumEmoji: { fontSize: 28, lineHeight: 34 },
  regular: { fontWeight: '400' },
});
