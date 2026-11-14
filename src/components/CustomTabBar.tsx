
import { Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme';

type TabState = {
  index: number;
  routes: { key: string; name: string }[];
};

const ROUTE_PATHS = {
  home: '/home',
  sensor: '/sensor',
  location: '/location',
  records: '/records',
  account: '/account',
} as const;

type TabRouteName = keyof typeof ROUTE_PATHS;

const LABELS: Record<string, string> = {
  home: 'Home',
  sensor: 'Device sensor',
  location: 'Location and site scanning',
  records: 'Records history',
  account: 'User account',
};

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

export function CustomTabBar({ state }: { state: TabState }) {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  // Hide the bottom bar on the full-screen Location screen.
  if (state.routes[state.index]?.name === 'location') return null;

  return (
    <View style={styles.outer}>
      <View
        style={[
          styles.bar,
          {
            height: 66 + insets.bottom,
            paddingBottom: insets.bottom,
          },
        ]}
      >
        {state.routes.map((route, index) => {
          // Keep the center slot empty for the Location button.
          if (route.name === 'location') {
            return <View key={route.key} style={styles.item} />;
          }

          const focused = state.index === index;

          return (
            <Pressable
              key={route.key}
              style={styles.item}
              onPress={() => {
                const path = ROUTE_PATHS[route.name as TabRouteName];
                if (path) router.navigate(path);
              }}
              accessibilityRole="button"
              accessibilityLabel={LABELS[route.name]}
              accessibilityState={{ selected: focused }}
            >
              <TabIcon
                route={route.name}
                color={focused ? colors.green : '#777777'}
              />
            </Pressable>
          );
        })}
      </View>

      <Pressable
        style={styles.center}
        onPress={() => router.navigate('/location')}
        accessibilityRole="button"
        accessibilityLabel={LABELS.location}
      >
        <View style={styles.ring}>
          <LinearGradient
            colors={[colors.primaryMid, colors.primaryLight]}
            style={styles.button}
          >
            <Ionicons name="location" size={32} color="#fff" />
          </LinearGradient>
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    backgroundColor: 'transparent',
  },
  bar: {
    marginTop: 33,
    flexDirection: 'row',
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    position: 'absolute',
    top: 0,
    alignSelf: 'center',
  },
  ring: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 12,
  },
  button: {
    width: 62,
    height: 62,
    borderRadius: 31,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
