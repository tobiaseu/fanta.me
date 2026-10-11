import { StyleSheet, View } from 'react-native';

import { AppText } from './AppText';
import { Icon } from '@/components/icons/Icon';
import { InfoDot } from '@/components/ui/InfoDot';
import { PressableScale } from './PressableScale';

import { colors, space } from '@/theme/tokens';

interface Props {
  title: string;
  /** Riga di contesto sotto il titolo */
  caption?: string;
  /** Link a destra (es. "Vedi tutto") */
  action?: { label: string; onPress: () => void };
  /** Concetto spiegato nel Libro del Fanta: mostra la "i" */
  info?: string;
}

/** Titolo di sezione unico per tutta l'app: 22/800, caption 15/400, link verde a destra. */
export function SectionHeader({ title, caption, action, info }: Props) {
  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <AppText variant="title" accessibilityRole="header" style={styles.flex}>
          {title}
        </AppText>
        {info ? <InfoDot topic={info} /> : null}
        {action && (
          <PressableScale accessibilityRole="link" hitSlop={10} onPress={action.onPress} style={styles.link}>
            <AppText variant="caption" color={colors.inkSoft}>
              {action.label}
            </AppText>
            <Icon name="chevron-right" size={14} color={colors.inkSoft} strokeWidth={1.6} />
          </PressableScale>
        )}
      </View>
      {caption ? (
        <AppText variant="body" color={colors.inkSoft}>
          {caption}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  link: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  wrap: { gap: 2 },
  row: { flexDirection: 'row', alignItems: 'baseline', gap: space.sm },
  flex: { flex: 1 },
});
