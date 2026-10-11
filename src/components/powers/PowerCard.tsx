import { useRef, type ReactNode } from 'react';
import { Platform, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, RadialGradient, Rect, Stop } from 'react-native-svg';

import { PLAY_RATIO, type CardRect } from '@/components/cards/PlayCard';
import { AppText } from '@/components/ui/AppText';
import { PressableScale } from '@/components/ui/PressableScale';
import { haptics } from '@/lib/haptics';
import { colors, radius, space } from '@/theme/tokens';
import type { PowerUp, PowerUpId } from '@/types/game';

const EMOJI_FONT = Platform.select({
  web: '"Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif',
  default: undefined,
});

/**
 * Un potere è una carta speciale: verticale come le carte, ma con una cornice metallica
 * e il centro notte. La cornice dice la famiglia, cioè cosa fa:
 *  - Oro: muove i punti (Turbo, Salvadanaio), la carta trofeo;
 *  - Argento: ti difende (Scudo, Veto);
 *  - Ghiaccio: rallenta o ruba agli altri (Moviola, Ladro);
 *  - Olografica: il Jolly, vale come un altro potere.
 * Le carte normali sono bianche: un potere non si confonde mai con una carta.
 */
export type PowerFamily = 'gold' | 'silver' | 'ice' | 'holo';

export const POWER_FAMILY: Record<PowerUpId, PowerFamily> = {
  boost: 'gold',
  accumulator: 'gold',
  shield: 'silver',
  veto: 'silver',
  slowdown: 'ice',
  thief: 'ice',
  jolly: 'holo',
};

type Finish = { label: string; frame: string[]; glow: string; edge: string };

export const FINISH: Record<PowerFamily, Finish> = {
  gold: { label: 'Punti', frame: ['#FFF3C2', '#E8B53A', '#A86F0E', '#FFE08A'], glow: '#FFC83C', edge: '#FFE9A3' },
  silver: { label: 'Difesa', frame: ['#FFFFFF', '#C3CAD6', '#7C8698', '#E9EDF3'], glow: '#A8C8FF', edge: '#FFFFFF' },
  ice: { label: 'Sabotaggio', frame: ['#E4FBFF', '#62CDE6', '#1C6F8C', '#B9F2FF'], glow: '#5FE1FF', edge: '#D7F8FF' },
  holo: { label: 'Jolly', frame: ['#FFC4EC', '#C7D7FF', '#BFFFE0', '#FFF2A8'], glow: '#F2E6FF', edge: '#FFFFFF' },
};

export const finishOf = (power: PowerUp) => FINISH[POWER_FAMILY[power.id] ?? 'gold'];

/** Ombra morbida del colore della famiglia, per staccare la carta dallo sfondo. */
export const powerGlow = (power: PowerUp) => `0 10px 26px ${FINISH[POWER_FAMILY[power.id] ?? 'gold'].glow}66`;
/** Compatibilità: bagliore giallo dei chip dei poteri attivi. */
export const POWER_GLOW = '0 10px 26px rgba(255, 200, 60, 0.42)';

/** Cornice metallica: gradiente in diagonale con un filo di luce sul bordo. */
export function PowerFrame({ id, power }: { id: string; power: PowerUp }) {
  const f = finishOf(power);
  return (
    <Svg
      style={StyleSheet.absoluteFill}
      width="100%"
      height="100%"
      viewBox="0 0 100 140"
      preserveAspectRatio="none"
      pointerEvents="none">
      <Defs>
        <LinearGradient id={`pf-${id}`} x1="0" y1="0" x2="1" y2="1">
          {f.frame.map((c, i) => (
            <Stop key={i} offset={i / (f.frame.length - 1)} stopColor={c} />
          ))}
        </LinearGradient>
      </Defs>
      <Rect x="0" y="0" width="100" height="140" fill={`url(#pf-${id})`} />
    </Svg>
  );
}

export function PowerArt({
  id,
  active,
  vertical,
  glow: tint,
}: {
  id: string;
  active?: boolean;
  vertical?: boolean;
  glow?: string;
}) {
  const glow = active ? '#34C759' : (tint ?? colors.cta);
  const H = vertical ? 140 : 100;
  return (
    <Svg
      style={StyleSheet.absoluteFill}
      width="100%"
      height="100%"
      viewBox={`0 0 100 ${H}`}
      preserveAspectRatio="none"
      pointerEvents="none">
      <Defs>
        <LinearGradient id={`pg-${id}`} x1="0" y1="0" x2="0.3" y2="1">
          <Stop offset="0" stopColor="#23232A" />
          <Stop offset="1" stopColor="#0B0B0D" />
        </LinearGradient>
        <RadialGradient id={`ph-${id}`} cx="50" cy={H * 0.4} r="42" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor={glow} stopOpacity={0.55} />
          <Stop offset="1" stopColor={glow} stopOpacity={0} />
        </RadialGradient>
      </Defs>
      <Rect x="0" y="0" width="100" height={H} fill={`url(#pg-${id})`} />
      <Circle cx="50" cy={H * 0.4} r="42" fill={`url(#ph-${id})`} />
      {vertical && (
        <>
          <Circle cx="50" cy={H * 0.4} r="28" stroke={glow} strokeOpacity="0.3" strokeWidth="0.5" fill="none" />
          <Circle cx="50" cy={H * 0.4} r="40" stroke={glow} strokeOpacity="0.14" strokeWidth="0.4" fill="none" />
        </>
      )}
    </Svg>
  );
}

