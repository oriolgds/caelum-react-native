import React, { useRef } from 'react';
import { StyleSheet, View, ScrollView, RefreshControl, Text, StatusBar, Dimensions, Animated, Platform } from 'react-native';
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

  // Solo mantenemos el scrollY para las animaciones de la barra de búsqueda
  const scrollY = useRef(new Animated.Value(0)).current;

  // Valores para controlar la animación de la barra de búsqueda
  const searchBarHeight = 70;
  const lastScrollY = useRef(0);
  const scrollDirection = useRef(new Animated.Value(0)).current;
  const isScrollingDown = useRef(false);
  const searchBarTranslateY = useRef(new Animated.Value(0)).current;
  const velocityThreshold = 0.5;
  const distanceThreshold = 10;

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    { 
      useNativeDriver: true,
      listener: (event: any) => {
        const currentScrollY = event.nativeEvent.contentOffset.y;
        const velocity = (currentScrollY - lastScrollY.current) / 16; // 16ms es aproximadamente un frame
        const distance = Math.abs(currentScrollY - lastScrollY.current);
        
        if (distance > distanceThreshold) {
          const isMovingDown = currentScrollY > lastScrollY.current;
          
          // Solo cambiamos la dirección si la velocidad supera el umbral
          if (Math.abs(velocity) > velocityThreshold && isMovingDown !== isScrollingDown.current) {
            isScrollingDown.current = isMovingDown;
            
            // Animar la barra de búsqueda
            Animated.spring(searchBarTranslateY, {
              toValue: isMovingDown ? -searchBarHeight - 20 : 0,
              useNativeDriver: true,
              damping: 20,
              mass: 0.8,
              stiffness: 120,
              overshootClamping: true
            }).start();
          }
        }
        
        lastScrollY.current = currentScrollY;
      }
    }
  );

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
          <Animated.View style={[
            styles.searchBarContainer,
            {
              transform: [{ translateY: searchBarTranslateY }],
              opacity: scrollY.interpolate({
                inputRange: [0, 50],
                outputRange: [1, 0.95],
                extrapolate: 'clamp'
              })
            }
          ]}>
            <SearchBar 
              onSearch={searchByCity} 
              isLoading={isLoading}
            />
          </Animated.View>

          <Animated.ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            bounces={false}
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
          </Animated.ScrollView>
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
  searchBarContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 20,
    left: 0,
    right: 0,
    zIndex: 100,
    height: 70,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingTop: 90, // Reducido de 120
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
