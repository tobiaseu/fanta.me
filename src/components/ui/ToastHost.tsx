import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInUp, FadeOutUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from './AppText';
import { PressableScale } from './PressableScale';

import { useUiStore } from '@/store/useUiStore';
import { colors, radius, shadow, space } from '@/theme/tokens';

const DURATION_MS = 5000;

/**
 * Conferma breve dopo un'azione ("Chiamata inviata"), con "Annulla" quando
 * l'azione si può disfare. Un solo toast alla volta: il nuovo sostituisce il vecchio.
 */
export function ToastHost() {
  const toast = useUiStore((s) => s.toast);
  const hide = useUiStore((s) => s.hideToast);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(hide, DURATION_MS);
    return () => clearTimeout(t);
  }, [toast, hide]);

  if (!toast) return null;
  return (
    // In alto, come le notifiche di iOS: in basso coprirebbe navbar e bottoni principali
    <View pointerEvents="box-none" style={[styles.anchor, { top: insets.top + space.xs }]}>
      <Animated.View
        key={toast.id}
        entering={FadeInUp.springify().damping(18)}
        exiting={FadeOutUp.duration(160)}
        style={styles.toast}
        accessibilityLiveRegion="polite"
        accessibilityRole="alert">
        <AppText variant="caption" color={colors.inkInverse} style={styles.text}>
          {toast.text}
        </AppText>
        {toast.action && (
          <PressableScale
            accessibilityRole="button"
            hitSlop={10}
            onPress={() => {
              toast.action?.onPress();
              hide();
            }}>
            <AppText variant="caption" color={colors.cta}>
              {toast.action.label}
            </AppText>
          </PressableScale>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  anchor: { position: 'absolute', left: space.md, right: space.md, alignItems: 'center' },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    maxWidth: 420,
    backgroundColor: colors.ink,
    borderRadius: radius.md,
    paddingVertical: space.sm + 2,
    paddingHorizontal: space.md,
    ...shadow.floating,
  },
  text: { flexShrink: 1, fontWeight: '500' },
});
