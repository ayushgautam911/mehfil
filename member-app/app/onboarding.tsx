import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import GenreChip from '../components/GenreChip';
import GlitchButton from '../components/GlitchButton';
import CyberBackground from '../components/CyberBackground';
import { colors, fontFamily, fontSize, spacing } from '../constants/theme';
import { genres, artists } from '../constants/mockData';

export default function OnboardingScreen() {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>(['acid', 'dub techno']);
  const [search, setSearch] = useState('');

  const toggleGenre = (genre: string) => {
    setSelected((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <CyberBackground />
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.hiveLabel}>hive</Text>

        <Text style={styles.title}>what moves you?</Text>
        <Text style={styles.subtitle}>select your frequencies</Text>

        <View style={styles.chipGrid}>
          {genres.map((genre) => (
            <GenreChip
              key={genre}
              label={genre}
              selected={selected.includes(genre)}
              onPress={() => toggleGenre(genre)}
            />
          ))}
        </View>

        <Text style={styles.sectionLabel}>artists</Text>
        <View style={styles.searchRow}>
          <TextInput
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholder="search..."
            placeholderTextColor={colors.textDim}
          />
        </View>

        {artists.slice(0, 2).map((artist) => (
          <View key={artist.name} style={styles.artistRow}>
            <View style={styles.artistAvatar} />
            <View>
              <Text style={styles.artistName}>{artist.name}</Text>
              <Text style={styles.artistGenres}>{artist.genres}</Text>
            </View>
          </View>
        ))}

        <GlitchButton
          title="CONTINUE"
          onPress={() => router.replace('/(tabs)/feed')}
          style={{ marginTop: spacing.xl }}
        />
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
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  hiveLabel: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    letterSpacing: 4,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.xxl,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
    color: colors.cyan,
    letterSpacing: 1,
    marginBottom: spacing.xl,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing.xl,
  },
  sectionLabel: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
    color: colors.cyan,
    letterSpacing: 3,
    marginBottom: spacing.md,
  },
  searchRow: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginBottom: spacing.lg,
  },
  searchInput: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.md,
    color: colors.text,
    paddingVertical: spacing.sm,
  },
  artistRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  artistAvatar: {
    width: 36,
    height: 36,
    backgroundColor: colors.surface,
    borderRadius: 0,
  },
  artistName: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.md,
    color: colors.text,
  },
  artistGenres: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  continueButton: {
    borderWidth: 1,
    borderColor: colors.green,
    borderRadius: 0,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  continueText: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.md,
    color: colors.green,
    letterSpacing: 4,
  },
});
