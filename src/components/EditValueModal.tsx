import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { colors, fonts, radius, suitabilityStyle } from '../theme';
import { PrimaryButton } from './PrimaryButton';

type Props = {
  visible: boolean;
  title: string;
  unit: string;
  initial: string;
  min: number;
  max: number;
  canReset: boolean; // true when the value was typed by hand
  onSave: (value: number) => void;
  onReset: () => void;
  onCancel: () => void;
};

export function EditValueModal({ visible, title, unit, initial, min, max, canReset, onSave, onReset, onCancel }: Props) {
  const [text, setText] = useState(initial);
  const [error, setError] = useState('');

  useEffect(() => {
    if (visible) {
      setText(initial);
      setError('');
    }
  }, [visible, initial]);

  const save = () => {
    const n = Number(text.replace(',', '.'));
    if (text.trim() === '' || Number.isNaN(n)) {
      setError('Please enter a number.');
      return;
    }
    if (n < min || n > max) {
      setError(`Enter a number between ${min} and ${max}.`);
      return;
    }
    onSave(n);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <KeyboardAvoidingView style={styles.backdrop} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {/* Tap outside the card to close */}
        <Pressable style={StyleSheet.absoluteFill} onPress={onCancel} />

        <View style={styles.card}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.note}>
            Only change this if you have a valid measurement or reliable information for the site.
          </Text>

          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              value={text}
              onChangeText={setText}
              keyboardType="decimal-pad"
              autoFocus
              selectTextOnFocus
            />
            {unit !== '' && <Text style={styles.unit}>{unit}</Text>}
          </View>

          {error !== '' && <Text style={styles.error}>{error}</Text>}

          <View style={styles.buttons}>
            <View style={{ flex: 1 }}>
              <PrimaryButton size="small" variant="outline" label="Cancel" onPress={onCancel} />
            </View>
            <View style={{ flex: 1 }}>
              <PrimaryButton size="small" label="Save" onPress={save} />
            </View>
          </View>

          {canReset && (
            <Pressable onPress={onReset} hitSlop={8}>
              <Text style={styles.reset}>Reset to automatic value</Text>
            </Pressable>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', paddingHorizontal: 28 },
  card: { backgroundColor: '#fff', borderRadius: radius.xl, padding: 20 },
  title: { fontFamily: fonts.hindSemiBold, fontSize: 18, color: colors.headerText },
  note: { fontFamily: fonts.hindRegular, fontSize: 12, color: colors.textMuted, marginTop: 4, marginBottom: 14 },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  input: {
    flex: 1,
    height: 48,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.15)',
    backgroundColor: colors.cardSoft,
    paddingHorizontal: 14,
    fontFamily: fonts.hindSemiBold,
    fontSize: 18,
    color: colors.text,
  },
  unit: { fontFamily: fonts.hindRegular, fontSize: 14, color: colors.textMuted },
  error: { fontFamily: fonts.hindRegular, fontSize: 12, color: suitabilityStyle.Unsuitable.plain, marginTop: 8 },
  buttons: { flexDirection: 'row', gap: 12, marginTop: 18 },
  reset: { fontFamily: fonts.hindSemiBold, fontSize: 13, color: colors.primary, textAlign: 'center', marginTop: 14 },
});
