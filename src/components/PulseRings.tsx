import { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Easing, StyleSheet, View } from 'react-native';

type Props = { cx: number; cy: number; scale: number; mode: 'off' | 'slow' | 'fast' };

// Inner ring first, so each pulse starts in the middle and moves outward.
const RINGS = [
  { r: 49, alpha: 0.26 },
  { r: 79, alpha: 0.16 },
  { r: 118, alpha: 0.1 },
];

export function PulseRings({ cx, cy, scale, mode }: Props) {
  const values = useRef(RINGS.map(() => new Animated.Value(0.5))).current;
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);
  }, []);

  useEffect(() => {
    if (mode === 'off' || reduceMotion) return;
    // Change these two numbers to make the breathing slower or faster (milliseconds).
    const duration = mode === 'fast' ? 600 : 1500;

    const animations = values.map((v, i) =>
      Animated.sequence([
        Animated.delay(i * 250), // each ring starts a little later, which makes the wave
        Animated.loop(
          Animated.sequence([
            Animated.timing(v, { toValue: 1, duration, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
            Animated.timing(v, { toValue: 0, duration, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          ]),
        ),
      ]),
    );
    animations.forEach((a) => a.start());

    return () => {
      animations.forEach((a) => a.stop());
      values.forEach((v) => v.setValue(0.5));
    };
  }, [mode, reduceMotion, values]);

  if (mode === 'off') return null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {RINGS.map((ring, i) => {
        const r = ring.r * scale;
        return (
          <Animated.View
            key={ring.r}
            style={{
              position: 'absolute',
              left: cx - r,
              top: cy - r,
              width: r * 2,
              height: r * 2,
              borderRadius: r,
              backgroundColor: `rgba(255,255,255,${ring.alpha})`,
              opacity: values[i].interpolate({ inputRange: [0, 1], outputRange: [0.55, 1] }),
              transform: [{ scale: values[i].interpolate({ inputRange: [0, 1], outputRange: [0.93, 1.06] }) }],
            }}
          />
        );
      })}
    </View>
  );
}