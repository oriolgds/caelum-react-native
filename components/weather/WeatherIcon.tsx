import React from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
  Easing
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { weatherConditions } from '../../constants/Weather';
import { useColorScheme } from '../../hooks/useColorScheme';

interface WeatherIconProps {
  iconCode: string;
  size?: 'small' | 'medium' | 'large';
  showBackground?: boolean;
  animate?: boolean;
}

export const WeatherIcon: React.FC<WeatherIconProps> = ({ 
  iconCode, 
  size = 'medium',
  showBackground = false,
  animate = true
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const rotationValue = useSharedValue(0);
  const scaleValue = useSharedValue(1);
  const opacityValue = useSharedValue(1);

  const weatherInfo = weatherConditions[iconCode] || { 
    label: 'Desconocido', 
    icon: '❓', 
    color: '#FFFFFF',
    bgColor: '#CCCCCC'
  };

  React.useEffect(() => {
    if (animate) {
      // Animación específica según el tipo de clima
      if (iconCode.includes('01')) { // Sol
        rotationValue.value = withRepeat(
          withTiming(360, { 
            duration: 20000,
            easing: Easing.linear 
          }),
          -1,
          false
        );
      } else if (iconCode.includes('09') || iconCode.includes('10')) { // Lluvia
        opacityValue.value = withRepeat(
          withSequence(
            withTiming(0.7, { duration: 1000 }),
            withTiming(1, { duration: 1000 })
          ),
          -1,
          true
        );
      } else if (iconCode.includes('11')) { // Tormenta
        scaleValue.value = withRepeat(
          withSequence(
            withTiming(1.1, { duration: 200 }),
            withTiming(1, { duration: 200 })
          ),
          -1,
          true
        );
      } else if (iconCode.includes('13')) { // Nieve
        rotationValue.value = withRepeat(
          withSequence(
            withTiming(-10, { duration: 1000 }),
            withTiming(10, { duration: 1000 })
          ),
          -1,
          true
        );
      } else if (iconCode.includes('50')) { // Niebla
        opacityValue.value = withRepeat(
          withSequence(
            withTiming(0.5, { duration: 2000 }),
            withTiming(1, { duration: 2000 })
          ),
          -1,
          true
        );
      }
    }
  }, [iconCode, animate]);

  const sizeMap = {
    small: { icon: 24, container: 40 },
    medium: { icon: 48, container: 72 },
    large: { icon: 80, container: 110 }
  };

  const iconSize = sizeMap[size];

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { rotate: `${rotationValue.value}deg` },
        { scale: scaleValue.value }
      ],
      opacity: opacityValue.value
    };
  });

  return (
    <Animated.View style={[
      styles.container,
      {
        width: iconSize.container,
        height: iconSize.container,
      }
    ]}>
      {showBackground && (
        <BlurView
          tint={isDark ? 'dark' : 'light'}
          intensity={isDark ? 40 : 60}
          style={[
            styles.backgroundBlur,
            {
              backgroundColor: isDark 
                ? 'rgba(255,255,255,0.1)' 
                : 'rgba(0,0,0,0.05)',
            }
          ]}
        />
      )}
      <Animated.Text 
        style={[
          styles.icon, 
          { 
            fontSize: iconSize.icon,
            textShadowColor: 'rgba(0,0,0,0.1)',
            textShadowOffset: { width: 0, height: 2 },
            textShadowRadius: 4
          },
          animatedStyle
        ]}
      >
        {weatherInfo.icon}
      </Animated.Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  backgroundBlur: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 100,
    overflow: 'hidden',
  },
  icon: {
    textAlign: 'center',
  }
});