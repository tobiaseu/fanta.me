import { Platform, StyleSheet, Text, View } from 'react-native';

import { teamColor, teamEmoji } from '@/lib/teams';
import type { Game } from '@/types/game';

const EMOJI_FONT = Platform.select({
  web: '"Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif',
  default: undefined,
});

/** Foto profilo della squadra: tonda come quella di un giocatore, colore della squadra e il suo stemma. */
export function TeamAvatar({ game, teamId, size = 40 }: { game: Game; teamId: string; size?: number }) {
  return (
    <View
      style={[
        styles.base,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: teamColor(game, teamId) },
      ]}
      accessibilityElementsHidden
      importantForAccessibility="no">
      <Text style={{ fontSize: size * 0.52, lineHeight: size * 0.66, fontFamily: EMOJI_FONT }} allowFontScaling={false}>
        {teamEmoji(game, teamId)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({ base: { alignItems: 'center', justifyContent: 'center', overflow: 'hidden' } });
