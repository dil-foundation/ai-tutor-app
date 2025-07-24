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
  return ['#E0E0E0', '#E0E0E0'];
};

const RoadmapLine: React.FC<RoadmapLineProps & { index: number }> = ({ isFirst, isLast, status, isActive, index }) => {
  const colors = getLineColor(status, isActive, index);
  return(
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {/* Top segment */}
      {!isFirst && (
        <LinearGradient colors={colors as any} style={[styles.line, { top: 0, height: '55%' }]} />
      )}
      {/* Bottom segment */}
      {!isLast && (
        <LinearGradient colors={colors as any} style={[styles.line, { bottom: 0, height: '55%' }]} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  line: {
    position: 'absolute',
    left: 36, // Centered with the 48px icon + 16px margin = 24px center. 24 - 2 = 22
    width: 4,
    borderRadius: 2,
    zIndex: -1,
  },
});

export default RoadmapLine; 