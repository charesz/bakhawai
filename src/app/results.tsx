import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PrimaryButton } from '../components/PrimaryButton';
import { assessmentDraft } from '../services/assessmentDraft';
import { colors, fonts, radius, suitabilityStyle } from '../theme';
import { FIELDS, formatField, type FieldKey } from '../utils/fields';
import { formatCoords } from '../utils/format';

// TEMPORARY screen. It only shows what was saved, so we can check the data arrives correctly.
// The real Results screen (suitability bars, species, synopsis) replaces this next.
export default function ResultsPlaceholder() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const draft = assessmentDraft.get();

  if (!draft) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top + 24, paddingHorizontal: 16 }]}>
        <Text style={styles.title}>No assessment yet</Text>
        <PrimaryButton label="Back" onPress={() => router.back()} />
      </View>
    );
  }

  const { input, result } = draft;
  const keys = Object.keys(FIELDS) as FieldKey[];

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={{ paddingTop: insets.top + 24, paddingHorizontal: 16, paddingBottom: 32 }}
    >
      <Text style={styles.title}>Site Assessment (placeholder)</Text>

      {result.warnings.map((w) => (
        <View key={w} style={styles.warning}>
          <Text style={styles.warningText}>{w}</Text>
        </View>
      ))}

      <View style={styles.card}>
        <Text style={styles.heading}>Result: {result.label}</Text>
        <Text style={styles.line}>Suitable: {result.scores.suitable}%</Text>
        <Text style={styles.line}>Marginal: {result.scores.marginal}%</Text>
        <Text style={styles.line}>Unsuitable: {result.scores.unsuitable}%</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.heading}>Location</Text>
        <Text style={styles.line}>{formatCoords(input.latitude, input.longitude)}</Text>
        <Text style={styles.line}>{input.address}</Text>
        <Text style={styles.line}>
          Source: {input.locationSource === 'gps' ? 'Phone GPS' : 'Placed on the map'}
          {input.gpsAccuracy_m !== null ? ` (accuracy about ${Math.round(input.gpsAccuracy_m)} m)` : ''}
        </Text>
        <Text style={styles.line}>Recorded: {new Date(input.capturedAt).toLocaleString('en-US')}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.heading}>Values used</Text>
        {keys.map((k) => (
          <Text key={k} style={styles.line}>
            {FIELDS[k].label}: {formatField(k, input.values[k].value)}
            {input.values[k].source === 'manual' ? '  (edited)' : ''}
          </Text>
        ))}
      </View>

      <PrimaryButton label="Back to Location" onPress={() => router.back()} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  title: { fontFamily: fonts.hindSemiBold, fontSize: 20, color: colors.headerText, marginBottom: 12 },
  card: { backgroundColor: '#fff', borderRadius: radius.card, padding: 16, marginBottom: 12 },
  heading: { fontFamily: fonts.hindSemiBold, fontSize: 15, color: colors.headerText, marginBottom: 6 },
  line: { fontFamily: fonts.hindRegular, fontSize: 13, color: colors.text, marginBottom: 3 },
  warning: {
    backgroundColor: suitabilityStyle.Marginal.bg,
    borderRadius: radius.card,
    padding: 12,
    marginBottom: 12,
  },
  warningText: { fontFamily: fonts.hindRegular, fontSize: 12, lineHeight: 18, color: suitabilityStyle.Marginal.text },
});
