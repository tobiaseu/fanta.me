import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeOut, LinearTransition } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/icons/Icon';
import { AppText } from '@/components/ui/AppText';
import { PressableScale } from '@/components/ui/PressableScale';
import { PhaseTrack } from '@/components/game/PhaseTrack';
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
    return { target: start, short: `· parte tra ${formatLong(start - now)}` };
  }
  if (game.status === 'ended') return undefined;
  const end = new Date(game.endsAt ?? day.end).getTime();
  return {
    target: day.end,
    short: game.endsAt
      ? `· finisce tra ${formatLong(end - now)}`
      : `· la giornata chiude tra ${formatLong(day.end - now)}`,
  };
}

/** Cosa dice il pannello in ogni fase: nome, cosa fare adesso, cosa conta il countdown. */
const PHASE_GUIDE: Record<Game['status'], { title: string; todo: string; clock: string; dot: string }> = {
  waiting: {
    title: 'Pre-partita',
    todo: 'Invita i tuoi amici e scegli le carte del mazzo prima che si parta.',
    clock: 'Parte tra',
    dot: colors.cta,
  },
  live: {
    title: 'In partita',
    todo: 'Quando succede qualcosa, chiama il punto con il tasto al centro. Il gruppo conferma.',
    clock: 'La giornata chiude tra',
    dot: colors.live,
  },
  ended: {
    title: 'Risultati',
    todo: 'La partita è finita: guarda classifica e trofei, poi lancia la rivincita.',
    clock: '',
    dot: colors.inkFaint,
  },
};

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
  const phase = PHASE_GUIDE[game.status];
  // Oltre i due giorni si contano giorni, ore e minuti; sotto, ore, minuti e secondi
  const tiles =
    left >= 172_800
      ? [
          { value: Math.floor(left / 86_400), label: 'giorni' },
          { value: Math.floor((left % 86_400) / 3600), label: 'ore' },
          { value: Math.floor((left % 3600) / 60), label: 'minuti' },
        ]
      : [
          { value: Math.floor(left / 3600), label: 'ore' },
          { value: Math.floor((left % 3600) / 60), label: 'minuti' },
          { value: left % 60, label: 'secondi' },
        ];

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
          <PressableScale
            accessibilityRole="button"
            accessibilityLabel="Il Libro del Fanta: le regole"
            hitSlop={12}
            onPress={() => router.push('/rulebook')}
            style={[styles.back, styles.right]}>
            <Icon name="book" size={22} />
          </PressableScale>
        </View>

        <PressableScale
          accessibilityRole="button"
          accessibilityState={{ expanded }}
          accessibilityLabel={expanded ? 'Chiudi i dettagli della fase' : `${phase.title}: apri cosa fare adesso`}
          pressedScale={0.98}
          onPress={() => setExpanded((v) => !v)}
          style={[styles.panel, expanded && styles.panelOpen]}>
          <PhaseTrack status={game.status} thick={expanded} bare={!expanded} />
          {expanded ? (
            <Animated.View
              key="open"
              entering={FadeIn.duration(220)}
              exiting={FadeOut.duration(120)}
              style={styles.open}>
              <View style={styles.guide}>
                <AppText variant="serifTitle" style={styles.phaseTitle}>
                  {phase.title}
                </AppText>
                <AppText variant="caption" color={colors.inkSoft} style={styles.regular}>
                  {phase.todo}
                </AppText>
              </View>
              {cd ? (
                <View
                  style={styles.clock}
                  accessibilityLabel={`${phase.clock} ${tiles.map((t) => `${t.value} ${t.label}`).join(', ')}`}>
                  <AppText variant="micro" color={colors.inkSoft}>
                    {phase.clock}
                  </AppText>
                  <View style={styles.tiles}>
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
                </View>
              ) : (
                <AppText style={styles.trophy}>🏆</AppText>
              )}
            </Animated.View>
          ) : (
            <Animated.View
              key="strip"
              entering={FadeIn.duration(220)}
              exiting={FadeOut.duration(120)}
              style={styles.strip}>
              <View style={[styles.dot, { backgroundColor: phase.dot }]} />
              <AppText variant="caption" numberOfLines={1} style={styles.flex}>
                {phase.title}
                {cd ? <AppText variant="caption" color={colors.inkSoft}>{`  ${cd.short}`}</AppText> : null}
              </AppText>
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
  right: { alignItems: 'flex-end' },
  title: { flex: 1, textAlign: 'center' },
  flex: { flexShrink: 1 },
  panel: {
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    paddingHorizontal: space.md,
    paddingTop: space.sm,
    paddingBottom: space.sm,
    gap: space.xs,
  },
  panelOpen: { paddingTop: space.md, paddingBottom: space.md, gap: space.md },
  open: { flexDirection: 'row', gap: space.md, alignItems: 'flex-start' },
  guide: { flex: 1, gap: space.xxs },
  phaseTitle: { fontSize: 26, lineHeight: 30 },
  regular: { fontWeight: '400' },
  clock: { gap: space.xxs },
  tiles: { flexDirection: 'row', gap: space.xxs },
  tile: {
    width: 52,
    alignItems: 'center',
    paddingVertical: space.xs,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
  },
  digits: { fontSize: 20, lineHeight: 24, letterSpacing: -0.3 },
  trophy: { fontSize: 40, lineHeight: 48 },
  strip: { flexDirection: 'row', alignItems: 'center', gap: space.xs },
  dot: { width: 8, height: 8, borderRadius: 4 },
});
