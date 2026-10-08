import { Redirect, useGlobalSearchParams } from 'expo-router';

/**
 * Tab "Azione Veloce": non è una pagina, la navbar apre il Bottom Sheet.
 * Se qualcuno arriva qui via deep link, torna al feed.
 */
export default function ActionRoute() {
  const { gameId } = useGlobalSearchParams<{ gameId: string }>();
  return <Redirect href={{ pathname: '/game/[gameId]', params: { gameId } }} />;
}
