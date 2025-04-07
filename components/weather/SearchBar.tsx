import React, { useState } from 'react';
import { 
  StyleSheet, 
  TextInput, 
  View, 
  TouchableOpacity, 
  ActivityIndicator, 
  Platform 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

import { Colors } from '../../constants/Colors';
import { useColorScheme } from '../../hooks/useColorScheme';

interface SearchBarProps {
  onSearch: (query: string) => void;
  isLoading?: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  isLoading = false,
}) => {
  const [query, setQuery] = useState('');
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const handleSearch = () => {
    if (query.trim().length > 0) {
      onSearch(query);
    }
  };

  const textColor = isDark ? Colors.dark.text : Colors.light.text;
  const placeholderColor = isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.4)';
  const iconColor = isDark ? Colors.dark.text : Colors.light.text;

  return (
    <View style={styles.container}>
      <BlurView
        tint={isDark ? 'dark' : 'light'}
        intensity={80}
        style={styles.blurContainer}
      >
        <View style={styles.searchContainer}>
          <Ionicons 
            name="search" 
            size={20} 
            color={iconColor} 
            style={styles.searchIcon} 
          />
          
          <TextInput
            style={[styles.input, { color: textColor }]}
            placeholder="Buscar ciudad..."
            placeholderTextColor={placeholderColor}
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          
          {query.length > 0 && (
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
          )}
          
          {isLoading && (
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
    marginTop: Platform.OS === 'ios' ? 60 : 20,
    marginBottom: 4,
  },
  blurContainer: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
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