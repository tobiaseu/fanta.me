import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useRef, useState, type ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { FadeInUp, LinearTransition, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CardSheet } from '@/components/cards/CardSheet';
import { DeckCard, EmptySlot } from '@/components/cards/DeckCard';
import { Icon } from '@/components/icons/Icon';
import { AppText } from '@/components/ui/AppText';
import { PressableScale } from '@/components/ui/PressableScale';
import { ME } from '@/data/mock';
import { RULES, ruleById } from '@/data/rules';
import { haptics } from '@/lib/haptics';
import { customSlots, useGame, useGameStore } from '@/store/useGameStore';
import { useUiStore } from '@/store/useUiStore';
import { colors, layout, MAX_APP_WIDTH, radius, shadow, space } from '@/theme/tokens';
import { DEFAULT_SETTINGS, type Rule } from '@/types/game';

type Rect = { x: number; y: number; w: number; h: number };
type Tab = 'mine' | 'base';

/**
 * Costruttore del mazzo (pre-partita).
 * In alto la pila di tutte le carte proposte, che cresce a ogni proposta; sotto le mie caselle
 * (quante ne decide l'host); in fondo le carte da scegliere. Tocca per mettere una carta nella prima
 * casella libera, oppure tieni premuto e trascinala su una casella piena per scambiarla.
 */
