import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AuthScreen } from '../components/AuthScreen';
import { PrimaryButton } from '../components/PrimaryButton';
import { TextField } from '../components/TextField';
import { colors, fonts, suitabilityStyle } from '../theme';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const onLogin = () => {
    if (!email.trim() || !password) {
      setError('Please enter your email and password.');
      return;
    }
    setError('');
    // TODO(Phase 6): check the saved local account here before continuing.
    router.replace('/home');
  };

  return (
    <AuthScreen title="Welcome back" subtitle="Log in to continue assessing mangrove sites.">
      <TextField
        placeholder="Email"
        keyboardType="email-address"
        autoComplete="email"
        value={email}
        onChangeText={setEmail}
      />
      <TextField placeholder="Password" secure value={password} onChangeText={setPassword} />
      {/* TODO: "Forgot password?" link, if you want it in the design */}

      {error !== '' && <Text style={styles.error}>{error}</Text>}

      <View style={{ marginTop: 8 }}>
        <PrimaryButton label="Log in" onPress={onLogin} />
      </View>

      <View style={styles.switchRow}>
        <Text style={styles.switchText}>Don't have an account? </Text>
        <Pressable onPress={() => router.push('/signup')} hitSlop={8}>
          <Text style={styles.link}>Sign up</Text>
        </Pressable>
      </View>
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  error: { fontFamily: fonts.hindRegular, fontSize: 13, color: suitabilityStyle.Unsuitable.plain, marginBottom: 4 },
  switchRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
  switchText: { fontFamily: fonts.hindRegular, fontSize: 14, color: colors.textMuted },
  link: { fontFamily: fonts.hindSemiBold, fontSize: 14, color: colors.primary },
});