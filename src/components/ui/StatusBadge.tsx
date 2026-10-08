import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { AppText } from './AppText';

import { colors, radius, space } from '@/theme/tokens';
import type { GameStatus } from '@/types/game';

const CONFIG: Record<GameStatus, { label: string; bg: string; fg: string; dot: string }> = {
  live: { label: 'In partita', bg: colors.liveSoft, fg: colors.liveInk, dot: colors.live },
  waiting: { label: 'In attesa', bg: colors.ctaSoft, fg: '#8A4B00', dot: colors.cta },
  ended: { label: 'Conclusa', bg: colors.surfaceMuted, fg: colors.inkMuted, dot: colors.inkMuted },
};

/** Badge di stato con pallino "live" pulsante. */
export function StatusBadge({ status }: { status: GameStatus }) {
  const c = CONFIG[status];
  const pulse = useSharedValue(1);

  useEffect(() => {
    if (status === 'live') pulse.value = withRepeat(withTiming(0.35, { duration: 900 }), -1, true);
  }, [status, pulse]);

  const dotStyle = useAnimatedStyle(() => ({ opacity: pulse.value }));

  return (
    <View style={[styles.badge, { backgroundColor: c.bg }]}>
      <Animated.View style={[styles.dot, { backgroundColor: c.dot }, dotStyle]} />
      <AppText variant="caption" color={c.fg}>
        {c.label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xs - 2,
    paddingHorizontal: space.sm - 2,
    paddingVertical: space.xxs,
    borderRadius: radius.pill,
    alignSelf: 'flex-start',
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
});
