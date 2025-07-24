import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Re-introducing the color palette for a clean, professional look
const COLORS = {
  primary: '#58D68D',
  textPrimary: '#1E293B',
  textSecondary: '#64748B',
  background: '#FFFFFF',
  border: '#E2E8F0',
  locked: '#9CA3AF',
  lockedBg: '#F1F5F9',
};

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

const StageCard: React.FC<StageCardProps> = ({ index, stage, expanded, onPress, children }) => {
  const status = stage.completed ? 'completed' : stage.unlocked ? 'in_progress' : 'locked';
  const clampedProgress = Math.round(stage.progress);
  const isActive = status === 'in_progress';

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.card,
          status === 'locked' && styles.lockedCard,
          isActive && styles.activeCard,
        ]}
        activeOpacity={0.8}
        onPress={onPress}
        disabled={status === 'locked'}
      >
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.iconCircle}>
            <Text style={[styles.stageNumber, status === 'locked' && styles.lockedText]}>{index + 1}</Text>
          </View>
          <View style={styles.textBlock}>
            <Text style={[styles.title, status === 'locked' && styles.lockedText]}>
              {stage.stage}
            </Text>
            <Text style={[styles.subtitle, status === 'locked' && styles.lockedText]}>
              {stage.subtitle}
            </Text>
          </View>
          <View style={styles.statusBlock}>
            {status === 'locked' ? (
              <Ionicons name="lock-closed" size={24} color={COLORS.locked} />
            ) : (
              <Ionicons name={expanded ? 'chevron-up-circle' : 'chevron-down-circle'} size={26} color={isActive ? COLORS.primary : COLORS.textSecondary} />
            )}
          </View>
        </View>
        
        {/* Expanded Content - Now inside the card */}
        {expanded && (
          <View style={styles.expandedContent}>
            <View style={styles.progressBarContainer}>
              <View style={[styles.progressBar, { width: `${clampedProgress}%` }]} />
            </View>
            <Text style={styles.progressText}>{clampedProgress}% Complete</Text>
            {children}
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    shadowColor: '#4A5568',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 5,
  },
  card: {
    backgroundColor: COLORS.background,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden', // Ensures children stay within the rounded corners
  },
  lockedCard: {
    backgroundColor: COLORS.lockedBg,
  },
  activeCard: {
    borderColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 6 },
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    backgroundColor: '#F1F5F9',
  },
  stageNumber: {
    fontWeight: 'bold',
    fontSize: 20,
    color: COLORS.textSecondary,
    fontFamily: 'Lexend-Bold',
  },
  lockedText: {
    color: COLORS.locked,
  },
  textBlock: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    fontFamily: 'Lexend-Bold',
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 2,
    fontFamily: 'Lexend-Regular',
  },
  statusBlock: {
    marginLeft: 16,
  },
  expandedContent: {
    marginTop: 16,
  },
  progressBarContainer: {
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.border,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: COLORS.primary,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
    fontFamily: 'Lexend-Medium',
    textAlign: 'right',
    marginTop: 6,
    marginBottom: 8,
  },
});

export default StageCard; 