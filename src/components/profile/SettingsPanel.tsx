import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Switch, View } from 'react-native';

import { NotifLevelPicker } from '@/components/profile/NotifLevelPicker';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { confirmAction } from '@/lib/confirm';
import { haptics } from '@/lib/haptics';
import { useSessionStore, type Visibility } from '@/store/useSessionStore';
import { useUiStore } from '@/store/useUiStore';
import { colors, radius, space } from '@/theme/tokens';

const VISIBILITY: { id: Visibility; label: string; note: string }[] = [
  { id: 'private', label: 'Solo tu', note: 'Nessuno vede trofei, scudi e carte' },
  { id: 'friends', label: 'Solo amici', note: 'La vedono i tuoi amici su Fanta.me' },
  { id: 'everyone', label: 'Tutti', note: 'Anche chi gioca con te senza essere amico' },
];

/**
 * Impostazioni essenziali, le stesse nel profilo e nella schermata dedicata:
 * notifiche, privacy della bacheca, vibrazione, account (esci ed elimina).
 */
export function SettingsPanel() {
  const router = useRouter();
  const s = useSessionStore();
  const showToast = useUiStore((u) => u.showToast);

  const signOut = () => {
    s.signOut();
    if (router.canDismiss()) router.dismissAll();
    router.replace('/welcome');
  };

  return (
    <View style={styles.wrap}>
      <View style={styles.group}>
        <AppText variant="headline">Notifiche</AppText>
        <AppText variant="caption" color={colors.inkSoft} style={styles.regular}>
          Valgono per le stanze nuove. Ogni stanza si può cambiare dal suo Profilo.
        </AppText>
        <NotifLevelPicker value={s.notifLevel} onChange={s.setNotifLevel} />
        <View style={styles.card}>
          <Row label="Silenzioso di notte" note="Niente notifiche dalle 23 alle 8" first>
            <Switch
              value={s.quietNight}
              onValueChange={s.setQuietNight}
              trackColor={{ true: colors.live, false: colors.surfaceMuted }}
              accessibilityLabel="Silenzioso di notte"
            />
          </Row>
          {s.notifLevel === 'digest' && (
            <Row label="Ora del riassunto" note="Quando arriva il riepilogo della giornata">
              <View style={styles.hours}>
                {[20, 22, 9].map((h) => (
                  <Pressable
                    key={h}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: s.digestHour === h }}
                    onPress={() => s.setDigestHour(h)}
                    style={[styles.hour, s.digestHour === h && styles.hourOn]}>
                    <AppText variant="caption">{h}:00</AppText>
                  </Pressable>
                ))}
              </View>
            </Row>
          )}
          <Row label="Richieste d'amicizia" note="Quando qualcuno ti aggiunge">
            <Switch
              value={s.notifications.friends}
              onValueChange={() => s.toggleNotification('friends')}
              trackColor={{ true: colors.live, false: colors.surfaceMuted }}
              accessibilityLabel="Richieste d'amicizia"
            />
          </Row>
        </View>
      </View>

      <Group title="Chi vede la tua bacheca">
        {VISIBILITY.map((o, i) => {
          const on = o.id === s.collectionVisibility;
          return (
            <Pressable
              key={o.id}
              accessibilityRole="radio"
              accessibilityState={{ selected: on }}
              onPress={() => {
                haptics.tap();
                s.setCollectionVisibility(o.id);
              }}>
              <Row label={o.label} note={o.note} first={i === 0}>
                <View style={[styles.radio, on && styles.radioOn]}>{on && <View style={styles.dot} />}</View>
              </Row>
            </Pressable>
          );
        })}
      </Group>

      <Group title="Gioco">
        <Row label="Vibrazione" note="Feedback al tocco su iPhone e Android" first>
          <Switch
            value={s.hapticsOn}
            onValueChange={s.setHaptics}
            trackColor={{ true: colors.live, false: colors.surfaceMuted }}
            accessibilityLabel="Vibrazione"
          />
        </Row>
      </Group>

      <Group title="Account">
        <View style={styles.account}>
          <Button label="Esci dall'account" variant="secondary" onPress={signOut} />
          <Button
            label="Elimina account"
            variant="tertiary"
            onPress={() =>
              confirmAction(
                'Eliminare l’account?',
                'Perdi stanze, carte e bacheca. Non si può annullare.',
                'Elimina',
                () => {
                  showToast({ text: 'Account eliminato (demo)' });
                  signOut();
                },
              )
            }
          />
        </View>
      </Group>
    </View>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.group}>
      <AppText variant="headline">{title}</AppText>
      <View style={styles.card}>{children}</View>
    </View>
  );
}

function Row({
  label,
  note,
  first,
  children,
}: {
  label: string;
  note: string;
  first?: boolean;
  children: React.ReactNode;
}) {
  return (
    <View style={[styles.row, !first && styles.divider]}>
      <View style={styles.flex}>
        <AppText variant="name">{label}</AppText>
        <AppText variant="caption" color={colors.inkSoft} style={styles.regular}>
          {note}
        </AppText>
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: space.lg },
  group: { gap: space.sm },
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.sm, padding: space.md },
  divider: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.hairline },
  flex: { flex: 1, gap: 2 },
  regular: { fontWeight: '400' },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOn: { borderColor: colors.ink },
  dot: { width: 12, height: 12, borderRadius: 6, backgroundColor: colors.ink },
  hours: { flexDirection: 'row', gap: 4 },
  hour: {
    paddingHorizontal: 8,
    height: 32,
    justifyContent: 'center',
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.hairline,
  },
  hourOn: { borderColor: colors.ink },
  account: { padding: space.md, gap: space.xs },
});
