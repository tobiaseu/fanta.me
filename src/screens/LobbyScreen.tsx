import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import type { CardRect } from '@/components/cards/PlayCard';
import { Icon } from '@/components/icons/Icon';
import { CommunityRoomCard, CommunityRoomSheet } from '@/components/rooms/CommunityRoom';
import { RoomCard } from '@/components/rooms/RoomCard';
import { AppText } from '@/components/ui/AppText';
import { AvatarStack } from '@/components/ui/Avatar';
import { Wordmark } from '@/components/ui/Brand';
import { Button } from '@/components/ui/Button';
import { HOME_TAB_SPACE } from '@/components/ui/HomeTabBar';
import { PressableScale } from '@/components/ui/PressableScale';
import { TileArt, tilePaint, type TileTone } from '@/components/ui/RoomArt';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { TopBar } from '@/components/ui/TopBar';
import { COMMUNITY_ROOMS, type CommunityRoom } from '@/data/community';
import { ME } from '@/data/mock';
import { useNow } from '@/hooks/useNow';
import { haptics } from '@/lib/haptics';
import { computeStandings, gameDay, useGameStore } from '@/store/useGameStore';
import { useSessionStore } from '@/store/useSessionStore';
import { colors, layout, MAX_APP_WIDTH, radius, space } from '@/theme/tokens';
import type { Game } from '@/types/game';

const TONE: Record<Game['status'], TileTone> = { live: 'live', waiting: 'waiting', ended: 'ended' };
const STATUS: Record<Game['status'], string> = { live: 'In corso', waiting: 'Pre-partita', ended: 'Conclusa' };

/**
 * LOBBY: la casa del giocatore. Dall'alto, in ordine di urgenza:
 *  1. l'ultima partita vista, con l'unica azione gialla della pagina (Rientra / Vota);
 *  2. i due ingressi per iniziare: Entra con codice (a sinistra) e Crea partita (a destra);
 *  3. le altre partite attive, con la stessa card di quelle consigliate ma più informazioni;
 *  4. il Libro del Fanta;
 *  5. le partite consigliate dal sistema, in classifica come Apple Games.
 */
