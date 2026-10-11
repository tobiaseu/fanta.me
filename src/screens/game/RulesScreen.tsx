import { DeckExplorer } from '@/components/cards/DeckExplorer';
import Animated, { FadeIn, FadeOut, LinearTransition, ZoomIn } from 'react-native-reanimated';
import { useLiveDeck } from '@/hooks/useLiveDeck';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { CardSheet } from '@/components/cards/CardSheet';
import { DeckCard, EmptySlot } from '@/components/cards/DeckCard';
import { PlayCard, type CardRect } from '@/components/cards/PlayCard';
import { FinaleSettings } from '@/components/game/FinaleSettings';
import { TAB_BAR_SPACE } from '@/components/game/GameTabBar';
import { PowersPanel } from '@/components/game/PowersPanel';
import { TeamFormation } from '@/components/game/TeamFormation';
import { TeamSummary } from '@/components/game/TeamSummary';
import { TeamsBuilder } from '@/components/game/TeamsBuilder';
import { Segmented } from '@/components/ui/Segmented';
import { useUiStore } from '@/store/useUiStore';
import { AppText } from '@/components/ui/AppText';
import { Avatar } from '@/components/ui/Avatar';
import { PressableScale } from '@/components/ui/PressableScale';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { ME } from '@/data/mock';
import { BASE_RULES, DECK_SIZE, EPIC_RULES, powerById, ruleById } from '@/data/rules';
import { useCurrentGame } from '@/hooks/useCurrentGame';
import { confirmAction } from '@/lib/confirm';
import { haptics } from '@/lib/haptics';
import {
  computeTeamStandings,
  customSlots,
  nameIn,
  proposalsNeeded,
  useGameStore,
  votesNeeded,
} from '@/store/useGameStore';
import { colors, layout, MAX_APP_WIDTH, radius, space } from '@/theme/tokens';
import { DEFAULT_SETTINGS, type Rule } from '@/types/game';

