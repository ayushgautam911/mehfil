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
import { passes, Pass } from '../../constants/mockData';

export default function PassesScreen() {
  const router = useRouter();
  const active = passes.filter((p) => p.status === 'approved' && !p.isPast);
  const pending = passes.filter((p) => p.status === 'pending');
  const archive = passes.filter((p) => p.isPast || p.status === 'declined');

  const renderRow = (p: Pass, dim?: boolean) => {
    const isActive = p.status === 'approved' && !p.isPast;
    return (
      <ListRow
        key={p.id}
        dim={dim}
        onPress={isActive ? () => router.push(`/pass/${p.id}` as any) : undefined}
        avatar={<Avatar name={p.collective} size={40} glow={isActive} />}
        title={p.eventName}
        subtitle={`${p.date} · ${p.time} · ${p.collective.toLowerCase()}`}
        right={
          <View style={styles.rightCol}>
            <StatusBadge status={p.status} />
            {isActive ? <Text style={styles.qr}>[QR] ›</Text> : null}
          </View>
        }
      />
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <CyberBackground />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerLabel}>HIVE / PASSES</Text>
          <Text style={styles.headerSub}>{active.length} ACTIVE</Text>
        </View>
        <View style={styles.divider} />

        {active.length ? (
          <>
            <SectionLabel style={styles.sectionLabel}>ACTIVE</SectionLabel>
            {active.map((p) => renderRow(p))}
          </>
        ) : null}

        {pending.length ? (
          <>
            <SectionLabel tone="cyan" style={styles.sectionLabel}>AWAITING APPROVAL</SectionLabel>
            {pending.map((p) => renderRow(p))}
          </>
        ) : null}

        {archive.length ? (
          <>
            <SectionLabel style={styles.sectionLabel}>ARCHIVE</SectionLabel>
            {archive.map((p) => renderRow(p, true))}
          </>
        ) : null}
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
  rightCol: { alignItems: 'flex-end', gap: 4 },
  qr: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.xs,
    color: colors.green,
  },
});
