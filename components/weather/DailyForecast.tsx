import React, { useMemo } from "react";
import { StyleSheet, Text, View, Dimensions } from "react-native";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { BlurView } from "expo-blur";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
  Extrapolate,
} from "react-native-reanimated";
import { ForecastData } from "../../types/weather";
import { WeatherIcon } from "./WeatherIcon";
import { Colors } from "../../constants/Colors";
import { useColorScheme } from "../../hooks/useColorScheme";
import Svg, { Line, Circle } from "react-native-svg";

interface DailyForecastProps {
  forecastData: ForecastData;
  isLoading?: boolean;
}

export const DailyForecast: React.FC<DailyForecastProps> = ({
  forecastData,
  isLoading = false,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const animationProgress = useSharedValue(0);

  // Crear un solo estilo animado compartido
  const baseAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      animationProgress.value,
      [0, 1],
      [0.6, 1],
      Extrapolate.CLAMP
    );

    const translateY = interpolate(
      animationProgress.value,
      [0, 1],
      [20, 0],
      Extrapolate.CLAMP
    );

    return {
      opacity,
      transform: [{ translateY }, { scale: opacity }],
    };
  });

  React.useEffect(() => {
    if (!isLoading) {
      animationProgress.value = withSpring(1, {
        damping: 15,
        stiffness: 100,
      });
    }
  }, [isLoading]);

  // Crear los datos diarios usando useMemo para mejorar el rendimiento
  const dailyData = useMemo(() => {
    if (!forecastData?.list) return [];

    return forecastData.list
      .reduce((acc: any[], curr) => {
        const date = new Date(curr.dt * 1000);
        const dayKey = format(date, "yyyy-MM-dd");

        if (
          !acc.find(
            (item) => format(new Date(item.dt * 1000), "yyyy-MM-dd") === dayKey
          )
        ) {
          acc.push(curr);
        }

        return acc;
      }, [])
      .slice(0, 5);
  }, [forecastData]);

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
          <Text
            style={[
              styles.title,
              { color: isDark ? Colors.dark.text : Colors.light.text },
            ]}
          >
            Próximos días
          </Text>
          <Text
            style={[
              styles.loadingText,
              { color: isDark ? Colors.dark.text : Colors.light.text },
            ]}
          >
            Cargando...
          </Text>
        </BlurView>
      </View>
    );
  }

  // Calcular temperaturas máximas y mínimas una sola vez
  const { maxTemp, minTemp, tempRange } = useMemo(() => {
    const temps = dailyData.map((day) => day.main.temp);
    const max = Math.max(...temps);
    const min = Math.min(...temps);
    return {
      maxTemp: max,
      minTemp: min,
      tempRange: max - min,
    };
  }, [dailyData]);

  const renderDayForecast = (day: any, index: number) => {
    const date = new Date(day.dt * 1000);
    const isToday =
      format(date, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");
    const dayName = format(date, isToday ? "'Hoy'" : "EEEE", { locale: es });
    const temp = Math.round(day.main.temp);
    const tempMin = Math.round(day.main.temp_min);
    const tempMax = Math.round(day.main.temp_max);
    const tempProgress = (temp - minTemp) / tempRange;

    return (
      <Animated.View
        key={day.dt}
        style={[
          styles.dayContainer,
          baseAnimatedStyle,
          {
            backgroundColor: isToday
              ? isDark
                ? "rgba(255,255,255,0.1)"
                : "rgba(0,0,0,0.05)"
              : "transparent",
          },
        ]}
      >
        <Text
          style={[
            styles.dayText,
            {
              color: isDark ? Colors.dark.text : Colors.light.text,
              fontWeight: isToday ? "600" : "400",
            },
          ]}
        >
          {dayName}
        </Text>

        <WeatherIcon
          iconCode={day.weather[0].icon}
          size="small"
          showBackground={isToday}
        />

        <View style={styles.tempContainer}>
          <Text
            style={[
              styles.tempText,
              { color: isDark ? Colors.dark.text : Colors.light.text },
            ]}
          >
            {tempMin}° - {tempMax}°
          </Text>

          <View style={styles.tempBar}>
            <View
              style={[
                styles.tempProgress,
                {
                  width: `${tempProgress * 100}%`,
                  backgroundColor: isDark ? "#fff" : "#000",
                },
              ]}
            />
          </View>
        </View>
      </Animated.View>
    );
  };

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
          Próximos días
        </Text>

        <View style={styles.daysContainer}>
          {dailyData.map((day, index) => renderDayForecast(day, index))}
        </View>
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    alignItems: "center",
    marginTop: 16,
    paddingHorizontal: 16,
    marginBottom: 32,
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
  daysContainer: {
    width: "100%",
  },
  dayContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginBottom: 8,
  },
  dayText: {
    width: 100,
    fontSize: 16,
    textTransform: "capitalize",
  },
  tempContainer: {
    flex: 1,
    marginLeft: 12,
  },
  tempText: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 6,
  },
  tempBar: {
    height: 4,
    backgroundColor: "rgba(128,128,128,0.2)",
    borderRadius: 2,
    overflow: "hidden",
  },
  tempProgress: {
    height: "100%",
    borderRadius: 2,
    opacity: 0.8,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: "500",
    marginVertical: 20,
    textAlign: "center",
  },
});
