import { useRef, type ReactNode } from 'react';
import { Platform, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, RadialGradient, Rect, Stop } from 'react-native-svg';

import type { CardRect } from '@/components/cards/PlayCard';
import { AppText } from '@/components/ui/AppText';
import { PressableScale } from '@/components/ui/PressableScale';
import { haptics } from '@/lib/haptics';
import { colors, radius, space } from '@/theme/tokens';
import type { PowerUp } from '@/types/game';

const EMOJI_FONT = Platform.select({
  web: '"Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif',
  default: undefined,
});

/**
 * Un potere è SEMPRE quadrato, sempre notte con il bagliore giallo Fanta.me (verde se è attivo).
 * Né verticale come una carta né orizzontale come una stanza: si riconosce senza leggere.
 */
export const POWER_GLOW = '0 10px 26px rgba(255, 200, 60, 0.42)';

export function PowerArt({ id, active, vertical }: { id: string; active?: boolean; vertical?: boolean }) {
  const glow = active ? '#34C759' : colors.cta;
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
        <RadialGradient id={`ph-${id}`} cx="50" cy={H * 0.42} r="42" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor={glow} stopOpacity={0.5} />
          <Stop offset="1" stopColor={glow} stopOpacity={0} />
        </RadialGradient>
      </Defs>
      <Rect x="0" y="0" width="100" height={H} fill={`url(#pg-${id})`} />
      <Circle cx="50" cy={H * 0.42} r="42" fill={`url(#ph-${id})`} />
      {vertical && (
        <Circle cx="50" cy={H * 0.42} r="28" stroke="#FFFFFF" strokeOpacity="0.1" strokeWidth="0.4" fill="none" />
      )}
    </Svg>
  );
}

/** Tag "Potere", con il ruolo accanto se è principale o secondario. */
export function PowerKind({ role }: { role?: 'main' | 'secondary' }) {
  return (
    <View style={styles.kindRow}>
      <View style={styles.kind}>
        <View style={styles.dot} />
        <AppText variant="micro" color="#FFFFFF" style={styles.kindText}>
          Potere
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
      <View ref={ref} collapsable={false} style={styles.shell}>
        <View style={styles.card}>
          <PowerArt id={`pc-${power.id}-${role ?? 'x'}`} active={active} />
          <PowerKind role={role} />
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
  shell: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: radius.lg,
    ...({ boxShadow: POWER_GLOW } as object),
  },
  card: { flex: 1, borderRadius: radius.lg, overflow: 'hidden', padding: space.sm, gap: 2 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', columnGap: '5%', rowGap: space.md },
  kindRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
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
