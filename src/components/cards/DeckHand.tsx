import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Easing,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';

import { PLAY_RATIO, PlayCard, type CardCta, type CardRect } from '@/components/cards/PlayCard';
import { Icon } from '@/components/icons/Icon';
import { AppText } from '@/components/ui/AppText';
import { PressableScale } from '@/components/ui/PressableScale';
import { haptics } from '@/lib/haptics';
import { colors, layout, radius, space } from '@/theme/tokens';
import type { Rule } from '@/types/game';

const GAP = 14;
const FAN_W = 104;
const SPRING = { damping: 20, stiffness: 190, mass: 0.9 };

type Props = {
  deck: Rule[];
  authorName?: (rule: Rule) => string | undefined;
  cta?: (rule: Rule) => CardCta | undefined;
  status?: string;
  onOpen: (rule: Rule, from?: CardRect) => void;
};

/**
 * Il mazzo della partita come una mano di carte.
 *  - Ventaglio: le carte arrivano distribuite una a una e restano aperte come in mano.
 *  - Tocco su una carta: la mano si stende in orizzontale e si sfoglia una carta alla volta,
 *    da sinistra a destra (trascinando o con le frecce).
 *  - "Richiudi" riporta la mano a ventaglio.
 * Ogni carta è un solo oggetto che passa da una posa all'altra: niente salti tra le due viste.
 */
export function DeckHand({ deck, authorName, cta, status, onOpen }: Props) {
  const [width, setWidth] = useState(0);
  const [spread, setSpread] = useState(false);
  const [index, setIndex] = useState(0);
  const n = deck.length;
  const cardW = Math.min(232, Math.max(160, width * 0.6));
  const cardH = cardW / PLAY_RATIO;
  const fanH = FAN_W / PLAY_RATIO + 56;

  const deal = useSharedValue(0);
  const mode = useSharedValue(0);
  const cursor = useSharedValue(0);
  const start = useSharedValue(0);

  // La mano viene distribuita ogni volta che il mazzo cambia (o arriva la prima misura)
  useEffect(() => {
    if (!width) return;
    deal.value = 0;
    deal.value = withTiming(1, { duration: 900, easing: Easing.out(Easing.cubic) });
  }, [width, n, deal]);

  const goTo = (i: number, animate = true) => {
    const next = Math.max(0, Math.min(n - 1, i));
    setIndex(next);
    cursor.value = animate ? withSpring(next, SPRING) : next;
  };
  const openSpread = (i: number) => {
    haptics.tap();
    goTo(i, false);
    setSpread(true);
    mode.value = withSpring(1, SPRING);
  };
  const close = () => {
    haptics.tap();
    setSpread(false);
    mode.value = withSpring(0, SPRING);
  };
  const step = (dir: number) => {
    if (index + dir < 0 || index + dir >= n) return;
    haptics.tap();
    goTo(index + dir);
  };

  // A ventaglio: ogni carta occupa una fetta della larghezza. Dal tocco si risale alla carta.
  const fanStep = n > 1 ? Math.min(FAN_W * 0.62, (width - FAN_W * 1.7) / (n - 1)) : 0;
  const settle = (i: number) => {
    setIndex(i);
    haptics.tap();
  };
  const pan = Gesture.Pan()
    .enabled(spread)
    .activeOffsetX([-8, 8])
    .failOffsetY([-14, 14])
    .onStart(() => {
      start.value = cursor.value;
    })
    .onUpdate((e) => {
      const raw = start.value - e.translationX / (cardW + GAP);
      // Oltre i bordi la mano resiste, come una lista iOS
      cursor.value = raw < 0 ? raw * 0.3 : raw > n - 1 ? n - 1 + (raw - (n - 1)) * 0.3 : raw;
    })
    .onEnd((e) => {
      const projected = cursor.value - e.velocityX / (cardW + GAP) / 6;
      const target = Math.max(0, Math.min(n - 1, Math.round(projected)));
      cursor.value = withSpring(target, SPRING);
      runOnJS(settle)(target);
    });

  const stage = useAnimatedStyle(() => ({ height: interpolate(mode.value, [0, 1], [fanH, cardH + 16]) }));

  return (
    <View style={styles.wrap}>
      <GestureDetector gesture={pan}>
        <Animated.View
          style={[styles.stage, stage]}
          onLayout={(e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width)}>
          {width > 0 &&
            deck.map((r, i) => (
              <HandCard
                key={r.id}
                i={i}
                n={n}
                width={width}
                cardW={cardW}
                fanStep={fanStep}
                fanH={fanH}
                deal={deal}
                mode={mode}
                cursor={cursor}
                interactive={spread}>
                <PlayCard
                  rule={r}
                  style={styles.full}
                  authorName={authorName?.(r)}
                  cta={spread && i === index ? cta?.(r) : undefined}
                  status={spread && i === index && !cta?.(r) ? status : undefined}
                  onOpen={(from) => (i === index ? onOpen(r, from) : goTo(i))}
                />
              </HandCard>
            ))}
          {/* A ventaglio ogni carta ha una fascia toccabile: il tocco stende la mano su quella carta */}
          {!spread &&
            deck.map((r, i) => {
              const x = width / 2 + (i - (n - 1) / 2) * fanStep;
              const last = i === n - 1;
              return (
                <Pressable
                  key={`hit-${r.id}`}
                  accessibilityRole="button"
                  accessibilityLabel={`${r.label}: sfoglia le ${n} carte del mazzo`}
                  onPress={() => openSpread(i)}
                  style={[
                    styles.hit,
                    {
                      left: i === 0 ? 0 : x - fanStep / 2,
                      width: last ? width - (x - fanStep / 2) : i === 0 ? x + fanStep / 2 : fanStep,
                    },
                  ]}
                />
              );
            })}
        </Animated.View>
      </GestureDetector>

      {spread ? (
        <View style={styles.controls}>
          <PressableScale accessibilityRole="button" onPress={close} style={styles.closeBtn}>
            <Icon name="close" size={14} strokeWidth={2.4} color={colors.ink} />
            <AppText variant="caption" style={styles.bold}>
              Richiudi
            </AppText>
          </PressableScale>
          <View style={styles.pager}>
            <Arrow dir={-1} disabled={index === 0} onPress={() => step(-1)} />
            <AppText variant="caption" color={colors.inkSoft} style={styles.count}>
              {index + 1} di {n}
            </AppText>
            <Arrow dir={1} disabled={index === n - 1} onPress={() => step(1)} />
          </View>
        </View>
      ) : (
        <AppText variant="caption" color={colors.inkSoft} style={styles.hint}>
          Tocca una carta per sfogliare il mazzo
        </AppText>
      )}
    </View>
  );
}

