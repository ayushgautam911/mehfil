import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, fontFamily, fontSize, letterSpacing, spacing } from '../constants/theme';

interface ChatBubbleProps {
  from: 'me' | 'them';
  text: string;
  time: string;
}

// Hard-edged bubble: mine = right (green outline + greenBg), theirs = left (surface + hairline).
export default function ChatBubble({ from, text, time }: ChatBubbleProps) {
  const mine = from === 'me';
  return (
    <View style={[styles.wrap, mine ? styles.wrapMine : styles.wrapThem]}>
      <View style={[styles.bubble, mine ? styles.bubbleMine : styles.bubbleThem]}>
        <Text style={styles.text}>{text}</Text>
      </View>
      <Text style={styles.time}>{time}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: spacing.md,
    maxWidth: '100%',
  },
  wrapMine: {
    alignItems: 'flex-end',
  },
  wrapThem: {
    alignItems: 'flex-start',
  },
  bubble: {
    maxWidth: '78%',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  bubbleMine: {
    borderWidth: 1,
    borderColor: colors.green,
    backgroundColor: colors.greenBg,
  },
  bubbleThem: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  text: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.md,
    letterSpacing: letterSpacing.normal,
    color: colors.text,
    lineHeight: fontSize.md * 1.5,
  },
  time: {
    fontFamily: fontFamily.regular,
    fontSize: 9,
    letterSpacing: letterSpacing.wide,
    color: colors.textDim,
    marginTop: 4,
  },
});
