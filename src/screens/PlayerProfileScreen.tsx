import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useRef, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PlayerGameSection } from '@/components/game/PlayerGameSection';
import { SettingsPanel } from '@/components/profile/SettingsPanel';
import { CollectionSection } from '@/components/profile/CollectionSection';
import { MyPowersRow } from '@/components/game/MyPowersRow';
import { Icon } from '@/components/icons/Icon';
import { RuleSticker } from '@/components/illustrations/RuleSticker';
import { AppText } from '@/components/ui/AppText';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { PressableScale } from '@/components/ui/PressableScale';
import { Segmented } from '@/components/ui/Segmented';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { COLLECTION_VISIBILITY, ME } from '@/data/mock';
import { ruleById } from '@/data/rules';
import { haptics } from '@/lib/haptics';
import { useGameStore } from '@/store/useGameStore';
import { useSessionStore } from '@/store/useSessionStore';
import { useUiStore } from '@/store/useUiStore';
import { colors, MAX_APP_WIDTH, radius, space } from '@/theme/tokens';
import type { FriendStatus, Game, Player } from '@/types/game';

/** Scheda giocatore chiara, come il resto dell'app. */
const NAVY = colors.surface;
const NAVY_SOFT = colors.background;
const ON_NAVY_MUTED = colors.inkSoft;

/**
 * Profilo giocatore (modale): chi è, quanto vale, cosa vi lega.
 * Da qui si chiede l'amicizia e, tra amici, si crea una stanza insieme.
 * Aperto su di me mostra amici e richieste.
 */
