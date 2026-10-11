import { StyleSheet, View } from 'react-native';

import type { CardRect } from '@/components/cards/PlayCard';
import { RoomCard } from '@/components/rooms/RoomCard';
import { RoomSheet, type RoomInfo } from '@/components/rooms/RoomSheet';
import { AppText } from '@/components/ui/AppText';
import { COMMUNITY_DECKS, type CommunityRoom } from '@/data/community';
import { haptics } from '@/lib/haptics';
import { useUiStore } from '@/store/useUiStore';
import { colors } from '@/theme/tokens';

const infoOf = (r: CommunityRoom): RoomInfo => ({
  id: r.id,
  emoji: r.emoji,
  title: r.name,
  tone: r.status === 'live' ? 'live' : 'waiting',
  status: r.status === 'live' ? 'In corso' : 'Parte presto',
  host: r.host,
  stats: [
    { value: String(r.players), label: 'giocatori' },
    { value: String(r.open), label: r.open === 1 ? 'posto libero' : 'posti liberi' },
    { value: r.status === 'live' ? String(r.calls24h) : '–', label: 'chiamate oggi' },
  ],
  deck: COMMUNITY_DECKS.find((d) => d.id === r.deckId)?.name,
  description: r.occasion,
});

function useJoin() {
  const showToast = useUiStore((s) => s.showToast);
  return (r: CommunityRoom) => {
    haptics.bonus();
    showToast({ text: `Richiesta inviata a ${r.host.name}: ti avvisiamo quando ti fa entrare` });
  };
}

/** Una stanza pubblica della community: card orizzontale con "Partecipa"; il tocco sulla card apre il pop up. */
export function CommunityRoomCard({
  room,
  width,
  onOpen,
}: {
  room: CommunityRoom;
  width?: number | `${number}%`;
  onOpen: (r: CommunityRoom, from?: CardRect) => void;
}) {
  const join = useJoin();
  const live = room.status === 'live';
  return (
    <RoomCard
      id={`room-${room.id}`}
      emoji={room.emoji}
      title={room.name}
      subtitle={`${room.players} giocatori · ${room.open} ${room.open === 1 ? 'posto libero' : 'posti liberi'}`}
      status={live ? 'In corso' : 'Parte presto'}
      tone={live ? 'live' : 'waiting'}
      extra={
        <View>
          <AppText variant="micro" color={live ? colors.live : colors.inkSoft} style={styles.meta} numberOfLines={1}>
            {live ? `${room.calls24h} chiamate` : `di ${room.host.name}`}
          </AppText>
        </View>
      }
      cta="Partecipa"
      onCta={() => join(room)}
      onOpen={(from) => onOpen(room, from)}
      width={width}
    />
  );
}

/** Il pop up della stanza pubblica: numeri, host e mazzo; primaria "Chiedi di entrare". */
export function CommunityRoomSheet({
  room,
  from,
  onClose,
}: {
  room?: CommunityRoom;
  from?: CardRect;
  onClose: () => void;
}) {
  const join = useJoin();
  const showToast = useUiStore((s) => s.showToast);
  return (
    <RoomSheet
      room={room && infoOf(room)}
      from={from}
      primary={{ label: 'Partecipa', onPress: () => room && join(room) }}
      secondary={{
        label: 'Condividi',
        onPress: () => showToast({ text: 'Link della stanza copiato' }),
      }}
      onClose={onClose}
    />
  );
}

const styles = StyleSheet.create({
  meta: { fontWeight: '700' },
});
