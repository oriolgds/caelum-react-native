import { useState, useEffect } from "react";
import {
  getCurrentWeather,
  getForecast,
  searchCity,
} from "../services/weatherService";
import { WeatherData, ForecastData } from "../types/weather";

interface WeatherState {
  current: WeatherData | null;
  forecast: ForecastData | null;
  error: string | null;
  isLoading: boolean;
  cityName: string | null;
}

export const useWeather = (
  latitude: number | null,
  longitude: number | null
) => {
  const [weatherState, setWeatherState] = useState<WeatherState>({
    current: null,
    forecast: null,
    error: null,
    isLoading: true,
    cityName: null,
  });

  const fetchWeatherData = async (lat: number, lon: number) => {
    setWeatherState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      // Obtener datos del clima actual y pronóstico en paralelo
      const [currentData, forecastData] = await Promise.all([
        getCurrentWeather(lat, lon),
        getForecast(lat, lon),
      ]);

      setWeatherState({
        current: currentData,
        forecast: forecastData,
        error: null,
        isLoading: false,
        cityName: currentData.name,
      });
    } catch (error) {
      setWeatherState((prev) => ({
        ...prev,
        isLoading: false,
        error: "Error al obtener datos del clima",
      }));
    }
  };

  const searchByCity = async (cityName: string) => {
    setWeatherState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      // Buscar ciudad y obtener coordenadas
      const cityData = await searchCity(cityName);

      // Obtener datos del clima con las coordenadas
      await fetchWeatherData(cityData.lat, cityData.lon);
    } catch (error) {
      setWeatherState((prev) => ({
        ...prev,
        isLoading: false,
        error: "No se encontró la ciudad",
      }));
    }
  };

  // Cargar datos del clima cuando se obtiene la ubicación
  useEffect(() => {
    if (latitude !== null && longitude !== null) {
      fetchWeatherData(latitude, longitude);
    }
  }, [latitude, longitude]);

  return {
    ...weatherState,
    searchByCity,
    refreshWeather: () => {
      if (latitude !== null && longitude !== null) {
        fetchWeatherData(latitude, longitude);
      }
    },
  };
};
