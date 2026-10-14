import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Platform, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/icons/Icon';
import { ActionRow } from '@/components/ui/ActionRow';
import { AppText } from '@/components/ui/AppText';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { MoreLink } from '@/components/ui/MoreLink';
import { HOME_TAB_SPACE } from '@/components/ui/HomeTabBar';
import { PressableScale } from '@/components/ui/PressableScale';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Segmented } from '@/components/ui/Segmented';
import { RoomCard } from '@/components/rooms/RoomCard';
import { MyPowersRow } from '@/components/game/MyPowersRow';
import { TopBar } from '@/components/ui/TopBar';
import { BADGES, COMMUNITY_CARDS } from '@/data/community';
import { ME } from '@/data/mock';
import { EPIC_RULES } from '@/data/rules';
import { haptics } from '@/lib/haptics';
import { openDeckPage } from '@/lib/links';
import { computeStandings, customSlots, useGameStore } from '@/store/useGameStore';
import { DEFAULT_PUBLIC, useSessionStore } from '@/store/useSessionStore';
import { useUiStore } from '@/store/useUiStore';
import { colors, layout, MAX_APP_WIDTH, radius, space } from '@/theme/tokens';
import type { Rule } from '@/types/game';

const WHO: Record<string, string> = { private: 'Solo tu', friends: 'Amici', everyone: 'Tutti' };

/**
 * PROFILO PUBBLICO: la vetrina di Fanta.me, la stessa che vedono gli altri.
 * In cima chi sei e chi ti vede (sempre visibile, si cambia con un tocco).
 * Poi badge, carte (sbloccate e create), statistiche delle partite e amici.
 * Ogni blocco si può nascondere nelle Impostazioni; qui resta visibile a te con l'etichetta "Solo tu".
 */
