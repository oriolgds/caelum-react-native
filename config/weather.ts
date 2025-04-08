import Constants from "expo-constants";

export const WEATHER_API_KEY = Constants.expoConfig?.extra?.weatherApiKey || "";

export const WEATHER_API_URL = "https://api.openweathermap.org/data/2.5";
export const ONECALL_API_BASE_URL =
  "https://api.openweathermap.org/data/3.0/onecall";
export const AIR_POLLUTION_API_BASE_URL =
  "https://api.openweathermap.org/data/2.5/air_pollution";

export const WEATHER_ICON_URL = "https://openweathermap.org/img/wn";

export const WEATHER_UNITS = {
  metric: {
    temp: "°C",
    windSpeed: "m/s",
    pressure: "hPa",
    visibility: "m",
  },
  imperial: {
    temp: "°F",
    windSpeed: "mph",
    pressure: "hPa",
    visibility: "miles",
  },
};

export const WEATHER_CONDITIONS = {
  "01d": "Despejado",
  "01n": "Despejado",
  "02d": "Parcialmente nublado",
  "02n": "Parcialmente nublado",
  "03d": "Nublado",
  "03n": "Nublado",
  "04d": "Muy nublado",
  "04n": "Muy nublado",
  "09d": "Lluvia ligera",
  "09n": "Lluvia ligera",
  "10d": "Lluvia",
  "10n": "Lluvia",
  "11d": "Tormenta",
  "11n": "Tormenta",
  "13d": "Nieve",
  "13n": "Nieve",
  "50d": "Niebla",
  "50n": "Niebla",
};

export interface WeatherData {
  main: {
    temp: number;
    feels_like: number;
    humidity: number;
    pressure: number;
  };
  wind: {
    speed: number;
    deg: number;
  };
  clouds: {
    all: number;
  };
  visibility: number;
  weather: Array<{
    main: string;
    description: string;
    icon: string;
  }>;
  uvi?: number;
}

export interface AirPollutionData {
  list: Array<{
    main: {
      aqi: number;
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

export interface DetailCardProps {
  title: string;
  value: number | string;
  icon: string;
  units?: string;
  colorScheme: "light" | "dark";
}

export interface AirQualityProps {
  quality?: string;
  index?: number;
  colorScheme: "light" | "dark";
}

export interface UVIndexProps {
  index?: number;
  colorScheme: "light" | "dark";
}

export interface WeatherAlertsProps {
  alerts?: Alert[];
  colorScheme: "light" | "dark";
}

export interface MinuteForecastProps {
  data?: MinuteForecastData[];
  colorScheme: "light" | "dark";
}

const weatherConfig = {
  apiKey: WEATHER_API_KEY,
  apiUrl: WEATHER_API_URL,
  iconUrl: WEATHER_ICON_URL,
  units: WEATHER_UNITS,
  conditions: WEATHER_CONDITIONS,
};

export default weatherConfig;
