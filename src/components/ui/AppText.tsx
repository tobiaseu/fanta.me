import { Text, type TextProps, type TextStyle } from 'react-native';

import { colors, type as typeScale } from '@/theme/tokens';

type Variant = keyof typeof typeScale;

interface Props extends TextProps {
  variant?: Variant;
  color?: string;
}

/** Testo tipizzato sulla scala tipografica dei token. */
export function AppText({ variant = 'body', color = colors.ink, style, ...rest }: Props) {
  return <Text {...rest} style={[typeScale[variant] as TextStyle, { color }, style]} />;
}
