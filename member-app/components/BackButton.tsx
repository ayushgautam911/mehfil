import React from 'react';
import { Text, TouchableOpacity, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { colors, fontFamily, fontSize, letterSpacing, spacing } from '../constants/theme';

interface BackButtonProps {
  label?: string;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
}

export default function BackButton({ label = 'BACK', onPress, style }: BackButtonProps) {
  return (
    <TouchableOpacity onPress={onPress} style={[styles.btn, style]} activeOpacity={0.7}>
      <Text style={styles.text}>← {label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    marginBottom: spacing.xl,
    alignSelf: 'flex-start',
  },
  text: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    letterSpacing: letterSpacing.extraWide,
  },
});
