import { Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme';

type TabBarProps = {
  state: { index: number; routes: { key: string; name: string }[] };
  navigation: { navigate: (name: string) => void };
};

const LABELS: Record<string, string> = {
  home: 'Home',
  sensor: 'Device sensor',
  location: 'Location and site scanning',
  records: 'Records history',
  account: 'User account',
};

// Figma icons: home-rounded, stack-fill, clipboard-text-history, account-circle.
// These are the closest matches in Expo's icon library.
// If "clipboard-text-clock" shows a TypeScript error, use "clipboard-text" instead.
// TODO(Phase 8): optionally swap in the exact SVGs exported from Figma.
function TabIcon({ route, color }: { route: string; color: string }) {
  const size = 36;
  switch (route) {
    case 'home':
      return <MaterialIcons name="home" size={size} color={color} />;
    case 'sensor':
      return <MaterialCommunityIcons name="layers" size={size} color={color} />;
    case 'records':
      return <MaterialCommunityIcons name="clipboard-text-clock" size={size} color={color} />;
    case 'account':
      return <MaterialIcons name="account-circle" size={size} color={color} />;
    default:
      return null;
  }
}

export function CustomTabBar({ state, navigation }: TabBarProps) {
  const insets = useSafeAreaInsets();
    // The Location screen is full-screen map, like in the Figma, so no bottom bar there.
  if (state.routes[state.index]?.name === 'location') return null;

  return (
    <View style={styles.outer}>
      <View style={[styles.bar, {height: 66 + insets.bottom, paddingBottom: insets.bottom}]}>
        {state.routes.map((route, index) => {
          // The center slot stays empty here. The big button is drawn below.
          if (route.name === 'location') return <View key={route.key} style={styles.item} />;
          const focused = state.index === index;
          return (
            <Pressable
              key={route.key}
              style={styles.item}
              onPress={() => navigation.navigate(route.name)}
              accessibilityRole="button"
              accessibilityLabel={LABELS[route.name]}
            >
              <TabIcon route={route.name} color={focused ? colors.green : '#777777'} />
            </Pressable>
          );
        })}
      </View>

      <Pressable
        style={styles.center}
        onPress={() => navigation.navigate('location')}
        accessibilityRole="button"
        accessibilityLabel={LABELS.location}
      >
        <View style={styles.ring}>
          <LinearGradient colors={[colors.primaryMid, colors.primaryLight]} style={styles.button}>
            <Ionicons name="location" size={32} color="#fff" />
          </LinearGradient>
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: { backgroundColor: 'transparent' },
  bar: { marginTop: 33, flexDirection: 'row', backgroundColor: '#fff', alignItems: 'center' },
  item: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  center: { position: 'absolute', top: 0, alignSelf: 'center' },
  ring: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 12,
  },
  button: { width: 62, height: 62, borderRadius: 31, alignItems: 'center', justifyContent: 'center' },
});