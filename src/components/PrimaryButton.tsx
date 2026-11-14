import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, fonts } from '../theme';

type Props = {
  label: string;
  onPress: () => void;
  variant?: 'solid' | 'outline';
  size?: 'regular' | 'small';
  disabled?: boolean;
};

export function PrimaryButton({ label, onPress, variant = 'solid', size = 'regular', disabled = false }: Props) {
  const outline = variant === 'outline';
  const small = size === 'small';
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      style={[
        styles.btn,
        small ? styles.small : styles.regular,
        outline ? styles.outline : styles.solid,
        disabled && styles.disabled,
      ]}
    >
            <Text
        maxFontSizeMultiplier={1.15}
        style={[styles.label, small && styles.labelSmall, { color: outline ? colors.primary : '#fff' }]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: { borderRadius: 30, alignItems: 'center', justifyContent: 'center' },
  regular: { height: 48 },
  small: { height: 46, paddingHorizontal: 24 },
  solid: { backgroundColor: colors.primary },
  outline: { borderWidth: 2, borderColor: colors.primary },
  disabled: { opacity: 0.6 },
  label: { fontFamily: fonts.interSemiBold, fontSize: 15 },
    labelSmall: { fontSize: 15 },
});