type Tab = 'base' | 'mine' | 'epic';

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
  const [showAll, setShowAll] = useState(false);
  const division = useUiStore((s) => s.deckView);
  const setDivision = useUiStore((s) => s.setDeckView);
  const proposeCard = useGameStore((s) => s.proposeCard);
  const withdrawCard = useGameStore((s) => s.withdrawCard);
  const showToast = useUiStore((s) => s.showToast);
  const openQuickAction = useUiStore((s) => s.openQuickAction);
  const openTeam = useUiStore((s) => s.openTeam);
  const events = useGameStore((s) => s.events);
  const captains = useGameStore((s) => s.captains);
  const [selected, setSelected] = useState<Rule>();
  const [openFrom, setOpenFrom] = useState<{ from?: CardRect }>({});
  const openCard = (r: Rule) => (from?: CardRect) => {
    setOpenFrom({ from });
    setSelected(r);
  };
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

  const myCards = proposals
    .filter((p) => p.authorId === ME.id)
    .map((p) => ruleById(p.ruleId))
    .filter((r): r is Rule => !!r);
  const perPlayer = (game.settings ?? DEFAULT_SETTINGS).cardsPerPlayer;
  const pick = (r: Rule) => {
    if (!pregame || game.ruleIds.includes(r.id)) return;
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

  // Scheda carta: una riga di stato (dove sta, perché non si può) + al massimo un giallo e un'alternativa
  const sheet = ((): Omit<React.ComponentProps<typeof CardSheet>, 'rule' | 'onClose'> => {
    if (!selected) return {};
    const inDeck = game.ruleIds.includes(selected.id);
    const proposal = proposals.find((p) => p.ruleId === selected.id);
    if (pregame && proposal?.authorId === ME.id)
      return {
        state: { text: `Nel mazzo · una delle tue ${perPlayer} carte`, tone: 'ok' },
        secondary: { label: 'Togli dal mazzo', onPress: () => drop(selected) },
      };
    if (inDeck && game.status === 'live')
      return {
        state: { text: 'Nel mazzo della partita', tone: 'ok' },
        primary: { label: 'Chiama', icon: 'plus', onPress: () => openQuickAction(selected.id) },
      };
    if (inDeck)
      return {
        state: { text: proposal ? 'Nel mazzo · portata da un amico' : 'Nel mazzo · carta base del gioco', tone: 'ok' },
      };
    if (!pregame)
      return {
        state: {
          text: game.status === 'live' ? 'Fuori dal mazzo: la partita è iniziata' : 'Partita conclusa',
          tone: 'locked',
        },
      };
    if (proposal) {
      const liked = proposal.likes.includes(ME.id);
      const like = () => {
        haptics.tap();
        toggleLike(proposal.id);
      };
      return {
        state: { text: `Proposta: ${proposal.likes.length} su ${needed} la vogliono` },
        ...(liked
          ? { secondary: { label: 'Non la voglio', onPress: like } }
          : { primary: { label: 'La voglio', onPress: like } }),
      };
    }
    const full = myCards.length >= perPlayer;
    return full
      ? { state: { text: `Le tue ${perPlayer} caselle sono piene: togline una per fare posto`, tone: 'locked' } }
      : {
          state: { text: `Ti restano ${perPlayer - myCards.length} caselle su ${perPlayer}` },
          primary: { label: 'Metti nel mazzo', icon: 'plus', onPress: () => pick(selected) },
        };
  })();

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Segmented
        value={division}
        options={[
          { id: 'cards', label: 'Carte' },
          { id: 'players', label: game.teams?.length ? 'Squadre e poteri' : 'Giocatori e poteri' },
        ]}
        onChange={setDivision}
      />

      {division === 'players' ? (
        pregame || !game.teams?.length ? (
          <View style={styles.playersTab}>
            <TeamsBuilder game={game} />
            <PowersPanel game={game} now={Date.now()} />
          </View>
        ) : (
          // Partita avviata: prima la mia squadra (come nel Profilo), poi il riassunto degli avversari
          <View style={styles.playersTab}>
            {(() => {
              const rows = computeTeamStandings(game, events, players, captains, Date.now());
              const myTeam = game.teams.find((t) => t.ownerId === ME.id);
              const place = (id: string) => rows.findIndex((r) => r.team.id === id) + 1;
              return (
                <>
                  {myTeam && (
                    <TeamFormation
                      game={game}
                      team={myTeam}
                      mine
                      place={place(myTeam.id)}
                      points={rows.find((r) => r.team.id === myTeam.id)?.points}
                    />
                  )}
                  <View style={styles.section}>
                    <SectionHeader
                      title="Le altre squadre"
                      caption="Punti di squadra, di ogni giocatore e carte prese."
                    />
                    {game.teams
                      .filter((t) => t.id !== myTeam?.id)
                      .sort((a, b) => place(a.id) - place(b.id))
                      .map((t) => (
                        <TeamSummary
                          key={t.id}
                          game={game}
                          team={t}
                          place={place(t.id)}
                          onOpen={() => openTeam(t.id)}
                        />
                      ))}
                  </View>
                  <PowersPanel game={game} now={Date.now()} />
                </>
              );
            })()}
          </View>
        )
      ) : (
        <>
          <View style={styles.section}>
            <SectionHeader
              title="Mazzo della partita"
              action={{ label: showAll ? 'Anteprima' : 'Vedi tutte', onPress: () => setShowAll((v) => !v) }}
              caption={
                pregame
                  ? `${deck.length} carte finora. Si chiude ${DATE.format(new Date(game.startsAt ?? Date.now()))}.`
                  : `${deck.length} carte, valore medio ${avg > 0 ? '+' : ''}${avg}. ${game.status === 'live' ? 'Il mazzo è chiuso.' : 'Partita conclusa.'}`
              }
            />
            {showAll ? (
              <Animated.View
                key="all"
                entering={FadeIn.duration(200)}
                layout={LinearTransition.springify()}
                style={styles.grid}>
                {deck.map((r, i) => (
                  <Animated.View
                    key={r.id}
                    entering={ZoomIn.delay(Math.min(i, 12) * 30)
                      .springify()
                      .damping(16)}
                    style={styles.cell}>
                    <PlayCard
                      rule={r}
                      style={styles.full}
                      authorName={players.find((p) => p.id === r.authorId)?.name}
                      cta={
                        game.status === 'live'
                          ? { label: 'Chiama', icon: 'plus', onPress: () => openQuickAction(r.id) }
                          : undefined
                      }
                      status={game.status === 'live' ? undefined : 'Nel mazzo'}
                      onOpen={openCard(r)}
                    />
                  </Animated.View>
                ))}
              </Animated.View>
            ) : (
              <Animated.View key="pile" entering={ZoomIn.springify().damping(18)} exiting={FadeOut.duration(120)}>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.bleed}
                  contentContainerStyle={styles.carousel}>
                  {deck.map((r) => (
                    <PlayCard
                      key={r.id}
                      rule={r}
                      style={styles.carouselCard}
                      authorName={players.find((p) => p.id === r.authorId)?.name}
                      cta={
                        game.status === 'live'
                          ? { label: 'Chiama', icon: 'plus', onPress: () => openQuickAction(r.id) }
                          : undefined
                      }
                      onOpen={openCard(r)}
                    />
                  ))}
                </ScrollView>
              </Animated.View>
            )}
          </View>

          {pregame && (
            <View style={styles.section}>
              <SectionHeader
                title="Le tue carte nel mazzo"
                caption={
                  myCards.length < perPlayer
                    ? `${myCards.length} di ${perPlayer}. Scegline ${perPlayer - myCards.length} dalla collezione qui sotto.`
                    : `${perPlayer} di ${perPlayer}: sei a posto. Tocca una carta per cambiarla.`
                }
              />
              <View style={styles.slots}>
                {myCards.map((r) => (
                  <DeckCard
                    key={r.id}
                    rule={r}
                    style={styles.slot}
                    onPress={() => openCard(r)()}
                    onLongPress={() => drop(r)}
                  />
                ))}
                {Array.from({ length: Math.max(0, perPlayer - myCards.length) }, (_, i) => (
                  <EmptySlot
                    style={styles.slot}
                    key={`slot-${i}`}
                    label={`Casella ${myCards.length + i + 1}`}
                    onPress={() => showToast({ text: 'Tocca una carta della collezione qui sotto per metterla qui' })}
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
                  const liked = p.likes.includes(ME.id);
                  return r ? (
                    <PlayCard
                      key={p.id}
                      rule={r}
                      authorName={players.find((pl) => pl.id === r.authorId)?.name}
                      cta={{
                        label: liked
                          ? `La vuoi · ${p.likes.length}/${needed}`
                          : `La voglio · ${p.likes.length}/${needed}`,
                        icon: liked ? 'check' : 'plus',
                        done: liked,
                        onPress: () => toggleLike(p.id),
                      }}
                      onOpen={openCard(r)}
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
                  ? `Il tuo mazzo personale ha ${DECK_SIZE} carte: 15 base, quelle che crei (rare) e quelle che vinci (epiche).`
                  : tab === 'base'
                    ? 'Le 15 carte base. Quelle accese sono nel mazzo.'
                    : `${mine.length} di ${slots} carte personali.`
              }
            />
            <Segmented
              value={tab}
              options={[
                { id: 'base', label: `Base ${BASE_RULES.length}` },
                { id: 'mine', label: `Create ${mine.length}/${slots}` },
                { id: 'epic', label: `Epiche ${EPIC_RULES.length}` },
              ]}
              onChange={setTab}
            />
            <View style={styles.grid}>
              {tab === 'epic'
                ? EPIC_RULES.map((r) => (
                    <PlayCard key={r.id} rule={r} status="Vinta, sempre tua" onOpen={openCard(r)} />
                  ))
                : tab === 'base'
                  ? // Tutte le 20 sempre visibili: quelle già nel mazzo con la spunta, le altre con il +.
                    // Come su iPhone: tocco = apri la carta, pressione lunga = azione rapida (metti nel mazzo).
                    BASE_RULES.map((r) => {
                      const inDeck = game.ruleIds.includes(r.id);
                      const minePick = proposals.some((p) => p.ruleId === r.id && p.authorId === ME.id);
                      return (
                        <PlayCard
                          key={r.id}
                          rule={r}
                          dimmed={!pregame && !inDeck}
                          cta={
                            pregame && !inDeck
                              ? { label: 'Metti nel mazzo', icon: 'plus', onPress: () => pick(r) }
                              : pregame && minePick
                                ? { label: 'Nel mazzo', icon: 'check', done: true, onPress: () => drop(r) }
                                : undefined
                          }
                          status={inDeck ? 'Nel mazzo' : pregame ? undefined : 'Fuori dal mazzo'}
                          onOpen={openCard(r)}
                          onLongPress={pregame && !inDeck ? () => pick(r) : undefined}
                        />
                      );
                    })
                  : [
                      ...mine.map((r) => {
                        const inDeck = game.ruleIds.includes(r.id);
                        return (
                          <PlayCard
                            key={r.id}
                            rule={r}
                            authorName="te"
                            cta={
                              pregame
                                ? inDeck
                                  ? { label: 'Nel mazzo', icon: 'check', done: true, onPress: () => drop(r) }
                                  : { label: 'Metti nel mazzo', icon: 'plus', onPress: () => pick(r) }
                                : undefined
                            }
                            status={pregame ? undefined : inDeck ? 'Nel mazzo' : 'Fuori dal mazzo'}
                            onOpen={openCard(r)}
                          />
                        );
                      }),
                      ...Array.from({ length: Math.max(0, slots - mine.length) }, (_, i) => (
                        <EmptySlot key={`empty-${i}`} onPress={createCard} style={styles.halfSlot} />
                      )),
                      <EmptySlot key="locked" locked onPress={openPremium} style={styles.halfSlot} />,
                    ]}
            </View>
          </View>

          {game.playerIds[0] === ME.id && game.status !== 'ended' && (
            <View style={styles.section}>
              <SectionHeader
                title="Avanzate partita"
                info="finale nascosto e sudden death"
                caption={
                  game.status === 'live'
                    ? 'Partita in corso: ogni modifica chiede conferma e avvisa tutta la stanza.'
                    : 'Le decidi tu da host. Valgono per tutta la stanza.'
                }
              />
              <FinaleSettings
                votes
                settings={{ ...DEFAULT_SETTINGS, ...game.settings, votesToConfirm: votesNeeded(game) }}
                onChange={(patch) =>
                  game.status === 'live'
                    ? confirmAction(
                        'Cambiare a partita in corso?',
                        'Tutta la stanza riceverà un avviso con la modifica.',
                        'Cambia e avvisa',
                        () => {
                          updateSettings(game.id, patch);
                          showToast({ text: 'Fatto: la stanza è stata avvisata' });
                        },
                      )
                    : updateSettings(game.id, patch)
                }
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
                    Passa a Premium
                  </AppText>
                  <AppText variant="caption" color="rgba(255,255,255,0.7)" style={styles.regular}>
                    30 carte da creare, fino a 3 mazzi e i poteri speciali Ladro e Jolly.
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
        {...sheet}
        from={openFrom.from}
        onClose={() => setSelected(undefined)}
      />
      <DeckExplorer game={game} deck={deck} open={explore} onClose={() => setExplore(false)} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  playersTab: { gap: 40 },
  cell: { width: '47.5%' },
  bleed: { marginHorizontal: -layout.gutter },
  carousel: { paddingHorizontal: layout.gutter, gap: space.sm },
  carouselCard: { width: 168 },
  halfSlot: { width: '47.5%' },
  slot: { width: '22%' },
  full: { width: '100%' },
  slots: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: '4%',
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
  grid: { flexDirection: 'row', flexWrap: 'wrap', columnGap: '5%', rowGap: space.lg },
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
