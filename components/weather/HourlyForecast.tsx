import React, { useRef, useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { format, addHours } from "date-fns";
import { es } from "date-fns/locale";
import { BlurView } from "expo-blur";
import Svg, {
  Path,
  Circle,
  Defs,
  LinearGradient,
  Stop,
} from "react-native-svg";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  withDelay,
  Easing,
  interpolate,
  Extrapolate,
} from "react-native-reanimated";
import { LinearGradient as ExpoLinearGradient } from "expo-linear-gradient";

import { ForecastData } from "../../types/weather";
import { WeatherIcon } from "./WeatherIcon";
import { Colors } from "../../constants/Colors";
import { useColorScheme } from "../../hooks/useColorScheme";

interface HourlyForecastProps {
  forecastData: ForecastData;
  isLoading?: boolean;
}

const { width } = Dimensions.get("window");
const CARD_WIDTH = 80;
const CARD_MARGIN = 8;
const TOTAL_CARD_WIDTH = CARD_WIDTH + CARD_MARGIN;

export const HourlyForecast: React.FC<HourlyForecastProps> = ({
  forecastData,
  isLoading = false,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const scrollViewRef = useRef<ScrollView>(null);
  const flatListRef = useRef<FlatList>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedHour, setSelectedHour] = useState<number | null>(null);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.9);
  const graphOpacity = useSharedValue(0);
  const graphProgress = useSharedValue(0);

  // Animar entrada del componente
  useEffect(() => {
    if (!isLoading && forecastData) {
      opacity.value = withTiming(1, { duration: 700 });
      scale.value = withSpring(1, { damping: 15 });
      graphOpacity.value = withDelay(300, withTiming(1, { duration: 800 }));
      graphProgress.value = withDelay(
        500,
        withTiming(1, {
          duration: 1200,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        })
      );
    }
  }, [isLoading, forecastData]);

  const containerAnimStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  if (isLoading || !forecastData) {
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
          <View style={styles.loadingHeaderContainer}>
            <Text
              style={[
                styles.title,
                { color: isDark ? Colors.dark.text : Colors.light.text },
              ]}
            >
              Pronóstico por horas
            </Text>
            <ExpoLinearGradient
              colors={
                isDark ? ["#444", "#333", "#444"] : ["#eee", "#ddd", "#eee"]
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.loadingGradient}
            />
          </View>
          <View style={styles.loadingContent}>
            {[1, 2, 3, 4].map((_, index) => (
              <Animated.View
                key={index}
                style={[
                  styles.loadingHourItem,
                  {
                    backgroundColor: isDark ? "#333" : "#eee",
                    opacity: withSequence(
                      withTiming(0.5, { duration: 800 }),
                      withTiming(0.8, { duration: 800 })
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

  const createHourlyData = () => {
    const originalData = forecastData.list.slice(0, 24);
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
          humidity: closestForecast.main.humidity,
        },
        weather: closestForecast.weather,
        wind: closestForecast.wind,
        pop: closestForecast.pop || 0,
        visibility: closestForecast.visibility,
        dt_txt: format(targetHour, "yyyy-MM-dd HH:mm:ss"),
      });
    }

    return hourlyDataArray;
  };

  const findClosestForecast = (
    forecasts: typeof forecastData.list,
    targetDate: Date
  ) => {
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
  const temperatures = hourlyData.map((item) => item.main.temp);
  const minTemp = Math.min(...temperatures) - 0.5; // Añadimos margen
  const maxTemp = Math.max(...temperatures) + 0.5;
  const tempRange = maxTemp - minTemp;

  const renderHourItem = ({ item, index }: { item: any; index: number }) => {
    const date = new Date(item.dt * 1000);
    const hour = format(date, "HH:00");
    const isNow = index === 0;
    const isSelected = selectedHour === index;
    const temp = Math.round(item.main.temp);
    const iconCode = item.weather[0].icon;
    const pop = Math.round(item.pop * 100);
    const windSpeed = Math.round((item.wind?.speed || 0) * 3.6); // m/s a km/h

    return (
      <Animated.View
        style={[
          styles.hourItem,
          {
            backgroundColor:
              isNow || isSelected
                ? isDark
                  ? "rgba(255,255,255,0.15)"
                  : "rgba(0,0,0,0.07)"
                : "transparent",
            borderRadius: 20,
            transform: [
              {
                scale: withSpring(isNow || isSelected ? 1.05 : 1, {
                  mass: 1,
                  damping: 15,
                }),
              },
            ],
          },
        ]}
      >
        <TouchableOpacity
          style={styles.hourCard}
          activeOpacity={0.7}
          onPress={() => setSelectedHour(isSelected ? null : index)}
        >
          <View style={styles.hourTimeContainer}>
            <Text
              style={[
                styles.hourText,
                {
                  color: isDark ? Colors.dark.text : Colors.light.text,
                  opacity: isNow || isSelected ? 1 : 0.8,
                },
                (isNow || isSelected) && styles.highlightedText,
              ]}
            >
              {isNow ? "Ahora" : hour}
            </Text>
            {index % 2 === 0 && (
              <Text
                style={[
                  styles.dayText,
                  {
                    color: isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.5)",
                  },
                ]}
              >
                {format(date, "EEE", { locale: es })}
              </Text>
            )}
          </View>

          <View style={styles.weatherIconContainer}>
            <WeatherIcon
              iconCode={iconCode}
              size="small"
              showBackground
              animate={isNow || isSelected}
            />
          </View>

          <Text
            style={[
              styles.tempText,
              {
                color: isDark ? Colors.dark.text : Colors.light.text,
                opacity: isNow || isSelected ? 1 : 0.8,
              },
              (isNow || isSelected) && styles.highlightedText,
            ]}
          >
            {temp}°
          </Text>

          <View style={styles.detailsContainer}>
            {pop > 5 && (
              <BlurView
                tint={isDark ? "dark" : "light"}
                intensity={isDark ? 40 : 60}
                style={[
                  styles.detailPill,
                  {
                    backgroundColor: isDark
                      ? "rgba(78,130,209,0.3)"
                      : "rgba(78,130,209,0.15)",
                  },
                ]}
              >
                <Ionicons
                  name="water-outline"
                  size={12}
                  color={isDark ? "#82b1ff" : "#1565c0"}
                />
                <Text
                  style={[
                    styles.detailText,
                    { color: isDark ? "#82b1ff" : "#1565c0" },
                  ]}
                >
                  {pop}%
                </Text>
              </BlurView>
            )}

            {windSpeed > 10 && (
              <BlurView
                tint={isDark ? "dark" : "light"}
                intensity={isDark ? 40 : 60}
                style={[
                  styles.detailPill,
                  {
                    backgroundColor: isDark
                      ? "rgba(255,255,255,0.1)"
                      : "rgba(0,0,0,0.05)",
                  },
                ]}
              >
                <Ionicons
                  name="speedometer-outline"
                  size={12}
                  color={isDark ? Colors.dark.text : Colors.light.text}
                />
                <Text
                  style={[
                    styles.detailText,
                    { color: isDark ? Colors.dark.text : Colors.light.text },
                  ]}
                >
                  {windSpeed}
                </Text>
              </BlurView>
            )}
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const createTempGraph = () => {
    if (hourlyData.length < 2) return null;

    const graphHeight = 60;
    const totalWidth = width - 40; // Ancho disponible con padding
    const pointSpacing = totalWidth / (hourlyData.length - 1);

    // Crear puntos para el gráfico
    const points = hourlyData.map((item, index) => {
      const temp = item.main.temp;
      const normalizedValue =
        tempRange > 0 ? 1 - (temp - minTemp) / tempRange : 0.5;
      const x = index * pointSpacing;
      const y = 5 + normalizedValue * (graphHeight - 10);
      return { x, y, temp };
    });

    // Crear el path para la línea
    const path = points.reduce((acc, point, index) => {
      if (index === 0) return `M ${point.x} ${point.y}`;
      return `${acc} L ${point.x} ${point.y}`;
    }, "");

    // Crear el path para el área bajo la curva
    const areaPath =
      points.reduce((acc, point, index) => {
        if (index === 0) return `M ${point.x} ${point.y}`;
        return `${acc} L ${point.x} ${point.y}`;
      }, "") +
      ` L ${points[points.length - 1].x} ${graphHeight} L ${
        points[0].x
      } ${graphHeight} Z`;

    // Crear un gradiente para el área
    const gradientId = "tempGradient";

    return (
      <Animated.View
        style={[
          styles.graphWrapper,
          {
            opacity: graphOpacity,
          },
        ]}
      >
        <Svg height={graphHeight} width={totalWidth}>
          <Defs>
            <LinearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <Stop
                offset="0"
                stopColor={isDark ? "#82b1ff" : "#1976d2"}
                stopOpacity="0.5"
              />
              <Stop
                offset="1"
                stopColor={isDark ? "#82b1ff" : "#1976d2"}
                stopOpacity="0.1"
              />
            </LinearGradient>
          </Defs>

          {/* Área bajo la curva */}
          <Animated.Path
            d={areaPath}
            fill={`url(#${gradientId})`}
            strokeWidth={0}
            strokeOpacity={0.7}
            fillRule="evenodd"
            clipRule="evenodd"
            animatedProps={{
              opacity: graphProgress,
            }}
          />

          {/* Línea principal */}
          <Animated.Path
            d={path}
            stroke={isDark ? "#82b1ff" : "#1976d2"}
            strokeWidth={2.5}
            strokeLinecap="round"
            fill="transparent"
            animatedProps={{
              strokeDashoffset: interpolate(
                graphProgress.value,
                [0, 1],
                [totalWidth, 0]
              ),
              strokeDasharray: [totalWidth, totalWidth],
            }}
          />

          {/* Puntos en la línea */}
          {points.map((point, index) => (
            <Animated.Circle
              key={index}
              cx={point.x}
              cy={point.y}
              r={index === selectedHour ? 6 : 4}
              fill={isDark ? "#82b1ff" : "#1976d2"}
              opacity={index === selectedHour ? 1 : 0.7}
              strokeWidth={index === selectedHour ? 2 : 0}
              stroke={isDark ? "#ffffff" : "#ffffff"}
              animatedProps={{
                opacity: withTiming(
                  interpolate(
                    graphProgress.value,
                    [0.7, 1],
                    [0, index === selectedHour ? 1 : 0.7]
                  )
                ),
                r: withSpring(index === selectedHour ? 6 : 4),
              }}
            />
          ))}

          {/* Temperatura en el punto seleccionado */}
          {selectedHour !== null && (
            <Animated.G
              animatedProps={{
                opacity: withTiming(1, { duration: 200 }),
                transform: [{ scale: withSpring(1, { damping: 12 }) }],
              }}
            >
              <Circle
                cx={points[selectedHour].x}
                cy={points[selectedHour].y - 20}
                r={16}
                fill={isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.07)"}
              />
              <Svg.Text
                x={points[selectedHour].x}
                y={points[selectedHour].y - 16}
                fontSize="12"
                fontWeight="bold"
                fill={isDark ? Colors.dark.text : Colors.light.text}
                textAnchor="middle"
              >
                {Math.round(points[selectedHour].temp)}°
              </Svg.Text>
            </Animated.G>
          )}
        </Svg>
      </Animated.View>
    );
  };

  const handleScroll = (event: any) => {
    if (scrollViewRef.current) {
      const offsetX = event.nativeEvent.contentOffset.x;
      scrollViewRef.current.scrollTo({ x: offsetX, animated: false });
    }
  };

  // Función para cambiar de modo de visualización
  const toggleViewMode = () => {
    setShowDetails(!showDetails);

    // Animar el cambio
    graphOpacity.value = withTiming(showDetails ? 0 : 1, { duration: 400 });

    if (!showDetails) {
      // Al mostrar detalles, animar gráfico
      graphProgress.value = withTiming(1, {
        duration: 1000,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      });
    }
  };

  return (
    <Animated.View style={[styles.container, containerAnimStyle]}>
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
        <View style={styles.headerContainer}>
          <Text
            style={[
              styles.title,
              {
                color: isDark ? Colors.dark.text : Colors.light.text,
              },
            ]}
          >
            Pronóstico por horas
          </Text>

          <TouchableOpacity
            style={styles.viewToggleButton}
            onPress={toggleViewMode}
          >
            <Text
              style={[
                styles.viewToggleText,
                { color: isDark ? "#82b1ff" : "#1976d2" },
              ]}
            >
              {showDetails ? "Vista lista" : "Ver gráfico"}
            </Text>
            <Ionicons
              name={showDetails ? "list-outline" : "stats-chart-outline"}
              size={16}
              color={isDark ? "#82b1ff" : "#1976d2"}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.graphContainer}>
          {showDetails && (
            <Animated.View
              style={[styles.detailedGraph, { opacity: graphOpacity }]}
            >
              {createTempGraph()}
              <View style={styles.graphLabelsContainer}>
                <Text
                  style={[
                    styles.graphLabel,
                    {
                      color: isDark
                        ? "rgba(255,255,255,0.7)"
                        : "rgba(0,0,0,0.6)",
                    },
                  ]}
                >
                  Temp. máx: {Math.round(maxTemp)}°C
                </Text>
                <Text
                  style={[
                    styles.graphLabel,
                    {
                      color: isDark
                        ? "rgba(255,255,255,0.7)"
                        : "rgba(0,0,0,0.6)",
                    },
                  ]}
                >
                  Temp. mín: {Math.round(minTemp)}°C
                </Text>
              </View>
            </Animated.View>
          )}

          <FlatList
            ref={flatListRef}
            data={hourlyData}
            renderItem={renderHourItem}
            keyExtractor={(item, index) => `hourly-${index}`}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={[
              styles.listContent,
              showDetails && { paddingBottom: 40 },
            ]}
            initialNumToRender={8}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            decelerationRate="fast"
            snapToInterval={TOTAL_CARD_WIDTH}
            snapToAlignment="start"
            initialScrollIndex={0}
            getItemLayout={(data, index) => ({
              length: TOTAL_CARD_WIDTH,
              offset: TOTAL_CARD_WIDTH * index,
              index,
            })}
          />
        </View>

        <TouchableOpacity
          style={[
            styles.footerButton,
            {
              backgroundColor: isDark
                ? "rgba(255,255,255,0.1)"
                : "rgba(0,0,0,0.05)",
            },
          ]}
          onPress={() => setSelectedHour(null)}
        >
          <Ionicons
            name="refresh-outline"
            size={16}
            color={isDark ? Colors.dark.text : Colors.light.text}
          />
          <Text
            style={[
              styles.footerButtonText,
              { color: isDark ? Colors.dark.text : Colors.light.text },
            ]}
          >
            {selectedHour !== null
              ? "Reiniciar selección"
              : "Actualizado hace 10 min"}
          </Text>
        </TouchableOpacity>
      </BlurView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    alignItems: "center",
    marginTop: 16,
    paddingHorizontal: 16,
  },
  contentContainer: {
    width: "100%",
    borderRadius: 24,
    padding: 16,
    overflow: "hidden",
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
  },
  viewToggleButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 20,
    backgroundColor: "rgba(130, 177, 255, 0.1)",
  },
  viewToggleText: {
    fontSize: 12,
    fontWeight: "600",
    marginRight: 5,
  },
  graphContainer: {
    position: "relative",
    width: "100%",
  },
  detailedGraph: {
    marginBottom: 16,
    paddingBottom: 10,
    paddingHorizontal: 6,
  },
  graphWrapper: {
    paddingVertical: 10,
    alignItems: "center",
  },
  graphLabelsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    marginTop: 5,
  },
  graphLabel: {
    fontSize: 12,
    fontWeight: "500",
  },
  graphScrollContainer: {
    position: "absolute",
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
    paddingVertical: 8,
  },
  hourCard: {
    alignItems: "center",
    justifyContent: "center",
    width: CARD_WIDTH,
    padding: 8,
  },
  hourItem: {
    alignItems: "center",
    marginRight: CARD_MARGIN,
    minHeight: 120,
    zIndex: 2,
    justifyContent: "center",
  },
  hourTimeContainer: {
    alignItems: "center",
    marginBottom: 4,
  },
  hourText: {
    fontSize: 15,
    fontWeight: "500",
  },
  dayText: {
    fontSize: 11,
    marginTop: 2,
    textTransform: "capitalize",
  },
  weatherIconContainer: {
    marginVertical: 4,
    height: 40,
    justifyContent: "center",
  },
  highlightedText: {
    fontWeight: "700",
  },
  tempText: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 4,
  },
  detailsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 6,
    gap: 4,
    minHeight: 24,
  },
  detailPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 5,
    paddingVertical: 3,
    borderRadius: 10,
  },
  detailText: {
    fontSize: 10,
    fontWeight: "600",
    marginLeft: 2,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: "500",
    marginVertical: 20,
    textAlign: "center",
  },
  loadingHeaderContainer: {
    marginBottom: 20,
  },
  loadingContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    height: 120,
  },
  loadingHourItem: {
    width: 70,
    height: 120,
    borderRadius: 20,
  },
  loadingGradient: {
    height: 20,
    width: 100,
    borderRadius: 10,
    marginTop: 8,
  },
  footerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    borderRadius: 16,
    marginTop: 12,
  },
  footerButtonText: {
    fontSize: 13,
    fontWeight: "500",
    marginLeft: 6,
  },
});
