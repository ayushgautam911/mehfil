import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, fontFamily, fontSize, letterSpacing, spacing } from '../constants/theme';

interface TagProps {
  label: string;
  color?: string;
}

// Read-only genre tag — hairline outline, uppercase, hard-edged.
export default function Tag({ label, color = colors.cyan }: TagProps) {
  return (
    <View style={styles.tag}>
      <Text style={[styles.text, { color }]}>{label.toUpperCase()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tag: {
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  text: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.xs,
    letterSpacing: letterSpacing.wide,
  },
});