export function PlayerProfileScreen() {
  const { playerId, gameId, focus } = useLocalSearchParams<{ playerId: string; gameId?: string; focus?: string }>();
  const scrollRef = useRef<ScrollView>(null);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const players = useGameStore((s) => s.players);
  const games = useGameStore((s) => s.games);
  const events = useGameStore((s) => s.events);
  const friendships = useGameStore((s) => s.friendships);
  const setFriendship = useGameStore((s) => s.setFriendship);
  const showToast = useUiStore((s) => s.showToast);

  const player = players.find((p) => p.id === playerId);
  const myVisibility = useSessionStore((s) => s.collectionVisibility);
  const isMe = player?.id === ME.id;
  const status: FriendStatus = (player && friendships[player.id]) ?? 'none';
  const visibility = isMe ? myVisibility : (COLLECTION_VISIBILITY[player?.id ?? ''] ?? 'private');
  const canSee = isMe || visibility === 'everyone' || (visibility === 'friends' && status === 'friends');

  const { shared, favorite } = useMemo(() => {
    if (!player) return { shared: [], favorite: undefined };
    const counts = new Map<string, number>();
    for (const e of events) {
      if (e.playerId === player.id && e.status === 'confirmed') counts.set(e.ruleId, (counts.get(e.ruleId) ?? 0) + 1);
    }
    const [topRule, times] = [...counts.entries()].sort((a, b) => b[1] - a[1])[0] ?? [];
    return {
      shared: games.filter((g) => g.playerIds.includes(player.id) && (isMe || g.playerIds.includes(ME.id))),
      favorite: topRule ? { rule: ruleById(topRule), times: times ?? 0 } : undefined,
    };
  }, [player, games, events, isMe]);

  // La partita da raccontare: quella da cui arrivo, altrimenti una in corso che abbiamo in comune
  const game =
    games.find((g) => g.id === gameId) ??
    (isMe ? undefined : shared.find((g) => g.status === 'live' && g.playerIds.includes(player?.id ?? '')));

  const close = () => (router.canGoBack() ? router.back() : router.replace('/'));
  if (!player) return null;

  const career = player.career;
  const change = (next: FriendStatus, text: string) => {
    const previous = status;
    haptics.bonus();
    setFriendship(player.id, next);
    showToast({ text, action: { label: 'Annulla', onPress: () => setFriendship(player.id, previous) } });
  };

  return (
    <ScrollView
      ref={scrollRef}
      style={styles.screen}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + space.md, paddingBottom: insets.bottom + space.xl },
      ]}>
      <View style={styles.head}>
        <AppText variant="serifHeading">{isMe ? 'Il tuo profilo' : 'Profilo'}</AppText>
        <View style={styles.headActions}>
          {isMe && (
            <PressableScale
              onPress={() => router.push('/settings')}
              style={styles.close}
              accessibilityRole="button"
              accessibilityLabel="Impostazioni">
              <Icon name="settings" size={18} color={colors.inkSoft} />
            </PressableScale>
          )}
          <PressableScale onPress={close} style={styles.close} accessibilityLabel="Chiudi">
            <Icon name="close" size={18} color={colors.inkSoft} strokeWidth={2} />
          </PressableScale>
        </View>
      </View>

      <View style={styles.hero}>
        <Avatar player={player} size={104} sticker={false} />
        <View style={styles.names}>
          <AppText variant="title" color={colors.ink}>
            {player.name}
          </AppText>
          <AppText variant="body" color={ON_NAVY_MUTED}>
            @{player.handle}
          </AppText>
          {game?.nicknames?.[player.id] ? (
            <AppText variant="caption" color={colors.inkSoft}>
              In {game.name} si fa chiamare «{game.nicknames[player.id]}»
            </AppText>
          ) : null}
        </View>
        {career && (
          <View style={styles.stats}>
            <Stat value={career.trophies} label={career.trophies === 1 ? 'trofeo' : 'trofei'} />
            <Stat value={career.gamesPlayed} label="partite" />
            <Stat value={career.totalPoints.toLocaleString('it-IT')} label="fantapunti" />
          </View>
        )}
        {!isMe && (
          <FriendAction
            player={player}
            status={status}
            onRequest={() => change('sent', `Richiesta inviata a ${player.name}`)}
            onCancel={() => change('none', 'Richiesta annullata')}
            onAccept={() => change('friends', `Tu e ${player.name} ora siete amici`)}
            onDecline={() => change('none', 'Richiesta rifiutata')}
          />
        )}
      </View>

      {game && !isMe && (
        <View
          style={styles.gameBlock}
          onLayout={(e) => {
            if (focus === 'formazione')
              scrollRef.current?.scrollTo({ y: e.nativeEvent.layout.y - space.md, animated: true });
          }}>
          <PlayerGameSection game={game} player={player} />
        </View>
      )}

      <CollectionSection player={player} isMe={isMe} visibility={visibility} canSee={canSee} />
      {isMe && <MyPowersRow />}
      {isMe ? (
        <MyFriends
          players={players}
          friendships={friendships}
          rooms={shared}
          onOpen={(id) => router.push({ pathname: '/player/[playerId]', params: { playerId: id } })}
          onOpenRoom={(id) => {
            haptics.tap();
            router.push({ pathname: '/game/[gameId]', params: { gameId: id } });
          }}
        />
      ) : (
        favorite?.rule && (
          <View style={styles.section}>
            <AppText variant="headline">Carta più chiamata</AppText>
            <View style={styles.favorite}>
              <RuleSticker rule={favorite.rule} size={72} />
              <View style={styles.flex}>
                <AppText variant="serifCard">{favorite.rule.label}</AppText>
                <AppText variant="caption" color={colors.inkSoft} style={styles.regular}>
                  {favorite.times === 1 ? 'Confermata una volta' : `Confermata ${favorite.times} volte`}
                </AppText>
              </View>
              <AppText variant="name" color={favorite.rule.points > 0 ? colors.bonus : colors.malus}>
                {favorite.rule.points > 0 ? `+${favorite.rule.points}` : favorite.rule.points}
              </AppText>
            </View>
          </View>
        )
      )}

      {!isMe && (
        <View style={styles.section}>
          <AppText variant="headline">Stanze in comune</AppText>
          {shared.length === 0 ? (
            <AppText variant="body" color={colors.inkSoft} style={styles.regular}>
              Nessuna stanza insieme, per ora.
            </AppText>
          ) : (
            shared.map((g) => (
              <PressableScale
                key={g.id}
                accessibilityRole="button"
                accessibilityLabel={`Apri ${g.name}`}
                onPress={() => {
                  haptics.tap();
                  router.push({ pathname: '/game/[gameId]', params: { gameId: g.id } });
                }}
                style={styles.row}>
                <AppText style={styles.rowEmoji}>{g.emoji}</AppText>
                <AppText variant="headline" style={styles.flex} numberOfLines={1}>
                  {g.name}
                </AppText>
                <StatusBadge status={g.status} size="sm" />
              </PressableScale>
            ))
          )}
        </View>
      )}
      {isMe && (
        <View style={styles.section}>
          <AppText variant="serifHeading">Impostazioni</AppText>
          <SettingsPanel />
        </View>
      )}
    </ScrollView>
  );
}

