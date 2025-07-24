import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface Exercise {
  name: string;
  status: 'completed' | 'in_progress' | 'locked';
}

interface StageCardProps {
  index: number;
  stage: {
    stage: string;
    subtitle: string;
    completed: boolean;
    progress: number;
    exercises: Exercise[];
    unlocked: boolean;
  };
  expanded: boolean;
  onPress: () => void;
  children?: React.ReactNode;
}

const stageColors = [
  { bg: ['#E0F8E9', '#D8F3E4'], border: '#58D68D', shadow: 'rgba(88, 214, 141, 0.4)' }, // Green
  { bg: ['#E1F5FE', '#D4ECF9'], border: '#3B82F6', shadow: 'rgba(59, 130, 246, 0.4)' }, // Blue
  { bg: ['#F3E8FF', '#EADFF8'], border: '#8B5CF6', shadow: 'rgba(139, 92, 246, 0.4)' }, // Purple
  { bg: ['#FFFBEB', '#FFF8E1'], border: '#F59E0B', shadow: 'rgba(245, 158, 11, 0.4)' }, // Amber
  { bg: ['#FFF1F2', '#FFE4E6'], border: '#EF4444', shadow: 'rgba(239, 68, 68, 0.4)' }, // Red
  { bg: ['#F0F9FF', '#E0F2FE'], border: '#0EA5E9', shadow: 'rgba(14, 165, 233, 0.4)' }, // Sky
];

const getStatusText = (stage: any) => {
  if (stage.completed) return 'Complete';
  if (stage.unlocked) return 'In Progress';
  return 'Locked';
};

const StageCard: React.FC<StageCardProps> = ({ index, stage, expanded, onPress, children }) => {
  const status = stage.completed ? 'completed' : (stage.unlocked || stage.progress > 0) ? 'in_progress' : 'locked';
  const clampedProgress = Math.round(stage.progress);
  const colors = stageColors[index % stageColors.length];
  const isActive = expanded;

  return (
    <View style={[styles.cardWrapper, isActive && styles.activeCardWrapper, isActive && { shadowColor: colors.shadow }]}>
      <TouchableOpacity
        style={styles.touchable}
        activeOpacity={0.9}
        onPress={onPress}
        disabled={status === 'locked'}
      >
        <LinearGradient colors={status === 'locked' ? ['#F5F5F5', '#E8E8E8'] : colors.bg as any} style={[styles.card, { borderColor: status === 'locked' ? '#DCDCDC' : colors.border }]}>
          <View style={styles.iconCircle}>
            <Text style={styles.stageNumber}>{index + 1}</Text>
          </View>
          <View style={styles.textBlock}>
            <Text style={[styles.title, status === 'locked' && { color: '#A0A0A0' }]}>{stage.stage.replace(/Stage \d+ – /, '')}</Text>
            <Text style={[styles.subtitle, status === 'locked' && { color: '#B0B0B0' }]}>{stage.subtitle}</Text>
          </View>
          <View style={styles.statusBlock}>
            {status === 'locked' ? (
              <Ionicons name="lock-closed" size={24} color="#A0A0A0" />
            ) : status === 'completed' ? (
              <Ionicons name="checkmark-circle" size={24} color={colors.border} />
            ) : (
              <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={24} color={colors.border} />
            )}
          </View>
        </LinearGradient>
      </TouchableOpacity>
      {expanded && (
        <View style={styles.expandedContent}>
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBar, { width: `${clampedProgress}%`, backgroundColor: colors.border }]} />
          </View>
          <Text style={[styles.progressText, { color: colors.border }]}>{clampedProgress}% Complete</Text>
          {children}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  cardWrapper: {
    marginBottom: 20,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 8,
  },
  activeCardWrapper: {
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 16,
  },
  touchable: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 20,
    borderWidth: 2,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
  },
  stageNumber: {
    fontWeight: 'bold',
    fontSize: 22,
    color: '#333',
    fontFamily: 'Lexend-Bold',
  },
  textBlock: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
    fontFamily: 'Lexend-Bold',
  },
  subtitle: {
    fontSize: 14,
    color: '#475569',
    marginTop: 2,
    fontFamily: 'Lexend-Regular',
  },
  statusBlock: {
    marginLeft: 16,
  },
  expandedContent: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginTop: -20, // Overlap with the touchable
    paddingTop: 20, // Add padding back
  },
  progressBarContainer: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E0E7FF',
    overflow: 'hidden',
    marginTop: 8,
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 6,
    textAlign: 'right',
    fontFamily: 'Lexend-Medium',
  },
});

export default StageCard; 