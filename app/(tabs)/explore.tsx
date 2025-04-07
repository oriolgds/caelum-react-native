import React, { useContext } from 'react';
import { StyleSheet, View, Text, Dimensions, ScrollView, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';

import { useLocation } from '../../hooks/useLocation';
import { useWeather } from '../../hooks/useWeather';
import { WeatherIcon } from '../../components/weather/WeatherIcon';
import { useColorScheme } from '../../hooks/useColorScheme';
import { Colors } from '../../constants/Colors';

// Componente de información detallada
const DetailCard = ({ title, value, icon, units = '', colorScheme }) => {
  const isDark = colorScheme === 'dark';
  
  return (
    <BlurView
      tint={isDark ? 'dark' : 'light'}
      intensity={80}
      style={styles.detailCard}
    >
      <View style={styles.detailHeader}>
        <Ionicons name={icon} size={24} color={isDark ? Colors.dark.text : Colors.light.text} />
        <Text style={[styles.detailTitle, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
          {title}
        </Text>
      </View>
      <Text style={[styles.detailValue, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
        {value}{units}
      </Text>
    </BlurView>
  );
};

// Componente para mostrar la calidad del aire
const AirQuality = ({ quality = 'Buena', index = 42, colorScheme }) => {
  const isDark = colorScheme === 'dark';
  
  const getQualityColor = () => {
    if (index < 50) return '#00E400'; // Buena
    if (index < 100) return '#FFFF00'; // Moderada
    if (index < 150) return '#FF7E00'; // Insalubre para grupos sensibles
    if (index < 200) return '#FF0000'; // Insalubre
    if (index < 300) return '#8F3F97'; // Muy insalubre
    return '#7E0023'; // Peligrosa
  };
  
  return (
    <BlurView
      tint={isDark ? 'dark' : 'light'}
      intensity={80}
      style={[styles.airQualityCard, { marginTop: 16 }]}
    >
      <View style={styles.airQualityHeader}>
        <Ionicons name="leaf-outline" size={24} color={isDark ? Colors.dark.text : Colors.light.text} />
        <Text style={[styles.airQualityTitle, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
          Calidad del Aire
        </Text>
      </View>
      
      <View style={styles.airQualityContent}>
        <View style={styles.airQualityIndicator}>
          <View style={[styles.airQualityLevel, { backgroundColor: getQualityColor() }]} />
          <Text style={[styles.airQualityText, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
            {quality} ({index})
          </Text>
        </View>
        <Text style={[styles.airQualityDescription, { color: isDark ? Colors.dark.text : Colors.light.text, opacity: 0.7 }]}>
          Ideal para actividades al aire libre
        </Text>
      </View>
    </BlurView>
  );
};

// Componente de información UV
const UVIndex = ({ index = 5, colorScheme }) => {
  const isDark = colorScheme === 'dark';
  
  const getUVColor = () => {
    if (index < 3) return '#00E400'; // Bajo
    if (index < 6) return '#FFFF00'; // Moderado
    if (index < 8) return '#FF7E00'; // Alto
    if (index < 11) return '#FF0000'; // Muy alto
    return '#8F3F97'; // Extremo
  };
  
  const getUVLevel = () => {
    if (index < 3) return 'Bajo';
    if (index < 6) return 'Moderado';
    if (index < 8) return 'Alto';
    if (index < 11) return 'Muy alto';
    return 'Extremo';
  };
  
  return (
    <BlurView
      tint={isDark ? 'dark' : 'light'}
      intensity={80}
      style={[styles.uvCard, { marginTop: 16 }]}
    >
      <View style={styles.uvHeader}>
        <Ionicons name="sunny-outline" size={24} color={isDark ? Colors.dark.text : Colors.light.text} />
        <Text style={[styles.uvTitle, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
          Índice UV
        </Text>
      </View>
      
      <View style={styles.uvContent}>
        <View style={styles.uvIndicator}>
          <View style={[styles.uvLevel, { backgroundColor: getUVColor() }]} />
          <Text style={[styles.uvIndexText, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
            {index} - {getUVLevel()}
          </Text>
        </View>
        <Text style={[styles.uvDescription, { color: isDark ? Colors.dark.text : Colors.light.text, opacity: 0.7 }]}>
          {index < 3 ? 'No se requiere protección' :
           index < 6 ? 'Se recomienda protección solar' :
           index < 8 ? 'Protección solar necesaria' :
           index < 11 ? 'Protección solar extra necesaria' :
           'Evitar exposición al sol'}
        </Text>
      </View>
    </BlurView>
  );
};

export default function ExploreScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const location = useLocation();
  const { current, forecast, isLoading, error } = useWeather(location.latitude, location.longitude);

  // Determinar el color de fondo basado en el clima actual
  const getBackgroundColors = () => {
    if (!current || !current.weather[0]) {
      return isDark 
        ? ['#1c1c1e', '#2c2c2e'] 
        : ['#f2f2f7', '#e5e5ea'];
    }

    const weatherIcon = current.weather[0].icon;
    
    if (weatherIcon.includes('n')) {
      // Colores nocturnos
      return ['#191970', '#000033'];
    } else if (weatherIcon.includes('01')) {
      // Día soleado
      return ['#1E90FF', '#00BFFF'];
    } else {
      // Otros climas durante el día
      return ['#4682B4', '#5F9EA0'];
    }
  };

  const backgroundColors = getBackgroundColors();

  if (isLoading || !current) {
    return (
      <LinearGradient
        colors={backgroundColors}
        style={styles.container}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      >
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Cargando información...</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  // Extraer datos del clima para mostrar
  const humidity = current.main.humidity;
  const windSpeed = Math.round(current.wind.speed * 3.6); // m/s a km/h
  const pressure = current.main.pressure;
  const visibility = current.visibility / 1000; // metros a km
  const cloudiness = current.clouds.all;
  const feelsLike = Math.round(current.main.feels_like);
  
  return (
    <>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={backgroundColors}
        style={styles.container}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      >
        <SafeAreaView style={styles.safeArea}>
          <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Caelum</Text>
            </View>
            
            <View style={styles.detailsGrid}>
              <DetailCard
                title="Humedad"
                value={humidity}
                units="%"
                icon="water-outline"
                colorScheme={colorScheme}
              />
              <DetailCard
                title="Viento"
                value={windSpeed}
                units=" km/h"
                icon="speedometer-outline"
                colorScheme={colorScheme}
              />
              <DetailCard
                title="Presión"
                value={pressure}
                units=" hPa"
                icon="thermometer-outline"
                colorScheme={colorScheme}
              />
              <DetailCard
                title="Visibilidad"
                value={visibility}
                units=" km"
                icon="eye-outline"
                colorScheme={colorScheme}
              />
              <DetailCard
                title="Nubosidad"
                value={cloudiness}
                units="%"
                icon="cloud-outline"
                colorScheme={colorScheme}
              />
              <DetailCard
                title="Sensación"
                value={feelsLike}
                units="°"
                icon="body-outline"
                colorScheme={colorScheme}
              />
            </View>
            
            <AirQuality colorScheme={colorScheme} />
            <UVIndex colorScheme={colorScheme} />
            
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    </>
  );
}

const { width } = Dimensions.get('window');
const cardWidth = (width - 48) / 2;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 30,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 10,
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: 'white',
    letterSpacing: 1,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  detailCard: {
    width: cardWidth,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    overflow: 'hidden',
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  detailValue: {
    fontSize: 24,
    fontWeight: '700',
  },
  airQualityCard: {
    width: '100%',
    borderRadius: 16,
    padding: 16,
    overflow: 'hidden',
  },
  airQualityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  airQualityTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  airQualityContent: {
    paddingHorizontal: 8,
  },
  airQualityIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  airQualityLevel: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 8,
  },
  airQualityText: {
    fontSize: 18,
    fontWeight: '600',
  },
  airQualityDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  uvCard: {
    width: '100%',
    borderRadius: 16,
    padding: 16,
    overflow: 'hidden',
    marginBottom: 16,
  },
  uvHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  uvTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  uvContent: {
    paddingHorizontal: 8,
  },
  uvIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  uvLevel: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 8,
  },
  uvIndexText: {
    fontSize: 18,
    fontWeight: '600',
  },
  uvDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '500',
    color: 'white',
  },
});
