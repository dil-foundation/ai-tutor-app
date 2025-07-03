import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
    Easing,
    interpolate,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming,
} from 'react-native-reanimated';

interface VoiceVisualizerProps {
  isListening: boolean;
  intensity?: number; // 0-1, represents voice intensity
  barCount?: number;
  color?: string;
}

export default function VoiceVisualizer({
  isListening,
  intensity = 0.5,
  barCount = 5,
  color = '#93E893',
}: VoiceVisualizerProps) {
  const bars = Array.from({ length: barCount }, (_, i) => i);
  
  const createBarAnimation = (index: number) => {
    const animatedValue = useSharedValue(0);
    
    useEffect(() => {
      if (isListening) {
        // Create staggered animation for each bar
        const delay = index * 100;
        const duration = 800 + Math.random() * 400; // Random duration for natural feel
        
        animatedValue.value = withRepeat(
          withSequence(
            withTiming(intensity, {
              duration,
              easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
            }),
            withTiming(0.1, {
              duration: duration * 0.3,
              easing: Easing.bezier(0.55, 0.055, 0.675, 0.19),
            })
          ),
          -1, // Infinite repeat
          false // Don't reverse
        );
      } else {
        animatedValue.value = withTiming(0, { duration: 300 });
      }
    }, [isListening, intensity]);

    const animatedStyle = useAnimatedStyle(() => {
      const height = interpolate(
        animatedValue.value,
        [0, 1],
        [4, 40 + Math.random() * 20] // Random max height for variety
      );
      
      const opacity = interpolate(
        animatedValue.value,
        [0, 1],
        [0.3, 1]
      );

      return {
        height,
        opacity,
        backgroundColor: color,
      };
    });

    return animatedStyle;
  };

  if (!isListening) {
    return null;
  }

  return (
    <View style={styles.container}>
      {bars.map((_, index) => (
        <Animated.View
          key={index}
          style={[
            styles.bar,
            createBarAnimation(index),
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 60,
    gap: 4,
  },
  bar: {
    width: 4,
    borderRadius: 2,
    backgroundColor: '#93E893',
  },
}); 