function Arrow({ dir, disabled, onPress }: { dir: number; disabled: boolean; onPress: () => void }) {
  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={dir < 0 ? 'Carta precedente' : 'Carta successiva'}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={[styles.arrow, disabled && styles.arrowOff]}>
      <Icon name={dir < 0 ? 'chevron-left' : 'chevron-right'} size={18} strokeWidth={2.4} color={colors.ink} />
    </PressableScale>
  );
}

function HandCard({
  i,
  n,
  width,
  cardW,
  fanStep,
  fanH,
  deal,
  mode,
  cursor,
  interactive,
  children,
}: {
  i: number;
  n: number;
  width: number;
  cardW: number;
  fanStep: number;
  fanH: number;
  deal: SharedValue<number>;
  mode: SharedValue<number>;
  cursor: SharedValue<number>;
  interactive: boolean;
  children: React.ReactNode;
}) {
  const cardH = cardW / PLAY_RATIO;
  const style = useAnimatedStyle(() => {
    // Posa a ventaglio: arco dolce, i bordi più bassi e inclinati
    const mid = (n - 1) / 2;
    const k = n > 1 ? (i - mid) / mid : 0;
    const spreadDeg = Math.min(56, n * 5);
    // Ogni carta arriva dal centro del mazzo con un piccolo ritardo
    const d = Math.max(0, Math.min(1, deal.value * 1.6 - (i / Math.max(1, n)) * 0.6));
    const fanScale = FAN_W / cardW;
    const fanCenterY = fanH / 2 + 10;
    const fx = (i - mid) * fanStep * d;
    const fy = fanCenterY - cardH / 2 + k * k * 22 * d + (1 - d) * 30;
    const fr = k * (spreadDeg / 2) * d;

    // Posa stesa: una riga orizzontale, la carta al centro piena, le vicine più piccole
    const dist = i - cursor.value;
    const rx = dist * (cardW + GAP);
    const rs = 1 - Math.min(1, Math.abs(dist)) * 0.1;

    const m = mode.value;
    return {
      zIndex: m < 0.5 ? i : 1000 - Math.round(Math.abs(dist) * 10),
      opacity: m > 0.5 && Math.abs(dist) > 2.5 ? 0 : 0.15 + 0.85 * Math.min(1, d * 1.5),
      transform: [
        { translateX: fx + (rx - fx) * m },
        { translateY: fy + (8 - fy) * m },
        { rotate: `${fr * (1 - m)}deg` },
        { scale: fanScale + (rs - fanScale) * m },
      ],
    };
  });
  return (
    <Animated.View
      pointerEvents={interactive ? 'auto' : 'none'}
      style={[styles.card, { width: cardW, height: cardH, left: (width - cardW) / 2 }, style]}>
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: space.sm },
  stage: { marginHorizontal: -layout.gutter, overflow: 'hidden' },
  card: { position: 'absolute', top: 0 },
  hit: { position: 'absolute', top: 0, bottom: 0, zIndex: 2000 },
  full: { width: '100%' },
  hint: { textAlign: 'center' },
  controls: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  closeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 36,
    paddingHorizontal: space.md,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
  },
  bold: { fontWeight: '700' },
  pager: { flexDirection: 'row', alignItems: 'center', gap: space.xs },
  count: { minWidth: 56, textAlign: 'center', fontVariant: ['tabular-nums'] },
  arrow: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowOff: { opacity: 0.35 },
});
