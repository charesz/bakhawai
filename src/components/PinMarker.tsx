import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Easing, StyleSheet, View } from 'react-native';

// Ring color as "red,green,blue". This is the bright green from your logo.
const RING_RGB = '75,107,23';

// Make alpha bigger for stronger rings, smaller for softer ones (0 to 1).
const RINGS = [
  { size: 56, alpha: 0.4 },
  { size: 104, alpha: 0.28 },
  { size: 152, alpha: 0.16 },
];
const PIN_SIZE = 52;

// Sits at the exact center of the screen. The pin TIP is at the center point,
// which is the same point the app reads as "your location".
// TODO(Phase 8): swap the icon for the exact pin exported from Figma (Group 37).
export function PinMarker() {
  const pulse = useRef(new Animated.Value(0)).current;
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);
  }, []);

  useEffect(() => {
    if (reduceMotion) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 1500, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 1500, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse, reduceMotion]);

  return (
    <View style={styles.anchor} pointerEvents="none">
      {RINGS.map((ring) => (
        <Animated.View
          key={ring.size}
          style={{
            position: 'absolute',
            left: -ring.size / 2,
            top: -ring.size / 2,
            width: ring.size,
            height: ring.size,
            borderRadius: ring.size / 2,
            backgroundColor: `rgba(${RING_RGB},${ring.alpha})`,
            transform: [{ scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1.1] }) }],
          }}
        />
      ))}
      <Ionicons name="location" size={PIN_SIZE} color="#fff" style={styles.pin} />
    </View>
  );
}

const styles = StyleSheet.create({
  // A zero-size box at the center of the screen. Everything else is positioned from it.
  anchor: { position: 'absolute', left: '50%', top: '50%', width: 0, height: 0 },
  pin: {
    position: 'absolute',
    left: -PIN_SIZE / 2,
    top: -PIN_SIZE + 4, // the +4 puts the visible tip right on the center point
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowRadius: 4,
    textShadowOffset: { width: 0, height: 2 },
  },
});
