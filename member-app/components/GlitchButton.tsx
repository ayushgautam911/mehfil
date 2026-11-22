import React, { useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, StyleProp, ViewStyle, Platform } from 'react-native';
import { colors, fontFamily, fontSize, spacing } from '../constants/theme';

interface GlitchButtonProps {
  title: string;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
}

export default function GlitchButton({ title, onPress, style }: GlitchButtonProps) {
  const glitchAnim = useRef(new Animated.Value(0)).current;
  const [isHovered, setIsHovered] = useState(false);

  const triggerGlitch = (hovering: boolean) => {
    setIsHovered(hovering);
    glitchAnim.stopAnimation();
    
    if (hovering) {
      // Rapid flashing sequence
      Animated.sequence([
        Animated.timing(glitchAnim, { toValue: 1, duration: 30, useNativeDriver: false }),
        Animated.timing(glitchAnim, { toValue: 0, duration: 40, useNativeDriver: false }),
        Animated.timing(glitchAnim, { toValue: 1, duration: 30, useNativeDriver: false }),
      ]).start();
    } else {
      // Fade out smoothly
      Animated.timing(glitchAnim, { toValue: 0, duration: 150, useNativeDriver: false }).start();
    }
  };

  const backgroundColor = glitchAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(0, 255, 65, 0.05)', colors.green],
  });

  const textColor = glitchAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.green, '#000000'],
  });

  // Slight horizontal jitter during the glitch
  const translateX = glitchAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, -3, 0],
  });

  return (
    <Pressable
      onPress={onPress}
      onHoverIn={() => triggerGlitch(true)}
      onHoverOut={() => triggerGlitch(false)}
      onPressIn={() => triggerGlitch(true)} // Support mobile touch
      onPressOut={() => triggerGlitch(false)}
    >
      <Animated.View
        style={[
          styles.button,
          style,
          {
            backgroundColor,
            transform: [{ translateX }],
          },
        ]}
      >
        <Animated.Text style={[styles.text, { color: textColor }]}>
          {isHovered ? `! ${title} !` : `${title} ›`}
        </Animated.Text>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderWidth: 1,
    borderColor: colors.green,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.sm,
    letterSpacing: 6,
  },
});