function Stat({ value, label }: { value: number | string; label: string }) {
  return (
    <View style={styles.stat}>
      <AppText variant="number" color={colors.ink}>
        {value}
      </AppText>
      <AppText variant="caption" color={ON_NAVY_MUTED}>
        {label}
      </AppText>
    </View>
  );
}

interface FriendActionProps {
  player: Player;
  status: FriendStatus;
  onRequest: () => void;
  onCancel: () => void;
  onAccept: () => void;
  onDecline: () => void;
}

/** Un solo passo alla volta: chiedi → in attesa → amici → giocate insieme. */
function FriendAction({ player, status, onRequest, onCancel, onAccept, onDecline }: FriendActionProps) {
  if (status === 'received') {
    return (
      <View style={styles.action}>
        <AppText variant="caption" color={ON_NAVY_MUTED} style={styles.centerText}>
          {player.name} ti ha chiesto l'amicizia
        </AppText>
        <Button label="Accetta" onPress={onAccept} />
        <PressableScale accessibilityRole="button" onPress={onDecline} hitSlop={8} style={styles.link}>
          <AppText variant="caption" color={ON_NAVY_MUTED}>
            Rifiuta
          </AppText>
        </PressableScale>
      </View>
    );
  }
  if (status === 'sent') {
    return (
      <View style={styles.action}>
        <View style={styles.pending}>
          <Icon name="clock" size={18} color={colors.ink} />
          <AppText variant="headline" color={colors.ink}>
            Richiesta inviata
          </AppText>
        </View>
        <PressableScale accessibilityRole="button" onPress={onCancel} hitSlop={8} style={styles.link}>
          <AppText variant="caption" color={ON_NAVY_MUTED}>
            Annulla richiesta
          </AppText>
        </PressableScale>
      </View>
    );
  }
  if (status === 'friends') {
    return (
      <View style={styles.action}>
        <View style={styles.friendsTag}>
          <Icon name="check" size={14} color={colors.bonusBright} strokeWidth={3} />
          <AppText variant="micro" color={colors.ink}>
            Amici
          </AppText>
        </View>
      </View>
    );
  }
  return (
    <View style={styles.action}>
      <Button label="Chiedi l'amicizia" onPress={onRequest} />
    </View>
  );
}

type SocialTab = 'friends' | 'requests' | 'sent' | 'rooms';

