import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { images } from '../assets';
import { colors, fonts } from '../theme';

export default function Splash() {
  const router = useRouter();

  useEffect(() => {
    // TODO(Phase 6): if the user is already logged in, go straight to Home.
    const t = setTimeout(() => router.replace('/login'), 1500);
    return () => clearTimeout(t);
  }, [router]);

  return (
    <View style={styles.container}>
      <Image source={images.logo} style={styles.logo} resizeMode="contain" />
      <Image source={images.wordmark} style={styles.wordmark} resizeMode="contain" />
      <Text style={styles.tagline}>{'Powering Restoration with\nIntelligent Solution'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' },
  logo: { width: 146, height: 146 },
  wordmark: { width: 279, height: 47, marginTop: 10 },
  tagline: { fontFamily: fonts.hindLight, fontSize: 20, color: colors.tagline, textAlign: 'center', marginTop: 10 },
});