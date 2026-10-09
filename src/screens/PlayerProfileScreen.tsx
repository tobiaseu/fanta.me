import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MyPowersRow } from '@/components/game/MyPowersRow';
import { Icon } from '@/components/icons/Icon';
import { RuleSticker } from '@/components/illustrations/RuleSticker';
import { AppText } from '@/components/ui/AppText';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { PressableScale } from '@/components/ui/PressableScale';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ME } from '@/data/mock';
import { ruleById } from '@/data/rules';
import { haptics } from '@/lib/haptics';
import { useGameStore } from '@/store/useGameStore';
import { useSessionStore } from '@/store/useSessionStore';
import { useUiStore } from '@/store/useUiStore';
import { colors, MAX_APP_WIDTH, radius, space } from '@/theme/tokens';
import type { FriendStatus, Player } from '@/types/game';

/** Blu notte della scheda giocatore (ispirazione "Pinna"). */
const NAVY = '#1E2836';
const NAVY_SOFT = '#2D3949';
const ON_NAVY_MUTED = 'rgba(255, 255, 255, 0.6)';

/**
 * Profilo giocatore (modale): chi è, quanto vale, cosa vi lega.
 * Da qui si chiede l'amicizia e, tra amici, si crea una stanza insieme.
 * Aperto su di me mostra amici e richieste.
 */
export function PlayerProfileScreen() {
  const { playerId } = useLocalSearchParams<{ playerId: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const players = useGameStore((s) => s.players);
  const games = useGameStore((s) => s.games);
  const events = useGameStore((s) => s.events);
  const friendships = useGameStore((s) => s.friendships);
  const setFriendship = useGameStore((s) => s.setFriendship);
  const showToast = useUiStore((s) => s.showToast);

  const player = players.find((p) => p.id === playerId);
  const isMe = player?.id === ME.id;
  const status: FriendStatus = (player && friendships[player.id]) ?? 'none';

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
      style={styles.screen}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + space.md, paddingBottom: insets.bottom + space.xl },
      ]}>
      <View style={styles.head}>
        <AppText variant="title">{isMe ? 'Il tuo profilo' : 'Profilo'}</AppText>
        <PressableScale onPress={close} style={styles.close} accessibilityLabel="Chiudi">
          <Icon name="close" size={18} color={colors.inkSoft} strokeWidth={2} />
        </PressableScale>
      </View>

      <View style={styles.hero}>
        <Avatar player={player} size={104} sticker={false} />
        <View style={styles.names}>
          <AppText variant="title" color={colors.inkInverse}>
            {player.name}
          </AppText>
          <AppText variant="body" color={ON_NAVY_MUTED}>
            @{player.handle}
          </AppText>
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
            onCreateRoom={() => router.push({ pathname: '/room/new', params: { invite: player.id } })}
          />
        )}
      </View>

      {isMe && <MyPowersRow />}
      {isMe ? (
        <MyFriends
          players={players}
          friendships={friendships}
          onOpen={(id) => router.push({ pathname: '/player/[playerId]', params: { playerId: id } })}
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

      <View style={styles.section}>
        <AppText variant="headline">{isMe ? 'Le tue stanze' : 'Stanze in comune'}</AppText>
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
      {isMe && (
        <PressableScale
          accessibilityRole="button"
          hitSlop={8}
          style={styles.signOut}
          onPress={() => {
            haptics.tap();
            useSessionStore.getState().signOut();
            if (router.canDismiss()) router.dismissAll();
            router.replace('/welcome');
          }}>
          <AppText variant="caption" color={colors.malus}>
            Esci
          </AppText>
        </PressableScale>
      )}
    </ScrollView>
  );
}

function Stat({ value, label }: { value: number | string; label: string }) {
  return (
    <View style={styles.stat}>
      <AppText variant="number" color={colors.inkInverse}>
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
  onCreateRoom: () => void;
}

/** Un solo passo alla volta: chiedi → in attesa → amici → giocate insieme. */
function FriendAction({ player, status, onRequest, onCancel, onAccept, onDecline, onCreateRoom }: FriendActionProps) {
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
          <Icon name="clock" size={18} color={colors.inkInverse} />
          <AppText variant="headline" color={colors.inkInverse}>
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
          <AppText variant="micro" color={colors.inkInverse}>
            Amici
          </AppText>
        </View>
        <Button label="Crea una stanza insieme" onPress={onCreateRoom} />
      </View>
    );
  }
  return (
    <View style={styles.action}>
      <Button label="Chiedi l'amicizia" onPress={onRequest} />
    </View>
  );
}

function MyFriends({
  players,
  friendships,
  onOpen,
}: {
  players: Player[];
  friendships: Record<string, FriendStatus>;
  onOpen: (id: string) => void;
}) {
  const by = (s: FriendStatus) => players.filter((p) => friendships[p.id] === s);
  const groups: { title: string; list: Player[]; note: string }[] = [
    { title: 'Richieste per te', list: by('received'), note: 'vuole essere tuo amico' },
    { title: 'Amici', list: by('friends'), note: 'tocca per creare una stanza insieme' },
    { title: 'In attesa di risposta', list: by('sent'), note: 'richiesta inviata' },
  ];
  return (
    <>
      {groups
        .filter((g) => g.list.length > 0)
        .map((g) => (
          <View key={g.title} style={styles.section}>
            <AppText variant="headline">
              {g.title} ({g.list.length})
            </AppText>
            {g.list.map((p) => (
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
                    {g.note}
                  </AppText>
                </View>
                <Icon name="chevron-right" size={20} color={colors.inkFaint} />
              </PressableScale>
            ))}
          </View>
        ))}
    </>
  );
}

const styles = StyleSheet.create({
  signOut: { alignSelf: 'center', paddingVertical: space.sm },
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
    borderColor: 'rgba(255, 255, 255, 0.25)',
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
