import { Redirect } from 'expo-router';

/** Esplora è diventata la pagina World: i vecchi link portano lì. */
export default function ExploreRedirect() {
  return <Redirect href="/world" />;
}
