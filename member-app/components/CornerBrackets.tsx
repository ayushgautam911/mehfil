import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors } from '../constants/theme';

interface CornerBracketsProps {
  size?: number;
  thickness?: number;
  color?: string;
  padding?: number;
}

export default function CornerBrackets({
  size = 12,
  thickness = 1.5,
  color = colors.green,
  padding = 8,
}: CornerBracketsProps) {
  const style = {
    borderColor: color,
    width: size,
    height: size,
    borderWidth: 0,
  };

  return (
    <>
      {/* top-left */}
      <View style={[styles.corner, styles.topLeft, { top: padding, left: padding }]}>
        <View style={[style, { borderTopWidth: thickness, borderLeftWidth: thickness }]} />
      </View>
      {/* top-right */}
      <View style={[styles.corner, styles.topRight, { top: padding, right: padding }]}>
        <View style={[style, { borderTopWidth: thickness, borderRightWidth: thickness }]} />
      </View>
      {/* bottom-left */}
      <View style={[styles.corner, styles.bottomLeft, { bottom: padding, left: padding }]}>
        <View style={[style, { borderBottomWidth: thickness, borderLeftWidth: thickness }]} />
      </View>
      {/* bottom-right */}
      <View style={[styles.corner, styles.bottomRight, { bottom: padding, right: padding }]}>
        <View style={[style, { borderBottomWidth: thickness, borderRightWidth: thickness }]} />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  corner: {
    position: 'absolute',
  },
  topLeft: {},
  topRight: {},
  bottomLeft: {},
  bottomRight: {},
});
