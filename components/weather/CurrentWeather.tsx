import React, { useState } from 'react';
import { StyleSheet, Text, View, Dimensions } from 'react-native';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import { TouchableOpacity } from 'react-native-gesture-handler';

import { WeatherData } from '../../types/weather';
import { WeatherIcon } from './WeatherIcon';
import { Colors } from '../../constants/Colors';
import { useColorScheme } from '../../hooks/useColorScheme';

interface CurrentWeatherProps {
  weatherData: WeatherData;
  isLoading?: boolean;
}

export const CurrentWeather: React.FC<CurrentWeatherProps> = ({ 
  weatherData,
  isLoading = false 
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [showDetails, setShowDetails] = useState(false);
  const expandAnim = useSharedValue(0);
  
  const handleToggleDetails = () => {
    setShowDetails(!showDetails);
    expandAnim.value = withSpring(showDetails ? 0 : 1, {
      damping: 15,
      stiffness: 100,
      mass: 1
    });
  };

  const detailsStyle = useAnimatedStyle(() => {
    return {
      opacity: expandAnim.value,
      transform: [
        {
          translateY: interpolate(
            expandAnim.value,
            [0, 1],
            [20, 0],
            Extrapolate.CLAMP
          )
        }
      ]
    };
  });

  if (isLoading || !weatherData) {
    return (
      <View style={styles.container}>
        <Text style={[styles.loadingText, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
          Cargando...
        </Text>
      </View>
    );
  }

  const weatherIcon = weatherData.weather[0].icon;
  const temp = Math.round(weatherData.main.temp);
  const feelsLike = Math.round(weatherData.main.feels_like);
  const tempMin = Math.round(weatherData.main.temp_min);
  const tempMax = Math.round(weatherData.main.temp_max);
  const description = weatherData.weather[0].description;
  const cityName = weatherData.name;
  const humidity = weatherData.main.humidity;
  const windSpeed = Math.round(weatherData.wind.speed * 3.6); // Convertir m/s a km/h
  const date = new Date(weatherData.dt * 1000);
  const formattedDate = format(date, "EEEE, d 'de' MMMM", { locale: es });
  const sunrise = new Date(weatherData.sys.sunrise * 1000);
  const sunset = new Date(weatherData.sys.sunset * 1000);
  const formattedSunrise = format(sunrise, 'HH:mm');
  const formattedSunset = format(sunset, 'HH:mm');

  return (
    <View style={styles.container}>
      <BlurView 
        tint={isDark ? 'dark' : 'light'} 
        intensity={isDark ? 60 : 80} 
        style={[styles.contentContainer, { borderWidth: 1, borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }]}
      >
        <View style={styles.header}>
          <View>
            <Text style={[styles.cityName, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
              {cityName}
            </Text>
            <Text style={[styles.date, { color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)' }]}>
              {formattedDate}
            </Text>
          </View>
        </View>
        
        <Animated.View style={[styles.mainInfo, {
          transform: [{
            scale: interpolate(
              expandAnim.value,
              [0, 1],
              [1, 0.95],
              Extrapolate.CLAMP
            )
          }]
        }]}>
          <WeatherIcon iconCode={weatherIcon} size="large" showBackground />
          
          <View style={styles.tempContainer}>
            <Text style={[styles.temp, { 
              color: isDark ? Colors.dark.text : Colors.light.text,
              textShadowColor: 'rgba(0,0,0,0.1)',
              textShadowOffset: { width: 0, height: 2 },
              textShadowRadius: 4
            }]}>
              {temp}°
            </Text>
            <Text style={[styles.description, { 
              color: isDark ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.8)'
            }]}>
              {description}
            </Text>
          </View>
        </Animated.View>
        
        <View style={styles.minMaxContainer}>
          <View style={styles.minMaxItem}>
            <Ionicons 
              name="thermometer-outline" 
              size={16} 
              color={isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)'} 
            />
            <Text style={[styles.minMaxText, { color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)' }]}>
              Mín: {tempMin}° • Máx: {tempMax}°
            </Text>
          </View>
        </View>

        <Animated.View style={[styles.detailsContainer, detailsStyle]}>
          <View style={styles.detailGrid}>
            <View style={styles.detailCard}>
              <Ionicons 
                name="water-outline" 
                size={24} 
                color={isDark ? Colors.dark.text : Colors.light.text} 
              />
              <Text style={[styles.detailValue, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
                {humidity}%
              </Text>
              <Text style={[styles.detailLabel, { color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)' }]}>
                Humedad
              </Text>
            </View>

            <View style={styles.detailCard}>
              <Ionicons 
                name="speedometer-outline" 
                size={24} 
                color={isDark ? Colors.dark.text : Colors.light.text} 
              />
              <Text style={[styles.detailValue, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
                {windSpeed}
              </Text>
              <Text style={[styles.detailLabel, { color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)' }]}>
                km/h
              </Text>
            </View>

            <View style={styles.detailCard}>
              <Ionicons 
                name="sunny-outline" 
                size={24} 
                color={isDark ? Colors.dark.text : Colors.light.text} 
              />
              <Text style={[styles.detailValue, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
                {formattedSunrise}
              </Text>
              <Text style={[styles.detailLabel, { color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)' }]}>
                Amanecer
              </Text>
            </View>

            <View style={styles.detailCard}>
              <Ionicons 
                name="moon-outline" 
                size={24} 
                color={isDark ? Colors.dark.text : Colors.light.text} 
              />
              <Text style={[styles.detailValue, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
                {formattedSunset}
              </Text>
              <Text style={[styles.detailLabel, { color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)' }]}>
                Atardecer
              </Text>
            </View>
          </View>
        </Animated.View>

        <TouchableOpacity 
          style={[
            styles.moreInfoButton,
            { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }
          ]}
          onPress={handleToggleDetails}
        >
          <Text style={[styles.moreInfoText, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
            {showDetails ? 'Menos información' : 'Más información'}
          </Text>
          <Animated.View style={{
            transform: [{
              rotate: `${interpolate(
                expandAnim.value,
                [0, 1],
                [0, 180],
                Extrapolate.CLAMP
              )}deg`
            }]
          }}>
            <Ionicons 
              name="chevron-down" 
              size={20} 
              color={isDark ? Colors.dark.text : Colors.light.text} 
            />
          </Animated.View>
        </TouchableOpacity>
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    marginTop: 8, // Reducido de 16
    paddingHorizontal: 16,
  },
  contentContainer: {
    width: '100%',
    borderRadius: 24,
    padding: 16, // Reducido de 20
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12, // Reducido de 20
  },
  cityName: {
    fontSize: 24, // Reducido de 28
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  date: {
    fontSize: 15, // Reducido de 16
    marginTop: 2, // Reducido de 4
  },
  mainInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12, // Reducido de 20
  },
  tempContainer: {
    marginLeft: 16, // Reducido de 20
    alignItems: 'center',
  },
  temp: {
    fontSize: 56, // Reducido de 64
    fontWeight: '700',
    letterSpacing: -2,
  },
  description: {
    fontSize: 17, // Reducido de 18
    textTransform: 'capitalize',
    marginTop: 2, // Reducido de 4
  },
  minMaxContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 12, // Reducido de 20
    paddingHorizontal: 16,
  },
  minMaxItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  minMaxText: {
    fontSize: 14, // Reducido de 15
    marginLeft: 6,
  },
  detailsContainer: {
    width: '100%',
    marginTop: 8, // Reducido de 10
  },
  detailGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 8, // Reducido de 12
  },
  detailCard: {
    width: '48%',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: 12, // Reducido de 16
    alignItems: 'center',
    marginBottom: 8, // Reducido de 12
  },
  detailValue: {
    fontSize: 18, // Reducido de 20
    fontWeight: '600',
    marginTop: 6, // Reducido de 8
  },
  detailLabel: {
    fontSize: 13, // Reducido de 14
    marginTop: 2, // Reducido de 4
  },
  moreInfoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12, // Reducido de 16
    paddingVertical: 10, // Reducido de 12
    borderRadius: 12,
  },
  moreInfoText: {
    fontSize: 14, // Reducido de 15
    fontWeight: '500',
    marginRight: 6,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '500',
    marginVertical: 20,
    textAlign: 'center',
  },
});