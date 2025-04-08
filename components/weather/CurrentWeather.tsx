import React, { useState } from 'react';
import { StyleSheet, Text, View, Dimensions, TouchableOpacity } from 'react-native';
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
  const [showDetails, setShowDetails] = useState(false);
  
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
          <View>
            <Text style={[styles.cityName, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
              {cityName}
            </Text>
            <Text style={[styles.date, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
              {formattedDate}
            </Text>
          </View>
        </View>
        
        <View style={styles.mainInfo}>
          <WeatherIcon iconCode={weatherIcon} size="large" showBackground />
          
          <View style={styles.tempContainer}>
            <Text style={[styles.temp, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
              {temp}°
            </Text>
            <Text style={[styles.description, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
              {description}
            </Text>
          </View>
        </View>
        
        <View style={styles.detailsContainer}>
          <View style={styles.detailRow}>
            <View style={styles.detailItem}>
              <Ionicons 
                name="thermometer-outline" 
                size={20} 
                color={isDark ? Colors.dark.text : Colors.light.text} 
              />
              <Text style={[styles.detailText, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
                Sensación: {feelsLike}°
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons 
                name="water-outline" 
                size={20} 
                color={isDark ? Colors.dark.text : Colors.light.text} 
              />
              <Text style={[styles.detailText, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
                Humedad: {humidity}%
              </Text>
            </View>
          </View>
          
          <View style={styles.detailRow}>
            <View style={styles.detailItem}>
              <Ionicons 
                name="wind-outline" 
                size={20} 
                color={isDark ? Colors.dark.text : Colors.light.text} 
              />
              <Text style={[styles.detailText, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
                Viento: {windSpeed} km/h
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons 
                name="sunny-outline" 
                size={20} 
                color={isDark ? Colors.dark.text : Colors.light.text} 
              />
              <Text style={[styles.detailText, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
                Amanecer: {formattedSunrise}
              </Text>
            </View>
          </View>

          {showDetails && (
            <>
              <View style={styles.detailRow}>
                <View style={styles.detailItem}>
                  <Ionicons 
                    name="speedometer-outline" 
                    size={20} 
                    color={isDark ? Colors.dark.text : Colors.light.text} 
                  />
                  <Text style={[styles.detailText, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
                    Presión: {weatherData.main.pressure} hPa
                  </Text>
                </View>
                <View style={styles.detailItem}>
                  <Ionicons 
                    name="eye-outline" 
                    size={20} 
                    color={isDark ? Colors.dark.text : Colors.light.text} 
                  />
                  <Text style={[styles.detailText, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
                    Visibilidad: {weatherData.visibility / 1000} km
                  </Text>
                </View>
              </View>
              
              {weatherData.wind.gust && (
                <View style={styles.detailRow}>
                  <View style={styles.detailItem}>
                    <Ionicons 
                      name="wind" 
                      size={20} 
                      color={isDark ? Colors.dark.text : Colors.light.text} 
                    />
                    <Text style={[styles.detailText, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
                      Ráfagas: {Math.round(weatherData.wind.gust * 3.6)} km/h
                    </Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Ionicons 
                      name="moon-outline" 
                      size={20} 
                      color={isDark ? Colors.dark.text : Colors.light.text} 
                    />
                    <Text style={[styles.detailText, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
                      Atardecer: {formattedSunset}
                    </Text>
                  </View>
                </View>
              )}
            </>
          )}

          <TouchableOpacity 
            style={styles.moreInfoButton}
            onPress={() => setShowDetails(!showDetails)}
          >
            <Text style={[styles.moreInfoText, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
              {showDetails ? 'Menos información' : 'Más información'}
            </Text>
            <Ionicons 
              name={showDetails ? 'chevron-up' : 'chevron-down'} 
              size={20} 
              color={isDark ? Colors.dark.text : Colors.light.text} 
            />
          </TouchableOpacity>
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
    marginTop: 16,
    paddingHorizontal: 16,
  },
  contentContainer: {
    width: '100%',
    borderRadius: 24,
    padding: 16,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cityName: {
    fontSize: 24,
    fontWeight: '700',
  },
  date: {
    fontSize: 16,
    opacity: 0.8,
  },
  mainInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  tempContainer: {
    marginLeft: 16,
    alignItems: 'center',
  },
  temp: {
    fontSize: 48,
    fontWeight: '700',
  },
  description: {
    fontSize: 18,
    textTransform: 'capitalize',
  },
  detailsContainer: {
    width: '100%',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  detailText: {
    marginLeft: 8,
    fontSize: 14,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '500',
    marginVertical: 20,
    textAlign: 'center',
  },
  moreInfoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    paddingVertical: 8,
  },
  moreInfoText: {
    fontSize: 14,
    marginRight: 4,
  },
}); 