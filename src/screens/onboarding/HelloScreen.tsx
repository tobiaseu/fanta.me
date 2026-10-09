import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { ME } from '@/data/mock';
import { colors, layout, MAX_APP_WIDTH, radius, space } from '@/theme/tokens';

const STEPS = [
  { emoji: '🏠', title: 'Crea una stanza', body: 'Un weekend, una vacanza, l’ufficio. Tu sei l’host.' },
  { emoji: '🃏', title: 'Costruite il mazzo', body: 'Prima di partire ognuno mette le sue carte: bonus e malus.' },
  { emoji: '📣', title: 'Chiamate e votate', body: 'Succede qualcosa? Chiami la carta, il gruppo conferma.' },
];

/** Benvenuto dopo il login: tre righe per capire il gioco, poi la prima stanza. */
export function HelloScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  return (
    <View
      style={[styles.screen, { paddingTop: insets.top + space.xxl, paddingBottom: Math.max(insets.bottom, space.md) }]}>
      <Animated.View entering={FadeInDown.duration(400)} style={styles.copy}>
        <AppText style={styles.party}>🎉</AppText>
        <AppText variant="serifTitle">Benvenuto, {ME.name}!</AppText>
        <AppText variant="body" color={colors.inkSoft}>
          Fanta.me è il fantacalcio della vita vera. Funziona così:
        </AppText>
      </Animated.View>
      <View style={styles.list}>
        {STEPS.map((s, i) => (
          <Animated.View key={s.title} entering={FadeInDown.delay(200 + i * 120).duration(400)} style={styles.row}>
            <View style={styles.icon}>
              <AppText style={styles.emoji}>{s.emoji}</AppText>
            </View>
            <View style={styles.flex}>
              <AppText variant="name">{s.title}</AppText>
              <AppText variant="caption" color={colors.inkSoft} style={styles.regular}>
                {s.body}
              </AppText>
            </View>
          </Animated.View>
        ))}
      </View>
      <View style={styles.flex} />
      <Button label="Crea la tua prima stanza" onPress={() => router.replace('/onboarding/room')} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: layout.gutter,
    width: '100%',
    maxWidth: MAX_APP_WIDTH,
    alignSelf: 'center',
    gap: layout.section,
  },
  copy: { gap: space.xs },
  party: { fontSize: 48, lineHeight: 58 },
  list: { gap: space.md },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  icon: {
    width: 52,
    height: 52,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: { fontSize: 26, lineHeight: 32 },
  flex: { flex: 1, gap: 2 },
  regular: { fontWeight: '400' },
});
