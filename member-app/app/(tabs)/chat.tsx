import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import CyberBackground from '../../components/CyberBackground';
import Avatar from '../../components/Avatar';
import ListRow from '../../components/ListRow';
import { colors, fontFamily, fontSize, letterSpacing, glow, spacing } from '../../constants/theme';
import { chats } from '../../constants/mockData';

export default function ChatListScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <CyberBackground />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerLabel}>HIVE / CHAT</Text>
          <Text style={styles.headerSub}>{chats.length} THREADS</Text>
        </View>
        <View style={styles.divider} />

        <Text style={styles.note}>direct line to each collective you've joined.</Text>

        {chats.map((ch) => (
          <ListRow
            key={ch.id}
            onPress={() => router.push(`/chat/${ch.id}` as any)}
            avatar={<Avatar name={ch.collective} size={44} glow={ch.unread > 0} />}
            title={ch.collective}
            subtitle={ch.lastMessage}
            right={
              <View style={styles.rightCol}>
                <Text style={styles.time}>{ch.lastTime}</Text>
                {ch.unread > 0 ? <View style={styles.unreadDot} /> : null}
              </View>
            }
          />
        ))}
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
  note: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.xs,
    color: colors.textDim,
    letterSpacing: letterSpacing.normal,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  rightCol: { alignItems: 'flex-end', gap: 6 },
  time: {
    fontFamily: fontFamily.regular,
    fontSize: 9,
    color: colors.textDim,
    letterSpacing: letterSpacing.wide,
  },
  unreadDot: {
    width: 7,
    height: 7,
    backgroundColor: colors.green,
    ...glow.green,
  },
});
