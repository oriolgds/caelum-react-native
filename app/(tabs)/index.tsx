import React, { useRef } from 'react';
import { StyleSheet, View, ScrollView, RefreshControl, Text, Image, StatusBar, Dimensions, Animated, Platform } from 'react-native';
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

  // Ref para el scrollView
  const scrollY = useRef(new Animated.Value(0)).current;

  // Animaciones
  const headerHeight = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [Platform.OS === 'ios' ? 60 : 20, 10],
    extrapolate: 'clamp'
  });

  const headerFontSize = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [28, 20],
    extrapolate: 'clamp'
  });

  const headerTranslateX = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, 15],
    extrapolate: 'clamp'
  });

  // Animaciones muy impactantes para SearchBar
  const searchBarTranslateY = scrollY.interpolate({
    inputRange: [0, 80, 100],
    outputRange: [0, -70, -64],
    extrapolate: 'clamp'
  });

  const searchBarTranslateX = scrollY.interpolate({
    inputRange: [0, 50, 80, 100],
    outputRange: [0, 40, -5, 0],
    extrapolate: 'clamp'
  });

  // Usamos valores absolutos en lugar de porcentajes para el ancho
  const searchBarWidth = scrollY.interpolate({
    inputRange: [0, 50, 100],
    outputRange: [Dimensions.get('window').width * 0.92, Dimensions.get('window').width * 0.6, 50],
    extrapolate: 'clamp'
  });

  const searchBarHeight = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [48, 50],
    extrapolate: 'clamp'
  });

  const searchBarBorderRadius = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [16, 25],
    extrapolate: 'clamp'
  });

  const searchBarRightPosition = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [16, 10],
    extrapolate: 'clamp'
  });

  const searchBarRotation = scrollY.interpolate({
    inputRange: [0, 50, 80, 100],
    outputRange: ['0deg', '5deg', '-5deg', '0deg'],
    extrapolate: 'clamp'
  });

  const searchBarScale = scrollY.interpolate({
    inputRange: [0, 50, 80, 100],
    outputRange: [1, 0.9, 1.1, 1],
    extrapolate: 'clamp'
  });

  const blurIntensity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [80, 100],
    extrapolate: 'clamp'
  });

  const backgroundColorAnim = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: ['rgba(0,0,0,0)', 'rgba(30,30,30,0.7)'],
    extrapolate: 'clamp'
  });

  const borderColor = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: ['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.7)'],
    extrapolate: 'clamp'
  });

  const searchIconSize = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [20, 22],
    extrapolate: 'clamp'
  });

  const inputFontSize = scrollY.interpolate({
    inputRange: [0, 70, 100],
    outputRange: [16, 10, 0],
    extrapolate: 'clamp'
  });

  const inputOpacity = scrollY.interpolate({
    inputRange: [0, 70, 100],
    outputRange: [1, 0.5, 0],
    extrapolate: 'clamp'
  });

  const searchBarOpacity = scrollY.interpolate({
    inputRange: [0, 15, 100],
    outputRange: [1, 0.8, 1],
    extrapolate: 'clamp'
  });

  const searchBarMarginTop = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [Platform.OS === 'ios' ? 20 : 15, 15],
    extrapolate: 'clamp'
  });

  const searchBarMarginBottom = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [10, 5],
    extrapolate: 'clamp'
  });

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
          <View style={styles.headerContainer}>
            <Animated.View style={[styles.header, { marginTop: headerHeight }]}>
              <Animated.Text 
                style={[
                  styles.headerTitle, 
                  { 
                    fontSize: headerFontSize,
                    transform: [{ translateX: headerTranslateX }] 
                  }
                ]}
              >
                Caelum
              </Animated.Text>
            </Animated.View>
            
            <Animated.View style={{
              position: 'absolute',
              right: searchBarRightPosition,
              width: searchBarWidth,
              transform: [
                { translateY: searchBarTranslateY },
                { translateX: searchBarTranslateX },
                { scale: searchBarScale },
                { rotate: searchBarRotation }
              ],
              opacity: searchBarOpacity,
              marginTop: searchBarMarginTop,
              marginBottom: searchBarMarginBottom,
              zIndex: 10,
              borderWidth: 1,
              borderColor: borderColor,
              borderRadius: searchBarBorderRadius,
              height: searchBarHeight,
              backgroundColor: backgroundColorAnim,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.3,
              shadowRadius: 4,
              elevation: 5,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
              <SearchBar 
                onSearch={searchByCity} 
                isLoading={isLoading}
                style={{
                  borderRadius: searchBarBorderRadius,
                  height: '100%',
                  width: '100%',
                }}
                blurIntensity={blurIntensity}
                iconSize={searchIconSize}
                inputFontSize={inputFontSize}
                inputOpacity={inputOpacity}
              />
            </Animated.View>
          </View>

          <Animated.ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { y: scrollY } } }],
              { useNativeDriver: false }
            )}
            scrollEventThrottle={16}
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
  headerContainer: {
    position: 'relative',
    width: '100%',
    zIndex: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 10,
    width: '100%',
  },
  headerTitle: {
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
