import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, View, useWindowDimensions, type LayoutChangeEvent } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';
import { PrimaryButton } from '../../components/PrimaryButton';
import { PulseRings } from '../../components/PulseRings';
import { sensorService } from '../../services';
import { colors, deviceGradient, fonts, radius, suitabilityStyle } from '../../theme';
import type { SensorReading, SensorStatus } from '../../types';
import { formatEC, formatPH } from '../../utils/format';

export default function DeviceScreen() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  const [headerH, setHeaderH] = useState(340); // the real height is measured below
  const [status, setStatus] = useState<SensorStatus>(sensorService.getStatus());
  const [reading, setReading] = useState<SensorReading | null>(sensorService.getLastReading());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  // White clock and battery icons while this green screen is showing.
  useFocusEffect(
    useCallback(() => {
      StatusBar.setStyle('light');
      return () => StatusBar.setStyle('dark');
    }, []),
  );

  const readNow = useCallback(async () => {
    setBusy(true);
    setError('');
    try {
      setReading(await sensorService.readOnce());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not read the sensor.');
    } finally {
      setBusy(false);
      setStatus(sensorService.getStatus());
    }
  }, []);

  const connect = async () => {
    setError('');
    setStatus('connecting');
    try {
      await sensorService.connect();
      setStatus(sensorService.getStatus());
      await readNow();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not connect to the sensor.');
      setStatus(sensorService.getStatus());
    }
  };

  const disconnect = async () => {
    await sensorService.disconnect();
    setStatus(sensorService.getStatus());
    setReading(null);
    setError('');
  };

  useEffect(() => {
    // TODO(Phase 4): subscribe to live status changes (cable plugged in or pulled out).
    if (sensorService.getStatus() === 'connected') readNow();
  }, [readNow]);

  const connected = status === 'connected';
  const connecting = status === 'connecting';
  const info = connected ? sensorService.getDeviceInfo() : null;
  const ec = reading ? formatEC(reading.ec_uScm) : null;

  const deviceName = connected ? info?.name ?? 'Soil sensor' : connecting ? 'Connecting…' : 'No sensor connected';
  const deviceDetail = connected ? info?.detail ?? '' : connecting ? '' : 'Plug in the sensor with the USB-C cable';

  // Header layout: the rings sit in the space below the title and shrink on short phones.
  const titleBottom = insets.top + 16 + 26;
  const cx = width / 2;
  const cy = titleBottom + (headerH - titleBottom) / 2;
  const k = Math.max(0.5, Math.min(1, (headerH - titleBottom - 16) / 236));
  const hub = 72 * k;
  const ringMode = connected ? 'slow' : connecting ? 'fast' : 'off';
  const buttonWidth = (width - 48 - 12) / 2; // two buttons with 12px gap and 24px padding on each side

  return (
    <View style={styles.screen}>
      {/* Header: fills all the leftover space, so the screen never needs to scroll */}
      <View style={styles.header} onLayout={(e: LayoutChangeEvent) => setHeaderH(e.nativeEvent.layout.height)}>
        <Svg width={width} height={headerH} style={StyleSheet.absoluteFill}>
          <Defs>
            <RadialGradient id="bg" cx={cx} cy={cy} r={headerH * 0.62} gradientUnits="userSpaceOnUse">
              <Stop offset="0.42" stopColor={deviceGradient[0]} />
              <Stop offset="0.71" stopColor={deviceGradient[1]} />
              <Stop offset="1" stopColor={deviceGradient[2]} />
            </RadialGradient>
          </Defs>
          <Rect width={width} height={headerH} fill="url(#bg)" />
        </Svg>

        <Text style={[styles.title, { top: insets.top + 16 }]}>Device</Text>

        {/* Moving rings. Only while connected or connecting. */}
        <PulseRings cx={cx} cy={cy} scale={k} mode={ringMode} />

        {/* Center circle: always there */}
        <View
          style={[styles.hub, { width: hub, height: hub, borderRadius: hub / 2, left: cx - hub / 2, top: cy - hub / 2 }]}
          pointerEvents="none"
        >
          <Ionicons name="git-network" size={38 * k} color={connected || connecting ? colors.primary : '#9A9A9A'} />
        </View>
      </View>

      {/* Everything below the header keeps its natural height */}
      <View style={styles.bottom}>
        <View style={styles.deviceRow}>
          <MaterialCommunityIcons name="usb" size={23} color={connected ? colors.primary : '#9A9A9A'} />
          <View style={{ marginLeft: 18 }}>
            <Text style={styles.deviceName}>{deviceName}</Text>
            {deviceDetail !== '' && <Text style={styles.deviceDetail}>{deviceDetail}</Text>}
          </View>
        </View>

        <View style={styles.card}>
          <View style={[styles.row, styles.rowLine]}>
            <Text style={styles.label}>Connection</Text>
            <Text style={styles.valueMuted}>{connected ? 'USB / Wired' : 'Not connected'}</Text>
          </View>
          <View style={[styles.row, styles.rowLine]}>
            <Text style={styles.label}>Soil EC</Text>
            {ec ? (
              <Text>
                <Text style={styles.valueGreen}>{ec.value}</Text>
                <Text style={styles.unit}> {ec.unit}</Text>
              </Text>
            ) : (
              <Text style={styles.valueMuted}>—</Text>
            )}
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Soil pH</Text>
            {reading ? (
              <Text style={styles.valueGreen}>{formatPH(reading.ph)}</Text>
            ) : (
              <Text style={styles.valueMuted}>—</Text>
            )}
          </View>
        </View>

        {error !== '' && <Text style={styles.error}>{error}</Text>}

        {/* TODO(Phase 4): when the probe is in the air (moisture = 0), show "Insert the probe into the soil". */}
        <View style={styles.buttons}>
          {connected ? (
            <>
              <View style={{ width: buttonWidth }}>
                <PrimaryButton
                  size="small"
                  variant="outline"
                  label={busy ? 'Reading…' : 'Refresh'}
                  onPress={readNow}
                  disabled={busy}
                />
              </View>
              <View style={{ width: buttonWidth }}>
                <PrimaryButton size="small" label="Disconnect" onPress={disconnect} />
              </View>
            </>
          ) : (
            <View style={{ width: 220 }}>
              <PrimaryButton
                size="small"
                label={connecting ? 'Connecting…' : 'Connect'}
                onPress={connect}
                disabled={connecting}
              />
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  header: { flex: 1, minHeight: 200 },
  title: {
    position: 'absolute',
    left: 0,
    right: 0,
    textAlign: 'center',
    fontFamily: fonts.hindBold,
    fontSize: 20,
    color: '#fff',
  },
  hub: { position: 'absolute', backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },

  bottom: { paddingBottom: 16 },
  deviceRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 31, marginTop: 16, minHeight: 36 },
  deviceName: { fontFamily: fonts.hindSemiBold, fontSize: 13, color: colors.text },
  deviceDetail: { fontFamily: fonts.hindRegular, fontSize: 10, color: colors.textMuted, marginTop: 1 },

  card: {
    backgroundColor: '#fff',
    borderRadius: radius.xl,
    marginHorizontal: 16,
    marginTop: 8,
    paddingHorizontal: 15,
    paddingVertical: 6,
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 4 },
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 15, paddingHorizontal: 1 },
  rowLine: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#BDBDBD' },
  label: { fontFamily: fonts.hindRegular, fontSize: 13, color: colors.textMuted },
  valueMuted: { fontFamily: fonts.hindBold, fontSize: 13, color: colors.textMuted },
  valueGreen: { fontFamily: fonts.hindBold, fontSize: 13, color: colors.green },
  unit: { fontFamily: fonts.hindRegular, fontSize: 10, color: colors.text },

  error: {
    fontFamily: fonts.hindRegular,
    fontSize: 12,
    color: suitabilityStyle.Unsuitable.plain,
    textAlign: 'center',
    marginTop: 12,
    paddingHorizontal: 24,
  },
  buttons: { flexDirection: 'row', justifyContent: 'center', gap: 12, paddingHorizontal: 24, marginTop: 16 },
});