import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Sharing from 'expo-sharing';
import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PrimaryButton } from '../components/PrimaryButton';
import { ReportPopup } from '../components/ReportPopup';
import { SpeciesCard } from '../components/SpeciesCard';
import {
    RESULTS_ARE_SAMPLE,
    SAMPLE_CAUTION,
    SAMPLE_RECOMMENDED,
    buildGuidance,
    classificationText,
} from '../content/sampleResults';
import { recordsService } from '../services';
import { assessmentDraft } from '../services/assessmentDraft';
import { MODEL_IS_PLACEHOLDER } from '../services/assessmentService';
import { colors, fonts, radius, suitabilityStyle } from '../theme';
import type { Suitability } from '../types';
import { buildReportRows, createReportPdf, type ReportData } from '../utils/report';

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

// Card colors for the classification box.
const TONE: Record<Suitability, { bg: string; border: string; text: string }> = {
  Suitable: { bg: '#EAF7F1', border: '#91CFAF', text: '#2E7D32' },
  Marginal: { bg: '#FFF6E5', border: '#F0CF8A', text: '#B7791F' },
  Unsuitable: { bg: '#FDECEC', border: '#E8A5A5', text: '#B71C1C' },
};

function Bar({ label, pct, color }: { label: string; pct: number; color: string }) {
  return (
    <View style={styles.barRow}>
      <View style={styles.barLabels}>
        <Text style={styles.barText}>{label}</Text>
        <Text style={styles.barText}>{pct}%</Text>
      </View>
      <View style={styles.track}>
        <View style={{ flex: pct, backgroundColor: color, borderRadius: 10 }} />
        <View style={{ flex: 100 - pct }} />
      </View>
    </View>
  );
}

function InfoLine({ label, value }: { label: string; value: string }) {
  return (
    <Text style={styles.infoLine}>
      <Text style={styles.infoLabel}>{label}: </Text>
      {value}
    </Text>
  );
}

