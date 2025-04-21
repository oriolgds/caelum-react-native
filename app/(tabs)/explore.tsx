import React from 'react';
import { StyleSheet, View, Text, ScrollView, StatusBar, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';

import { useLocation } from '../../hooks/useLocation';
import { useWeather } from '../../hooks/useWeather';
import { useColorScheme } from '../../hooks/useColorScheme';
import { Colors } from '../../constants/Colors';

export default function ExploreScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const location = useLocation();
  const { current, isLoading } = useWeather(location.latitude, location.longitude);
  const scrollY = useSharedValue(0);

  const renderDetailCard = ({ title, value, units = '', icon }: any) => {
    const animatedStyle = useAnimatedStyle(() => {
      const scale = interpolate(
        scrollY.value,
        [0, 100],
        [1, 0.98],
        Extrapolate.CLAMP
      );
      
      return {
        transform: [{ scale }]
      };
    });

    return (
      <Animated.View style={[styles.detailCard, animatedStyle]}>
        <BlurView
          tint={isDark ? 'dark' : 'light'}
          intensity={isDark ? 40 : 60}
          style={[
            styles.cardContent,
            { borderWidth: 1, borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }
          ]}
        >
          <Ionicons 
            name={icon} 
            size={24} 
            color={isDark ? Colors.dark.text : Colors.light.text} 
          />
          <Text style={[styles.detailValue, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
            {value}{units}
          </Text>
          <Text style={[styles.detailTitle, { color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)' }]}>
            {title}
          </Text>
        </BlurView>
      </Animated.View>
    );
  };

  if (isLoading || !current) {
    return (
      <LinearGradient
        colors={isDark ? ['#1c1c1e', '#2c2c2e'] : ['#f2f2f7', '#e5e5ea']}
        style={styles.container}
      >
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.loadingContainer}>
            <Text style={[styles.loadingText, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
              Cargando información...
            </Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  const details = [
    {
      title: 'Humedad',
      value: current.main.humidity,
      units: '%',
      icon: 'water-outline'
    },
    {
      title: 'Viento',
      value: Math.round(current.wind.speed * 3.6),
      units: ' km/h',
      icon: 'speedometer-outline'
    },
    {
      title: 'Presión',
      value: current.main.pressure,
      units: ' hPa',
      icon: 'thermometer-outline'
    },
    {
      title: 'Visibilidad',
      value: (current.visibility / 1000).toFixed(1),
      units: ' km',
      icon: 'eye-outline'
    },
    {
      title: 'Nubosidad',
      value: current.clouds.all,
      units: '%',
      icon: 'cloud-outline'
    },
    {
      title: 'Sensación',
      value: Math.round(current.main.feels_like),
      units: '°',
      icon: 'body-outline'
    }
  ];

  const handleScroll = (event: any) => {
    'worklet';
    scrollY.value = event.nativeEvent.contentOffset.y;
  };

  const headerStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [0, 100],
      [1, 0],
      Extrapolate.CLAMP
    );

    const translateY = interpolate(
      scrollY.value,
      [0, 100],
      [0, -50],
      Extrapolate.CLAMP
    );

    return {
      opacity,
      transform: [{ translateY }]
    };
  });

  return (
    <>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={isDark ? ['#1c1c1e', '#2c2c2e'] : ['#f2f2f7', '#e5e5ea']}
        style={styles.container}
      >
        <SafeAreaView style={styles.safeArea}>
          <Animated.View style={[styles.header, headerStyle]}>
            <Text style={[styles.headerTitle, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
              Detalles del clima
            </Text>
          </Animated.View>

          <Animated.ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.gridContainer}>
              {details.map((detail, index) => (
                renderDetailCard(detail)
              ))}
            </View>
          </Animated.ScrollView>
        </SafeAreaView>
      </LinearGradient>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    padding: 16,
    paddingTop: Platform.OS === 'ios' ? 0 : 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingTop: 0,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
  },
  detailCard: {
    width: '47%',
    aspectRatio: 1,
    marginBottom: 16,
  },
  cardContent: {
    flex: 1,
    borderRadius: 24,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  detailTitle: {
    fontSize: 15,
    marginTop: 8,
    textAlign: 'center',
  },
  detailValue: {
    fontSize: 24,
    fontWeight: '600',
    marginTop: 12,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '500',
  },
});
