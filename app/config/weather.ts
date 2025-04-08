export const WEATHER_API_KEY = "3f6c339889485d99f645d7545d79e52f"; // Reemplaza esto con tu API key real
export const WEATHER_API_BASE_URL = "https://api.openweathermap.org/data/2.5";
export const ONECALL_API_BASE_URL =
  "https://api.openweathermap.org/data/3.0/onecall";
export const AIR_POLLUTION_API_BASE_URL =
  "http://api.openweathermap.org/data/2.5/air_pollution";

// Tipos de datos para las respuestas de la API
export interface WeatherData {
  main: {
    temp: number;
    feels_like: number;
    pressure: number;
    humidity: number;
  };
  weather: Array<{
    id: number;
    main: string;
    description: string;
    icon: string;
  }>;
  wind: {
    speed: number;
    deg: number;
  };
  clouds: {
    all: number;
  };
  visibility: number;
  uvi?: number; // Índice UV
}

export interface AirPollutionData {
  list: Array<{
    main: {
      aqi: number;
    };
    components: {
      co: number;
      no: number;
      no2: number;
      o3: number;
      so2: number;
      pm2_5: number;
      pm10: number;
      nh3: number;
    };
  }>;
}

export interface Alert {
  event: string;
  description: string;
}

export interface MinuteForecastData {
  dt: number;
  precipitation: number;
}

// Tipos para los componentes
export interface DetailCardProps {
  title: string;
  value: string | number;
  icon: string;
  units?: string;
  colorScheme: string;
}

export interface AirQualityProps {
  quality?: string;
  index?: number;
  colorScheme: string;
}

export interface UVIndexProps {
  index?: number;
  colorScheme: string;
}

export interface WeatherAlertsProps {
  alerts: Alert[];
  colorScheme: string;
}

export interface MinuteForecastProps {
  data: MinuteForecastData[];
  colorScheme: string;
}
