import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useFocusEffect, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, BackHandler, Keyboard, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { EditValueModal } from '../../components/EditValueModal';
import { PinMarker } from '../../components/PinMarker';
import { PrimaryButton } from '../../components/PrimaryButton';
import { SiteMap, TILE_SOURCE, type SiteMapHandle } from '../../components/SiteMap';
import { assessmentModel, locationService, sensorService } from '../../services';
import { assessmentDraft } from '../../services/assessmentDraft';
import { runAssessment } from '../../services/assessmentService';
import { ENV_IS_SAMPLE } from '../../services/locationService';
import { colors, fonts, radius, suitabilityStyle } from '../../theme';
import type { AssessmentInput, EnvVariables, LocationSource, SensorReading, SensorStatus } from '../../types';
import { FIELDS, formatField, type FieldKey } from '../../utils/fields';
import { formatCoords, formatEC, formatPH } from '../../utils/format';
import { distanceMeters } from '../../utils/geo';

type Stage = 'pick' | 'confirmed';

// Cagayan de Oro (the sample location in the Figma). Used until GPS gives a real position.
const DEFAULT_CENTER = { latitude: 8.4542, longitude: 124.6319 };

// TODO(Phase 5): replace this circle with the real site boundary.
const SITE_RADIUS_M = 50;

// The four values shown on the info card, in this order.
const ENV_FIELDS: FieldKey[] = ['elevation_m', 'slope_deg', 'distToRiver_m', 'distToCoast_m'];

