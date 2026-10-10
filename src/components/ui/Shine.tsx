import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

/** Riflesso che attraversa la card ogni tanto, come una carta olografica. */
export function Shine({ width, every = 3200, delay = 0 }: { width: number; every?: number; delay?: number }) {
  const x = useSharedValue(-1);
  useEffect(() => {
    x.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 900, easing: Easing.inOut(Easing.quad) }),
          withTiming(1, { duration: every }),
          withTiming(-1, { duration: 0 }),
        ),
        -1,
      ),
    );
  }, [x, every, delay]);
  const style = useAnimatedStyle(() => ({ transform: [{ translateX: x.value * width }, { skewX: '-20deg' }] }));
  return (
    <Animated.View pointerEvents="none" style={[styles.band, { width: width * 0.6, left: width * 0.2 }, style]}>
      <Svg width="100%" height="100%">
        <Defs>
          <LinearGradient id="shine" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0" stopColor="#fff" stopOpacity={0} />
            <Stop offset="0.5" stopColor="#fff" stopOpacity={0.75} />
            <Stop offset="1" stopColor="#fff" stopOpacity={0} />
          </LinearGradient>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#shine)" />
      </Svg>
    </Animated.View>
  );
}

const styles = StyleSheet.create({ band: { position: 'absolute', top: 0, bottom: 0 } });
