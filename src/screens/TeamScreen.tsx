import { Redirect, useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { TeamDetail } from '@/components/game/TeamSummary';
import { SubpageHeader } from '@/components/ui/SubpageHeader';
import { useGame } from '@/store/useGameStore';
import { colors, layout, MAX_APP_WIDTH, space } from '@/theme/tokens';

/** Scheda secondaria "Squadra": la stessa pagina da ovunque si apra una squadra. */
export function TeamScreen() {
  const insets = useSafeAreaInsets();
  const { teamId, gameId } = useLocalSearchParams<{ teamId: string; gameId: string }>();
  const game = useGame(gameId);
  const team = game?.teams?.find((t) => t.id === teamId);
  if (!game || !team) return <Redirect href="/" />;
  return (
    <View style={styles.screen}>
      <SubpageHeader title="La squadra" subtitle={game.name} />
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + space.xxl }]}>
        <TeamDetail game={game} team={team} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: {
    paddingHorizontal: layout.gutter,
    paddingTop: layout.section,
    width: '100%',
    maxWidth: MAX_APP_WIDTH,
    alignSelf: 'center',
  },
});
