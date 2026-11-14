import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { colors, fonts } from '../theme';

type Props = {
  value: string; // the big number in the middle
  label: string; // text under the circle
  fraction: number; // 0 to 1: how much of the ring is filled
  color?: string; // ring color
  caption?: string; // small note under the label
  captionColor?: string;
  edited?: boolean; // true when the user typed the value by hand
};

const SIZE = 92;
const STROKE = 10;
const R = (SIZE - STROKE) / 2;
const CIRC = 2 * Math.PI * R;

export function Gauge({
  value,
  label,
  fraction,
  color = colors.green,
  caption,
  captionColor = colors.textMuted,
  edited = false,
}: Props) {
  // Always draw a little arc, so the ring never looks empty.
  const f = Math.min(Math.max(fraction, 0.02), 1);

  return (
    <View style={styles.wrap}>
      <View style={styles.ring}>
        {/* The ring is drawn behind. The number below is a normal centered child. */}
        <Svg width={SIZE} height={SIZE} style={StyleSheet.absoluteFill}>
          <Circle cx={SIZE / 2} cy={SIZE / 2} r={R} stroke="#E3E3E3" strokeWidth={STROKE} fill="none" />
          <Circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={R}
            stroke={color}
            strokeWidth={STROKE}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={`${CIRC * f} ${CIRC}`}
            // Starts at the top and fills clockwise.
            transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
          />
        </Svg>
        <Text style={[styles.value, value.length > 5 && { fontSize: 18 }]} numberOfLines={1}>
          {value}
        </Text>
      </View>
      <Text style={styles.label}>{label}</Text>
      {caption && <Text style={[styles.caption, { color: captionColor }]}>{caption}</Text>}
      {edited && <Text style={styles.edited}>edited</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center' },
  ring: { width: SIZE, height: SIZE, alignItems: 'center', justifyContent: 'center' },
  value: { fontFamily: fonts.hindSemiBold, fontSize: 24, color: colors.text },
  label: { fontFamily: fonts.hindSemiBold, fontSize: 16, color: colors.text, marginTop: 6 },
  caption: { fontFamily: fonts.hindRegular, fontSize: 10, marginTop: 1 },
  edited: { fontFamily: fonts.hindRegular, fontSize: 10, color: '#E2A73A' },
});