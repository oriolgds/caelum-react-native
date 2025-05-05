import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  Dimensions,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
  withDelay,
} from "react-native-reanimated";
import { LineChart } from "react-native-chart-kit";

import { WeatherData, ForecastData } from "../../types/weather";
import { useColorScheme } from "../../hooks/useColorScheme";
import { Colors } from "../../constants/Colors";

interface WeatherStatsProps {
  weatherData: WeatherData | null;
  forecastData: ForecastData | null;
  isLoading?: boolean;
}

const { width } = Dimensions.get("window");

const TABS = ["Temperatura", "Humedad", "Viento", "Presión"];

export const WeatherStats: React.FC<WeatherStatsProps> = ({
  weatherData,
  forecastData,
  isLoading = false,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const [activeTab, setActiveTab] = useState(0);

  // Animation values
  const opacity = useSharedValue(0);
  const scaleY = useSharedValue(0.95);
  const tabIndicatorPosition = useSharedValue(0);

  useEffect(() => {
    if (!isLoading && weatherData && forecastData) {
      opacity.value = withTiming(1, { duration: 600 });
      scaleY.value = withSpring(1);
    }
  }, [isLoading, weatherData, forecastData]);

  const containerAnimStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scaleY: scaleY.value }],
  }));

  const tabIndicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: tabIndicatorPosition.value }],
  }));

  const handleTabChange = (index: number) => {
    setActiveTab(index);
    // Animate tab indicator
    const newPosition = (index * (width - 32)) / TABS.length;
    tabIndicatorPosition.value = withSpring(newPosition, {
      damping: 15,
      stiffness: 120,
    });
  };

  if (isLoading || !weatherData || !forecastData) {
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
          <Text
            style={[
              styles.title,
              { color: isDark ? Colors.dark.text : Colors.light.text },
            ]}
          >
            Estadísticas del clima
          </Text>
          <View style={styles.loadingContainer}>
            <Text
              style={[
                styles.loadingText,
                { color: isDark ? Colors.dark.text : Colors.light.text },
              ]}
            >
              Cargando datos...
            </Text>
          </View>
        </BlurView>
      </View>
    );
  }

  // Preparar datos para los gráficos
  const prepareChartData = () => {
    if (!forecastData || !forecastData.list || forecastData.list.length === 0) {
      return {
        labels: [],
        datasets: [{ data: [0] }],
      };
    }

    // Tomar solo los primeros 8 puntos (24 horas)
    const forecastPoints = forecastData.list.slice(0, 8);

    // Crear etiquetas de hora
    const labels = forecastPoints.map((point) =>
      format(new Date(point.dt * 1000), "HH")
    );

    // Crear datasets según la pestaña activa
    let data;
    switch (activeTab) {
      case 0: // Temperatura
        data = forecastPoints.map((point) => Math.round(point.main.temp));
        break;
      case 1: // Humedad
        data = forecastPoints.map((point) => point.main.humidity);
        break;
      case 2: // Viento
        data = forecastPoints.map((point) =>
          Math.round(point.wind.speed * 3.6)
        ); // m/s a km/h
        break;
      case 3: // Presión
        data = forecastPoints.map((point) => point.main.pressure);
        break;
      default:
        data = forecastPoints.map((point) => Math.round(point.main.temp));
    }

    return {
      labels,
      datasets: [{ data }],
    };
  };

  // Obtener unidades según la pestaña activa
  const getActiveUnit = () => {
    switch (activeTab) {
      case 0:
        return "°C";
      case 1:
        return "%";
      case 2:
        return "km/h";
      case 3:
        return "hPa";
      default:
        return "";
    }
  };

  // Obtener color según la pestaña activa
  const getActiveColor = () => {
    switch (activeTab) {
      case 0:
        return isDark ? "#82b1ff" : "#1976d2"; // Temperatura
      case 1:
        return isDark ? "#80cbc4" : "#00796b"; // Humedad
      case 2:
        return isDark ? "#b39ddb" : "#5e35b1"; // Viento
      case 3:
        return isDark ? "#ffcc80" : "#f57c00"; // Presión
      default:
        return isDark ? "#82b1ff" : "#1976d2";
    }
  };

  // Preparar valores actuales
  const currentTemp = Math.round(weatherData.main.temp);
  const currentHumidity = weatherData.main.humidity;
  const currentWind = Math.round(weatherData.wind.speed * 3.6); // m/s a km/h
  const currentPressure = weatherData.main.pressure;

  // Obtener valor actual según la pestaña
  const getCurrentValue = () => {
    switch (activeTab) {
      case 0:
        return currentTemp;
      case 1:
        return currentHumidity;
      case 2:
        return currentWind;
      case 3:
        return currentPressure;
      default:
        return currentTemp;
    }
  };

  // Obtener descripción según la pestaña
  const getDescription = () => {
    switch (activeTab) {
      case 0:
        if (currentTemp < 0) return "Muy frío";
        if (currentTemp < 10) return "Frío";
        if (currentTemp < 20) return "Templado";
        if (currentTemp < 30) return "Cálido";
        return "Muy caluroso";
      case 1:
        if (currentHumidity < 30) return "Muy seco";
        if (currentHumidity < 50) return "Seco";
        if (currentHumidity < 70) return "Confortable";
        if (currentHumidity < 90) return "Húmedo";
        return "Muy húmedo";
      case 2:
        if (currentWind < 5) return "Calma";
        if (currentWind < 15) return "Brisa ligera";
        if (currentWind < 30) return "Viento moderado";
        if (currentWind < 50) return "Viento fuerte";
        return "Vendaval";
      case 3:
        if (currentPressure < 1000) return "Baja presión";
        if (currentPressure < 1010) return "Presión algo baja";
        if (currentPressure < 1020) return "Presión normal";
        if (currentPressure < 1030) return "Presión algo alta";
        return "Alta presión";
      default:
        return "";
    }
  };

  // Obtener icono según la pestaña
  const getTabIcon = (index: number) => {
    switch (index) {
      case 0:
        return "thermometer-outline";
      case 1:
        return "water-outline";
      case 2:
        return "speedometer-outline";
      case 3:
        return "compass-outline";
      default:
        return "analytics-outline";
    }
  };

  const chartData = prepareChartData();
  const currentValue = getCurrentValue();
  const unit = getActiveUnit();
  const activeColor = getActiveColor();

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
        <Text
          style={[
            styles.title,
            { color: isDark ? Colors.dark.text : Colors.light.text },
          ]}
        >
          Estadísticas del clima
        </Text>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <View style={styles.tabsRow}>
            {TABS.map((tab, index) => (
              <TouchableOpacity
                key={tab}
                style={[styles.tab, activeTab === index && styles.activeTab]}
                onPress={() => handleTabChange(index)}
              >
                <Ionicons
                  name={getTabIcon(index)}
                  size={16}
                  color={
                    activeTab === index
                      ? getActiveColor()
                      : isDark
                      ? "rgba(255,255,255,0.6)"
                      : "rgba(0,0,0,0.5)"
                  }
                  style={styles.tabIcon}
                />
                <Text
                  style={[
                    styles.tabText,
                    {
                      color:
                        activeTab === index
                          ? getActiveColor()
                          : isDark
                          ? "rgba(255,255,255,0.6)"
                          : "rgba(0,0,0,0.5)",
                    },
                  ]}
                >
                  {tab}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <Animated.View
            style={[
              styles.tabIndicator,
              {
                backgroundColor: activeColor,
                width: (width - 32) / TABS.length,
              },
              tabIndicatorStyle,
            ]}
          />
        </View>

        {/* Current value and description */}
        <View style={styles.currentValueContainer}>
          <View style={styles.valueContainer}>
            <Text style={[styles.currentValue, { color: activeColor }]}>
              {currentValue}
              {unit}
            </Text>
            <Text
              style={[
                styles.valueDescription,
                { color: isDark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.6)" },
              ]}
            >
              {getDescription()}
            </Text>
          </View>

          <View
            style={[
              styles.iconContainer,
              { backgroundColor: `${activeColor}20` },
            ]}
          >
            <Ionicons
              name={getTabIcon(activeTab)}
              size={32}
              color={activeColor}
            />
          </View>
        </View>

        {/* Chart */}
        <View style={styles.chartContainer}>
          <LineChart
            data={chartData}
            width={width - 64}
            height={180}
            chartConfig={{
              backgroundColor: "transparent",
              backgroundGradientFrom: "transparent",
              backgroundGradientTo: "transparent",
              decimalPlaces: 0,
              color: () => activeColor,
              labelColor: () =>
                isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)",
              style: {
                borderRadius: 16,
              },
              propsForDots: {
                r: "5",
                strokeWidth: "2",
                stroke: activeColor,
              },
            }}
            bezier
            style={styles.chart}
            withInnerLines={false}
            withOuterLines={false}
            withVerticalLines={false}
            formatYLabel={(value) => `${value}${unit}`}
          />
        </View>

        <View style={styles.footer}>
          <Text
            style={[
              styles.footerText,
              { color: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)" },
            ]}
          >
            Actualizado a las {format(new Date(), "HH:mm", { locale: es })}
          </Text>
        </View>
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
  title: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
    marginLeft: 4,
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: "500",
  },
  tabsContainer: {
    marginBottom: 16,
    position: "relative",
  },
  tabsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  tab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
    flexDirection: "row",
    justifyContent: "center",
  },
  tabIcon: {
    marginRight: 4,
  },
  activeTab: {
    // Styling handled by text and indicator
  },
  tabText: {
    fontSize: 13,
    fontWeight: "600",
  },
  tabIndicator: {
    height: 3,
    borderRadius: 1.5,
    position: "absolute",
    bottom: 0,
    left: 0,
  },
  currentValueContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  valueContainer: {
    flex: 1,
  },
  currentValue: {
    fontSize: 36,
    fontWeight: "700",
  },
  valueDescription: {
    fontSize: 16,
    fontWeight: "500",
    marginTop: 4,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  chartContainer: {
    alignItems: "center",
    marginTop: 10,
  },
  chart: {
    borderRadius: 16,
  },
  footer: {
    marginTop: 16,
    alignItems: "center",
  },
  footerText: {
    fontSize: 12,
  },
});
