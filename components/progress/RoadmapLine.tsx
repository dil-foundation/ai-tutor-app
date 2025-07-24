import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface RoadmapLineProps {
  isFirst: boolean;
  isLast: boolean;
  status: 'completed' | 'in_progress' | 'locked';
  isActive: boolean;
}

const stageColors = [
  '#58D68D', // Green
  '#3B82F6', // Blue
  '#8B5CF6', // Purple
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#0EA5E9', // Sky
];

const getLineColor = (status: string, isActive: boolean, index: number) => {
  if (isActive) return [stageColors[index], stageColors[index]];
  if (status === 'completed') return [stageColors[index], stageColors[index]];
  return ['#E5E7EB', '#D1D5DB'];
};

const RoadmapLine: React.FC<RoadmapLineProps & { index: number }> = ({ isFirst, isLast, status, isActive, index }) => {
  const colors = getLineColor(status, isActive, index);
  return(
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {/* Top segment - hidden behind the card above */}
      {!isFirst && (
        <LinearGradient 
          colors={colors as any} 
          style={[styles.line, { top: -20, height: '60%' }]} 
        />
      )}
      {/* Bottom segment - hidden behind the card below */}
      {!isLast && (
        <LinearGradient 
          colors={colors as any} 
          style={[styles.line, { bottom: -20, height: '60%' }]} 
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  line: {
    position: 'absolute',
    left: 44, // Centered with the 56px icon + 20px margin = 28px center. 28 - 2 = 26
    width: 4,
    borderRadius: 2,
    zIndex: -1, // Ensure it's behind the cards
  },
});

export default RoadmapLine; 