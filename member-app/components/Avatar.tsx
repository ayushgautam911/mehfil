import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, fontFamily, glow } from '../constants/theme';

interface AvatarProps {
  name?: string;
  size?: number;
  glow?: boolean;
  color?: string;
}

// Square monogram tile (collective / member). Derives initials from name/handle.
export default function Avatar({ name = '', size = 40, glow: hasGlow = false, color = colors.green }: AvatarProps) {
  const initials = name
    .replace(/^@/, '')
    .split(/[\s._]+/)
    .map((w) => w[0] || '')
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <View
      style={[
        styles.tile,
        {
          width: size,
          height: size,
          borderColor: hasGlow ? color : colors.border,
        },
        hasGlow && { ...glow.green, shadowColor: color },
      ]}
    >
      <Text style={{ fontFamily: fontFamily.bold, fontSize: size * 0.34, letterSpacing: 0.5, color }}>
        {initials}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
