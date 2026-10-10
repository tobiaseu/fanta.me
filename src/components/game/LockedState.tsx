import { StyleSheet, View } from 'react-native';

import { Icon } from '@/components/icons/Icon';
import { AppText } from '@/components/ui/AppText';
import { useNow } from '@/hooks/useNow';
import { formatHoursLeft } from '@/lib/time';
import { colors, radius, space } from '@/theme/tokens';
import type { Game } from '@/types/game';

/** Sezione non ancora attiva: resta al suo posto, dice quando si apre e cosa ci sarà. */
export function LockedState({ game, title, points }: { game: Game; title: string; points: string[] }) {
  const now = useNow(30_000);
  const left = Math.max(0, new Date(game.startsAt ?? now).getTime() - now);
  return (
    <View style={styles.card}>
      <View style={styles.lock}>
        <Icon name="lock" size={22} />
      </View>
      <AppText variant="serifHeading" style={styles.center}>
        {title}
      </AppText>
      <AppText variant="body" color={colors.inkSoft} style={[styles.center, styles.regular]}>
        Si apre quando parte la partita, tra {left > 172_800_000 ? `${Math.ceil(left / 86_400_000)} giorni` : formatHoursLeft(left)}.
      </AppText>
      <View style={styles.list}>
        {points.map((p) => (
          <View key={p} style={styles.row}>
            <View style={styles.bullet} />
            <AppText variant="body" style={[styles.flex, styles.regular]}>
              {p}
            </AppText>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: space.lg,
    gap: space.sm,
    alignItems: 'center',
  },
  lock: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: { textAlign: 'center' },
  regular: { fontWeight: '400' },
  list: { alignSelf: 'stretch', gap: space.xs, marginTop: space.sm },
  row: { flexDirection: 'row', gap: space.sm, alignItems: 'flex-start' },
  bullet: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.ink, marginTop: 8 },
  flex: { flex: 1 },
});
