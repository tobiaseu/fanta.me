import { Platform } from 'react-native';

const BASE = '/fanta.me';

/** Sul web: manifest e icona per "Aggiungi a Home", così iOS permette le notifiche (da iOS 16.4). */
export function setupWebApp() {
  if (Platform.OS !== 'web' || typeof document === 'undefined') return;
  const add = (tag: string, attrs: Record<string, string>) => {
    const el = document.createElement(tag);
    Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
    document.head.appendChild(el);
  };
  add('link', { rel: 'manifest', href: `${BASE}/manifest.webmanifest` });
  add('link', { rel: 'apple-touch-icon', href: `${BASE}/apple-touch-icon.png` });
  add('meta', { name: 'apple-mobile-web-app-capable', content: 'yes' });
  add('meta', { name: 'apple-mobile-web-app-title', content: 'Fanta.me' });
}

const SAMPLES = [
  { title: '🎯 Giulia ti ha chiamato +10', body: "La Smurratona. Hai un'ora per contestarla." },
  { title: '👀 2 chiamate da votare', body: 'Ale e Sara aspettano il tuo voto in Fantapasquetta.' },
  { title: '🌙 Il riassunto di oggi', body: 'Sei 2° a 4 punti da Ale. Momento top: il tuffo di Luca.' },
];

/**
 * Notifica di prova (demo web). Su iPhone funziona solo dall'app aggiunta a Home.
 * Ritorna un messaggio da mostrare se non si può.
 */
export async function sendTestNotification(delayMs = 5000): Promise<string | undefined> {
  if (Platform.OS !== 'web') return "Sull'app vera arriveranno con TestFlight.";
  if (!('Notification' in window) || !('serviceWorker' in navigator)) {
    return 'Su iPhone: Condividi > Aggiungi a Home, poi apri Fanta.me da lì e riprova.';
  }
  const perm = await Notification.requestPermission();
  if (perm !== 'granted') return 'Notifiche non permesse: attivale nelle Impostazioni del telefono.';
  await navigator.serviceWorker.register(`${BASE}/sw.js`, { scope: `${BASE}/` });
  const reg = await navigator.serviceWorker.ready;
  const s = SAMPLES[Math.floor(Math.random() * SAMPLES.length)];
  setTimeout(() => {
    reg.showNotification(s.title, { body: s.body, icon: `${BASE}/icon-192.png`, tag: 'fanta-test' }).catch(() => {});
  }, delayMs);
  return undefined;
}
