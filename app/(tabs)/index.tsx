import React, { useRef, useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  RefreshControl,
  StatusBar,
  Dimensions,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedScrollHandler,
  interpolate,
  Extrapolate,
} from "react-native-reanimated";

import { useLocation } from "../../hooks/useLocation";
import { useWeather } from "../../hooks/useWeather";
import { SearchBar } from "../../components/weather/SearchBar";
import { CurrentWeather } from "../../components/weather/CurrentWeather";
import { HourlyForecast } from "../../components/weather/HourlyForecast";
import { DailyForecast } from "../../components/weather/DailyForecast";
import { WeatherStats } from "../../components/weather/WeatherStats";
import { LocationManager } from "../../components/weather/LocationManager";
import { AnimatedWeatherBackground } from "../../components/weather/AnimatedWeatherBackground";
import { useColorScheme } from "../../hooks/useColorScheme";

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const location = useLocation();
  const [currentCoords, setCurrentCoords] = useState<{
    latitude: number | null;
    longitude: number | null;
  }>({
    latitude: location.latitude,
    longitude: location.longitude,
  });

  // Actualizamos las coordenadas cuando cambie la ubicación del usuario
  useEffect(() => {
    if (location.latitude && location.longitude) {
      setCurrentCoords({
        latitude: location.latitude,
        longitude: location.longitude,
      });
    }
  }, [location.latitude, location.longitude]);

  const {
    current,
    forecast,
    isLoading,
    error,
    searchByCity,
    refreshWeather,
    cityName,
    country,
  } = useWeather(currentCoords.latitude, currentCoords.longitude);

  // Animation values
  const scrollY = useSharedValue(0);
  const searchBarOffset = useSharedValue(0);

  // Handle scroll events
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  // Animated styles for SearchBar
  const searchBarStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [0, 100],
      [1, 0.7],
      Extrapolate.CLAMP
    );

    const translateY = interpolate(
      scrollY.value,
      [0, 100],
      [0, -20],
      Extrapolate.CLAMP
    );

    return {
      opacity,
      transform: [{ translateY }],
    };
  });

  // Handle location change from LocationManager
  const handleLocationChange = (lat: number, lon: number) => {
    setCurrentCoords({
      latitude: lat,
      longitude: lon,
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />

      {/* Fondo animado según el clima */}
      <AnimatedWeatherBackground weatherData={current} isLoading={isLoading} />

      <SafeAreaView style={styles.safeArea}>
        {/* Barra de búsqueda animada */}
        <Animated.View style={[styles.searchBarContainer, searchBarStyle]}>
          <SearchBar onSearch={searchByCity} isLoading={isLoading} />
        </Animated.View>

        {/* Gestor de ubicaciones */}
        <LocationManager
          currentLocation={{
            latitude: currentCoords.latitude,
            longitude: currentCoords.longitude,
            cityName: cityName,
            country: country,
          }}
          onLocationChange={handleLocationChange}
        />

        {/* Contenido principal con scroll */}
        <Animated.ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          onScroll={scrollHandler}
          scrollEventThrottle={16}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={refreshWeather}
              tintColor="#fff"
              title="Actualizando"
              titleColor="#fff"
            />
          }
          bounces={true}
        >
          {/* Clima actual */}
          <CurrentWeather
            weatherData={current}
            isLoading={isLoading}
            error={error}
          />

          {/* Pronóstico por horas */}
          <HourlyForecast forecastData={forecast} isLoading={isLoading} />

          {/* Estadísticas del clima */}
          <WeatherStats
            weatherData={current}
            forecastData={forecast}
            isLoading={isLoading}
          />

          {/* Pronóstico de días futuros */}
          <DailyForecast forecastData={forecast} isLoading={isLoading} />

          <View style={styles.bottomPadding} />
        </Animated.ScrollView>
      </SafeAreaView>
    </View>
  );
}

const { height } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000", // Fallback color
  },
  safeArea: {
    flex: 1,
  },
  searchBarContainer: {
    position: "absolute",
    top: Platform.OS === "ios" ? 50 : 20,
    left: 0,
    right: 0,
    zIndex: 100,
    paddingHorizontal: 16,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 130,
    paddingBottom: 30,
  },
  errorContainer: {
    flex: 1,
    height: height * 0.5,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  bottomPadding: {
    height: 40,
  },
});
