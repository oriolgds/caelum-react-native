import { useState, useEffect } from "react";
import * as Location from "expo-location";

interface LocationState {
  latitude: number | null;
  longitude: number | null;
  errorMsg: string | null;
  isLoading: boolean;
}

export const useLocation = () => {
  const [location, setLocation] = useState<LocationState>({
    latitude: null,
    longitude: null,
    errorMsg: null,
    isLoading: true,
  });

  useEffect(() => {
    (async () => {
      try {
        // Solicitar permisos de ubicación
        const { status } = await Location.requestForegroundPermissionsAsync();

        if (status !== "granted") {
          setLocation({
            latitude: null,
            longitude: null,
            errorMsg:
              "Se requieren permisos de ubicación para mostrar el clima local",
            isLoading: false,
          });
          return;
        }

        // Obtener la ubicación actual
        const currentLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        setLocation({
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
          errorMsg: null,
          isLoading: false,
        });
      } catch (error) {
        setLocation({
          latitude: null,
          longitude: null,
          errorMsg: "Error al obtener la ubicación",
          isLoading: false,
        });
      }
    })();
  }, []);

  return location;
};
