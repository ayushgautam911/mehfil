import React from 'react';
import { Text, StyleSheet, TextStyle, StyleProp } from 'react-native';
import { fontFamily, fontSize, letterSpacing, statusColor } from '../constants/theme';

interface StatusBadgeProps {
  status: string;
  style?: StyleProp<TextStyle>;
}

// Bracketed state readout: [APPROVED], [PENDING] — uppercase, wide tracking.
export default function StatusBadge({ status, style }: StatusBadgeProps) {
  return (
    <Text style={[styles.badge, { color: statusColor(status) }, style]}>
      [{status.toUpperCase()}]
    </Text>
  );
}

const styles = StyleSheet.create({
  badge: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.xs,
    letterSpacing: letterSpacing.wide,
  },
});
