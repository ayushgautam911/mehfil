import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, runOnJS, interpolate } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, fontFamily, fontSize, spacing } from '../constants/theme';
import GlitchButton from '../components/GlitchButton';
import CyberBackground from '../components/CyberBackground';

const { width, height } = Dimensions.get('window');

export default function WelcomeScreen() {
  const router = useRouter();
  const [bootProgress, setBootProgress] = useState(0);
  const [booted, setBooted] = useState(false);

  useEffect(() => {
    // Aggressive, glitchy boot sequence
    let current = 0;
    const interval = setInterval(() => {
      // jump by random amounts
      current += Math.floor(Math.random() * 25) + 5;
      if (current >= 100) {
        current = 100;
        clearInterval(interval);
        setTimeout(() => setBooted(true), 150); // slight pause at 100%
      }
      setBootProgress(current);
    }, 120); // Fast, irregular intervals feel mechanical

    return () => clearInterval(interval);
  }, []);

  const warpAnim = useSharedValue(0);

  const handleEnter = () => {
    // Wait for the button's glitch sequence (usually 100-150ms)
    setTimeout(() => {
      warpAnim.value = withTiming(1, { duration: 350 }, (finished?: boolean) => {
        if (finished) {
          runOnJS(router.push)('/onboarding');
          // Reset the animation in case they navigate back
          runOnJS(setTimeout)(() => {
            warpAnim.value = 0;
          }, 500);
        }
      });
    }, 120);
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: interpolate(warpAnim.value, [0, 1], [1, 10]) }],
      opacity: interpolate(warpAnim.value, [0, 0.5, 1], [1, 0.8, 0]),
    };
  });

  return (
    <SafeAreaView style={styles.container}>
      <CyberBackground showCorners={true} />

      <View style={styles.content}>
        {!booted ? (
          // The Raw Boot Sequence
          <View style={styles.bootContainer}>
            <View style={styles.progressBarWrapper}>
              <View style={[styles.progressBarFill, { width: `${bootProgress}%` as any }]} />
            </View>
            <Text style={styles.bootText}>-{bootProgress}%</Text>
          </View>
        ) : (
          // The Snapped-On Main Menu
          <Animated.View style={[styles.mainContainer, animatedStyle]}>
            <View style={styles.center}>
              <View style={styles.titleFrame}>
                <View style={[styles.bracket, styles.tl]} />
                <View style={[styles.bracket, styles.tr]} />
                <View style={[styles.bracket, styles.bl]} />
                <View style={[styles.bracket, styles.br]} />
                <Text style={styles.title}>H I V E</Text>
              </View>
              <Text style={styles.tagline}>FIND THE SOUND.</Text>
              <Text style={styles.subTagline}>PRIVATE EVENTS. CURATED ACCESS.</Text>
            </View>

            <GlitchButton
              title="ENTER"
              onPress={handleEnter}
              style={{ marginBottom: spacing.xxxl }}
            />
          </Animated.View>
        )}
      </View>
    </SafeAreaView>
  );
}

const BRACKET = 16;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  scanlineOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
    opacity: 0.8, // Slightly stronger scanlines
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
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  // Boot sequence styles
  bootContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  progressBarWrapper: {
    width: 60,
    height: 12,
    backgroundColor: colors.surface,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.green,
  },
  bootText: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.md,
    color: colors.green,
    letterSpacing: 2,
  },
  // Main menu styles
  mainContainer: {
    alignItems: 'center',
  },
  center: {
    alignItems: 'center',
    marginBottom: spacing.xxxl,
  },
  titleFrame: {
    position: 'relative',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    marginBottom: spacing.lg,
  },
  title: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.hero,
    color: colors.text,
    letterSpacing: 16,
    textShadowColor: colors.green,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8, // subtle glow
  },
  bracket: {
    position: 'absolute',
    width: BRACKET,
    height: BRACKET,
    borderColor: colors.textDim, // Switched brackets to dim gray for contrast against the green glow
  },
  tl: { top: 0, left: 0, borderTopWidth: 1.5, borderLeftWidth: 1.5 },
  tr: { top: 0, right: 0, borderTopWidth: 1.5, borderRightWidth: 1.5 },
  bl: { bottom: 0, left: 0, borderBottomWidth: 1.5, borderLeftWidth: 1.5 },
  br: { bottom: 0, right: 0, borderBottomWidth: 1.5, borderRightWidth: 1.5 },
  tagline: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.xl,
    color: colors.text,
    letterSpacing: 6,
  },
  subTagline: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.xs,
    color: colors.textSecondary, // Muted, non-glowy
    letterSpacing: 3,
    marginTop: spacing.sm,
  },
  enterButton: {
    borderWidth: 1,
    borderColor: colors.green,
    backgroundColor: 'rgba(0, 255, 65, 0.05)',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xxl,
  },
  enterText: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.sm,
    color: colors.green,
    letterSpacing: 6,
  },
});
