import {
  HindVadodara_300Light,
  HindVadodara_400Regular,
  HindVadodara_500Medium,
  HindVadodara_600SemiBold,
  HindVadodara_700Bold,
} from '@expo-google-fonts/hind-vadodara';
import {
  Inter_400Regular,
  Inter_400Regular_Italic,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold,
} from '@expo-google-fonts/inter';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';

export default function RootLayout() {
  const [loaded] = useFonts({
    Inter_400Regular,
    Inter_400Regular_Italic,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
    HindVadodara_300Light,
    HindVadodara_400Regular,
    HindVadodara_500Medium,
    HindVadodara_600SemiBold,
    HindVadodara_700Bold,
  });

  if (!loaded) return null; // TODO(Phase 8): keep the native splash visible while fonts load

  return <Stack screenOptions={{ headerShown: false }} />;
}