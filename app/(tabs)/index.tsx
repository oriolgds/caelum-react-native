import React from 'react';
import { StyleSheet, View, ScrollView, RefreshControl, Text, Image, StatusBar, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

import { useLocation } from '../../hooks/useLocation';
import { useWeather } from '../../hooks/useWeather';
import { SearchBar } from '../../components/weather/SearchBar';
import { CurrentWeather } from '../../components/weather/CurrentWeather';
import { HourlyForecast } from '../../components/weather/HourlyForecast';
import { DailyForecast } from '../../components/weather/DailyForecast';
import { weatherConditions } from '../../constants/Weather';
import { useColorScheme } from '../../hooks/useColorScheme';
import { Colors } from '../../constants/Colors';

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const location = useLocation();
  const { 
    current, 
    forecast, 
    isLoading, 
    error, 
    searchByCity, 
    refreshWeather 
  } = useWeather(location.latitude, location.longitude);

  // Determinar el color de fondo basado en el clima actual
  const getBackgroundColors = () => {
    if (!current || !current.weather[0]) {
      return isDark 
        ? ['#1c1c1e', '#2c2c2e'] 
        : ['#f2f2f7', '#e5e5ea'];
    }

    const weatherIcon = current.weather[0].icon;
    const weatherInfo = weatherConditions[weatherIcon];
    
    if (!weatherInfo) {
      return isDark 
        ? ['#1c1c1e', '#2c2c2e'] 
        : ['#f2f2f7', '#e5e5ea'];
    }

    // Extraer color de fondo del tiempo actual y generar un gradiente
    const baseColor = weatherInfo.bgColor;
    
    if (weatherIcon.includes('n')) {
      // Colores nocturnos
      return ['#191970', '#000033'];
    } else {
      // Colores diurnos basados en el clima
      switch (weatherIcon.substring(0, 2)) {
        case '01': // Despejado
          return ['#87CEEB', '#1E90FF'];
        case '02': // Parcialmente nublado
        case '03': // Nublado
          return ['#87CEEB', '#778899'];
        case '04': // Muy nublado
          return ['#778899', '#708090'];
        case '09': // Lluvia ligera
        case '10': // Lluvia
          return ['#4682B4', '#483D8B'];
        case '11': // Tormenta
          return ['#2F4F4F', '#191970'];
        case '13': // Nieve
          return ['#B0C4DE', '#4682B4'];
        case '50': // Niebla
          return ['#A9A9A9', '#778899'];
        default:
          return isDark 
            ? ['#1c1c1e', '#2c2c2e'] 
            : ['#f2f2f7', '#e5e5ea'];
      }
    }
  };

  const backgroundColors = getBackgroundColors();

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
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Caelum</Text>
          </View>
          
          <SearchBar onSearch={searchByCity} isLoading={isLoading} />

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={isLoading}
                onRefresh={refreshWeather}
                tintColor="#fff"
              />
            }
          >
            {error ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : (
              <>
                <CurrentWeather weatherData={current} isLoading={isLoading} />
                <HourlyForecast forecastData={forecast} isLoading={isLoading} />
                <DailyForecast forecastData={forecast} isLoading={isLoading} />
              </>
            )}
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    </>
  );
}

const { height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: 'white',
    letterSpacing: 1,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 30,
  },
  errorContainer: {
    flex: 1,
    height: height * 0.5,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: 'white',
    fontSize: 18,
    textAlign: 'center',
    fontWeight: '500',
  },
});
