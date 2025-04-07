import { OPENWEATHER_API_BASE_URL, OPENWEATHER_API_KEY } from '../constants/Weather';
import { ForecastData, WeatherData } from '../types/weather';

/**
 * Obtiene el clima actual para una ubicación específica
 * @param lat Latitud
 * @param lon Longitud
 * @returns Datos del clima actual
 */
export const getCurrentWeather = async (lat: number, lon: number): Promise<WeatherData> => {
  try {
    const response = await fetch(
      `${OPENWEATHER_API_BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric&lang=es`
    );
    
    if (!response.ok) {
      throw new Error('Error al obtener datos del clima');
    }
    
    const data = await response.json();
    return data as WeatherData;
  } catch (error) {
    console.error('Error en getCurrentWeather:', error);
    throw error;
  }
};

/**
 * Obtiene el pronóstico para los próximos 5 días
 * @param lat Latitud
 * @param lon Longitud
 * @returns Datos del pronóstico
 */
export const getForecast = async (lat: number, lon: number): Promise<ForecastData> => {
  try {
    const response = await fetch(
      `${OPENWEATHER_API_BASE_URL}/forecast?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric&lang=es`
    );
    
    if (!response.ok) {
      throw new Error('Error al obtener datos del pronóstico');
    }
    
    const data = await response.json();
    return data as ForecastData;
  } catch (error) {
    console.error('Error en getForecast:', error);
    throw error;
  }
};

/**
 * Busca una ciudad por nombre
 * @param cityName Nombre de la ciudad
 * @returns Ubicación (latitud, longitud) de la ciudad
 */
export const searchCity = async (cityName: string): Promise<{name: string, lat: number, lon: number, country: string}> => {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${OPENWEATHER_API_KEY}`
    );
    
    if (!response.ok) {
      throw new Error('Error al buscar ciudad');
    }
    
    const data = await response.json();
    if (data.length === 0) {
      throw new Error('Ciudad no encontrada');
    }
    
    const { name, lat, lon, country } = data[0];
    return { name, lat, lon, country };
  } catch (error) {
    console.error('Error en searchCity:', error);
    throw error;
  }
}; 