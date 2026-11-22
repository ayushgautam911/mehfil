import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import CyberBackground from '../../components/CyberBackground';
import CornerBrackets from '../../components/CornerBrackets';
import BackButton from '../../components/BackButton';
import QRBlock from '../../components/QRBlock';
import { colors, fontFamily, fontSize, letterSpacing, spacing } from '../../constants/theme';
import { passes } from '../../constants/mockData';

export default function PassDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const pass =
    passes.find((p) => p.id === id) || passes.find((p) => p.status === 'approved') || passes[0];

  return (
    <SafeAreaView style={styles.container}>
      <CyberBackground />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <BackButton label="PASSES" onPress={() => router.back()} />

        <View style={styles.center}>
          <Text style={styles.tag}>[ APPROVED PASS ]</Text>
          <Text style={styles.eventName}>{pass.eventName.toUpperCase()}</Text>
          <Text style={styles.meta}>{pass.date} · {pass.time} · {pass.collective.toLowerCase()}</Text>

          <View style={styles.qrFrame}>
            <CornerBrackets size={14} thickness={1.5} color={colors.green} padding={0} />
            <QRBlock code={pass.code} size={176} />
          </View>

          <Text style={styles.code}>{pass.code}</Text>
          <Text style={styles.entry}>{pass.entry.toUpperCase()}</Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            present this code at the door. non-transferable. screenshots are voided — the code rotates.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  scroll: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.xxl },
  center: { alignItems: 'center' },
  tag: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.xs,
    color: colors.green,
    letterSpacing: letterSpacing.extraWide,
    marginBottom: spacing.sm,
  },
  eventName: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.xl,
    color: colors.text,
    letterSpacing: letterSpacing.wide,
    textAlign: 'center',
    marginBottom: spacing.sm,
    lineHeight: fontSize.xl * 1.3,
  },
  meta: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    letterSpacing: letterSpacing.normal,
    marginBottom: spacing.xl,
  },
  qrFrame: {
    position: 'relative',
    padding: spacing.lg,
  },
  code: {
    fontFamily: fontFamily.mono,
    fontSize: fontSize.lg,
    color: colors.green,
    letterSpacing: letterSpacing.wide,
    marginTop: spacing.lg,
    marginBottom: spacing.xs,
  },
  entry: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    letterSpacing: letterSpacing.wide,
  },
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
