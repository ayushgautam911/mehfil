import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import CyberBackground from '../../components/CyberBackground';
import Avatar from '../../components/Avatar';
import ListRow from '../../components/ListRow';
import SectionLabel from '../../components/SectionLabel';
import { colors, fontFamily, fontSize, letterSpacing, spacing } from '../../constants/theme';
import { userProfile, myCollectives } from '../../constants/mockData';

function ProfileLink({ label, onPress, tone = 'primary' }: { label: string; onPress: () => void; tone?: 'primary' | 'cyan' }) {
  return (
    <TouchableOpacity style={styles.linkRow} onPress={onPress} activeOpacity={0.7}>
      <Text style={[styles.linkLabel, tone === 'cyan' && { color: colors.cyan }]}>{label}</Text>
      <Text style={styles.chevron}>›</Text>
    </TouchableOpacity>
  );
}

export default function ProfileScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <CyberBackground />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerLabel}>HIVE / PROFILE</Text>
        </View>
        <View style={styles.divider} />

        {/* Identity */}
        <Text style={styles.username}>{userProfile.username.toUpperCase()}</Text>
        <Text style={styles.memberSince}>MEMBER SINCE {userProfile.memberSince.toUpperCase()}</Text>

        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{userProfile.eventsAttended}</Text>
            <Text style={styles.statLabel}>EVENTS</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={styles.statValue}>{userProfile.referrals}</Text>
            <Text style={styles.statLabel}>REFERRED</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={[styles.statValue, styles.scoreValue]}>[{userProfile.score}]</Text>
            <Text style={styles.statLabel}>SCORE</Text>
          </View>
        </View>

        {/* Frequencies */}
        <SectionLabel style={styles.sectionLabel}>FREQUENCIES</SectionLabel>
        {userProfile.frequencies.map((freq) => (
          <View key={freq.genre} style={styles.freqRow}>
            <Text style={styles.freqLabel}>{freq.genre.toUpperCase()}</Text>
            <View style={styles.freqBarBg}>
              <View style={[styles.freqBarFill, { width: `${freq.percent}%` as any }]} />
            </View>
            <Text style={styles.freqPercent}>{freq.percent}%</Text>
          </View>
        ))}

        {/* My collectives */}
        <SectionLabel style={styles.sectionLabel}>MY COLLECTIVES</SectionLabel>
        {myCollectives.map((c) => (
          <ListRow
            key={c.id}
            onPress={() => router.push(`/collective/${c.id}` as any)}
            avatar={<Avatar name={c.name} size={40} />}
            title={c.name}
            subtitle={`${c.handle} · ${c.members} members`}
            right={<Text style={styles.chevron}>›</Text>}
          />
        ))}

        {/* Settings links */}
        <SectionLabel style={styles.sectionLabel}>SETTINGS</SectionLabel>
        <ProfileLink label="MANAGE PREFERENCES" onPress={() => router.push('/preferences' as any)} />
        <ProfileLink label="VIEW FULL HISTORY" onPress={() => router.push('/history' as any)} />
        <ProfileLink label="INVITE A FRIEND" tone="cyan" onPress={() => router.push('/invite' as any)} />

        {/* Terminal metadata */}
        <View style={styles.metaBlock}>
          {['NODE_POSITION: SEATTLE', 'JOIN_CHANNEL: INVITE', 'SESSION: 0X8F71...A13'].map((m) => (
            <Text key={m} style={styles.metaText}>{m}</Text>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  scroll: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: 120 },
  header: { paddingBottom: spacing.sm },
  headerLabel: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.sm,
    color: colors.text,
    letterSpacing: letterSpacing.extraWide,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginBottom: spacing.lg,
  },
  username: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.xxl,
    color: colors.text,
    letterSpacing: letterSpacing.extraWide,
    marginBottom: spacing.xs,
  },
  memberSince: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    letterSpacing: letterSpacing.wide,
    marginBottom: spacing.xl,
  },
  statsRow: { flexDirection: 'row', alignItems: 'center' },
  stat: { alignItems: 'center', flex: 1 },
  statDivider: { width: 1, height: 30, backgroundColor: colors.border },
  statValue: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.xl,
    color: colors.text,
    letterSpacing: letterSpacing.normal,
  },
  scoreValue: { color: colors.green },
  statLabel: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    letterSpacing: letterSpacing.wide,
    marginTop: spacing.xs,
  },
  sectionLabel: { marginTop: spacing.xl, marginBottom: spacing.md },
  freqRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  freqLabel: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.xs,
    color: colors.text,
    width: 90,
    letterSpacing: letterSpacing.normal,
  },
  freqBarBg: { flex: 1, height: 2, backgroundColor: colors.border },
  freqBarFill: { height: 2, backgroundColor: colors.green },
  freqPercent: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.xs,
    color: colors.green,
    width: 36,
    textAlign: 'right',
    letterSpacing: letterSpacing.normal,
  },
  linkRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  linkLabel: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.md,
    color: colors.text,
    letterSpacing: letterSpacing.wide,
  },
  chevron: { fontFamily: fontFamily.regular, fontSize: fontSize.sm, color: colors.textDim },
  metaBlock: {
    marginTop: spacing.xxl,
    gap: spacing.xs,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    paddingTop: spacing.lg,
  },
  metaText: {
    fontFamily: fontFamily.mono,
    fontSize: fontSize.xs,
    color: colors.textDim,
    letterSpacing: letterSpacing.wide,
  },
});
