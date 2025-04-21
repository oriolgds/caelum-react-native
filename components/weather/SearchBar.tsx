import React, { useState } from 'react';
import { 
  StyleSheet, 
  TextInput, 
  View, 
  TouchableOpacity, 
  ActivityIndicator,
  Platform,
  Dimensions
} from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withTiming,
  withSequence,
  interpolate,
  Extrapolate,
  withDelay
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useColorScheme } from '../../hooks/useColorScheme';
import { Colors } from '../../constants/Colors';

interface SearchBarProps {
  onSearch: (query: string) => void;
  isLoading?: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  isLoading = false,
}) => {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Animaciones
  const focusAnim = useSharedValue(0);
  const searchAnim = useSharedValue(0);
  const blurIntensity = useSharedValue(20);
  const iconRotate = useSharedValue(0);
  const containerScale = useSharedValue(1);

  const handleSearch = () => {
    if (query.trim().length > 0) {
      // Animación al buscar
      searchAnim.value = withSequence(
        withTiming(1, { duration: 200 }),
        withDelay(300, withTiming(0, { duration: 200 }))
      );
      containerScale.value = withSequence(
        withSpring(0.95, { damping: 15 }),
        withSpring(1, { damping: 12 })
      );
      onSearch(query);
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
    focusAnim.value = withSpring(1, {
      mass: 1,
      damping: 15,
      stiffness: 100
    });
    blurIntensity.value = withSpring(30, {
      mass: 1,
      damping: 15
    });
    iconRotate.value = withSpring(1, {
      mass: 1,
      damping: 12
    });
  };

  const handleBlur = () => {
    setIsFocused(false);
    focusAnim.value = withSpring(0, {
      mass: 1,
      damping: 15,
      stiffness: 100
    });
    blurIntensity.value = withSpring(20, {
      mass: 1,
      damping: 15
    });
    iconRotate.value = withSpring(0, {
      mass: 1,
      damping: 12
    });
  };

  const containerAnimStyle = useAnimatedStyle(() => {
    const width = interpolate(
      focusAnim.value,
      [0, 1],
      ['92%', '100%'],
      Extrapolate.CLAMP
    );

    const scale = interpolate(
      searchAnim.value,
      [0, 0.5, 1],
      [1, 0.98, 1],
      Extrapolate.CLAMP
    );

    const translateY = interpolate(
      focusAnim.value,
      [0, 1],
      [0, -5],
      Extrapolate.CLAMP
    );

    return {
      width,
      transform: [
        { scale: scale * containerScale.value },
        { translateY }
      ]
    };
  });

  const searchBarAnimStyle = useAnimatedStyle(() => {
    const borderRadius = interpolate(
      focusAnim.value,
      [0, 1],
      [25, 20],
      Extrapolate.CLAMP
    );

    const elevation = interpolate(
      focusAnim.value,
      [0, 1],
      [4, 8],
      Extrapolate.CLAMP
    );

    return {
      borderRadius,
      elevation,
    };
  });

  const iconAnimStyle = useAnimatedStyle(() => {
    const rotate = interpolate(
      iconRotate.value,
      [0, 1],
      [0, 90],
      Extrapolate.CLAMP
    );

    const scale = interpolate(
      searchAnim.value,
      [0, 0.5, 1],
      [1, 0.9, 1],
      Extrapolate.CLAMP
    );

    return {
      transform: [
        { rotate: `${rotate}deg` },
        { scale }
      ]
    };
  });

  const blurViewAnimStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(
        focusAnim.value,
        [0, 1],
        [0.8, 0.95],
        Extrapolate.CLAMP
      )
    };
  });

  const textColor = isDark ? Colors.dark.text : Colors.light.text;
  const backgroundColor = isDark 
    ? 'rgba(30,30,35,0.8)' 
    : 'rgba(255,255,255,0.8)';

  return (
    <View style={styles.wrapper}>
      <Animated.View style={[styles.container, containerAnimStyle]}>
        <Animated.View style={[styles.searchBarContainer, searchBarAnimStyle]}>
          <Animated.View style={[styles.blurContainer, blurViewAnimStyle]}>
            <BlurView
              tint={isDark ? 'dark' : 'light'}
              intensity={25}
              style={styles.blurView}
            >
              <Animated.View style={[styles.iconContainer, iconAnimStyle]}>
                <TouchableOpacity onPress={handleSearch}>
                  <Ionicons 
                    name={isFocused ? 'search' : 'search-outline'} 
                    size={22} 
                    color={textColor} 
                  />
                </TouchableOpacity>
              </Animated.View>

              <TextInput
                style={[styles.input, { color: textColor }]}
                placeholder="Buscar ciudad..."
                placeholderTextColor={isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)'}
                value={query}
                onChangeText={setQuery}
                onSubmitEditing={handleSearch}
                onFocus={handleFocus}
                onBlur={handleBlur}
                returnKeyType="search"
              />

              {isLoading ? (
                <ActivityIndicator 
                  size="small" 
                  color={textColor}
                  style={styles.loader}
                />
              ) : query.length > 0 && (
                <TouchableOpacity
                  style={styles.clearButton}
                  onPress={() => setQuery('')}
                >
                  <Ionicons 
                    name="close-circle" 
                    size={18} 
                    color={textColor}
                  />
                </TouchableOpacity>
              )}
            </BlurView>
          </Animated.View>
        </Animated.View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 8,
  },
  container: {
    width: '92%',
    alignSelf: 'center',
  },
  searchBarContainer: {
    height: 50,
    borderRadius: 25,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  blurContainer: {
    flex: 1,
    overflow: 'hidden',
  },
  blurView: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  iconContainer: {
    marginRight: 12,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  loader: {
    marginLeft: 8,
  },
  clearButton: {
    padding: 4,
    marginLeft: 8,
  }
});