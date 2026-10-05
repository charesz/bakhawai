import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View, type TextInputProps } from 'react-native';
import { colors, fonts, radius } from '../theme';

// Pass secure to make a password field with a show/hide eye.
type Props = TextInputProps & { secure?: boolean };

export function TextField({ secure, style, ...props }: Props) {
  const [hidden, setHidden] = useState(!!secure);

  return (
    <View style={styles.wrap}>
      <TextInput
        autoCapitalize="none"
        placeholderTextColor={colors.textMuted}
        secureTextEntry={secure ? hidden : false}
        style={[styles.input, secure && { paddingRight: 46 }, style]}
        {...props}
      />
      {secure && (
        <Pressable
          style={styles.eye}
          onPress={() => setHidden((h) => !h)}
          accessibilityLabel={hidden ? 'Show password' : 'Hide password'}
          hitSlop={8}
        >
          <Ionicons name={hidden ? 'eye-off-outline' : 'eye-outline'} size={22} color={colors.textMuted} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 12, justifyContent: 'center' },
  input: {
    height: 48,
    backgroundColor: '#fff',
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
    paddingHorizontal: 16,
    fontFamily: fonts.hindRegular,
    fontSize: 15,
    color: colors.text,
  },
  eye: { position: 'absolute', right: 14 },
});