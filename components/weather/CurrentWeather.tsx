import React from 'react';
import { StyleSheet, Text, View, Dimensions } from 'react-native';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

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
        intensity={80} 
        style={styles.contentContainer}
      >
        <View style={styles.header}>
          <Text style={[styles.cityName, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
            {cityName}
          </Text>
          <Text style={[styles.date, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
            {formattedDate}
          </Text>
        </View>
        
        <View style={styles.mainInfo}>
          <WeatherIcon iconCode={weatherIcon} size="large" showBackground />
          
          <View style={styles.tempContainer}>
            <Text style={[styles.temp, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
              {temp}°
            </Text>
            <Text style={[styles.description, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
              {description.charAt(0).toUpperCase() + description.slice(1)}
            </Text>
            <Text style={[styles.feelsLike, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
              Sensación térmica: {feelsLike}°
            </Text>
          </View>
        </View>
        
        <View style={styles.minMaxContainer}>
          <Text style={[styles.minMax, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
            Mín: {tempMin}° / Máx: {tempMax}°
          </Text>
        </View>
        
        <View style={styles.detailsContainer}>
          <View style={styles.detailItem}>
            <Ionicons name="water-outline" size={22} color={isDark ? Colors.dark.text : Colors.light.text} />
            <Text style={[styles.detailText, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
              {humidity}%
            </Text>
            <Text style={[styles.detailLabel, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
              Humedad
            </Text>
          </View>
          
          <View style={styles.detailItem}>
            <Ionicons name="speedometer-outline" size={22} color={isDark ? Colors.dark.text : Colors.light.text} />
            <Text style={[styles.detailText, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
              {windSpeed} km/h
            </Text>
            <Text style={[styles.detailLabel, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
              Viento
            </Text>
          </View>
          
          <View style={styles.detailItem}>
            <Ionicons name="sunny-outline" size={22} color={isDark ? Colors.dark.text : Colors.light.text} />
            <Text style={[styles.detailText, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
              {formattedSunrise}
            </Text>
            <Text style={[styles.detailLabel, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
              Amanecer
            </Text>
          </View>
          
          <View style={styles.detailItem}>
            <Ionicons name="moon-outline" size={22} color={isDark ? Colors.dark.text : Colors.light.text} />
            <Text style={[styles.detailText, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
              {formattedSunset}
            </Text>
            <Text style={[styles.detailLabel, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
              Atardecer
            </Text>
          </View>
        </View>
      </BlurView>
    </View>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    marginTop: 20,
    paddingHorizontal: 16,
  },
  contentContainer: {
    width: '100%',
    borderRadius: 24,
    padding: 20,
    overflow: 'hidden',
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  cityName: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  date: {
    fontSize: 16,
    fontWeight: '500',
    opacity: 0.8,
  },
  mainInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  tempContainer: {
    alignItems: 'flex-end',
  },
  temp: {
    fontSize: 64,
    fontWeight: '300',
  },
  description: {
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 4,
  },
  feelsLike: {
    fontSize: 14,
    fontWeight: '400',
    opacity: 0.7,
  },
  minMaxContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  minMax: {
    fontSize: 16,
    fontWeight: '500',
  },
  detailsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  detailItem: {
    alignItems: 'center',
    width: (width - 80) / 4,
  },
  detailText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 4,
  },
  detailLabel: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 2,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '500',
  },
}); 