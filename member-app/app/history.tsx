import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import CyberBackground from '../components/CyberBackground';
import BackButton from '../components/BackButton';
import SectionLabel from '../components/SectionLabel';
import StatusBadge from '../components/StatusBadge';
import GlitchButton from '../components/GlitchButton';
import { colors, fontFamily, fontSize, letterSpacing, spacing } from '../constants/theme';
import { history } from '../constants/mockData';

export default function HistoryScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <CyberBackground />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <BackButton label="PROFILE" onPress={() => router.back()} />
        <Text style={styles.title}>HISTORY</Text>
        <Text style={styles.intro}>
          hive builds your taste graph from where you've actually been. sync your history to sharpen your feed.
        </Text>

        <SectionLabel>SYNC SOURCES</SectionLabel>
        {history.sources.map((s) => (
          <View key={s.name} style={styles.sourceRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.sourceName}>{s.name.toUpperCase()}</Text>
              {s.count ? <Text style={styles.sourceCount}>{s.count} events imported</Text> : null}
            </View>
            {s.status === 'synced' ? (
              <StatusBadge status="synced" />
            ) : (
              <TouchableOpacity style={styles.connectChip}>
                <Text style={styles.connectText}>CONNECT</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}

        <GlitchButton title="UPLOAD HISTORIC DATA" onPress={() => {}} style={{ marginTop: spacing.lg }} />

        <SectionLabel style={styles.sectionLabel}>SYNCED TIMELINE</SectionLabel>
        {history.items.map((it, i) => (
          <View key={i} style={styles.timelineRow}>
            <Text style={styles.timelineDate}>{it.date}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.timelineName}>{it.name.toUpperCase()}</Text>
              <Text style={styles.timelineMeta}>
                {it.collective === 'external' ? it.genre : `${it.collective.toLowerCase()} · ${it.genre}`}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  scroll: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.xxl },
  title: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.xxl,
    color: colors.text,
    letterSpacing: letterSpacing.extraWide,
    marginBottom: spacing.md,
  },
  intro: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    letterSpacing: letterSpacing.normal,
    lineHeight: fontSize.sm * 1.5,
    marginBottom: spacing.lg,
  },
  sourceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  sourceName: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.md,
    color: colors.text,
    letterSpacing: letterSpacing.wide,
  },
  sourceCount: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  connectChip: {
    borderWidth: 1,
    borderColor: colors.cyan,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  connectText: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.xs,
    color: colors.cyan,
    letterSpacing: letterSpacing.wide,
  },
  sectionLabel: { marginTop: spacing.xl, marginBottom: spacing.md },
  timelineRow: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  timelineDate: {
    fontFamily: fontFamily.mono,
    fontSize: fontSize.xs,
    color: colors.textDim,
    letterSpacing: letterSpacing.wide,
    width: 52,
    paddingTop: 2,
  },
  timelineName: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.md,
    color: colors.text,
    letterSpacing: letterSpacing.wide,
  },
  timelineMeta: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
});
