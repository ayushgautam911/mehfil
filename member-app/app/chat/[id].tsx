import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import CyberBackground from '../../components/CyberBackground';
import Avatar from '../../components/Avatar';
import ChatBubble from '../../components/ChatBubble';
import { colors, fontFamily, fontSize, letterSpacing, spacing } from '../../constants/theme';
import { chats } from '../../constants/mockData';

export default function ChatThreadScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const thread = chats.find((c) => c.id === id) || chats[0];
  const scroller = useRef<ScrollView>(null);
  const [draft, setDraft] = useState('');

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <CyberBackground />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
          <Avatar name={thread.collective} size={36} />
          <View>
            <Text style={styles.collective}>{thread.collective}</Text>
            <Text style={styles.presence}>● COLLECTIVE · DIRECT</Text>
          </View>
        </View>

        {/* Messages */}
        <ScrollView
          ref={scroller}
          contentContainerStyle={styles.messages}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => scroller.current?.scrollToEnd({ animated: false })}
        >
          {thread.messages.map((m, i) => (
            <ChatBubble key={i} from={m.from} text={m.text} time={m.time} />
          ))}
        </ScrollView>

        {/* Composer */}
        <View style={styles.composer}>
          <TextInput
            style={styles.input}
            value={draft}
            onChangeText={setDraft}
            placeholder="message..."
            placeholderTextColor={colors.textDim}
          />
          <TouchableOpacity style={styles.sendBtn} onPress={() => setDraft('')}>
            <Text style={styles.sendText}>SEND</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  backBtn: { paddingRight: spacing.xs },
  backArrow: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.lg,
    color: colors.textSecondary,
  },
  collective: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.md,
    color: colors.text,
    letterSpacing: letterSpacing.wide,
  },
  presence: {
    fontFamily: fontFamily.regular,
    fontSize: 9,
    color: colors.green,
    letterSpacing: letterSpacing.wide,
    marginTop: 2,
  },
  messages: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  composer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  input: {
    flex: 1,
    fontFamily: fontFamily.regular,
    fontSize: fontSize.md,
    color: colors.text,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sendBtn: {
    borderWidth: 1,
    borderColor: colors.green,
    backgroundColor: colors.greenBg,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  sendText: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.xs,
    color: colors.green,
    letterSpacing: letterSpacing.wide,
  },
});
