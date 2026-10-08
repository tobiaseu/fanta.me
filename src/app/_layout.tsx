import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Platform, StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { colors, MAX_APP_WIDTH } from '@/theme/tokens';

/**
 * Root navigator: uno Stack che separa i due mondi.
 *
 *   /                 → LOBBY (nessuna navbar)
 *   /room/new         → Crea stanza (modale)
 *   /game/[gameId]/*  → DASHBOARD IN-GAME (Tabs a 5 icone, vedi game/[gameId]/_layout)
 *
 * La navbar esiste solo dentro il layout della partita: la Lobby non può
 * mostrarla nemmeno per errore.
 */
export default function RootLayout() {
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
            <Stack.Screen name="game/[gameId]" options={{ animation: 'slide_from_bottom' }} />
            <Stack.Screen name="room/new" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
          </Stack>
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
