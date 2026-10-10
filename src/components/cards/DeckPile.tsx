import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  FadeInUp,
  LinearTransition,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { DeckCard } from '@/components/cards/DeckCard';
import { AppText } from '@/components/ui/AppText';
import { PressableScale } from '@/components/ui/PressableScale';
import { colors, space } from '@/theme/tokens';
import type { Rule } from '@/types/game';

/**
 * Il mazzo intero a ventaglio, che respira piano. Un tocco lo apre per sfogliarlo.
 * Le carte nuove entrano dall'alto, così si vede quando qualcuno ne aggiunge una.
 */
export function DeckPile({ deck, onOpen, height = 120 }: { deck: Rule[]; onOpen: () => void; height?: number }) {
  const pile = deck.slice(-8);
  const breathe = useSharedValue(0);
  useEffect(() => {
    breathe.value = withRepeat(withTiming(1, { duration: 2600, easing: Easing.inOut(Easing.sin) }), -1, true);
  }, [breathe]);
  const cardW = height * 0.62;

  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={`Il mazzo ha ${deck.length} carte. Tocca per sfogliarle`}
      onPress={onOpen}
      style={styles.wrap}>
      <View style={[styles.pile, { height: height + 16 }]}>
        {pile.map((r, i) => (
          <Fan key={r.id} index={i} count={pile.length} breathe={breathe} width={cardW}>
            <DeckCard rule={r} bare style={{ width: cardW }} />
          </Fan>
        ))}
      </View>
      <AppText variant="headline">{deck.length} carte nel mazzo</AppText>
      <AppText variant="micro" color={colors.inkSoft}>
        Tocca per sfogliarle
      </AppText>
    </PressableScale>
  );
}

function Fan({
  index,
  count,
  breathe,
  width,
  children,
}: {
  index: number;
  count: number;
  breathe: { value: number };
  width: number;
  children: React.ReactNode;
}) {
  const offset = index - (count - 1) / 2;
  const style = useAnimatedStyle(() => ({
    transform: [
      { translateX: offset * (width * 0.38) * (1 + breathe.value * 0.08) },
      { translateY: Math.abs(offset) * 4 },
      { rotate: `${offset * (7 + breathe.value * 1.5)}deg` },
    ],
  }));
  return (
    <Animated.View
      entering={FadeInUp.springify().damping(14)}
      layout={LinearTransition.springify()}
      style={[styles.card, { width, marginLeft: -width / 2, zIndex: index }, style]}>
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', gap: 2 },
  pile: { width: '100%', alignItems: 'center', justifyContent: 'flex-end', marginBottom: space.xs },
  card: { position: 'absolute', bottom: 0, left: '50%' },
});
