import { useLocalSearchParams, useRouter, type Href } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { Wordmark } from '@/components/ui/Brand';
import { colors, space } from '@/theme/tokens';

function Dot({ delay }: { delay: number }) {
  const v = useSharedValue(0.25);
  useEffect(() => {
    v.value = withDelay(
      delay,
      withRepeat(withSequence(withTiming(1, { duration: 300 }), withTiming(0.25, { duration: 300 })), -1),
    );
  }, [delay, v]);
  const style = useAnimatedStyle(() => ({ opacity: v.value, transform: [{ translateY: (1 - v.value) * 4 }] }));
  return <Animated.View style={[styles.dot, style]} />;
}

/** Caricamento dopo l'accesso: solo il wordmark e tre puntini, circa un secondo e mezzo. */
export function SplashScreen() {
  const router = useRouter();
  const { next } = useLocalSearchParams<{ next?: string }>();
  useEffect(() => {
    const t = setTimeout(() => router.replace((next || '/') as Href), 1500);
    return () => clearTimeout(t);
  }, [next, router]);
  return (
    <View style={styles.screen} accessibilityLabel="Caricamento">
      <Wordmark size={34} />
      <View style={styles.dots}>
        <Dot delay={0} />
        <Dot delay={150} />
        <Dot delay={300} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.lg,
    backgroundColor: colors.background,
  },
  dots: { flexDirection: 'row', gap: space.xs },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.ink },
});
