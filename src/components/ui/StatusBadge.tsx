import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { AppText } from './AppText';

import { colors, space } from '@/theme/tokens';
import type { GameStatus } from '@/types/game';

const CONFIG: Record<GameStatus, { label: string; color: string }> = {
  live: { label: 'in partita', color: colors.live },
  waiting: { label: 'in attesa', color: '#777777' },
  ended: { label: 'conclusa', color: colors.inkFaint },
};

/** Stato partita come nel Figma: pallino + testo colorato, pallino "live" pulsante. */
export function StatusBadge({ status, size = 'sm' }: { status: GameStatus; size?: 'sm' | 'md' }) {
  const c = CONFIG[status];
  const pulse = useSharedValue(1);

  useEffect(() => {
    if (status === 'live') pulse.value = withRepeat(withTiming(0.3, { duration: 900 }), -1, true);
  }, [status, pulse]);

  const dotStyle = useAnimatedStyle(() => ({ opacity: pulse.value }));

  return (
    <View style={styles.row}>
      <Animated.View style={[styles.dot, { backgroundColor: c.color }, dotStyle]} />
      <AppText variant={size === 'md' ? 'headline' : 'caption'} color={c.color}>
        {c.label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: space.xxs },
  dot: { width: 6, height: 6, borderRadius: 3 },
});
