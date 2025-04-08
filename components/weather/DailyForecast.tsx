import React, { useState } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity } from 'react-native';
import { format, isToday } from 'date-fns';
import { es } from 'date-fns/locale';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';

import { ForecastData } from '../../types/weather';
import { WeatherIcon } from './WeatherIcon';
import { Colors } from '../../constants/Colors';
import { useColorScheme } from '../../hooks/useColorScheme';

interface DailyForecastProps {
  forecastData: ForecastData;
  isLoading?: boolean;
}

export const DailyForecast: React.FC<DailyForecastProps> = ({
  forecastData,
  isLoading = false,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [expandedDay, setExpandedDay] = useState<string | null>(null);

  if (isLoading || !forecastData) {
    return (
      <View style={styles.container}>
        <BlurView
          tint={isDark ? 'dark' : 'light'}
          intensity={80}
          style={styles.contentContainer}
        >
          <Text style={[styles.title, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
            Próximos días
          </Text>
          <Text style={[styles.loadingText, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
            Cargando...
          </Text>
        </BlurView>
      </View>
    );
  }

  // Agrupar pronóstico por día
  const getDailyData = () => {
    const dailyMap = new Map();
    
    forecastData.list.forEach(item => {
      const date = new Date(item.dt * 1000);
      const day = format(date, 'yyyy-MM-dd');
      
      // Extraer temperaturas según la estructura de datos
      const tempMin = item.main?.temp_min || item.temp?.min || item.main?.temp;
      const tempMax = item.main?.temp_max || item.temp?.max || item.main?.temp;
      
      // Extraer otros datos con valores por defecto
      const pop = item.pop || 0;
      const windSpeed = item.wind?.speed || item.wind_speed || 0;
      const humidity = item.main?.humidity || item.humidity || 0;
      const pressure = item.main?.pressure || item.pressure || 0;
      const visibility = item.visibility || 10000;
      
      // Obtener el icono y la descripción
      const weatherIcon = item.weather?.[0]?.icon || '01d';
      const weatherDescription = item.weather?.[0]?.description || '';
      
      // Determinar si es de día o de noche basado en la hora
      const hour = date.getHours();
      const isDaytime = hour >= 6 && hour < 18;
      
      if (!dailyMap.has(day)) {
        dailyMap.set(day, {
          date,
          tempMin,
          tempMax,
          icon: weatherIcon,
          description: weatherDescription,
          pop,
          windSpeed,
          humidity,
          pressure,
          visibility,
          isDaytime,
          weatherCount: 1
        });
      } else {
        const current = dailyMap.get(day);
        
        // Actualizar el icono solo si es de día o si es el primer registro de la noche
        const shouldUpdateIcon = isDaytime || (!current.isDaytime && current.weatherCount === 1);
        
        dailyMap.set(day, {
          ...current,
          tempMin: Math.min(current.tempMin, tempMin),
          tempMax: Math.max(current.tempMax, tempMax),
          pop: Math.max(current.pop, pop),
          windSpeed: Math.max(current.windSpeed, windSpeed),
          humidity: Math.max(current.humidity, humidity),
          pressure: pressure,
          visibility: visibility,
          icon: shouldUpdateIcon ? weatherIcon : current.icon,
          description: shouldUpdateIcon ? weatherDescription : current.description,
          isDaytime: current.isDaytime || isDaytime,
          weatherCount: current.weatherCount + 1
        });
      }
    });
    
    // Convertir el mapa a un array y limitarlo a 5 días
    return Array.from(dailyMap.values()).slice(0, 6);
  };

  const dailyData = getDailyData();

  const renderDayItem = ({ item, index }: { item: any, index: number }) => {
    const dayName = isToday(item.date) 
      ? 'Hoy' 
      : format(item.date, 'EEEE', { locale: es });
    const formattedDay = format(item.date, 'd MMM', { locale: es });
    const pop = Math.round(item.pop * 100);
    const windSpeed = Math.round(item.windSpeed * 3.6);
    const dayKey = format(item.date, 'yyyy-MM-dd');
    const isExpanded = expandedDay === dayKey;
    
    return (
      <View>
        <TouchableOpacity 
          style={[
            styles.dayItem,
            isExpanded && styles.expandedDayItem
          ]}
          onPress={() => setExpandedDay(isExpanded ? null : dayKey)}
          activeOpacity={0.7}
        >
          <View style={styles.dayContent}>
            <View style={styles.dayInfo}>
              <Text style={[styles.dayName, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
                {dayName}
              </Text>
              <Text style={[styles.date, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
          {formattedDay}
        </Text>
            </View>

            <View style={styles.weatherInfo}>
              <WeatherIcon iconCode={item.icon} size="small" showBackground />
              <View style={styles.tempContainer}>
                <Text style={[styles.tempMin, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
                  {Math.round(item.tempMin)}°
                </Text>
                <Text style={[styles.tempMax, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
                  {Math.round(item.tempMax)}°
                </Text>
              </View>
              <Ionicons 
                name={isExpanded ? 'chevron-up' : 'chevron-down'} 
                size={16} 
                color={isDark ? Colors.dark.text : Colors.light.text} 
              />
            </View>
          </View>
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.detailsContainer}>
            <View style={styles.detailRow}>
              <View style={styles.detailItem}>
                <Ionicons 
                  name="water-outline" 
                  size={14} 
                  color={isDark ? Colors.dark.text : Colors.light.text} 
                />
                <Text style={[styles.detailText, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
                  {pop}% lluvia
                </Text>
              </View>
              <View style={styles.detailItem}>
                <Ionicons 
                  name="wind-outline" 
                  size={14} 
                  color={isDark ? Colors.dark.text : Colors.light.text} 
                />
                <Text style={[styles.detailText, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
                  {windSpeed} km/h
                </Text>
              </View>
              <View style={styles.detailItem}>
                <Ionicons 
                  name="water" 
                  size={14} 
                  color={isDark ? Colors.dark.text : Colors.light.text} 
                />
                <Text style={[styles.detailText, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
                  {item.humidity}%
                </Text>
              </View>
            </View>

            <View style={styles.detailRow}>
              <View style={styles.detailItem}>
                <Ionicons 
                  name="speedometer-outline" 
                  size={14} 
                  color={isDark ? Colors.dark.text : Colors.light.text} 
                />
                <Text style={[styles.detailText, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
                  {item.pressure} hPa
                </Text>
              </View>
              <View style={styles.detailItem}>
                <Ionicons 
                  name="eye-outline" 
                  size={14} 
                  color={isDark ? Colors.dark.text : Colors.light.text} 
                />
                <Text style={[styles.detailText, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
                  {item.visibility / 1000} km
          </Text>
              </View>
            </View>

            <Text style={[styles.description, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
              {item.description}
          </Text>
        </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <BlurView
        tint={isDark ? 'dark' : 'light'}
        intensity={80}
        style={styles.contentContainer}
      >
        <Text style={[styles.title, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
          Próximos días
        </Text>
        
        <FlatList
          data={dailyData}
          renderItem={renderDayItem}
          keyExtractor={(item, index) => `day-${index}`}
          scrollEnabled={false}
        />
      </BlurView>
    </View>
  );
};

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
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  dayItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  expandedDayItem: {
    borderBottomWidth: 0,
  },
  dayContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dayInfo: {
    flex: 1,
  },
  dayName: {
    fontSize: 15,
    fontWeight: '500',
  },
  date: {
    fontSize: 13,
    opacity: 0.7,
  },
  weatherInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  tempContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    minWidth: 50,
  },
  tempMax: {
    fontSize: 15,
    fontWeight: '600',
  },
  tempMin: {
    fontSize: 14,
    opacity: 0.7,
  },
  detailsContainer: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 8,
    marginTop: 4,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontSize: 12,
  },
  description: {
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 8,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '500',
    marginVertical: 20,
    textAlign: 'center',
  },
}); 