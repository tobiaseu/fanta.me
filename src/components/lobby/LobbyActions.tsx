import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/icons/Icon';
import { AppText } from '@/components/ui/AppText';
import { PressableScale } from '@/components/ui/PressableScale';
import { haptics } from '@/lib/haptics';
import { colors, radius, shadow, space } from '@/theme/tokens';

export const LOBBY_ACTIONS_HEIGHT = 56 + space.lg;

/**
 * Azioni flottanti alla Clubhouse: pillola gialla "+ Crea stanza" al centro,
 * bottone tondo per entrare con codice accanto. Sopra un gradiente che sfuma la lista.
 */
export function LobbyActions({ onCreate, onJoin }: { onCreate: () => void; onJoin: () => void }) {
  const insets = useSafeAreaInsets();
  return (
    <View pointerEvents="box-none" style={[styles.wrap, { paddingBottom: Math.max(insets.bottom, space.md) }]}>
      <View style={styles.side} />
      <PressableScale
        accessibilityRole="button"
        onPress={() => {
          haptics.press();
          onCreate();
        }}
        style={styles.create}>
        <Icon name="plus" size={20} strokeWidth={2.6} />
        <AppText variant="headline">Crea stanza</AppText>
      </PressableScale>
      <View style={styles.side}>
        <PressableScale
          accessibilityRole="button"
          accessibilityLabel="Entra con codice"
          onPress={() => {
            haptics.tap();
            onJoin();
          }}
          style={styles.join}>
          <Icon name="grid" size={22} />
        </PressableScale>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: space.xl,
    paddingHorizontal: space.md,
    experimental_backgroundImage: `linear-gradient(to top, ${colors.background} 45%, rgba(242,242,247,0))`,
  },
  side: { width: 72, alignItems: 'center' },
  create: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xs,
    paddingHorizontal: space.lg,
    borderRadius: radius.pill,
    backgroundColor: colors.cta,
    ...shadow.floating,
  },
  join: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.card,
  },
});
