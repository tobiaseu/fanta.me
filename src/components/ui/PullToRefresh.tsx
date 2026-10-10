import { useEffect, useRef, type ReactNode } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View, type ScrollViewProps } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { interpolate, runOnJS, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { haptics } from '@/lib/haptics';
import { colors } from '@/theme/tokens';

const TRIGGER = 64;
const HOLD_MS = 500;

/**
 * ScrollView con "trascina giù per aggiornare" stile iPhone: si tira dall'alto, compare la rotellina,
 * al rilascio oltre la soglia gira mezzo secondo e poi i dati sono aggiornati.
 * `pulse` cambia quando l'app stessa aggiorna la pagina (es. dopo aver chiamato un punto).
 */
export function PullToRefresh({
  onRefresh,
  pulse,
  children,
  ...scroll
}: ScrollViewProps & { onRefresh?: () => void; pulse?: number; children: ReactNode }) {
  const pull = useSharedValue(0);
  const busy = useSharedValue(false);
  const atTop = useSharedValue(true);
  const startY = useSharedValue(0);
  const startX = useSharedValue(0);
  const first = useRef(true);

  const finish = () => {
    onRefresh?.();
    pull.value = withTiming(0, { duration: 260 });
    busy.value = false;
  };
  const run = () => {
    haptics.tap();
    setTimeout(finish, HOLD_MS);
  };

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (pulse === undefined) return;
    busy.value = true;
    pull.value = withTiming(TRIGGER, { duration: 180 });
    const id = setTimeout(() => {
      pull.value = withTiming(0, { duration: 260 });
      busy.value = false;
    }, HOLD_MS + 180);
    return () => clearTimeout(id);
  }, [pulse]);

  const pan = Gesture.Pan()
    .manualActivation(true)
    .onTouchesDown((e) => {
      startY.value = e.allTouches[0]?.absoluteY ?? 0;
      startX.value = e.allTouches[0]?.absoluteX ?? 0;
    })
    .onTouchesMove((e, manager) => {
      const t = e.allTouches[0];
      if (!t) return;
      const dy = t.absoluteY - startY.value;
      const dx = t.absoluteX - startX.value;
      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 10) manager.fail();
      else if (dy < -6 || !atTop.value || busy.value) manager.fail();
      else if (dy > 10) manager.activate();
    })
    .onUpdate((e) => {
      // Elastico: più tiri, meno scende
      pull.value = Math.max(0, e.translationY * 0.5);
    })
    .onEnd(() => {
      if (pull.value >= TRIGGER) {
        busy.value = true;
        pull.value = withTiming(TRIGGER, { duration: 120 });
        runOnJS(run)();
      } else pull.value = withTiming(0, { duration: 200 });
    });

  const contentStyle = useAnimatedStyle(() => ({ transform: [{ translateY: pull.value }] }));
  const spinnerStyle = useAnimatedStyle(() => ({
    opacity: interpolate(pull.value, [8, TRIGGER], [0, 1], 'clamp'),
    transform: [
      { translateY: pull.value / 2 - 14 },
      { scale: interpolate(pull.value, [0, TRIGGER], [0.6, 1], 'clamp') },
      { rotate: `${pull.value * 4}deg` },
    ],
  }));

  return (
    <GestureDetector gesture={pan}>
      <View style={styles.flex}>
        <Animated.View style={[styles.spinner, spinnerStyle]} pointerEvents="none">
          <ActivityIndicator color={colors.ink} />
        </Animated.View>
        <Animated.View style={[styles.flex, contentStyle]}>
          <ScrollView
            {...scroll}
            scrollEventThrottle={16}
            onScroll={(e) => {
              atTop.value = e.nativeEvent.contentOffset.y <= 0;
              scroll.onScroll?.(e);
            }}>
            {children}
          </ScrollView>
        </Animated.View>
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  spinner: { position: 'absolute', top: 0, left: 0, right: 0, alignItems: 'center', zIndex: 2 },
});
