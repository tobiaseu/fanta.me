import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeOut, LinearTransition } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/icons/Icon';
import { AppText } from '@/components/ui/AppText';
import { PressableScale } from '@/components/ui/PressableScale';
import { PhaseTrack } from '@/components/game/PhaseTrack';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useNow } from '@/hooks/useNow';
import { formatHoursLeft } from '@/lib/time';
import { gameDay } from '@/store/useGameStore';
import { colors, MAX_APP_WIDTH, radius, space } from '@/theme/tokens';
import type { Game } from '@/types/game';

const pad = (n: number) => String(n).padStart(2, '0');
const DAY_MS = 86_400_000;

/** Cosa conta il countdown: fine giornata (in partita), calcio d'inizio (da iniziare), niente (conclusa). */
function countdownOf(game: Game, now: number) {
  const day = gameDay(game, now);
  if (game.status === 'waiting') {
    const start = new Date(game.startsAt ?? now).getTime();
    return { target: start, eyebrow: 'Si parte tra', short: `parte tra ${formatLong(start - now)}` };
  }
  if (game.status === 'ended') return undefined;
  const end = new Date(game.endsAt ?? day.end).getTime();
  return {
    target: day.end,
    eyebrow: `${day.label} ${day.index} di ${day.total}, finisce tra`,
    short: `${day.label.toLowerCase()} ${day.index} di ${day.total}, ${game.endsAt ? `fine tra ${formatLong(end - now)}` : `chiude tra ${formatLong(day.end - now)}`}`,
  };
}

function formatLong(ms: number) {
  return ms > DAY_MS * 2 ? `${Math.ceil(ms / DAY_MS)}g` : formatHoursLeft(ms);
}

/**
 * Header della partita, sempre in alto e compatto: una riga di stato.
 * Un tocco lo apre (fasi + countdown a tessere), un altro lo richiude.
 */
export function GameHeader({ game }: { game: Game }) {
  const [expanded, setExpanded] = useState(false);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const now = useNow();
  const cd = countdownOf(game, now);
  const left = cd ? Math.max(0, Math.floor((cd.target - now) / 1000)) : 0;
  const tiles = [
    { value: Math.floor(left / 86_400), label: 'giorni' },
    { value: Math.floor((left % 86_400) / 3600), label: 'ore' },
    { value: Math.floor((left % 3600) / 60), label: 'min' },
    { value: left % 60, label: 'sec' },
  ].filter((t, i) => i > 0 || t.value > 0);

  return (
    <Animated.View layout={LinearTransition.duration(260)} style={[styles.bar, { paddingTop: insets.top + space.sm }]}>
      <View style={styles.inner}>
        <View style={styles.row}>
          <PressableScale
            accessibilityRole="button"
            accessibilityLabel="Torna alle tue stanze"
            hitSlop={12}
            onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
            style={styles.back}>
            <Icon name="chevron-left" size={22} strokeWidth={2.2} />
          </PressableScale>
          <AppText variant="headline" numberOfLines={1} style={styles.title} accessibilityRole="header">
            {game.emoji} {game.name}
          </AppText>
          <View style={styles.back} />
        </View>

        <PressableScale
          accessibilityRole="button"
          accessibilityState={{ expanded }}
          accessibilityLabel={expanded ? 'Chiudi i dettagli della partita' : 'Apri fasi e countdown'}
          pressedScale={0.98}
          onPress={() => setExpanded((v) => !v)}>
          {expanded ? (
            <Animated.View
              key="open"
              entering={FadeIn.duration(220)}
              exiting={FadeOut.duration(120)}
              style={styles.open}>
              <PhaseTrack status={game.status} thick />
              {cd && (
                <>
                  <View style={styles.eyebrow}>
                    <StatusBadge status={game.status} />
                    <AppText variant="caption" color={colors.inkSoft}>
                      {cd!.eyebrow}
                    </AppText>
                  </View>
                  <View
                    style={styles.tiles}
                    accessibilityLabel={`${cd!.eyebrow} ${tiles.map((t) => `${t.value} ${t.label}`).join(', ')}`}>
                    {tiles.map((t) => (
                      <View key={t.label} style={styles.tile}>
                        <AppText variant="display" style={styles.digits}>
                          {pad(t.value)}
                        </AppText>
                        <AppText variant="micro" color={colors.inkSoft}>
                          {t.label}
                        </AppText>
                      </View>
                    ))}
                  </View>
                </>
              )}
            </Animated.View>
          ) : (
            <Animated.View
              key="strip"
              entering={FadeIn.duration(220)}
              exiting={FadeOut.duration(120)}
              style={styles.strip}>
              <StatusBadge status={game.status} />
              {cd && (
                <AppText variant="caption" color={colors.inkSoft} numberOfLines={1} style={styles.flex}>
                  {cd.short}
                </AppText>
              )}
              <Icon name="chevron-right" size={14} color={colors.inkFaint} />
            </Animated.View>
          )}
        </PressableScale>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: colors.surface,
    borderBottomLeftRadius: radius.bar,
    borderBottomRightRadius: radius.bar,
    paddingBottom: space.md,
    zIndex: 5,
    overflow: 'hidden',
  },
  inner: { width: '100%', maxWidth: MAX_APP_WIDTH, alignSelf: 'center', paddingHorizontal: space.md, gap: space.sm },
  row: { flexDirection: 'row', alignItems: 'center', height: 40 },
  back: { width: 40, height: 40, alignItems: 'flex-start', justifyContent: 'center' },
  title: { flex: 1, textAlign: 'center' },
  flex: { flexShrink: 1 },
  open: { gap: space.sm, paddingTop: space.xxs },
  eyebrow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: space.xs },
  tiles: { flexDirection: 'row', gap: space.xs },
  tile: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: space.xs,
    borderRadius: radius.sm,
    backgroundColor: colors.background,
  },
  digits: { fontSize: 20, lineHeight: 24, letterSpacing: -0.3 },
  strip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.xs,
    alignSelf: 'center',
    paddingHorizontal: space.sm,
    paddingVertical: space.xxs + 2,
    borderRadius: radius.pill,
    backgroundColor: colors.background,
    maxWidth: '100%',
  },
});
