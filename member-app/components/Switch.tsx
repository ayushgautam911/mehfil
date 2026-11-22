import React from 'react';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import { colors, glow } from '../constants/theme';

interface SwitchProps {
  on: boolean;
  onToggle: () => void;
}

// Hard-edged toggle (40×22 box, green fill + glow when on).
export default function Switch({ on, onToggle }: SwitchProps) {
  return (
    <TouchableOpacity
      onPress={onToggle}
      activeOpacity={0.8}
      style={[
        styles.track,
        {
          borderColor: on ? colors.green : colors.border,
          backgroundColor: on ? colors.greenBg : 'transparent',
          justifyContent: on ? 'flex-end' : 'flex-start',
        },
      ]}
    >
      <View
        style={[
          styles.knob,
          { backgroundColor: on ? colors.green : colors.textDim },
          on && glow.green,
        ]}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  track: {
    width: 40,
    height: 22,
    padding: 2,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  knob: {
    width: 14,
    height: 14,
  },
});
