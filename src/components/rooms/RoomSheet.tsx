import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';

import type { CardRect } from '@/components/cards/PlayCard';
import { RoomKind } from '@/components/rooms/RoomCard';
import { AppText } from '@/components/ui/AppText';
import { ActionRow, type RowAction } from '@/components/ui/ActionRow';
import { Avatar } from '@/components/ui/Avatar';
import { ObjectModal, SheetClose } from '@/components/ui/ObjectModal';
import { TileArt, tilePaint, type TileTone } from '@/components/ui/RoomArt';
import { space } from '@/theme/tokens';

export type RoomInfo = {
  id: string;
  emoji: string;
  title: string;
  tone: TileTone;
  status: string;
  host?: { name: string; color: string };
  /** Tre numeri al massimo: giocatori, posti, chiamate */
  stats: { value: string; label: string }[];
  deck?: string;
  description?: string;
};

/**
 * Stanza aperta: stesso pop up della carta (cresce dalla card, X in alto, secondaria a sinistra,
 * primaria gialla a destra) ma con la forma della stanza: fondo del suo stato, host, numeri.
 */
export function RoomSheet({
  room,
  from,
  primary,
  secondary,
  onClose,
}: {
  room?: RoomInfo;
  from?: CardRect;
  primary: RowAction;
  secondary?: RowAction;
  onClose: () => void;
}) {
  const { width } = useWindowDimensions();
  const w = Math.min(380, width - 32);
  return (
    <ObjectModal
      visible={!!room}
      resetKey={room?.id}
      from={from}
      width={w}
      height={w * 1.12}
      closeLabel="Chiudi la stanza"
      onClose={onClose}>
      {(close) => {
        if (!room) return null;
        const p = tilePaint(room.tone);
        const dark = p.ink === '#FFFFFF';
        const run = (a: RowAction) => () => {
          a.onPress();
          close();
        };
        return (
          <View style={styles.card}>
            <TileArt tone={room.tone} id={`sheet-${room.id}`} cx={50} cy={36} />
            <View style={styles.top}>
              <RoomKind tone={room.tone} status={room.status} onDark={dark} />
              <SheetClose onPress={close} ink={p.ink} onDark={dark} />
            </View>
            <View style={styles.art}>
              <Text style={styles.emoji} allowFontScaling={false}>
                {room.emoji}
              </Text>
            </View>
            <View style={styles.titleBlock}>
              <AppText variant="headline" color={p.ink} style={styles.title} numberOfLines={2}>
                {room.title}
              </AppText>
              {room.host ? (
                <View style={styles.host}>
                  <Avatar player={room.host} size={20} sticker={false} />
                  <AppText variant="caption" color={p.soft} style={styles.hostText}>
                    Host: {room.host.name}
                  </AppText>
                </View>
              ) : null}
            </View>
            <View
              style={[styles.stats, { backgroundColor: dark ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.65)' }]}>
              {room.stats.map((s) => (
                <View key={s.label} style={styles.stat}>
                  <AppText variant="headline" color={p.ink} style={styles.bold}>
                    {s.value}
                  </AppText>
                  <AppText variant="micro" color={p.soft}>
                    {s.label}
                  </AppText>
                </View>
              ))}
            </View>
            {room.description || room.deck ? (
              <AppText variant="caption" color={p.soft} numberOfLines={2} style={styles.regular}>
                {[room.deck, room.description].filter(Boolean).join(' · ')}
              </AppText>
            ) : null}
            <ActionRow
              onDark={dark}
              secondary={secondary && { ...secondary, onPress: run(secondary) }}
              primary={{ ...primary, onPress: run(primary) }}
            />
          </View>
        );
      }}
    </ObjectModal>
  );
}

const styles = StyleSheet.create({
  card: { flex: 1, borderRadius: 28, overflow: 'hidden', padding: space.md, gap: space.xs },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  art: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emoji: { fontSize: 84, lineHeight: 100 },
  titleBlock: { gap: 4 },
  title: { fontSize: 24, lineHeight: 28, fontWeight: '700' },
  host: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  hostText: { fontWeight: '500' },
  stats: { flexDirection: 'row', borderRadius: 16, paddingVertical: space.xs },
  stat: { flex: 1, alignItems: 'center' },
  bold: { fontWeight: '700' },
  regular: { fontWeight: '400' },
});
