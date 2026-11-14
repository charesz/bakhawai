import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts } from '../theme';

export function StatusChip({ label, active }: { label: string; active: boolean }) {
  return (
    <View style={styles.chip}>
      <View style={[styles.dot, { backgroundColor: active ? colors.greenLight : '#C0C0C0' }]} />
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 50,
    paddingVertical: 2,
    paddingLeft: 4,
    paddingRight: 8,
    marginRight: 6,
  },
  dot: { width: 10, height: 10, borderRadius: 5, marginRight: 4 },
  label: { fontFamily: fonts.hindLight, fontSize: 10, color: colors.chipText },
});
