import { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { SlideInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/icons/Icon';
import { AppText } from '@/components/ui/AppText';
import { Avatar } from '@/components/ui/Avatar';
import { PressableScale } from '@/components/ui/PressableScale';
import { RULES } from '@/data/rules';
import { haptics } from '@/lib/haptics';
import { useGameStore } from '@/store/useGameStore';
import { useUiStore } from '@/store/useUiStore';
import { colors, MAX_APP_WIDTH, radius, space } from '@/theme/tokens';
import type { Game, RuleKind } from '@/types/game';

/**
 * Azione Veloce (Bottom Sheet): chi → cosa → conferma.
 * Tre tocchi, zero tastiera: assegnare punti deve essere più veloce che raccontarlo.
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

  const [playerId, setPlayerId] = useState<string>();
  const [kind, setKind] = useState<RuleKind>('bonus');
  const [ruleId, setRuleId] = useState<string>();

  const rules = RULES.filter(
    (r) => game.ruleIds.includes(r.id) && (kind === 'bonus' ? r.points > 0 : r.points < 0),
  );
  const rule = RULES.find((r) => r.id === ruleId);
  const ready = Boolean(playerId && rule);

  const confirm = () => {
    if (!playerId || !rule) return;
    assignPoints({ gameId: game.id, playerId, ruleId: rule.id });
    if (rule.points > 0) haptics.bonus();
    else haptics.malus();
    onDone();
  };

  return (
    <View style={styles.anchor} pointerEvents="box-none">
      <Animated.View
        entering={SlideInDown.springify().damping(20).stiffness(180)}
        style={[styles.sheet, { paddingBottom: insets.bottom + space.md }]}>
        <View style={styles.grabber} />
        <View style={styles.head}>
          <AppText variant="title">Azione veloce ⚡️</AppText>
          <PressableScale onPress={onDone} style={styles.close} accessibilityLabel="Chiudi">
            <Icon name="close" size={18} color={colors.inkSoft} />
          </PressableScale>
        </View>

        <AppText variant="micro" color={colors.inkMuted}>
          1 · Chi?
        </AppText>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.noShrink}
          contentContainerStyle={styles.players}>
          {players.map((p) => {
            const selected = p.id === playerId;
            return (
              <Pressable
                key={p.id}
                onPress={() => {
                  haptics.tap();
                  setPlayerId(p.id);
                }}
                style={[styles.player, selected && styles.playerSelected]}>
                <Avatar player={p} size={48} />
                <AppText variant="caption" color={selected ? colors.ink : colors.inkMuted}>
                  {p.name}
                </AppText>
              </Pressable>
            );
          })}
        </ScrollView>

        <AppText variant="micro" color={colors.inkMuted}>
          2 · Cosa ha fatto?
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
              <AppText variant="headline" color={kind === k ? (k === 'bonus' ? colors.bonus : colors.malus) : colors.inkMuted}>
                {k === 'bonus' ? '＋ Bonus' : '－ Malus'}
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
                onPress={() => {
                  haptics.tap();
                  setRuleId(r.id);
                }}
                style={[
                  styles.rule,
                  selected && { borderColor: isBonus ? colors.bonus : colors.malus, backgroundColor: isBonus ? colors.bonusSoft : colors.malusSoft },
                ]}>
                <AppText variant="body" style={styles.ruleLabel} numberOfLines={2}>
                  {r.label}
                </AppText>
                <AppText variant="headline" color={isBonus ? colors.bonus : colors.malus}>
                  {isBonus ? `+${r.points}` : r.points}
                </AppText>
              </Pressable>
            );
          })}
        </ScrollView>

        <PressableScale
          disabled={!ready}
          onPress={confirm}
          accessibilityRole="button"
          style={[styles.cta, !ready && styles.ctaDisabled]}>
          <AppText variant="headline" color={ready ? colors.ctaInk : colors.inkMuted}>
            {ready && rule
              ? `Assegna ${rule.points > 0 ? '+' : ''}${rule.points} a ${players.find((p) => p.id === playerId)?.name}`
              : 'Scegli giocatore e azione'}
          </AppText>
        </PressableScale>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(28, 28, 30, 0.35)' },
  anchor: { flex: 1, justifyContent: 'flex-end', alignItems: 'center' },
  sheet: {
    width: '100%',
    maxWidth: MAX_APP_WIDTH,
    maxHeight: '88%',
    backgroundColor: colors.background,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: space.lg,
    paddingTop: space.sm,
    gap: space.sm,
  },
  grabber: {
    alignSelf: 'center',
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.surfaceMuted,
    marginBottom: space.xs,
  },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: space.xs },
  close: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noShrink: { flexGrow: 0, flexShrink: 0 },
  players: { gap: space.sm, paddingBottom: space.xs },
  player: {
    alignItems: 'center',
    gap: space.xxs,
    padding: space.xs,
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  playerSelected: { borderColor: colors.cta, backgroundColor: colors.surface },
  segment: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.pill,
    padding: 4,
  },
  segmentItem: { flex: 1, alignItems: 'center', paddingVertical: space.xs, borderRadius: radius.pill },
  segmentActive: { backgroundColor: colors.surface },
  rulesScroll: { flexShrink: 1 },
  rules: { gap: space.xs },
  rule: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  ruleLabel: { flex: 1 },
  cta: {
    marginTop: space.xs,
    height: 56,
    borderRadius: radius.pill,
    backgroundColor: colors.cta,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaDisabled: { backgroundColor: colors.surfaceMuted },
});