export function MeScreen() {
  const router = useRouter();
  const games = useGameStore((s) => s.games);
  const events = useGameStore((s) => s.events);
  const players = useGameStore((s) => s.players);
  const friendships = useGameStore((s) => s.friendships);
  const customRules = useGameStore((s) => s.customRules);
  const saved = useGameStore((s) => s.savedRuleIds);
  const published = useGameStore((s) => s.publishedRuleIds);
  const togglePublish = useGameStore((s) => s.togglePublish);
  const extraSlots = useGameStore((s) => s.extraSlots);
  const visibility = useSessionStore((s) => s.collectionVisibility);
  const show = useSessionStore((s) => s.publicShow) ?? DEFAULT_PUBLIC;
  const showToast = useUiStore((s) => s.showToast);

  const career = ME.career;
  const friends = Object.values(friendships).filter((f) => f === 'friends').length;
  const requests = Object.values(friendships).filter((f) => f === 'received').length;
  const created = customRules.filter((r) => r.authorId === ME.id);
  const unlocked = useMemo(
    () => [...EPIC_RULES, ...COMMUNITY_CARDS.filter((c) => saved.includes(c.rule.id)).map((c) => c.rule)],
    [saved],
  );
  const slots = customSlots(extraSlots ?? 0);
  const history = useMemo(
    () =>
      games
        .filter((g) => g.playerIds.includes(ME.id))
        .map((g) => {
          const rows = computeStandings(g, events, players);
          const i = rows.findIndex((r) => r.player.id === ME.id);
          return { game: g, place: i + 1, of: rows.length, points: rows[i]?.points ?? 0 };
        }),
    [games, events, players],
  );

  const share = () => {
    haptics.tap();
    const url = `https://fanta.me/@${ME.handle}`;
    if (Platform.OS === 'web' && typeof navigator !== 'undefined') {
      const nav = navigator as Navigator & { share?: (d: { url: string; title: string }) => Promise<void> };
      if (nav.share) nav.share({ url, title: `${ME.name} su Fanta.me` }).catch(() => {});
      else {
        navigator.clipboard?.writeText(url);
        showToast({ text: 'Link del profilo copiato' });
      }
    }
  };
  const hiddenTag = (on: boolean) => (on ? undefined : 'Solo tu');

  return (
    <View style={styles.screen}>
      <TopBar
        title="Profilo"
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
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: HOME_TAB_SPACE + space.lg }]}>
        {/* Chi sei, chi ti vede, cosa hai fatto */}
        <View style={styles.hero}>
          <Avatar player={ME} size={96} sticker={false} />
          <View style={styles.names}>
            <AppText variant="title">{ME.name}</AppText>
            <AppText variant="body" color={colors.inkSoft}>
              @{ME.handle}
            </AppText>
          </View>
          <PressableScale
            accessibilityRole="button"
            accessibilityLabel={`Chi vede il profilo: ${WHO[visibility]}. Cambia`}
            onPress={() => router.push('/settings')}
            style={styles.who}>
            <Icon name={visibility === 'private' ? 'lock' : 'people'} size={14} color={colors.inkSoft} />
            <AppText variant="micro" color={colors.inkSoft}>
              Visibile a: {WHO[visibility]}
            </AppText>
          </PressableScale>
          <View style={styles.stats}>
            <Stat value={career.gamesPlayed} label="partite" />
            <Stat value={career.wins} label="vittorie" />
            <Stat value={career.trophies} label="trofei" />
            <Stat value={career.totalPoints.toLocaleString('it-IT')} label="fantapunti" />
          </View>
          <ActionRow
            style={styles.actions}
            secondary={{ label: `Amici ${friends}`, onPress: () => router.push(`/player/${ME.id}`) }}
            primary={{ label: 'Condividi', onPress: share }}
          />
          {requests > 0 && (
            <PressableScale onPress={() => router.push(`/player/${ME.id}`)} style={styles.request}>
              <View style={styles.reqDot} />
              <AppText variant="caption">
                {requests} {requests === 1 ? 'richiesta di amicizia' : "richieste d'amicizia"}
              </AppText>
            </PressableScale>
          )}
        </View>

        <View style={styles.section}>
          <SectionHeader
            title="Badge"
            caption={`${BADGES.filter((b) => b.unlocked).length} di ${BADGES.length} sbloccati${hiddenTag(show.badges) ? ' · nascosti agli altri' : ''}`}
          />
          <View style={styles.badges}>
            {BADGES.map((b) => (
              <PressableScale
                key={b.id}
                accessibilityRole="button"
                accessibilityLabel={`${b.label}: ${b.note}${b.unlocked ? '' : ', da sbloccare'}`}
                onPress={() =>
                  showToast({ text: `${b.emoji} ${b.label}: ${b.note}${b.unlocked ? '' : ' (da sbloccare)'}` })
                }
                style={styles.badge}>
                <View style={[styles.badgeDisc, !b.unlocked && styles.badgeLocked]}>
                  <Text style={styles.badgeEmoji}>{b.unlocked ? b.emoji : '🔒'}</Text>
                </View>
                <AppText variant="micro" numberOfLines={1} color={b.unlocked ? colors.ink : colors.inkFaint}>
                  {b.label}
                </AppText>
              </PressableScale>
            ))}
          </View>
        </View>

        <MyPowersRow />

        <View style={styles.section}>
          <SectionHeader
            title="Carte"
            caption={`Epiche vinte, salvate dalla community e ${created.length} di ${slots} create${
              hiddenTag(show.unlocked) || hiddenTag(show.created) ? ' · in parte nascoste agli altri' : ''
            }`}
          />
          <View style={styles.links}>
            <MoreLink
              label={`Guarda le carte sbloccate · ${unlocked.length}`}
              onPress={() => openDeckPage({ title: 'Carte sbloccate', ids: unlocked.map((r) => r.id) })}
            />
            <MoreLink
              label={`Guarda le carte create · ${created.length}`}
              onPress={() => openDeckPage({ title: 'Carte create', ids: created.map((r) => r.id) })}
            />
          </View>
          {created.length > 0 && (
            <View style={styles.list}>
              {created.map((r, i) => {
                const on = published.includes(r.id);
                return (
                  <View key={r.id} style={[styles.listRow, i > 0 && styles.listDivider]}>
                    <AppText style={styles.listEmoji}>{r.emoji}</AppText>
                    <AppText variant="name" style={styles.flex} numberOfLines={1}>
                      {r.label}
                    </AppText>
                    <PressableScale
                      accessibilityRole="button"
                      accessibilityLabel={on ? `Ritira ${r.label} dalla community` : `Pubblica ${r.label}`}
                      onPress={() => togglePublish(r.id)}
                      style={[styles.pill, on && styles.pillOn]}>
                      <AppText variant="micro" color={on ? colors.ctaInk : colors.ink} style={styles.bold}>
                        {on ? 'Pubblicata' : 'Pubblica'}
                      </AppText>
                    </PressableScale>
                  </View>
                );
              })}
            </View>
          )}
          <Button label="Crea una carta" variant="secondary" icon="plus" onPress={() => router.push('/card/new')} />
        </View>

        <View style={styles.section}>
          <SectionHeader
            title="Statistiche"
            caption={`Posizione e punti in ogni partita${hiddenTag(show.stats) ? ' · nascoste agli altri' : ''}`}
          />
          <View style={styles.rooms}>
            {history.map(({ game, place, of, points }) => (
              <RoomCard
                key={game.id}
                id={`hist-${game.id}`}
                emoji={game.emoji}
                title={game.name}
                subtitle={`${place}° su ${of} · ${points > 0 ? '+' : ''}${points} punti`}
                status={game.status === 'live' ? 'In corso' : game.status === 'waiting' ? 'Pre-partita' : 'Conclusa'}
                tone={game.status}
                cta={game.status === 'ended' ? 'Risultati' : 'Apri'}
                width="100%"
                onCta={() => router.push({ pathname: '/game/[gameId]', params: { gameId: game.id } })}
              />
            ))}
          </View>
        </View>

        <PressableScale onPress={() => router.push('/settings')} accessibilityRole="link" style={styles.privacy}>
          <Icon name="lock" size={14} color={colors.inkSoft} />
          <AppText variant="caption" color={colors.inkSoft} style={styles.regular}>
            Scegli cosa mostrare agli altri nelle Impostazioni
          </AppText>
        </PressableScale>
      </ScrollView>
    </View>
  );
}