/** Tag "Potere", con il ruolo accanto se è principale o secondario. */
export function PowerKind({ role, power }: { role?: 'main' | 'secondary'; power?: PowerUp }) {
  const f = power ? finishOf(power) : undefined;
  return (
    <View style={styles.kindRow}>
      <View style={styles.kind}>
        <View style={[styles.dot, f && { backgroundColor: f.glow }]} />
        <AppText variant="micro" color="#FFFFFF" style={styles.kindText}>
          {f ? `Potere · ${f.label}` : 'Potere'}
        </AppText>
      </View>
      {role ? (
        <AppText variant="micro" color={role === 'main' ? colors.cta : 'rgba(255,255,255,0.7)'} style={styles.role}>
          {role === 'main' ? 'Principale' : 'Secondario'}
        </AppText>
      ) : null}
    </View>
  );
}

export type PowerCta = { label: string; onPress: () => void; tone?: 'primary' | 'plain' };

export function PowerCard({
  power,
  role,
  state,
  active,
  spent,
  cta,
  onOpen,
  style,
}: {
  power: PowerUp;
  role?: 'main' | 'secondary';
  /** Riga di stato quando non c'è un'azione (es. "Attivo, ancora 2 h") */
  state?: string;
  active?: boolean;
  spent?: boolean;
  cta?: PowerCta;
  onOpen: (from?: CardRect) => void;
  style?: StyleProp<ViewStyle>;
}) {
  const ref = useRef<View>(null);
  const open = () => {
    haptics.tap();
    const node = ref.current;
    if (!node?.measureInWindow) return onOpen();
    node.measureInWindow((x, y, w, h) => onOpen(w ? { x, y, width: w, height: h } : undefined));
  };
  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={`Potere ${power.label}${role ? `, ${role === 'main' ? 'principale' : 'secondario'}` : ''}. Apri`}
      onPress={open}
      pressedScale={0.96}
      style={[styles.wrap, spent && styles.spent, style]}>
      <View ref={ref} collapsable={false} style={[styles.shell, { boxShadow: powerGlow(power) } as ViewStyle]}>
        <View style={styles.frame}>
          <PowerFrame id={`pf-${power.id}-${role ?? 'x'}`} power={power} />
          <View style={styles.card}>
            <PowerArt id={`pc-${power.id}-${role ?? 'x'}`} active={active} vertical glow={finishOf(power).glow} />
            <PowerKind role={role} power={power} />
            <View style={styles.art}>
              <Text style={styles.emoji} allowFontScaling={false}>
                {power.emoji}
              </Text>
            </View>
            <AppText variant="headline" color="#FFFFFF" numberOfLines={1} style={styles.title}>
              {power.label}
            </AppText>
            {cta ? (
              <PressableScale
                accessibilityRole="button"
                accessibilityLabel={`${cta.label}: ${power.label}`}
                hitSlop={6}
                onPress={() => {
                  haptics.bonus();
                  cta.onPress();
                }}
                style={[styles.cta, cta.tone === 'primary' ? styles.ctaPrimary : styles.ctaPlain]}>
                <AppText variant="micro" color={cta.tone === 'primary' ? '#0B0B0D' : '#FFFFFF'} style={styles.bold}>
                  {cta.label}
                </AppText>
              </PressableScale>
            ) : state ? (
              <View style={[styles.cta, styles.ctaPlain]}>
                <AppText
                  variant="micro"
                  color={active ? '#7CE38B' : 'rgba(255,255,255,0.8)'}
                  style={styles.bold}
                  numberOfLines={1}>
                  {state}
                </AppText>
              </View>
            ) : null}
          </View>
        </View>
      </View>
    </PressableScale>
  );
}

/** Griglia a due colonne dei poteri: stesso passo di quella delle carte. */
export function PowerGrid({ children }: { children: ReactNode }) {
  return <View style={styles.grid}>{children}</View>;
}

const styles = StyleSheet.create({
  wrap: { width: '47.5%' },
  spent: { opacity: 0.55 },
  shell: { width: '100%', aspectRatio: PLAY_RATIO, borderRadius: radius.lg },
  frame: { flex: 1, borderRadius: radius.lg, overflow: 'hidden', padding: 5 },
  card: { flex: 1, borderRadius: radius.lg - 5, overflow: 'hidden', padding: space.sm, gap: 2 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', columnGap: '5%', rowGap: space.md },
  kindRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  kind: {
    height: 20,
    paddingHorizontal: 7,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.cta },
  kindText: { fontSize: 11, lineHeight: 13, fontWeight: '700' },
  role: { fontSize: 11, lineHeight: 14, fontWeight: '700' },
  art: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emoji: { fontSize: 46, lineHeight: 54, fontFamily: EMOJI_FONT },
  title: { fontSize: 16, lineHeight: 19, fontWeight: '700' },
  cta: {
    marginTop: space.xxs,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: space.xs,
  },
  ctaPrimary: { backgroundColor: colors.cta },
  ctaPlain: { backgroundColor: 'rgba(255,255,255,0.14)' },
  bold: { fontWeight: '700' },
});
