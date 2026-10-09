import { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { SlideInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/icons/Icon';
import { RuleSticker } from '@/components/illustrations/RuleSticker';
import { AppText } from '@/components/ui/AppText';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { PressableScale } from '@/components/ui/PressableScale';
import { RULES } from '@/data/rules';
import { haptics } from '@/lib/haptics';
import { useGameStore } from '@/store/useGameStore';
import { useUiStore } from '@/store/useUiStore';
import { colors, MAX_APP_WIDTH, radius, space } from '@/theme/tokens';
import type { Game, RuleKind } from '@/types/game';

/**
 * Aggiungi punti (Bottom Sheet): chi → quale carta → chiama.
 * Tre tocchi, zero tastiera. La chiamata finisce nelle storie del Feed e diventa
 * ufficiale quando il gruppo la conferma.
 */
export function QuickActionSheet({ game }: { game: Game }) {
  const open = useUiStore((s) => s.quickActionOpen);
  const close = useUiStore((s) => s.closeQuickAction);

  return (
    <Modal visible={open} transparent animationType="fade" onRequestClose={close} statusBarTranslucent>
      <Pressable style={styles.backdrop} onPress={close} accessibilityLabel="Chiudi" />
      {open && <SheetBody game={game} onDone={close} />}
    </Modal>
  );
}

function SheetBody({ game, onDone }: { game: Game; onDone: () => void }) {
  const insets = useSafeAreaInsets();
  const allPlayers = useGameStore((s) => s.players);
  const players = useMemo(() => allPlayers.filter((p) => game.playerIds.includes(p.id)), [allPlayers, game.playerIds]);
  const assignPoints = useGameStore((s) => s.assignPoints);
  const restoreEvent = useGameStore((s) => s.restoreEvent);
  const showToast = useUiStore((s) => s.showToast);

  const [playerId, setPlayerId] = useState<string>();
  const [kind, setKind] = useState<RuleKind>('bonus');
  const [ruleId, setRuleId] = useState<string>();

  const rules = RULES.filter(
    (r) => game.ruleIds.includes(r.id) && (kind === 'bonus' ? r.points > 0 : r.points < 0),
  );
  const rule = RULES.find((r) => r.id === ruleId);
  const player = players.find((p) => p.id === playerId);

  const confirm = () => {
    if (!player || !rule) return;
    const event = assignPoints({ gameId: game.id, playerId: player.id, ruleId: rule.id });
    if (rule.points > 0) haptics.bonus();
    else haptics.malus();
    onDone();
    if (event) {
      showToast({
        text: `Chiamata inviata: ${rule.label} su ${player.name}`,
        action: { label: 'Annulla', onPress: () => restoreEvent(undefined, event.id) },
      });
    }
  };

  return (
    <View style={styles.anchor} pointerEvents="box-none">
      <Animated.View
        entering={SlideInDown.springify().damping(20).stiffness(180)}
        style={[styles.sheet, { paddingBottom: insets.bottom + space.md }]}>
        <View style={styles.grabber} />
        <View style={styles.head}>
          <AppText variant="title">Aggiungi punti</AppText>
          <PressableScale onPress={onDone} style={styles.close} accessibilityLabel="Chiudi">
            <Icon name="close" size={18} color={colors.inkSoft} strokeWidth={2} />
          </PressableScale>
        </View>

        <AppText variant="caption" color={colors.inkSoft}>
          1 · Chi?
        </AppText>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.noShrink} contentContainerStyle={styles.players}>
          {players.map((p) => {
            const selected = p.id === playerId;
            return (
              <Pressable
                key={p.id}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                onPress={() => {
                  haptics.tap();
                  setPlayerId(p.id);
                }}
                style={styles.player}>
                <View style={[styles.ring, selected && styles.ringActive]}>
                  <Avatar player={p} size={52} sticker={false} />
                </View>
                <AppText variant="micro" color={selected ? colors.ink : colors.inkSoft}>
                  {p.name}
                </AppText>
              </Pressable>
            );
          })}
        </ScrollView>

        <AppText variant="caption" color={colors.inkSoft}>
          2 · Quale carta?
        </AppText>
        <View style={styles.segment}>
          {(['bonus', 'malus'] as const).map((k) => (
            <Pressable
              key={k}
              onPress={() => {
                haptics.tap();
                setKind(k);
                setRuleId(undefined);
              }}
              style={[styles.segmentItem, kind === k && styles.segmentActive]}>
              <AppText variant="headline" color={kind === k ? (k === 'bonus' ? colors.bonus : colors.malus) : colors.inkFaint}>
                {k === 'bonus' ? 'Bonus' : 'Malus'}
              </AppText>
            </Pressable>
          ))}
        </View>
        <ScrollView style={styles.rulesScroll} contentContainerStyle={styles.rules}>
          {rules.map((r) => {
            const selected = r.id === ruleId;
            const isBonus = r.points > 0;
            return (
              <Pressable
                key={r.id}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                onPress={() => {
                  haptics.tap();
                  setRuleId(r.id);
                }}
                style={[
                  styles.rule,
                  selected && {
                    borderColor: isBonus ? colors.bonusBorder : colors.malusBorder,
                    backgroundColor: isBonus ? colors.bonusSoft : colors.malusSoft,
                  },
                ]}>
                <RuleSticker rule={r} size={44} />
                <View style={styles.flex}>
                  <AppText variant="serifCard">{r.label}</AppText>
                  <AppText variant="caption" color={colors.inkSoft} numberOfLines={1} style={styles.regular}>
                    {r.description}
                  </AppText>
                </View>
                <AppText variant="name" color={isBonus ? colors.bonus : colors.malus}>
                  {isBonus ? `+${r.points}` : r.points}
                </AppText>
              </Pressable>
            );
          })}
        </ScrollView>

        <Button
          disabled={!player || !rule}
          onPress={confirm}
          label={
            player && rule
              ? `Chiama ${rule.points > 0 ? '+' : ''}${rule.points} su ${player.name}`
              : 'Scegli giocatore e carta'
          }
        />
        <AppText variant="micro" color={colors.inkFaint} style={styles.hint}>
          Diventa ufficiale quando il gruppo la conferma.
        </AppText>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(0, 0, 0, 0.3)' },
  anchor: { flex: 1, justifyContent: 'flex-end', alignItems: 'center' },
  sheet: {
    width: '100%',
    maxWidth: MAX_APP_WIDTH,
    maxHeight: '90%',
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.bar,
    borderTopRightRadius: radius.bar,
    paddingHorizontal: space.md,
    paddingTop: space.sm,
    gap: space.sm,
  },
  grabber: {
    alignSelf: 'center',
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.placeholder,
    marginBottom: space.xs,
  },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  close: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noShrink: { flexGrow: 0, flexShrink: 0 },
  players: { gap: space.md, paddingVertical: space.xxs },
  player: { alignItems: 'center', gap: space.xxs },
  ring: { padding: 3, borderRadius: 32, borderWidth: 3, borderColor: 'transparent' },
  ringActive: { borderColor: colors.cta },
  segment: { flexDirection: 'row', backgroundColor: colors.surfaceMuted, borderRadius: radius.md + 4, padding: 4 },
  segmentItem: { flex: 1, alignItems: 'center', paddingVertical: space.xs + 2, borderRadius: radius.md },
  segmentActive: { backgroundColor: colors.surface },
  rulesScroll: { flexShrink: 1 },
  rules: { gap: space.xs },
  rule: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    paddingLeft: space.xs,
    paddingRight: space.md,
    paddingVertical: space.sm,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  flex: { flex: 1, gap: 2 },
  regular: { fontWeight: '400' },
  hint: { textAlign: 'center', fontWeight: '500' },
});
