/**
 * Ripartire da capo (solo web): il link con `?fresh` cancella la sessione e apre il login, una volta sola.
 * I refresh successivi tornano a tenere la pagina dov'eri.
 * Va importato per primo, prima che gli store leggano il localStorage.
 */
if (typeof window !== 'undefined') {
  // La vecchia modalità "ogni refresh da capo" si spegne da sola
  window.sessionStorage?.removeItem('fantame-fresh');
  if (new URLSearchParams(window.location.search).has('fresh')) {
    window.localStorage?.removeItem('fantame-session');
    const base = window.location.pathname.startsWith('/fanta.me') ? '/fanta.me' : '';
    window.location.replace(`${base}/welcome`);
  }
}

export {};
