import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Platform, ScrollView, Share, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/icons/Icon';
import { AppText } from '@/components/ui/AppText';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { PressableScale } from '@/components/ui/PressableScale';
import { StepHeader } from '@/components/ui/StepHeader';
import { ME } from '@/data/mock';
import { haptics } from '@/lib/haptics';
import { inviteCode, useGame, useGameStore } from '@/store/useGameStore';
import { useSessionStore } from '@/store/useSessionStore';
import { useUiStore } from '@/store/useUiStore';
import { colors, layout, MAX_APP_WIDTH, radius, space } from '@/theme/tokens';

/** Onboarding 2/2: invita persone. Codice da condividere + amici da aggiungere con un tocco. */
export function OnboardingInviteScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { gameId } = useLocalSearchParams<{ gameId: string }>();
  const game = useGame(gameId);
  const players = useGameStore((s) => s.players);
  const friendships = useGameStore((s) => s.friendships);
  const addPlayers = useGameStore((s) => s.addPlayers);
  const finishOnboarding = useSessionStore((s) => s.finishOnboarding);
  const showToast = useUiStore((s) => s.showToast);
  const [invited, setInvited] = useState<string[]>([]);

  // Prima gli amici, poi chi conosci dalle altre stanze
  const people = useMemo(
    () =>
      players
        .filter((p) => p.id !== ME.id)
        .sort((a, b) => Number(friendships[b.id] === 'friends') - Number(friendships[a.id] === 'friends')),
    [players, friendships],
  );

  if (!game) return <Redirect href="/" />;
  const code = inviteCode(game);
  const link = `https://tobiaseu.github.io/fanta.me/?code=${code}`;
  const message = `Entra in "${game.name}" su Fanta.me con il codice ${code}: ${link}`;

  const share = async () => {
    haptics.tap();
    try {
      if (Platform.OS === 'web') {
        const nav = globalThis.navigator as Navigator | undefined;
        if (nav?.share) await nav.share({ text: message });
        else {
          await nav?.clipboard?.writeText(message);
          showToast({ text: 'Invito copiato, incollalo nel gruppo' });
        }
      } else {
        await Share.share({ message });
      }
    } catch {
      // condivisione annullata: niente da fare
    }
  };

  const finish = (enter: boolean) => {
    if (invited.length) addPlayers(game.id, invited);
    finishOnboarding();
    haptics.bonus();
    if (enter) {
      router.replace('/');
      router.push({ pathname: '/game/[gameId]', params: { gameId: game.id } });
    } else router.replace('/');
  };

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={[styles.content, { paddingTop: insets.top + space.md }]}>
        <StepHeader step={2} total={2} />
        <View style={styles.copy}>
          <AppText variant="serifTitle">Invita la tua gente</AppText>
          <AppText variant="body" color={colors.inkSoft}>
            Più siete, più figuracce. Condividi il codice nel gruppo o aggiungi chi conosci già.
          </AppText>
        </View>

        <View style={styles.codeCard}>
          <AppText variant="micro" color={colors.inkSoft}>
            CODICE DI {game.name.toUpperCase()}
          </AppText>
          <View style={styles.code} accessibilityLabel={`Codice ${code.split('').join(' ')}`}>
            {code.split('').map((ch, i) => (
              <View key={i} style={styles.letter}>
                <AppText variant="title">{ch}</AppText>
              </View>
            ))}
          </View>
          <Button label="Condividi invito" variant="dark" onPress={share} />
        </View>

        <View style={styles.list}>
          <AppText variant="headline">Persone che conosci</AppText>
          {people.map((p) => {
            const on = invited.includes(p.id);
            const friend = friendships[p.id] === 'friends';
            return (
              <View key={p.id} style={styles.row}>
                <Avatar player={p} size={44} sticker={false} />
                <View style={styles.flex}>
                  <AppText variant="name">{p.name}</AppText>
                  <AppText variant="caption" color={colors.inkSoft} style={styles.regular}>
                    {friend ? 'Tuo amico' : `@${p.handle}`}
                  </AppText>
                </View>
                <PressableScale
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: on }}
                  accessibilityLabel={`Invita ${p.name}`}
                  onPress={() => {
                    haptics.tap();
                    setInvited((l) => (on ? l.filter((x) => x !== p.id) : [...l, p.id]));
                  }}
                  style={[styles.toggle, on && styles.toggleOn]}>
                  {on && <Icon name="check" size={14} strokeWidth={3} />}
                  <AppText variant="caption">{on ? 'Invitato' : 'Invita'}</AppText>
                </PressableScale>
              </View>
            );
          })}
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, space.md) }]}>
        <Button
          label={
            invited.length
              ? `Entra con ${invited.length} ${invited.length === 1 ? 'amico' : 'amici'}`
              : 'Entra nella stanza'
          }
          onPress={() => finish(true)}
        />
        <PressableScale accessibilityRole="button" onPress={() => finish(false)} hitSlop={8} style={styles.skip}>
          <AppText variant="caption" color={colors.inkSoft}>
            Salta per ora
          </AppText>
        </PressableScale>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: {
    paddingHorizontal: layout.gutter,
    paddingBottom: space.lg,
    gap: layout.section,
    width: '100%',
    maxWidth: MAX_APP_WIDTH,
    alignSelf: 'center',
  },
  copy: { gap: space.xs },
  codeCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: layout.card, gap: space.md },
  code: { flexDirection: 'row', gap: space.xs },
  letter: {
    flex: 1,
    height: 52,
    borderRadius: radius.sm,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: { gap: space.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  flex: { flex: 1, gap: 2 },
  regular: { fontWeight: '400' },
  toggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xxs,
    height: 36,
    paddingHorizontal: space.md,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colors.ink,
  },
  toggleOn: { backgroundColor: colors.cta, borderColor: colors.cta },
  footer: {
    paddingHorizontal: layout.gutter,
    paddingTop: space.sm,
    gap: space.xxs,
    width: '100%',
    maxWidth: MAX_APP_WIDTH,
    alignSelf: 'center',
  },
  skip: { alignItems: 'center', paddingVertical: space.xs },
});
