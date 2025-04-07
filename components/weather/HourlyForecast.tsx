import React, { useRef } from 'react';
import { StyleSheet, Text, View, FlatList, Dimensions, ScrollView } from 'react-native';
import { format, addHours } from 'date-fns';
import { es } from 'date-fns/locale';
import { BlurView } from 'expo-blur';
import { LineChart } from 'react-native-chart-kit';
import Svg, { Path, Line, Circle, Text as SvgText } from 'react-native-svg';

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
  
  // Mover las referencias aquí, antes de cualquier lógica condicional
  // Referencia al ScrollView que contiene el gráfico
  const scrollViewRef = useRef<ScrollView>(null);
  // Referencia al FlatList
  const flatListRef = useRef<FlatList>(null);

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

  // Crear un array con pronóstico para las próximas 24 horas, con intervalo de 1 hora
  const createHourlyData = () => {
    // Obtener los datos por horas del pronóstico original (cada 3 horas)
    const originalData = forecastData.list.slice(0, 8);
    const hourlyDataArray = [];
    
    const now = new Date();
    
    // Crear 24 entradas para las próximas 24 horas
    for (let i = 0; i < 24; i++) {
      const targetHour = addHours(now, i);
      // Encontrar el pronóstico de 3 horas más cercano
      const closestForecast = findClosestForecast(originalData, targetHour);
      
      // Crear entrada para esta hora específica
      hourlyDataArray.push({
        dt: targetHour.getTime() / 1000, // Convertir a timestamp unix
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
  
  // Función para encontrar el pronóstico más cercano a una hora determinada
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

  // Generar los datos por hora
  const hourlyData = createHourlyData();

  // Preparar datos para el gráfico
  const temperatureData = hourlyData.slice(0, 8).map(item => Math.round(item.main.temp));
  const hours = hourlyData.slice(0, 8).map(item => format(new Date(item.dt * 1000), 'HH:00'));
  
  // Encontrar min y max temperatura para escalar el gráfico
  const minTemp = Math.min(...temperatureData);
  const maxTemp = Math.max(...temperatureData);
  const tempRange = maxTemp - minTemp;

  const renderHourItem = ({ item, index }: { item: any, index: number }) => {
    const date = new Date(item.dt * 1000);
    const hour = format(date, 'HH:00');
    const isNow = format(new Date(), 'HH:00') === hour;
    const temp = Math.round(item.main.temp);
    const iconCode = item.weather[0].icon;

    return (
      <View style={[
        styles.hourItem,
        isNow && { 
          backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
          borderRadius: 12 
        }
      ]}>
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
      </View>
    );
  };
  
  // Para el gráfico personalizado
  const createTempGraph = () => {
    const visibleData = temperatureData.slice(0, 8);
    if (visibleData.length < 2) return null;
    
    // Calcular altura del gráfico y posición de los puntos
    const graphHeight = 45; // Ajustar para mayor compacidad
    const cardWidth = 70; // Ancho aproximado de cada tarjeta de hora
    const cardMargin = 16; // Margen entre tarjetas
    const totalCardWidth = cardWidth + cardMargin;
    
    // Espacio total necesario para el gráfico (igual que el contenedor de la lista)
    const totalWidth = (cardWidth + cardMargin) * visibleData.length + 16;
    
    // Ajustar el rango para temperaturas bajas
    // Garantizar un rango mínimo para que se visualice correctamente
    let adjustedMinTemp = minTemp;
    let adjustedMaxTemp = maxTemp;
    
    // Si el rango es muy pequeño o nulo, crear un rango artificial
    if (maxTemp - minTemp < 4) {
      adjustedMinTemp = minTemp - 2;
      adjustedMaxTemp = maxTemp + 2;
    }
    
    const adjustedRange = adjustedMaxTemp - adjustedMinTemp;
    
    // Crear puntos normalizados para el path
    let points = [];
    
    for (let i = 0; i < visibleData.length; i++) {
      // Normalizar temperatura entre 0-1 (invertido para que mayor temperatura = más arriba)
      // Usar el rango ajustado para mejor visualización
      const normalizedValue = adjustedRange > 0 
        ? 1 - ((visibleData[i] - adjustedMinTemp) / adjustedRange) 
        : 0.5;
      
      // Limitar el valor normalizado entre 0.1 y 0.9 para que siempre se vea dentro del gráfico
      const constrainedValue = Math.min(0.9, Math.max(0.1, normalizedValue));
      
      // Posicionar en el centro de cada tarjeta
      const x = (cardWidth / 2) + (i * totalCardWidth);
      // Usar valor restringido para calcular la posición Y
      const y = 5 + (constrainedValue * graphHeight);
      
      points.push({ x, y, temp: visibleData[i] });
    }
    
    // Crear path para la línea
    let path = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      path += ` L ${points[i].x} ${points[i].y}`;
    }
    
    return (
      <View style={{ paddingLeft: 12, paddingRight: 4 }}>
        <Svg height={graphHeight + 20} width={totalWidth}>
          {/* Líneas de referencia horizontales (muy sutiles) */}
          <Line
            x1="0"
            y1={5}
            x2={totalWidth}
            y2={5}
            stroke={isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)"}
            strokeWidth={1}
            strokeDasharray="3,3"
          />
          <Line
            x1="0"
            y1={5 + graphHeight / 2}
            x2={totalWidth}
            y2={5 + graphHeight / 2}
            stroke={isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)"}
            strokeWidth={1}
            strokeDasharray="3,3"
          />
          <Line
            x1="0"
            y1={5 + graphHeight}
            x2={totalWidth}
            y2={5 + graphHeight}
            stroke={isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)"}
            strokeWidth={1}
            strokeDasharray="3,3"
          />
          
          {/* Área bajo la curva con gradiente sutil */}
          <Path
            d={`${path} L ${points[points.length-1].x} ${5 + graphHeight} L ${points[0].x} ${5 + graphHeight} Z`}
            fill={isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.02)"}
          />
          
          {/* Línea de tendencia */}
          <Path
            d={path}
            stroke={isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.2)"}
            strokeWidth={1.5}
            fill="transparent"
          />
          
          {/* Puntos y líneas verticales para cada temperatura */}
          {points.map((point, index) => (
            <React.Fragment key={`point-${index}`}>
              {/* Línea vertical hasta el eje x (muy sutil) */}
              <Line
                x1={point.x}
                y1={point.y}
                x2={point.x}
                y2={5 + graphHeight}
                stroke={isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.03)"}
                strokeWidth={1}
                strokeDasharray="2,2"
              />
              
              {/* Punto para cada temperatura */}
              <Circle
                cx={point.x}
                cy={point.y}
                r={9}
                fill={isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)"}
              />
              <Circle
                cx={point.x}
                cy={point.y}
                r={3}
                fill={isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.2)"}
              />
              
              {/* Temperatura dentro del punto */}
              <SvgText
                x={point.x}
                y={point.y + 3}
                fontSize="9"
                fontWeight="500"
                textAnchor="middle"
                fill={isDark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.6)"}
              >
                {point.temp}°
              </SvgText>
            </React.Fragment>
          ))}
        </Svg>
      </View>
    );
  };

  // Manejador de desplazamiento para sincronizar el ScrollView con el FlatList
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
          
          {/* ScrollView para el gráfico que se desplaza junto con el FlatList */}
          <ScrollView 
            ref={scrollViewRef}
            horizontal 
            showsHorizontalScrollIndicator={false}
            scrollEnabled={false}
            style={styles.graphScrollContainer}
            contentContainerStyle={{ height: 65 }}
          >
            {createTempGraph()}
          </ScrollView>
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
  graphScrollContainer: {
    position: 'absolute',
    top: 75, // Ajustar aún más arriba
    left: 0,
    right: 0,
    zIndex: 1,
    height: 65, // Altura ligeramente menor para ajustar al gráfico más compacto
  },
  listContent: {
    paddingRight: 8,
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
}); 