import { DeckExplorer } from '@/components/cards/DeckExplorer';
import { DeckPile } from '@/components/cards/DeckPile';
import { useLiveDeck } from '@/hooks/useLiveDeck';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { CardSheet } from '@/components/cards/CardSheet';
import { DeckCard, EmptySlot } from '@/components/cards/DeckCard';
import { FinaleSettings } from '@/components/game/FinaleSettings';
import { TAB_BAR_SPACE } from '@/components/game/GameTabBar';
import { TeamsBuilder } from '@/components/game/TeamsBuilder';
import { Segmented } from '@/components/ui/Segmented';
import { useUiStore } from '@/store/useUiStore';
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
import { DEFAULT_SETTINGS, type Rule } from '@/types/game';

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
  const [division, setDivision] = useState<'cards' | 'players'>('cards');
  const proposeCard = useGameStore((s) => s.proposeCard);
  const withdrawCard = useGameStore((s) => s.withdrawCard);
  const showToast = useUiStore((s) => s.showToast);
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

  const myCards = proposals
    .filter((p) => p.authorId === ME.id)
    .map((p) => ruleById(p.ruleId))
    .filter((r): r is Rule => !!r);
  const perPlayer = (game.settings ?? DEFAULT_SETTINGS).cardsPerPlayer;
  const pick = (r: Rule) => {
    if (!pregame || game.ruleIds.includes(r.id)) return setSelected(r);
    if (myCards.length >= perPlayer) {
      haptics.malus();
      return showToast({ text: `Hai già ${perPlayer} carte nel mazzo: togline una per scambiarla` });
    }
    haptics.tap();
    proposeCard(game.id, r.id);
    showToast({
      text: `${r.emoji} ${r.label} è nel mazzo`,
      action: { label: 'Annulla', onPress: () => withdrawCard(game.id, r.id) },
    });
  };
  const drop = (r: Rule) => {
    haptics.tap();
    withdrawCard(game.id, r.id);
    showToast({
      text: `${r.label} tolta dal mazzo`,
      action: { label: 'Annulla', onPress: () => proposeCard(game.id, r.id) },
    });
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Segmented
        value={division}
        options={[
          { id: 'cards', label: 'Carte' },
          { id: 'players', label: game.teams?.length ? 'Giocatori e squadre' : 'Giocatori' },
        ]}
        onChange={setDivision}
      />

      {division === 'players' ? (
        <TeamsBuilder game={game} />
      ) : (
        <>
          <View style={styles.section}>
            <SectionHeader
              title="Mazzo della partita"
              caption={
                pregame
                  ? `${deck.length} carte finora. Si chiude ${DATE.format(new Date(game.startsAt ?? Date.now()))}.`
                  : `${deck.length} carte, valore medio ${avg > 0 ? '+' : ''}${avg}. ${game.status === 'live' ? 'Il mazzo è chiuso.' : 'Partita conclusa.'}`
              }
            />
            <DeckPile deck={deck} onOpen={() => setExplore(true)} />
            <View style={styles.grid}>
              {deck.map((r) => (
                <DeckCard key={r.id} rule={r} onPress={() => setSelected(r)} />
              ))}
            </View>
          </View>

          {pregame && (
            <View style={styles.section}>
              <SectionHeader
                title="Le tue carte nel mazzo"
                caption={`${myCards.length} di ${perPlayer}. Tocca una carta per toglierla.`}
              />
              <View style={styles.slots}>
                {myCards.map((r) => (
                  <DeckCard key={r.id} rule={r} onPress={() => drop(r)} note="Togli" />
                ))}
                {Array.from({ length: Math.max(0, perPlayer - myCards.length) }, (_, i) => (
                  <EmptySlot
                    key={`slot-${i}`}
                    label="Scegli sotto"
                    onPress={() => showToast({ text: 'Scegli una carta dalla tua collezione qui sotto' })}
                  />
                ))}
              </View>
            </View>
          )}

          {pregame && open.length > 0 && (
            <View style={styles.section}>
              <SectionHeader
                title="Proposte"
                caption={`Servono ${needed} mi piace su ${game.playerIds.length} per entrare.`}
              />
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
            </View>
          )}

          <View style={styles.section}>
            <SectionHeader
              title="La tua collezione"
              caption={
                pregame
                  ? 'Tocca una carta spenta per metterla nel mazzo.'
                  : tab === 'base'
                    ? 'Le 20 carte del gioco. Quelle accese sono nel mazzo.'
                    : `${mine.length} di ${slots} carte personali.`
              }
            />
            <Segmented
              value={tab}
              options={[
                { id: 'base', label: `Base ${RULES.length}` },
                { id: 'mine', label: `Personali ${mine.length}/${slots}` },
              ]}
              onChange={setTab}
            />
            <View style={styles.grid}>
              {tab === 'base'
                ? RULES.map((r) => (
                    <DeckCard
                      key={r.id}
                      rule={r}
                      checked={game.ruleIds.includes(r.id)}
                      dimmed={!game.ruleIds.includes(r.id)}
                      onPress={() => pick(r)}
                    />
                  ))
                : [
                    ...mine.map((r) => (
                      <DeckCard key={r.id} rule={r} checked={game.ruleIds.includes(r.id)} onPress={() => pick(r)} />
                    )),
                    ...Array.from({ length: Math.max(0, slots - mine.length) }, (_, i) => (
                      <EmptySlot key={`empty-${i}`} onPress={createCard} />
                    )),
                    <EmptySlot key="locked" locked onPress={openPremium} />,
                  ]}
            </View>
          </View>

          {game.playerIds[0] === ME.id && game.status !== 'ended' && (
            <View style={styles.section}>
              <SectionHeader title="Avanzate partita" caption="Le decidi tu da host. Valgono per tutta la stanza." />
              <FinaleSettings
                votes
                settings={{ ...DEFAULT_SETTINGS, ...game.settings, votesToConfirm: votesNeeded(game) }}
                onChange={(patch) => updateSettings(game.id, patch)}
              />
            </View>
          )}

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
        </>
      )}

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
  slots: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: '5%',
    rowGap: space.md,
    padding: space.sm,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.line,
  },
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
