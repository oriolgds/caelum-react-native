import { Platform } from "react-native";
import * as SQLite from "expo-sqlite";

export const DATABASE_NAME = "caelum.db";

export const DATABASE_VERSION = "1.0";

export const DATABASE_DISPLAY_NAME = "Caelum Database";

export const DATABASE_SIZE = 200000;

export const getDatabase = () => {
  if (Platform.OS === "web") {
    return {
      transaction: () => ({
        executeSql: () => {},
      }),
    };
  }

  const db = SQLite.openDatabase(DATABASE_NAME);
  return db;
};

export const TABLES = {
  LOCATIONS: "locations",
  WEATHER: "weather",
  SETTINGS: "settings",
};

export const INITIAL_SCHEMA = `
  CREATE TABLE IF NOT EXISTS ${TABLES.LOCATIONS} (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    latitude REAL NOT NULL,
    longitude REAL NOT NULL,
    country TEXT,
    state TEXT,
    is_default INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS ${TABLES.WEATHER} (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    location_id INTEGER NOT NULL,
    temperature REAL NOT NULL,
    feels_like REAL NOT NULL,
    humidity INTEGER NOT NULL,
    pressure INTEGER NOT NULL,
    wind_speed REAL NOT NULL,
    wind_deg INTEGER NOT NULL,
    clouds INTEGER NOT NULL,
    visibility INTEGER NOT NULL,
    weather_main TEXT NOT NULL,
    weather_description TEXT NOT NULL,
    weather_icon TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (location_id) REFERENCES ${TABLES.LOCATIONS} (id)
  );

  CREATE TABLE IF NOT EXISTS ${TABLES.SETTINGS} (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT NOT NULL UNIQUE,
    value TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`;
