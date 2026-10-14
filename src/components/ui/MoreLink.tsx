import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

import { AppText } from './AppText';
import { PressableScale } from './PressableScale';

import { Icon } from '@/components/icons/Icon';
import { haptics } from '@/lib/haptics';
import { colors, space } from '@/theme/tokens';

/**
 * Piccola call to action "Guarda …  ›": l'unico modo per aprire una scheda secondaria.
 * Sempre arancio accento, sempre con la freccia: chi la tocca sa che si apre una pagina nuova.
 */
export function MoreLink({
  label,
  onPress,
  style,
}: {
  label: string;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <PressableScale
      accessibilityRole="link"
      accessibilityLabel={label}
      hitSlop={10}
      pressedScale={0.96}
      onPress={() => {
        haptics.tap();
        onPress();
      }}
      style={[styles.link, style]}>
      <AppText variant="caption" color={colors.accent}>
        {label}
      </AppText>
      <Icon name="chevron-right" size={14} strokeWidth={2.4} color={colors.accent} />
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  link: { flexDirection: 'row', alignItems: 'center', gap: 2, alignSelf: 'flex-start', paddingVertical: space.xxs },
});
