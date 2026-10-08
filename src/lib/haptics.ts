import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

/** Feedback aptico centralizzato: no-op sul web, mai bloccante. */
const run = (fn: () => Promise<void>) => {
  if (Platform.OS === 'web') return;
  fn().catch(() => {});
};

export const haptics = {
  tap: () => run(() => Haptics.selectionAsync()),
  press: () => run(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)),
  bonus: () => run(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)),
  malus: () => run(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)),
};
