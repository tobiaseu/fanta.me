import { useEffect, type ReactNode } from 'react';
import { Modal, Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import type { CardRect } from '@/components/cards/PlayCard';
import { Icon } from '@/components/icons/Icon';
import { PressableScale } from '@/components/ui/PressableScale';
import { space } from '@/theme/tokens';

/**
 * Il pop up di ogni oggetto del gioco (carta, stanza, potere, giocatore).
 * Un solo comportamento: l'oggetto cresce dal punto in cui si trova e torna lì quando si chiude;
 * lo sfondo si oscura; un tocco fuori chiude. Cambia solo la forma (width × height) e il contenuto.
 */
export function ObjectModal({
  visible,
  resetKey,
  from,
  width: w,
  height: h,
  closeLabel,
  onClose,
  children,
}: {
  visible: boolean;
  /** Cambia quando l'oggetto mostrato cambia: rifà l'animazione di apertura */
  resetKey?: string;
  from?: CardRect;
  width: number;
  height: number;
  closeLabel: string;
  onClose: () => void;
  /** Riceve `close`, che chiude con l'animazione di ritorno */
  children: (close: () => void) => ReactNode;
}) {
  const { width, height } = useWindowDimensions();
  const grow = useSharedValue(0);
  const origin = useSharedValue({ dx: 0, dy: 0, s: 0.6 });

  useEffect(() => {
    if (!visible) return;
    origin.value = from
      ? { dx: from.x + from.width / 2 - width / 2, dy: from.y + from.height / 2 - height / 2, s: from.width / w }
      : { dx: 0, dy: 40, s: 0.85 };
    grow.value = 0;
    grow.value = withSpring(1, { damping: 20, stiffness: 190, mass: 0.9 });
  }, [visible, resetKey]); // eslint-disable-line react-hooks/exhaustive-deps

  const close = () => {
    grow.value = withTiming(0, { duration: 240, easing: Easing.inOut(Easing.cubic) }, (done) => {
      if (done) runOnJS(onClose)();
    });
  };
  const moving = useAnimatedStyle(() => {
    const t = grow.value;
    const o = origin.value;
    return {
      transform: [{ translateX: o.dx * (1 - t) }, { translateY: o.dy * (1 - t) }, { scale: o.s + (1 - o.s) * t }],
    };
  });
  const dim = useAnimatedStyle(() => ({ opacity: Math.min(1, grow.value) }));

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={close} statusBarTranslucent>
      <Animated.View style={[styles.backdrop, dim]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={close} accessibilityLabel={closeLabel} />
      </Animated.View>
      {visible && (
        <View style={styles.center} pointerEvents="box-none">
          <Animated.View style={[{ width: w, height: h }, moving]}>{children(close)}</Animated.View>
        </View>
      )}
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(10, 10, 12, 0.86)' },
  center: { ...StyleSheet.absoluteFill, alignItems: 'center', justifyContent: 'center', padding: space.md },
});

/** La X in alto a destra, uguale in tutti i pop up. */
export function SheetClose({ onPress, ink, onDark }: { onPress: () => void; ink: string; onDark: boolean }) {
  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel="Chiudi"
      hitSlop={12}
      onPress={onPress}
      style={[closeStyles.close, { backgroundColor: onDark ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.06)' }]}>
      <Icon name="close" size={16} color={ink} />
    </PressableScale>
  );
}

const closeStyles = StyleSheet.create({
  close: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
});
