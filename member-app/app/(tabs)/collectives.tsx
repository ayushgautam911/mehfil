import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import CyberBackground from '../../components/CyberBackground';
import Avatar from '../../components/Avatar';
import StatusBadge from '../../components/StatusBadge';
import ListRow from '../../components/ListRow';
import SectionLabel from '../../components/SectionLabel';
import { colors, fontFamily, fontSize, letterSpacing, spacing } from '../../constants/theme';
import { myCollectives, pendingInvitations, pendingApplications } from '../../constants/mockData';

export default function CollectivesScreen() {
  const router = useRouter();
  const open = (id: string) => router.push(`/collective/${id}` as any);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <CyberBackground />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerLabel}>HIVE / COLLECTIVES</Text>
          <Text style={styles.headerSub}>{myCollectives.length} JOINED</Text>
        </View>
        <View style={styles.divider} />

        {pendingInvitations.length ? (
          <>
            <SectionLabel tone="cyan" style={styles.sectionLabel}>PENDING INVITATIONS</SectionLabel>
            {pendingInvitations.map((c) => (
              <ListRow
                key={c.id}
                onPress={() => open(c.id)}
                avatar={<Avatar name={c.name} size={40} glow color={colors.cyan} />}
                title={c.name}
                subtitle={`invited by ${c.invitedBy} · ${c.members} members`}
                right={<StatusBadge status="invited" />}
              />
            ))}
          </>
        ) : null}

        <SectionLabel style={styles.sectionLabel}>YOUR COLLECTIVES</SectionLabel>
        {myCollectives.map((c) => (
          <ListRow
            key={c.id}
            onPress={() => open(c.id)}
            avatar={<Avatar name={c.name} size={40} />}
            title={c.name}
            subtitle={`${c.handle} · ${c.members} members`}
            right={<Text style={styles.chevron}>›</Text>}
          />
        ))}

        {pendingApplications.length ? (
          <>
            <SectionLabel style={styles.sectionLabel}>PENDING APPLICATIONS</SectionLabel>
            {pendingApplications.map((c) => (
              <ListRow
                key={c.id}
                dim
                onPress={() => open(c.id)}
                avatar={<Avatar name={c.name} size={40} />}
                title={c.name}
                subtitle={`applied ${c.appliedDate} · ${c.members} members`}
                right={<StatusBadge status="applied" />}
              />
            ))}
          </>
        ) : null}

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            hive is invite-only. you can't browse collectives — you only see one once a member invites you, or after you're approved.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  scroll: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: 120 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingBottom: spacing.sm,
  },
  headerLabel: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.sm,
    color: colors.text,
    letterSpacing: letterSpacing.extraWide,
  },
  headerSub: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.xs,
    color: colors.green,
    letterSpacing: letterSpacing.wide,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginBottom: spacing.sm,
  },
  sectionLabel: { marginTop: spacing.lg, marginBottom: spacing.md },
  chevron: { fontFamily: fontFamily.regular, fontSize: fontSize.sm, color: colors.textDim },
  footer: {
    marginTop: spacing.xxl,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    paddingTop: spacing.lg,
  },
  footerText: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.xs,
    color: colors.textDim,
    letterSpacing: letterSpacing.normal,
    lineHeight: fontSize.xs * 1.5,
  },
});
