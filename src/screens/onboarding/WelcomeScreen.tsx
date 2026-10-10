import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { useEffect } from 'react';
import Animated, {
  Easing,
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/icons/Icon';
import { AppText } from '@/components/ui/AppText';
import { Avatar } from '@/components/ui/Avatar';
import { Wordmark } from '@/components/ui/Brand';
import { Button } from '@/components/ui/Button';
import { PressableScale } from '@/components/ui/PressableScale';
import { PLAYERS } from '@/data/mock';
import { haptics } from '@/lib/haptics';
import { type SignInMethod, useSessionStore } from '@/store/useSessionStore';
import { colors, layout, MAX_APP_WIDTH, space } from '@/theme/tokens';

/** Collage di "persone nella stanza", come la hallway di Clubhouse. */
const COLLAGE = [
  { i: 1, size: 76, x: 6, y: 18, rotate: -8, emoji: '🤮' },
  { i: 2, size: 92, x: 34, y: 0, rotate: 4, emoji: '🥂' },
  { i: 4, size: 68, x: 70, y: 22, rotate: 9, emoji: '🌅' },
  { i: 3, size: 64, x: 16, y: 58, rotate: 6, emoji: '🔑' },
  { i: 5, size: 84, x: 44, y: 52, rotate: -5, emoji: '👨‍🍳' },
  { i: 0, size: 60, x: 78, y: 62, rotate: -10, emoji: '😴' },
];

/** Benvenuto + accesso. Si entra con Apple, Google o email (mock), poi si crea la prima stanza. */
export function WelcomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const signIn = useSessionStore((s) => s.signIn);
  const onboarded = useSessionStore((s) => s.onboarded);

  const go = (method: SignInMethod) => {
    haptics.bonus();
    signIn(method);
    router.replace({ pathname: '/splash', params: { next: onboarded ? '/' : '/onboarding/hello' } });
  };

  return (
    <View
      style={[
        styles.screen,
        { paddingTop: insets.top + space.md, paddingBottom: Math.max(insets.bottom, space.md) + space.sm },
      ]}>
      <View style={styles.top}>
        <Wordmark size={20} />
      </View>

      <View style={styles.stage}>
        <View style={styles.collage} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
          {COLLAGE.map((c, n) => (
            <Animated.View
              key={c.i}
              entering={FadeInUp.delay(80 * n)
                .springify()
                .damping(14)}
              style={[styles.bubble, { left: `${c.x}%`, top: `${c.y}%`, transform: [{ rotate: `${c.rotate}deg` }] }]}>
              <Float index={n}>
                <Avatar player={PLAYERS[c.i]} size={c.size} sticker />
                <View style={styles.emoji}>
                  <AppText style={{ fontSize: c.size * 0.32, lineHeight: c.size * 0.4 }}>{c.emoji}</AppText>
                </View>
              </Float>
            </Animated.View>
          ))}
        </View>
      </View>

      <Animated.View entering={FadeInDown.delay(200).duration(400)} style={styles.copy}>
        <AppText variant="serifTitle" style={styles.center}>
          Il fanta della vita vera.
        </AppText>
        <AppText variant="body" color={colors.inkSoft} style={styles.center}>
          Crea una stanza con i tuoi amici e trasforma ogni figuraccia in punti.
        </AppText>
      </Animated.View>

      <View style={styles.actions}>
        <Button label="Continua con Apple" onPress={() => go('apple')} />
        <Button label="Continua con Google" variant="secondary" onPress={() => go('google')} style={styles.google} />
        <PressableScale accessibilityRole="button" onPress={() => go('email')} hitSlop={8} style={styles.link}>
          <AppText variant="headline">Usa la tua email</AppText>
        </PressableScale>
      </View>

      <View style={styles.codeWrap}>
        <PressableScale
          accessibilityRole="button"
          hitSlop={8}
          style={styles.code}
          onPress={() => {
            haptics.tap();
            signIn('email');
            useSessionStore.getState().finishOnboarding();
            router.replace('/');
            router.push('/room/join');
          }}>
          <Icon name="ticket" size={20} />
          <AppText variant="headline">Ho già un codice invito</AppText>
        </PressableScale>
        <AppText variant="micro" color={colors.inkFaint} style={styles.center}>
          Demo: nessun account vero, i dati restano su questo dispositivo.
        </AppText>
      </View>
    </View>
  );
}

/** Galleggiamento lento e sfasato delle facce del collage. */
function Float({ index, children }: { index: number; children: React.ReactNode }) {
  const y = useSharedValue(0);
  useEffect(() => {
    y.value = withDelay(
      index * 260,
      withRepeat(withTiming(1, { duration: 2400 + index * 300, easing: Easing.inOut(Easing.sin) }), -1, true),
    );
  }, [index, y]);
  const style = useAnimatedStyle(() => ({ transform: [{ translateY: -6 + y.value * 12 }] }));
  return <Animated.View style={style}>{children}</Animated.View>;
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: layout.gutter,
    width: '100%',
    maxWidth: MAX_APP_WIDTH,
    alignSelf: 'center',
  },
  top: { alignItems: 'center' },
  stage: { flex: 1, justifyContent: 'center' },
  collage: { height: 280, marginVertical: space.md },
  bubble: { position: 'absolute' },
  emoji: { position: 'absolute', right: -8, bottom: -8 },
  copy: { gap: space.xs, marginBottom: space.lg, paddingHorizontal: space.sm },
  center: { textAlign: 'center' },
  actions: { gap: space.sm },
  google: { borderColor: colors.surfaceMuted },
  link: { alignItems: 'center', paddingVertical: space.xs },
  codeWrap: {
    marginTop: space.md,
    paddingTop: space.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.hairline,
    gap: space.sm,
  },
  code: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.xs,
    paddingVertical: space.xs,
  },
});
