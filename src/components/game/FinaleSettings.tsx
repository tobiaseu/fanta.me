import { StyleSheet, Switch, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Segmented } from '@/components/ui/Segmented';
import { colors, layout, radius, space } from '@/theme/tokens';
import type { GameSettings, SuddenDeath } from '@/types/game';

const SUDDEN: { id: SuddenDeath; label: string }[] = [
  { id: 'off', label: 'No' },
  { id: 'both', label: 'Tutti' },
  { id: 'bonus', label: 'Bonus' },
  { id: 'malus', label: 'Malus' },
];

/**
 * Avanzate dell'host sul finale (ultime 6 ore): classifica nascosta per la suspense
 * e sudden death stile Clash Royale, con punti doppi per bonus, malus o entrambi.
 */
export function FinaleSettings({
  settings,
  onChange,
  votes,
}: {
  settings: GameSettings;
  onChange: (patch: Partial<GameSettings>) => void;
  /** Mostra anche le conferme per un punto */
  votes?: boolean;
}) {
  return (
    <View style={styles.wrap}>
      {votes && (
        <Row label="Conferme per un punto" hint="Quanti devono dire sì perché una chiamata valga">
          <Segmented
            value={String(settings.votesToConfirm)}
            options={['2', '3', '4', '5'].map((v) => ({ id: v, label: v }))}
            onChange={(v) => onChange({ votesToConfirm: Number(v) })}
          />
        </Row>
      )}
      <View style={[styles.card, styles.switchRow]}>
        <View style={styles.flex}>
          <AppText variant="name">Classifica nascosta nel finale</AppText>
          <AppText variant="caption" color={colors.inkSoft} style={styles.regular}>
            Nelle ultime 6 ore nessuno vede la classifica: si scopre tutto ai risultati.
          </AppText>
        </View>
        <Switch
          value={Boolean(settings.hideFinal)}
          onValueChange={(v) => onChange({ hideFinal: v })}
          trackColor={{ true: colors.live, false: colors.surfaceMuted }}
          accessibilityLabel="Classifica nascosta nel finale"
        />
      </View>
      <Row label="Sudden death ⚡" hint="Nelle ultime 6 ore i punti valgono doppio. Scegli per quali.">
        <Segmented
          value={settings.suddenDeath ?? 'off'}
          options={SUDDEN}
          onChange={(v) => onChange({ suddenDeath: v })}
        />
      </Row>
    </View>
  );
}

function Row({ label, hint, children }: { label: string; hint: string; children: React.ReactNode }) {
  return (
    <View style={styles.card}>
      <AppText variant="name">{label}</AppText>
      <AppText variant="caption" color={colors.inkSoft} style={styles.regular}>
        {hint}
      </AppText>
      <View style={styles.control}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: space.sm },
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: layout.card, gap: 2 },
  switchRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  flex: { flex: 1, gap: 2 },
  regular: { fontWeight: '400' },
  control: { marginTop: space.sm },
});
