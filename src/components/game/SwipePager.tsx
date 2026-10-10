import { usePathname, useRouter } from 'expo-router';
import type { ReactNode } from 'react';
import { StyleSheet, useWindowDimensions } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';

import { haptics } from '@/lib/haptics';
import { MAX_APP_WIDTH } from '@/theme/tokens';

const TABS = ['', 'rules', 'live', 'leaderboard', 'profile'] as const;

/**
 * Sfoglia i tab della partita trascinando in orizzontale, come le pagine dell'iPhone:
 * la pagina segue il dito, oltre un quarto (o con uno scatto veloce) passa alla vicina.
 */
export function SwipePager({ gameId, children }: { gameId: string; children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { width: screen } = useWindowDimensions();
  const width = Math.min(screen, MAX_APP_WIDTH);
  const last = pathname.split('/').pop() ?? '';
  const index = Math.max(0, TABS.indexOf((last === gameId ? '' : last) as (typeof TABS)[number]));
  const x = useSharedValue(0);
  const startX = useSharedValue(0);
  const startY = useSharedValue(0);

  const go = (dir: number) => {
    const next = TABS[index + dir];
    haptics.tap();
    router.navigate(next ? `/game/${gameId}/${next}` : `/game/${gameId}`);
  };

  const pan = Gesture.Pan()
    .manualActivation(true)
    .onTouchesDown((e) => {
      startX.value = e.allTouches[0]?.absoluteX ?? 0;
      startY.value = e.allTouches[0]?.absoluteY ?? 0;
    })
    .onTouchesMove((e, manager) => {
      const t = e.allTouches[0];
      if (!t) return;
      const dx = t.absoluteX - startX.value;
      const dy = t.absoluteY - startY.value;
      if (Math.abs(dy) > 10 && Math.abs(dy) > Math.abs(dx)) manager.fail();
      else if (Math.abs(dx) > 14) manager.activate();
    })
    .onUpdate((e) => {
      const edge = (e.translationX > 0 && index === 0) || (e.translationX < 0 && index === TABS.length - 1);
      x.value = edge ? e.translationX * 0.25 : e.translationX;
    })
    .onEnd((e) => {
      const dir = e.translationX < 0 ? 1 : -1;
      const far = Math.abs(e.translationX) > width * 0.25 || Math.abs(e.velocityX) > 600;
      const target = index + dir;
      if (far && target >= 0 && target < TABS.length) {
        x.value = withTiming(-dir * width * 0.6, { duration: 140 }, () => {
          runOnJS(go)(dir);
          x.value = withTiming(0, { duration: 0 });
        });
      } else x.value = withSpring(0, { damping: 22, stiffness: 260 });
    });

  const style = useAnimatedStyle(() => ({
    transform: [{ translateX: x.value }],
    opacity: 1 - Math.min(0.35, Math.abs(x.value) / (width * 1.5)),
  }));

  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={[styles.flex, style]}>{children}</Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({ flex: { flex: 1 } });
