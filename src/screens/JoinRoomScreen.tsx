import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import { Icon } from '@/components/icons/Icon';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { PressableScale } from '@/components/ui/PressableScale';
import { haptics } from '@/lib/haptics';
import { inviteCode, useGameStore } from '@/store/useGameStore';
import { colors, MAX_APP_WIDTH, radius, space } from '@/theme/tokens';

/** Entra con codice (modale): sei caratteri, maiuscoli, niente altro. */
export function JoinRoomScreen() {
  const router = useRouter();
  const games = useGameStore((s) => s.games);
  const [code, setCode] = useState('');
  const [error, setError] = useState(false);

  const submit = () => {
    // Fase 2: il codice si risolve lato Supabase
    const gameId = games.find((g) => inviteCode(g) === code.trim().toUpperCase())?.id;
    if (!gameId) {
      haptics.malus();
      setError(true);
      return;
    }
    haptics.bonus();
    router.replace({ pathname: '/game/[gameId]', params: { gameId } });
  };

  return (
    <View style={styles.screen}>
      <View style={styles.head}>
        <AppText variant="title">Entra con codice</AppText>
        <PressableScale onPress={() => router.back()} style={styles.close} accessibilityLabel="Chiudi">
          <Icon name="close" size={18} color={colors.inkSoft} strokeWidth={2} />
        </PressableScale>
      </View>
      <AppText variant="body" color={colors.inkSoft} style={styles.regular}>
        Chiedi il codice all'host della stanza. Per la demo prova con R4TB9Z.
      </AppText>
      <TextInput
        value={code}
        onChangeText={(t) => {
          setCode(t.toUpperCase());
          setError(false);
        }}
        autoCapitalize="characters"
        autoCorrect={false}
        maxLength={6}
        placeholder="CODICE"
        placeholderTextColor={colors.placeholder}
        style={[styles.input, error && styles.inputError]}
        onSubmitEditing={submit}
        accessibilityLabel="Codice stanza"
      />
      {error && (
        <AppText variant="caption" color={colors.malus}>
          Nessuna stanza con questo codice. Controlla le lettere e riprova.
        </AppText>
      )}
      <Button label="Entra" disabled={code.trim().length < 4} onPress={submit} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
    padding: space.md,
    paddingTop: space.lg,
    gap: space.md,
    width: '100%',
    maxWidth: MAX_APP_WIDTH,
    alignSelf: 'center',
  },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  close: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  regular: { fontWeight: '400' },
  input: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    height: 72,
    textAlign: 'center',
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: 8,
    color: colors.ink,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  inputError: { borderColor: colors.malus },
});
