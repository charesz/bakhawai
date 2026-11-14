import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Gauge } from '../components/Gauge';
import { PrimaryButton } from '../components/PrimaryButton';
import { ReportPopup } from '../components/ReportPopup';
import { SpeciesCard } from '../components/SpeciesCard';
import { RESULTS_ARE_SAMPLE, SAMPLE_CAUTION, SAMPLE_RECOMMENDED, buildSynopsis } from '../content/sampleResults';
import { assessmentDraft } from '../services/assessmentDraft';
import { MODEL_EC_RANGE_DSM, MODEL_IS_PLACEHOLDER } from '../services/assessmentService';
import { saveCurrentAssessment } from '../services/saveAssessment';
import { colors, fonts, radius, suitabilityStyle } from '../theme';
import type { Suitability } from '../types';
import { formatEC, formatPH } from '../utils/format';

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

// The banner at the top changes with the result. Only "Suitable" exists in the Figma.
const BANNER: Record<Suitability, { icon: keyof typeof Ionicons.glyphMap; color: string; bg: string; title: string }> = {
  Suitable: { icon: 'checkmark-circle-outline', color: '#3C9B63', bg: 'rgba(227,255,238,0.51)', title: 'Suitable Site Match' },
  Marginal: { icon: 'alert-circle-outline', color: '#E2A73A', bg: 'rgba(255,236,201,0.6)', title: 'Marginal Site Match' },
  Unsuitable: { icon: 'close-circle-outline', color: '#C24D4F', bg: 'rgba(255,224,225,0.6)', title: 'Unsuitable Site Match' },
};

