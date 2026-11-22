import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import CyberBackground from '../../components/CyberBackground';
import BackButton from '../../components/BackButton';
import Avatar from '../../components/Avatar';
import Tag from '../../components/Tag';
import StatusBadge from '../../components/StatusBadge';
import ListRow from '../../components/ListRow';
import SectionLabel from '../../components/SectionLabel';
import GlitchButton from '../../components/GlitchButton';
import { colors, fontFamily, fontSize, letterSpacing, spacing } from '../../constants/theme';
import { allCollectives, events, chats } from '../../constants/mockData';

export default function CollectiveDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const c = allCollectives.find((x) => x.id === id) || allCollectives[0];
  const upcoming = events.filter((e) => e.collective === c.name);
  const isMember = c.status === 'member';
  const isInvited = c.status === 'invited';

  const openChat = () => {
    const thread = chats.find((ch) => ch.collective === c.name);
    if (thread) router.push(`/chat/${thread.id}` as any);
  };

  return (
    <SafeAreaView style={styles.container}>
      <CyberBackground />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <BackButton label="COLLECTIVES" onPress={() => router.back()} />

        <View style={styles.headerRow}>
          <Avatar name={c.name} size={56} glow={isMember} />
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{c.name}</Text>
            <Text style={styles.handle}>
              {c.handle} · {c.members} MEMBERS · {(c.location || '').toUpperCase()}
            </Text>
          </View>
        </View>

        <View style={styles.tagRow}>
          {c.genres.map((g) => (
            <Tag key={g} label={g} />
          ))}
          <StatusBadge status={c.status} style={styles.statusInline} />
        </View>

        {c.about ? <Text style={styles.about}>{c.about}</Text> : null}

        {isInvited ? (
          <View style={styles.invitedBlock}>
            <Text style={styles.invitedLabel}>YOU'VE BEEN INVITED TO JOIN</Text>
            <GlitchButton title="ACCEPT MEMBERSHIP" onPress={() => router.back()} />
            <TouchableOpacity onPress={() => router.back()} style={styles.declineBtn}>
              <Text style={styles.declineText}>DECLINE</Text>
            </TouchableOpacity>
          </View>
        ) : isMember ? (
          <>
            <View style={styles.messageRow}>
              <GlitchButton title="MESSAGE" onPress={openChat} />
            </View>
            <SectionLabel style={styles.sectionLabel}>UPCOMING</SectionLabel>
            {upcoming.length ? (
              upcoming.map((e) => (
                <ListRow
                  key={e.id}
                  onPress={() => router.push(`/event/${e.id}` as any)}
                  title={e.name}
                  subtitle={`${e.date} · ${e.time} · ${e.venue}`}
                  right={
                    e.passStatus ? (
                      <StatusBadge status={e.passStatus} />
                    ) : (
                      <Text style={styles.chevron}>›</Text>
                    )
                  }
                />
              ))
            ) : (
              <Text style={styles.empty}>no events scheduled.</Text>
            )}
            <TouchableOpacity style={styles.leaveBtn}>
              <Text style={styles.leaveText}>LEAVE COLLECTIVE</Text>
            </TouchableOpacity>
          </>
        ) : (
          <View style={styles.pendingBox}>
            <Text style={styles.pendingText}>APPLICATION PENDING</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  scroll: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.xxl },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  name: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.xxl,
    color: colors.text,
    letterSpacing: letterSpacing.extraWide,
  },
  handle: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    letterSpacing: letterSpacing.wide,
    marginTop: 4,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.lg,
  },
  statusInline: { marginLeft: spacing.xs },
  about: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.md,
    color: colors.textSecondary,
    letterSpacing: letterSpacing.normal,
    lineHeight: fontSize.md * 1.5,
  },
  invitedBlock: { marginTop: spacing.xl },
  invitedLabel: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.xs,
    color: colors.cyan,
    letterSpacing: letterSpacing.wide,
    marginBottom: spacing.md,
  },
  declineBtn: { marginTop: spacing.md, alignItems: 'center' },
  declineText: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    letterSpacing: letterSpacing.extraWide,
  },
  messageRow: { marginTop: spacing.xl },
  sectionLabel: { marginTop: spacing.xl, marginBottom: spacing.md },
  chevron: { fontFamily: fontFamily.regular, fontSize: fontSize.sm, color: colors.textDim },
  empty: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
    color: colors.textDim,
  },
  leaveBtn: { marginTop: spacing.xxl },
  leaveText: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    letterSpacing: letterSpacing.extraWide,
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
  },
});