/** Amici, richieste e stanze in un'unica sezione a schede: si sceglie, non si scorre. */
function MyFriends({
  players,
  friendships,
  rooms,
  onOpen,
  onOpenRoom,
}: {
  players: Player[];
  friendships: Record<string, FriendStatus>;
  rooms: Game[];
  onOpen: (id: string) => void;
  onOpenRoom: (id: string) => void;
}) {
  const by = (s: FriendStatus) => players.filter((p) => friendships[p.id] === s);
  const requests = by('received');
  const [tab, setTab] = useState<SocialTab>(requests.length ? 'requests' : 'friends');
  const lists: Record<Exclude<SocialTab, 'rooms'>, { list: Player[]; note: string; empty: string }> = {
    friends: { list: by('friends'), note: 'amico', empty: 'Ancora nessun amico.' },
    requests: { list: requests, note: 'vuole essere tuo amico', empty: 'Nessuna richiesta.' },
    sent: { list: by('sent'), note: 'richiesta inviata', empty: 'Nessuna richiesta in attesa.' },
  };
  return (
    <View style={styles.section}>
      <Segmented
        value={tab}
        onChange={setTab}
        options={[
          { id: 'friends', label: `Amici ${lists.friends.list.length}` },
          { id: 'requests', label: `Richieste ${requests.length}` },
          { id: 'sent', label: 'In attesa' },
          { id: 'rooms', label: 'Stanze' },
        ]}
      />
      {tab === 'rooms' ? (
        rooms.map((g) => (
          <PressableScale
            key={g.id}
            accessibilityRole="button"
            accessibilityLabel={`Apri ${g.name}`}
            onPress={() => onOpenRoom(g.id)}
            style={styles.row}>
            <AppText style={styles.rowEmoji}>{g.emoji}</AppText>
            <AppText variant="headline" style={styles.flex} numberOfLines={1}>
              {g.name}
            </AppText>
            <StatusBadge status={g.status} size="sm" />
          </PressableScale>
        ))
      ) : lists[tab].list.length === 0 ? (
        <AppText variant="body" color={colors.inkSoft} style={styles.regular}>
          {lists[tab].empty}
        </AppText>
      ) : (
        lists[tab].list.map((p) => (
          <PressableScale
            key={p.id}
            accessibilityRole="button"
            accessibilityLabel={`Profilo di ${p.name}`}
            onPress={() => {
              haptics.tap();
              onOpen(p.id);
            }}
            style={styles.row}>
            <Avatar player={p} size={40} sticker={false} />
            <View style={styles.flex}>
              <AppText variant="name">{p.name}</AppText>
              <AppText variant="caption" color={colors.inkSoft} style={styles.regular}>
                {lists[tab].note}
              </AppText>
            </View>
            <Icon name="chevron-right" size={20} color={colors.inkFaint} />
          </PressableScale>
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  gameBlock: { gap: space.lg },
  headActions: { flexDirection: 'row', gap: space.xs },
  screen: { flex: 1, backgroundColor: colors.background },
  content: {
    paddingHorizontal: space.md,
    gap: space.lg,
    width: '100%',
    maxWidth: MAX_APP_WIDTH,
    alignSelf: 'center',
  },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  close: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hero: {
    backgroundColor: NAVY,
    borderRadius: radius.xl,
    paddingVertical: space.lg,
    paddingHorizontal: space.md,
    alignItems: 'center',
    gap: space.md,
  },
  names: { alignItems: 'center', gap: 2 },
  stats: { flexDirection: 'row', gap: space.xs, alignSelf: 'stretch' },
  stat: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: NAVY_SOFT,
    borderRadius: radius.md,
    paddingVertical: space.sm,
  },
  action: { alignSelf: 'stretch', gap: space.sm, alignItems: 'stretch' },
  centerText: { textAlign: 'center' },
  pending: {
    height: 60,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.xs,
  },
  link: { alignSelf: 'center' },
  friendsTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'center',
    backgroundColor: NAVY_SOFT,
    borderRadius: radius.pill,
    paddingHorizontal: space.sm,
    paddingVertical: 4,
  },
  section: { gap: space.sm },
  favorite: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: space.sm,
    paddingRight: space.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: space.md,
  },
  rowEmoji: { fontSize: 24, lineHeight: 30 },
  flex: { flex: 1, gap: 2 },
  regular: { fontWeight: '400' },
});