function Stat({ value, label }: { value: number | string; label: string }) {
  return (
    <View style={styles.stat}>
      <AppText variant="number">{value}</AppText>
      <AppText variant="micro" color={colors.inkSoft}>
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  links: { gap: space.xxs },
  flex: { flex: 1 },
  bold: { fontWeight: '600' },
  list: { backgroundColor: colors.surface, borderRadius: radius.lg, overflow: 'hidden' },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xs,
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
  },
  listDivider: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.hairline },
  listEmoji: { fontSize: 22, lineHeight: 28 },
  pill: {
    borderRadius: radius.pill,
    paddingHorizontal: space.sm,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: colors.line,
  },
  pillOn: { backgroundColor: colors.cta, borderColor: colors.cta },
  screen: { flex: 1, backgroundColor: colors.background },
  content: {
    paddingHorizontal: layout.gutter,
    paddingTop: space.lg,
    gap: layout.section,
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
  hero: {
    alignItems: 'center',
    gap: space.sm,
    borderRadius: radius.xl,
    overflow: 'hidden',
    padding: space.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.hairline,
  },
  names: { alignItems: 'center', gap: 2 },
  who: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 28,
    paddingHorizontal: space.sm,
    borderRadius: 14,
    backgroundColor: colors.surfaceMuted,
  },
  rooms: { gap: space.sm },
  stats: { flexDirection: 'row', alignSelf: 'stretch', justifyContent: 'space-between', marginTop: space.xs },
  stat: { alignItems: 'center', flex: 1 },
  actions: { alignSelf: 'stretch', marginTop: space.xs },
  request: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  reqDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.malus },
  section: { gap: space.sm },
  badges: { flexDirection: 'row', flexWrap: 'wrap', rowGap: space.md },
  badge: { width: '25%', alignItems: 'center', gap: space.xxs },
  badgeDisc: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.cta,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeLocked: { borderColor: colors.hairline, opacity: 0.6 },
  badgeEmoji: { fontSize: 28, lineHeight: 34 },
  bleed: { marginHorizontal: -layout.gutter, flexGrow: 0 },
  row: { gap: space.sm, paddingHorizontal: layout.gutter, paddingVertical: space.xs },
  card: { width: 168 },
  privacy: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  regular: { fontWeight: '400' },
});