export function LobbyScreen({ forceEmpty = false }: { forceEmpty?: boolean }) {
  const router = useRouter();
  const now = useNow(30_000);
  const { games, events, players } = useGameStore();
  const lastGameId = useSessionStore((s) => s.lastGameId);
  const [room, setRoom] = useState<{ room: CommunityRoom; from?: CardRect }>();

  const myGames = useMemo(() => (forceEmpty ? [] : games), [games, forceEmpty]);
  const last = myGames.find((g) => g.id === lastGameId) ?? myGames.find((g) => g.status !== 'ended');
  // Prima le partite che chiedono qualcosa, le concluse in fondo
  const order: Record<Game['status'], number> = { live: 0, waiting: 1, ended: 2 };
  const others = myGames.filter((g) => g.id !== last?.id).sort((a, b) => order[a.status] - order[b.status]);

  const openGame = (game: Game) => {
    haptics.tap();
    router.push({ pathname: '/game/[gameId]', params: { gameId: game.id } });
  };

  const infoOf = (g: Game) => {
    const standings = computeStandings(g, events, players);
    const rank = standings.findIndex((r) => r.player.id === ME.id) + 1;
    const toVote = events.filter(
      (e) => e.gameId === g.id && e.status === 'pending' && !e.myVote && e.playerId !== ME.id && e.authorId !== ME.id,
    ).length;
    const day = gameDay(g, now);
    const line =
      g.status === 'waiting'
        ? 'Il mazzo si sta formando'
        : g.status === 'ended'
          ? `Conclusa, sei arrivato ${rank}°`
          : toVote > 0
            ? `${toVote} ${toVote === 1 ? 'chiamata da votare' : 'chiamate da votare'}`
            : `${day.label} ${day.index} di ${day.total}, sei ${rank}°`;
    const cta = g.status === 'ended' ? 'Risultati' : toVote > 0 ? `Vota (${toVote})` : 'Apri';
    return { line, toVote, rank, cta, people: players.filter((p) => g.playerIds.includes(p.id)) };
  };

  const resume = last && infoOf(last);
  const totalToVote = myGames.reduce((n, g) => n + infoOf(g).toVote, 0);
  const liveCount = myGames.filter((g) => g.status === 'live').length;
  const status =
    totalToVote > 0
      ? `${totalToVote} ${totalToVote === 1 ? 'voto ti aspetta' : 'voti ti aspettano'}`
      : liveCount
        ? `${liveCount} ${liveCount === 1 ? 'partita in corso' : 'partite in corso'}`
        : 'Nessuna partita in corso';

  const suggested = [...COMMUNITY_ROOMS].sort((a, b) => b.calls24h - a.calls24h || b.players - a.players).slice(0, 5);

  return (
    <View style={styles.screen}>
      <TopBar
        title={<Wordmark />}
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
        <View style={styles.hello}>
          <AppText variant="serifTitle">Ciao {ME.name}</AppText>
          <AppText variant="body" color={colors.inkSoft}>
            {status}
          </AppText>
        </View>

        {last && resume ? (
          <FeaturedGame
            game={last}
            line={resume.line}
            people={resume.people}
            cta={resume.toVote ? 'Vota adesso' : last.status === 'ended' ? 'Guarda i risultati' : 'Rientra'}
            onPress={() => openGame(last)}
          />
        ) : null}

        {/* Come iniziare: secondaria a sinistra, primaria a destra */}
        <View style={styles.entries}>
          <EntryTile
            icon="ticket"
            title="Entra con codice"
            note="Te l'ha mandato un amico"
            onPress={() => router.push('/room/join')}
          />
          <EntryTile
            icon="plus"
            title="Crea partita"
            note="Da zero o da un mazzo"
            strong
            onPress={() => router.push('/room/start')}
          />
        </View>

        {others.length > 0 && (
          <View style={styles.section}>
            <SectionHeader title="Le tue partite" caption="Quelle che chiedono qualcosa vengono prima." />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.bleed}
              contentContainerStyle={styles.row}>
              {others.map((g) => {
                const info = infoOf(g);
                return (
                  <RoomCard
                    key={g.id}
                    id={`mine-${g.id}`}
                    emoji={g.emoji}
                    title={g.name}
                    subtitle={info.line}
                    status={STATUS[g.status]}
                    tone={TONE[g.status]}
                    extra={<AvatarStack players={info.people} size={22} max={4} />}
                    cta={info.cta}
                    onCta={() => openGame(g)}
                  />
                );
              })}
            </ScrollView>
          </View>
        )}

        <PressableScale
          accessibilityRole="button"
          accessibilityLabel="Il Libro del Fanta: regole, consigli e trucchi"
          onPress={() => router.push('/rulebook')}
          pressedScale={0.98}
          style={styles.book}>
          <TileArt tone="official" id="book" cx={30} cy={50} wide />
          <Text style={styles.bookEmoji} allowFontScaling={false}>
            📖
          </Text>
          <View style={styles.flex}>
            <AppText variant="micro" color={tilePaint('official').soft}>
              Come si gioca
            </AppText>
            <AppText variant="headline" color={tilePaint('official').ink} style={styles.bold}>
              Il Libro del Fanta
            </AppText>
            <AppText variant="caption" color={tilePaint('official').soft} style={styles.regular}>
              Regole, consigli e trucchi in 3 minuti
            </AppText>
          </View>
          <Icon name="chevron-right" size={20} color={tilePaint('official').soft} />
        </PressableScale>

        <View style={styles.section}>
          <SectionHeader
            title="Consigliate per te"
            caption="Stanze pubbliche con posti liberi, le più vive per prime."
            action={{ label: 'World', onPress: () => router.navigate('/world') }}
          />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.bleed}
            contentContainerStyle={styles.row}>
            {suggested.map((r) => (
              <CommunityRoomCard key={r.id} room={r} onOpen={(room, from) => setRoom({ room, from })} />
            ))}
          </ScrollView>
        </View>
      </ScrollView>
      <CommunityRoomSheet room={room?.room} from={room?.from} onClose={() => setRoom(undefined)} />
    </View>
  );
}

