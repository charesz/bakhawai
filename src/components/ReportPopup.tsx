import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ActivityIndicator, Modal, StyleSheet, Text, View } from 'react-native';
import { colors, fonts } from '../theme';

type Props = {
  visible: boolean;
  mode: 'loading' | 'success';
  title: string;
  message: string;
};

export function ReportPopup({ visible, mode, title, message }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent onRequestClose={() => {}}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <LinearGradient colors={[colors.primaryMid, colors.primaryLight]} style={styles.circle}>
            <Ionicons name={mode === 'success' ? 'checkmark' : 'download-outline'} size={64} color="#fff" />
          </LinearGradient>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          {mode === 'loading' && <ActivityIndicator style={{ marginTop: 14 }} color={colors.primary} />}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center', padding: 34 },
  card: {
    width: '100%',
    maxWidth: 334,
    minHeight: 276,
    backgroundColor: '#fff',
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  circle: { width: 124, height: 124, borderRadius: 62, alignItems: 'center', justifyContent: 'center' },
  title: { fontFamily: fonts.interSemiBold, fontSize: 18, color: colors.headerText, marginTop: 18, textAlign: 'center' },
  message: { fontFamily: fonts.hindRegular, fontSize: 13, lineHeight: 19, color: colors.textMuted, marginTop: 6, textAlign: 'center' },
});
