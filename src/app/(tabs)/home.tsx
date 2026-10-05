import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Image, ImageBackground, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { images } from '../../assets';
import { LearnCarousel } from '../../components/LearnCarousel';
import { StatusChip } from '../../components/StatusChip';
import { SuitabilityBadge } from '../../components/SuitabilityBadge';
import { currentUser, recordsService, sensorService } from '../../services';
import { colors, fonts, radius } from '../../theme';
import type { AssessmentRecord, SensorStatus } from '../../types';

const SHADOW = {
  elevation: 6,
  shadowColor: '#000',
  shadowOpacity: 0.25,
  shadowRadius: 4,
  shadowOffset: { width: 0, height: 4 },
} as const;

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [sensorStatus, setSensorStatus] = useState<SensorStatus>('disconnected');
  const [recent, setRecent] = useState<AssessmentRecord[]>([]);

  // TODO(Phase 5): real GPS status from expo-location
  const gpsActive = true;

    // Runs every time Home comes into view, so the chips and recent list stay fresh.
  useFocusEffect(
    useCallback(() => {
      // TODO(Phase 4): subscribe to live sensor status instead of reading on focus.
      setSensorStatus(sensorService.getStatus());
      recordsService.list().then((all) => setRecent(all.slice(0, 3)));
    }, []),
  );

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={{ paddingTop: insets.top + 10, paddingHorizontal: 16, paddingBottom: 32 }}
    >
      {/* Hero */}
      <ImageBackground
        source={images.hero}
        style={styles.hero}
        imageStyle={styles.heroImg}
      >
        <Image source={images.logo} style={styles.heroLogo} resizeMode="contain" />
        {/* TODO(Phase 6): open a menu (or go to Account) */}
        <Pressable style={styles.menu} accessibilityLabel="Menu" hitSlop={8}>
          <Ionicons name="menu" size={40} color="#fff" />
        </Pressable>
        <Text style={styles.welcome} numberOfLines={1} adjustsFontSizeToFit>
          Welcome, {currentUser.name}
        </Text>
        <Text style={styles.sub}>Power mangrove restoration, one site at a time.</Text>
        <View style={styles.chips}>
          <StatusChip
            label={sensorStatus === 'connected' ? 'Sensor Connected' : 'Sensor Not Connected'}
            active={sensorStatus === 'connected'}
          />
          <StatusChip label={gpsActive ? 'GPS Active' : 'GPS Off'} active={gpsActive} />
        </View>
      </ImageBackground>

      <LearnCarousel />

      <Text style={styles.label}>RECENT ACTIVITY</Text>
      <View style={styles.recent}>
        {recent.length === 0 && (
          <Text style={styles.empty}>No assessments yet. Tap the location button to start.</Text>
        )}
        {recent.map((r) => (
        // TODO(Phase 3): open this record's report instead of the list.
          <Pressable key={r.id} style={styles.row} onPress={() => router.navigate('/records')}>
            <View style={{ flex: 1 }}>
              <Text style={styles.site}>{r.siteName}</Text>
              <Text style={styles.date}>
                {new Date(r.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </Text>
            </View>
            <View style={styles.right}>
              <Ionicons name="information-circle-outline" size={14} color={colors.textMuted} />
              <SuitabilityBadge value={r.suitability} variant="plain" />
            </View>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },

  hero: { height: 205, borderRadius: radius.xl, backgroundColor: colors.primary, ...SHADOW },
  heroImg: { borderRadius: radius.xl },
  heroLogo: { position: 'absolute', left: 8, top: 6, width: 48, height: 48 },
  menu: { position: 'absolute', right: 13, top: 8 },
  welcome: {
    position: 'absolute', left: 18, right: 14, top: 52,
    fontFamily: fonts.hindSemiBold, fontSize: 40, color: '#fff',
  },
  sub: { position: 'absolute', left: 21, top: 113, fontFamily: fonts.hindMedium, fontSize: 13, color: '#fff' },
  chips: { position: 'absolute', left: 21, top: 142, flexDirection: 'row' },

  banner: {
    height: 85, marginTop: 24, borderRadius: radius.card, overflow: 'hidden',
    backgroundColor: colors.tint, justifyContent: 'center', paddingHorizontal: 15,
  },

  label: { fontFamily: fonts.hindMedium, fontSize: 10, color: colors.textLabel, marginTop: 12, marginLeft: 11, marginBottom: 14 },
  recent: { backgroundColor: '#fff', borderRadius: radius.xl, minHeight: 191, paddingHorizontal: 14, paddingTop: 4, ...SHADOW },
  empty: { fontFamily: fonts.hindRegular, color: colors.textMuted, paddingVertical: 14 },
  row: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 11,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#BDBDBD',
  },
  site: { fontFamily: fonts.hindSemiBold, fontSize: 12, color: colors.text },
  date: { fontFamily: fonts.hindRegular, fontSize: 10, color: colors.textMuted, marginTop: 2 },
  right: { alignItems: 'flex-end', gap: 2 },
});
