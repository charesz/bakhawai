import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts, radius } from '../theme';

type Props = { title: string; phase: string; todos: string[] };

export function ScreenPlaceholder({ title, phase, todos }: Props) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.container, { paddingTop: insets.top + 24 }]}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.card}>
        <Text style={styles.phase}>Coming in {phase}</Text>
        {todos.map((t) => (
          <Text key={t} style={styles.todo}>
            • {t}
          </Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, paddingHorizontal: 16 },
  title: { fontFamily: fonts.hindSemiBold, fontSize: 22, color: colors.headerText, marginBottom: 16 },
  card: { backgroundColor: '#fff', borderRadius: radius.card, padding: 16 },
  phase: { fontFamily: fonts.hindSemiBold, color: colors.primary, marginBottom: 8 },
  todo: { fontFamily: fonts.hindRegular, color: colors.textMuted, marginBottom: 4 },
});
