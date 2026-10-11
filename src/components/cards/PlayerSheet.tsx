import { StyleSheet, View, useWindowDimensions } from 'react-native';

import type { CardState } from '@/components/cards/CardSheet';
import { Icon } from '@/components/icons/Icon';
import { AppText } from '@/components/ui/AppText';
import { Avatar } from '@/components/ui/Avatar';
import { ActionRow, CardGlow } from '@/components/ui/ActionRow';
import { Button } from '@/components/ui/Button';
import { ObjectModal, SheetClose } from '@/components/ui/ObjectModal';
import type { CardRect } from '@/components/cards/PlayCard';
import { colors, space } from '@/theme/tokens';
import type { Player } from '@/types/game';

type Action = { label: string; onPress: () => void };

/**
 * Carta giocatore aperta: stessa grammatica della carta del mazzo.
 * Carta, riga di stato, azione principale (gialla), alternativa, link al profilo.
 */
export function PlayerSheet({
  player,
  name,
  handle,
  state,
  primary,
  secondary,
  onProfile,
  from,
  onClose,
}: {
  player?: Player;
  name: string;
  handle?: string;
  state?: CardState;
  primary?: Action;
  secondary?: Action;
  onProfile?: () => void;
  from?: CardRect;
  onClose: () => void;
}) {
  const { width } = useWindowDimensions();
  const w = Math.min(340, width - 32);
  return (
    <ObjectModal
      visible={!!player}
      resetKey={player?.id}
      from={from}
      width={w}
      height={w / (63 / 88)}
      closeLabel="Chiudi"
      onClose={onClose}>
      {(close) => {
        if (!player) return null;
        const run = (a: Action) => () => {
          a.onPress();
          close();
        };
        return (
          <View style={styles.card}>
            <CardGlow id={`p-${player.id}`} cy={50} />
            <View style={styles.top}>
              <View style={styles.kind}>
                <AppText variant="micro" color={colors.inkSoft} style={styles.bold}>
                  Giocatore
                </AppText>
              </View>
              <SheetClose onPress={close} ink={colors.ink} onDark={false} />
            </View>
            <View style={styles.art}>
              <Avatar player={player} size={120} sticker={false} />
            </View>
            <View>
              <AppText variant="headline" style={styles.title} numberOfLines={1}>
                {name}
              </AppText>
              {handle ? (
                <AppText variant="caption" color={colors.inkSoft} style={styles.regular}>
                  @{handle}
                </AppText>
              ) : null}
            </View>
            {state ? (
              <View style={styles.state}>
                {state.tone && state.tone !== 'neutral' ? (
                  <Icon
                    name={state.tone === 'locked' ? 'lock' : 'check'}
                    size={12}
                    color={state.tone === 'ok' ? colors.bonus : colors.inkSoft}
                  />
                ) : null}
                <AppText variant="micro" color={colors.inkSoft} style={styles.flexText}>
                  {state.text}
                </AppText>
              </View>
            ) : null}
            {primary || secondary ? (
              <ActionRow
                primary={primary && { label: primary.label, onPress: run(primary) }}
                secondary={secondary && { label: secondary.label, onPress: run(secondary) }}
              />
            ) : null}
            {onProfile && (
              <Button
                label="Vedi il profilo"
                variant={primary || secondary ? 'tertiary' : 'secondary'}
                onPress={run({ label: '', onPress: onProfile })}
                style={styles.link}
              />
            )}
          </View>
        );
      }}
    </ObjectModal>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 28,
    overflow: 'hidden',
    padding: space.md,
    gap: space.xs,
  },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  kind: {
    height: 26,
    paddingHorizontal: space.sm,
    borderRadius: 13,
    backgroundColor: 'rgba(0,0,0,0.06)',
    justifyContent: 'center',
  },
  art: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 24, lineHeight: 28, fontWeight: '700' },
  state: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  flexText: { flexShrink: 1 },
  link: { height: 36 },
  bold: { fontWeight: '700' },
  regular: { fontWeight: '400' },
});