export default function LocationScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const mapRef = useRef<SiteMapHandle>(null);
  const lookupId = useRef(0);
  const stageRef = useRef<Stage>('pick'); // same as `stage`, but readable inside callbacks
  const lastFix = useRef<{ latitude: number; longitude: number; accuracy: number | null } | null>(null);

  const [stage, setStage] = useState<Stage>('pick');
  const [center, setCenter] = useState(DEFAULT_CENTER);
  const [address, setAddress] = useState('Move the map to choose your site');
  const [gps, setGps] = useState<'checking' | 'granted' | 'denied'>('checking');
  const [query, setQuery] = useState('');
  const [searchMsg, setSearchMsg] = useState('');
  const [sensorStatus, setSensorStatus] = useState<SensorStatus>(sensorService.getStatus());
  const [reading, setReading] = useState<SensorReading | null>(null);
  const [readingsOpen, setReadingsOpen] = useState(false);
  const [panelOpen, setPanelOpen] = useState(true);
  const [sheetH, setSheetH] = useState(216);

  // Confirmed-site data
    const [site, setSite] = useState<{
    latitude: number;
    longitude: number;
    address: string;
    at: Date;
    source: LocationSource;
    accuracy: number | null;
  } | null>(null);
  const [scanning, setScanning] = useState(false);
  const [env, setEnv] = useState<EnvVariables | null>(null);
  const [overrides, setOverrides] = useState<Partial<Record<FieldKey, number>>>({}); // values typed by hand
  const [editing, setEditing] = useState<FieldKey | null>(null);
  const [loadingSite, setLoadingSite] = useState(false);

  const confirmed = stage === 'confirmed';

  // Automatic values come from the service (site values) or the sensor. Typed values win.
  const autoValues: Record<FieldKey, number | null> = {
    elevation_m: env?.elevation_m ?? null,
    slope_deg: env?.slope_deg ?? null,
    distToRiver_m: env?.distToRiver_m ?? null,
    distToCoast_m: env?.distToCoast_m ?? null,
    ec_uScm: reading?.ec_uScm ?? null,
    ph: reading?.ph ?? null,
  };
  const valueOf = (k: FieldKey): number | null => overrides[k] ?? autoValues[k];
  const isEdited = (k: FieldKey) => overrides[k] !== undefined;
  const missing = (Object.keys(FIELDS) as FieldKey[]).filter((k) => valueOf(k) === null);

  const ecVal = valueOf('ec_uScm');
  const phVal = valueOf('ph');
  const ec = ecVal !== null ? formatEC(ecVal) : null;

  // Light status bar icons over the dark map, and a fresh sensor status each time the screen shows.
  useFocusEffect(
    useCallback(() => {
      StatusBar.setStyle('light');
      const status = sensorService.getStatus();
      setSensorStatus(status);
      if (status === 'connected') {
        setReading(sensorService.getLastReading());
        if (!sensorService.getLastReading()) {
          sensorService.readOnce().then(setReading).catch(() => {});
        }
      } else {
        setReading(null); // not connected: no readings, same as the Device screen
      }
      return () => StatusBar.setStyle('dark');
    }, []),
  );

  // Go back from the confirmed view to choosing a location.
  const backToPick = useCallback(() => {
    stageRef.current = 'pick';
    setStage('pick');
    setSite(null);
    setEnv(null);
    setOverrides({});
    setReadingsOpen(false);
    mapRef.current?.clearSite();
  }, []);

  // The phone's back button does the same thing while a site is confirmed.
  useFocusEffect(
    useCallback(() => {
      const sub = BackHandler.addEventListener('hardwareBackPress', () => {
        if (stageRef.current === 'confirmed') {
          backToPick();
          return true;
        }
        return false;
      });
      return () => sub.remove();
    }, [backToPick]),
  );

  // Ask for GPS permission and move the map to the phone's position.
  const goToMyLocation = useCallback(async () => {
    try {
      const perm = await Location.requestForegroundPermissionsAsync();
      if (perm.status !== 'granted') {
        setGps('denied');
        return;
      }
      setGps('granted');
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      lastFix.current = {
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        accuracy: pos.coords.accuracy ?? null,
      };
      mapRef.current?.showUser(pos.coords.latitude, pos.coords.longitude);
      mapRef.current?.flyTo(pos.coords.latitude, pos.coords.longitude, 18);
      // TODO(Phase 5): keep pos.coords.accuracy and show "GPS accuracy ± x m" so users know how far to trust it.
    } catch {
      setSearchMsg('Could not get your GPS position. Try outdoors, or move the map by hand.');
    }
  }, []);

  useEffect(() => {
    goToMyLocation();
  }, [goToMyLocation]);

  // Every time the map stops moving, read the center point and look up a nearby address.
  const onCenterChange = useCallback(async (latitude: number, longitude: number) => {
    if (stageRef.current === 'confirmed') return; // the confirmed spot must not move
    setCenter({ latitude, longitude });
    const id = ++lookupId.current;
    await new Promise((resolve) => setTimeout(resolve, 400)); // wait: skip lookups if the map is still moving
    if (id !== lookupId.current) return;
    try {
      const res = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (id !== lookupId.current) return;
      const a = res[0];
      const line = a ? [a.street ?? a.name, a.district ?? a.city ?? a.subregion].filter(Boolean).join(', ') : '';
      setAddress(line !== '' ? `Near ${line}` : formatCoords(latitude, longitude));
    } catch {
      if (id === lookupId.current) setAddress(formatCoords(latitude, longitude));
    }
  }, []);

  // Type a place name and move the map there.
  const onSearch = async () => {
    Keyboard.dismiss();
    const q = query.trim();
    if (q === '') return;
    setSearchMsg('Searching…');
    try {
      const found = await Location.geocodeAsync(q);
      if (found.length === 0) {
        setSearchMsg('Place not found. Try adding the city, for example "Bonbon, Cagayan de Oro".');
        return;
      }
      setSearchMsg('');
      mapRef.current?.flyTo(found[0].latitude, found[0].longitude, 17);
    } catch {
      setSearchMsg('Search is not available right now. Move the map by hand instead.');
    }
  };

  // Lock in the location, get the site values, and show the site view.
  const onConfirm = async () => {
    if (loadingSite) return;
    setLoadingSite(true);
    try {
      const values = await locationService.getEnvironment(center.latitude, center.longitude);
      stageRef.current = 'confirmed';
      setEnv(values);
            // "gps" if the pin is within 30 m of the phone's last GPS position, otherwise "map" (placed by hand).
      const fix = lastFix.current;
      const fromGps =
        fix !== null && distanceMeters(center.latitude, center.longitude, fix.latitude, fix.longitude) <= 30;
      setSite({
        ...center,
        address,
        at: new Date(),
        source: fromGps ? 'gps' : 'map',
        accuracy: fromGps && fix ? fix.accuracy : null,
      });
      setOverrides({});
      setReadingsOpen(true);
      setPanelOpen(true);
      setStage('confirmed');
      mapRef.current?.showSite(center.latitude, center.longitude, SITE_RADIUS_M);
    } finally {
      setLoadingSite(false);
    }
  };

    // Save everything the Results screen needs, run the (sample) model, and open the Results screen.
  const onScan = async () => {
    if (!site || missing.length > 0 || scanning) return;
    setScanning(true);
    try {
      const values = {} as AssessmentInput['values'];
      (Object.keys(FIELDS) as FieldKey[]).forEach((k) => {
        values[k] = { value: valueOf(k) as number, source: isEdited(k) ? 'manual' : 'auto' };
      });
      const input: AssessmentInput = {
        latitude: site.latitude,
        longitude: site.longitude,
        address: site.address,
        locationSource: site.source,
        gpsAccuracy_m: site.accuracy,
        capturedAt: site.at.toISOString(),
        values,
      };
      const result = await runAssessment(assessmentModel, input);
      assessmentDraft.set(input, result);
      router.push('/results');
    } catch {
      Alert.alert('Could not scan the site', 'Something went wrong. Please try again.');
    } finally {
      setScanning(false);
    }
  };

  const saveEdit = (n: number) => {
    if (!editing) return;
    setOverrides((o) => ({ ...o, [editing]: n }));
    setEditing(null);
  };

  const resetEdit = () => {
    if (!editing) return;
    setOverrides((o) => {
      const next = { ...o };
      delete next[editing];
      return next;
    });
    setEditing(null);
  };

  const sensorOk = sensorStatus === 'connected';
  const bottomOffset = (panelOpen ? sheetH : insets.bottom) + 10;
  const shownAddress = confirmed && site ? site.address : address;

  return (
    <View style={styles.screen}>
      <SiteMap
        ref={mapRef}
        initialLatitude={DEFAULT_CENTER.latitude}
        initialLongitude={DEFAULT_CENTER.longitude}
        onCenterChange={onCenterChange}
      />

      {!confirmed && <PinMarker />}

      <Text style={[styles.attribution, { bottom: bottomOffset - 4 }]}>{TILE_SOURCE.attribution}</Text>

      {/* Top bar: back button, and the search bar while choosing a location */}
      <View style={[styles.topBar, { top: insets.top + 12 }]}>
        <Pressable
          style={styles.backBtn}
          onPress={() => (confirmed ? backToPick() : router.navigate('/home'))}
          accessibilityLabel="Back"
          hitSlop={8}
        >
          <Ionicons name="arrow-back" size={22} color={colors.primary} />
        </Pressable>
        {!confirmed && (
          <View style={styles.search}>
            <Ionicons name="search" size={22} color={colors.headerText} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search here"
              placeholderTextColor={colors.textMuted}
              value={query}
              onChangeText={setQuery}
              onSubmitEditing={onSearch}
              returnKeyType="search"
            />
          </View>
        )}
      </View>

      {!confirmed && searchMsg !== '' && (
        <View style={[styles.msg, { top: insets.top + 12 + 33 + 8 }]}>
          <Text style={styles.msgText}>{searchMsg}</Text>
        </View>
      )}

      {/* Map buttons (only while choosing): my location, and hide/show the bottom panel */}
      {!confirmed && (
        <View style={[styles.controls, { bottom: bottomOffset }]}>
          <Pressable style={styles.ctrl} onPress={goToMyLocation} accessibilityLabel="Go to my location">
            <Ionicons name="navigate-circle-outline" size={28} color={colors.primary} />
          </Pressable>
          <Pressable
            style={styles.ctrl}
            onPress={() => setPanelOpen((open) => !open)}
            accessibilityLabel={panelOpen ? 'Hide panel' : 'Show panel'}
          >
            <Ionicons name={panelOpen ? 'expand-outline' : 'contract-outline'} size={26} color={colors.primary} />
          </Pressable>
        </View>
      )}

      {/* Site info card (after Confirm). Tap a value to edit it. */}
      {confirmed && site && (
        <View style={[styles.infoCard, { bottom: sheetH + 12 }]}>
          <View style={styles.infoHead}>
            <Ionicons name="location" size={14} color="#fff" />
            <Text style={styles.coords}>{formatCoords(site.latitude, site.longitude)}</Text>
          </View>
          <View style={styles.infoLine} />
          <Text style={styles.stamp}>
            Live System Time Stamp:{' '}
            {site.at.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </Text>

          {ENV_FIELDS.map((k) => (
            <Pressable
              key={k}
              style={styles.infoRow}
              onPress={() => setEditing(k)}
              accessibilityRole="button"
              accessibilityLabel={`Edit ${FIELDS[k].label}`}
            >
              <Text style={styles.infoLabel}>{FIELDS[k].label}</Text>
              <View style={styles.infoValueWrap}>
                {isEdited(k) && <Ionicons name="pencil" size={10} color="#fff" />}
                <Text style={styles.infoValue}>{formatField(k, valueOf(k))}</Text>
              </View>
            </Pressable>
          ))}

          <Text style={styles.infoHint}>
            {ENV_IS_SAMPLE ? 'Sample values · tap a value to edit' : 'Tap a value to edit'}
          </Text>
        </View>
      )}

      {/* Bottom panel */}
      {panelOpen && (
        <View
          style={[styles.sheet, { paddingBottom: insets.bottom + 16 }]}
          onLayout={(e) => setSheetH(e.nativeEvent.layout.height)}
        >
          <View style={styles.handle} />

          <View style={styles.titleRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>Your Location</Text>
              <Text style={styles.address} numberOfLines={1}>
                {shownAddress}
              </Text>
            </View>
            {/* TODO(Phase 5): real temperature (needs internet), or remove this chip */}
            <View style={styles.weather}>
              <Ionicons name="cloudy-outline" size={16} color={colors.text} />
              <Text style={styles.weatherText}>30°</Text>
            </View>
          </View>

          {!confirmed && gps === 'denied' && (
            <Text style={styles.warn}>
              Location permission is off. Move the map to your site, or turn it on in your phone settings.
            </Text>
          )}

          <View style={styles.card}>
            {/* Tap this row to show or hide the sensor readings */}
            <Pressable
              style={styles.sensorRow}
              onPress={() => setReadingsOpen((open) => !open)}
              accessibilityRole="button"
              accessibilityLabel={readingsOpen ? 'Hide sensor readings' : 'Show sensor readings'}
            >
              <Ionicons
                name={sensorOk ? 'checkmark-circle-outline' : 'alert-circle-outline'}
                size={14}
                color={sensorOk ? colors.primary : '#9A9A9A'}
              />
              <Text style={styles.sensorText}>{sensorOk ? 'Sensor device is connected' : 'Sensor is not connected'}</Text>
              <Ionicons name={readingsOpen ? 'chevron-up' : 'chevron-down'} size={14} color="#333" />
            </Pressable>

            {(!confirmed || readingsOpen) && <View style={styles.divider} />}

            {readingsOpen && (
              <View style={[styles.tilesWrap, confirmed && { paddingBottom: 14 }]}>
                <View style={styles.tiles}>
                  <View style={styles.tile}>
                    <Text style={styles.tileLabel}>Soil EC</Text>
                    {ec ? (
                      <Text>
                        <Text style={styles.tileValue}>{ec.value}</Text>
                        <Text style={styles.tileUnit}> {ec.unit}</Text>
                      </Text>
                    ) : (
                      <Text style={styles.tileEmpty}>—</Text>
                    )}
                    {confirmed && (
                      <Pressable style={styles.gear} onPress={() => setEditing('ec_uScm')} hitSlop={10} accessibilityLabel="Edit soil EC">
                        <Ionicons name="settings-sharp" size={13} color="#6B6B6B" />
                      </Pressable>
                    )}
                    {isEdited('ec_uScm') && <Text style={styles.edited}>edited</Text>}
                  </View>

                  <View style={styles.tile}>
                    <Text style={styles.tileLabel}>Soil pH</Text>
                    {phVal !== null ? (
                      <Text style={styles.tileValue}>{formatPH(phVal)}</Text>
                    ) : (
                      <Text style={styles.tileEmpty}>—</Text>
                    )}
                    {confirmed && (
                      <Pressable style={styles.gear} onPress={() => setEditing('ph')} hitSlop={10} accessibilityLabel="Edit soil pH">
                        <Ionicons name="settings-sharp" size={13} color="#6B6B6B" />
                      </Pressable>
                    )}
                    {isEdited('ph') && <Text style={styles.edited}>edited</Text>}
                  </View>
                </View>

                {!sensorOk && (
                  <Pressable onPress={() => router.navigate('/sensor')} hitSlop={6}>
                    <Text style={styles.hint}>
                      {confirmed
                        ? 'Sensor not connected. Connect it in the Device tab, or tap the gear to type a value.'
                        : 'Connect the sensor in the Device tab to see readings.'}
                    </Text>
                  </Pressable>
                )}
              </View>
            )}

            {!confirmed && (
              <View style={styles.confirm}>
                <PrimaryButton
                  label={loadingSite ? 'Checking site…' : 'Confirm Location'}
                  onPress={onConfirm}
                  disabled={loadingSite}
                />
              </View>
            )}
          </View>

          {confirmed && (
            <View style={styles.scanWrap}>
              {missing.length > 0 && (
                <Text style={styles.missing}>
                  Still needed: {missing.map((k) => FIELDS[k].label).join(', ')}
                </Text>
              )}
              <PrimaryButton
                label={scanning ? 'Scanning…' : 'Scan Site'}
                onPress={onScan}
                disabled={missing.length > 0 || scanning}
              />
            </View>
          )}
        </View>
      )}

      {/* Edit pop-up */}
      {editing && (
        <EditValueModal
          visible
          title={`Edit ${FIELDS[editing].label}`}
          unit={FIELDS[editing].unit}
          initial={valueOf(editing) === null ? '' : String(valueOf(editing))}
          min={FIELDS[editing].min}
          max={FIELDS[editing].max}
          canReset={isEdited(editing)}
          onSave={saveEdit}
          onReset={resetEdit}
          onCancel={() => setEditing(null)}
        />
      )}
    </View>
  );
}

const SHADOW = {
  elevation: 5,
  shadowColor: '#000',
  shadowOpacity: 0.25,
  shadowRadius: 4,
  shadowOffset: { width: 0, height: 4 },
} as const;

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#2B3B2B' },

  attribution: {
    position: 'absolute',
    left: 8,
    fontFamily: fonts.hindRegular,
    fontSize: 10,
    color: '#333',
    backgroundColor: 'rgba(255,255,255,0.75)',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },

  topBar: { position: 'absolute', left: 25, right: 22, flexDirection: 'row', alignItems: 'center', gap: 15 },
  backBtn: {
    width: 33,
    height: 33,
    borderRadius: 17,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOW,
  },
  search: {
    flex: 1,
    height: 33,
    borderRadius: radius.card,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    gap: 8,
    ...SHADOW,
  },
  searchInput: { flex: 1, fontFamily: fonts.hindLight, fontSize: 15, color: colors.text, padding: 0 },
  msg: { position: 'absolute', left: 25, right: 22, backgroundColor: '#fff', borderRadius: 12, padding: 10, ...SHADOW },
  msgText: { fontFamily: fonts.hindRegular, fontSize: 12, color: colors.text },

  controls: { position: 'absolute', right: 14, gap: 10 },
  ctrl: {
    width: 40,
    height: 37,
    borderRadius: 5,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOW,
  },

  infoCard: {
    position: 'absolute',
    right: 16,
    width: 225,
    backgroundColor: 'rgba(20,32,12,0.62)',
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  infoHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  coords: { fontFamily: fonts.hindMedium, fontSize: 13, color: '#fff' },
  infoLine: { height: StyleSheet.hairlineWidth, backgroundColor: '#fff', marginTop: 8 },
  stamp: { fontFamily: fonts.hindRegular, fontSize: 9, color: '#fff', textAlign: 'center', marginTop: 4, marginBottom: 6 },
  infoRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', height: 30 },
  infoLabel: { fontFamily: fonts.hindRegular, fontSize: 12, color: '#fff' },
  infoValueWrap: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  infoValue: { fontFamily: fonts.hindMedium, fontSize: 12, color: '#fff' },
  infoHint: { fontFamily: fonts.hindRegular, fontSize: 9, color: 'rgba(255,255,255,0.8)', textAlign: 'center', marginTop: 4 },

  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    paddingHorizontal: 24,
    elevation: 16,
  },
  handle: { alignSelf: 'center', width: 73, height: 6, borderRadius: 25, backgroundColor: '#B5B4B4', marginTop: 4 },
  titleRow: { flexDirection: 'row', alignItems: 'flex-start', marginTop: 8, marginBottom: 10 },
  title: { fontFamily: fonts.hindLight, fontSize: 20, color: '#000' },
  address: { fontFamily: fonts.hindLight, fontSize: 12, color: colors.textMuted, marginTop: 1 },
  weather: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: colors.background,
    borderRadius: 5,
    paddingHorizontal: 6,
    height: 27,
    marginLeft: 12,
  },
  weatherText: { fontFamily: fonts.hindRegular, fontSize: 12, color: colors.text },
  warn: { fontFamily: fonts.hindRegular, fontSize: 12, color: suitabilityStyle.Unsuitable.plain, marginBottom: 8 },

  card: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#C5C5C5',
    borderRadius: radius.card,
    ...SHADOW,
  },
  sensorRow: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 18, height: 41 },
  sensorText: { flex: 1, fontFamily: fonts.hindLight, fontSize: 11, color: '#000' },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: '#999', marginHorizontal: 21 },

  tilesWrap: { paddingHorizontal: 18, paddingTop: 12 },
  tiles: { flexDirection: 'row', gap: 14 },
  tile: {
    flex: 1,
    height: 59,
    borderRadius: 10,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: 'rgba(128,128,128,0.34)',
    paddingHorizontal: 11,
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
  },
  tileLabel: { fontFamily: fonts.hindRegular, fontSize: 11, color: colors.textMuted },
  tileValue: { fontFamily: fonts.hindBold, fontSize: 16, color: colors.green },
  tileUnit: { fontFamily: fonts.hindRegular, fontSize: 10, color: colors.text },
  tileEmpty: { fontFamily: fonts.hindBold, fontSize: 16, color: colors.textMuted },
  gear: { position: 'absolute', top: 7, right: 8 },
  edited: {
    position: 'absolute',
    bottom: 5,
    right: 8,
    fontFamily: fonts.hindRegular,
    fontSize: 9,
    color: suitabilityStyle.Marginal.text,
  },
  hint: { fontFamily: fonts.hindRegular, fontSize: 11, color: colors.primary, textAlign: 'center', marginTop: 8 },

  confirm: { paddingHorizontal: 28, marginTop: 11, marginBottom: 20 },

  scanWrap: { paddingHorizontal: 29, marginTop: 16 },
  missing: { fontFamily: fonts.hindRegular, fontSize: 12, color: suitabilityStyle.Unsuitable.plain, textAlign: 'center', marginBottom: 8 },
});