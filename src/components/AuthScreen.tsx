import type { ReactNode } from 'react';
import { Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { images } from '../assets';
import { colors, fonts } from '../theme';

type Props = { title: string; subtitle: string; children: ReactNode };

export function AuthScreen({ title, subtitle, children }: Props) {
  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Image source={images.logo} style={styles.logo} resizeMode="contain" />
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 24 },
  logo: { width: 88, height: 88, alignSelf: 'center', marginBottom: 12 },
  title: { fontFamily: fonts.hindSemiBold, fontSize: 28, color: colors.headerText, textAlign: 'center' },
  subtitle: {
    fontFamily: fonts.hindRegular,
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 2,
    marginBottom: 24,
  },
});