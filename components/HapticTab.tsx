import React from 'react';
import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Tabs } from 'expo-router';

interface HapticTabProps {
  children: React.ReactNode;
}

export const HapticTab = ({ children }: HapticTabProps) => {
  const handleTabPress = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          backgroundColor: 'transparent',
          borderTopWidth: 0,
          elevation: 0,
          height: 60,
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#8E8E93',
        headerShown: false,
      }}
      screenListeners={{
        tabPress: handleTabPress,
      }}
    >
      {children}
    </Tabs>
  );
};