export function DeckBuilderScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { gameId } = useLocalSearchParams<{ gameId: string }>();
  const game = useGame(gameId);
  const players = useGameStore((s) => s.players);
  const proposals = useGameStore((s) => s.proposals);
  const customRules = useGameStore((s) => s.customRules);
  const extraSlots = useGameStore((s) => s.extraSlots);
  const proposeCard = useGameStore((s) => s.proposeCard);
  const withdrawCard = useGameStore((s) => s.withdrawCard);
  const showToast = useUiStore((s) => s.showToast);
  const [tab, setTab] = useState<Tab>('mine');
  const [preview, setPreview] = useState<Rule>();
  const slotRects = useRef<(Rect | undefined)[]>([]);
  const slotViews = useRef<(View | null)[]>([]);
  // Carta "fantasma" che segue il dito sopra tutto lo schermo durante il trascinamento
  const [ghost, setGhost] = useState<Rule>();
  const gx = useSharedValue(0);
  const gy = useSharedValue(0);
  const rootRef = useRef<View>(null);
  const origin = useRef({ x: 0, y: 0 });
  const justDragged = useRef(0);
  const ghostStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: gx.value - 40 }, { translateY: gy.value - 52 }, { rotate: '-5deg' }, { scale: 1.08 }],
  }));

  const mineOwn = useMemo(() => customRules.filter((r) => r.authorId === ME.id), [customRules]);
  if (!game) return <Redirect href="/" />;

  const perPlayer = (game.settings ?? DEFAULT_SETTINGS).cardsPerPlayer;
  const myIds = proposals.filter((p) => p.gameId === game.id && p.authorId === ME.id).map((p) => p.ruleId);
  const deck = game.ruleIds.map(ruleById).filter((r): r is Rule => !!r);
  const pile = deck.slice(-7);
  const open = game.status === 'waiting';
  const pool = tab === 'mine' ? mineOwn : RULES;
  const freeCustom = customSlots(extraSlots, game) - mineOwn.length;

  const place = (rule: Rule, slot?: number) => {
    if (!open) return showToast({ text: 'Il mazzo è chiuso: la partita è già iniziata' });
    if (game.ruleIds.includes(rule.id)) return showToast({ text: `${rule.label} è già nel mazzo` });
    const target = slot ?? (myIds.length < perPlayer ? myIds.length : undefined);
    if (target === undefined)
      return showToast({ text: 'Caselle piene: trascina la carta su una casella per scambiarla' });
    haptics.bonus();
    const current = myIds[target];
    if (current) {
      withdrawCard(game.id, current, rule.id);
      showToast({ text: `Scambiata: ${ruleById(current)?.label} esce, ${rule.label} entra` });
    } else {
      proposeCard(game.id, rule.id);
    }
  };

  const startDrag = (rule: Rule, x: number, y: number) => {
    rootRef.current?.measureInWindow((ox, oy) => {
      origin.current = { x: ox, y: oy };
      gx.value = x - ox;
      gy.value = y - oy;
    });
    measureSlots();
    setGhost(rule);
  };
  const moveDrag = (x: number, y: number) => {
    gx.value = x - origin.current.x;
    gy.value = y - origin.current.y;
  };
  const endDrag = (rule: Rule, x: number, y: number) => {
    setGhost(undefined);
    justDragged.current = Date.now();
    dropAt(rule, x, y);
  };

  const measureSlots = () =>
    slotViews.current.forEach((v, i) =>
      v?.measureInWindow((x, y, w, h) => {
        slotRects.current[i] = { x, y, w, h };
      }),
    );

  const dropAt = (rule: Rule, px: number, py: number) => {
    const i = slotRects.current.findIndex((r) => r && px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h);
    if (i >= 0) place(rule, Math.min(i, myIds.length));
  };

  return (
    <View style={styles.screen} ref={rootRef} collapsable={false}>
      <View style={[styles.bar, { paddingTop: insets.top + space.sm }]}>
        <PressableScale accessibilityLabel="Indietro" hitSlop={12} onPress={() => router.back()} style={styles.back}>
          <Icon name="chevron-left" size={22} strokeWidth={2.2} />
        </PressableScale>
        <AppText variant="headline" style={styles.title}>
          Il mazzo di {game.name}
        </AppText>
        <View style={styles.back} />
      </View>

      <View style={[styles.content, styles.fixed]}>
        <View style={styles.table} accessibilityLabel={`Il mazzo ha ${deck.length} carte`}>
          <View style={styles.pile}>
            {pile.map((r, i) => (
              <Animated.View
                key={r.id}
                entering={FadeInUp.springify().damping(14)}
                layout={LinearTransition.springify()}
                style={[
                  styles.pileCard,
                  {
                    transform: [
                      { translateX: (i - (pile.length - 1) / 2) * 22 },
                      { rotate: `${(i - (pile.length - 1) / 2) * 6}deg` },
                    ],
                    zIndex: i,
                  },
                ]}>
                <DeckCard rule={r} bare style={styles.pileInner} />
              </Animated.View>
            ))}
          </View>
          <AppText variant="title">{deck.length} carte nel mazzo</AppText>
          <AppText variant="caption" color={colors.inkSoft} style={styles.regular}>
            Proposte da {new Set(proposals.filter((p) => p.gameId === game.id).map((p) => p.authorId)).size} giocatori
            su {game.playerIds.length}. Si chiude quando parte la partita.
          </AppText>
        </View>

        <View style={styles.section}>
          <AppText variant="name">
            Le tue carte nel mazzo · {myIds.length}/{perPlayer}
          </AppText>
          <View style={styles.slots} onLayout={measureSlots}>
            {Array.from({ length: perPlayer }, (_, i) => {
              const r = myIds[i] ? ruleById(myIds[i]) : undefined;
              return (
                <View
                  key={i}
                  ref={(v) => {
                    slotViews.current[i] = v;
                  }}
                  style={styles.slot}
                  collapsable={false}>
                  {r ? (
                    <DeckCard
                      rule={r}
                      style={styles.fill}
                      onPress={() => {
                        haptics.tap();
                        withdrawCard(game.id, r.id);
                        showToast({ text: `${r.label} tolta dal mazzo` });
                      }}
                    />
                  ) : (
                    <View style={styles.emptySlot}>
                      <AppText variant="title" color={colors.inkFaint}>
                        {i + 1}
                      </AppText>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
          <AppText variant="caption" color={colors.inkSoft} style={styles.regular}>
            Tocca una carta qui sotto per metterla. Tienila premuta e trascinala su una casella per scambiarla. Tocca
            una casella piena per svuotarla.
          </AppText>
        </View>
      </View>
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + space.xxl }]}>
        <View style={styles.section}>
          <View style={styles.segment} accessibilityRole="tablist">
            {(
              [
                ['mine', `Personali ${mineOwn.length}`],
                ['base', `Base ${RULES.length}`],
              ] as const
            ).map(([id, label]) => (
              <Pressable
                key={id}
                accessibilityRole="tab"
                accessibilityState={{ selected: tab === id }}
                onPress={() => {
                  haptics.tap();
                  setTab(id);
                }}
                style={[styles.segmentItem, tab === id && styles.segmentActive]}>
                <AppText variant="caption" color={tab === id ? colors.ink : colors.inkSoft}>
                  {label}
                </AppText>
              </Pressable>
            ))}
          </View>
          <View style={styles.grid}>
            {tab === 'mine' && (
              <EmptySlot
                locked={freeCustom <= 0}
                label={freeCustom <= 0 ? 'Sblocca' : 'Crea carta'}
                onPress={() =>
                  router.push({ pathname: freeCustom <= 0 ? '/premium' : '/card/new', params: { gameId: game.id } })
                }
              />
            )}
            {pool.map((r) => {
              const inDeck = game.ruleIds.includes(r.id);
              const byOther = inDeck && !myIds.includes(r.id);
              return (
                <Draggable
                  key={r.id}
                  disabled={inDeck}
                  onStart={(x, y) => startDrag(r, x, y)}
                  onMove={moveDrag}
                  onDrop={(x, y) => endDrag(r, x, y)}>
                  <DeckCard
                    rule={r}
                    style={styles.fill}
                    dimmed={inDeck}
                    note={
                      myIds.includes(r.id)
                        ? 'nel mazzo'
                        : byOther
                          ? players.find(
                              (p) =>
                                p.id === proposals.find((q) => q.ruleId === r.id && q.gameId === game.id)?.authorId,
                            )?.name
                          : undefined
                    }
                    onPress={() => {
                      if (Date.now() - justDragged.current < 400) return;
                      if (inDeck) setPreview(r);
                      else place(r);
                    }}
                  />
                </Draggable>
              );
            })}
          </View>
        </View>
      </ScrollView>
      {ghost && (
        <Animated.View pointerEvents="none" style={[styles.ghost, ghostStyle]}>
          <DeckCard rule={ghost} bare style={styles.fill} />
        </Animated.View>
      )}
      <CardSheet
        rule={preview}
        author={players.find((p) => p.id === preview?.authorId)}
        onClose={() => setPreview(undefined)}
      />
    </View>
  );
}

/** Carta trascinabile: tieni premuto, trascina, rilascia sopra una casella. */
function Draggable({
  children,
  disabled,
  onStart,
  onMove,
  onDrop,
}: {
  children: ReactNode;
  disabled?: boolean;
  onStart: (x: number, y: number) => void;
  onMove: (x: number, y: number) => void;
  onDrop: (x: number, y: number) => void;
}) {
  const [lifted, setLifted] = useState(false);
  const cellRef = useRef<View>(null);
  const center = useRef({ x: 0, y: 0 });
  // Il centro della carta + lo spostamento: su web absoluteX/Y non sono affidabili dopo il long press
  const pan = Gesture.Pan()
    .enabled(!disabled)
    .activateAfterLongPress(200)
    .runOnJS(true)
    .onBegin(() =>
      cellRef.current?.measureInWindow((x, y, w, h) => {
        center.current = { x: x + w / 2, y: y + h / 2 };
      }),
    )
    .onStart((e) => {
      haptics.press();
      setLifted(true);
      onStart(center.current.x + e.translationX, center.current.y + e.translationY);
    })
    .onUpdate((e) => onMove(center.current.x + e.translationX, center.current.y + e.translationY))
    .onEnd((e) => onDrop(center.current.x + e.translationX, center.current.y + e.translationY))
    .onFinalize(() => setLifted(false));
  return (
    <GestureDetector gesture={pan}>
      <View ref={cellRef} collapsable={false} style={[styles.cell, lifted && styles.liftedCell]}>
        {children}
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: layout.gutter,
    paddingBottom: space.sm,
    backgroundColor: colors.surface,
    borderBottomLeftRadius: radius.bar,
    borderBottomRightRadius: radius.bar,
    zIndex: 5,
  },
  back: { width: 40, height: 40, justifyContent: 'center' },
  title: { flex: 1, textAlign: 'center' },
  content: {
    paddingHorizontal: layout.gutter,
    paddingTop: layout.section,
    gap: layout.section,
    width: '100%',
    maxWidth: MAX_APP_WIDTH,
    alignSelf: 'center',
  },
  regular: { fontWeight: '400', textAlign: 'center' },
  table: { alignItems: 'center', gap: space.xxs },
  pile: { height: 120, width: '100%', alignItems: 'center', justifyContent: 'center', marginBottom: space.sm },
  pileCard: { position: 'absolute', width: 70, ...shadow.card },
  pileInner: { width: '100%' },
  section: { gap: space.sm },
  slots: { flexDirection: 'row', flexWrap: 'wrap', columnGap: '3.33%', rowGap: space.sm },
  slot: { width: '22.5%' },
  fill: { width: '100%' },
  emptySlot: {
    width: '100%',
    aspectRatio: 0.78,
    borderRadius: radius.sm,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.inkFaint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segment: { flexDirection: 'row', backgroundColor: colors.surfaceMuted, borderRadius: radius.pill, padding: 4 },
  segmentItem: { flex: 1, alignItems: 'center', paddingVertical: space.xs, borderRadius: radius.pill },
  segmentActive: { backgroundColor: colors.surface },
  grid: { flexDirection: 'row', flexWrap: 'wrap', columnGap: '3.33%', rowGap: space.md },
  cell: { width: '22.5%' },
  liftedCell: { opacity: 0.25 },
  fixed: { paddingBottom: space.sm, gap: space.md },
  ghost: { position: 'absolute', left: 0, top: 0, width: 80, zIndex: 100, ...shadow.floating },
});
