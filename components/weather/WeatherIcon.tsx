import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { weatherConditions } from '../../constants/Weather';

interface WeatherIconProps {
  iconCode: string;
  size?: 'small' | 'medium' | 'large';
  showBackground?: boolean;
}

export const WeatherIcon: React.FC<WeatherIconProps> = ({ 
  iconCode, 
  size = 'medium',
  showBackground = false 
}) => {
  // Usar el código para obtener la condición climática
  const weatherInfo = weatherConditions[iconCode] || { 
    label: 'Desconocido', 
    icon: '❓', 
    color: '#FFFFFF',
    bgColor: '#CCCCCC'
  };

  // Tamaños para el icono
  const sizeMap = {
    small: 24,
    medium: 48,
    large: 80
  };

  const fontSize = sizeMap[size];

  return (
    <View 
      style={[
        styles.container, 
        showBackground && { 
          backgroundColor: weatherInfo.bgColor,
          padding: size === 'small' ? 8 : size === 'medium' ? 12 : 16,
          borderRadius: size === 'small' ? 20 : size === 'medium' ? 30 : 50,
        }
      ]}
    >
      <Text style={[styles.icon, { fontSize }]}>{weatherInfo.icon}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    textAlign: 'center',
  }
}); 