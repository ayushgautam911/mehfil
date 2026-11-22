import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { Tabs } from 'expo-router';
import { colors, fontFamily, glow } from '../../constants/theme';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { chats, pendingInvitations } from '../../constants/mockData';

// Data-driven dot indicators on CHAT (unread) and COLLECTIVES (pending invites).
const badges: Record<string, boolean> = {
  chat: chats.some((c) => c.unread > 0),
  collectives: pendingInvitations.length > 0,
};

function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const visibleRoutes = state.routes;
  const slideAnim = useSharedValue(0);

  useEffect(() => {
    const activeRouteKey = state.routes[state.index].key;
    const activeVisibleIndex = visibleRoutes.findIndex((r) => r.key === activeRouteKey);
    if (activeVisibleIndex !== -1) {
      slideAnim.value = withSpring(activeVisibleIndex, { damping: 15, stiffness: 150 });
    }
  }, [state.index, visibleRoutes, slideAnim, state.routes]);

  const animatedStyle = useAnimatedStyle(() => ({
    left: `${(slideAnim.value * 100) / visibleRoutes.length}%`,
  }));

  return (
    <View style={styles.tabBarContainer}>
      <Animated.View
        style={[styles.activeIndicator, { width: `${100 / visibleRoutes.length}%` }, animatedStyle]}
      >
        <View style={styles.indicatorGlow} />
      </Animated.View>

      {visibleRoutes.map((route) => {
        const { options } = descriptors[route.key];
        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
            ? options.title
            : route.name;
        const isFocused = state.index === state.routes.findIndex((r) => r.key === route.key);

        const onPress = () => {
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        return (
          <TouchableOpacity key={route.key} activeOpacity={1} onPress={onPress} style={styles.tabItem}>
            <View>
              <Text style={[styles.tabLabel, isFocused ? styles.tabLabelActive : styles.tabLabelInactive]}>
                {label as string}
              </Text>
              {badges[route.name] ? <View style={styles.dot} /> : null}
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs tabBar={(props) => <CustomTabBar {...props} />} screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="feed" options={{ title: 'FEED', tabBarLabel: 'FEED' }} />
      <Tabs.Screen name="collectives" options={{ title: 'COLLECTIVES', tabBarLabel: 'COLLECTIVES' }} />
      <Tabs.Screen name="passes" options={{ title: 'PASSES', tabBarLabel: 'PASSES' }} />
      <Tabs.Screen name="chat" options={{ title: 'CHAT', tabBarLabel: 'CHAT' }} />
      <Tabs.Screen name="profile" options={{ title: 'PROFILE', tabBarLabel: 'PROFILE' }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    position: 'absolute',
    bottom: 32,
    left: 16,
    right: 16,
    height: 54,
    borderRadius: 28,
    backgroundColor: colors.surfaceChrome,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 65, 0.15)',
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: colors.green,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  activeIndicator: {
    position: 'absolute',
    height: '100%',
    padding: 5,
    zIndex: 0,
  },
  indicatorGlow: {
    flex: 1,
    backgroundColor: colors.greenBg,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.borderGlow,
  },
  tabItem: {
    flex: 1,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  tabLabel: {
    fontFamily: fontFamily.bold,
    fontSize: 9,
    letterSpacing: 0.5,
  },
  tabLabelActive: {
    color: colors.green,
    ...glow.textGreen,
  },
  tabLabelInactive: {
    color: colors.textSecondary,
  },
  dot: {
    position: 'absolute',
    top: -3,
    right: -7,
    width: 5,
    height: 5,
    backgroundColor: colors.green,
    ...glow.green,
  },
});
