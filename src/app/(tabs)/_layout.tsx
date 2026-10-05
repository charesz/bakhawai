import { Tabs } from 'expo-router';
import { CustomTabBar } from '../../components/CustomTabBar';

export default function TabsLayout() {
  return (
    <Tabs tabBar={(props) => <CustomTabBar {...props} />} screenOptions={{ headerShown: false }}>
      {/* The order here is the order of the buttons. Keep "location" in the middle. */}
      <Tabs.Screen name="home" />
      <Tabs.Screen name="sensor" />
      <Tabs.Screen name="location" />
      <Tabs.Screen name="records" />
      <Tabs.Screen name="account" />
    </Tabs>
  );
}