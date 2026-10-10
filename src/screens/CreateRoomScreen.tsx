import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';

import { Icon } from '@/components/icons/Icon';
import { HeroCard, PosterCard } from '@/components/ui/Cards';
import { PressableScale } from '@/components/ui/PressableScale';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { TopBar } from '@/components/ui/TopBar';
import { COMMUNITY_DECKS, type CommunityDeck } from '@/data/community';
import { usePlayDeck } from '@/hooks/usePlayDeck';
import { colors, layout, MAX_APP_WIDTH, space } from '@/theme/tokens';

const plays = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(1).replace('.0', '')}k` : String(n));

/**
 * CREA UNA STANZA: due strade.
 * In cima "Da zero" (la card primaria, l'unico giallo); sotto tre file di partite pronte,
 * come le locandine di Netflix: suggerite da Fanta.me, le più giocate, di stagione.
 */
export function CreateRoomScreen() {
  const router = useRouter();
  const play = usePlayDeck();

  const lists: { title: string; caption: string; decks: CommunityDeck[] }[] = [
    {
      title: 'Suggerite da Fanta.me',
      caption: 'Mazzi bilanciati, perfetti per iniziare',
      decks: COMMUNITY_DECKS.filter((d) => d.official),
    },
    {
      title: 'Le più giocate',
      caption: 'Dalla community, ordinate per partite',
      decks: COMMUNITY_DECKS.filter((d) => !d.official && !d.season).sort((a, b) => b.plays - a.plays),
    },
    { title: 'Di stagione', caption: 'Per le feste in arrivo', decks: COMMUNITY_DECKS.filter((d) => d.season) },
  ];

  return (
    <View style={styles.screen}>
      <TopBar
        title="Crea una stanza"
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
        <HeroCard
          emoji="✍️"
          eyebrow="Da zero"
          title="La tua stanza, le tue regole"
          body="Scegli nome, durata e carte in quattro passi."
          primary={{ label: 'Inizia', onPress: () => router.push('/room/new') }}
          secondary={{ label: 'Ho un codice', onPress: () => router.push('/room/join') }}
        />

        {lists.map((l) => (
          <View key={l.title} style={styles.section}>
            <SectionHeader title={l.title} caption={l.caption} />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.scroll}
              contentContainerStyle={styles.row}>
              {l.decks.map((d) => (
                <PosterCard
                  key={d.id}
                  emoji={d.emoji}
                  title={d.name}
                  meta={`${d.ruleIds.length} carte · ${plays(d.plays)} partite`}
                  onPress={() => play(d)}
                />
              ))}
            </ScrollView>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: {
    paddingHorizontal: layout.gutter,
    paddingTop: layout.section,
    paddingBottom: space.xxl * 2,
    gap: layout.section + space.xs,
    width: '100%',
    maxWidth: MAX_APP_WIDTH,
    alignSelf: 'center',
  },
  section: { gap: space.sm },
  scroll: { marginHorizontal: -layout.gutter, flexGrow: 0 },
  row: { gap: space.sm, paddingHorizontal: layout.gutter },
});
