import { Image } from 'expo-image';

import { RubberHoseMascot } from './RubberHoseMascot';

import { colors } from '@/theme/tokens';
import type { Rule, StickerId } from '@/types/game';

const STICKERS: Record<StickerId, number> = {
  smurratona: require('@/assets/images/stickers/smurratona.png'),
};

/** Ratio larghezza/altezza degli sticker esportati dal Figma. */
const RATIO: Record<StickerId, number> = { smurratona: 244 / 219 };

/**
 * Illustrazione di una "carta trofeo": lo sticker dedicato se esiste,
 * altrimenti la mascotte rubber-hose (blu per i bonus, rossa per i malus).
 */
export function RuleSticker({ rule, size }: { rule: Rule; size: number }) {
  if (rule.sticker) {
    return (
      <Image
        source={STICKERS[rule.sticker]}
        style={{ width: size, height: size / RATIO[rule.sticker] }}
        contentFit="contain"
        accessibilityIgnoresInvertColors
      />
    );
  }
  const bonus = rule.points > 0;
  return (
    <RubberHoseMascot
      size={size * 0.82}
      color={bonus ? colors.toonBlue : colors.toonRed}
      pose={bonus ? 'cheer' : 'shrug'}
    />
  );
}
