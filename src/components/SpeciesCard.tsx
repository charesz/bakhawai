import { StyleSheet, Text, View } from 'react-native';
import type { SpeciesItem } from '../content/sampleResults';
import { fonts, suitabilityStyle } from '../theme';

type Props = { item: SpeciesItem; variant: 'recommended' | 'caution' };

const ACCENT_OK = '#44AA6D';
const ACCENT_CAUTION = '#E2A73A';

export function SpeciesCard({ item, variant }: Props) {
  const caution = variant === 'caution';
  const badge = caution ? suitabilityStyle.Marginal : suitabilityStyle.Suitable;

  return (
    // The colored box behind the white card shows as the colored left edge.
    <View style={[styles.outer, { backgroundColor: caution ? ACCENT_CAUTION : ACCENT_OK }]}>
      <View style={styles.card}>
        <View style={styles.top}>
          <Text style={styles.name}>{item.name}</Text>
          <View style={[styles.badge, { backgroundColor: badge.bg }]}>
            <Text style={[styles.badgeText, { color: badge.text }]}>{caution ? 'Caution' : 'Excellent'}</Text>
          </View>
        </View>
        <Text style={styles.common}>Common Name: {item.commonName}</Text>
        {caution && item.limitation ? (
          <Text style={styles.desc}>
            <Text style={styles.bold}>Environmental Limitation:</Text> {item.limitation}
          </Text>
        ) : (
          <Text style={styles.desc}>{item.description}</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: { borderRadius: 15, marginBottom: 13, marginHorizontal: 13 },
  card: {
    marginLeft: 8,
    backgroundColor: '#fff',
    borderRadius: 15,
    paddingVertical: 12,
    paddingLeft: 20,
    paddingRight: 12,
  },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  name: { flex: 1, fontFamily: fonts.interBold, fontSize: 13, color: '#434343' },
  badge: { borderRadius: 20, height: 16, minWidth: 58, paddingHorizontal: 8, alignItems: 'center', justifyContent: 'center' },
  badgeText: { fontFamily: fonts.interSemiBold, fontSize: 10 },
  common: { fontFamily: fonts.interItalic, fontStyle: 'italic', fontSize: 10, color: '#878787', marginTop: 2 },
  desc: { fontFamily: fonts.interMedium, fontSize: 10, lineHeight: 14, color: '#878787', marginTop: 8 },
  bold: { fontFamily: fonts.interBold, color: '#4D4D4D' },
});
