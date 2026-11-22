import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, Animated, Easing } from 'react-native';
import { colors, fontFamily, spacing } from '../constants/theme';

const { height } = Dimensions.get('window');
const SCANLINE_HEIGHT = 1.5;
const SCANLINE_MARGIN = 2.5;
const SCANLINE_INTERVAL = SCANLINE_HEIGHT + SCANLINE_MARGIN;

interface CyberBackgroundProps {
  showCorners?: boolean;
}

export default function CyberBackground({ showCorners = false }: CyberBackgroundProps) {
  const scrollAnim = useRef(new Animated.Value(0)).current;
  const flickerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 1. Slow, infinite vertical drift perfectly matched to 1 scanline cycle
    Animated.loop(
      Animated.timing(scrollAnim, {
        toValue: 1,
        duration: 800, // Speed of the scanline rolling down the screen
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // 2. Deliberate, erratic glitch every 4 seconds
    Animated.loop(
      Animated.sequence([
        // Stable period (4 seconds)
        Animated.timing(flickerAnim, { toValue: 0.9, duration: 4000, useNativeDriver: true }),
        
        // Fast glitch burst
        Animated.timing(flickerAnim, { toValue: 0.4, duration: 40, useNativeDriver: true }),
        Animated.timing(flickerAnim, { toValue: 0.9, duration: 40, useNativeDriver: true }),
        Animated.timing(flickerAnim, { toValue: 0.2, duration: 30, useNativeDriver: true }),
        Animated.timing(flickerAnim, { toValue: 1.0, duration: 80, useNativeDriver: true }),
        Animated.timing(flickerAnim, { toValue: 0.9, duration: 40, useNativeDriver: true }),
      ])
    ).start();
  }, [scrollAnim, flickerAnim]);

  const translateY = scrollAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, SCANLINE_INTERVAL], // Seamless snap back
  });

  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
      {/* Animated Scanline rows */}
      <Animated.View
        style={[
          styles.scanlineOverlay,
          {
            transform: [{ translateY }],
            opacity: flickerAnim,
          },
        ]}
      >
        {/* We render exactly 1 extra scanline at the top so the loop doesn't clip */}
        {Array.from({ length: Math.ceil(height / SCANLINE_INTERVAL) + 1 }).map((_, i) => (
          <View key={i} style={[styles.scanline, { marginTop: i === 0 ? -SCANLINE_INTERVAL : 0 }]} />
        ))}
      </Animated.View>

      {/* Extremely rigid corner metadata */}
      {showCorners && (
        <>
          <Text style={[styles.cornerText, { top: spacing.xl, left: spacing.lg }]}>N-SEA</Text>
          <Text style={[styles.cornerText, { top: spacing.xl, right: spacing.lg }]}>0X-88</Text>
          <Text style={[styles.cornerText, { bottom: spacing.lg, left: spacing.lg }]}>T-MINUS_0</Text>
          <Text style={[styles.cornerText, { bottom: spacing.lg, right: spacing.lg }]}>V0.9</Text>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  scanlineOverlay: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.8,
  },
  scanline: {
    height: 1.5,
    marginBottom: 2.5,
    backgroundColor: 'rgba(255,255,255,0.015)',
  },
  cornerText: {
    position: 'absolute',
    fontFamily: fontFamily.regular,
    fontSize: 9,
    color: colors.textDim,
    letterSpacing: 2,
    zIndex: 2,
  },
});
