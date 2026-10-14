import { router } from 'expo-router';

/**
 * Le tre schede secondarie dell'app (lo "spacchettamento" delle informazioni):
 *  - mazzo:    /cards      tutte le carte di un mazzo, nella sola visualizzazione delle carte
 *  - persona:  /player/:id il profilo (già esistente)
 *  - squadra:  /team/:id   una sola pagina squadra, uguale ovunque
 */
export function openDeckPage(opts: { title: string; gameId?: string; ids?: string[]; subtitle?: string }) {
  router.push({
    pathname: '/cards',
    params: {
      title: opts.title,
      ...(opts.subtitle ? { subtitle: opts.subtitle } : {}),
      ...(opts.gameId ? { gameId: opts.gameId } : {}),
      ...(opts.ids ? { ids: opts.ids.join(',') } : {}),
    },
  });
}

export function openTeamPage(gameId: string, teamId: string) {
  router.push({ pathname: '/team/[teamId]', params: { teamId, gameId } });
}
