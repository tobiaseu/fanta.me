import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

import { useSessionStore } from '@/store/useSessionStore';

/** Feedback aptico centralizzato: no-op sul web, mai bloccante. */
const run = (fn: () => Promise<void>) => {
  if (Platform.OS === 'web' || !useSessionStore.getState().hapticsOn) return;
  fn().catch(() => {});
};

export const haptics = {
  tap: () => run(() => Haptics.selectionAsync()),
  press: () => run(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)),
  bonus: () => run(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)),
  malus: () => run(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)),
};
