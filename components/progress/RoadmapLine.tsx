import React from 'react';
import { View, StyleSheet } from 'react-native';

interface RoadmapLineProps {
  isFirst: boolean;
  isLast: boolean;
  status: 'completed' | 'in_progress' | 'locked';
}

const getLineColor = (status: string) => {
  switch (status) {
    case 'completed': return '#22C55E';
    case 'in_progress': return '#3B82F6';
    default: return '#E0E0E0';
  }
};

const RoadmapLine: React.FC<RoadmapLineProps> = ({ isFirst, isLast, status }) => (
  <View style={StyleSheet.absoluteFill} pointerEvents="none">
    {/* Top segment */}
    {!isFirst && (
      <View style={[styles.line, { top: 0, height: '50%', backgroundColor: getLineColor(status) }]} />
    )}
    {/* Bottom segment */}
    {!isLast && (
      <View style={[styles.line, { bottom: 0, height: '50%', backgroundColor: getLineColor(status) }]} />
    )}
  </View>
);

const styles = StyleSheet.create({
  line: {
    position: 'absolute',
    left: 34, // Adjust to match icon center (icon margin + half icon size)
    width: 4,
    borderRadius: 2,
    zIndex: 0,
  },
});

export default RoadmapLine; 
