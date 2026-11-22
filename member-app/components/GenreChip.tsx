import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, fontFamily, fontSize, spacing } from '../constants/theme';

interface GenreChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
}

export default function GenreChip({ label, selected, onPress }: GenreChipProps) {
  return (
    <TouchableOpacity
      style={[styles.chip, selected && styles.chipSelected]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 0,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
  },
  chipSelected: {
    borderColor: colors.green,
    backgroundColor: colors.greenBg,
  },
  chipText: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    letterSpacing: 1,
  },
  chipTextSelected: {
    color: colors.green,
  },
});
