import { StyleSheet, Text, View } from 'react-native';
import { fonts, suitabilityStyle } from '../theme';
import type { Suitability } from '../types';

type Props = { value: Suitability; variant?: 'pill' | 'plain' };

export function SuitabilityBadge({ value, variant = 'pill' }: Props) {
  const s = suitabilityStyle[value];

  if (variant === 'plain') {
    return <Text style={[styles.plain, { color: s.plain }]}>{value}</Text>;
  }
  return (
    <View style={[styles.pill, { backgroundColor: s.bg }]}>
      <Text style={[styles.pillText, { color: s.text }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: { minWidth: 66, height: 16, borderRadius: 20, paddingHorizontal: 10, alignItems: 'center', justifyContent: 'center' },
  pillText: { fontFamily: fonts.interSemiBold, fontSize: 10 },
  plain: { fontFamily: fonts.hindBold, fontSize: 10 },
});