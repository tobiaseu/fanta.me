import { Alert, Platform } from 'react-native';

/** Conferma di sistema per le azioni che non si possono disfare. */
export function confirmAction(title: string, message: string, confirmLabel: string, onConfirm: () => void) {
  if (Platform.OS === 'web') {
    if (window.confirm(`${title}\n\n${message}`)) onConfirm();
    return;
  }
  Alert.alert(title, message, [
    { text: 'Annulla', style: 'cancel' },
    { text: confirmLabel, onPress: onConfirm },
  ]);
}
