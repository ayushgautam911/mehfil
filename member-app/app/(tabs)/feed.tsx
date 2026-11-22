import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import EventCard from '../../components/EventCard';
import CyberBackground from '../../components/CyberBackground';
import { colors, fontFamily, fontSize, spacing } from '../../constants/theme';
import { events } from '../../constants/mockData';

export default function FeedScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <CyberBackground />
      <View style={styles.header}>
        <Text style={styles.headerLabel}>HIVE / FEED</Text>
        <Text style={styles.headerSub}>{events.length} EVENTS</Text>
      </View>
      <View style={styles.divider} />

      <FlatList
        data={events}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <EventCard
            event={item}
            onPress={() => router.push(`/event/${item.id}` as any)}
          />
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  headerLabel: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.sm,
    color: colors.text,
    letterSpacing: 4,
  },
  headerSub: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.xs,
    color: colors.green,
    letterSpacing: 2,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  list: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: 100,
  },
});
