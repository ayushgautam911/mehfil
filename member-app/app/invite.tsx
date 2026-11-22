import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, fontFamily, fontSize, spacing } from '../constants/theme';
import { invite } from '../constants/mockData';

export default function InviteScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backRow}>
          <Text style={styles.backText}>← private_invite</Text>
        </TouchableOpacity>

        <View style={styles.center}>
          <Text style={styles.inviteLabel}>you're invited</Text>
          <Text style={styles.eventName}>{invite.eventName}</Text>
          <View style={styles.divider} />
          <Text style={styles.fromText}>
            from {invite.from} ·{' '}
            <Text style={styles.spotsText}>
              {invite.spotsRemaining} spots remaining
            </Text>
          </Text>

          <TouchableOpacity style={styles.acceptButton} activeOpacity={0.7}>
            <Text style={styles.acceptText}>a c c e p t</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.referralSection}>
          <Text style={styles.referralLabel}>your referral code</Text>
          <View style={styles.codeRow}>
            <Text style={styles.codeText}>{invite.referralCode}</Text>
            <TouchableOpacity>
              <Text style={styles.copyLink}>copy</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.inviteLimitText}>
            you can invite up to {invite.maxInvites} friends
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  scroll: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    flex: 1,
  },
  backRow: {
    marginBottom: spacing.xxl,
  },
  backText: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    letterSpacing: 1,
  },
  center: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingBottom: spacing.xxl,
  },
  inviteLabel: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
    color: colors.cyan,
    letterSpacing: 3,
    marginBottom: spacing.md,
  },
  eventName: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.xxxl,
    color: colors.text,
    letterSpacing: 8,
    textShadowColor: colors.green,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 15,
  },
  divider: {
    width: 60,
    height: 1,
    backgroundColor: colors.green,
    opacity: 0.3,
    marginVertical: spacing.lg,
  },
  fromText: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
  },
  spotsText: {
    color: colors.green,
  },
  acceptButton: {
    borderWidth: 1,
    borderColor: colors.green,
    borderRadius: 0,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xxl,
  },
  acceptText: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.md,
    color: colors.green,
    letterSpacing: 6,
  },
  referralSection: {
    alignItems: 'center',
    paddingBottom: spacing.xxl,
  },
  referralLabel: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.xs,
    color: colors.cyan,
    letterSpacing: 2,
    marginBottom: spacing.sm,
  },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  codeText: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.xl,
    color: colors.green,
    letterSpacing: 2,
  },
  copyLink: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
    color: colors.cyan,
    textDecorationLine: 'underline',
  },
  inviteLimitText: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.xs,
    color: colors.textDim,
    letterSpacing: 1,
  },
});
