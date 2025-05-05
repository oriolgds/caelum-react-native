import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  Extrapolate,
  withSequence,
  Easing,
} from "react-native-reanimated";

import { WeatherData } from "../../types/weather";
import { WeatherIcon } from "./WeatherIcon";
import { Colors } from "../../constants/Colors";
import { useColorScheme } from "../../hooks/useColorScheme";
import { LinearGradient } from "expo-linear-gradient";

interface CurrentWeatherProps {
  weatherData: WeatherData | null;
  isLoading?: boolean;
  error?: string | null;
}

export const CurrentWeather: React.FC<CurrentWeatherProps> = ({
  weatherData,
  isLoading = false,
  error = null,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const [showDetails, setShowDetails] = useState(false);
  const expandAnim = useSharedValue(0);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.95);
  const weatherIconAnim = useSharedValue(0);

  // Animación de entrada
  useEffect(() => {
    if (!isLoading && weatherData) {
      opacity.value = withTiming(1, { duration: 600 });
      scale.value = withSpring(1, { damping: 15 });
      weatherIconAnim.value = withSequence(
        withTiming(1.2, { duration: 300, easing: Easing.out(Easing.quad) }),
        withTiming(1, { duration: 400, easing: Easing.inOut(Easing.quad) })
      );
    }
  }, [isLoading, weatherData]);

  const handleToggleDetails = () => {
    setShowDetails(!showDetails);
    expandAnim.value = withSpring(showDetails ? 0 : 1, {
      damping: 15,
      stiffness: 100,
      mass: 1,
    });
  };

  const containerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  const detailsStyle = useAnimatedStyle(() => {
    return {
      opacity: expandAnim.value,
      maxHeight: interpolate(
        expandAnim.value,
        [0, 1],
        [0, 500],
        Extrapolate.CLAMP
      ),
      transform: [
        {
          translateY: interpolate(
            expandAnim.value,
            [0, 1],
            [20, 0],
            Extrapolate.CLAMP
          ),
        },
      ],
    };
  });

  const weatherIconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: weatherIconAnim.value }],
  }));

  if (error) {
    return (
      <Animated.View style={[styles.container, containerStyle]}>
        <BlurView
          tint={isDark ? "dark" : "light"}
          intensity={isDark ? 60 : 80}
          style={[
            styles.contentContainer,
            {
              borderWidth: 1,
              borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
            },
          ]}
        >
          <View style={styles.errorContainer}>
            <Ionicons
              name="alert-circle-outline"
              size={48}
              color={isDark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.7)"}
              style={styles.errorIcon}
            />
            <Text
              style={[
                styles.errorText,
                { color: isDark ? Colors.dark.text : Colors.light.text },
              ]}
            >
              {error}
            </Text>
            <Text
              style={[
                styles.errorHint,
                { color: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)" },
              ]}
            >
              Desliza hacia abajo para intentar de nuevo
            </Text>
          </View>
        </BlurView>
      </Animated.View>
    );
  }

  if (isLoading || !weatherData) {
    return (
      <View style={styles.container}>
        <BlurView
          tint={isDark ? "dark" : "light"}
          intensity={isDark ? 60 : 80}
          style={[
            styles.contentContainer,
            {
              borderWidth: 1,
              borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
            },
          ]}
        >
          <View style={styles.loadingContainer}>
            <Animated.View
              style={[
                styles.loadingWeatherIcon,
                {
                  backgroundColor: isDark
                    ? "rgba(255,255,255,0.1)"
                    : "rgba(0,0,0,0.05)",
                  transform: [
                    {
                      scale: withSequence(
                        withTiming(1.05, { duration: 700 }),
                        withTiming(0.95, { duration: 700 })
                      ),
                    },
                  ],
                },
              ]}
            />
            <View style={styles.loadingDetails}>
              <Animated.View
                style={[
                  styles.loadingTemp,
                  {
                    backgroundColor: isDark
                      ? "rgba(255,255,255,0.1)"
                      : "rgba(0,0,0,0.05)",
                    opacity: withSequence(
                      withTiming(0.7, { duration: 800 }),
                      withTiming(1, { duration: 800 })
                    ),
                  },
                ]}
              />
              <Animated.View
                style={[
                  styles.loadingDesc,
                  {
                    backgroundColor: isDark
                      ? "rgba(255,255,255,0.1)"
                      : "rgba(0,0,0,0.05)",
                    opacity: withSequence(
                      withTiming(0.5, { duration: 700 }),
                      withTiming(0.8, { duration: 700 })
                    ),
                  },
                ]}
              />
            </View>
          </View>
          <View style={styles.loadingStatsContainer}>
            {[1, 2, 3, 4].map((_, index) => (
              <Animated.View
                key={index}
                style={[
                  styles.loadingStat,
                  {
                    backgroundColor: isDark
                      ? "rgba(255,255,255,0.1)"
                      : "rgba(0,0,0,0.05)",
                    opacity: withSequence(
                      withTiming(0.6, { duration: 600 + index * 100 }),
                      withTiming(0.9, { duration: 600 + index * 100 })
                    ),
                  },
                ]}
              />
            ))}
          </View>
        </BlurView>
      </View>
    );
  }

  const weatherIcon = weatherData.weather[0].icon;
  const temp = Math.round(weatherData.main.temp);
  const feelsLike = Math.round(weatherData.main.feels_like);
  const tempMin = Math.round(weatherData.main.temp_min);
  const tempMax = Math.round(weatherData.main.temp_max);
  const description = weatherData.weather[0].description;
  const humidity = weatherData.main.humidity;
  const windSpeed = Math.round(weatherData.wind.speed * 3.6); // Convertir m/s a km/h
  const date = new Date(weatherData.dt * 1000);
  const formattedDate = format(date, "EEEE, d 'de' MMMM", { locale: es });
  const formattedTime = format(date, "HH:mm", { locale: es });
  const sunrise = new Date(weatherData.sys.sunrise * 1000);
  const sunset = new Date(weatherData.sys.sunset * 1000);
  const formattedSunrise = format(sunrise, "HH:mm");
  const formattedSunset = format(sunset, "HH:mm");

  // Verificar si es de noche
  const isNight = weatherIcon.includes("n");

  return (
    <Animated.View style={[styles.container, containerStyle]}>
      <BlurView
        tint={isDark ? "dark" : "light"}
        intensity={isDark ? 60 : 80}
        style={[
          styles.contentContainer,
          {
            borderWidth: 1,
            borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
          },
        ]}
      >
        <View style={styles.header}>
          <View>
            <Text
              style={[
                styles.date,
                { color: isDark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.7)" },
              ]}
            >
              {formattedDate} • {formattedTime}
            </Text>
          </View>
        </View>

        <View style={styles.mainInfo}>
          <Animated.View
            style={[styles.weatherIconContainer, weatherIconStyle]}
          >
            <WeatherIcon
              iconCode={weatherIcon}
              size="large"
              showBackground
              animate
            />
            <Text
              style={[
                styles.description,
                {
                  color: isDark ? "rgba(255,255,255,0.8)" : "rgba(0,0,0,0.8)",
                },
              ]}
            >
              {description}
            </Text>
          </Animated.View>

          <View style={styles.tempContainer}>
            <Text
              style={[
                styles.temp,
                {
                  color: isDark ? Colors.dark.text : Colors.light.text,
                  textShadowColor: "rgba(0,0,0,0.1)",
                  textShadowOffset: { width: 0, height: 2 },
                  textShadowRadius: 4,
                },
              ]}
            >
              {temp}°
            </Text>
            <Text
              style={[
                styles.feelsLike,
                {
                  color: isDark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.7)",
                },
              ]}
            >
              Sensación térmica de {feelsLike}°
            </Text>
          </View>
        </View>

        <View style={styles.minMaxContainer}>
          <View style={styles.minMaxItem}>
            <Ionicons
              name="thermometer-outline"
              size={16}
              color={isDark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.7)"}
            />
            <Text
              style={[
                styles.minMaxText,
                { color: isDark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.7)" },
              ]}
            >
              Mín: {tempMin}° • Máx: {tempMax}°
            </Text>
          </View>
        </View>

        <Animated.View style={[styles.detailsContainer, detailsStyle]}>
          <View style={styles.detailGrid}>
            <View
              style={[
                styles.detailCard,
                {
                  backgroundColor: isDark
                    ? "rgba(130, 177, 255, 0.15)"
                    : "rgba(25, 118, 210, 0.1)",
                },
              ]}
            >
              <Ionicons
                name="water-outline"
                size={24}
                color={isDark ? "#82b1ff" : "#1976d2"}
              />
              <Text
                style={[
                  styles.detailValue,
                  { color: isDark ? Colors.dark.text : Colors.light.text },
                ]}
              >
                {humidity}%
              </Text>
              <Text
                style={[
                  styles.detailLabel,
                  {
                    color: isDark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.7)",
                  },
                ]}
              >
                Humedad
              </Text>
            </View>

            <View
              style={[
                styles.detailCard,
                {
                  backgroundColor: isDark
                    ? "rgba(179, 157, 219, 0.15)"
                    : "rgba(94, 53, 177, 0.1)",
                },
              ]}
            >
              <Ionicons
                name="speedometer-outline"
                size={24}
                color={isDark ? "#b39ddb" : "#5e35b1"}
              />
              <Text
                style={[
                  styles.detailValue,
                  { color: isDark ? Colors.dark.text : Colors.light.text },
                ]}
              >
                {windSpeed}
              </Text>
              <Text
                style={[
                  styles.detailLabel,
                  {
                    color: isDark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.7)",
                  },
                ]}
              >
                km/h
              </Text>
            </View>

            <View
              style={[
                styles.detailCard,
                {
                  backgroundColor: isDark
                    ? "rgba(236, 64, 122, 0.15)"
                    : "rgba(194, 24, 91, 0.1)",
                },
              ]}
            >
              <Ionicons
                name="sunny-outline"
                size={24}
                color={isDark ? "#f48fb1" : "#c2185b"}
              />
              <Text
                style={[
                  styles.detailValue,
                  { color: isDark ? Colors.dark.text : Colors.light.text },
                ]}
              >
                {formattedSunrise}
              </Text>
              <Text
                style={[
                  styles.detailLabel,
                  {
                    color: isDark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.7)",
                  },
                ]}
              >
                Amanecer
              </Text>
            </View>

            <View
              style={[
                styles.detailCard,
                {
                  backgroundColor: isDark
                    ? "rgba(121, 134, 203, 0.15)"
                    : "rgba(57, 73, 171, 0.1)",
                },
              ]}
            >
              <Ionicons
                name="moon-outline"
                size={24}
                color={isDark ? "#9fa8da" : "#3949ab"}
              />
              <Text
                style={[
                  styles.detailValue,
                  { color: isDark ? Colors.dark.text : Colors.light.text },
                ]}
              >
                {formattedSunset}
              </Text>
              <Text
                style={[
                  styles.detailLabel,
                  {
                    color: isDark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.7)",
                  },
                ]}
              >
                Atardecer
              </Text>
            </View>
          </View>
        </Animated.View>

        <TouchableOpacity
          style={[
            styles.moreInfoButton,
            {
              backgroundColor: isDark
                ? "rgba(255,255,255,0.1)"
                : "rgba(0,0,0,0.05)",
            },
          ]}
          onPress={handleToggleDetails}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.moreInfoText,
              { color: isDark ? Colors.dark.text : Colors.light.text },
            ]}
          >
            {showDetails ? "Ocultar detalles" : "Mostrar detalles"}
          </Text>
          <Animated.View
            style={{
              transform: [
                {
                  rotate: `${interpolate(
                    expandAnim.value,
                    [0, 1],
                    [0, 180],
                    Extrapolate.CLAMP
                  )}deg`,
                },
              ],
            }}
          >
            <Ionicons
              name="chevron-down"
              size={20}
              color={isDark ? Colors.dark.text : Colors.light.text}
            />
          </Animated.View>
        </TouchableOpacity>
      </BlurView>
    </Animated.View>
  );
};

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    width: "100%",
    alignItems: "center",
    marginTop: 8,
    paddingHorizontal: 16,
  },
  contentContainer: {
    width: "100%",
    borderRadius: 24,
    padding: 16,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  date: {
    fontSize: 15,
    fontWeight: "500",
    textAlign: "center",
  },
  mainInfo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  weatherIconContainer: {
    alignItems: "center",
  },
  tempContainer: {
    alignItems: "center",
  },
  temp: {
    fontSize: 64,
    fontWeight: "700",
    lineHeight: 74,
  },
  description: {
    fontSize: 17,
    textTransform: "capitalize",
    marginTop: 8,
    textAlign: "center",
  },
  feelsLike: {
    fontSize: 14,
    marginTop: 4,
  },
  minMaxContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  minMaxItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  minMaxText: {
    fontSize: 14,
    marginLeft: 6,
  },
  detailsContainer: {
    width: "100%",
    marginTop: 0,
    overflow: "hidden",
  },
  detailGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
  },
  detailCard: {
    width: "48%",
    borderRadius: 16,
    padding: 12,
    alignItems: "center",
    marginBottom: 12,
  },
  detailValue: {
    fontSize: 20,
    fontWeight: "600",
    marginTop: 8,
  },
  detailLabel: {
    fontSize: 14,
    marginTop: 4,
  },
  moreInfoButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
    paddingVertical: 10,
    borderRadius: 12,
  },
  moreInfoText: {
    fontSize: 14,
    fontWeight: "500",
    marginRight: 6,
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  loadingWeatherIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  loadingDetails: {
    flex: 1,
    marginLeft: 16,
  },
  loadingTemp: {
    height: 40,
    width: 120,
    borderRadius: 8,
    marginBottom: 16,
  },
  loadingDesc: {
    height: 16,
    width: 160,
    borderRadius: 4,
  },
  loadingStatsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    padding: 16,
  },
  loadingStat: {
    width: "48%",
    height: 80,
    borderRadius: 16,
    marginBottom: 12,
  },
  errorContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
  },
  errorIcon: {
    marginBottom: 16,
  },
  errorText: {
    fontSize: 18,
    fontWeight: "500",
    textAlign: "center",
    marginBottom: 12,
  },
  errorHint: {
    fontSize: 14,
    textAlign: "center",
  },
});
