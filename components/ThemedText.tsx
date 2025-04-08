import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';

interface ThemedTextProps extends TextProps {
  lightColor?: string;
  darkColor?: string;
}

export function ThemedText({
  style,
  lightColor,
  darkColor,
  ...otherProps
}: ThemedTextProps) {
  const colorScheme = useColorScheme();
  const color = colorScheme === 'dark' ? darkColor : lightColor;

  return (
    <Text
      style={[
        { color },
        styles.text,
        style,
      ]}
      {...otherProps}
    />
  );
}

const styles = StyleSheet.create({
  text: {
    fontFamily: 'System',
  },
});
