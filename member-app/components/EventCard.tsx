import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';
import { colors, fontFamily, fontSize, spacing } from '../constants/theme';
import { Event } from '../constants/mockData';

interface EventCardProps {
  event: Event;
  onPress: () => void;
}

export default function EventCard({ event, onPress }: EventCardProps) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      {/* Subtle left accent line */}
      <View style={styles.accentBar} />

      <View style={styles.inner}>
        {/* Header row */}
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <Animated.Text {...({ sharedTransitionTag: `event-title-${event.id}` } as any)} style={styles.name}>
              {event.name.toUpperCase()}
            </Animated.Text>
            {event.isPrivate && (
              <Text style={styles.privateBadge}>PRIVATE</Text>
            )}
          </View>
          {/* Match score — two-line readout */}
          <View style={styles.matchBlock}>
            <Text style={styles.matchScore}>{event.matchScore}%</Text>
            <Text style={styles.matchLabel}>MATCH</Text>
          </View>
        </View>

        {/* Date / venue */}
        <Text style={styles.details}>
          {event.date} · {event.time} · {event.venue}
        </Text>

        {/* Hosting collective + genre chips */}
        <View style={styles.genreRow}>
          <Text style={styles.collective}>{event.collective}</Text>
          {event.genres.map((genre) => (
            <View key={genre} style={styles.genreChip}>
              <Text style={styles.genreText}>{genre.toUpperCase()}</Text>
            </View>
          ))}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    position: 'relative',
    paddingVertical: spacing.lg,
    paddingLeft: spacing.md,
    marginBottom: spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  accentBar: {
    position: 'absolute',
    left: 0,
    top: spacing.lg,
    bottom: spacing.lg,
    width: 1.5,
    backgroundColor: colors.green,
    opacity: 0.5,
  },
  inner: {
    gap: spacing.xs + 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  name: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.md,
    color: colors.text,
    letterSpacing: 2,
  },
  privateBadge: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.xs,
    color: colors.green,
    letterSpacing: 2,
    borderWidth: 1,
    borderColor: colors.green,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  matchBlock: {
    alignItems: 'flex-end',
    marginLeft: spacing.md,
  },
  matchScore: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.lg,
    color: colors.green,
    letterSpacing: 1,
  },
  matchLabel: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.xs,
    color: colors.green,
    letterSpacing: 2,
    opacity: 0.6,
  },
  details: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    letterSpacing: 1,
  },
  genreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  collective: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.xs,
    color: colors.green,
    letterSpacing: 2,
    marginRight: spacing.xs,
  },
  genreChip: {
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  genreText: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.xs,
    color: colors.cyan,
    letterSpacing: 2,
  },
});
