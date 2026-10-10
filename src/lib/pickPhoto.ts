import { Platform } from 'react-native';

/**
 * Sceglie o scatta una foto. Sul web apre la fotocamera/galleria del telefono con un input file;
 * nell'app nativa (Fase 2) userà expo-image-picker. Restituisce un indirizzo mostrabile o undefined.
 */
export function pickPhoto(): Promise<string | undefined> {
  if (Platform.OS !== 'web' || typeof document === 'undefined') return Promise.resolve(undefined);
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.setAttribute('capture', 'environment');
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) return resolve(undefined);
      const reader = new FileReader();
      reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : undefined);
      reader.onerror = () => resolve(undefined);
      reader.readAsDataURL(file);
    };
    input.click();
  });
}
