import React, { useEffect } from "react";
import { StyleSheet, View, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  withDelay,
  Easing,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";

import { WeatherData } from "../../types/weather";
import { useColorScheme } from "../../hooks/useColorScheme";

interface AnimatedWeatherBackgroundProps {
  weatherData: WeatherData | null;
  isLoading?: boolean;
}

const { width, height } = Dimensions.get("window");

export const AnimatedWeatherBackground: React.FC<
  AnimatedWeatherBackgroundProps
> = ({ weatherData, isLoading = false }) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  // Animación valores
  const sunPosition = useSharedValue({ x: width * 0.7, y: height * 0.2 });
  const cloudOpacity1 = useSharedValue(0);
  const cloudOpacity2 = useSharedValue(0);
  const cloudPosition1 = useSharedValue({ x: -width * 0.2, y: height * 0.3 });
  const cloudPosition2 = useSharedValue({ x: width * 1.2, y: height * 0.15 });
  const rainOpacity = useSharedValue(0);
  const snowOpacity = useSharedValue(0);
  const thunderOpacity = useSharedValue(0);
  const fogOpacity = useSharedValue(0);

  // Establecer animaciones según el clima
  useEffect(() => {
    if (!weatherData || isLoading) return;

    const weatherIcon = weatherData.weather[0].icon;
    const weatherIconType = weatherIcon.substring(0, 2); // 01, 02, 03, etc.

    // Reset all animations
    cloudOpacity1.value = 0;
    cloudOpacity2.value = 0;
    rainOpacity.value = 0;
    snowOpacity.value = 0;
    thunderOpacity.value = 0;
    fogOpacity.value = 0;

    // Start specific animations based on weather
    switch (weatherIconType) {
      case "01": // Clear sky
        sunPosition.value = withTiming(
          { x: width * 0.7, y: height * 0.2 },
          { duration: 1000, easing: Easing.out(Easing.ease) }
        );
        break;

      case "02": // Few clouds
        sunPosition.value = withTiming(
          { x: width * 0.7, y: height * 0.2 },
          { duration: 1000 }
        );
        cloudOpacity1.value = withTiming(0.7, { duration: 1000 });
        cloudPosition1.value = withTiming(
          { x: width * 0.3, y: height * 0.3 },
          { duration: 1500 }
        );
        break;

      case "03": // Scattered clouds
      case "04": // Broken clouds
        cloudOpacity1.value = withTiming(0.8, { duration: 800 });
        cloudOpacity2.value = withTiming(0.7, { duration: 1200 });
        cloudPosition1.value = withTiming(
          { x: width * 0.3, y: height * 0.3 },
          { duration: 1500 }
        );
        cloudPosition2.value = withTiming(
          { x: width * 0.6, y: height * 0.2 },
          { duration: 1800 }
        );
        break;

      case "09": // Shower rain
      case "10": // Rain
        cloudOpacity1.value = withTiming(0.9, { duration: 800 });
        cloudPosition1.value = withTiming(
          { x: width * 0.5, y: height * 0.25 },
          { duration: 1000 }
        );
        rainOpacity.value = withDelay(800, withTiming(0.7, { duration: 500 }));
        break;

      case "11": // Thunderstorm
        cloudOpacity1.value = withTiming(0.9, { duration: 800 });
        cloudPosition1.value = withTiming(
          { x: width * 0.5, y: height * 0.25 },
          { duration: 1000 }
        );
        thunderOpacity.value = withDelay(
          1000,
          withRepeat(
            withSequence(
              withTiming(0.9, { duration: 100 }),
              withTiming(0.4, { duration: 100 }),
              withTiming(0.8, { duration: 100 }),
              withTiming(0.3, { duration: 100 })
            ),
            -1,
            true
          )
        );
        rainOpacity.value = withDelay(800, withTiming(0.6, { duration: 500 }));
        break;

      case "13": // Snow
        cloudOpacity1.value = withTiming(0.8, { duration: 800 });
        cloudPosition1.value = withTiming(
          { x: width * 0.5, y: height * 0.25 },
          { duration: 1000 }
        );
        snowOpacity.value = withDelay(800, withTiming(0.8, { duration: 500 }));
        break;

      case "50": // Mist/fog
        fogOpacity.value = withTiming(0.7, { duration: 1500 });
        break;

      default:
        // Default animation for unknown weather conditions
        sunPosition.value = withTiming(
          { x: width * 0.7, y: height * 0.2 },
          { duration: 1000 }
        );
    }
  }, [weatherData, isLoading]);

  // Determine background colors
  const getBackgroundColors = () => {
    if (!weatherData || !weatherData.weather[0]) {
      return isDark ? ["#1c1c1e", "#2c2c2e"] : ["#f2f2f7", "#e5e5ea"];
    }

    const weatherIcon = weatherData.weather[0].icon;

    // Extract background color based on current weather and generate a gradient
    if (weatherIcon.includes("n")) {
      // Night colors
      return ["#191970", "#000033"];
    } else {
      // Day colors based on weather
      switch (weatherIcon.substring(0, 2)) {
        case "01": // Clear
          return ["#87CEEB", "#1E90FF"];
        case "02": // Few clouds
        case "03": // Scattered clouds
          return ["#87CEEB", "#778899"];
        case "04": // Broken clouds
          return ["#778899", "#708090"];
        case "09": // Shower rain
        case "10": // Rain
          return ["#4682B4", "#483D8B"];
        case "11": // Thunderstorm
          return ["#2F4F4F", "#191970"];
        case "13": // Snow
          return ["#B0C4DE", "#4682B4"];
        case "50": // Mist
          return ["#A9A9A9", "#778899"];
        default:
          return isDark ? ["#1c1c1e", "#2c2c2e"] : ["#f2f2f7", "#e5e5ea"];
      }
    }
  };

  // Animated styles
  const sunAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: sunPosition.value.x },
        { translateY: sunPosition.value.y },
      ],
    };
  });

  const cloud1AnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: cloudOpacity1.value,
      transform: [
        { translateX: cloudPosition1.value.x },
        { translateY: cloudPosition1.value.y },
      ],
    };
  });

  const cloud2AnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: cloudOpacity2.value,
      transform: [
        { translateX: cloudPosition2.value.x },
        { translateY: cloudPosition2.value.y },
      ],
    };
  });

  const rainAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: rainOpacity.value,
    };
  });

  const snowAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: snowOpacity.value,
    };
  });

  const thunderAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: thunderOpacity.value,
    };
  });

  const fogAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: fogOpacity.value,
    };
  });

  // Render weather elements
  const renderSun = () => {
    return (
      <Animated.View style={[styles.sun, sunAnimatedStyle]}>
        <View style={styles.sunInner} />
      </Animated.View>
    );
  };

  const renderClouds = () => {
    return (
      <>
        <Animated.View style={[styles.cloud, cloud1AnimatedStyle]}>
          <View style={styles.cloudShape}>
            <Ionicons name="cloud" size={100} color="white" />
          </View>
        </Animated.View>

        <Animated.View style={[styles.cloud, cloud2AnimatedStyle]}>
          <View style={styles.cloudShape}>
            <Ionicons name="cloud" size={80} color="white" />
          </View>
        </Animated.View>
      </>
    );
  };

  const renderRain = () => {
    return (
      <Animated.View style={[styles.rainContainer, rainAnimatedStyle]}>
        <View style={styles.rainDropsContainer}>
          {Array.from({ length: 40 }).map((_, i) => (
            <View
              key={`rain-${i}`}
              style={[
                styles.rainDrop,
                {
                  left: 10 + (i % 10) * 35,
                  top: 10 + Math.floor(i / 10) * 40,
                  height: 15 + Math.random() * 10,
                },
              ]}
            />
          ))}
        </View>
      </Animated.View>
    );
  };

  const renderSnow = () => {
    return (
      <Animated.View style={[styles.snowContainer, snowAnimatedStyle]}>
        <View style={styles.snowflakesContainer}>
          {Array.from({ length: 30 }).map((_, i) => (
            <View
              key={`snow-${i}`}
              style={[
                styles.snowflake,
                {
                  left: 20 + (i % 10) * 35,
                  top: 20 + Math.floor(i / 10) * 40,
                },
              ]}
            />
          ))}
        </View>
      </Animated.View>
    );
  };

  const renderThunder = () => {
    return (
      <Animated.View style={[styles.thunderContainer, thunderAnimatedStyle]}>
        <Ionicons name="flash" size={60} color="#ffeb3b" />
      </Animated.View>
    );
  };

  const renderFog = () => {
    return (
      <Animated.View style={[styles.fogContainer, fogAnimatedStyle]}>
        <View style={styles.fogBars}>
          {Array.from({ length: 8 }).map((_, i) => (
            <View
              key={`fog-${i}`}
              style={[
                styles.fogBar,
                {
                  top: 20 + i * 25,
                  opacity: i % 2 === 0 ? 0.7 : 0.4,
                },
              ]}
            />
          ))}
        </View>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={getBackgroundColors()}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      />

      {/* Weather elements */}
      {renderSun()}
      {renderClouds()}
      {renderRain()}
      {renderSnow()}
      {renderThunder()}
      {renderFog()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: -1,
  },
  sun: {
    position: "absolute",
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255,255,190,0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  sunInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#FFD700",
  },
  cloud: {
    position: "absolute",
  },
  cloudShape: {
    opacity: 0.9,
  },
  rainContainer: {
    position: "absolute",
    top: height * 0.3,
    left: 0,
    right: 0,
    height: height * 0.3,
  },
  rainDropsContainer: {
    width: "100%",
    height: "100%",
  },
  rainDrop: {
    position: "absolute",
    width: 2,
    backgroundColor: "#82b1ff",
    borderRadius: 1,
  },
  snowContainer: {
    position: "absolute",
    top: height * 0.3,
    left: 0,
    right: 0,
    height: height * 0.3,
  },
  snowflakesContainer: {
    width: "100%",
    height: "100%",
  },
  snowflake: {
    position: "absolute",
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "white",
  },
  thunderContainer: {
    position: "absolute",
    top: height * 0.25,
    left: width * 0.45,
  },
  fogContainer: {
    position: "absolute",
    top: height * 0.2,
    left: 0,
    right: 0,
    height: height * 0.5,
  },
  fogBars: {
    width: "100%",
    height: "100%",
  },
  fogBar: {
    position: "absolute",
    left: 10,
    right: 20,
    height: 8,
    borderRadius: 4,
    backgroundColor: "white",
  },
});
