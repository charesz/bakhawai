import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AuthScreen } from '../components/AuthScreen';
import { PrimaryButton } from '../components/PrimaryButton';
import { TextField } from '../components/TextField';
import { colors, fonts, suitabilityStyle } from '../theme';

export default function SignUp() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');

  const onSignUp = () => {
    if (!name.trim() || !email.trim() || !password || !confirm) {
      setError('Please fill in all fields.');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    setError('');
    // TODO(Phase 6): save the new local account here before continuing.
    router.replace('/home');
  };

  return (
    <AuthScreen title="Create account" subtitle="Join Bakhaw AI to start assessing sites.">
      <TextField placeholder="Full name" autoCapitalize="words" autoComplete="name" value={name} onChangeText={setName} />
      <TextField
        placeholder="Email"
        keyboardType="email-address"
        autoComplete="email"
        value={email}
        onChangeText={setEmail}
      />
      <TextField placeholder="Password" secure value={password} onChangeText={setPassword} />
      <TextField placeholder="Confirm password" secure value={confirm} onChangeText={setConfirm} />

      {error !== '' && <Text style={styles.error}>{error}</Text>}

      <View style={{ marginTop: 8 }}>
        <PrimaryButton label="Sign up" onPress={onSignUp} />
      </View>

      <View style={styles.switchRow}>
        <Text style={styles.switchText}>Already have an account? </Text>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Text style={styles.link}>Log in</Text>
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