export default function ReportScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const [data, setData] = useState<ReportData | null>(null);
  const [popup, setPopup] = useState<'exporting' | 'exported' | null>(null);

  // Open a saved record (from Records) or the assessment that was just generated.
  useEffect(() => {
    (async () => {
      if (id) {
        const rec = await recordsService.get(id);
        if (rec?.input && rec.result) setData({ id: rec.id, input: rec.input, result: rec.result });
      } else {
        const d = assessmentDraft.get();
        if (d) setData({ id: d.savedId ?? 'Not saved yet', input: d.input, result: d.result });
      }
    })();
  }, [id]);

  const header = (
    <>
      <View style={{ height: insets.top }} />
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} accessibilityLabel="Back" hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color={colors.headerText} />
        </Pressable>
        <Text style={styles.headerTitle}>Field Assessment Report</Text>
      </View>
    </>
  );

  if (!data) {
    return (
      <View style={styles.screen}>
        {header}
        <Text style={styles.empty}>Report not found.</Text>
      </View>
    );
  }

  const { input, result } = data;
  const tone = TONE[result.label];
  const when = new Date(input.capturedAt);
  const whenText =
    `${when.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} / ` +
    `${when.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })} PST`;
  const rows = buildReportRows(input);

  const onExport = async () => {
    if (popup) return;
    setPopup('exporting');
    try {
      const uri = await createReportPdf(data);
      setPopup('exported');
      await wait(1400);
      setPopup(null);
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: 'Share field assessment report',
          UTI: 'com.adobe.pdf',
        });
      } else {
        Alert.alert('PDF created', `The PDF was saved here:\n${uri}`);
      }
    } catch {
      setPopup(null);
      Alert.alert('Could not export', 'The PDF could not be created. Please try again.');
    }
  };

  return (
    <View style={styles.screen}>
      {header}

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]}>
        {/* Site details */}
        <View style={styles.infoCard}>
          <InfoLine label="Field Site" value={input.address.replace(/^Near\s+/i, '')} />
          <InfoLine label="Assessment ID" value={data.id} />
          <InfoLine label="Date/Time" value={whenText} />
          <InfoLine label="Device" value={input.deviceName ?? 'Values entered by hand (no sensor)'} />
        </View>

        {/* Suitability classification */}
        <Text style={styles.label}>SUITABILITY CLASSIFICATION</Text>
        <View style={[styles.classCard, { backgroundColor: tone.bg, borderColor: tone.border }]}>
          <Text style={[styles.conclusion, { color: tone.text }]}>
            Classification Conclusion: {result.label.toUpperCase()}
          </Text>
          <Text style={styles.classText}>{classificationText(result.label)}</Text>
          {MODEL_IS_PLACEHOLDER && (
            <Text style={styles.sampleNote}>Scores come from a placeholder model (sample numbers).</Text>
          )}
          <Bar label="Suitable" pct={result.scores.suitable} color="#74C19A" />
          <Bar label="Marginal" pct={result.scores.marginal} color="#E6A23C" />
          <Bar label="Unsuitable" pct={result.scores.unsuitable} color="#D32F2F" />
        </View>

        {result.warnings.map((w) => (
          <View key={w} style={styles.warning}>
            <Text style={styles.warningText}>{w}</Text>
          </View>
        ))}

        {/* Field diagnostic table */}
        <Text style={[styles.label, { marginTop: 20 }]}>FIELD DIAGNOSTIC</Text>
        <View style={styles.table}>
          <View style={[styles.tr, styles.trHead]}>
            <Text style={[styles.thText, { flex: 1 }]}>Environmental Parameter</Text>
            <Text style={[styles.thText, { flex: 1, textAlign: 'right' }]}>Collected Reading</Text>
          </View>
          {rows.map((r, i) => (
            <View key={r.label} style={[styles.tr, { backgroundColor: i % 2 === 0 ? '#fff' : '#F8FAF9' }]}>
              <Text style={[styles.tdLabel, { flex: 1 }]}>{r.label}</Text>
              <Text style={[styles.tdValue, { flex: 1.1 }]}>
                <Text style={styles.tdBold}>{r.main}</Text>
                {r.extra}
              </Text>
            </View>
          ))}
        </View>

        {/* Species. TODO(Phase 7): real species from the species table. */}
        <View style={styles.sectionHead}>
          <Text style={styles.label}>RECOMMENDED SPECIES</Text>
          {RESULTS_ARE_SAMPLE && (
            <View style={styles.sampleTag}>
              <Text style={styles.sampleTagText}>SAMPLE</Text>
            </View>
          )}
        </View>
        {SAMPLE_RECOMMENDED.map((s) => (
          <SpeciesCard key={s.name} item={s} variant="recommended" />
        ))}

        <Text style={[styles.label, { marginTop: 10, marginBottom: 10 }]}>USE WITH CAUTION</Text>
        {SAMPLE_CAUTION.map((s) => (
          <SpeciesCard key={s.name} item={s} variant="caution" />
        ))}

        <Text style={[styles.label, { marginTop: 10, marginBottom: 10 }]}>FIELD GUIDANCE</Text>
        <View style={styles.guidance}>
          <Text style={styles.guidanceText}>{buildGuidance(input)}</Text>
        </View>

        <View style={styles.buttons}>
          <View style={{ width: 134 }}>
            <PrimaryButton size="small" label="Done" onPress={() => router.navigate('/records')} />
          </View>
          <View style={{ width: 134 }}>
            <PrimaryButton size="small" label="Export" onPress={onExport} />
          </View>
        </View>
      </ScrollView>

      <ReportPopup
        visible={popup !== null}
        mode={popup === 'exported' ? 'success' : 'loading'}
        title={popup === 'exported' ? 'Report Exported Successfully' : 'Exporting Report'}
        message={
          popup === 'exported'
            ? 'Your restoration assessment report has been exported as a PDF document.'
            : 'Please wait a moment.'
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  header: {
    height: 58,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 28,
    gap: 14,
  },
  headerTitle: { fontFamily: fonts.interMedium, fontSize: 18, color: colors.headerText },
  empty: { fontFamily: fonts.hindRegular, fontSize: 14, color: colors.textMuted, textAlign: 'center', marginTop: 40 },

  content: { paddingTop: 13 },

  infoCard: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#DADADA',
    borderRadius: 10,
    marginHorizontal: 13,
    padding: 14,
    gap: 8,
  },
  infoLine: { fontFamily: fonts.interRegular, fontSize: 12, color: colors.text },
  infoLabel: { fontFamily: fonts.interSemiBold },

  label: { fontFamily: fonts.interExtraBold, fontSize: 12, color: colors.textMuted, marginLeft: 31, marginTop: 18, marginBottom: 8 },
  sectionHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginRight: 31 },

  classCard: { borderWidth: 1, borderRadius: 10, marginHorizontal: 19, padding: 14 },
  conclusion: { fontFamily: fonts.interSemiBold, fontSize: 14 },
  classText: { fontFamily: fonts.interRegular, fontSize: 10, lineHeight: 14, color: '#434343', marginTop: 8 },
  sampleNote: { fontFamily: fonts.hindRegular, fontSize: 10, color: suitabilityStyle.Marginal.text, marginTop: 6 },
  barRow: { marginTop: 12 },
  barLabels: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  barText: { fontFamily: fonts.interMedium, fontSize: 11, color: colors.text },
  track: { height: 10, borderRadius: 10, backgroundColor: 'rgba(188,188,188,0.35)', flexDirection: 'row', overflow: 'hidden' },

  warning: {
    backgroundColor: suitabilityStyle.Marginal.bg,
    borderRadius: radius.card,
    padding: 12,
    marginTop: 12,
    marginHorizontal: 19,
  },
  warningText: { fontFamily: fonts.hindRegular, fontSize: 12, lineHeight: 18, color: suitabilityStyle.Marginal.text },

  table: {
    marginHorizontal: 19,
    borderRadius: 4,
    overflow: 'hidden',
    backgroundColor: '#fff',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 4 },
  },
  tr: { flexDirection: 'row', paddingHorizontal: 12, paddingVertical: 10, alignItems: 'center' },
  trHead: { backgroundColor: '#3C434B' },
  thText: { fontFamily: fonts.interSemiBold, fontSize: 11, color: '#fff' },
  tdLabel: { fontFamily: fonts.interRegular, fontSize: 11, color: colors.text },
  tdValue: { fontFamily: fonts.interRegular, fontSize: 10, color: colors.text, textAlign: 'right' },
  tdBold: { fontFamily: fonts.interSemiBold },

  sampleTag: {
    backgroundColor: suitabilityStyle.Marginal.bg,
    borderRadius: radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  sampleTagText: { fontFamily: fonts.interSemiBold, fontSize: 10, color: suitabilityStyle.Marginal.text },

  guidance: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#DADADA',
    borderRadius: 10,
    marginHorizontal: 12,
    padding: 14,
  },
  guidanceText: { fontFamily: fonts.interRegular, fontSize: 12, lineHeight: 18, color: colors.text },

  buttons: { flexDirection: 'row', justifyContent: 'center', gap: 23, marginTop: 24 },
});
