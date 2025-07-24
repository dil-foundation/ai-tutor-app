import React, { useRef, useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AnimatedCircularProgress } from 'react-native-circular-progress';

interface CircularProgressProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  showPercentage?: boolean;
  customText?: string;
  tintColor?: string;
  backgroundColor?: string;
  textColor?: string;
  textSize?: number;
  animate?: boolean;
  animationDuration?: number;
  debug?: boolean;
}

const CircularProgress: React.FC<CircularProgressProps> = ({
  progress,
  size = 120,
  strokeWidth = 12,
  showPercentage = true,
  customText,
  tintColor = '#58D68D',
  backgroundColor = '#E8F5E8',
  textColor = '#2C3E50',
  textSize = 24,
  animate = true,
  animationDuration = 1000,
  debug = false
}) => {
  const circularProgressRef = useRef<any>(null);
  const [currentProgress, setCurrentProgress] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  // Input validation and edge case handling
  const validatedProgress = Math.max(0, Math.min(100, progress || 0));
  const validatedSize = Math.max(50, Math.min(300, size || 120));
  const validatedStrokeWidth = Math.max(2, Math.min(validatedSize / 4, strokeWidth || 12));
  const validatedAnimationDuration = Math.max(100, Math.min(5000, animationDuration || 1000));

  // Debug logging
  useEffect(() => {
    if (debug) {
      console.log('🔄 [CIRCULAR_PROGRESS] Component props:', {
        progress: validatedProgress,
        size: validatedSize,
        strokeWidth: validatedStrokeWidth,
        animate,
        animationDuration: validatedAnimationDuration
      });
    }
  }, [validatedProgress, validatedSize, validatedStrokeWidth, animate, validatedAnimationDuration, debug]);

  useEffect(() => {
    if (debug) {
      console.log('🔄 [CIRCULAR_PROGRESS] Progress changed:', {
        from: currentProgress,
        to: validatedProgress,
        animate
      });
    }

    if (animate && circularProgressRef.current) {
      setIsAnimating(true);
      try {
        circularProgressRef.current.animate(validatedProgress, validatedAnimationDuration);
        setCurrentProgress(validatedProgress);
        
        if (debug) {
          console.log('✅ [CIRCULAR_PROGRESS] Animation started');
        }
      } catch (error) {
        console.error('❌ [CIRCULAR_PROGRESS] Animation error:', error);
        setCurrentProgress(validatedProgress);
      } finally {
        setTimeout(() => setIsAnimating(false), validatedAnimationDuration);
      }
    } else {
      setCurrentProgress(validatedProgress);
    }
  }, [validatedProgress, animate, validatedAnimationDuration, debug]);

  // Generate display text with fallbacks
  const getDisplayText = (): string => {
    if (customText) return customText;
    if (!showPercentage) return '';
    
    try {
      return `${Math.round(validatedProgress)}%`;
    } catch (error) {
      console.error('❌ [CIRCULAR_PROGRESS] Error formatting text:', error);
      return '0%';
    }
  };

  const displayText = getDisplayText();

  // Handle component unmount
  useEffect(() => {
    return () => {
      if (debug) {
        console.log('🧹 [CIRCULAR_PROGRESS] Component unmounting');
      }
    };
  }, [debug]);

  return (
    <View style={styles.container}>
      <AnimatedCircularProgress
        ref={circularProgressRef}
        size={validatedSize}
        width={validatedStrokeWidth}
        fill={animate ? 0 : validatedProgress}
        tintColor={tintColor}
        backgroundColor={backgroundColor}
        rotation={0}
        lineCap="round"
        arcSweepAngle={360}
        style={styles.circularProgress}
        onAnimationComplete={() => {
          if (debug) {
            console.log('✅ [CIRCULAR_PROGRESS] Animation completed');
          }
        }}
      >
        {() => (
          <View style={styles.textContainer}>
            <Text 
              style={[
                styles.progressText,
                { 
                  color: textColor,
                  fontSize: textSize,
                  fontWeight: 'bold'
                }
              ]}
              numberOfLines={1}
              adjustsFontSizeToFit={true}
            >
              {displayText}
            </Text>
          </View>
        )}
      </AnimatedCircularProgress>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  circularProgress: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressText: {
    textAlign: 'center',
  },
});

export default CircularProgress; 