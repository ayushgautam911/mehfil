import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import CornerBrackets from '../../components/CornerBrackets';
import GlitchButton from '../../components/GlitchButton';
import CyberBackground from '../../components/CyberBackground';
import Avatar from '../../components/Avatar';
import SectionLabel from '../../components/SectionLabel';
import Tag from '../../components/Tag';
import { colors, fontFamily, fontSize, letterSpacing, spacing } from '../../constants/theme';
import { events, passes } from '../../constants/mockData';

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const event = events.find((e) => e.id === id) || events[0];
  // Local state models the REQUEST PASS → pending transition (cosmetic in the mock).
  const [passStatus, setPassStatus] = useState(event.passStatus);

  const openPass = () => {
    const pass = passes.find((p) => p.eventName === event.name && p.status === 'approved');
    if (pass) router.push(`/pass/${pass.id}` as any);
  };

  return (
    <SafeAreaView style={styles.container}>
      <CyberBackground />
      <View style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backRow}>
            <Text style={styles.backText}>← BACK</Text>
          </TouchableOpacity>

          {/* Title block with corner brackets */}
          <View style={styles.titleBlock}>
            <CornerBrackets size={10} thickness={1} color={colors.border} padding={0} />
            <Text style={styles.matchBadge}>[{event.matchScore}% MATCH]</Text>
            <Animated.Text {...({ sharedTransitionTag: `event-title-${event.id}` } as any)} style={styles.title}>
              {event.name.toUpperCase()}
            </Animated.Text>
            <Text style={styles.datetime}>{event.date} · {event.time}</Text>
            <View style={styles.genreRow}>
              {event.genres.map((genre) => (
                <Tag key={genre} label={genre} />
              ))}
            </View>
          </View>

          {/* Hosted by */}
          <View style={styles.hostRow}>
            <Avatar name={event.collective} size={28} />
            <Text style={styles.hostText}>
              HOSTED BY <Text style={styles.hostName}>{event.collective}</Text>
            </Text>
          </View>

          {/* Lineup */}
          <SectionLabel style={styles.sectionLabel}>LINEUP</SectionLabel>
          {event.lineup.map((artist) => (
            <Text key={artist} style={styles.artistName}>{artist.toUpperCase()}</Text>
          ))}

          {/* Location */}
          <SectionLabel style={styles.sectionLabel}>LOCATION</SectionLabel>
          <Text style={styles.detailText}>{event.address}</Text>
          {!event.locationRevealed && (
            <Text style={styles.lockedText}>[LOCKED — PASS REQUIRED]</Text>
          )}

          {/* Access / pass */}
          <SectionLabel style={styles.sectionLabel}>ACCESS</SectionLabel>
          <View style={styles.passRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.passName}>ENTRY PASS</Text>
              <Text style={styles.passMeta}>
                free · approved by {event.collective.toLowerCase()} · 1 entry
              </Text>
            </View>
            <Text style={styles.freeBadge}>[FREE]</Text>
          </View>
          <Text style={styles.passNote}>
            requests are reviewed by the collective. you'll get a chat message when your pass is approved.
          </Text>

          {passStatus === 'approved' ? (
            <GlitchButton title="VIEW PASS" onPress={openPass} style={{ marginTop: spacing.xl }} />
          ) : passStatus === 'pending' ? (
            <View style={styles.pendingBox}>
              <Text style={styles.pendingText}>PASS REQUESTED · AWAITING APPROVAL</Text>
            </View>
          ) : (
            <GlitchButton
              title="REQUEST PASS"
              onPress={() => setPassStatus('pending')}
              style={{ marginTop: spacing.xl }}
            />
          )}

          <TouchableOpacity style={styles.referLink} onPress={() => router.push('/invite' as any)}>
            <Text style={styles.referText}>REFER A FRIEND ›</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  scroll: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.xxl },
  backRow: { marginBottom: spacing.xl },
  backText: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    letterSpacing: letterSpacing.extraWide,
  },
  titleBlock: {
    position: 'relative',
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  matchBadge: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.xs,
    color: colors.green,
    letterSpacing: letterSpacing.wide,
    marginBottom: spacing.sm,
  },
  title: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.xxl,
    color: colors.text,
    letterSpacing: letterSpacing.extraWide,
    marginBottom: spacing.sm,
  },
  datetime: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    letterSpacing: letterSpacing.normal,
    marginBottom: spacing.sm,
  },
  genreRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  hostRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  hostText: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    letterSpacing: letterSpacing.wide,
  },
  hostName: { color: colors.green },
  sectionLabel: { marginTop: spacing.xl, marginBottom: spacing.md },
  artistName: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.xl,
    color: colors.text,
    letterSpacing: letterSpacing.wide,
    marginBottom: spacing.sm,
  },
  detailText: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.md,
    color: colors.textSecondary,
    letterSpacing: letterSpacing.normal,
  },
  lockedText: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
    color: colors.green,
    letterSpacing: letterSpacing.wide,
    marginTop: spacing.xs,
  },
  passRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  passName: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.md,
    color: colors.text,
    letterSpacing: letterSpacing.wide,
  },
  passMeta: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    letterSpacing: letterSpacing.normal,
    marginTop: 2,
  },
  freeBadge: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.lg,
    color: colors.green,
  },
  passNote: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.xs,
    color: colors.textDim,
    letterSpacing: letterSpacing.normal,
    marginTop: spacing.md,
    lineHeight: fontSize.xs * 1.5,
  },
  pendingBox: {
    marginTop: spacing.xl,
    borderWidth: 1,
    borderColor: colors.cyan,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xxl,
    alignItems: 'center',
  },
  pendingText: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.sm,
    letterSpacing: letterSpacing.ultraWide,
    color: colors.cyan,
    textAlign: 'center',
  },
  referLink: { alignItems: 'center', marginTop: spacing.md },
  referText: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.xs,
    color: colors.cyan,
    letterSpacing: letterSpacing.extraWide,
  },
});
