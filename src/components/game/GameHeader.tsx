import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Platform, Share, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeOut, LinearTransition } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/icons/Icon';
import { AppText } from '@/components/ui/AppText';
import { PressableScale } from '@/components/ui/PressableScale';
import { useNow } from '@/hooks/useNow';
import { haptics } from '@/lib/haptics';
import { formatHoursLeft } from '@/lib/time';
import { gameDay, inviteCode } from '@/store/useGameStore';
import { useUiStore } from '@/store/useUiStore';
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

/** Colore della fase: verde in trasparenza in partita, giallo nel pre-partita, oro a fine partita. */
const TINT: Record<Game['status'], { bg: string; line: string; dot: string }> = {
  waiting: { bg: colors.ctaSoft, line: 'rgba(230, 190, 60, 0.45)', dot: '#E6BE3C' },
  live: { bg: colors.liveSoft, line: 'rgba(11, 130, 0, 0.3)', dot: colors.live },
  ended: { bg: 'rgba(212, 160, 23, 0.18)', line: 'rgba(212, 160, 23, 0.45)', dot: '#D4A017' },
};

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
  const showToast = useUiStore((s) => s.showToast);
  // Condividi la stanza: lo stesso invito dell'onboarding
  const share = async () => {
    haptics.tap();
    const code = inviteCode(game);
    const message = `Entra in "${game.name}" su Fanta.me con il codice ${code}: https://tobiaseu.github.io/fanta.me/?code=${code}`;
    try {
      if (Platform.OS === 'web') {
        const nav = globalThis.navigator as Navigator | undefined;
        if (nav?.share) await nav.share({ text: message });
        else {
          await nav?.clipboard?.writeText(message);
          showToast({ text: 'Invito copiato, incollalo nel gruppo' });
        }
      } else await Share.share({ message });
    } catch {
      // condivisione annullata: niente da fare
    }
  };
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
            accessibilityLabel="Esci dalla partita e torna alla Lobby"
            hitSlop={12}
            onPress={() => {
              if (router.canDismiss()) router.dismissAll();
              else router.replace('/');
            }}
            style={styles.lobby}>
            <Icon name="home" size={18} strokeWidth={1.6} />
            <AppText variant="caption">Esci</AppText>
          </PressableScale>
          <AppText variant="headline" numberOfLines={1} style={styles.title} accessibilityRole="header">
            {game.emoji} {game.name}
          </AppText>
          <PressableScale
            accessibilityRole="button"
            accessibilityLabel="Condividi la stanza con un invito"
            hitSlop={12}
            onPress={share}
            style={[styles.lobby, styles.right]}>
            <Icon name="share" size={18} strokeWidth={1.6} />
            <AppText variant="caption">Condividi</AppText>
          </PressableScale>
        </View>

        {/* Tag di fase sotto il nome: porta al Live, dove c'è il countdown */}
        <PressableScale
          accessibilityRole="button"
          accessibilityLabel={`${phase.title}${cd ? ` ${cd.short.replace('· ', '')}` : ''}. Apri il Live`}
          pressedScale={0.96}
          onPress={() => router.navigate({ pathname: '/game/[gameId]/live', params: { gameId: game.id } })}
          style={[styles.pill, { backgroundColor: TINT[game.status].bg, borderColor: TINT[game.status].line }]}>
          <View style={[styles.dot, { backgroundColor: TINT[game.status].dot }]} />
          <AppText variant="micro" numberOfLines={1} style={styles.bold}>
            {phase.title}
            {cd ? <AppText variant="micro" color={colors.inkSoft}>{` ${cd.short}`}</AppText> : null}
          </AppText>
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
    paddingBottom: space.sm,
    zIndex: 5,
    overflow: 'hidden',
  },
  inner: { width: '100%', maxWidth: MAX_APP_WIDTH, alignSelf: 'center', paddingHorizontal: space.md, gap: space.xs },
  row: { flexDirection: 'row', alignItems: 'center', height: 40 },
  lobby: {
    height: 36,
    borderRadius: 18,
    paddingHorizontal: space.sm,
    flexDirection: 'row',
    gap: 4,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  right: { alignItems: 'flex-end' },
  title: { flex: 1, textAlign: 'center' },
  flex: { flexShrink: 1 },
  pill: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: radius.pill,
    borderWidth: 1,
    paddingHorizontal: space.sm,
    paddingVertical: 6,
    overflow: 'hidden',
  },
  pillOpen: { alignSelf: 'stretch', borderRadius: radius.md, paddingVertical: space.xs, gap: space.xs },
  open: { gap: space.xs },
  bold: { fontWeight: '600' },
  tiles: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  tileWrap: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  tile: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 1,
    paddingHorizontal: space.xs,
    paddingVertical: 2,
    borderRadius: radius.sm,
    backgroundColor: colors.surface,
  },
  digits: { fontVariant: ['tabular-nums'] },
  unit: { fontSize: 11, lineHeight: 14, color: colors.inkSoft },
  strip: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 6, height: 6, borderRadius: 3 },
});
