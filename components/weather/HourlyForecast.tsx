import React, { useRef, useState } from 'react';
import { StyleSheet, Text, View, FlatList, ScrollView, TouchableOpacity } from 'react-native';
import { format, addHours } from 'date-fns';
import { es } from 'date-fns/locale';
import { BlurView } from 'expo-blur';
import Svg, { Path } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';

import { ForecastData } from '../../types/weather';
import { WeatherIcon } from './WeatherIcon';
import { Colors } from '../../constants/Colors';
import { useColorScheme } from '../../hooks/useColorScheme';

interface HourlyForecastProps {
  forecastData: ForecastData;
  isLoading?: boolean;
}

export const HourlyForecast: React.FC<HourlyForecastProps> = ({
  forecastData,
  isLoading = false,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const scrollViewRef = useRef<ScrollView>(null);
  const flatListRef = useRef<FlatList>(null);
  const [showDetails, setShowDetails] = useState(false);

  if (isLoading || !forecastData) {
    return (
      <View style={styles.container}>
        <BlurView
          tint={isDark ? 'dark' : 'light'}
          intensity={80}
          style={styles.contentContainer}
        >
          <Text style={[styles.title, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
            Por horas
          </Text>
          <Text style={[styles.loadingText, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
            Cargando...
          </Text>
        </BlurView>
      </View>
    );
  }

  const createHourlyData = () => {
    const originalData = forecastData.list.slice(0, 8);
    const hourlyDataArray = [];
    
    const now = new Date();
    
    for (let i = 0; i < 24; i++) {
      const targetHour = addHours(now, i);
      const closestForecast = findClosestForecast(originalData, targetHour);
      
      hourlyDataArray.push({
        dt: targetHour.getTime() / 1000,
        main: {
          temp: closestForecast.main.temp,
          feels_like: closestForecast.main.feels_like,
          temp_min: closestForecast.main.temp_min,
          temp_max: closestForecast.main.temp_max,
          pressure: closestForecast.main.pressure,
          sea_level: closestForecast.main.sea_level,
          grnd_level: closestForecast.main.grnd_level,
          humidity: closestForecast.main.humidity,
          temp_kf: closestForecast.main.temp_kf
        },
        weather: closestForecast.weather,
        dt_txt: format(targetHour, 'yyyy-MM-dd HH:mm:ss')
      });
    }
    
    return hourlyDataArray;
  };
  
  const findClosestForecast = (forecasts: typeof forecastData.list, targetDate: Date) => {
    let closestForecast = forecasts[0];
    let minDiff = Infinity;
    
    for (const forecast of forecasts) {
      const forecastDate = new Date(forecast.dt * 1000);
      const diff = Math.abs(forecastDate.getTime() - targetDate.getTime());
      
      if (diff < minDiff) {
        minDiff = diff;
        closestForecast = forecast;
      }
    }
    
    return closestForecast;
  };

  const hourlyData = createHourlyData();
  const temperatures = hourlyData.map(item => item.main.temp);
  const minTemp = Math.min(...temperatures);
  const maxTemp = Math.max(...temperatures);
  const tempRange = maxTemp - minTemp;

  const getTemperatureHeight = (temp: number) => {
    if (tempRange === 0) return 0.5;
    return (temp - minTemp) / tempRange;
  };

  const renderHourItem = ({ item, index }: { item: any, index: number }) => {
    const date = new Date(item.dt * 1000);
    const hour = format(date, 'HH:00');
    const isNow = format(new Date(), 'HH:00') === hour;
    const temp = Math.round(item.main.temp);
    const iconCode = item.weather[0].icon;
    const pop = item.pop ? Math.round(item.pop * 100) : 0;
    const windSpeed = item.wind?.speed ? Math.round(item.wind.speed * 3.6) : 0;

    return (
      <View style={styles.hourItem}>
        <Text style={[
          styles.hourText, 
          { color: isDark ? Colors.dark.text : Colors.light.text },
          isNow && styles.currentHour
        ]}>
          {isNow ? 'Ahora' : hour}
        </Text>
        
        <WeatherIcon iconCode={iconCode} size="small" showBackground />
        
        <Text style={[
          styles.tempText, 
          { color: isDark ? Colors.dark.text : Colors.light.text },
          isNow && styles.currentHour
        ]}>
          {temp}°
        </Text>

        <View style={styles.detailsContainer}>
          {pop > 0 && (
            <View style={styles.detailItem}>
              <Ionicons 
                name="water-outline" 
                size={12} 
                color={isDark ? Colors.dark.text : Colors.light.text} 
              />
              <Text style={[
                styles.detailText, 
                { color: isDark ? Colors.dark.text : Colors.light.text }
              ]}>
                {pop}%
              </Text>
            </View>
          )}
          
          {windSpeed > 0 && (
            <View style={styles.detailItem}>
              <Ionicons 
                name="wind-outline" 
                size={12} 
                color={isDark ? Colors.dark.text : Colors.light.text} 
              />
              <Text style={[
                styles.detailText, 
                { color: isDark ? Colors.dark.text : Colors.light.text }
              ]}>
                {windSpeed}
              </Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  const createTempGraph = () => {
    if (hourlyData.length < 2) return null;
    
    const graphHeight = 45;
    const cardWidth = 70;
    const cardMargin = 16;
    const totalCardWidth = cardWidth + cardMargin;
    const totalWidth = (cardWidth + cardMargin) * hourlyData.length;
    
    const temperatures = hourlyData.map(item => item.main.temp);
    const minTemp = Math.min(...temperatures);
    const maxTemp = Math.max(...temperatures);
    const tempRange = maxTemp - minTemp;
    
    // Crear puntos para el gráfico
    const points = hourlyData.map((item, index) => {
      const temp = item.main.temp;
      const normalizedValue = tempRange > 0 
        ? 1 - ((temp - minTemp) / tempRange) 
        : 0.5;
      
      const x = (cardWidth / 2) + (index * totalCardWidth);
      const y = 5 + (normalizedValue * graphHeight);
      
      return { x, y };
    });
    
    // Crear el path para la línea
    const path = points.reduce((acc, point, index) => {
      if (index === 0) return `M ${point.x} ${point.y}`;
      return `${acc} L ${point.x} ${point.y}`;
    }, '');
    
    return (
      <View style={styles.graphWrapper}>
        <Svg height={graphHeight + 20} width={totalWidth}>
          <Path
            d={path}
            stroke={isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.2)"}
            strokeWidth={1.5}
            fill="transparent"
            strokeLinecap="round"
          />
        </Svg>
      </View>
    );
  };

  const handleScroll = (event: any) => {
    if (scrollViewRef.current) {
      const offsetX = event.nativeEvent.contentOffset.x;
      scrollViewRef.current.scrollTo({ x: offsetX, animated: false });
    }
  };

  return (
    <View style={styles.container}>
      <BlurView
        tint={isDark ? 'dark' : 'light'}
        intensity={80}
        style={styles.contentContainer}
      >
        <Text style={[styles.title, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
          Por horas
        </Text>
        
        <View style={styles.graphContainer}>
          <FlatList
            ref={flatListRef}
            data={hourlyData}
            renderItem={renderHourItem}
            keyExtractor={(item, index) => `hourly-${index}`}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            initialNumToRender={8}
            onScroll={handleScroll}
            scrollEventThrottle={16}
          />
          
          <ScrollView 
            ref={scrollViewRef}
            horizontal 
            showsHorizontalScrollIndicator={false}
            scrollEnabled={false}
            style={styles.graphScrollContainer}
            contentContainerStyle={styles.graphContentContainer}
          >
            {createTempGraph()}
          </ScrollView>
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
  },
  contentContainer: {
    width: '100%',
    borderRadius: 24,
    padding: 16,
    paddingBottom: 20,
    overflow: 'hidden',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    marginLeft: 4,
  },
  graphContainer: {
    position: 'relative',
    width: '100%',
  },
  graphWrapper: {
    paddingHorizontal: 0,
  },
  graphScrollContainer: {
    position: 'absolute',
    top: 75,
    left: 0,
    right: 0,
    zIndex: 1,
    height: 65,
  },
  graphContentContainer: {
    height: 65,
  },
  listContent: {
    paddingRight: 0,
    paddingLeft: 0,
  },
  hourItem: {
    alignItems: 'center',
    marginRight: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minWidth: 70,
    zIndex: 2,
  },
  hourText: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 8,
  },
  currentHour: {
    fontWeight: '700',
  },
  tempText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '500',
    marginVertical: 20,
    textAlign: 'center',
  },
  detailsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
    gap: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontSize: 10,
    marginLeft: 2,
  },
}); 