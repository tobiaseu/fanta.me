import { Fraunces_600SemiBold, Fraunces_700Bold, useFonts } from '@expo-google-fonts/fraunces';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Platform, StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ToastHost } from '@/components/ui/ToastHost';
import { colors, MAX_APP_WIDTH } from '@/theme/tokens';

/**
 * Root navigator: uno Stack che separa i due mondi.
 *
 *   /welcome          → Accesso (Apple, Google, email: mock)
 *   /onboarding/room  → Prima stanza (1/2)
 *   /onboarding/invite→ Invita persone (2/2)
 *   /                 → LOBBY (nessuna navbar); senza sessione rimanda a /welcome
 *   /room/new         → Crea stanza (modale)
 *   /room/join        → Entra con codice (modale)
 *   /call/[eventId]   → Conferma punto: voto su una chiamata (modale a schermo intero)
 *   /player/[playerId]→ Profilo giocatore: carriera, leghe in comune, amicizia (modale)
 *   /game/[gameId]/*  → DASHBOARD IN-GAME (Tabs a 5 icone, vedi game/[gameId]/_layout)
 *
 * La navbar esiste solo dentro il layout della partita: la Lobby non può
 * mostrarla nemmeno per errore.
 */
export default function RootLayout() {
  // Fraunces per i titoli delle carte; finché carica, lo splash resta su.
  const [fontsLoaded] = useFonts({ Fraunces_600SemiBold, Fraunces_700Bold });
  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <View style={styles.frame}>
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: colors.background },
              animation: 'slide_from_right',
            }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="welcome" options={{ animation: 'fade', gestureEnabled: false }} />
            <Stack.Screen name="onboarding/room" options={{ animation: 'fade', gestureEnabled: false }} />
            <Stack.Screen name="onboarding/invite" options={{ gestureEnabled: false }} />
            <Stack.Screen name="game/[gameId]" options={{ animation: 'slide_from_bottom' }} />
            <Stack.Screen name="room/new" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
            <Stack.Screen name="room/join" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
            <Stack.Screen
              name="call/[eventId]"
              options={{ presentation: 'fullScreenModal', animation: 'fade_from_bottom' }}
            />
            <Stack.Screen
              name="player/[playerId]"
              options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
            />
          </Stack>
          <ToastHost />
        </View>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Platform.OS === 'web' ? '#E4E4EC' : colors.background },
  // Sul web l'app vive in una colonna "telefono" centrata, così il portfolio la mostra come un'app.
  frame: {
    flex: 1,
    width: '100%',
    maxWidth: Platform.OS === 'web' ? MAX_APP_WIDTH : undefined,
    alignSelf: 'center',
    backgroundColor: colors.background,
    overflow: 'hidden',
  },
});
