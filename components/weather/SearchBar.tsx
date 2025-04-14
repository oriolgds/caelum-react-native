import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  TextInput, 
  View, 
  TouchableOpacity, 
  ActivityIndicator, 
  Platform,
  Animated,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

import { Colors } from '../../constants/Colors';
import { useColorScheme } from '../../hooks/useColorScheme';

interface SearchBarProps {
  onSearch: (query: string) => void;
  isLoading?: boolean;
  style?: any;
  blurIntensity?: number | Animated.AnimatedInterpolation<number | string>;
  iconSize?: number | Animated.AnimatedInterpolation<number | string>;
  inputFontSize?: number | Animated.AnimatedInterpolation<number | string>;
  inputOpacity?: number | Animated.AnimatedInterpolation<number | string>;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  isLoading = false,
  style,
  blurIntensity = 80,
  iconSize = 20,
  inputFontSize = 16,
  inputOpacity = 1,
}) => {
  const [query, setQuery] = useState('');
  const [containerWidth, setContainerWidth] = useState(Dimensions.get('window').width);
  const [isFocused, setIsFocused] = useState(false);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const handleSearch = () => {
    if (query.trim().length > 0) {
      onSearch(query);
    }
  };

  const handleLayout = (event) => {
    const { width } = event.nativeEvent.layout;
    setContainerWidth(width);
  };

  const handleIconPress = () => {
    if (!shouldShowInput) {
      // Si estamos en modo botón, expandimos al hacer clic
      // Esta funcionalidad tendría que coordinarse con el componente padre
      // Por ahora simularemos un comportamiento
      alert('Búsqueda activada');
    }
  };

  const textColor = isDark ? Colors.dark.text : Colors.light.text;
  const placeholderColor = isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.4)';
  const iconColor = isDark ? Colors.dark.text : Colors.light.text;

  // Determinar si mostrar el input basado en el ancho
  const shouldShowInput = containerWidth > 60;

  return (
    <View style={[styles.container, style]} onLayout={handleLayout}>
      <BlurView
        tint={isDark ? 'dark' : 'light'}
        intensity={blurIntensity as number}
        style={[styles.blurContainer]}
      >
        <View style={styles.searchContainer}>
          <TouchableOpacity 
            onPress={handleIconPress}
            style={{ 
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              ...(shouldShowInput ? {} : { width: '100%' })
            }}
          >
            <Animated.View style={{ 
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Ionicons 
                name="search" 
                size={iconSize as number} 
                color={iconColor} 
                style={shouldShowInput ? styles.searchIcon : styles.centerIcon} 
              />
            </Animated.View>
          </TouchableOpacity>
          
          {shouldShowInput && (
            <Animated.View style={{ 
              flex: 1, 
              opacity: inputOpacity as number 
            }}>
              <TextInput
                style={[
                  styles.input, 
                  { 
                    color: textColor,
                    fontSize: inputFontSize as number
                  }
                ]}
                placeholder="Buscar ciudad..."
                placeholderTextColor={placeholderColor}
                value={query}
                onChangeText={setQuery}
                onSubmitEditing={handleSearch}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                returnKeyType="search"
              />
            </Animated.View>
          )}
          
          {query.length > 0 && shouldShowInput && (
            <Animated.View style={{ opacity: inputOpacity as number }}>
              <TouchableOpacity 
                style={styles.clearButton} 
                onPress={() => setQuery('')}
              >
                <Ionicons 
                  name="close-circle" 
                  size={18} 
                  color={iconColor} 
                />
              </TouchableOpacity>
            </Animated.View>
          )}
          
          {isLoading && shouldShowInput && (
            <ActivityIndicator 
              size="small" 
              color={iconColor} 
              style={styles.loader} 
            />
          )}
        </View>
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 16,
  },
  blurContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    height: '100%',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    height: '100%',
  },
  searchIcon: {
    marginRight: 8,
  },
  centerIcon: {
    marginRight: 0,
  },
  input: {
    flex: 1,
    fontWeight: '500',
  },
  clearButton: {
    marginLeft: 8,
    padding: 4,
  },
  loader: {
    marginLeft: 8,
  },
}); 