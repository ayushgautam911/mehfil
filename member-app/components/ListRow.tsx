import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { colors, fontFamily, fontSize, letterSpacing, spacing } from '../constants/theme';

interface ListRowProps {
  avatar?: React.ReactNode;
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  onPress?: () => void;
  accent?: boolean;
  dim?: boolean;
  style?: StyleProp<ViewStyle>;
}

// Generic tappable row with a hairline divider; optional accent bar + avatar + right slot.
export default function ListRow({
  avatar,
  title,
  subtitle,
  right,
  onPress,
  accent = false,
  dim = false,
  style,
}: ListRowProps) {
  const Container: any = onPress ? TouchableOpacity : View;
  return (
    <Container
      onPress={onPress}
      activeOpacity={0.7}
      style={[styles.row, accent && styles.rowAccent, dim && styles.dim, style]}
    >
      {accent && <View style={styles.accentBar} />}
      {avatar}
      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={1}>{title.toUpperCase()}</Text>
        {subtitle ? (
          <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text>
        ) : null}
      </View>
      {right ? <View style={styles.right}>{right}</View> : null}
    </Container>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  rowAccent: {
    paddingLeft: spacing.md,
  },
  dim: {
    opacity: 0.45,
  },
  accentBar: {
    position: 'absolute',
    left: 0,
    top: spacing.md,
    bottom: spacing.md,
    width: 1.5,
    backgroundColor: colors.green,
    opacity: 0.5,
  },
  body: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.md,
    letterSpacing: letterSpacing.wide,
    color: colors.text,
  },
  subtitle: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
    letterSpacing: letterSpacing.normal,
    color: colors.textSecondary,
    marginTop: 3,
  },
  right: {
    alignItems: 'flex-end',
  },
});
