import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { CardSheet } from '@/components/cards/CardSheet';
import { PlayCard } from '@/components/cards/PlayCard';
import { Icon } from '@/components/icons/Icon';
import { AppText } from '@/components/ui/AppText';
import { EmptyNote } from '@/components/ui/EmptyNote';
import { HOME_TAB_SPACE } from '@/components/ui/HomeTabBar';
import { PressableScale } from '@/components/ui/PressableScale';
import { RoomTile, tilePaint } from '@/components/ui/RoomTile';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Segmented } from '@/components/ui/Segmented';
import { TopBar } from '@/components/ui/TopBar';
import {
  COMMUNITY_CARDS,
  COMMUNITY_DECKS,
  COMMUNITY_ROOMS,
  OCCASIONS,
  type CommunityCard,
  type CommunityDeck,
  type CommunityRoom,
} from '@/data/community';
import { usePlayDeck } from '@/hooks/usePlayDeck';
import { haptics } from '@/lib/haptics';
import { useGameStore } from '@/store/useGameStore';
import { useUiStore } from '@/store/useUiStore';
import { colors, layout, MAX_APP_WIDTH, radius, space } from '@/theme/tokens';
import type { Rule } from '@/types/game';

type View_ = 'foryou' | 'rooms' | 'decks' | 'cards';
const fmt = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(1).replace('.0', '')}k` : String(n));
const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

/**
 * WORLD: cosa fa la community. Una ricerca sempre in cima (riconoscere, non ricordare),
 * quattro viste: Per te (tendenze), Partite pubbliche, Mazzi completi, Carte singole.
 * Ogni card ha UNA azione: Partecipa, Gioca, Salva.
 */
export function WorldScreen() {
  const router = useRouter();
  const [view, setView] = useState<View_>('foryou');
  const [query, setQuery] = useState('');
  const [occasion, setOccasion] = useState<(typeof OCCASIONS)[number]>('Tutte');
  const [selected, setSelected] = useState<Rule>();
  const saved = useGameStore((s) => s.savedRuleIds);
  const liked = useGameStore((s) => s.likedCommunity);
  const toggleSaved = useGameStore((s) => s.toggleSaved);
  const toggleLike = useGameStore((s) => s.toggleCommunityLike);
  const showToast = useUiStore((s) => s.showToast);
  const playDeck = usePlayDeck();

  const q = norm(query.trim());
  const match = (...fields: string[]) => !q || fields.some((f) => norm(f).includes(q));
  const byOccasion = (o: string) => occasion === 'Tutte' || o === occasion;

  const rooms = useMemo(
    () =>
      COMMUNITY_ROOMS.filter((r) => byOccasion(r.occasion) && match(r.name, r.host.name, r.occasion)).sort(
        (a, b) => b.calls24h - a.calls24h || b.players - a.players,
      ),
    [q, occasion], // eslint-disable-line react-hooks/exhaustive-deps
  );
  const decks = useMemo(
    () =>
      COMMUNITY_DECKS.filter((d) => byOccasion(d.occasion) && match(d.name, d.author.name, d.occasion)).sort(
        (a, b) => b.plays - a.plays,
      ),
    [q, occasion], // eslint-disable-line react-hooks/exhaustive-deps
  );
  const cards = useMemo(
    () =>
      COMMUNITY_CARDS.filter(
        (c) =>
          (occasion === 'Tutte' || c.tags.includes(occasion)) && match(c.rule.label, c.rule.description, c.author.name),
      ).sort((a, b) => b.likes - a.likes),
    [q, occasion], // eslint-disable-line react-hooks/exhaustive-deps
  );
  const nothing = !rooms.length && !decks.length && !cards.length;
  const community = selected && COMMUNITY_CARDS.find((c) => c.rule.id === selected.id);

  const join = (r: CommunityRoom) => {
    haptics.bonus();
    showToast({ text: `Richiesta inviata a ${r.host.name}: ti avvisiamo quando ti fa entrare` });
  };
  const save = (c: CommunityCard) => {
    const on = saved.includes(c.rule.id);
    toggleSaved(c.rule.id);
    showToast({
      text: on ? `${c.rule.label} tolta dalla collezione` : `${c.rule.label} è nella tua collezione`,
      action: { label: 'Annulla', onPress: () => toggleSaved(c.rule.id) },
    });
  };

  const roomTile = (r: CommunityRoom, style?: object) => (
    <RoomTile
      key={r.id}
      id={`room-${r.id}`}
      emoji={r.emoji}
      title={r.name}
      subtitle={`${r.players} giocatori · ${r.open} posti liberi`}
      extra={
        <AppText variant="micro" color={r.status === 'live' ? colors.live : colors.inkSoft} style={styles.meta}>
          {r.status === 'live' ? `● ${r.calls24h} chiamate oggi` : 'Parte presto'}
        </AppText>
      }
      tone={r.status === 'live' ? 'live' : 'waiting'}
      cta="Partecipa"
      onPress={() => join(r)}
      style={style}
    />
  );
  const deckTile = (d: CommunityDeck, i?: number, style?: object) => (
    <RoomTile
      key={d.id}
      id={`deck-${d.id}`}
      rank={i !== undefined ? i + 1 : undefined}
      emoji={d.emoji}
      title={d.name}
      subtitle={`di @${d.author.handle} · ${d.ruleIds.length} carte`}
      extra={
        <AppText variant="micro" color={tilePaint(d.official ? 'official' : 'community').soft} style={styles.meta}>
          {fmt(d.plays)} partite · ♥ {fmt(d.likes + (liked.includes(d.id) ? 1 : 0))}
        </AppText>
      }
      tone={d.official ? 'official' : 'community'}
      cta="Gioca"
      onPress={() => playDeck(d)}
      style={style}
    />
  );
  const cardTile = (c: CommunityCard, style?: object) => (
    <PlayCard
      key={c.rule.id}
      rule={c.rule}
      authorName={c.author.name}
      style={style}
      cta={
        saved.includes(c.rule.id)
          ? { label: 'Salvata', icon: 'check', done: true, onPress: () => save(c) }
          : { label: 'Salva', icon: 'plus', onPress: () => save(c) }
      }
      onOpen={() => setSelected(c.rule)}
    />
  );

  return (
    <View style={styles.screen}>
      <TopBar
        title="World"
        left={
          <PressableScale
            accessibilityRole="button"
            accessibilityLabel="Impostazioni"
            hitSlop={8}
            onPress={() => router.push('/settings')}
            style={styles.iconBtn}>
            <Icon name="settings" size={20} />
          </PressableScale>
        }
      />
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: HOME_TAB_SPACE + space.lg }]}
        keyboardShouldPersistTaps="handled">
        <View style={styles.search}>
          <Icon name="search" size={18} color={colors.inkSoft} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Cerca partite, mazzi, carte, persone"
            placeholderTextColor={colors.inkFaint}
            style={styles.input}
            returnKeyType="search"
            accessibilityLabel="Cerca nella community"
          />
          {query ? (
            <PressableScale accessibilityLabel="Cancella la ricerca" hitSlop={10} onPress={() => setQuery('')}>
              <Icon name="close" size={16} color={colors.inkSoft} />
            </PressableScale>
          ) : null}
        </View>

        <Segmented
          value={view}
          options={[
            { id: 'foryou', label: 'Per te' },
            { id: 'rooms', label: 'Partite' },
            { id: 'decks', label: 'Mazzi' },
            { id: 'cards', label: 'Carte' },
          ]}
          onChange={setView}
        />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.bleedTight}
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

        {nothing ? (
          <EmptyNote emoji="🔎" title="Niente per questa ricerca" body="Prova un'altra parola o un'altra occasione." />
        ) : view === 'foryou' ? (
          <>
            {rooms.length > 0 && (
              <View style={styles.section}>
                <SectionHeader
                  title="Partite più vive"
                  caption="Stanze pubbliche con posti liberi, ordinate per chiamate di oggi."
                  action={{ label: 'Tutte', onPress: () => setView('rooms') }}
                />
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.bleed}
                  contentContainerStyle={styles.row}>
                  {rooms.map((r) => roomTile(r))}
                </ScrollView>
              </View>
            )}
            {decks.length > 0 && (
              <View style={styles.section}>
                <SectionHeader
                  title="Mazzi più giocati"
                  caption="Un tocco e hai la stanza pronta."
                  action={{ label: 'Tutti', onPress: () => setView('decks') }}
                />
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.bleed}
                  contentContainerStyle={styles.row}>
                  {decks.slice(0, 8).map((d, i) => deckTile(d, i))}
                </ScrollView>
              </View>
            )}
            {cards.length > 0 && (
              <View style={styles.section}>
                <SectionHeader
                  title="Carte della settimana"
                  caption="Le più amate: salvale per usarle nelle tue partite."
                  action={{ label: 'Tutte', onPress: () => setView('cards') }}
                />
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.bleed}
                  contentContainerStyle={styles.row}>
                  {cards.slice(0, 8).map((c) => cardTile(c, styles.carouselCard))}
                </ScrollView>
              </View>
            )}
            <View style={styles.section}>
              <SectionHeader title="Creator da seguire" caption="Chi pubblica le carte più giocate." />
              <View style={styles.creators}>
                {Object.values(Object.fromEntries(COMMUNITY_CARDS.map((c) => [c.author.handle, c.author])))
                  .slice(0, 4)
                  .map((a) => (
                    <View key={a.handle} style={styles.creator}>
                      <View style={[styles.creatorDot, { backgroundColor: a.color }]}>
                        <AppText variant="headline" color="#FFFFFF">
                          {a.name[0]}
                        </AppText>
                      </View>
                      <AppText variant="micro" numberOfLines={1}>
                        @{a.handle}
                      </AppText>
                    </View>
                  ))}
              </View>
            </View>
          </>
        ) : (
          <View style={styles.grid}>
            {view === 'rooms' && rooms.map((r) => roomTile(r, styles.half))}
            {view === 'decks' && decks.map((d) => deckTile(d, undefined, styles.half))}
            {view === 'cards' && cards.map((c) => cardTile(c))}
          </View>
        )}
      </ScrollView>

      <CardSheet
        rule={selected}
        state={
          community ? { text: `di @${community.author.handle} · giocata in ${fmt(community.plays)} stanze` } : undefined
        }
        primary={
          community
            ? {
                label: liked.includes(community.rule.id) ? 'Ti piace' : 'Mi piace',
                icon: liked.includes(community.rule.id) ? 'check' : undefined,
                onPress: () => toggleLike(community.rule.id),
              }
            : undefined
        }
        onClose={() => setSelected(undefined)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: {
    paddingHorizontal: layout.gutter,
    paddingTop: space.md,
    gap: space.lg,
    width: '100%',
    maxWidth: MAX_APP_WIDTH,
    alignSelf: 'center',
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xs,
    height: 44,
    paddingHorizontal: space.sm,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceMuted,
  },
  input: { flex: 1, fontSize: 16, color: colors.ink, outlineStyle: 'none' } as object,
  bleed: { marginHorizontal: -layout.gutter, flexGrow: 0 },
  bleedTight: { marginHorizontal: -layout.gutter, marginTop: -space.xs, flexGrow: 0 },
  row: { gap: space.sm, paddingHorizontal: layout.gutter },
  chips: { gap: space.xs, paddingHorizontal: layout.gutter },
  chip: {
    paddingHorizontal: space.sm,
    paddingVertical: 6,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.hairline,
    backgroundColor: colors.surface,
  },
  chipOn: { backgroundColor: colors.ink, borderColor: colors.ink },
  section: { gap: space.sm, marginTop: space.sm },
  grid: { flexDirection: 'row', flexWrap: 'wrap', columnGap: '5%', rowGap: space.md },
  half: { width: '47.5%' },
  carouselCard: { width: 168 },
  meta: { marginTop: 2 },
  creators: { flexDirection: 'row', justifyContent: 'space-between' },
  creator: { alignItems: 'center', gap: space.xxs, width: '23%' },
  creatorDot: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
});