function ScoreBar({ label, pct, color }: { label: string; pct: number; color: string }) {
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

function SampleTag({ show = RESULTS_ARE_SAMPLE }: { show?: boolean }) {
  if (!show) return null;
  return (
    <View style={styles.sampleTag}>
      <Text style={styles.sampleTagText}>SAMPLE</Text>
    </View>
  );
}

export default function ResultsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const draft = assessmentDraft.get();
  const [popup, setPopup] = useState<'generating' | 'saved' | null>(null);

  const header = (
    <>
      <View style={{ height: insets.top }} />
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} accessibilityLabel="Back" hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color={colors.headerText} />
        </Pressable>
        <Text style={styles.headerTitle}>Site Assessment</Text>
      </View>
    </>
  );

  if (!draft) {
    return (
      <View style={styles.screen}>
        {header}
        <Text style={styles.empty}>No assessment yet. Scan a site first.</Text>
      </View>
    );
  }

  const { input, result } = draft;
  const banner = BANNER[result.label];
  const topScore = Math.max(result.scores.suitable, result.scores.marginal, result.scores.unsuitable);
  const ec = formatEC(input.values.ec_uScm.value);
  const phValue = input.values.ph.value;
  const ecDsm = input.values.ec_uScm.value / 1000; // 1 dS/m = 1,000 µS/cm
  const ecAboveModel = ecDsm > MODEL_EC_RANGE_DSM.max;

  const onGenerateReport = async () => {
    if (popup) return;
    setPopup('generating');
    try {
      await wait(1500);
      await saveCurrentAssessment(); // saves to Records (only once)
      setPopup('saved');
      await wait(1800);
    } catch {
      setPopup(null);
      Alert.alert('Could not save the report', 'Something went wrong. Please try again.');
      return;
    }
    setPopup(null);
    router.push('/report');
  };

  return (
    <View style={styles.screen}>
      {header}

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]}>
        {/* Result banner */}
        <View style={[styles.banner, { backgroundColor: banner.bg }]}>
          <Ionicons name={banner.icon} size={110} color={banner.color} />
          <Text style={[styles.bannerTitle, { color: banner.color }]}>{banner.title}</Text>
        </View>

        {/* Warnings, for example when EC is outside the range the model was trained on */}
        {result.warnings.map((w) => (
          <View key={w} style={styles.warning}>
            <Text style={styles.warningText}>{w}</Text>
          </View>
        ))}

        {/* Suitability score */}
        <View style={[styles.card, { borderRadius: radius.card }]}>
          <View style={styles.labelRow}>
            <Text style={styles.label}>SUITABILITY SCORE</Text>
            <SampleTag show={MODEL_IS_PLACEHOLDER} />
          </View>
          <ScoreBar label="Suitable" pct={result.scores.suitable} color="#63B484" />
          <ScoreBar label="Marginal" pct={result.scores.marginal} color="#E2A73A" />
          <ScoreBar label="Unsuitable" pct={result.scores.unsuitable} color="#C24D4F" />
        </View>

        {/* Sensor metrics */}
        <View style={styles.card}>
          <Text style={styles.label}>SENSOR METRICS</Text>
            <View style={styles.gauges}>
            <Gauge
              value={formatPH(phValue)}
              label="pH Level"
              fraction={phValue / 14}
              caption="Scale 0 to 14"
              edited={input.values.ph.source === 'manual'}
            />
            <Gauge
              value={ec.value}
              label={`${ec.unit} EC`}
              fraction={ecDsm / MODEL_EC_RANGE_DSM.max}
              color={ecAboveModel ? '#E2A73A' : colors.green}
              caption={ecAboveModel ? 'Above model range' : 'Within model range'}
              captionColor={ecAboveModel ? '#E2A73A' : colors.textMuted}
              edited={input.values.ec_uScm.source === 'manual'}
            />
          </View>
        </View>
        
        {/* Ecological synopsis */}
        <View style={styles.card}>
          <View style={styles.labelRow}>
            <Text style={styles.label}>ECOLOGICAL SYNOPSIS</Text>
            <SampleTag />
          </View>
          <Text style={styles.synopsis}>{buildSynopsis(result.label, topScore)}</Text>
        </View>

        {/* Species. TODO(Phase 7): real top 3 and caution species from the species table. */}
        <View style={styles.sectionHead}>
          <Text style={styles.label}>HIGHLY RECOMMENDED SPECIES</Text>
          <SampleTag />
        </View>
        {SAMPLE_RECOMMENDED.map((s) => (
          <SpeciesCard key={s.name} item={s} variant="recommended" />
        ))}

        <View style={[styles.sectionHead, { marginTop: 10 }]}>
          <Text style={styles.label}>USE WITH CAUTION</Text>
          <SampleTag />
        </View>
        {SAMPLE_CAUTION.map((s) => (
          <SpeciesCard key={s.name} item={s} variant="caution" />
        ))}

        <View style={styles.reportBtn}>
          <PrimaryButton size="small" variant="outline" label="Generate Report" onPress={onGenerateReport} />
        </View>
      </ScrollView>

        <ReportPopup
        visible={popup !== null}
        mode={popup === 'saved' ? 'success' : 'loading'}
        title={popup === 'saved' ? 'Report Generated Successfully' : 'Generating Report'}
        message={
          popup === 'saved'
            ? 'Your assessment report has been saved. You can access this report anytime from the Records section.'
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

  content: { paddingTop: 10, paddingBottom: 32 },

  banner: { borderRadius: radius.card, height: 182, alignItems: 'center', justifyContent: 'center' },
  bannerTitle: { fontFamily: fonts.interExtraBold, fontSize: 28, marginTop: 4 },

  warning: {
    backgroundColor: suitabilityStyle.Marginal.bg,
    borderRadius: radius.card,
    padding: 12,
    marginTop: 12,
    marginHorizontal: 13,
  },
  warningText: { fontFamily: fonts.hindRegular, fontSize: 12, lineHeight: 18, color: suitabilityStyle.Marginal.text },

  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginTop: 17,
    marginHorizontal: 13,
    paddingHorizontal: 22,
    paddingTop: 12,
    paddingBottom: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 4 },
  },
  label: { fontFamily: fonts.interExtraBold, fontSize: 12, color: colors.textMuted },
  labelRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 22,
    marginBottom: 10,
    marginHorizontal: 31,
  },

  barRow: { marginTop: 14 },
  barLabels: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5, paddingHorizontal: 3 },
  barText: { fontFamily: fonts.interMedium, fontSize: 11, color: colors.text },
  track: { height: 13, borderRadius: 10, backgroundColor: '#D9D9D9', flexDirection: 'row', overflow: 'hidden' },

  gauges: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 14 },

  synopsis: { fontFamily: fonts.interRegular, fontSize: 11, lineHeight: 15, color: colors.text, marginTop: 12 },

  sampleTag: {
    backgroundColor: suitabilityStyle.Marginal.bg,
    borderRadius: radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  sampleTagText: { fontFamily: fonts.interSemiBold, fontSize: 10, color: suitabilityStyle.Marginal.text },

  reportBtn: { alignSelf: 'center', width: 220, marginTop: 20 },
});