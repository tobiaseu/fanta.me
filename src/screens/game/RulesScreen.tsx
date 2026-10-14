import { useLiveDeck } from '@/hooks/useLiveDeck';
import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { FinaleSettings } from '@/components/game/FinaleSettings';
import { TAB_BAR_SPACE } from '@/components/game/GameTabBar';
import { PowersPanel } from '@/components/game/PowersPanel';
import { TeamFormation } from '@/components/game/TeamFormation';
import { TeamSummary } from '@/components/game/TeamSummary';
import { TeamsBuilder } from '@/components/game/TeamsBuilder';
import { MoreLink } from '@/components/ui/MoreLink';
import { Segmented } from '@/components/ui/Segmented';
import { useUiStore } from '@/store/useUiStore';
import { AppText } from '@/components/ui/AppText';
import { Avatar } from '@/components/ui/Avatar';
import { PressableScale } from '@/components/ui/PressableScale';
import { Button } from '@/components/ui/Button';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { ME } from '@/data/mock';
import { BASE_RULES, EPIC_RULES, powerById, ruleById } from '@/data/rules';
import { useCurrentGame } from '@/hooks/useCurrentGame';
import { confirmAction } from '@/lib/confirm';
import { haptics } from '@/lib/haptics';
import { openDeckPage } from '@/lib/links';
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
  const division = useUiStore((s) => s.deckView);
  const setDivision = useUiStore((s) => s.setDeckView);
  const showToast = useUiStore((s) => s.showToast);
  const events = useGameStore((s) => s.events);
  const captains = useGameStore((s) => s.captains);
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
                        <TeamSummary key={t.id} game={game} team={t} place={place(t.id)} />
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
              caption={
                pregame
                  ? `${deck.length} carte finora. Si chiude ${DATE.format(new Date(game.startsAt ?? Date.now()))}.`
                  : `${deck.length} carte, valore medio ${avg > 0 ? '+' : ''}${avg}. ${game.status === 'live' ? 'Il mazzo è chiuso.' : 'Partita conclusa.'}`
              }
            />
            <MoreLink
              label="Guarda il mazzo"
              onPress={() => openDeckPage({ title: `Il mazzo di ${game.name}`, gameId: game.id })}
            />
            {pregame && (
              <Button
                label="Costruisci il tuo mazzo"
                onPress={() => router.push({ pathname: '/deck/[gameId]', params: { gameId: game.id } })}
              />
            )}
          </View>

          {pregame && (
            <View style={styles.section}>
              <SectionHeader
                title="Le tue carte nel mazzo"
                caption={
                  myCards.length < perPlayer
                    ? `${myCards.length} di ${perPlayer}. Scegli le altre in "Costruisci il tuo mazzo".`
                    : `${perPlayer} di ${perPlayer}: sei a posto.`
                }
              />
              {myCards.length > 0 && (
                <MoreLink
                  label="Guarda le tue carte"
                  onPress={() => openDeckPage({ title: 'Le tue carte nel mazzo', ids: myCards.map((r) => r.id) })}
                />
              )}
            </View>
          )}

          {pregame && open.length > 0 && (
            <View style={styles.section}>
              <SectionHeader
                title="Proposte"
                caption={`Servono ${needed} mi piace su ${game.playerIds.length} per entrare.`}
              />
              <View style={styles.list}>
                {open.map((p, i) => {
                  const r = ruleById(p.ruleId);
                  const liked = p.likes.includes(ME.id);
                  return r ? (
                    <View key={p.id} style={[styles.row, i > 0 && styles.rowDivider]}>
                      <AppText style={styles.rowEmoji}>{r.emoji}</AppText>
                      <AppText variant="name" style={styles.flex} numberOfLines={1}>
                        {r.label}
                      </AppText>
                      <PressableScale
                        accessibilityRole="button"
                        accessibilityLabel={liked ? `Non voglio ${r.label}` : `Voglio ${r.label}`}
                        onPress={() => {
                          haptics.tap();
                          toggleLike(p.id);
                        }}
                        style={[styles.like, liked && styles.likeOn]}>
                        <AppText variant="micro" color={liked ? colors.ctaInk : colors.ink} style={styles.bold}>
                          {liked ? 'La vuoi' : 'La voglio'} · {p.likes.length}/{needed}
                        </AppText>
                      </PressableScale>
                    </View>
                  ) : null;
                })}
              </View>
              <MoreLink
                label="Guarda le proposte"
                onPress={() => openDeckPage({ title: 'Proposte', ids: open.map((p) => p.ruleId) })}
              />
            </View>
          )}

          <View style={styles.section}>
            <SectionHeader
              title="La tua collezione"
              caption={`Il tuo mazzo personale: ${BASE_RULES.length} carte base, ${mine.length} di ${slots} create da te e ${EPIC_RULES.length} epiche vinte.`}
            />
            <View style={styles.links}>
              <MoreLink
                label={`Guarda le carte base · ${BASE_RULES.length}`}
                onPress={() => openDeckPage({ title: 'Carte base', ids: BASE_RULES.map((r) => r.id) })}
              />
              <MoreLink
                label={`Guarda le carte create · ${mine.length}`}
                onPress={() => openDeckPage({ title: 'Carte create', ids: mine.map((r) => r.id) })}
              />
              <MoreLink
                label={`Guarda le carte epiche · ${EPIC_RULES.length}`}
                onPress={() => openDeckPage({ title: 'Carte epiche', ids: EPIC_RULES.map((r) => r.id) })}
              />
            </View>
            <Button label="Crea una carta" variant="secondary" icon="plus" onPress={createCard} />
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
                          <AppText variant="micro" style={styles.bold}>
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
                  <AppText variant="name">Passa a Premium</AppText>
                  <AppText variant="caption" color={colors.inkSoft} style={styles.regular}>
                    30 carte da creare, fino a 3 mazzi e i poteri speciali Ladro e Jolly.
                  </AppText>
                </View>
              </PressableScale>
            )}
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  playersTab: { gap: 40 },
  cell: { width: '47.5%' },
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
  links: { gap: space.xxs },
  rowEmoji: { fontSize: 22, lineHeight: 28 },
  like: {
    borderRadius: radius.pill,
    paddingHorizontal: space.sm,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: colors.line,
  },
  likeOn: { backgroundColor: colors.cta, borderColor: colors.cta },
  premium: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.accent,
    borderRadius: radius.lg,
    padding: layout.card,
  },
  premiumEmoji: { fontSize: 28, lineHeight: 34 },
  regular: { fontWeight: '400' },
  bold: { fontWeight: '600' },
});
