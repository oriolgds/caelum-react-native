import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface Location {
  id: string;
  name: string;
  country: string;
  lat: number;
  lon: number;
  isCurrent?: boolean;
}

const STORAGE_KEY = "@caelum_saved_locations";

export const useLocationStorage = () => {
  const [savedLocations, setSavedLocations] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Cargar ubicaciones al iniciar
  useEffect(() => {
    loadSavedLocations();
  }, []);

  // Cargar ubicaciones desde AsyncStorage
  const loadSavedLocations = async () => {
    try {
      setIsLoading(true);
      const locationsJson = await AsyncStorage.getItem(STORAGE_KEY);

      if (locationsJson !== null) {
        const parsedLocations = JSON.parse(locationsJson);
        setSavedLocations(parsedLocations);
      }
    } catch (error) {
      console.error("Error loading saved locations:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Guardar ubicaciones en AsyncStorage
  const saveLocations = async (locations: Location[]) => {
    try {
      const locationsJson = JSON.stringify(locations);
      await AsyncStorage.setItem(STORAGE_KEY, locationsJson);
    } catch (error) {
      console.error("Error saving locations:", error);
    }
  };

  // Añadir una nueva ubicación
  const addLocation = (newLocation: Location) => {
    // Verificar si ya existe
    const exists = savedLocations.some(
      (loc) => loc.lat === newLocation.lat && loc.lon === newLocation.lon
    );

    if (!exists) {
      const updatedLocations = [...savedLocations, newLocation];
      setSavedLocations(updatedLocations);
      saveLocations(updatedLocations);
    }
  };

  // Eliminar una ubicación
  const removeLocation = (locationToRemove: Location) => {
    const updatedLocations = savedLocations.filter(
      (loc) => loc.id !== locationToRemove.id
    );
    setSavedLocations(updatedLocations);
    saveLocations(updatedLocations);
  };

  // Establecer la ubicación actual
  const setCurrentLocation = (location: Location) => {
    const updatedLocations = savedLocations.map((loc) => ({
      ...loc,
      isCurrent: loc.id === location.id,
    }));
    setSavedLocations(updatedLocations);
    saveLocations(updatedLocations);
  };

  // Añadir la ubicación actual si es nueva
  const saveCurrentLocation = (location: {
    name: string;
    country: string;
    lat: number;
    lon: number;
  }) => {
    // Solo guardar ubicación actual si tiene nombre
    if (!location.name) return;

    // Buscar si ya existe
    const exists = savedLocations.some(
      (loc) => loc.lat === location.lat && loc.lon === location.lon
    );

    if (!exists) {
      const newLocation = {
        id: `${location.lat}-${location.lon}`,
        name: location.name,
        country: location.country,
        lat: location.lat,
        lon: location.lon,
        isCurrent: true,
      };

      // Marcamos todas las demás como no actuales
      const updatedLocations = savedLocations.map((loc) => ({
        ...loc,
        isCurrent: false,
      }));

      const finalLocations = [...updatedLocations, newLocation];
      setSavedLocations(finalLocations);
      saveLocations(finalLocations);
    } else {
      // Si ya existe, solo establecerla como actual
      const updatedLocations = savedLocations.map((loc) => ({
        ...loc,
        isCurrent: loc.lat === location.lat && loc.lon === location.lon,
      }));

      setSavedLocations(updatedLocations);
      saveLocations(updatedLocations);
    }
  };

  return {
    savedLocations,
    isLoading,
    addLocation,
    removeLocation,
    setCurrentLocation,
    saveCurrentLocation,
    refresh: loadSavedLocations,
  };
};