/** L'ultima partita vista: larga, con il colore della fase e l'unico bottone giallo della pagina. */
function FeaturedGame({
  game,
  line,
  people,
  cta,
  onPress,
}: {
  game: Game;
  line: string;
  people: ReturnType<typeof useGameStore.getState>['players'];
  cta: string;
  onPress: () => void;
}) {
  const tone = TONE[game.status];
  const p = tilePaint(tone);
  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={`${game.name}. ${line}. ${cta}`}
      onPress={onPress}
      pressedScale={0.98}
      style={[styles.featured, tone === 'ended' && styles.hair]}>
      <TileArt tone={tone} id={`feat-${game.id}`} cx={185} cy={40} wide />
      <View style={styles.featTop}>
        <View style={styles.flex}>
          <AppText variant="micro" color={p.soft}>
            Ultima partita
          </AppText>
          <StatusBadge status={game.status} />
        </View>
        <Text style={styles.featEmoji} allowFontScaling={false}>
          {game.emoji}
        </Text>
      </View>
      <View style={styles.featText}>
        <AppText variant="title" color={p.ink} numberOfLines={2}>
          {game.name}
        </AppText>
        <AppText variant="body" color={p.soft} numberOfLines={1}>
          {line}
        </AppText>
      </View>
      <View style={styles.featFoot}>
        <AvatarStack players={people} size={28} max={5} />
        <Button label={cta} onPress={onPress} style={styles.featBtn} />
      </View>
    </PressableScale>
  );
}

function EntryTile({
  icon,
  title,
  note,
  strong,
  onPress,
}: {
  icon: 'plus' | 'ticket';
  title: string;
  note: string;
  strong?: boolean;
  onPress: () => void;
}) {
  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={`${title}. ${note}`}
      onPress={() => {
        haptics.tap();
        onPress();
      }}
      style={styles.entry}>
      <View style={[styles.entryIcon, strong && styles.entryIconStrong]}>
        <Icon name={icon} size={20} strokeWidth={strong ? 2.2 : 1.6} color={strong ? colors.inkInverse : colors.ink} />
      </View>
      <AppText variant="headline">{title}</AppText>
      <AppText variant="caption" color={colors.inkSoft} style={styles.regular}>
        {note}
      </AppText>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
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
  hello: { gap: 2, marginBottom: -space.sm },
  section: { gap: space.sm },
  bleed: { marginHorizontal: -layout.gutter, flexGrow: 0 },
  row: { gap: space.sm, paddingHorizontal: layout.gutter, paddingVertical: space.xs },
  extra: { marginTop: space.xxs },
  flex: { flex: 1, gap: 2 },
  regular: { fontWeight: '400' },
  bold: { fontWeight: '700' },
  hair: { borderWidth: StyleSheet.hairlineWidth, borderColor: colors.hairline },
  featured: { borderRadius: radius.xl, overflow: 'hidden', padding: space.lg, gap: space.md, minHeight: 236 },
  featTop: { flexDirection: 'row', alignItems: 'flex-start' },
  featEmoji: { fontSize: 64, lineHeight: 74 },
  featText: { gap: 2, flex: 1, justifyContent: 'flex-end' },
  featFoot: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space.sm },
  featBtn: { minWidth: 150, height: 48 },
  entries: { flexDirection: 'row', gap: space.sm },
  entry: { flex: 1, gap: 2, backgroundColor: colors.surface, borderRadius: radius.lg, padding: layout.card },
  entryIcon: {
    marginBottom: space.sm,
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  entryIconStrong: { backgroundColor: colors.ink, borderColor: colors.ink },
  book: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    borderRadius: radius.lg,
    overflow: 'hidden',
    padding: layout.card,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.hairline,
  },
  bookEmoji: { fontSize: 40, lineHeight: 48 },
});
