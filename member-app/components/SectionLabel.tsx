import React from 'react';
import { Text, StyleSheet, TextStyle, StyleProp } from 'react-native';
import { colors, fontFamily, fontSize, letterSpacing } from '../constants/theme';

interface SectionLabelProps {
  children: React.ReactNode;
  tone?: 'green' | 'cyan';
  slash?: boolean;
  style?: StyleProp<TextStyle>;
}

// "// LABEL" section header. green = primary, cyan = secondary.
export default function SectionLabel({ children, tone = 'green', slash = true, style }: SectionLabelProps) {
  return (
    <Text style={[styles.label, { color: tone === 'cyan' ? colors.cyan : colors.green }, style]}>
      {slash ? '// ' : ''}{children}
    </Text>
  );
}

const styles = StyleSheet.create({
  label: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.xs,
    letterSpacing: letterSpacing.extraWide,
  },
});
