import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import CyberBackground from '../components/CyberBackground';
import BackButton from '../components/BackButton';
import SectionLabel from '../components/SectionLabel';
import GenreChip from '../components/GenreChip';
import GlitchButton from '../components/GlitchButton';
import Switch from '../components/Switch';
import { colors, fontFamily, fontSize, letterSpacing, spacing } from '../constants/theme';
import { genres, preferences } from '../constants/mockData';

interface ToggleRowProps {
  label: string;
  desc?: string;
  value: boolean;
  onToggle: () => void;
}

function ToggleRow({ label, desc, value, onToggle }: ToggleRowProps) {
  return (
    <View style={styles.toggleRow}>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={styles.toggleLabel}>{label.toUpperCase()}</Text>
        {desc ? <Text style={styles.toggleDesc}>{desc}</Text> : null}
      </View>
      <Switch on={value} onToggle={onToggle} />
    </View>
  );
}

export default function PreferencesScreen() {
  const router = useRouter();
  const [selectedGenres, setSelectedGenres] = useState<string[]>(preferences.genres);
  const [notify, setNotify] = useState(preferences.notify);
  const [privacy, setPrivacy] = useState(preferences.privacy);

  const toggleGenre = (g: string) =>
    setSelectedGenres((prev) => (prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]));

  return (
    <SafeAreaView style={styles.container}>
      <CyberBackground />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <BackButton label="PROFILE" onPress={() => router.back()} />
        <Text style={styles.title}>PREFERENCES</Text>

        <SectionLabel>FREQUENCIES</SectionLabel>
        <View style={styles.chipGrid}>
          {genres.map((g) => (
            <GenreChip key={g} label={g} selected={selectedGenres.includes(g)} onPress={() => toggleGenre(g)} />
          ))}
        </View>

        <SectionLabel style={styles.sectionLabel}>NOTIFICATIONS</SectionLabel>
        <ToggleRow label="New events" desc="from your collectives" value={notify.newEvents} onToggle={() => setNotify({ ...notify, newEvents: !notify.newEvents })} />
        <ToggleRow label="Pass updates" desc="approvals & changes" value={notify.passUpdates} onToggle={() => setNotify({ ...notify, passUpdates: !notify.passUpdates })} />
        <ToggleRow label="Chat" value={notify.chat} onToggle={() => setNotify({ ...notify, chat: !notify.chat })} />
        <ToggleRow label="Recommendations" value={notify.recommendations} onToggle={() => setNotify({ ...notify, recommendations: !notify.recommendations })} />

        <SectionLabel style={styles.sectionLabel}>PRIVACY</SectionLabel>
        <ToggleRow label="Discoverable" desc="let collectives find you to invite" value={privacy.discoverable} onToggle={() => setPrivacy({ ...privacy, discoverable: !privacy.discoverable })} />
        <ToggleRow label="Share history" desc="improves your feed & match score" value={privacy.shareHistory} onToggle={() => setPrivacy({ ...privacy, shareHistory: !privacy.shareHistory })} />

        <GlitchButton title="SAVE" onPress={() => router.back()} style={{ marginTop: spacing.xl }} />
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
    marginBottom: spacing.lg,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.sm,
  },
  sectionLabel: { marginTop: spacing.xl, marginBottom: spacing.md },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  toggleLabel: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.md,
    color: colors.text,
    letterSpacing: letterSpacing.wide,
  },
  toggleDesc: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: 3,
  },
});
