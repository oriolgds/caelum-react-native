import React from 'react';
import { StyleSheet, Text, View, FlatList } from 'react-native';
import { format, isToday } from 'date-fns';
import { es } from 'date-fns/locale';
import { BlurView } from 'expo-blur';

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
      
      if (!dailyMap.has(day)) {
        dailyMap.set(day, {
          date,
          tempMin: item.main.temp_min,
          tempMax: item.main.temp_max,
          icon: item.weather[0].icon,
        });
      } else {
        const current = dailyMap.get(day);
        dailyMap.set(day, {
          ...current,
          tempMin: Math.min(current.tempMin, item.main.temp_min),
          tempMax: Math.max(current.tempMax, item.main.temp_max),
        });
      }
    });
    
    // Convertir el mapa a un array y limitarlo a 5 días
    return Array.from(dailyMap.values()).slice(0, 6);
  };

  const dailyData = getDailyData();

  const renderDayItem = ({ item, index }: { item: ReturnType<typeof getDailyData>[0], index: number }) => {
    const { date, tempMin, tempMax, icon } = item;
    const dayName = isToday(date) 
      ? 'Hoy' 
      : format(date, 'EEEE', { locale: es });
    
    const formattedDay = dayName.charAt(0).toUpperCase() + dayName.slice(1);
    
    return (
      <View style={styles.dayItem}>
        <Text 
          style={[
            styles.dayText, 
            { color: isDark ? Colors.dark.text : Colors.light.text },
            index === 0 && styles.todayText
          ]}
        >
          {formattedDay}
        </Text>
        
        <WeatherIcon iconCode={icon} size="small" showBackground />
        
        <View style={styles.tempRange}>
          <Text 
            style={[
              styles.maxTemp, 
              { color: isDark ? Colors.dark.text : Colors.light.text }
            ]}
          >
            {Math.round(tempMax)}°
          </Text>
          <Text 
            style={[
              styles.minTemp, 
              { color: isDark ? Colors.dark.text : Colors.light.text, opacity: 0.7 }
            ]}
          >
            {Math.round(tempMin)}°
          </Text>
        </View>
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
        
        <View style={styles.daysContainer}>
          {dailyData.map((item, index) => (
            <View key={`day-${index}`}>
              {renderDayItem({ item, index })}
              {index < dailyData.length - 1 && (
                <View 
                  style={[
                    styles.divider, 
                    { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }
                  ]} 
                />
              )}
            </View>
          ))}
        </View>
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
    marginBottom: 20,
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
    marginLeft: 4,
  },
  daysContainer: {
    width: '100%',
  },
  dayItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  dayText: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
  todayText: {
    fontWeight: '700',
  },
  tempRange: {
    flexDirection: 'row',
    width: 80,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  maxTemp: {
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  minTemp: {
    fontSize: 16,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    width: '100%',
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '500',
    marginVertical: 20,
    textAlign: 'center',
  },
}); 