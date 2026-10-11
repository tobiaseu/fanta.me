import { StyleSheet, Text, View, useWindowDimensions, type ViewStyle } from 'react-native';

import { PLAY_RATIO, type CardRect } from '@/components/cards/PlayCard';
import { PowerArt, PowerFrame, PowerKind, finishOf, powerGlow } from '@/components/powers/PowerCard';
import { AppText } from '@/components/ui/AppText';
import { ActionRow, type RowAction } from '@/components/ui/ActionRow';
import { ObjectModal, SheetClose } from '@/components/ui/ObjectModal';
import { space } from '@/theme/tokens';
import type { PowerUp } from '@/types/game';

/**
 * Potere aperto: lo stesso pop up delle carte, nella forma della carta speciale (cornice della famiglia).
 * Dice cosa fa, quanto dura e quando si usa. Azioni: secondaria a sinistra, primaria gialla a destra.
 */
export function PowerSheet({
  power,
  role,
  from,
  note,
  primary,
  secondary,
  onClose,
}: {
  power?: PowerUp;
  role?: 'main' | 'secondary';
  from?: CardRect;
  /** Perché non si può usare adesso, o cosa succede */
  note?: string;
  primary?: RowAction;
  secondary?: RowAction;
  onClose: () => void;
}) {
  const { width, height } = useWindowDimensions();
  const w = Math.min(340, width - 32, (height - 64) * PLAY_RATIO);
  return (
    <ObjectModal
      visible={!!power}
      resetKey={power?.id}
      from={from}
      width={w}
      height={w / PLAY_RATIO}
      closeLabel="Chiudi il potere"
      onClose={onClose}>
      {(close) => {
        if (!power) return null;
        const run = (a: RowAction) => () => {
          a.onPress();
          close();
        };
        return (
          <View style={[styles.shell, { boxShadow: powerGlow(power) } as ViewStyle]}>
            <View style={styles.frame}>
              <PowerFrame id={`sheet-f-${power.id}`} power={power} />
              <View style={styles.card}>
                <PowerArt id={`sheet-${power.id}`} vertical glow={finishOf(power).glow} />
                <View style={styles.top}>
                  <PowerKind role={role} power={power} />
                  <SheetClose onPress={close} ink="#FFFFFF" onDark />
                </View>
                <View style={styles.art}>
                  <Text style={styles.emoji} allowFontScaling={false}>
                    {power.emoji}
                  </Text>
                </View>
                <AppText variant="headline" color="#FFFFFF" style={styles.title}>
                  {power.label}
                  {power.premium ? ' · Premium' : ''}
                </AppText>
                <AppText variant="body" color="rgba(255,255,255,0.85)" style={styles.desc}>
                  {power.description}
                </AppText>
                <AppText variant="caption" color="rgba(255,255,255,0.65)" style={styles.regular}>
                  {power.hours > 0 ? `Dura ${power.hours} ${power.hours === 1 ? 'ora' : 'ore'}` : 'Effetto immediato'} ·
                  Una volta a partita
                </AppText>
                {note ? (
                  <AppText variant="micro" color="#FFE382" style={styles.note}>
                    {note}
                  </AppText>
                ) : null}
                {primary || secondary ? (
                  <ActionRow
                    onDark
                    secondary={secondary && { ...secondary, onPress: run(secondary) }}
                    primary={primary && { ...primary, onPress: run(primary) }}
                  />
                ) : null}
              </View>
            </View>
          </View>
        );
      }}
    </ObjectModal>
  );
}

const styles = StyleSheet.create({
  shell: { flex: 1, borderRadius: 28 },
  frame: { flex: 1, borderRadius: 28, overflow: 'hidden', padding: 7 },
  card: { flex: 1, borderRadius: 22, overflow: 'hidden', padding: space.md, gap: space.xs },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  art: { flex: 1, minHeight: 48, alignItems: 'center', justifyContent: 'center' },
  emoji: { fontSize: 76, lineHeight: 90 },
  title: { fontSize: 24, lineHeight: 28, fontWeight: '700' },
  desc: { fontSize: 14, lineHeight: 19 },
  regular: { fontWeight: '400' },
  note: { fontWeight: '700' },
});
