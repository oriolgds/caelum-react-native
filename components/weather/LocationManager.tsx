import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Modal,
  FlatList,
  TextInput,
  Animated as RNAnimated,
  Easing as RNEasing,
  Dimensions,
  Alert,
} from "react-native";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  runOnJS,
  interpolate,
  Extrapolate,
} from "react-native-reanimated";
import { PanGestureHandler } from "react-native-gesture-handler";

import { useColorScheme } from "../../hooks/useColorScheme";
import { Colors } from "../../constants/Colors";
import { searchCity } from "../../services/weatherService";
import { useLocationStorage } from "../../hooks/useLocationStorage";

const { width, height } = Dimensions.get("window");

const MAX_SAVED_LOCATIONS = 5;

interface Location {
  id: string;
  name: string;
  country: string;
  lat: number;
  lon: number;
  isCurrent?: boolean;
}

interface LocationManagerProps {
  currentLocation: {
    latitude: number | null;
    longitude: number | null;
    cityName: string | null;
    country?: string;
  };
  onLocationChange: (lat: number, lon: number) => void;
}

export const LocationManager: React.FC<LocationManagerProps> = ({
  currentLocation,
  onLocationChange,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const insets = useSafeAreaInsets();
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Location[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Localizaciones guardadas
  const { savedLocations, addLocation, removeLocation, setCurrentLocation } =
    useLocationStorage();

  // Animaciones
  const fadeAnim = useRef(new RNAnimated.Value(0)).current;
  const translateY = useRef(new RNAnimated.Value(height)).current;
  const modalOpacity = useSharedValue(0);
  const modalTranslateY = useSharedValue(height);

  // Valores para gestos
  const startY = useSharedValue(0);
  const offsetY = useSharedValue(0);
  const locationSlideAnim = useSharedValue(0);
  const currentIndex = useRef(0);

  useEffect(() => {
    // Animar entrada cuando hay una ubicación actual
    if (currentLocation.latitude && currentLocation.longitude) {
      RNAnimated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [currentLocation]);

  const handleSearch = async () => {
    if (searchQuery.trim().length < 2) {
      setError("Introduce al menos 2 caracteres");
      return;
    }

    setIsSearching(true);
    setError(null);

    try {
      const result = await searchCity(searchQuery);

      // Crear ubicación a partir de los resultados
      const location = {
        id: `${result.lat}-${result.lon}`,
        name: result.name,
        country: result.country,
        lat: result.lat,
        lon: result.lon,
      };

      setSearchResults([location]);
    } catch (error) {
      console.error("Error searching city:", error);
      setError("No se encontró la ciudad. Intenta con otro nombre.");
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddLocation = (location: Location) => {
    if (savedLocations.length >= MAX_SAVED_LOCATIONS) {
      Alert.alert(
        "Límite alcanzado",
        `Solo puedes guardar ${MAX_SAVED_LOCATIONS} ubicaciones. Elimina alguna para añadir más.`,
        [{ text: "Entendido" }]
      );
      return;
    }

    addLocation(location);
    setSearchResults([]);
    setSearchQuery("");
  };

  const handleSelectLocation = (location: Location) => {
    setCurrentLocation(location);
    onLocationChange(location.lat, location.lon);
    closeModal();
  };

  const openModal = () => {
    setModalVisible(true);
    modalOpacity.value = withTiming(1, { duration: 300 });
    modalTranslateY.value = withSpring(0, { damping: 20 });
  };

  const closeModal = () => {
    modalOpacity.value = withTiming(0, { duration: 300 });
    modalTranslateY.value = withTiming(height, { duration: 300 }, () => {
      runOnJS(setModalVisible)(false);
    });
    setSearchResults([]);
    setSearchQuery("");
    setError(null);
  };

  const handleSwipeUp = () => {
    if (currentIndex.current < savedLocations.length - 1) {
      currentIndex.current += 1;
      const nextLocation = savedLocations[currentIndex.current];
      locationSlideAnim.value = withSpring(-100, { damping: 15 }, () => {
        locationSlideAnim.value = withTiming(0, { duration: 300 });
        runOnJS(onLocationChange)(nextLocation.lat, nextLocation.lon);
      });
    }
  };

  const handleSwipeDown = () => {
    if (currentIndex.current > 0) {
      currentIndex.current -= 1;
      const prevLocation = savedLocations[currentIndex.current];
      locationSlideAnim.value = withSpring(100, { damping: 15 }, () => {
        locationSlideAnim.value = withTiming(0, { duration: 300 });
        runOnJS(onLocationChange)(prevLocation.lat, prevLocation.lon);
      });
    }
  };

  const locationAnimStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: locationSlideAnim.value }],
      opacity: interpolate(
        Math.abs(locationSlideAnim.value),
        [0, 100],
        [1, 0.5],
        Extrapolate.CLAMP
      ),
    };
  });

  const modalContainerStyle = useAnimatedStyle(() => {
    return {
      opacity: modalOpacity.value,
    };
  });

  const modalContentStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: modalTranslateY.value }],
    };
  });

  const renderLocationItem = ({ item }: { item: Location }) => {
    // Comprobar si la ubicación ya está guardada
    const isAlreadySaved = savedLocations.some(
      (loc) => loc.lat === item.lat && loc.lon === item.lon
    );

    const isCurrent =
      item.lat === currentLocation.latitude &&
      item.lon === currentLocation.longitude;

    return (
      <Animated.View
        style={[
          styles.locationItem,
          {
            backgroundColor: isDark
              ? "rgba(255,255,255,0.1)"
              : "rgba(0,0,0,0.05)",
          },
        ]}
      >
        <TouchableOpacity
          style={styles.locationInfo}
          onPress={() => handleSelectLocation(item)}
        >
          <Ionicons
            name={isCurrent ? "location" : "location-outline"}
            size={20}
            color={
              isCurrent
                ? "#4fc3f7"
                : isDark
                ? Colors.dark.text
                : Colors.light.text
            }
          />
          <View style={styles.locationTextContainer}>
            <Text
              style={[
                styles.locationName,
                { color: isDark ? Colors.dark.text : Colors.light.text },
              ]}
            >
              {item.name}
            </Text>
            <Text
              style={[
                styles.locationCountry,
                {
                  color: isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)",
                },
              ]}
            >
              {item.country}
            </Text>
          </View>
        </TouchableOpacity>

        {!isAlreadySaved ? (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleAddLocation(item)}
          >
            <Ionicons
              name="add-circle-outline"
              size={24}
              color={isDark ? "#4fc3f7" : "#0277bd"}
            />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.actionButton, { opacity: 0.5 }]}
            disabled={true}
          >
            <Ionicons
              name="checkmark-circle-outline"
              size={24}
              color={isDark ? Colors.dark.text : Colors.light.text}
            />
          </TouchableOpacity>
        )}
      </Animated.View>
    );
  };

  const renderSavedLocationItem = ({ item }: { item: Location }) => {
    const isCurrent =
      item.lat === currentLocation.latitude &&
      item.lon === currentLocation.longitude;

    return (
      <Animated.View
        style={[
          styles.savedLocationItem,
          {
            backgroundColor: isCurrent
              ? isDark
                ? "rgba(79,195,247,0.2)"
                : "rgba(2,119,189,0.1)"
              : isDark
              ? "rgba(255,255,255,0.1)"
              : "rgba(0,0,0,0.05)",
            borderColor: isCurrent
              ? isDark
                ? "#4fc3f7"
                : "#0277bd"
              : "transparent",
          },
        ]}
      >
        <TouchableOpacity
          style={styles.locationInfo}
          onPress={() => handleSelectLocation(item)}
        >
          <Ionicons
            name={isCurrent ? "location" : "location-outline"}
            size={20}
            color={
              isCurrent
                ? isDark
                  ? "#4fc3f7"
                  : "#0277bd"
                : isDark
                ? Colors.dark.text
                : Colors.light.text
            }
          />
          <View style={styles.locationTextContainer}>
            <Text
              style={[
                styles.locationName,
                { color: isDark ? Colors.dark.text : Colors.light.text },
              ]}
            >
              {item.name}
            </Text>
            <Text
              style={[
                styles.locationCountry,
                {
                  color: isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)",
                },
              ]}
            >
              {item.country}
            </Text>
          </View>
        </TouchableOpacity>

        {!item.isCurrent && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => removeLocation(item)}
          >
            <Ionicons
              name="trash-outline"
              size={20}
              color={isDark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.7)"}
            />
          </TouchableOpacity>
        )}
      </Animated.View>
    );
  };

  return (
    <>
      <PanGestureHandler
        onGestureEvent={({ nativeEvent }) => {
          // Detectar deslizamiento vertical
          if (nativeEvent.translationY < -50) {
            handleSwipeUp();
          } else if (nativeEvent.translationY > 50) {
            handleSwipeDown();
          }
        }}
      >
        <Animated.View style={[styles.container, locationAnimStyle]}>
          <RNAnimated.View style={{ opacity: fadeAnim }}>
            {currentLocation.cityName ? (
              <TouchableOpacity
                style={styles.locationButton}
                onPress={openModal}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="location-sharp"
                  size={20}
                  color={isDark ? "#4fc3f7" : "#0277bd"}
                  style={styles.locationIcon}
                />
                <Text
                  style={[
                    styles.locationText,
                    { color: isDark ? Colors.dark.text : Colors.light.text },
                  ]}
                  numberOfLines={1}
                >
                  {currentLocation.cityName}
                  {currentLocation.country
                    ? `, ${currentLocation.country}`
                    : ""}
                </Text>
                <Ionicons
                  name="chevron-down"
                  size={16}
                  color={isDark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.7)"}
                />
              </TouchableOpacity>
            ) : (
              <View style={styles.loadingLocation}>
                <Ionicons
                  name="location-outline"
                  size={18}
                  color={isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)"}
                  style={styles.locationIcon}
                />
                <Text
                  style={[
                    styles.loadingText,
                    {
                      color: isDark
                        ? "rgba(255,255,255,0.5)"
                        : "rgba(0,0,0,0.5)",
                    },
                  ]}
                >
                  Obteniendo ubicación...
                </Text>
              </View>
            )}

            {savedLocations.length > 1 && (
              <View style={styles.paginationContainer}>
                {savedLocations.map((_, index) => (
                  <View
                    key={index}
                    style={[
                      styles.paginationDot,
                      {
                        backgroundColor:
                          index === currentIndex.current
                            ? isDark
                              ? "#4fc3f7"
                              : "#0277bd"
                            : isDark
                            ? "rgba(255,255,255,0.3)"
                            : "rgba(0,0,0,0.2)",
                      },
                    ]}
                  />
                ))}
              </View>
            )}
          </RNAnimated.View>
        </Animated.View>
      </PanGestureHandler>

      <Modal
        visible={modalVisible}
        animationType="none"
        transparent={true}
        onRequestClose={closeModal}
      >
        <Animated.View style={[styles.modalOverlay, modalContainerStyle]}>
          <TouchableOpacity
            style={styles.dismissOverlay}
            activeOpacity={1}
            onPress={closeModal}
          />
          <Animated.View
            style={[
              styles.modalContent,
              modalContentStyle,
              { paddingBottom: insets.bottom > 0 ? insets.bottom : 20 },
            ]}
          >
            <BlurView
              tint={isDark ? "dark" : "light"}
              intensity={isDark ? 90 : 95}
              style={styles.modalBlur}
            >
              <View style={styles.modalHandle} />

              <Text
                style={[
                  styles.modalTitle,
                  { color: isDark ? Colors.dark.text : Colors.light.text },
                ]}
              >
                Gestionar ubicaciones
              </Text>

              <View
                style={[
                  styles.searchContainer,
                  {
                    backgroundColor: isDark
                      ? "rgba(255,255,255,0.1)"
                      : "rgba(0,0,0,0.05)",
                  },
                ]}
              >
                <Ionicons
                  name="search"
                  size={18}
                  color={isDark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.7)"}
                />
                <TextInput
                  style={[
                    styles.searchInput,
                    { color: isDark ? Colors.dark.text : Colors.light.text },
                  ]}
                  placeholder="Buscar ciudad..."
                  placeholderTextColor={
                    isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)"
                  }
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  returnKeyType="search"
                  onSubmitEditing={handleSearch}
                  autoCapitalize="words"
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity
                    onPress={() => setSearchQuery("")}
                    style={styles.clearButton}
                  >
                    <Ionicons
                      name="close-circle"
                      size={18}
                      color={
                        isDark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.7)"
                      }
                    />
                  </TouchableOpacity>
                )}
              </View>

              {error && <Text style={styles.errorText}>{error}</Text>}

              {isSearching && (
                <View style={styles.loadingContainer}>
                  <Text
                    style={[
                      styles.loadingText,
                      {
                        color: isDark
                          ? "rgba(255,255,255,0.7)"
                          : "rgba(0,0,0,0.7)",
                      },
                    ]}
                  >
                    Buscando...
                  </Text>
                </View>
              )}

              {searchResults.length > 0 && (
                <View style={styles.sectionContainer}>
                  <Text
                    style={[
                      styles.sectionTitle,
                      {
                        color: isDark
                          ? "rgba(255,255,255,0.7)"
                          : "rgba(0,0,0,0.7)",
                      },
                    ]}
                  >
                    Resultados de búsqueda
                  </Text>
                  <FlatList
                    data={searchResults}
                    renderItem={renderLocationItem}
                    keyExtractor={(item) => item.id}
                    style={styles.locationList}
                  />
                </View>
              )}

              {savedLocations.length > 0 && (
                <View style={styles.sectionContainer}>
                  <Text
                    style={[
                      styles.sectionTitle,
                      {
                        color: isDark
                          ? "rgba(255,255,255,0.7)"
                          : "rgba(0,0,0,0.7)",
                      },
                    ]}
                  >
                    Ubicaciones guardadas
                  </Text>
                  <FlatList
                    data={savedLocations}
                    renderItem={renderSavedLocationItem}
                    keyExtractor={(item) => item.id}
                    style={styles.locationList}
                  />
                </View>
              )}

              <Text
                style={[
                  styles.hintText,
                  {
                    color: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)",
                  },
                ]}
              >
                Desliza verticalmente en la pantalla principal para cambiar
                entre tus ubicaciones guardadas.
              </Text>

              <TouchableOpacity
                style={[
                  styles.closeButton,
                  {
                    backgroundColor: isDark
                      ? "rgba(255,255,255,0.1)"
                      : "rgba(0,0,0,0.05)",
                  },
                ]}
                onPress={closeModal}
              >
                <Text
                  style={[
                    styles.closeButtonText,
                    { color: isDark ? Colors.dark.text : Colors.light.text },
                  ]}
                >
                  Cerrar
                </Text>
              </TouchableOpacity>
            </BlurView>
          </Animated.View>
        </Animated.View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    alignItems: "center",
    paddingTop: 15,
  },
  locationButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  locationIcon: {
    marginRight: 6,
  },
  locationText: {
    fontSize: 16,
    fontWeight: "600",
    marginRight: 4,
    maxWidth: 200,
  },
  loadingLocation: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
  },
  loadingText: {
    fontSize: 14,
    fontWeight: "500",
  },
  paginationContainer: {
    flexDirection: "row",
    marginTop: 10,
    justifyContent: "center",
  },
  paginationDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginHorizontal: 3,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  dismissOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContent: {
    width: "100%",
    maxHeight: height * 0.8,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: "hidden",
  },
  modalBlur: {
    flex: 1,
    paddingTop: 12,
    paddingHorizontal: 16,
  },
  modalHandle: {
    width: 36,
    height: 5,
    borderRadius: 3,
    backgroundColor: "rgba(150,150,150,0.3)",
    alignSelf: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 16,
    textAlign: "center",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderRadius: 12,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingHorizontal: 8,
  },
  clearButton: {
    padding: 4,
  },
  sectionContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 10,
    marginLeft: 4,
  },
  locationList: {
    maxHeight: 250,
  },
  locationItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 16,
    padding: 12,
    marginBottom: 8,
  },
  savedLocationItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 16,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
  },
  locationInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  locationTextContainer: {
    marginLeft: 8,
  },
  locationName: {
    fontSize: 16,
    fontWeight: "500",
  },
  locationCountry: {
    fontSize: 13,
    marginTop: 2,
  },
  actionButton: {
    padding: 6,
  },
  errorText: {
    color: "#f44336",
    marginBottom: 16,
    textAlign: "center",
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  hintText: {
    fontSize: 12,
    textAlign: "center",
    marginTop: 16,
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  closeButton: {
    alignItems: "center",
    justifyContent: "center",
    padding: 14,
    borderRadius: 16,
    marginTop: 8,
    marginBottom: 8,
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
