/**
 * Modalità "da capo" per provare l'inizio dell'app (solo web).
 * Aprendo il link con `?fresh` la scheda la ricorda: a ogni refresh si cancella la sessione
 * e si riparte dal login. Si esce con `?fresh=off` o chiudendo la scheda.
 * Va importato per primo, prima che gli store leggano il localStorage.
 */
const KEY = 'fantame-fresh';

if (typeof window !== 'undefined' && window.sessionStorage) {
  const q = new URLSearchParams(window.location.search).get('fresh');
  if (q === 'off') window.sessionStorage.removeItem(KEY);
  else if (q !== null) window.sessionStorage.setItem(KEY, '1');

  if (window.sessionStorage.getItem(KEY)) {
    window.localStorage?.removeItem('fantame-session');
    const base = window.location.pathname.startsWith('/fanta.me') ? '/fanta.me' : '';
    // Il router ha già letto l'indirizzo: se non siamo al login, ricarica lì
    if (window.location.pathname !== `${base}/welcome`) window.location.replace(`${base}/welcome`);
  }
}

export {};
